import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { filterOrdersForRail, ORDER_STATUS_LABELS } from '../gantt-bar.model';
import type { Order, OrderStatus } from '../../orders/orders.service';
import { ProductionCockpitContext } from '../production-cockpit.context';

function isReadOnlyEstimateStatus(status: OrderStatus): boolean {
  return status === 'shipped' || status === 'delivered' || status === 'cancelled';
}

@Component({
  selector: 'app-orders-rail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full min-h-0 border-r hairline bg-paper">
      <div class="p-3 space-y-2 shrink-0">
        <label class="text-xs font-medium text-muted-foreground" for="prod-order-search"
          >Заказы</label
        >
        <input
          id="prod-order-search"
          type="search"
          class="pi-input w-full text-sm"
          placeholder="Поиск по номеру…"
          [value]="ctx.search()"
          (input)="onSearch($event)"
          data-test="orders-rail-search"
        />
        <label class="flex items-center gap-2 text-xs text-ink cursor-pointer">
          <input
            type="checkbox"
            class="pi-focus-ring"
            [checked]="ctx.activeOnly()"
            (change)="onActiveToggle($event)"
            data-test="orders-rail-active-only"
          />
          Все активные
        </label>
      </div>
      <ul class="flex-1 overflow-y-auto min-h-0" role="listbox" aria-label="Список заказов">
        <li class="px-3 pb-1">
          <button
            type="button"
            class="w-full text-left text-xs px-2 py-1.5 rounded-sm border hairline pi-focus-ring"
            [class.bg-paper-2]="ctx.selectedOrderId() === null"
            (click)="selectAll.emit()"
            data-test="orders-rail-all"
          >
            Все активные (оценка)
          </button>
        </li>
        @for (o of visible(); track o._id) {
          <li>
            <button
              type="button"
              role="option"
              class="w-full text-left px-3 py-2.5 pi-focus-ring border-b hairline hover:bg-paper-2 transition-colors"
              [class.bg-paper-2]="ctx.selectedOrderId() === o._id"
              [attr.aria-selected]="ctx.selectedOrderId() === o._id"
              (click)="select.emit(o._id)"
              [attr.data-test]="'orders-rail-item-' + o._id"
            >
              <div class="flex items-center justify-between gap-2">
                <span class="text-sm font-medium truncate">{{ o.number }}</span>
                <span
                  class="shrink-0 w-2 h-2 rounded-full"
                  [style.background]="statusPip(o.status)"
                  [attr.title]="statusLabel(o.status)"
                ></span>
              </div>
              <div class="text-[11px] text-muted-foreground mt-0.5 flex gap-2 flex-wrap">
                <span>{{ statusLabel(o.status) }}</span>
                @if (isReadOnly(o.status)) {
                  <span class="text-amber-700 dark:text-amber-400">только оценка</span>
                }
              </div>
            </button>
          </li>
        } @empty {
          <li class="p-4 text-sm text-muted-foreground" data-test="orders-rail-empty">
            Нет заказов по фильтру
          </li>
        }
      </ul>
    </div>
  `,
})
export class OrdersRailComponent {
  readonly orders = input.required<Order[]>();
  readonly select = output<string>();
  readonly selectAll = output<void>();

  protected readonly ctx = inject(ProductionCockpitContext);

  protected readonly visible = computed(() =>
    filterOrdersForRail(this.orders(), {
      activeOnly: this.ctx.activeOnly(),
      search: this.ctx.search(),
      selectedOrderId: this.ctx.selectedOrderId(),
    }),
  );

  protected statusLabel(s: OrderStatus): string {
    return ORDER_STATUS_LABELS[s] ?? s;
  }

  protected isReadOnly(s: OrderStatus): boolean {
    return isReadOnlyEstimateStatus(s);
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

  protected onSearch(ev: Event): void {
    this.ctx.setSearch((ev.target as HTMLInputElement).value);
  }

  protected onActiveToggle(ev: Event): void {
    this.ctx.setActiveOnly((ev.target as HTMLInputElement).checked);
  }
}
