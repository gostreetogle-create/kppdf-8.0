import { DestroyRef, Injectable, Injector, OutputEmitterRef, Signal, computed, effect, inject, signal } from '@angular/core';
import {
  buildGanttTreeBars,
  buildWorkerTreeBars,
  ganttModuleSummaryId,
  ganttProductSummaryId,
  ganttWorkerModuleSummaryId,
  GANTT_UNASSIGNED_BAR_FILL,
  GANTT_UNASSIGNED_WASH,
  isModuleSummaryBar,
  isOrderSummaryBar,
  isProductSummaryBar,
  isSummaryBar,
  isUnassignedWorkerSummaryBar,
  isWorkerSummaryBar,
  summarizeUnassignedGanttWork,
  workerGroupKeyOf,
  workTypeOklch,
  workTypeWash,
  ORDER_STATUS_LABELS,
  type GanttBar,
} from './util/gantt-bar.model';
import type { OrderPriority, OrderStatus, Person } from '@kppdf/data-access';
import type { GanttZoom } from './production-cockpit.context';
import {
  calculateGanttPxPerDay,
  GANTT_LABEL_COL_PX,
  GANTT_SUMMARY_BAR_FILL,
  ganttDaysLeftInMonth,
  ganttMonthTickLabel,
  ganttNestDepth,
  ganttRowKind,
  ganttWeekdayShortRu,
  isBarEstimateReadOnly,
  ORDER_META_PRIORITIES,
  snapEstimateDaysFromDelta,
  snapMoveDeltaDays,
  type GanttEstimateDaysCommit,
  type GanttOrderMetaCommit,
  type GanttOrderMetaView,
  type GanttPlannedDateMoveCommit,
  type GanttRowKind,
  type GanttStartOffsetCommit,
  type GanttWorkerAssignmentCommit,
} from './util/gantt-bars.constants';

/** Bound accessors — the host `GanttBarsComponent`'s `input()`/`output()` refs, wired once via `bind()`. */
export interface GanttBarsFacadeHost {
  bars: Signal<GanttBar[]>;
  rangeStart: Signal<string>;
  rangeEnd: Signal<string>;
  zoom: Signal<GanttZoom>;
  readOnly: Signal<boolean>;
  canEdit: Signal<boolean>;
  today: Signal<string>;
  expandedOrderIds: Signal<ReadonlySet<string>>;
  expandedProductIds: Signal<ReadonlySet<string>>;
  expandedModuleIds: Signal<ReadonlySet<string>>;
  expandedWorkerIds: Signal<ReadonlySet<string>>;
  expandedWorkerModuleIds: Signal<ReadonlySet<string>>;
  expandedWorkBarId: Signal<string | null>;
  workerCandidates: Signal<ReadonlyMap<string, readonly Person[]>>;
  workerAssignmentSaving: Signal<boolean>;
  highlightOrderId: Signal<string | null>;
  orderMeta: Signal<GanttOrderMetaView | null>;
  canEditOrder: Signal<boolean>;
  groupByWorkers: Signal<boolean>;
  orderLabelClick: OutputEmitterRef<string>;
  dismissCanvas: OutputEmitterRef<void>;
  toggleExpand: OutputEmitterRef<string>;
  toggleWorkDetail: OutputEmitterRef<string>;
  estimateDaysCommit: OutputEmitterRef<GanttEstimateDaysCommit>;
  workerAssignmentCommit: OutputEmitterRef<GanttWorkerAssignmentCommit>;
  plannedDateMoveCommit: OutputEmitterRef<GanttPlannedDateMoveCommit>;
  startOffsetCommit: OutputEmitterRef<GanttStartOffsetCommit>;
  orderMetaCommit: OutputEmitterRef<GanttOrderMetaCommit>;
}

/**
 * TZ-NX-GANTT-BARS-FACADE — mechanical extract of `GanttBarsComponent`'s brain:
 * row/tree computed model, drag/resize interaction sessions, work-detail /
 * label-peek / order-meta-draft state. Instance-scoped (`providers` on the
 * component, not `providedIn: 'root'`) — one facade per `<app-gantt-bars>`.
 *
 * View/DOM glue (viewChild scroll refs, ElementRef-based label-truncation
 * measurement, `@HostListener`s themselves) stays on the component — Angular
 * ties those to the component class. This facade owns everything else:
 * bound via `bind()` once in the component constructor with the component's
 * own `input()`/`output()` refs (kept under identical field names so the
 * moved method bodies below are unchanged from the original component).
 */
