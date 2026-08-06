import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { OrdersRailComponent } from './blocks/orders-rail.component';
import { GanttBarsComponent } from './blocks/gantt-bars.component';
import { ProductionCockpitContext } from './production-cockpit.context';
import { ProductionReadFacade } from './production-read.facade';
import {
  ACTIVE_COMMERCIAL_ORDER_STATUSES,
  formatDateOnly,
  isActiveCommercialOrderStatus,
  type GanttBar,
} from './gantt-bar.model';
import type { Order, OrderStatus } from '../orders/orders.service';

function isReadOnlyEstimateStatus(status: OrderStatus): boolean {
  return status === 'shipped' || status === 'delivered' || status === 'cancelled';
}

/**
 * Production Cockpit — Lego shell (TZ-PRODUCTION-303).
 * Docs: docs/pages/production-cockpit.page.md
 */
@Component({
  selector: 'app-production-cockpit-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ProductionCockpitContext, ProductionReadFacade],
  imports: [OrdersRailComponent, GanttBarsComponent],
  template: `
    <div
      class="flex flex-col h-[calc(100dvh-3.5rem)] min-h-0 overflow-hidden"
      data-test="production-cockpit"
    >
      <header
        class="shrink-0 flex flex-wrap items-center gap-3 px-4 py-2 border-b hairline bg-paper"
      >
        <h1 class="text-base font-semibold text-ink">Производство</h1>
        <span class="text-xs text-muted-foreground">Кокпит · план-оценка</span>
        <span class="flex-1"></span>
        <div class="flex items-center gap-1 text-xs">
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
        <aside class="w-64 shrink-0 min-h-0 flex flex-col">
          <app-orders-rail
            [orders]="orders()"
            (select)="onSelect($event)"
            (selectAll)="onSelectAll()"
          />
        </aside>
        <main class="flex-1 min-w-0 min-h-0 flex flex-col">
          @if (facade.state().loading) {
            <div class="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              Считаем оценку…
            </div>
          } @else if (!showBoard()) {
            <div
              class="flex-1 flex items-center justify-center p-8 text-sm text-muted-foreground text-center"
              data-test="cockpit-empty"
            >
              Выберите заказ или покажите все
            </div>
          } @else {
            <app-gantt-bars
              [bars]="bars()"
              [rangeStart]="rangeStart()"
              [rangeEnd]="rangeEnd()"
              [warnings]="facade.state().warnings"
              [usedTodayFallback]="usedTodayFallback()"
              [readOnly]="readOnly()"
            />
          }
        </main>
      </div>
    </div>
  `,
})
export class ProductionCockpitPage implements OnInit {
  protected readonly ctx = inject(ProductionCockpitContext);
  protected readonly facade = inject(ProductionReadFacade);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly orders = signal<Order[]>([]);
  protected readonly bars = signal<GanttBar[]>([]);
  protected readonly rangeStart = signal(formatDateOnly(new Date()));
  protected readonly rangeEnd = signal(formatDateOnly(new Date()));
  protected readonly usedTodayFallback = signal(false);
  protected readonly readOnly = signal(false);
  protected readonly showBoard = signal(false);

  ngOnInit(): void {
    void this.facade.loadOrders().then((list) => this.orders.set(list));
    this.destroyRef.onDestroy(() => this.facade.clearCaches());
  }

  protected async onSelect(id: string): Promise<void> {
    this.ctx.selectOrder(id);
    const order = this.orders().find((o) => o._id === id);
    if (!order) return;
    this.readOnly.set(isReadOnlyEstimateStatus(order.status));
    await this.applyBars([order]);
  }

  protected async onSelectAll(): Promise<void> {
    this.ctx.selectOrder(null);
    this.readOnly.set(false);
    const active = this.orders().filter((o) => {
      if (!isActiveCommercialOrderStatus(o.status)) return false;
      if (o.isActive === false) return false;
      return (ACTIVE_COMMERCIAL_ORDER_STATUSES as readonly string[]).includes(o.status);
    });
    await this.applyBars(active);
  }

  private async applyBars(target: Order[]): Promise<void> {
    const built = await this.facade.loadBarsForOrders(target);
    this.bars.set(built);
    this.usedTodayFallback.set(built.some((b) => b.usedFallbackToday));
    this.showBoard.set(true);
    if (built.length === 0) {
      const today = formatDateOnly(new Date());
      this.rangeStart.set(today);
      this.rangeEnd.set(today);
      return;
    }
    let start = built[0]!.startDate;
    let end = built[0]!.endDate;
    for (const b of built) {
      if (b.startDate < start) start = b.startDate;
      const e = b.noTerm ? b.startDate : b.endDate;
      if (e > end) end = e;
    }
    this.rangeStart.set(start);
    this.rangeEnd.set(addDays(end, 1));
  }
}

function addDays(dateOnly: string, days: number): string {
  const [y, m, d] = dateOnly.split('-').map(Number);
  const dt = new Date(y!, m! - 1, d!);
  dt.setDate(dt.getDate() + days);
  return formatDateOnly(dt);
}
