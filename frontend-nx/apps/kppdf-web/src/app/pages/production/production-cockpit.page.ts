/**
 * TZ-NX-GANTT-G3-TREE-CASCADE — page port (shell + Gantt + flyouts).
 *
 * 1:1 port of legacy `frontend/src/app/pages/production/production-cockpit.page.ts`
 * (write-path handlers stubbed for G5) with NX shell integration:
 * - shell tools via ShellToolRailService (NX equivalent of PiChromeToolsService);
 * - services/caps/auth/toast from `@kppdf/data-access` / `@kppdf/ui/toast`;
 * - the flyouts (Заказы / Фильтры) render as studio overlays, not chrome-rail drawers.
 *
 * `ProductionReadFacade` is provisioned on the route (see app.routes.ts) so tests
 * can substitute it at the TestBed level; the UI context stays component-local.
 */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, type Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AuthService,
  CapabilitiesService,
  PiOrdersService,
  PiWorkTypesService,
  type Order,
  type Person,
  type OrderPriority,
  type OrderStatus,
} from '@kppdf/data-access';
import type { SilentResult } from '@kppdf/util-http';
import { PiToastService } from '@kppdf/ui/toast';
import {
  CalendarDays,
  Filter,
  List,
  LucideAngularModule,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-angular';
import { OrdersRailComponent } from './blocks/orders-rail.component';
import { ShellToolRailService } from '../../layout/shell-tool-rail.service';
import { promptCatalogDaysChange } from './blocks/order-inspector.component';
import {
  GanttBarsComponent,
  type GanttCatalogDaysRequest,
  type GanttEstimateDaysCommit,
  type GanttOrderMetaCommit,
  type GanttOrderMetaView,
  type GanttPlannedDateMoveCommit,
  type GanttStartOffsetCommit,
  type GanttWorkerAssignmentCommit,
} from './blocks/gantt-bars.component';
import {
  ProductionCockpitContext,
  type GanttGroupBy,
} from './production-cockpit.context';
import { ProductionReadFacade } from './production-read.facade';
import {
  addCalendarDays,
  applyOptimisticEstimateDays,
  applyOptimisticOrderMeta,
  applyOptimisticPlannedDateShift,
  applyOptimisticStartOffset,
  cloneGanttState,
  filterOrdersForRail,
  formatDateOnly,
  ganttSkipToastRu,
  isHardFrozenOrderStatus,
  resolveVisualAnchor,
  summarizeUnassignedGanttWork,
  type GanttBar,
} from './gantt-bar.model';

type ProductionLeftTool = 'orders' | 'filters' | null;

function addDays(dateOnly: string, days: number): string {
  return formatDateOnly(addCalendarDays(new Date(dateOnly + 'T12:00:00'), days));
}

function dayDiffDateOnly(a: string, b: string): number {
  const pa = a.split('-').map(Number);
  const pb = b.split('-').map(Number);
  const da = Date.UTC(pa[0]!, pa[1]! - 1, pa[2]!);
  const db = Date.UTC(pb[0]!, pb[1]! - 1, pb[2]!);
  return Math.round((db - da) / 86400000);
}

function minDate(a: string, b: string): string {
  return a < b ? a : b;
}

function maxDate(a: string, b: string): string {
  return a > b ? a : b;
}

function defaultRangeStart(): string {
  return addDays(formatDateOnly(new Date()), -2);
}

function defaultRangeEnd(): string {
  return addDays(formatDateOnly(new Date()), 14);
}

function toDateInput(value: string | undefined | null): string {
  if (!value) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : '';
}

@Component({
  selector: 'pi-production-cockpit-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ProductionCockpitContext],
  imports: [LucideAngularModule, OrdersRailComponent, GanttBarsComponent],
  template: `
    <div class="production-cockpit" data-test="production-cockpit">
      @if (facade.state().error) {
        <div
          role="alert"
          class="px-4 py-1.5 text-[13px] text-destructive border-b hairline bg-paper"
          data-test="production-error"
        >
          {{ facade.state().error }}
        </div>
      }

      @if (orderIdHint(); as hint) {
        <div
          role="status"
          class="px-4 py-1.5 text-[13px] text-muted-foreground border-b hairline bg-paper"
          data-test="production-order-id-hint"
        >
          {{ hint }}
        </div>
      }

      <div class="production-studio-body" data-test="production-studio-body">
        <main class="production-studio-center" data-test="gantt-main" (click)="onMainClick()">
          @if (facade.state().loading) {
            <div
              class="absolute inset-0 z-10 flex items-center justify-center text-[13px] text-muted-foreground bg-paper/70"
              data-test="cockpit-loading"
            >
              Считаем оценку…
            </div>
          }
          <app-gantt-bars
            [bars]="bars()"
            [rangeStart]="rangeStart()"
            [rangeEnd]="rangeEnd()"
            [zoom]="ctx.zoom()"
            [scrollRequest]="scrollRequest()"
            [warnings]="facade.state().warnings"
            [usedTodayFallback]="usedTodayFallback()"
            [readOnly]="readOnly()"
            [canEdit]="canEditCatalog()"
            [expandedOrderIds]="ctx.expandedOrderIds()"
            [expandedProductIds]="ctx.expandedProductIds()"
            [expandedModuleIds]="ctx.expandedModuleIds()"
            [expandedWorkerIds]="ctx.expandedWorkerIds()"
            [expandedWorkerModuleIds]="ctx.expandedWorkerModuleIds()"
            [expandedWorkBarId]="ctx.expandedWorkBarId()"
            [groupByWorkers]="groupBy() === 'workers'"
            [workerCandidates]="workerCandidates()"
            [workerAssignmentSaving]="workerAssignmentSaving()"
            [highlightOrderId]="metaHighlightOrderId()"
            [orderMeta]="orderMetaView()"
            [canEditOrder]="canEditOrder()"
            (orderLabelClick)="onOrderLabelClick($event)"
            (toggleExpand)="onToggleExpand($event)"
            (toggleWorkDetail)="onToggleWorkDetail($event)"
            (dismissCanvas)="onDismissCanvas()"
            (zoomChange)="ctx.setZoom($event)"
            (groupByChange)="groupBy.set($event)"
            (fit)="onFitHorizon()"
            (estimateDaysCommit)="onEstimateDaysCommit($event)"
            (workerAssignmentCommit)="onWorkerAssignmentCommit($event)"
            (catalogDaysRequest)="onCatalogDaysRequest($event)"
            (plannedDateMoveCommit)="onPlannedDateMoveCommit($event)"
            (startOffsetCommit)="onStartOffsetCommit($event)"
            (orderMetaCommit)="onOrderMetaCommit($event)"
          />
        </main>

        @if (leftTool()) {
          <button
            type="button"
            class="production-studio-backdrop"
            aria-label="Закрыть панель"
            data-test="production-flyout-backdrop"
            (click)="closeFlyouts()"
          ></button>
        }

        @if (leftTool() === 'orders') {
          <aside
            id="production-flyout-orders"
            class="production-studio-flyout production-studio-flyout-left"
            data-test="production-flyout-orders"
            aria-label="Заказы"
          >
            <app-orders-rail
              [orders]="orders()"
              [collapsed]="false"
              [showList]="true"
              [showFilters]="false"
              [thumbs]="orderThumbs()"
              [noGanttOrderIds]="noGanttOrderIds()"
              (select)="onSelect($event)"
              (selectAll)="onSelectAll()"
              (filtersChanged)="onFiltersChanged()"
              (expandRail)="toggleLeftTool('orders')"
            />
          </aside>
        }

        @if (leftTool() === 'filters') {
          <aside
            id="production-flyout-filters"
            class="production-studio-flyout production-studio-flyout-left production-studio-flyout-filters"
            data-test="production-flyout-filters"
            aria-label="Фильтры"
          >
            <app-orders-rail
              [orders]="orders()"
              [collapsed]="false"
              [showList]="false"
              [showFilters]="true"
              [thumbs]="orderThumbs()"
              [noGanttOrderIds]="noGanttOrderIds()"
              (select)="onSelect($event)"
              (selectAll)="onSelectAll()"
              (filtersChanged)="onFiltersChanged()"
              (expandRail)="toggleLeftTool('filters')"
            />
          </aside>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: calc(100dvh - var(--header-h, 3.5rem));
        min-height: 0;
        overflow: hidden;
      }
      .production-cockpit {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
        overflow: hidden;
      }
      .production-studio-body {
        position: relative;
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }
      .production-studio-center {
        position: relative;
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 0;
        min-height: 0;
        overflow: hidden;
      }
      .production-studio-backdrop {
        position: absolute;
        inset: 0;
        z-index: 10;
        border: 0;
        padding: 0;
        background: oklch(0.22 0.02 260 / 0.18);
        cursor: default;
      }
      .production-studio-flyout {
        position: absolute;
        top: 0.5rem;
        z-index: 20;
        width: min(22rem, calc(100% - 1rem));
        max-height: calc(100% - 1rem);
        overflow: auto;
        padding: 0.75rem;
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        background: var(--color-paper-raised, var(--color-paper));
      }
      .production-studio-flyout-left {
        left: 0;
      }
      .production-studio-flyout-filters {
        width: min(20rem, calc(100% - 1rem));
      }
      @media (max-width: 1279px) {
        .production-studio-flyout {
          width: min(22rem, calc(100% - 1rem));
          max-width: calc(100vw - 1rem);
        }
        .production-studio-flyout-left {
          left: 0.5rem;
        }
      }
    `,
  ],
})
export class ProductionCockpitPage {
  protected readonly ordersIcon = List;
  protected readonly filtersIcon = SlidersHorizontal;
  protected readonly refreshIcon = RefreshCw;
  protected readonly todayIcon = CalendarDays;
  protected readonly ctx = inject(ProductionCockpitContext);
  protected readonly facade = inject(ProductionReadFacade);
  private readonly auth = inject(AuthService);
  private readonly caps = inject(CapabilitiesService);
  private readonly ordersApi = inject(PiOrdersService);
  private readonly workTypesApi = inject(PiWorkTypesService);
  private readonly toast = inject(PiToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly shellTools = inject(ShellToolRailService);

  protected readonly orders = signal<Order[]>([]);
  protected readonly bars = signal<GanttBar[]>([]);
  /** TZ-PRODUCTION-353 — unassigned WT names for Gantt banner (also computed in gantt-bars). */
  protected readonly unassignedGanttWork = computed(() => summarizeUnassignedGanttWork(this.bars()));
  protected readonly rangeStart = signal(defaultRangeStart());
  protected readonly rangeEnd = signal(defaultRangeEnd());
  protected readonly usedTodayFallback = signal(false);
  protected readonly readOnly = signal(false);
  /** TZ-GANTT-401 — row grouping mode (По заказам | По рабочим). */
  protected readonly groupBy = signal<GanttGroupBy>('orders');
  protected readonly workerLabels = signal<ReadonlyMap<string, string>>(new Map());
  protected readonly workerCandidates = signal<ReadonlyMap<string, readonly Person[]>>(new Map());
  protected readonly workerAssignmentSaving = signal(false);
  protected readonly orderThumbs = signal<ReadonlyMap<string, string>>(new Map());
  /** HUB-303: RU hint when ?orderId= is unknown. */
  protected readonly orderIdHint = signal<string | null>(null);
  /** Deep-link return — visible only when arriving from the desk. */
  private readonly fromDesk = signal(false);
  protected readonly returnOrderId = signal<string | null>(null);
  protected readonly returnLink = computed<Record<string, string> | null>(() =>
    this.fromDesk() && this.returnOrderId() ? { orderId: this.returnOrderId() as string } : null,
  );
  /** Monotonic command for the Gantt to scroll after a range change. */
  protected readonly scrollRequest = signal<{
    target: 'today' | 'start' | 'bar';
    nonce: number;
    barId?: string;
  } | null>(null);
  private scrollNonce = 0;
  /** TZ-PRODUCTION-333 — block overlapping drag PATCHes per order (G5 wires the writes). */
  private readonly ganttWriteInFlight = new Set<string>();

  /** Shell tool state; buttons live in the NX shell tool rail. */
  protected readonly leftTool = signal<ProductionLeftTool>(null);

  protected readonly canEditOrder = computed(() => {
    const role = this.auth.user()?.role;
    return role === 'admin' || role === 'manager';
  });

  /** Catalog / order estimate days — production:write (admin * passes). */
  protected readonly canEditCatalog = computed(() => this.caps.hasAny(['production:write']));

  /** When order-meta strip is open — highlight that order on the Gantt. */
  protected readonly metaHighlightOrderId = computed(() => {
    if (!this.ctx.orderMetaOpen()) return null;
    return this.ctx.selectedOrderId();
  });

  /** TZ-PRODUCTION-336 — rail marker for orders skipped on the Gantt. */
  protected readonly noGanttOrderIds = computed(
    () => new Set(this.facade.state().ineligible.map((row) => row.orderId)),
  );

  protected readonly orderMetaView = computed((): GanttOrderMetaView | null => {
    if (!this.ctx.orderMetaOpen()) return null;
    const id = this.ctx.selectedOrderId();
    if (!id) return null;
    const order = this.orders().find((o) => o._id === id);
    if (!order) return null;
    return {
      orderId: order._id,
      number: order.number,
      status: (order.status ?? 'draft') as OrderStatus,
      priority: (order.priority ?? 'normal') as OrderPriority,
      plannedDate: toDateInput(order.plannedDate) || toDateInput(order.date),
    };
  });

  constructor() {
    effect(() => {
      // Track active flyout state for shell tool .active / aria state.
      void this.leftTool();
      void this.ctx.filtersDirty();
      // setTools reads+writes rail state — must not be effect-tracked (infinite loop).
      untracked(() => this.syncShellTools());
    });
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.fromDesk.set(params.get('from') === 'desk');
      this.returnOrderId.set(params.get('orderId'));
    });
    this.destroyRef.onDestroy(() => {
      this.shellTools.clear('production');
      this.facade.clearCaches();
    });