@Injectable()
export class GanttBarsFacade {
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  // ─── bound host refs (assigned once via bind()) ───
  private bars!: Signal<GanttBar[]>;
  private rangeStart!: Signal<string>;
  private rangeEnd!: Signal<string>;
  private zoom!: Signal<GanttZoom>;
  private readOnly!: Signal<boolean>;
  private canEdit!: Signal<boolean>;
  private today!: Signal<string>;
  private expandedOrderIds!: Signal<ReadonlySet<string>>;
  private expandedProductIds!: Signal<ReadonlySet<string>>;
  private expandedModuleIds!: Signal<ReadonlySet<string>>;
  private expandedWorkerIds!: Signal<ReadonlySet<string>>;
  private expandedWorkerModuleIds!: Signal<ReadonlySet<string>>;
  private expandedWorkBarId!: Signal<string | null>;
  private workerCandidates!: Signal<ReadonlyMap<string, readonly Person[]>>;
  private workerAssignmentSaving!: Signal<boolean>;
  private highlightOrderId!: Signal<string | null>;
  private orderMeta!: Signal<GanttOrderMetaView | null>;
  private canEditOrder!: Signal<boolean>;
  private groupByWorkers!: Signal<boolean>;
  private orderLabelClick!: OutputEmitterRef<string>;
  private dismissCanvas!: OutputEmitterRef<void>;
  private toggleExpand!: OutputEmitterRef<string>;
  private toggleWorkDetail!: OutputEmitterRef<string>;
  private estimateDaysCommit!: OutputEmitterRef<GanttEstimateDaysCommit>;
  private workerAssignmentCommit!: OutputEmitterRef<GanttWorkerAssignmentCommit>;
  private plannedDateMoveCommit!: OutputEmitterRef<GanttPlannedDateMoveCommit>;
  private startOffsetCommit!: OutputEmitterRef<GanttStartOffsetCommit>;
  private orderMetaCommit!: OutputEmitterRef<GanttOrderMetaCommit>;

  bind(host: GanttBarsFacadeHost): void {
    Object.assign(this, host);
    effect(
      () => {
        const m = this.orderMeta();
        if (!m) return;
        this.priorityDraft.set(m.priority);
        this.plannedDraft.set(m.plannedDate);
      },
      { injector: this.injector },
    );
  }

  readonly metaPriorities = ORDER_META_PRIORITIES;
  readonly priorityDraft = signal<OrderPriority>('normal');
  readonly plannedDraft = signal('');

  /** QA-445E — flash red today line so «Сегодня» is never a silent no-op. */
  readonly todayPulse = signal(false);
  private todayPulseTimer: ReturnType<typeof setTimeout> | null = null;

  /** Live right-edge resize preview (null = idle). */
  private readonly resizeSession = signal<{
    barId: string;
    bar: GanttBar;
    baseDays: number;
    startClientX: number;
    previewDays: number;
    pointerId: number;
  } | null>(null);

  /** Live body-drag preview (null = idle). */
  private readonly moveSession = signal<{
    mode: 'plannedDate' | 'startOffset';
    orderId: string;
    barId: string;
    bar: GanttBar;
    startClientX: number;
    previewDeltaDays: number;
    pointerId: number;
  } | null>(null);

  readonly totalDays = computed(() => Math.max(1, dayDiff(this.rangeStart(), this.rangeEnd())));

  readonly timelineViewportWidth = signal(0);
  /** Open floating label peek (`bar.id`) — hover or cascade expand when truncated. */
  private readonly labelOverlayKey = signal<string | null>(null);
  private labelOverlayLeaveTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly workerDrafts = signal<Map<string, string[]>>(new Map());

  readonly pxPerDay = computed(() =>
    calculateGanttPxPerDay(this.zoom(), this.totalDays(), this.timelineViewportWidth()),
  );

  readonly timelineMinWidth = computed(() => this.totalDays() * this.pxPerDay() + GANTT_LABEL_COL_PX);

  readonly dayGrid = computed(() => {
    const total = this.totalDays();
    const px = this.pxPerDay();
    const out: Array<{ key: string; leftPx: number }> = [];
    for (let i = 0; i < total; i++) {
      out.push({ key: `g${i}`, leftPx: i * px });
    }
    return out;
  });

  readonly treeBars = computed(() =>
    this.groupByWorkers()
      ? buildWorkerTreeBars(this.bars(), this.expandedWorkerIds(), this.expandedWorkerModuleIds())
      : buildGanttTreeBars(
          this.bars(),
          this.expandedOrderIds(),
          this.expandedProductIds(),
          this.expandedModuleIds(),
        ),
  );

  readonly unassignedSummary = computed(() => summarizeUnassignedGanttWork(this.bars()));

  readonly legendItems = computed(() => {
    const seen = new Map<string, { id: string; name: string; color: string }>();
    for (const b of this.bars()) {
      if (isSummaryBar(b) || b.workTypeId === '__summary__') continue;
      if (seen.has(b.workTypeId)) continue;
      seen.set(b.workTypeId, {
        id: b.workTypeId,
        name: b.workTypeName,
        color: workTypeOklch(b.workTypeId, 0.12, 0.72, b.accentHue),
      });
    }
    return [...seen.values()];
  });

  readonly scaleTicks = computed(() => {
    const start = this.rangeStart();
    const total = this.totalDays();
    const px = this.pxPerDay();
    const monthMode = this.zoom() === 'month';
    const ticks: Array<{
      key: string;
      label: string;
      dateLabel: string;
      weekdayLabel: string;
      leftPx: number;
      widthPx: number;
    }> = [];
    for (let i = 0; i < total; i++) {
      const date = addDays(start, i);
      const isMonthStart = date.slice(8, 10) === '01';
      if (monthMode && !isMonthStart && i !== 0) continue;
      const span = monthMode ? ganttDaysLeftInMonth(date, total - i) : 1;
      ticks.push({
        key: date,
        label: monthMode ? ganttMonthTickLabel(date) : shortDay(date),
        dateLabel: monthMode ? ganttMonthTickLabel(date) : shortDay(date),
        weekdayLabel: monthMode ? '' : ganttWeekdayShortRu(date),
        leftPx: i * px,
        widthPx: span * px,
      });
    }
    return ticks;
  });

