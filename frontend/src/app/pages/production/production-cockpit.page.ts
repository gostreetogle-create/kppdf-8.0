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
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { OrdersRailComponent } from './blocks/orders-rail.component';
import { GanttBarsComponent, type GanttEstimateDaysCommit } from './blocks/gantt-bars.component';
import { OrderInspectorComponent } from './blocks/order-inspector.component';
import { ProductionCockpitContext } from './production-cockpit.context';
import { ProductionReadFacade } from './production-read.facade';
import { PRODUCTION_SECTION_CHIPS } from './production-group-chips';
import { filterOrdersForRail, formatDateOnly, type GanttBar } from './gantt-bar.model';
import { OrdersService, type Order, type OrderStatus } from '../orders/orders.service';
import { CapabilitiesService } from '../../core/capabilities/capabilities.service';
import { extractErrorMessage } from '../../core/silent-http';
import { PiToastService } from '../../shared/ui/toast';
import { PiGroupWorkspaceComponent } from '../../shared/page/pi-group-workspace.component';
import { PiChromeToolsService } from '../../shared/chrome/pi-chrome-tools.service';
import type { PiChromeToolItem } from '../../shared/chrome/pi-chrome-tools.types';
import {
  LucideAngularModule,
  CalendarDays,
  ClipboardList,
  List,
  RefreshCw,
  SlidersHorizontal,
  ZoomIn,
} from 'lucide-angular';

function isReadOnlyEstimateStatus(status: OrderStatus): boolean {
  return status === 'shipped' || status === 'delivered' || status === 'cancelled';
}

