import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  input,
  output,
  signal,
} from '@angular/core';
import {
  buildGanttTreeBars,
  formatDateOnly,
  isSummaryBar,
  ORDER_STATUS_LABELS,
  workTypeOklch,
  type GanttBar,
} from '../gantt-bar.model';
import type { OrderStatus } from '../../orders/orders.service';
import type { GanttZoom } from '../production-cockpit.context';

/** Pixels per calendar day — day zoom is denser, week packs the same span. */
export const GANTT_PX_PER_DAY: Record<GanttZoom, number> = {
  day: 36,
  week: 12,
};

/** Fixed row height (px) — label column and timeline rows must match (no multi-line drift). */
export const GANTT_ROW_PX = 44;

/** Payload for order-level estimate days PATCH (never WorkType catalog). */
export interface GanttEstimateDaysCommit {
  orderId: string;
  orderItemIndex: number;
  moduleId: string;
  workTypeId: string;
  days: number;
}

/** Payload for body-drag → order plannedDate shift (whole chain). */
export interface GanttPlannedDateMoveCommit {
  orderId: string;
  deltaDays: number;
}

/** Payload for child body-drag → per-bar start offset (TZ-PRODUCTION-316). */
export interface GanttStartOffsetCommit {
  orderId: string;
  orderItemIndex: number;
  moduleId: string;
  workTypeId: string;
  /** Bar startDate before drag (YYYY-MM-DD). */
  startDate: string;
  deltaDays: number;
}

/**
 * Snap right-edge resize delta to calendar days (≥1).
 * Pure helper — unit-tested independently of DOM.
 */
export function snapEstimateDaysFromDelta(
  baseDays: number,
  deltaPx: number,
  pxPerDay: number,
): number {
  const base = Number.isFinite(baseDays) ? Math.floor(baseDays) : 1;
  if (!Number.isFinite(pxPerDay) || pxPerDay <= 0) return Math.max(1, base);
  const deltaDays = Math.round(deltaPx / pxPerDay);
  return Math.max(1, base + deltaDays);
}

/**
 * Snap body-drag px delta to calendar days (may be negative / zero).
 */
export function snapMoveDeltaDays(deltaPx: number, pxPerDay: number): number {
  if (!Number.isFinite(pxPerDay) || pxPerDay <= 0) return 0;
  if (!Number.isFinite(deltaPx)) return 0;
  return Math.round(deltaPx / pxPerDay);
}

function isBarEstimateReadOnly(status: OrderStatus): boolean {
  return status === 'shipped' || status === 'delivered' || status === 'cancelled';
}