  readonly rows = computed(() => {
    const start = this.rangeStart();
    const total = this.totalDays();
    const px = this.pxPerDay();
    const expandedOrders = this.expandedOrderIds();
    const expandedProducts = this.expandedProductIds();
    const expandedModules = this.expandedModuleIds();
    const expandedWorkers = this.expandedWorkerIds();
    const expandedWorkerModules = this.expandedWorkerModuleIds();
    const sorted = this.treeBars();
    const byWorkers = this.groupByWorkers();
    /** Last tree index per expanded order/worker — for group-end frame. */
    const lastIdxByGroup = new Map<string, number>();
    /** Last tree index per expanded product / module branch (nested frames). */
    const lastIdxByProduct = new Map<string, number>();
    const lastIdxByModule = new Map<string, number>();
    for (let i = 0; i < sorted.length; i++) {
      const bar = sorted[i]!;
      const key = byWorkers ? workerGroupKeyOf(bar) : bar.orderId;
      const expanded = byWorkers ? expandedWorkers.has(key) : expandedOrders.has(key);
      if (expanded) lastIdxByGroup.set(key, i);

      if (byWorkers) {
        if (isModuleSummaryBar(bar) && expandedWorkerModules.has(bar.id)) {
          lastIdxByModule.set(bar.id, i);
        } else if (!isSummaryBar(bar)) {
          const modId = ganttWorkerModuleSummaryId(
            workerGroupKeyOf(bar),
            bar.orderId,
            bar.orderItemIndex,
            bar.moduleId,
          );
          if (expandedWorkerModules.has(modId)) lastIdxByModule.set(modId, i);
        }
      } else {
        if (!isOrderSummaryBar(bar) && !isWorkerSummaryBar(bar)) {
          const productId = ganttProductSummaryId(bar.orderId, bar.orderItemIndex);
          if (expandedProducts.has(productId)) lastIdxByProduct.set(productId, i);
          if (!isProductSummaryBar(bar)) {
            const moduleId = ganttModuleSummaryId(bar.orderId, bar.orderItemIndex, bar.moduleId);
            if (expandedModules.has(moduleId)) lastIdxByModule.set(moduleId, i);
          }
        }
      }
    }
    return sorted.map((bar, idx) => {
      const left = dayDiff(start, bar.startDate);
      const span = bar.noTerm
        ? Math.max(1, Math.round(total * 0.04))
        : Math.max(1, dayDiff(bar.startDate, bar.endDate) + 1);
      const prev = idx > 0 ? sorted[idx - 1] : null;
      const isSummary = isSummaryBar(bar);
      const orderSummary = isOrderSummaryBar(bar);
      const productSummary = isProductSummaryBar(bar);
      const moduleSummary = isModuleSummaryBar(bar);
      const workerSummary = isWorkerSummaryBar(bar);
      const groupKey = byWorkers ? workerGroupKeyOf(bar) : bar.orderId;
      const treeExpanded = byWorkers
        ? expandedWorkers.has(groupKey)
        : expandedOrders.has(bar.orderId);
      const branchExpanded = byWorkers
        ? workerSummary
          ? expandedWorkers.has(groupKey)
          : moduleSummary
            ? expandedWorkerModules.has(bar.id)
            : false
        : orderSummary
          ? expandedOrders.has(bar.orderId)
          : productSummary
            ? expandedProducts.has(bar.id)
            : moduleSummary
              ? expandedModules.has(bar.id)
              : false;

      let productId = '';
      let moduleId = '';
      let inProductGroup = false;
      let inModuleGroup = false;
      if (byWorkers) {
        if (moduleSummary && expandedWorkerModules.has(bar.id)) {
          moduleId = bar.id;
          inModuleGroup = true;
        } else if (!isSummary) {
          moduleId = ganttWorkerModuleSummaryId(
            workerGroupKeyOf(bar),
            bar.orderId,
            bar.orderItemIndex,
            bar.moduleId,
          );
          inModuleGroup = expandedWorkerModules.has(moduleId);
        }
      } else if (!orderSummary && !workerSummary) {
        productId = ganttProductSummaryId(bar.orderId, bar.orderItemIndex);
        inProductGroup = expandedProducts.has(productId);
        if (!productSummary) {
          moduleId = ganttModuleSummaryId(bar.orderId, bar.orderItemIndex, bar.moduleId);
          inModuleGroup = expandedModules.has(moduleId);
        }
      }

      const productGroupStart = inProductGroup && productSummary;
      const productGroupEnd =
        inProductGroup && !!productId && lastIdxByProduct.get(productId) === idx;
      const productGroupMid = inProductGroup && !productGroupStart && !productGroupEnd;
      const moduleGroupStart = inModuleGroup && moduleSummary;
      const moduleGroupEnd = inModuleGroup && !!moduleId && lastIdxByModule.get(moduleId) === idx;
      const moduleGroupMid = inModuleGroup && !moduleGroupStart && !moduleGroupEnd;
      const rowKind = ganttRowKind({
        isOrderSummary: orderSummary,
        isWorkerSummary: workerSummary,
        isProductSummary: productSummary,
        isModuleSummary: moduleSummary,
      });
      const nestDepth = ganttNestDepth(rowKind);

      return {
        bar,
        alt: idx % 2 === 1,
        orderBoundary: !!prev && this.rowGroupKey(prev) !== this.rowGroupKey(bar),
        leftPx: left * px,
        widthPx: Math.max(px * 0.5, span * px),
        baseSpanDays: span,
        isSummary,
        isOrderSummary: orderSummary,
        isProductSummary: productSummary,
        isModuleSummary: moduleSummary,
        isWorkerSummary: workerSummary,
        rowKind,
        nestDepth,
        expanded: branchExpanded,
        orderGroupStart: treeExpanded && (byWorkers ? workerSummary : orderSummary),
        orderGroupEnd: treeExpanded && lastIdxByGroup.get(groupKey) === idx,
        productGroupStart,
        productGroupEnd,
        productGroupMid,
        moduleGroupStart,
        moduleGroupEnd,
        moduleGroupMid,
      };
    });
  });

