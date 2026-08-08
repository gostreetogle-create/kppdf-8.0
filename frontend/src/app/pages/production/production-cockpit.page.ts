import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { OrdersRailComponent } from './blocks/orders-rail.component';
import { GanttBarsComponent } from './blocks/gantt-bars.component';
import { OrderInspectorComponent } from './blocks/order-inspector.component';
import { ProductionCockpitContext } from './production-cockpit.context';
import { ProductionReadFacade } from './production-read.facade';
import { PRODUCTION_SECTION_CHIPS } from './production-group-chips';
import { filterOrdersForRail, formatDateOnly, type GanttBar } from './gantt-bar.model';
import type { Order, OrderStatus } from '../orders/orders.service';
import { CapabilitiesService } from '../../core/capabilities/capabilities.service';

function isReadOnlyEstimateStatus(status: OrderStatus): boolean {
  return status === 'shipped' || status === 'delivered' || status === 'cancelled';
}

/**
 * Production Cockpit — Lego shell (TZ-PRODUCTION-303 + inspector wave).
 * Docs: docs/pages/production-cockpit.page.md
 * Spec: docs/superpowers/specs/2026-08-06-production-gantt-inspector-design.md
 */
@Component({
  selector: 'app-production-cockpit-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ProductionCockpitContext, ProductionReadFacade],
  imports: [OrdersRailComponent, GanttBarsComponent, OrderInspectorComponent, RouterLink],
  template: `
    <div
      class="flex flex-col h-[calc(100dvh-3.5rem)] min-h-0 overflow-hidden"
      data-test="production-cockpit"
    >
      <header
        class="shrink-0 flex flex-wrap items-center gap-2 px-3 py-1.5 border-b hairline bg-paper"
      >
        <div class="mr-2 min-w-0">
          <p class="eyebrow text-muted-foreground m-0 pt-0.5" data-test="group-path-label">Цех</p>
          <nav
            class="group-chips flex items-center gap-1 flex-wrap pt-0.5"
            aria-label="Раздел Цех"
            data-test="group-chips"
          >
            @for (chip of chips; track chip.id) {
              <a
                [routerLink]="chip.route"
                class="group-chip inline-flex items-center gap-1 px-2.5 py-0.5
                       text-xs leading-5 rounded-sm transition-colors
                       pi-focus-ring cursor-pointer no-underline"
                [class.bg-sunrise-warm]="chip.id === 'production'"
                [class.text-paper]="chip.id === 'production'"
                [class.text-ink]="chip.id !== 'production'"
                [class.hover:bg-paper-2]="chip.id !== 'production'"
                [attr.aria-current]="chip.id === 'production' ? 'page' : undefined"
              >
                {{ chip.label }}
              </a>
            }
          </nav>
        </div>
        <span class="text-xs text-muted-foreground">Кокпит · план-оценка</span>
        <button
          type="button"
          class="pi-btn pi-btn-ghost pi-focus-ring !text-xs !px-2 !py-1"
          (click)="ctx.toggleRailCollapsed()"
          [attr.aria-pressed]="ctx.railCollapsed()"
          data-test="rail-collapse-toggle"
          title="Свернуть/развернуть список заказов"
        >
          {{ ctx.railCollapsed() ? '☰ заказы' : '« список' }}
        </button>
        <span class="flex-1"></span>
        <div class="flex flex-wrap items-center gap-1 text-xs">
          <button
            type="button"
            class="pi-btn pi-btn-ghost pi-focus-ring !text-xs !px-2 !py-1"
            (click)="onRefresh()"
            data-test="gantt-refresh"
            title="Обновить оценку"
          >
            Обновить
          </button>
          <button
            type="button"
            class="pi-btn pi-btn-ghost pi-focus-ring !text-xs !px-2 !py-1"
            (click)="onResetFilters()"
            data-test="gantt-reset-filters"
            title="Сбросить поиск и фильтры"
          >
            Сброс фильтров
          </button>
          <button
            type="button"
            class="pi-btn pi-btn-ghost pi-focus-ring !text-xs !px-2 !py-1"
            (click)="onToday()"
            data-test="gantt-today"
            title="Показать сегодня в горизонте"
          >
            Сегодня
          </button>
          <button
            type="button"
            class="pi-btn pi-btn-ghost pi-focus-ring !text-xs !px-2 !py-1"
            (click)="onFitHorizon()"
            data-test="gantt-fit"
            title="Подогнать шкалу под полосы"
          >
            Весь горизонт
          </button>
          <button
            type="button"
            class="pi-btn pi-btn-ghost pi-focus-ring !text-xs !px-2 !py-1"
            [class.pi-btn-ink]="ctx.zoom() === 'day'"
            (click)="ctx.setZoom('day')"
            data-test="gantt-zoom-day"
          >
            День
          </button>
          <button
            type="button"
            class="pi-btn pi-btn-ghost pi-focus-ring !text-xs !px-2 !py-1"
            [class.pi-btn-ink]="ctx.zoom() === 'week'"
            (click)="ctx.setZoom('week')"
            data-test="gantt-zoom-week"
          >
            Неделя
          </button>
        </div>
      </header>

      @if (facade.state().error) {
        <div role="alert" class="px-4 py-2 text-sm text-destructive border-b hairline">
          {{ facade.state().error }}
        </div>
      }

      <div class="flex flex-1 min-h-0 overflow-hidden">
        <aside
          class="shrink-0 min-h-0 flex flex-col transition-[width] duration-200"
          [class.w-14]="ctx.railCollapsed()"
          [class.w-56]="!ctx.railCollapsed()"
        >
          <app-orders-rail
            [orders]="orders()"
            [collapsed]="ctx.railCollapsed()"
            [thumbs]="orderThumbs()"
            (select)="onSelect($event)"
            (selectAll)="onSelectAll()"
            (filtersChanged)="onFiltersChanged()"
            (expandRail)="ctx.setRailCollapsed(false)"
          />
        </aside>
        <main
          class="flex-1 min-w-0 min-h-0 flex flex-col relative"
          data-test="gantt-main"
          (click)="onMainClick()"
        >
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
            (selectOrder)="onSelect($event)"
          />
        </main>
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
        }
      </div>
    </div>
  `,
})
export class ProductionCockpitPage implements OnInit {
  protected readonly chips = PRODUCTION_SECTION_CHIPS;
  protected readonly ctx = inject(ProductionCockpitContext);
  protected readonly facade = inject(ProductionReadFacade);
  private readonly auth = inject(AuthService);
  private readonly caps = inject(CapabilitiesService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly orders = signal<Order[]>([]);
  protected readonly bars = signal<GanttBar[]>([]);
  protected readonly rangeStart = signal(defaultRangeStart());
  protected readonly rangeEnd = signal(defaultRangeEnd());
  protected readonly usedTodayFallback = signal(false);
  protected readonly readOnly = signal(false);
  protected readonly workerLabels = signal<ReadonlyMap<string, string>>(new Map());
  protected readonly orderThumbs = signal<ReadonlyMap<string, string>>(new Map());
  protected readonly inspectorOpen = signal(false);

  protected readonly canEditOrder = computed(() => {
    const role = this.auth.user()?.role;
    return role === 'admin' || role === 'manager';
  });

  /** Catalog WorkType.days — production:write or admin/manager role (BE Roles). */
  protected readonly canEditCatalog = computed(
    () => this.canEditOrder() || this.caps.hasAny(['production:write']),
  );

  protected readonly inspectorOrder = computed(() => {
    if (!this.inspectorOpen()) return null;
    const id = this.ctx.selectedOrderId();
    if (!id) return null;
    return this.orders().find((o) => o._id === id) ?? null;
  });

  ngOnInit(): void {
    void this.bootstrap();
    this.destroyRef.onDestroy(() => this.facade.clearCaches());
  }

  protected onMainClick(): void {
    if (this.inspectorOpen()) this.closeInspector();
  }

  protected async onSelect(id: string): Promise<void> {
    this.ctx.selectOrder(id);
    this.inspectorOpen.set(true);
    const order = this.orders().find((o) => o._id === id);
    if (!order) return;
    this.readOnly.set(isReadOnlyEstimateStatus(order.status));
    await this.applyBars([order]);
  }

  protected async onSelectAll(): Promise<void> {
    this.ctx.selectOrder(null);
    this.inspectorOpen.set(false);
    this.readOnly.set(false);
    await this.applyFilteredActive();
  }

  protected closeInspector(): void {
    this.inspectorOpen.set(false);
  }

  protected async onFiltersChanged(): Promise<void> {
    if (this.ctx.selectedOrderId()) return;
    await this.applyFilteredActive();
  }

  protected async onInspectorChanged(): Promise<void> {
    await this.reloadOrdersKeepingSelection();
  }

  protected async onRefresh(): Promise<void> {
    await this.reloadOrdersKeepingSelection();
  }

  protected async onResetFilters(): Promise<void> {
    this.ctx.resetFilters();
    if (this.ctx.selectedOrderId()) return;
    await this.applyFilteredActive();
  }

  /** Ensure «today» lies inside the visible range (does not change bars). */
  protected onToday(): void {
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
