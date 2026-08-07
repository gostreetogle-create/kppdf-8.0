import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { filterOrdersForRail, ORDER_STATUS_LABELS } from '../gantt-bar.model';
import type { Order, OrderPriority, OrderStatus } from '../../orders/orders.service';
import { ProductionCockpitContext } from '../production-cockpit.context';

function isReadOnlyEstimateStatus(status: OrderStatus): boolean {
  return status === 'shipped' || status === 'delivered' || status === 'cancelled';
}

const PRIORITY_OPTS: { value: OrderPriority | 'all'; label: string }[] = [
  { value: 'all', label: 'Все приоритеты' },
  { value: 'urgent', label: 'Срочный' },
  { value: 'high', label: 'Высокий' },
  { value: 'normal', label: 'Обычный' },
  { value: 'low', label: 'Низкий' },
];

@Component({
  selector: 'app-orders-rail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full min-h-0 border-r hairline bg-paper">
      @if (collapsed()) {
        <div class="flex flex-col items-center gap-1 py-2 px-1" data-test="orders-rail-collapsed">
          <button
            type="button"
            class="w-10 h-10 rounded-sm border hairline pi-focus-ring text-xs"
            (click)="expandRail.emit()"
            title="Развернуть список"
            data-test="orders-rail-expand"
          >
            »»
          </button>
          <button
            type="button"
            class="w-10 h-10 rounded-sm border hairline pi-focus-ring text-[10px]"
            [class.bg-paper-2]="ctx.selectedOrderId() === null"
            (click)="selectAll.emit()"
            title="Все активные"
            data-test="orders-rail-all-icon"
          >
            все
          </button>
          @for (o of visible(); track o._id) {
            <button
              type="button"
              class="w-10 h-10 rounded-sm border hairline pi-focus-ring overflow-hidden relative"
              [class.ring-2]="ctx.selectedOrderId() === o._id"
              (click)="select.emit(o._id)"
              [attr.title]="o.number"
              [attr.data-test]="'orders-rail-icon-' + o._id"
            >
              @if (thumbs().get(o._id); as src) {
                <img [src]="src" alt="" class="w-full h-full object-cover" />
              } @else {
                <span class="text-[9px] leading-tight px-0.5 break-all">{{
                  shortNum(o.number)
                }}</span>
              }
              <span
                class="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full"
                [style.background]="statusPip(o.status)"
              ></span>
            </button>
          }
        </div>
      } @else {
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
          <label class="block text-[11px] text-muted-foreground">
            Приоритет
            <select
              class="pi-input w-full mt-0.5 text-xs"
              [value]="ctx.priorityFilter()"
              (change)="onPriority($event)"
              data-test="orders-rail-priority"
            >
              @for (p of priorityOpts; track p.value) {
                <option [value]="p.value">{{ p.label }}</option>
              }
            </select>
          </label>
          <p class="text-[10px] text-muted-foreground leading-snug">
            Приоритет — важность в списке/фильтре, не длина полосок на Ганте.
          </p>
          <div class="grid grid-cols-2 gap-1">
            <label class="block text-[11px] text-muted-foreground">
              С
              <input
                type="date"
                class="pi-input w-full mt-0.5 text-xs"
                [value]="ctx.dateFrom() ?? ''"
                (change)="onDateFrom($event)"
                data-test="orders-rail-date-from"
              />
            </label>
            <label class="block text-[11px] text-muted-foreground">
              По
              <input
                type="date"
                class="pi-input w-full mt-0.5 text-xs"
                [value]="ctx.dateTo() ?? ''"
                (change)="onDateTo($event)"
                data-test="orders-rail-date-to"
              />
            </label>
          </div>
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
                class="w-full text-left px-3 py-2.5 pi-focus-ring border-b hairline hover:bg-paper-2 transition-colors flex gap-2 items-start"
                [class.bg-paper-2]="ctx.selectedOrderId() === o._id"
                [attr.aria-selected]="ctx.selectedOrderId() === o._id"
                (click)="select.emit(o._id)"
                [attr.data-test]="'orders-rail-item-' + o._id"
              >
                @if (thumbs().get(o._id); as src) {
                  <img
                    [src]="src"
                    alt=""
                    class="w-9 h-9 rounded-sm object-cover border hairline shrink-0"
                  />
                }
                <span class="min-w-0 flex-1">
                  <span class="flex items-center justify-between gap-2">
                    <span class="text-sm font-medium truncate">{{ o.number }}</span>
                    <span
                      class="shrink-0 w-2 h-2 rounded-full"
                      [style.background]="statusPip(o.status)"
                      [attr.title]="statusLabel(o.status)"
                    ></span>
                  </span>
                  <span class="text-[11px] text-muted-foreground mt-0.5 flex gap-2 flex-wrap">
                    <span>{{ statusLabel(o.status) }}</span>
                    @if (o.priority && o.priority !== 'normal') {
                      <span>{{ priorityLabel(o.priority) }}</span>
                    }
                    @if (isReadOnly(o.status)) {
                      <span class="text-amber-700 dark:text-amber-400">только оценка</span>
                    }
                  </span>
                </span>
              </button>
            </li>
          } @empty {
            <li class="p-4 text-sm text-muted-foreground space-y-1" data-test="orders-rail-empty">
              <div>В базе нет активных заказов под фильтр.</div>
              <div class="text-xs opacity-80">
                Создайте заказ в «Сделки» или
                <code class="font-mono">node scripts/seed-local-demo.mjs</code>
              </div>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class OrdersRailComponent {
  readonly orders = input.required<Order[]>();
  readonly collapsed = input(false);
  readonly thumbs = input<ReadonlyMap<string, string>>(new Map());
  readonly select = output<string>();
  readonly selectAll = output<void>();
  readonly filtersChanged = output<void>();
  readonly expandRail = output<void>();

  protected readonly ctx = inject(ProductionCockpitContext);
  protected readonly priorityOpts = PRIORITY_OPTS;

  protected readonly visible = computed(() =>
    filterOrdersForRail(this.orders(), {
      activeOnly: this.ctx.activeOnly(),
      search: this.ctx.search(),
      selectedOrderId: this.ctx.selectedOrderId(),
      priority: this.ctx.priorityFilter(),
      dateFrom: this.ctx.dateFrom(),
      dateTo: this.ctx.dateTo(),
    }),
  );

  protected shortNum(n: string): string {
    const parts = n.split('-');
    return parts[parts.length - 1]?.slice(-4) || n.slice(-4);
  }

  protected statusLabel(s: OrderStatus): string {
    return ORDER_STATUS_LABELS[s] ?? s;
  }

  protected priorityLabel(p: string): string {
    const hit = PRIORITY_OPTS.find((x) => x.value === p);
    return hit?.label ?? p;
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
    this.filtersChanged.emit();
  }

  protected onActiveToggle(ev: Event): void {
    this.ctx.setActiveOnly((ev.target as HTMLInputElement).checked);
    this.filtersChanged.emit();
  }

  protected onPriority(ev: Event): void {
    this.ctx.setPriorityFilter((ev.target as HTMLSelectElement).value as OrderPriority | 'all');
    this.filtersChanged.emit();
  }

  protected onDateFrom(ev: Event): void {
    this.ctx.setDateFrom((ev.target as HTMLInputElement).value || null);
    this.filtersChanged.emit();
  }

  protected onDateTo(ev: Event): void {
    this.ctx.setDateTo((ev.target as HTMLInputElement).value || null);
    this.filtersChanged.emit();
  }
}