type ProductionLeftTool = 'orders' | 'filters' | null;
type ProductionRightTool = 'card' | 'scale' | null;

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
    GanttBarsComponent,
    OrderInspectorComponent,
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
              [warnings]="facade.state().warnings"
              [usedTodayFallback]="usedTodayFallback()"
              [readOnly]="readOnly()"
              [canEdit]="canEditCatalog()"
              (selectOrder)="onSelect($event)"
              (estimateDaysCommit)="onEstimateDaysCommit($event)"
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
              <button
                type="button"
                class="pi-btn pi-btn-ghost pi-focus-ring w-full mt-2"
                data-test="production-reset-filters"
                (click)="onResetFilters()"
              >
                Сброс фильтров
              </button>
            </aside>
          }

          @if (rightTool() === 'card') {
            <aside
              id="production-flyout-card"
              class="production-studio-flyout production-studio-flyout-right production-studio-flyout-card"
              data-test="production-flyout-card"
              aria-label="Карточка"
            >
              @if (inspectorOrder(); as ord) {
                <app-order-inspector
                  [order]="ord"
                  [estimateReadOnly]="readOnly()"
                  [canEditOrder]="canEditOrder()"
                  [canEditCatalog]="canEditCatalog()"
                  [workerLabels]="workerLabels()"
                  (closed)="closeInspector()"
                  (changed)="onInspectorChanged()"
                />
              } @else {
                <p class="p-4 text-sm text-muted-foreground">
                  Выберите заказ, чтобы открыть карточку.
                </p>
              }
            </aside>
          }

          @if (rightTool() === 'scale') {
            <aside
              id="production-flyout-scale"
              class="production-studio-flyout production-studio-flyout-right production-scale-flyout"
              data-test="production-flyout-scale"
              aria-label="Масштаб"
            >
              <p class="eyebrow m-0">Масштаб</p>
              <div class="flex flex-col gap-1 mt-2">
                <button
                  type="button"
                  class="pi-btn pi-btn-ghost pi-focus-ring text-left"
                  [class.pi-btn-ink]="ctx.zoom() === 'day'"
                  data-test="gantt-zoom-day"
                  (click)="ctx.setZoom('day')"
                >
                  День
                </button>
                <button
                  type="button"
                  class="pi-btn pi-btn-ghost pi-focus-ring text-left"
                  [class.pi-btn-ink]="ctx.zoom() === 'week'"
                  data-test="gantt-zoom-week"
                  (click)="ctx.setZoom('week')"
                >
                  Неделя
                </button>
                <button
                  type="button"
                  class="pi-btn pi-btn-ghost pi-focus-ring text-left"
                  data-test="gantt-fit"
                  (click)="onFitHorizon()"
                >
                  Весь горизонт
                </button>
              </div>
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
        background: transparent;
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
      .production-studio-flyout-card {
        width: min(28rem, calc(100% - 1rem));
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
  protected readonly cardIcon = ClipboardList;
  protected readonly todayIcon = CalendarDays;
  protected readonly scaleIcon = ZoomIn;
  protected readonly ctx = inject(ProductionCockpitContext);
  protected readonly facade = inject(ProductionReadFacade);
  private readonly auth = inject(AuthService);
  private readonly caps = inject(CapabilitiesService);
  private readonly ordersApi = inject(OrdersService);
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
  protected readonly inspectorOpen = signal(false);
  /** HUB-303: RU hint when ?orderId= is unknown. */
  protected readonly orderIdHint = signal<string | null>(null);

  /** Shell tool state; buttons live in app-chrome-rail (TZ-UX-323). */
  protected readonly leftTool = signal<ProductionLeftTool>(null);
  protected readonly rightTool = signal<ProductionRightTool>(null);

  protected readonly canEditOrder = computed(() => {
    const role = this.auth.user()?.role;
    return role === 'admin' || role === 'manager';
  });

  /** Catalog / order estimate days — production:write (admin * passes). */
  protected readonly canEditCatalog = computed(() => this.caps.hasAny(['production:write']));

  protected readonly inspectorOrder = computed(() => {
    if (!this.inspectorOpen()) return null;
    const id = this.ctx.selectedOrderId();
    if (!id) return null;
    return this.orders().find((o) => o._id === id) ?? null;
  });

  constructor() {
    effect(() => {
      // Track active flyout state for chrome button .is-active / aria-expanded.
      void this.leftTool();
      void this.rightTool();
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
    if (this.inspectorOpen()) this.closeInspector();
  }

  protected async onSelect(id: string): Promise<void> {
    this.ctx.selectOrder(id);
    this.inspectorOpen.set(true);
    this.closeFlyouts();
    this.rightTool.set('card');
    const order = this.orders().find((o) => o._id === id);
    if (!order) return;
    this.readOnly.set(isReadOnlyEstimateStatus(order.status));
    await this.applyBars([order]);
  }

  protected async onSelectAll(): Promise<void> {
    this.ctx.selectOrder(null);
    this.inspectorOpen.set(false);
    this.closeFlyouts();
    this.readOnly.set(false);
    await this.applyFilteredActive();
  }

  protected closeInspector(): void {
    this.inspectorOpen.set(false);
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

  protected openCardTool(event?: Event): void {
    this.rememberToolButton(event);
    this.inspectorOpen.set(Boolean(this.ctx.selectedOrderId()));
    this.rightTool.set('card');
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
    if (this.leftTool() || this.rightTool()) this.closeFlyouts();
  }

  private rememberToolButton(event?: Event): void {
    const target = event?.target;
    this.lastToolButton = target instanceof HTMLElement ? target : null;
  }

  private syncChromeTools(): void {
    const left = this.leftTool();
    const right = this.rightTool();
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
        ariaLabel: 'Фильтры',
        title: 'Фильтры',
        icon: this.filtersIcon,
        active: left === 'filters',
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
        id: 'card',
        side: 'right',
        ariaLabel: 'Карточка',
        title: 'Карточка',
        icon: this.cardIcon,
        active: right === 'card',
        ariaExpanded: right === 'card',
        ariaControls: 'production-flyout-card',
        order: 1,
        onClick: (e) => this.openCardTool(e),
      },
      {
        id: 'today',
        side: 'right',
        ariaLabel: 'Сегодня',
        title: 'Сегодня',
        icon: this.todayIcon,
        order: 2,
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
        order: 3,
        onClick: (e) => this.toggleRightTool('scale', e),
      },
    ];
    this.chromeTools.setTools(CHROME_OWNER, items);
  }

  protected async onFiltersChanged(): Promise<void> {
    if (this.ctx.selectedOrderId()) return;
    await this.applyFilteredActive();
  }

  protected async onInspectorChanged(): Promise<void> {
    await this.reloadOrdersKeepingSelection();
  }

  /** TZ-PRODUCTION-311 — right-edge resize → order override only (never WorkType catalog). */
  protected async onEstimateDaysCommit(ev: GanttEstimateDaysCommit): Promise<void> {
    if (!this.canEditCatalog()) return;
    const days = Math.max(1, Math.floor(ev.days));
    const res = await firstValueFrom(
      this.ordersApi.patchEstimateDays(ev.orderId, {
        orderItemIndex: ev.orderItemIndex,
        moduleId: ev.moduleId,
        workTypeId: ev.workTypeId,
        days,
      }),
    );
    if (!res.ok) {
      this.toast.error(extractErrorMessage(res.error));
      return;
    }
    this.toast.success('Дни оценки обновлены для этого заказа');
    await this.reloadOrdersKeepingSelection();
  }

  protected async onRefresh(event?: Event): Promise<void> {
    this.rememberToolButton(event);
    await this.reloadOrdersKeepingSelection();
  }

  protected async onResetFilters(): Promise<void> {
    this.ctx.resetFilters();
    if (this.ctx.selectedOrderId()) return;
    await this.applyFilteredActive();
  }

  /** Ensure «today» lies inside the visible range (does not change bars). */
  protected onToday(event?: Event): void {
    this.rememberToolButton(event);
    this.closeFlyouts();
    const today = formatDateOnly(new Date());
    if (today < this.rangeStart()) this.rangeStart.set(addDays(today, -2));
    if (today > this.rangeEnd()) this.rangeEnd.set(addDays(today, 14));
  }

  /** Re-fit timeline to current bars (same logic as after load). */
  protected async onFitHorizon(): Promise<void> {
    const id = this.ctx.selectedOrderId();
    if (id) {
      const order = this.orders().find((o) => o._id === id);
      if (order) {
        await this.applyBars([order]);
        return;
      }
    }
    await this.applyFilteredActive();
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
        this.readOnly.set(isReadOnlyEstimateStatus(order.status));
        await this.applyBars([order]);
        return;
      }
    }
    await this.applyFilteredActive();
  }

  private async applyFilteredActive(): Promise<void> {
    // Same filter function as rail — never hardcode activeOnly:true here.
    const filtered = filterOrdersForRail(this.orders(), {
      activeOnly: this.ctx.activeOnly(),
      search: this.ctx.search(),
      selectedOrderId: null,
      priority: this.ctx.priorityFilter(),
      dateFrom: this.ctx.dateFrom(),
      dateTo: this.ctx.dateTo(),
    });
    await this.applyBars(filtered);
  }

  private async applyBars(target: Order[]): Promise<void> {
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
    const paddedStart = minDate(start, defaultRangeStart());
    const paddedEnd = maxDate(addDays(end, 1), defaultRangeEnd());
    this.rangeStart.set(paddedStart);
    this.rangeEnd.set(paddedEnd);
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

function minDate(a: string, b: string): string {
  return a < b ? a : b;
}

function maxDate(a: string, b: string): string {
  return a > b ? a : b;
}
