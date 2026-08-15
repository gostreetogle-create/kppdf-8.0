import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  inject,
  OnInit,
  signal,
  computed,
  effect,
  untracked,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, type Observable } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { OrdersRailComponent } from './blocks/orders-rail.component';
import { ProductionScaleControlsComponent } from './blocks/production-scale-controls.component';
import {
  GanttBarsComponent,
  type GanttCatalogDaysRequest,
  type GanttEstimateDaysCommit,
  type GanttOrderMetaCommit,
  type GanttOrderMetaView,
  type GanttPlannedDateMoveCommit,
  type GanttStartOffsetCommit,
} from './blocks/gantt-bars.component';
import { promptCatalogDaysChange } from './blocks/order-inspector.component';
import { ProductionCockpitContext } from './production-cockpit.context';
import { ProductionReadFacade } from './production-read.facade';
import { PRODUCTION_SECTION_CHIPS } from './production-group-chips';
import {
  applyOptimisticEstimateDays,
  applyOptimisticPlannedDateShift,
  applyOptimisticStartOffset,
  cloneGanttState,
  filterOrdersForRail,
  formatDateOnly,
  isHardFrozenOrderStatus,
  resolveVisualAnchor,
  type GanttBar,
} from './gantt-bar.model';
import { OrdersService, type Order, type OrderPriority } from '../orders/orders.service';
import type { SilentResult } from '../../core/silent-http';
import { WorkTypesService } from '../../shared/services/pi-work-types.service';
import { CapabilitiesService } from '../../core/capabilities/capabilities.service';
import { extractErrorMessage } from '../../core/silent-http';
import { PiToastService } from '../../shared/ui/toast';
import { PiGroupWorkspaceComponent } from '../../shared/page/pi-group-workspace.component';
import { PiChromeToolsService } from '../../shared/chrome/pi-chrome-tools.service';
import type { PiChromeToolItem } from '../../shared/chrome/pi-chrome-tools.types';
import {
  LucideAngularModule,
  CalendarDays,
  List,
  RefreshCw,
  SlidersHorizontal,
  ZoomIn,
} from 'lucide-angular';

function shopOrderWriteError(err: { error?: { message?: unknown }; message?: string }): string {
  const raw = extractErrorMessage(err as never);
  if (
    /cannot be updated/i.test(raw) ||
    /Path `siteId`/i.test(raw) ||
    /siteId is required/i.test(raw)
  ) {
    if (/siteId/i.test(raw)) {
      return 'У заказа нет площадки (siteId) — создайте объект у контрагента';
    }
    return 'Заказ в этом статусе нельзя менять состав — только план/приоритет в Цехе';
  }
  return raw;
}

type ProductionLeftTool = 'orders' | 'filters' | null;
type ProductionRightTool = 'scale' | null;

const CHROME_OWNER = 'production-cockpit';

/**
 * Production Cockpit — Lego shell (TZ-PRODUCTION-303 + inspector wave).
 * Docs: docs/pages/production-cockpit.page.md
 * Spec: docs/superpowers/specs/2026-08-06-production-gantt-inspector-design.md
 * Chrome tools: TZ-UX-323 → app-chrome-rail via PiChromeToolsService.
 */