@Component({
  selector: 'app-gantt-bars',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex flex-col h-full min-h-0 bg-[oklch(0.985_0.005_95)] dark:bg-paper"
      [attr.data-zoom]="zoom()"
      data-test="gantt-bars-root"
      (click)="$event.stopPropagation()"
    >
      <div
        class="shrink-0 px-3 py-2 flex flex-wrap items-center gap-3 border-b hairline text-xs text-muted-foreground"
      >
        <span class="font-medium text-ink" data-test="gantt-estimate-label"
          >План-оценка по дням видов работ</span
        >
        <span class="opacity-80">календарные дни · не факт цеха · выходные не исключаются</span>
        <span class="opacity-70" data-test="gantt-zoom-hint">
          масштаб: {{ zoom() === 'day' ? 'день' : 'неделя' }}
        </span>
        <span class="opacity-70" data-test="gantt-expand-hint"
          >Разверните заказ, чтобы править виды работ</span
        >
        @if (usedTodayFallback()) {
          <span class="text-amber-800 dark:text-amber-300" data-test="gantt-today-fallback"
            >Дата начала не задана — показано от сегодня</span
          >
        }
        @if (readOnly()) {
          <span class="text-amber-800 dark:text-amber-300"
            >Заказ завершён/отменён — только просмотр</span
          >
        }
      </div>

      @if (warnings().length) {
        <div
          class="shrink-0 px-3 py-1.5 text-xs text-amber-900 dark:text-amber-200 bg-amber-50/80 dark:bg-amber-950/30 border-b hairline"
          data-test="gantt-warnings"
        >
          @for (w of warnings(); track w) {
            <div>{{ w }}</div>
          }
        </div>
      }

      @if (legendItems().length) {
        <div
          class="shrink-0 px-3 py-1.5 flex flex-wrap gap-x-3 gap-y-1 border-b hairline text-[10px]"
          data-test="gantt-worktype-legend"
        >
          @for (item of legendItems(); track item.id) {
            <span class="inline-flex items-center gap-1">
              <span
                class="w-2.5 h-2.5 rounded-sm border hairline shrink-0"
                [style.background]="item.color"
              ></span>
              {{ item.name }}
            </span>
          }
        </div>
      }

      @if (!bars().length) {
        <div
          class="shrink-0 px-3 py-1.5 text-xs text-muted-foreground border-b hairline bg-paper-2/40"
          data-test="gantt-empty"
          role="status"
        >
          Нет полос оценки — календарь всё равно показан. Выберите заказ слева или заведите состав
          изделия (модули → виды работ с днями).
        </div>
      }

      <div class="flex-1 min-h-0 overflow-auto">
        <div class="flex" [style.minWidth.px]="timelineMinWidth()">
          <div class="sticky left-0 z-[2] w-52 shrink-0 border-r hairline bg-paper">
            <div
              class="h-7 border-b hairline px-2 flex items-end pb-1 text-[11px] text-muted-foreground"
              data-test="gantt-label-header"
            >
              {{ anyExpanded() ? 'Заказ · работа' : 'Заказ' }}
            </div>
            @for (row of rows(); track row.bar.id) {
              <div
                class="gantt-row-h w-full px-1 text-left border-b hairline
                       flex items-center gap-0.5 min-w-0 overflow-hidden hover:bg-paper-2"
                [class.bg-paper-2]="row.alt"
                [class.border-t-2]="row.orderBoundary"
                [attr.data-test]="'gantt-label-' + row.bar.id"
              >
                @if (row.isSummary) {
                  <button
                    type="button"
                    class="shrink-0 w-6 h-6 inline-flex items-center justify-center rounded-sm
                           text-muted-foreground hover:text-ink pi-focus-ring"
                    [attr.data-test]="'gantt-expand-' + row.bar.orderId"
                    [attr.aria-expanded]="row.expanded"
                    [attr.aria-label]="
                      (row.expanded ? 'Свернуть состав заказа ' : 'Развернуть состав заказа ') +
                      row.bar.orderNumber
                    "
                    (click)="onToggleExpand($event, row.bar.orderId)"
                  >
                    <span aria-hidden="true" class="text-[10px] font-mono">{{
                      row.expanded ? '▾' : '▸'
                    }}</span>
                  </button>
                } @else {
                  <span class="w-6 shrink-0" aria-hidden="true"></span>
                }
                <button
                  type="button"
                  class="flex-1 min-w-0 h-full px-1 flex items-center gap-1.5 text-left pi-focus-ring rounded-sm"
                  (click)="onLabelClick($event, row)"
                  [attr.title]="labelTitle(row.bar)"
                  [attr.aria-label]="labelTitle(row.bar)"
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full shrink-0"
                    [style.background]="statusPip(row.bar.orderStatus)"
                    aria-hidden="true"
                  ></span>
                  @if (!row.isSummary) {
                    <span
                      class="w-1.5 h-5 rounded-sm shrink-0"
                      [style.background]="
                        row.bar.noTerm ? 'transparent' : fill(row.bar.workTypeId, row.bar.accentHue)
                      "
                      [class.border]="row.bar.noTerm"
                      [class.border-dashed]="row.bar.noTerm"
                      aria-hidden="true"
                    ></span>
                  }
                  <span class="min-w-0 flex-1 truncate text-xs leading-none">
                    @if (row.isSummary) {
                      <span class="font-medium text-ink">{{ row.bar.orderNumber }}</span>
                    } @else {
                      <span class="text-muted-foreground pl-1">{{ row.bar.workTypeName }}</span>
                      @if (row.bar.quantityLabel) {
                        <span class="font-mono text-muted-foreground">
                          {{ row.bar.quantityLabel }}</span
                        >
                      }
                    }
                  </span>
                </button>
              </div>
            } @empty {
              @for (ph of emptyPlaceholders; track ph) {
                <div
                  class="gantt-row-h px-2 text-xs border-b hairline text-muted-foreground/70
                         flex items-center"
                  [class.bg-paper-2]="ph % 2 === 1"
                  data-test="gantt-placeholder-row"
                >
                  <span class="truncate">—</span>
                </div>
              }
            }
          </div>

          <div class="relative flex-1 min-w-0">
            <div
              class="relative h-7 border-b hairline sticky top-0 bg-paper z-10"
              data-test="gantt-scale"
            >
              @for (tick of scaleTicks(); track tick.key) {
                <div
                  class="absolute top-0 bottom-0 border-l hairline text-[10px] text-muted-foreground pl-0.5 overflow-hidden"
                  [style.left.px]="tick.leftPx"
                  [style.width.px]="tick.widthPx"
                  [attr.data-test]="'gantt-tick-' + tick.key"
                >
                  {{ tick.label }}
                </div>
              }
              <div
                class="absolute top-0 bottom-0 w-px bg-destructive/70 z-[1]"
                [style.left.px]="todayLeftPx()"
                title="Сегодня"
                data-test="gantt-today-marker"
              ></div>
            </div>

            @for (row of rows(); track row.bar.id) {
              <div
                class="relative gantt-row-h border-b hairline"
                [class.bg-paper-2]="row.alt"
                [class.border-t-2]="row.orderBoundary"
                [attr.data-test]="'gantt-row-' + row.bar.id"
              >
                @for (grid of dayGrid(); track grid.key) {
                  <div
                    class="absolute top-0 bottom-0 border-l hairline opacity-40"
                    [style.left.px]="grid.leftPx"
                  ></div>
                }
                <div
                  class="absolute top-1.5 bottom-1.5 rounded-sm text-[10px] px-1.5 flex items-center overflow-hidden text-ink/90 group/bar"
                  [class.border]="row.bar.noTerm || row.isSummary"
                  [class.border-dashed]="row.bar.noTerm"
                  [class.border-muted-foreground]="row.bar.noTerm || row.isSummary"
                  [class.ring-1]="
                    isResizingBar(row.bar.id) ||
                    isMovingOrder(row.bar.orderId) ||
                    isMovingBar(row.bar.id)
                  "
                  [class.ring-ink]="
                    isResizingBar(row.bar.id) ||
                    isMovingOrder(row.bar.orderId) ||
                    isMovingBar(row.bar.id)
                  "
                  [class.cursor-grab]="
                    canMoveBar(row.bar) &&
                    !isMovingOrder(row.bar.orderId) &&
                    !isMovingBar(row.bar.id)
                  "
                  [class.cursor-grabbing]="
                    isMovingOrder(row.bar.orderId) || isMovingBar(row.bar.id)
                  "
                  [style.left.px]="displayLeftPx(row)"
                  [style.width.px]="displayWidthPx(row)"
                  [style.background]="barFill(row)"
                  [style.backgroundImage]="
                    row.bar.noTerm
                      ? 'repeating-linear-gradient(135deg, transparent, transparent 4px, oklch(0.7 0.02 250 / 0.35) 4px, oklch(0.7 0.02 250 / 0.35) 8px)'
                      : null
                  "
                  [attr.title]="barTitle(row.bar)"
                  [attr.aria-label]="barAriaLabel(row.bar)"
                  [attr.data-test]="
                    row.isSummary
                      ? 'gantt-bar-summary'
                      : row.bar.noTerm
                        ? 'gantt-bar-no-term'
                        : 'gantt-bar'
                  "
                  (pointerdown)="onMovePointerDown($event, row.bar)"
                >
                  @if (!row.bar.noTerm) {
                    <span class="truncate" data-test="gantt-bar-days-label"
                      >{{ displayDays(row) }}д</span
                    >
                    @if (isResizingBar(row.bar.id)) {
                      <span
                        class="ml-1 shrink-0 text-[9px] opacity-80"
                        data-test="gantt-resize-hint"
                        >оценка · не факт</span
                      >
                    }
                  } @else {
                    <span class="truncate text-muted-foreground">без срока</span>
                  }
                  @if (canResizeBar(row.bar)) {
                    <button
                      type="button"
                      class="gantt-resize-handle absolute top-0 bottom-0 right-0 w-2.5 -mr-px
                             cursor-ew-resize border-0 p-0 bg-ink/25 hover:bg-ink/45
                             opacity-0 group-hover/bar:opacity-100 focus-visible:opacity-100
                             pi-focus-ring"
                      [class.opacity-100]="isResizingBar(row.bar.id)"
                      [attr.data-test]="'gantt-resize-handle-' + row.bar.id"
                      [attr.aria-label]="
                        'Изменить длительность «' + row.bar.workTypeName + '» (оценка · не факт)'
                      "
                      (pointerdown)="onResizePointerDown($event, row)"
                      (click)="$event.stopPropagation()"
                    ></button>
                  }
                </div>
              </div>
            } @empty {
              @for (ph of emptyPlaceholders; track ph) {
                <div
                  class="relative gantt-row-h border-b hairline"
                  [class.bg-paper-2]="ph % 2 === 1"
                >
                  @for (grid of dayGrid(); track grid.key) {
                    <div
                      class="absolute top-0 bottom-0 border-l hairline opacity-40"
                      [style.left.px]="grid.leftPx"
                    ></div>
                  }
                </div>
              }
            }
          </div>
        </div>
      </div>

      <div
        class="shrink-0 px-3 py-2 border-t hairline text-[10px] text-muted-foreground"
        data-test="gantt-legend"
      >
        Красная линия = сегодня · сводная полоса = срок заказа · ▸ развернуть состав · цвет = вид
        работ · правый край состава = дни оценки · тело сводной = начало заказа · тело состава =
        сдвиг вида · подпись заказа слева = карточка
      </div>
    </div>
  `,
  styles: `
    .gantt-row-h {
      height: ${GANTT_ROW_PX}px;
      box-sizing: border-box;
    }
    .gantt-resize-handle {
      touch-action: none;
    }
  `,
})
export class GanttBarsComponent {
  /** Work-type bars from buildGanttBars (not pre-built summaries). */
  readonly bars = input.required<GanttBar[]>();
  readonly rangeStart = input.required<string>();
  readonly rangeEnd = input.required<string>();
  readonly zoom = input<GanttZoom>('day');
  readonly warnings = input<string[]>([]);
  readonly usedTodayFallback = input(false);
  readonly readOnly = input(false);
  /** production:write (or equivalent) — required for resize handles. */
  readonly canEdit = input(false);
  readonly today = input(formatDateOnly(new Date()));
  /** TZ-PRODUCTION-314 — which orders show work-type children. */
  readonly expandedOrderIds = input<ReadonlySet<string>>(new Set());
  /**
   * TZ-PRODUCTION-319 — left summary order label only (toggle card in parent).
   * Child labels and timeline bars do not emit this.
   */
  readonly orderLabelClick = output<string>();
  readonly toggleExpand = output<string>();
  /** Commit snapped days → parent PATCHes order estimate-days only. */
  readonly estimateDaysCommit = output<GanttEstimateDaysCommit>();
  /** Body-drag on summary → parent PATCHes order plannedDate (whole chain). */
  readonly plannedDateMoveCommit = output<GanttPlannedDateMoveCommit>();
  /** Child body-drag → parent PATCHes estimate-start offset. */
  readonly startOffsetCommit = output<GanttStartOffsetCommit>();

  protected readonly emptyPlaceholders = [0, 1, 2, 3, 4, 5] as const;

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

  protected readonly totalDays = computed(() =>
    Math.max(1, dayDiff(this.rangeStart(), this.rangeEnd())),
  );

  protected readonly pxPerDay = computed(() => GANTT_PX_PER_DAY[this.zoom()]);

  protected readonly timelineMinWidth = computed(() => this.totalDays() * this.pxPerDay() + 224);

  protected readonly dayGrid = computed(() => {
    const total = this.totalDays();
    const px = this.pxPerDay();
    const out: Array<{ key: string; leftPx: number }> = [];
    for (let i = 0; i < total; i++) {
      out.push({ key: `g${i}`, leftPx: i * px });
    }
    return out;
  });

  protected readonly treeBars = computed(() =>
    buildGanttTreeBars(this.bars(), this.expandedOrderIds()),
  );

  protected readonly anyExpanded = computed(() => this.expandedOrderIds().size > 0);

  protected readonly legendItems = computed(() => {
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

  protected readonly scaleTicks = computed(() => {
    const start = this.rangeStart();
    const total = this.totalDays();
    const px = this.pxPerDay();
    const weekMode = this.zoom() === 'week';
    const ticks: Array<{ key: string; label: string; leftPx: number; widthPx: number }> = [];
    for (let i = 0; i < total; i++) {
      const date = addDays(start, i);
      const dow = utcDow(date);
      if (weekMode && dow !== 1 && i !== 0) continue;
      const span = weekMode ? Math.min(7, total - i) : 1;
      ticks.push({
        key: date,
        label: weekMode ? `н.${isoWeek(date)}` : shortDay(date),
        leftPx: i * px,
        widthPx: span * px,
      });
    }
    return ticks;
  });

  protected readonly rows = computed(() => {
    const start = this.rangeStart();
    const total = this.totalDays();
    const px = this.pxPerDay();
    const expanded = this.expandedOrderIds();
    const sorted = this.treeBars();
    return sorted.map((bar, idx) => {
      const left = dayDiff(start, bar.startDate);
      const span = bar.noTerm
        ? Math.max(1, Math.round(total * 0.04))
        : Math.max(1, dayDiff(bar.startDate, bar.endDate) + 1);
      const prev = idx > 0 ? sorted[idx - 1] : null;
      const isSummary = isSummaryBar(bar);
      return {
        bar,
        alt: idx % 2 === 1,
        orderBoundary: !!prev && prev.orderId !== bar.orderId,
        leftPx: left * px,
        widthPx: Math.max(px * 0.5, span * px),
        baseSpanDays: span,
        isSummary,
        expanded: expanded.has(bar.orderId),
      };
    });
  });

  protected readonly todayLeftPx = computed(() => {
    const t = dayDiff(this.rangeStart(), this.today());
    return Math.max(0, Math.min(this.totalDays(), t)) * this.pxPerDay();
  });

  /** Child work bars only — summary has no right-resize (duration derived). */
  protected canResizeBar(bar: GanttBar): boolean {
    if (isSummaryBar(bar)) return false;
    if (!this.canEdit() || this.readOnly()) return false;
    if (bar.noTerm || bar.days == null || bar.days < 1) return false;
    if (isBarEstimateReadOnly(bar.orderStatus)) return false;
    return true;
  }

  /**
   * Summary → plannedDate; child work bar → start offset (316).
   */
  protected canMoveBar(bar: GanttBar): boolean {
    if (!this.canEdit() || this.readOnly()) return false;
    if (isBarEstimateReadOnly(bar.orderStatus)) return false;
    return true;
  }

  protected isResizingBar(barId: string): boolean {
    return this.resizeSession()?.barId === barId;
  }

  protected isMovingOrder(orderId: string): boolean {
    const s = this.moveSession();
    return !!s && s.mode === 'plannedDate' && s.orderId === orderId;
  }

  protected isMovingBar(barId: string): boolean {
    const s = this.moveSession();
    return !!s && s.mode === 'startOffset' && s.barId === barId;
  }

  protected displayDays(row: { bar: GanttBar; baseSpanDays: number }): number {
    const session = this.resizeSession();
    if (session && session.barId === row.bar.id) return session.previewDays;
    return row.bar.days ?? row.baseSpanDays;
  }

  protected displayWidthPx(row: { bar: GanttBar; widthPx: number; baseSpanDays: number }): number {
    const session = this.resizeSession();
    if (session && session.barId === row.bar.id) {
      return Math.max(this.pxPerDay() * 0.5, session.previewDays * this.pxPerDay());
    }
    return row.widthPx;
  }

  protected displayLeftPx(row: { bar: GanttBar; leftPx: number }): number {
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

  protected barFill(row: { bar: GanttBar; isSummary: boolean }): string {
    if (row.bar.noTerm) return 'transparent';
    if (row.isSummary) return 'oklch(0.88 0.01 250)';
    return this.fill(row.bar.workTypeId, row.bar.accentHue);
  }

  protected onToggleExpand(event: Event, orderId: string): void {
    event.stopPropagation();
    event.preventDefault();
    this.toggleExpand.emit(orderId);
  }

  /** Summary left label → card toggle; child work-type label → no card. */
  protected onLabelClick(
    event: Event,
    row: { isSummary: boolean; bar: { orderId: string } },
  ): void {
    event.stopPropagation();
    event.preventDefault();
    if (!row.isSummary) return;
    this.orderLabelClick.emit(row.bar.orderId);
  }

  protected onMovePointerDown(event: PointerEvent, bar: GanttBar): void {
    if (!this.canMoveBar(bar)) return;
    // Resize handle owns its pointerdown (stopPropagation); body starts move.
    if (this.resizeSession()) return;
    event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture?.(event.pointerId);
    this.moveSession.set({
      mode: isSummaryBar(bar) ? 'plannedDate' : 'startOffset',
      orderId: bar.orderId,
      barId: bar.id,
      bar,
      startClientX: event.clientX,
      previewDeltaDays: 0,
      pointerId: event.pointerId,
    });
  }

  protected onResizePointerDown(
    event: PointerEvent,
    row: { bar: GanttBar; baseSpanDays: number },
  ): void {
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

  @HostListener('document:pointermove', ['$event'])
  protected onDocumentPointerMove(event: PointerEvent): void {
    const move = this.moveSession();
    if (move && event.pointerId === move.pointerId) {
      const previewDeltaDays = snapMoveDeltaDays(
        event.clientX - move.startClientX,
        this.pxPerDay(),
      );
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

  @HostListener('document:pointerup', ['$event'])
  @HostListener('document:pointercancel', ['$event'])
  protected onDocumentPointerUp(event: PointerEvent): void {
    const move = this.moveSession();
    if (move && event.pointerId === move.pointerId) {
      this.finishMove(move, /*commit*/ true);
      return;
    }
    const session = this.resizeSession();
    if (!session || event.pointerId !== session.pointerId) return;
    this.finishResize(session, /*commit*/ true);
  }

  @HostListener('document:keydown.escape')
  protected onEscapeCancel(): void {
    const move = this.moveSession();
    if (move) {
      this.finishMove(move, /*commit*/ false);
      return;
    }
    const session = this.resizeSession();
    if (!session) return;
    this.finishResize(session, /*commit*/ false);
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
    session: {
      barId: string;
      bar: GanttBar;
      baseDays: number;
      previewDays: number;
      pointerId: number;
    },
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

  protected fill(workTypeId: string, hue?: number | null): string {
    return workTypeOklch(workTypeId, 0.12, 0.72, hue);
  }

  protected statusLabel(s: OrderStatus): string {
    return ORDER_STATUS_LABELS[s] ?? s;
  }

  protected statusPip(s: OrderStatus): string {
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
  protected labelTitle(b: GanttBar): string {
    if (isSummaryBar(b)) {
      return [b.orderNumber, this.statusLabel(b.orderStatus), `${b.startDate}→${b.endDate}`]
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

  protected barTitle(b: GanttBar): string {
    const head = this.labelTitle(b);
    if (b.noTerm) return `${head} — без срока`;
    if (isSummaryBar(b)) return `${head} · сводно ${b.days}д`.trim();
    return `${head} · ${b.startDate}→${b.endDate} · ${b.days}д`.trim();
  }

  protected barAriaLabel(b: GanttBar): string {
    const base = this.barTitle(b);
    if (!this.canMoveBar(b)) return base;
    if (isSummaryBar(b)) return `${base} · Сдвинуть начало заказа`;
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

function utcDow(dateOnly: string): number {
  const [y, m, d] = dateOnly.split('-').map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!)).getUTCDay();
}

function shortDay(dateOnly: string): string {
  const [, m, d] = dateOnly.split('-');
  return `${d}.${m}`;
}

function isoWeek(dateOnly: string): number {
  const [y, m, d] = dateOnly.split('-').map(Number);
  const dt = new Date(Date.UTC(y!, m! - 1, d!));
  const dayNum = dt.getUTCDay() || 7;
  dt.setUTCDate(dt.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
  return Math.ceil(((dt.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