  readonly todayLeftPx = computed(() => {
    const t = dayDiff(this.rangeStart(), this.today());
    return Math.max(0, Math.min(this.totalDays(), t)) * this.pxPerDay();
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.clearLabelOverlayLeaveTimer();
      this.clearTodayPulseTimer();
    });
  }

  /** Scroll the marker into the visible timeline viewport (Сегодня) + pulse ack. Called by the component after its own DOM scroll. */
  pulseTodayMarker(): void {
    this.clearTodayPulseTimer();
    // Force class off→on so CSS animation retriggers on repeated clicks.
    if (this.todayPulse()) {
      this.todayPulse.set(false);
      queueMicrotask(() => {
        this.todayPulse.set(true);
        this.scheduleTodayPulseClear();
      });
      return;
    }
    this.todayPulse.set(true);
    this.scheduleTodayPulseClear();
  }

  private scheduleTodayPulseClear(): void {
    this.todayPulseTimer = setTimeout(() => {
      this.todayPulse.set(false);
      this.todayPulseTimer = null;
    }, 700);
  }

  private clearTodayPulseTimer(): void {
    if (this.todayPulseTimer != null) {
      clearTimeout(this.todayPulseTimer);
      this.todayPulseTimer = null;
    }
  }

  /** Child work bars only — summary has no right-resize (duration derived). */
  canResizeBar(bar: GanttBar): boolean {
    if (this.groupByWorkers()) return false;
    if (isSummaryBar(bar)) return false;
    if (!this.canEdit() || this.readOnly()) return false;
    if (bar.noTerm || bar.days == null || bar.days < 1) return false;
    if (isBarEstimateReadOnly(bar.orderStatus)) return false;
    return true;
  }

  /**
   * Order summary → plannedDate; work bar → start offset (316).
   * Product/module summaries are derived spans — not movable.
   */
  canMoveBar(bar: GanttBar): boolean {
    if (this.groupByWorkers()) return false;
    if (isProductSummaryBar(bar) || isModuleSummaryBar(bar)) return false;
    const mayMove = isOrderSummaryBar(bar) ? this.canEditOrder() : this.canEdit();
    if (!mayMove || this.readOnly()) return false;
    if (isBarEstimateReadOnly(bar.orderStatus)) return false;
    return true;
  }

  isResizingBar(barId: string): boolean {
    return this.resizeSession()?.barId === barId;
  }

  isMovingOrder(orderId: string): boolean {
    const s = this.moveSession();
    return !!s && s.mode === 'plannedDate' && s.orderId === orderId;
  }

  isMovingBar(barId: string): boolean {
    const s = this.moveSession();
    return !!s && s.mode === 'startOffset' && s.barId === barId;
  }

  displayDays(row: { bar: GanttBar; baseSpanDays: number }): number {
    const session = this.resizeSession();
    if (session && session.barId === row.bar.id) return session.previewDays;
    return row.bar.days ?? row.baseSpanDays;
  }

  displayWidthPx(row: { bar: GanttBar; widthPx: number; baseSpanDays: number }): number {
    const session = this.resizeSession();
    if (session && session.barId === row.bar.id) {
      return Math.max(this.pxPerDay() * 0.5, session.previewDays * this.pxPerDay());
    }
    return row.widthPx;
  }

  displayLeftPx(row: { bar: GanttBar; leftPx: number }): number {
    const session = this.moveSession();
    if (!session) return row.leftPx;
    if (session.mode === 'plannedDate' && session.orderId === row.bar.orderId) {
      return row.leftPx + session.previewDeltaDays * this.pxPerDay();
    }
    if (session.mode === 'startOffset' && session.barId === row.bar.id) {
      return row.leftPx + session.previewDeltaDays * this.pxPerDay();
    }
    return row.leftPx;
  }

  barFill(row: { bar: GanttBar; isSummary: boolean; rowKind: GanttRowKind }): string {
    if (row.bar.noTerm) return 'transparent';
    if (row.isSummary) {
      switch (row.rowKind) {
        case 'product':
          return GANTT_SUMMARY_BAR_FILL.product;
        case 'module':
          return GANTT_SUMMARY_BAR_FILL.module;
        case 'worker':
          if (isUnassignedWorkerSummaryBar(row.bar)) {
            return GANTT_UNASSIGNED_BAR_FILL;
          }
          if (row.bar.accentHue != null) {
            return this.fill('worker-tint', row.bar.accentHue);
          }
          return GANTT_SUMMARY_BAR_FILL.order;
        case 'order':
        default:
          return GANTT_SUMMARY_BAR_FILL.order;
      }
    }
    return this.fill(row.bar.workTypeId, row.bar.accentHue);
  }

  /** TZ-PRODUCTION-351 — soft WT wash on worker FIO label when dominant hue known. */
  workerLabelWash(row: { isWorkerSummary: boolean; bar: GanttBar }): string | null {
    if (!row.isWorkerSummary) return null;
    if (isUnassignedWorkerSummaryBar(row.bar)) return GANTT_UNASSIGNED_WASH;
    if (row.bar.accentHue == null) return null;
    return workTypeWash('worker-tint', row.bar.accentHue);
  }

  isUnassignedWorkerSummary(bar: GanttBar): boolean {
    return isUnassignedWorkerSummaryBar(bar);
  }

  unassignedWorkTypeNamesPreview(): string {
    const names = this.unassignedSummary().workTypeNames;
    if (names.length <= 4) return names.join(', ');
    return `${names.slice(0, 4).join(', ')}…`;
  }

  /** Returns `expanding` so the component can decide whether to schedule its own DOM label-peek. */
  onToggleExpand(event: Event, expandId: string, bar: GanttBar): { expanding: boolean } {
    event.stopPropagation();
    event.preventDefault();
    const expanding = !this.isExpandIdOpen(expandId, bar);
    this.closeLabelOverlay();
    this.toggleExpand.emit(expandId);
    return { expanding };
  }

  /** Expand emit key: orderId | product:… | module:… | worker:… | worker-module:… */
  expandKey(bar: GanttBar): string {
    if (isWorkerSummaryBar(bar)) return `worker:${bar.orderNumber}`;
    if (isProductSummaryBar(bar) || isModuleSummaryBar(bar)) return bar.id;
    return bar.orderId;
  }

  treeLabel(bar: GanttBar): string {
    if (isWorkerSummaryBar(bar)) return bar.orderNumber;
    if (isProductSummaryBar(bar)) return bar.productName;
    if (isModuleSummaryBar(bar)) return bar.moduleName;
    return bar.orderNumber;
  }

  onChildWorkToggle(event: Event, bar: GanttBar): void {
    event.stopPropagation();
    event.preventDefault();
    this.closeLabelOverlay();
    if (!this.isWorkDetailOpen(bar.id)) {
      this.workerDrafts.update((drafts) => {
        const next = new Map(drafts);
        next.set(bar.id, [...(bar.workerIds ?? [])]);
        return next;
      });
    }
    this.toggleWorkDetail.emit(bar.id);
  }

  workerCandidatesFor(bar: GanttBar): readonly Person[] {
    return this.workerCandidates().get(bar.workTypeId) ?? [];
  }

  workerDraftFor(bar: GanttBar): readonly string[] {
    return this.workerDrafts().get(bar.id) ?? bar.workerIds ?? [];
  }

  onWorkerToggle(bar: GanttBar, workerId: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.workerDrafts.update((drafts) => {
      const next = new Map(drafts);
      const ids = new Set(this.workerDraftFor(bar));
      if (checked) ids.add(workerId);
      else ids.delete(workerId);
      next.set(bar.id, [...ids]);
      return next;
    });
  }

  onWorkerSave(bar: GanttBar, event: Event): void {
    event.stopPropagation();
    if (!this.canEdit() || this.readOnly() || this.groupByWorkers() || this.workerAssignmentSaving()) return;
    this.workerAssignmentCommit.emit({
      orderId: bar.orderId,
      orderItemIndex: bar.orderItemIndex,
      moduleId: bar.moduleId,
      workTypeId: bar.workTypeId,
      workerIds: [...this.workerDraftFor(bar)],
    });
  }

  isWorkDetailOpen(barId: string): boolean {
    return this.expandedWorkBarId() === barId;
  }

  isOrderMetaOpen(orderId: string): boolean {
    return this.orderMeta()?.orderId === orderId;
  }

  orderMetaFor(orderId: string): GanttOrderMetaView | null {
    const m = this.orderMeta();
    return m && m.orderId === orderId ? m : null;
  }

  isHighlightedOrder(orderId: string): boolean {
    const id = this.highlightOrderId();
    return Boolean(id && id === orderId);
  }

  isTreeExpandedOrder(orderId: string): boolean {
    return this.expandedOrderIds().has(orderId);
  }

  /** Order or worker group currently expanded (frames / tint). */
  isTreeExpandedGroup(bar: GanttBar): boolean {
    if (this.groupByWorkers()) return this.expandedWorkerIds().has(workerGroupKeyOf(bar));
    return this.expandedOrderIds().has(bar.orderId);
  }

  /** Row group key for boundary borders: worker label in worker view, else orderId. */
  private rowGroupKey(bar: GanttBar): string {
    return this.groupByWorkers() ? workerGroupKeyOf(bar) : bar.orderId;
  }

  isOrderEmphasized(orderId: string): boolean {
    return this.isHighlightedOrder(orderId) || this.isTreeExpandedOrder(orderId);
  }

  /**
   * Empty Gantt chrome/grid (not labels, bars, handles) → dismiss expand trees.
   * stopPropagation so studio main does not double-handle inconsistently.
   */
  onRootClick(event: MouseEvent): void {
    event.stopPropagation();
    const t = event.target;
    if (!(t instanceof Element)) return;
    if (
      t.closest(
        [
          '[data-test^="gantt-label-"]',
          '[data-test^="gantt-expand-"]',
          '[data-test^="gantt-work-expand-"]',
          '[data-test^="gantt-work-detail"]',
          '[data-test^="gantt-order-meta"]',
          '[data-test^="gantt-bar"]',
          '[data-test^="gantt-row-"]',
          '[data-test^="gantt-resize"]',
          'button',
          'a',
          'input',
          'select',
          'textarea',
        ].join(','),
      )
    ) {
      if (!t.closest('button.gantt-label-btn')) {
        this.closeLabelOverlay();
      }
      return;
    }
    this.closeLabelOverlay();
    this.dismissCanvas.emit();
  }

  /** Product/module rows — truncated-label-peek (hover + cascade expand). */
  supportsLabelOverlay(row: { isProductSummary: boolean; isModuleSummary: boolean }): boolean {
    return row.isProductSummary || row.isModuleSummary;
  }

  isLabelOverlayOpen(row: { bar: GanttBar }): boolean {
    return this.labelOverlayKey() === row.bar.id;
  }

  closeLabelOverlay(): void {
    this.clearLabelOverlayLeaveTimer();
    this.labelOverlayKey.set(null);
  }

  openLabelPeek(barId: string): void {
    this.clearLabelOverlayLeaveTimer();
    this.labelOverlayKey.set(barId);
  }

  onLabelPeekLeave(): void {
    this.clearLabelOverlayLeaveTimer();
    this.labelOverlayLeaveTimer = setTimeout(() => this.closeLabelOverlay(), 120);
  }

  private clearLabelOverlayLeaveTimer(): void {
    if (this.labelOverlayLeaveTimer == null) return;
    clearTimeout(this.labelOverlayLeaveTimer);
    this.labelOverlayLeaveTimer = null;
  }

  private isExpandIdOpen(expandId: string, bar: GanttBar): boolean {
    if (isWorkerSummaryBar(bar)) {
      return this.expandedWorkerIds().has(workerGroupKeyOf(bar));
    }
    if (isProductSummaryBar(bar)) {
      return this.expandedProductIds().has(expandId);
    }
    if (isModuleSummaryBar(bar)) {
      return this.expandedModuleIds().has(expandId);
    }
    return this.expandedOrderIds().has(expandId);
  }

  labelOverlayText(row: { isProductSummary: boolean; isModuleSummary: boolean; bar: GanttBar }): string {
    const b = row.bar;
    if (row.isProductSummary) {
      return [b.productName, b.quantityLabel].filter(Boolean).join(' ');
    }
    if (row.isModuleSummary) {
      return b.moduleName ?? '';
    }
    return '';
  }

  labelOverlayLevelClass(row: { rowKind: string }): string {
    if (row.rowKind === 'product') return 'gantt-label-overlay--product';
    if (row.rowKind === 'module') return 'gantt-label-overlay--module';
    return '';
  }

  /** `document:click` handler body — called from the component's own `@HostListener`. */
  onDocumentClick(event: MouseEvent): void {
    if (!this.labelOverlayKey()) return;
    const t = event.target;
    if (!(t instanceof Element)) return;
    if (t.closest('.gantt-label-wrap')) return;
    this.closeLabelOverlay();
  }

  /**
   * Order summary → order-meta; worker → expand; product/module → peek via hover/▸ only; work → detail.
   */
  onLabelClick(
    event: Event,
    row: { isSummary: boolean; bar: GanttBar; isProductSummary: boolean; isModuleSummary: boolean },
  ): void {
    event.stopPropagation();
    event.preventDefault();
    if (isOrderSummaryBar(row.bar)) {
      this.closeLabelOverlay();
      if (!this.groupByWorkers()) this.orderLabelClick.emit(row.bar.orderId);
      return;
    }
    if (isProductSummaryBar(row.bar) || isModuleSummaryBar(row.bar)) {
      return;
    }
    if (isWorkerSummaryBar(row.bar)) {
      this.closeLabelOverlay();
      this.toggleExpand.emit(this.expandKey(row.bar));
      return;
    }
    this.closeLabelOverlay();
    this.toggleWorkDetail.emit(row.bar.id);
  }

  workDetailTitle(bar: GanttBar, open: boolean): string {
    return open
      ? `Скрыть дни и людей · ${bar.workTypeName}`
      : `Показать дни и людей · ${bar.workTypeName}`;
  }

  workDetailWash(bar: GanttBar): string {
    return workTypeWash(bar.workTypeId, bar.accentHue);
  }

  onWorkDaysChange(bar: GanttBar, ev: Event): void {
    if (!this.canEdit() || this.readOnly() || this.groupByWorkers()) return;
    const inputEl = ev.target as HTMLInputElement;
    const days = Math.floor(Number(inputEl.value));
    if (!Number.isFinite(days) || days < 1) {
      inputEl.value = String(bar.days ?? 1);
      return;
    }
    if (days === bar.days) return;
    this.estimateDaysCommit.emit({
      orderId: bar.orderId,
      orderItemIndex: bar.orderItemIndex,
      moduleId: bar.moduleId,
      workTypeId: bar.workTypeId,
      days,
    });
  }

  onMetaPriority(ev: Event): void {
    ev.stopPropagation();
    const value = (ev.target as HTMLSelectElement).value as OrderPriority;
    this.priorityDraft.set(value);
    this.emitMetaIfChanged({ priority: value, plannedDate: this.plannedDraft() });
  }

  onMetaPlanned(ev: Event): void {
    ev.stopPropagation();
    const value = (ev.target as HTMLInputElement).value;
    this.plannedDraft.set(value);
    this.emitMetaIfChanged({ priority: this.priorityDraft(), plannedDate: value });
  }

  private emitMetaIfChanged(next: { priority: OrderPriority; plannedDate: string }): void {
    const m = this.orderMeta();
    if (!m || !this.canEditOrder()) return;
    if (next.priority === m.priority && next.plannedDate === m.plannedDate) return;
    this.orderMetaCommit.emit({
      orderId: m.orderId,
      priority: next.priority,
      plannedDate: next.plannedDate,
    });
  }

  onMovePointerDown(event: PointerEvent, bar: GanttBar): void {
    if (!this.canMoveBar(bar)) return;
    // Resize handle owns its pointerdown (stopPropagation); body starts move.
    if (this.resizeSession()) return;
    event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture?.(event.pointerId);
    this.moveSession.set({
      mode: isOrderSummaryBar(bar) ? 'plannedDate' : 'startOffset',
      orderId: bar.orderId,
      barId: bar.id,
      bar,
      startClientX: event.clientX,
      previewDeltaDays: 0,
      pointerId: event.pointerId,
    });
  }

  onResizePointerDown(event: PointerEvent, row: { bar: GanttBar; baseSpanDays: number }): void {
    if (!this.canResizeBar(row.bar)) return;
    event.preventDefault();
    event.stopPropagation();
    this.moveSession.set(null);
    const baseDays = Math.max(1, row.bar.days ?? row.baseSpanDays);
    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture(event.pointerId);
    this.resizeSession.set({
      barId: row.bar.id,
      bar: row.bar,
      baseDays,
      startClientX: event.clientX,
      previewDays: baseDays,
      pointerId: event.pointerId,
    });
  }

  /** `document:pointermove` handler body — called from the component's own `@HostListener`. */
  onDocumentPointerMove(event: PointerEvent): void {
    const move = this.moveSession();
    if (move && event.pointerId === move.pointerId) {
      const previewDeltaDays = snapMoveDeltaDays(event.clientX - move.startClientX, this.pxPerDay());
      if (previewDeltaDays === move.previewDeltaDays) return;
      this.moveSession.set({ ...move, previewDeltaDays });
      return;
    }
    const session = this.resizeSession();
    if (!session || event.pointerId !== session.pointerId) return;
    const deltaPx = event.clientX - session.startClientX;
    const previewDays = snapEstimateDaysFromDelta(session.baseDays, deltaPx, this.pxPerDay());
    if (previewDays === session.previewDays) return;
    this.resizeSession.set({ ...session, previewDays });
  }

  /** `document:pointerup`/`pointercancel` handler body — called from the component's own `@HostListener`. */
  onDocumentPointerUp(event: PointerEvent): void {
    const move = this.moveSession();
    if (move && event.pointerId === move.pointerId) {
      this.finishMove(move, /*commit*/ true);
      return;
    }
    const session = this.resizeSession();
    if (!session || event.pointerId !== session.pointerId) return;
    this.finishResize(session, /*commit*/ true);
  }

  /** `document:keydown.escape` handler body — called from the component's own `@HostListener`. Returns whether it consumed the escape (so the component knows not to do anything else). */
  onEscapeCancel(): boolean {
    if (this.labelOverlayKey()) {
      this.closeLabelOverlay();
      return true;
    }
    const move = this.moveSession();
    if (move) {
      this.finishMove(move, /*commit*/ false);
      return true;
    }
    const session = this.resizeSession();
    if (!session) return false;
    this.finishResize(session, /*commit*/ false);
    return true;
  }

  private finishMove(
    session: {
      mode: 'plannedDate' | 'startOffset';
      orderId: string;
      barId: string;
      bar: GanttBar;
      previewDeltaDays: number;
      pointerId: number;
    },
    commit: boolean,
  ): void {
    this.moveSession.set(null);
    if (!commit) return;
    const deltaDays = session.previewDeltaDays;
    if (deltaDays === 0) return;
    if (session.mode === 'plannedDate') {
      this.plannedDateMoveCommit.emit({
        orderId: session.orderId,
        deltaDays,
      });
      return;
    }
    this.startOffsetCommit.emit({
      orderId: session.bar.orderId,
      orderItemIndex: session.bar.orderItemIndex,
      moduleId: session.bar.moduleId,
      workTypeId: session.bar.workTypeId,
      startDate: session.bar.startDate,
      deltaDays,
    });
  }

  private finishResize(
    session: { barId: string; bar: GanttBar; baseDays: number; previewDays: number; pointerId: number },
    commit: boolean,
  ): void {
    this.resizeSession.set(null);
    if (!commit) return;
    const days = Math.max(1, session.previewDays);
    if (days === session.baseDays) return;
    this.estimateDaysCommit.emit({
      orderId: session.bar.orderId,
      orderItemIndex: session.bar.orderItemIndex,
      moduleId: session.bar.moduleId,
      workTypeId: session.bar.workTypeId,
      days,
    });
  }

  fill(workTypeId: string, hue?: number | null): string {
    return workTypeOklch(workTypeId, 0.12, 0.72, hue);
  }

  /** Denser WT chip on worker FIO row (TZ-PRODUCTION-351). */
  workerChipFill(hue: number | null | undefined): string {
    return workTypeOklch('worker-tint', 0.14, 0.76, hue);
  }

  statusLabel(s: OrderStatus): string {
    return ORDER_STATUS_LABELS[s] ?? s;
  }

  statusPip(s: OrderStatus): string {
    switch (s) {
      case 'draft':
        return 'oklch(0.65 0.02 250)';
      case 'confirmed':
        return 'oklch(0.62 0.14 230)';
      case 'in_production':
        return 'oklch(0.65 0.16 85)';
      case 'ready':
        return 'oklch(0.62 0.15 145)';
      case 'shipped':
        return 'oklch(0.55 0.08 280)';
      case 'delivered':
        return 'oklch(0.5 0.05 150)';
      case 'cancelled':
        return 'oklch(0.55 0.14 25)';
      default:
        return 'oklch(0.6 0.02 250)';
    }
  }

  /** Full detail for tooltip / a11y — visible label stays one line. */
  labelTitle(b: GanttBar): string {
    if (isUnassignedWorkerSummaryBar(b)) {
      return [
        `Рабочий: ${b.orderNumber}`,
        'нет исполнителя на видах работ',
        `${b.startDate}→${b.endDate}`,
      ].join(' · ');
    }
    if (isWorkerSummaryBar(b)) {
      return [`Рабочий: ${b.orderNumber}`, `${b.startDate}→${b.endDate}`].join(' · ');
    }
    if (isOrderSummaryBar(b)) {
      return [b.orderNumber, this.statusLabel(b.orderStatus), `${b.startDate}→${b.endDate}`]
        .filter(Boolean)
        .join(' · ');
    }
    if (isProductSummaryBar(b)) {
      return [b.orderNumber, b.productName, b.quantityLabel, `${b.startDate}→${b.endDate}`]
        .filter(Boolean)
        .join(' · ');
    }
    if (isModuleSummaryBar(b)) {
      return [b.orderNumber, b.productName, b.moduleName, `${b.startDate}→${b.endDate}`]
        .filter(Boolean)
        .join(' · ');
    }
    const parts = [
      b.orderNumber,
      this.statusLabel(b.orderStatus),
      b.productName,
      b.moduleName,
      b.workTypeName,
      b.quantityLabel,
      b.workerLabel && b.workerLabel !== '—' ? `исполн.: ${b.workerLabel}` : null,
    ].filter(Boolean);
    return parts.join(' · ');
  }

  /** TZ-PRODUCTION-320/343: chevron zone — kind-aware Gantt tree expand. */
  expandTitle(bar: GanttBar, expanded: boolean): string {
    const label = this.treeLabel(bar);
    if (isProductSummaryBar(bar)) {
      return expanded ? `Свернуть модули изделия · ${label}` : `Развернуть модули изделия · ${label}`;
    }
    if (isModuleSummaryBar(bar)) {
      return expanded ? `Свернуть виды работ · ${label}` : `Развернуть виды работ · ${label}`;
    }
    if (isWorkerSummaryBar(bar)) {
      return expanded
        ? `Свернуть модули рабочего · ${label}`
        : `Развернуть модули рабочего · ${label}`;
    }
    return expanded ? `Свернуть состав на Ганте · ${label}` : `Развернуть состав на Ганте · ${label}`;
  }

  /** TZ-PRODUCTION-322: order-number zone — order-meta strip only. */
  summaryCardTitle(b: GanttBar): string {
    if (isUnassignedWorkerSummaryBar(b)) {
      return `Нет исполнителя: ${b.orderNumber} — назначьте виды работ в Люди`;
    }
    if (isWorkerSummaryBar(b)) return `Группа рабочего: ${b.orderNumber}`;
    if (isProductSummaryBar(b)) return `Изделие · ${b.productName}`;
    if (isModuleSummaryBar(b)) return `Модуль · ${b.moduleName}`;
    return `Статус и даты заказа ${b.orderNumber}`;
  }

  barTitle(b: GanttBar): string {
    const head = this.labelTitle(b);
    if (b.noTerm) return `${head} — без срока`;
    if (isSummaryBar(b)) return `${head} · сводно ${b.days}д`.trim();
    return `${head} · ${b.startDate}→${b.endDate} · ${b.days}д`.trim();
  }

  barAriaLabel(b: GanttBar): string {
    const base = this.barTitle(b);
    if (!this.canMoveBar(b)) return base;
    if (isOrderSummaryBar(b)) return `${base} · Сдвинуть начало заказа`;
    return `${base} · Сдвинуть вид работ`;
  }
}

function dayDiff(a: string, b: string): number {
  const pa = a.split('-').map(Number);
  const pb = b.split('-').map(Number);
  const da = Date.UTC(pa[0]!, pa[1]! - 1, pa[2]!);
  const db = Date.UTC(pb[0]!, pb[1]! - 1, pb[2]!);
  return Math.round((db - da) / 86400000);
}

function addDays(dateOnly: string, days: number): string {
  const [y, m, d] = dateOnly.split('-').map(Number);
  const dt = new Date(Date.UTC(y!, m! - 1, d!));
  dt.setUTCDate(dt.getUTCDate() + days);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function shortDay(dateOnly: string): string {
  const [, m, d] = dateOnly.split('-');
  return `${d}.${m}`;
}