@Component({
  selector: 'app-production-cockpit-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ProductionCockpitContext, ProductionReadFacade],
  imports: [
    PiGroupWorkspaceComponent,
    LucideAngularModule,
    OrdersRailComponent,
    ProductionScaleControlsComponent,
    GanttBarsComponent,
  ],
  template: `
    <app-pi-group-workspace [chips]="chips" activeId="production" [flushBody]="true">
      <div class="production-cockpit" data-test="production-cockpit">
        @if (facade.state().error) {
          <div role="alert" class="px-4 py-2 text-sm text-destructive border-b hairline">
            {{ facade.state().error }}
          </div>
        }

        @if (orderIdHint()) {
          <div
            role="status"
            class="px-4 py-2 text-sm text-muted-foreground border-b hairline"
            data-test="production-order-id-hint"
          >
            {{ orderIdHint() }}
          </div>
        }

        <div class="production-studio-body" data-test="production-studio-body">
          <main class="production-studio-center" data-test="gantt-main" (click)="onMainClick()">
            @if (facade.state().loading) {
              <div
                class="absolute inset-0 z-10 flex items-center justify-center text-sm text-muted-foreground bg-paper/70"
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
              [expandedWorkBarId]="ctx.expandedWorkBarId()"
              [highlightOrderId]="metaHighlightOrderId()"
              [orderMeta]="orderMetaView()"
              [canEditOrder]="canEditOrder()"
              (orderLabelClick)="onOrderLabelClick($event)"
              (toggleExpand)="onToggleExpand($event)"
              (toggleWorkDetail)="onToggleWorkDetail($event)"
              (dismissCanvas)="onDismissCanvas()"
              (estimateDaysCommit)="onEstimateDaysCommit($event)"
              (catalogDaysRequest)="onCatalogDaysRequest($event)"
              (plannedDateMoveCommit)="onPlannedDateMoveCommit($event)"
              (startOffsetCommit)="onStartOffsetCommit($event)"
              (orderMetaCommit)="onOrderMetaCommit($event)"
            />
          </main>

          @if (leftTool() || rightTool()) {
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
                (select)="onSelect($event)"
                (selectAll)="onSelectAll()"
                (filtersChanged)="onFiltersChanged()"
                (expandRail)="toggleLeftTool('filters')"
              />
            </aside>
          }

          @if (rightTool() === 'scale') {
            <aside
              id="production-flyout-scale"
              class="production-studio-flyout production-studio-flyout-right production-scale-flyout"
              data-test="production-flyout-scale"
              aria-label="Масштаб"
            >
              <app-production-scale-controls
                [zoom]="ctx.zoom()"
                (zoomChange)="ctx.setZoom($event)"
                (fit)="onFitHorizon()"
              />
            </aside>
          }
        </div>
      </div>
    </app-pi-group-workspace>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        min-height: 0;
        overflow: hidden;
      }
      .production-cockpit {
        display: flex;
        flex-direction: column;
        height: calc(100dvh - 3.5rem);
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
        background: color-mix(in oklch, var(--color-paper, #fff) 96%, transparent);
        box-shadow: var(--shadow-raised, 0 8px 24px oklch(0.2 0.02 260 / 0.12));
      }
      .production-studio-flyout-left {
        left: 0;
      }
      .production-studio-flyout-right {
        right: 0;
      }
      .production-studio-flyout-filters {
        width: min(20rem, calc(100% - 1rem));
      }
      .production-scale-flyout {
        width: 12rem;
      }
      @media (max-width: 1279px) {
        .production-studio-flyout {
          width: min(22rem, calc(100% - 1rem));
          max-width: calc(100vw - 1rem);
        }
        .production-studio-flyout-left {
          left: 0.5rem;
        }
        .production-studio-flyout-right {
          right: 0.5rem;
        }
      }
    `,
  ],
})
export class ProductionCockpitPage implements OnInit {
  protected readonly chips = PRODUCTION_SECTION_CHIPS;
  protected readonly ordersIcon = List;
  protected readonly filtersIcon = SlidersHorizontal;
  protected readonly refreshIcon = RefreshCw;
  protected readonly todayIcon = CalendarDays;
  protected readonly scaleIcon = ZoomIn;
  protected readonly ctx = inject(ProductionCockpitContext);
  protected readonly facade = inject(ProductionReadFacade);
  private readonly auth = inject(AuthService);
  private readonly caps = inject(CapabilitiesService);
  private readonly ordersApi = inject(OrdersService);
  private readonly workTypesApi = inject(WorkTypesService);
  private readonly toast = inject(PiToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly chromeTools = inject(PiChromeToolsService);
  private lastToolButton: HTMLElement | null = null;

  protected readonly orders = signal<Order[]>([]);
  protected readonly bars = signal<GanttBar[]>([]);
  protected readonly rangeStart = signal(defaultRangeStart());
  protected readonly rangeEnd = signal(defaultRangeEnd());
  protected readonly usedTodayFallback = signal(false);
  protected readonly readOnly = signal(false);
  protected readonly workerLabels = signal<ReadonlyMap<string, string>>(new Map());
  protected readonly orderThumbs = signal<ReadonlyMap<string, string>>(new Map());
  /** HUB-303: RU hint when ?orderId= is unknown. */
  protected readonly orderIdHint = signal<string | null>(null);
  /** Monotonic command for the Gantt to scroll after a range change. */
  protected readonly scrollRequest = signal<{
    target: 'today' | 'start';
    nonce: number;
  } | null>(null);
  private scrollNonce = 0;
  /** TZ-PRODUCTION-333 — block overlapping drag PATCHes per order. */
  private readonly ganttWriteInFlight = new Set<string>();

  /** Shell tool state; buttons live in app-chrome-rail (TZ-UX-323). */
  protected readonly leftTool = signal<ProductionLeftTool>(null);
  protected readonly rightTool = signal<ProductionRightTool>(null);

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

  protected readonly orderMetaView = computed((): GanttOrderMetaView | null => {
    if (!this.ctx.orderMetaOpen()) return null;
    const id = this.ctx.selectedOrderId();
    if (!id) return null;
    const order = this.orders().find((o) => o._id === id);
    if (!order) return null;
    return {
      orderId: order._id,
      number: order.number,
      status: order.status,
      priority: (order.priority ?? 'normal') as OrderPriority,
      plannedDate: toDateInput(order.plannedDate) || toDateInput(order.date),
    };
  });

  constructor() {
    effect(() => {
      // Track active flyout state for chrome button .is-active / aria-expanded.
      void this.leftTool();
      void this.rightTool();
      void this.ctx.filtersDirty();
      // setTools reads+writes chrome byOwner — must not be effect-tracked (infinite loop).
      untracked(() => this.syncChromeTools());
    });
    this.destroyRef.onDestroy(() => {
      this.chromeTools.clear(CHROME_OWNER);
      this.facade.clearCaches();
    });
  }

  ngOnInit(): void {
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

  protected onToggleExpand(orderId: string): void {
    this.ctx.toggleOrderExpanded(orderId);
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
    this.rightTool.set(null);
    this.ctx.setOrderMetaOpen(true);
    const order = this.orders().find((o) => o._id === id);
    if (!order) return;
    this.readOnly.set(isHardFrozenOrderStatus(order.status));
    // TZ-PRODUCTION-317: selection ≠ filter — keep multi-order filtered bars.
    await this.applyFilteredActive();
  }

  protected async onSelectAll(): Promise<void> {
    this.ctx.selectOrder(null);
    this.ctx.closeOrderMeta();
    this.leftTool.set(null);
    this.rightTool.set(null);
    this.readOnly.set(false);
    await this.applyFilteredActive();
  }

  protected toggleLeftTool(tool: Exclude<ProductionLeftTool, null>, event?: Event): void {
    this.rememberToolButton(event);
    const next = this.leftTool() === tool ? null : tool;
    this.leftTool.set(next);
    this.rightTool.set(null);
  }

  protected toggleRightTool(tool: Exclude<ProductionRightTool, null>, event?: Event): void {
    this.rememberToolButton(event);
    const next = this.rightTool() === tool ? null : tool;
    this.rightTool.set(next);
    this.leftTool.set(null);
  }

  protected closeFlyouts(): void {
    this.leftTool.set(null);
    this.rightTool.set(null);
    this.lastToolButton?.focus();
    this.lastToolButton = null;
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.ctx.clearExpandedOrders();
    this.ctx.closeOrderMeta();
    if (this.leftTool() || this.rightTool()) {
      this.closeFlyouts();
    }
  }

  private rememberToolButton(event?: Event): void {
    const target = event?.target;
    this.lastToolButton = target instanceof HTMLElement ? target : null;
  }

  private syncChromeTools(): void {
    const left = this.leftTool();
    const right = this.rightTool();
    const dirty = this.ctx.filtersDirty();
    const items: PiChromeToolItem[] = [
      {
        id: 'orders',
        side: 'left',
        ariaLabel: 'Заказы',
        title: 'Заказы',
        icon: this.ordersIcon,
        active: left === 'orders',
        ariaExpanded: left === 'orders',
        ariaControls: 'production-flyout-orders',
        order: 1,
        onClick: (e) => this.toggleLeftTool('orders', e),
      },
      {
        id: 'filters',
        side: 'left',
        ariaLabel: dirty ? 'Фильтры изменены' : 'Фильтры',
        title: dirty ? 'Фильтры изменены' : 'Фильтры',
        icon: this.filtersIcon,
        active: left === 'filters' || dirty,
        ariaExpanded: left === 'filters',
        ariaControls: 'production-flyout-filters',
        order: 2,
        onClick: (e) => this.toggleLeftTool('filters', e),
      },
      {
        id: 'refresh',
        side: 'left',
        ariaLabel: 'Обновить',
        title: 'Обновить',
        icon: this.refreshIcon,
        order: 3,
        onClick: (e) => {
          void this.onRefresh(e);
        },
      },
      {
        id: 'today',
        side: 'right',
        ariaLabel: 'Прокрутить к сегодня',
        title: 'Прокрутить к сегодня',
        icon: this.todayIcon,
        order: 1,
        onClick: (e) => this.onToday(e),
      },
      {
        id: 'scale',
        side: 'right',
        ariaLabel: 'Масштаб',
        title: 'Масштаб',
        icon: this.scaleIcon,
        active: right === 'scale',
        ariaExpanded: right === 'scale',
        ariaControls: 'production-flyout-scale',
        order: 2,
        onClick: (e) => this.toggleRightTool('scale', e),
      },
    ];
    this.chromeTools.setTools(CHROME_OWNER, items);
  }

  protected async onFiltersChanged(): Promise<void> {
    await this.applyFilteredActive();
  }

  /** TZ-PRODUCTION-322 — order-meta save → PATCH orders/:id (priority + plannedDate). */
  protected async onOrderMetaCommit(ev: GanttOrderMetaCommit): Promise<void> {
    if (!this.canEditOrder()) return;
    const current = this.orders().find((o) => o._id === ev.orderId);
    if (current && isHardFrozenOrderStatus(current.status)) return;
    const planned = ev.plannedDate.trim();
    const res = await firstValueFrom(
      this.ordersApi.update(ev.orderId, {
        priority: ev.priority,
        plannedDate: planned ? new Date(planned + 'T12:00:00').toISOString() : undefined,
      }),
    );
    if (!res.ok) {
      this.toast.error(shopOrderWriteError(res.error));
      return;
    }
    this.toast.success('Заказ обновлён');
    await this.reloadOrdersKeepingSelection();
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

  /** TZ-PRODUCTION-321 — work-detail catalog button → WorkType.days (confirm in helper). */
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
      this.toast.error(shopOrderWriteError(res.error));
      return;
    }
    this.toast.success('Норматив дней вида работ обновлён (глобально)');
    this.facade.clearCaches();
    await this.reloadOrdersKeepingSelection();
  }

  /** TZ-PRODUCTION-312/333 — body-drag → plannedDate; optimistic local bars. */
  protected async onPlannedDateMoveCommit(ev: GanttPlannedDateMoveCommit): Promise<void> {
    if (!this.canEditOrder()) return;
    const deltaDays = Math.trunc(ev.deltaDays);
    if (deltaDays === 0) return;
    const order = this.orders().find((o) => o._id === ev.orderId);
    if (!order) return;
    if (isHardFrozenOrderStatus(order.status)) return;
    const snapshot = this.beginGanttOptimistic(ev.orderId);
    if (!snapshot) return;
    const next = applyOptimisticPlannedDateShift(this.bars(), this.orders(), ev.orderId, deltaDays);
    this.bars.set(next.bars);
    this.orders.set(next.orders);
    const { anchor } = resolveVisualAnchor(order, new Date());
    const newDateOnly = addDays(formatDateOnly(anchor), deltaDays);
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
    if (isHardFrozenOrderStatus(order.status)) return;
    const snapshot = this.beginGanttOptimistic(ev.orderId);
    if (!snapshot) return;
    const { anchor } = resolveVisualAnchor(order, new Date());
    const newStart = addDays(ev.startDate, deltaDays);
    const offsetDays = Math.max(0, dayDiffDateOnly(formatDateOnly(anchor), newStart));
    const next = applyOptimisticStartOffset(this.bars(), this.orders(), ev, offsetDays);
    this.bars.set(next.bars);
    this.orders.set(next.orders);
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

  protected async onRefresh(event?: Event): Promise<void> {
    this.rememberToolButton(event);
    await this.reloadOrdersKeepingSelection();
  }

  protected async onResetFilters(): Promise<void> {
    this.ctx.resetFilters();
    await this.applyFilteredActive();
  }

  /** Ensure «today» lies inside the visible range (does not change bars). */
  protected onToday(event?: Event): void {
    this.rememberToolButton(event);
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

  private requestTimelineScroll(target: 'today' | 'start'): void {
    this.scrollRequest.set({ target, nonce: ++this.scrollNonce });
  }

  private async bootstrap(): Promise<void> {
    const list = await this.facade.loadOrders();
    this.orders.set(list);
    this.workerLabels.set(await this.facade.getWorkerLabelsMap());
    this.orderThumbs.set(await this.facade.getOrderThumbMap(list));
    const params = await firstValueFrom(this.route.queryParamMap);
    const orderId = (params.get('orderId') ?? '').trim();
    await this.applyInitialOrderId(orderId || null);
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
      return;
    }
    this.orderIdHint.set(`Заказ с идентификатором «${orderId}» не найден. Показаны все активные.`);
    await this.onSelectAll();
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
        this.toast.error(shopOrderWriteError(res.error));
        return;
      }
      const updated = res.data;
      this.orders.update((list) => list.map((row) => (row._id === orderId ? updated : row)));
    } catch (err) {
      this.restoreGanttSnapshot(snapshot);
      this.toast.error(shopOrderWriteError(err as { message?: string }));
    } finally {
      this.ganttWriteInFlight.delete(orderId);
    }
  }

  private async reloadOrdersKeepingSelection(): Promise<void> {
    this.facade.clearCaches();
    const list = await this.facade.loadOrders();
    this.orders.set(list);
    this.workerLabels.set(await this.facade.getWorkerLabelsMap());
    this.orderThumbs.set(await this.facade.getOrderThumbMap(list));
    const id = this.ctx.selectedOrderId();
    if (id) {
      const order = list.find((o) => o._id === id);
      if (order) {
        this.readOnly.set(isHardFrozenOrderStatus(order.status));
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

function defaultRangeStart(): string {
  return addDays(formatDateOnly(new Date()), -2);
}

function defaultRangeEnd(): string {
  return addDays(formatDateOnly(new Date()), 14);
}

function addDays(dateOnly: string, days: number): string {
  const [y, m, d] = dateOnly.split('-').map(Number);
  const dt = new Date(y!, m! - 1, d!);
  dt.setDate(dt.getDate() + days);
  return formatDateOnly(dt);
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

function toDateInput(value: string | undefined | null): string {
  if (!value) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : '';
}