    void this.bootstrap();
  }

  protected onMainClick(): void {
    this.ctx.clearExpandedOrders();
    this.ctx.closeOrderMeta();
  }

  protected onDismissCanvas(): void {
    this.ctx.clearExpandedOrders();
    this.ctx.closeOrderMeta();
  }

  protected onToggleExpand(expandId: string): void {
    if (expandId.startsWith('worker-module:')) {
      this.ctx.toggleWorkerModuleExpanded(expandId);
      return;
    }
    if (expandId.startsWith('worker:')) {
      this.ctx.toggleWorkerExpanded(expandId.slice('worker:'.length));
      return;
    }
    if (expandId.startsWith('product:')) {
      this.ctx.toggleProductExpanded(expandId);
      return;
    }
    if (expandId.startsWith('module:')) {
      this.ctx.toggleModuleExpanded(expandId);
      return;
    }
    this.ctx.toggleOrderExpanded(expandId);
  }

  protected onToggleWorkDetail(barId: string): void {
    this.ctx.toggleWorkDetail(barId);
  }

  /**
   * Left summary order number (TZ-PRODUCTION-322):
   * - meta open for this order → close meta only (tree untouched)
   * - else → open meta + select (no expand/collapse)
   */
  protected async onOrderLabelClick(id: string): Promise<void> {
    const metaOpenForThis = this.ctx.orderMetaOpen() && this.ctx.selectedOrderId() === id;
    if (metaOpenForThis) {
      this.ctx.closeOrderMeta();
      return;
    }
    await this.onSelect(id);
  }

  protected async onSelect(id: string): Promise<void> {
    this.ctx.selectOrder(id);
    this.leftTool.set(null);
    this.ctx.setOrderMetaOpen(true);
    const order = this.orders().find((o) => o._id === id);
    if (!order) return;
    this.readOnly.set(isHardFrozenOrderStatus(order.status ?? 'draft'));
    // TZ-PRODUCTION-317: selection ≠ filter — keep multi-order filtered bars.
    await this.applyFilteredActive();
    this.warnIfIneligible(id);
  }

  protected async onSelectAll(): Promise<void> {
    this.ctx.selectOrder(null);
    this.ctx.closeOrderMeta();
    this.leftTool.set(null);
    this.readOnly.set(false);
    await this.applyFilteredActive();
  }

  protected toggleLeftTool(tool: Exclude<ProductionLeftTool, null>, event?: Event): void {
    this.rememberToolButton(event);
    const next = this.leftTool() === tool ? null : tool;
    this.leftTool.set(next);
  }

  protected closeFlyouts(): void {
    this.leftTool.set(null);
    this.lastToolButton?.focus();
    this.lastToolButton = null;
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.ctx.clearExpandedOrders();
    this.ctx.closeOrderMeta();
    if (this.leftTool()) {
      this.closeFlyouts();
    }
  }

  private lastToolButton: HTMLElement | null = null;

  private rememberToolButton(event?: Event): void {
    const target = event?.target;
    this.lastToolButton = target instanceof HTMLElement ? target : null;
  }

  private syncShellTools(): void {
    const left = this.leftTool();
    const dirty = this.ctx.filtersDirty();
    this.shellTools.setTools('production', {
      left: [
        {
          id: 'orders',
          side: 'left',
          ariaLabel: dirty ? 'Фильтры изменены' : 'Заказы',
          title: dirty ? 'Фильтры изменены' : 'Заказы',
          icon: this.ordersIcon,
          active: left === 'orders',
          onClick: () => this.toggleLeftTool('orders'),
        },
        {
          id: 'filters',
          side: 'left',
          ariaLabel: dirty ? 'Фильтры изменены' : 'Фильтры',
          title: dirty ? 'Фильтры изменены' : 'Фильтры',
          icon: this.filtersIcon,
          active: left === 'filters' || dirty,
          onClick: () => this.toggleLeftTool('filters'),
        },
        {
          id: 'refresh',
          side: 'left',
          ariaLabel: 'Обновить',
          title: 'Обновить',
          icon: this.refreshIcon,
          onClick: () => {
            void this.onRefresh();
          },
        },
      ],
      right: [
        {
          id: 'today',
          side: 'right',
          ariaLabel: 'Прокрутить к сегодня',
          title: 'Прокрутить к сегодня',
          icon: this.todayIcon,
          onClick: () => this.onToday(),
        },
      ],
    });
  }

  protected async onFiltersChanged(): Promise<void> {
    await this.applyFilteredActive();
  }

  /** TZ-PRODUCTION-311 — catalog button in work-detail → WorkType.days (confirm in helper). */
  protected async onWorkerAssignmentCommit(ev: GanttWorkerAssignmentCommit): Promise<void> {
    if (!this.canEditCatalog() || this.workerAssignmentSaving()) return;
    const order = this.orders().find((candidate) => candidate._id === ev.orderId);
    if (!order || isHardFrozenOrderStatus(order.status ?? 'draft')) return;
    this.workerAssignmentSaving.set(true);
    try {
      const res = await firstValueFrom(
        this.ordersApi.patchEstimateWorker(ev.orderId, {
          orderItemIndex: ev.orderItemIndex,
          moduleId: ev.moduleId,
          workTypeId: ev.workTypeId,
          workerIds: [...ev.workerIds],
        }),
      );
      if (!res.ok) {
        this.toast.error('Не удалось сохранить исполнителей');
        return;
      }
      await this.reloadOrdersKeepingSelection();
    } finally {
      this.workerAssignmentSaving.set(false);
    }
  }

  /** TZ-PRODUCTION-311 — catalog button in work-detail → WorkType.days (confirm in helper). */
  protected async onCatalogDaysRequest(ev: GanttCatalogDaysRequest): Promise<void> {
    if (!this.canEditCatalog()) return;
    const prompted = promptCatalogDaysChange(ev.currentDays);
    if (prompted === 'cancel') return;
    if (prompted === 'invalid') {
      this.toast.error('Дни: целое число ≥ 1');
      return;
    }
    const res = await firstValueFrom(this.workTypesApi.update(ev.workTypeId, { days: prompted }));
    if (!res.ok) {
      this.toast.error('Не удалось обновить норматив дней вида работ');
      return;
    }
    this.toast.success('Норматив дней вида работ обновлён (глобально)');
    this.facade.clearCaches();
    await this.reloadOrdersKeepingSelection();
  }

  /** TZ-PRODUCTION-335 — order-meta auto-save: optimistic local bars + silent PATCH. */
  protected async onOrderMetaCommit(ev: GanttOrderMetaCommit): Promise<void> {
    if (!this.canEditOrder()) return;
    const current = this.orders().find((o) => o._id === ev.orderId);
    if (!current) return;
    if (isHardFrozenOrderStatus(current.status ?? 'draft')) return;
    const snapshot = this.beginGanttOptimistic(ev.orderId);
    if (!snapshot) return;
    const next = applyOptimisticOrderMeta(this.bars(), this.orders(), ev.orderId, ev);
    this.bars.set(next.bars);
    this.orders.set(next.orders);
    const planned = ev.plannedDate.trim();
    await this.persistGanttPatch(
      ev.orderId,
      snapshot,
      this.ordersApi.update(ev.orderId, {
        priority: ev.priority,
        plannedDate: planned ? new Date(planned + 'T12:00:00').toISOString() : undefined,
      }),
    );
  }

  /** TZ-PRODUCTION-311/333 — right-edge resize → order override; optimistic local bars. */
  protected async onEstimateDaysCommit(ev: GanttEstimateDaysCommit): Promise<void> {
    if (!this.canEditCatalog()) return;
    const days = Math.max(1, Math.floor(ev.days));
    const snapshot = this.beginGanttOptimistic(ev.orderId);
    if (!snapshot) return;
    const next = applyOptimisticEstimateDays(this.bars(), this.orders(), { ...ev, days });
    this.bars.set(next.bars);
    this.orders.set(next.orders);
    await this.persistGanttPatch(
      ev.orderId,
      snapshot,
      this.ordersApi.patchEstimateDays(ev.orderId, {
        orderItemIndex: ev.orderItemIndex,
        moduleId: ev.moduleId,
        workTypeId: ev.workTypeId,
        days,
      }),
    );
  }

  /** TZ-PRODUCTION-312/333 — summary body-drag → plannedDate; optimistic local bars. */
  protected async onPlannedDateMoveCommit(ev: GanttPlannedDateMoveCommit): Promise<void> {
    if (!this.canEditOrder()) return;
    const deltaDays = Math.trunc(ev.deltaDays);
    if (deltaDays === 0) return;
    const order = this.orders().find((o) => o._id === ev.orderId);
    if (!order) return;
    if (isHardFrozenOrderStatus(order.status ?? 'draft')) return;
    const snapshot = this.beginGanttOptimistic(ev.orderId);
    if (!snapshot) return;
    const next = applyOptimisticPlannedDateShift(this.bars(), this.orders(), ev.orderId, deltaDays);
    this.bars.set(next.bars);
    this.orders.set(next.orders);
    const { anchor } = resolveVisualAnchor(order, new Date());
    const newDateOnly = addDays(formatDateOnly(anchor), deltaDays);
    this.refitRangeAfterShift(this.bars(), ev.orderId);
    await this.persistGanttPatch(
      ev.orderId,
      snapshot,
      this.ordersApi.update(ev.orderId, {
        plannedDate: new Date(newDateOnly + 'T12:00:00').toISOString(),
      }),
    );
  }

  /** TZ-PRODUCTION-316/333 — child body-drag → start offset; optimistic local bars. */
  protected async onStartOffsetCommit(ev: GanttStartOffsetCommit): Promise<void> {
    if (!this.canEditCatalog()) return;
    const deltaDays = Math.trunc(ev.deltaDays);
    if (deltaDays === 0) return;
    const order = this.orders().find((o) => o._id === ev.orderId);
    if (!order) return;
    if (isHardFrozenOrderStatus(order.status ?? 'draft')) return;
    const snapshot = this.beginGanttOptimistic(ev.orderId);
    if (!snapshot) return;
    const { anchor } = resolveVisualAnchor(order, new Date());
    const newStart = addDays(ev.startDate, deltaDays);
    const offsetDays = Math.max(0, dayDiffDateOnly(formatDateOnly(anchor), newStart));
    const next = applyOptimisticStartOffset(this.bars(), this.orders(), ev, offsetDays);
    this.bars.set(next.bars);
    this.orders.set(next.orders);
    this.refitRangeAfterShift(this.bars(), ev.orderId);
    await this.persistGanttPatch(
      ev.orderId,
      snapshot,
      this.ordersApi.patchEstimateStart(ev.orderId, {
        orderItemIndex: ev.orderItemIndex,
        moduleId: ev.moduleId,
        workTypeId: ev.workTypeId,
        offsetDays,
      }),
    );
  }

  private beginGanttOptimistic(orderId: string): { bars: GanttBar[]; orders: Order[] } | null {
    if (this.ganttWriteInFlight.has(orderId)) return null;
    const snapshot = cloneGanttState(this.bars(), this.orders());
    this.ganttWriteInFlight.add(orderId);
    return snapshot;
  }

  private restoreGanttSnapshot(snapshot: { bars: GanttBar[]; orders: Order[] }): void {
    this.bars.set(snapshot.bars);
    this.orders.set(snapshot.orders);
  }

  /** Silent PATCH after optimistic bars. Revert + error toast on fail; no success toast / reload. */
  private async persistGanttPatch(
    orderId: string,
    snapshot: { bars: GanttBar[]; orders: Order[] },
    request$: Observable<SilentResult<Order>>,
  ): Promise<void> {
    try {
      const res = await firstValueFrom(request$);
      if (!res.ok) {
        this.restoreGanttSnapshot(snapshot);
        this.toast.error('Заказ не обновлён — изменения отменены');
        return;
      }
      const updated = res.data;
      this.orders.update((list) => list.map((row) => (row._id === orderId ? updated : row)));
    } catch {
      this.restoreGanttSnapshot(snapshot);
      this.toast.error('Заказ не обновлён — изменения отменены');
    } finally {
      this.ganttWriteInFlight.delete(orderId);
    }
  }

  protected async onRefresh(): Promise<void> {
    await this.reloadOrdersKeepingSelection();
  }

  /** Ensure «today» lies inside the visible range (does not change bars). */
  protected onToday(): void {
    this.closeFlyouts();
    const today = formatDateOnly(new Date());
    if (today < this.rangeStart()) this.rangeStart.set(addDays(today, -2));
    if (today > this.rangeEnd()) this.rangeEnd.set(addDays(today, 14));
    this.requestTimelineScroll('today');
  }

  /** Re-fit current bars into a focused month-density range. */
  protected async onFitHorizon(): Promise<void> {
    this.ctx.setZoom('month');
    await this.applyFilteredActive(true);
    this.requestTimelineScroll('start');
  }

  private requestTimelineScroll(target: 'today' | 'start' | 'bar', barId?: string): void {
    this.scrollRequest.set(barId ? { target, nonce: ++this.scrollNonce, barId } : { target, nonce: ++this.scrollNonce });
  }

  /**
   * TZ-NX-GANTT-G4 — after a plannedDate / startOffset shift the range must be
   * re-derived from the optimistic bars (start may be earlier than the old range
   * start) and the moved order's row re-centered, so the viewport never «залипает»
   * справа. Write-path handlers (G5) call this after applyOptimistic*.
   */
  private refitRangeAfterShift(bars: GanttBar[], orderId: string): void {
    const orderBars = bars.filter((b) => b.orderId === orderId);
    if (!orderBars.length) return;

    let start = orderBars[0]!.startDate;
    let end = orderBars[0]!.endDate;
    for (const b of orderBars) {
      if (b.startDate < start) start = b.startDate;
      const barEnd = b.noTerm ? b.startDate : b.endDate;
      if (barEnd > end) end = barEnd;
    }

    const paddedStart = addDays(start, -1);
    const paddedEnd = addDays(end, 1);
    const widenedStart = paddedStart < this.rangeStart();
    const widenedEnd = paddedEnd > this.rangeEnd();
    if (widenedStart) this.rangeStart.set(paddedStart);
    if (widenedEnd) this.rangeEnd.set(paddedEnd);

    if (widenedStart || widenedEnd) {
      // A range change re-anchors month density so the moved row stays gridded.
      this.ctx.setZoom('month');
    }
    // In-range shift and either edge expansion both re-anchor the moved row.
    this.requestTimelineScroll('bar', orderBars[0]!.id);
  }

  /** G4/G5 — recompute range + re-anchor viewport after optimistic shifts. */
  protected handleBarsAfterShift(bars: GanttBar[], orderId: string): void {
    this.bars.set(bars);
    this.refitRangeAfterShift(bars, orderId);
  }

  /** Initial load (deep-link aware). Wired from the page spec / bootstrap. */
  async bootstrap(): Promise<void> {
    const list = await this.facade.loadOrders();
    this.orders.set(list);
    this.workerLabels.set(await this.facade.getWorkerLabelsMap());
    // Candidate workers are hydrated after the first bar build in applyBars().
    // TZ-NX-GANTT-G10 — hydrate populated catalog thumbs without blocking bars.
    void this.loadThumbs(list);
    const params = await firstValueFrom(this.route.queryParamMap);
    const orderId = (params.get('orderId') ?? '').trim();
    await this.applyInitialOrderId(orderId || null);
  }

  /** TZ-NX-GANTT-G10 — rail thumbnails hydrate in the background (bars go first). */
  private async loadThumbs(orders: Order[]): Promise<void> {
    try {
      this.orderThumbs.set(await this.facade.getOrderThumbMap(orders));
    } catch {
      // A missing/partial photo payload must never make the estimate screen fail.
      this.orderThumbs.set(new Map());
    }
  }

  /** HUB-303: deep-link `?orderId=` after orders are loaded. */
  private async applyInitialOrderId(orderId: string | null): Promise<void> {
    if (!orderId) {
      this.orderIdHint.set(null);
      await this.onSelectAll();
      return;
    }
    const found = this.orders().some((o) => o._id === orderId);
    if (found) {
      this.orderIdHint.set(null);
      await this.onSelect(orderId);
      const skip = this.facade.state().ineligible.find((row) => row.orderId === orderId);
      if (skip) {
        this.orderIdHint.set(
          `Заказ «${skip.orderNumber}» нельзя показать на Ганте: нет прямых модулей. Показаны все активные с планом.`,
        );
      }
      return;
    }
    this.orderIdHint.set(`Заказ с идентификатором «${orderId}» не найден. Показаны все активные.`);
    await this.onSelectAll();
  }

  private warnIfIneligible(orderId: string): void {
    const skip = this.facade.state().ineligible.find((row) => row.orderId === orderId);
    if (!skip) return;
    this.toast.warning(ganttSkipToastRu(skip.orderNumber, skip.productNames));
  }

  private async reloadOrdersKeepingSelection(): Promise<void> {
    this.facade.clearCaches();
    const list = await this.facade.loadOrders();
    this.orders.set(list);
    this.workerLabels.set(await this.facade.getWorkerLabelsMap());
    // Candidate workers are refreshed after bars are rebuilt in applyBars().
    // TZ-NX-GANTT-G10 — keep rail thumbs in the same non-blocking path on refresh.
    void this.loadThumbs(list);
    const id = this.ctx.selectedOrderId();
    if (id) {
      const order = list.find((o) => o._id === id);
      if (order) {
        this.readOnly.set(isHardFrozenOrderStatus(order.status ?? 'draft'));
      } else {
        this.ctx.selectOrder(null);
        this.ctx.closeOrderMeta();
        this.readOnly.set(false);
      }
    }
    // TZ-PRODUCTION-317: never collapse Gantt to the selected order alone.
    await this.applyFilteredActive();
  }

  private async applyFilteredActive(fitRange = false): Promise<void> {
    // Same filter function as rail — never hardcode activeOnly:true here.
    const filtered = filterOrdersForRail(this.orders(), {
      activeOnly: this.ctx.activeOnly(),
      search: this.ctx.search(),
      selectedOrderId: null,
      priority: this.ctx.priorityFilter(),
      dateFrom: this.ctx.dateFrom(),
      dateTo: this.ctx.dateTo(),
      counterpartyId: this.ctx.counterpartyFilter(),
    });
    await this.applyBars(filtered, fitRange);
  }

  private async applyBars(target: Order[], fitRange = false): Promise<void> {
    const built = await this.facade.loadBarsForOrders(target);
    this.bars.set(built);
    this.workerCandidates.set(
      await this.facade.getWorkerCandidatesMap(
        built.map((bar) => bar.workTypeId).filter((id) => !id.startsWith('__')),
      ),
    );
    this.usedTodayFallback.set(built.some((b) => b.usedFallbackToday));
    if (built.length === 0) {
      this.rangeStart.set(defaultRangeStart());
      this.rangeEnd.set(defaultRangeEnd());
      return;
    }
    let start = built[0]!.startDate;
    let end = built[0]!.endDate;
    for (const b of built) {
      if (b.startDate < start) start = b.startDate;
      const e = b.noTerm ? b.startDate : b.endDate;
      if (e > end) end = e;
    }
    const paddedStart = addDays(start, -1);
    const paddedEnd = addDays(end, 1);
    this.rangeStart.set(fitRange ? paddedStart : minDate(paddedStart, defaultRangeStart()));
    this.rangeEnd.set(fitRange ? paddedEnd : maxDate(paddedEnd, defaultRangeEnd()));
  }
}
