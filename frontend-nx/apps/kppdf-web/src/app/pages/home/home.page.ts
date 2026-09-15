import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PiOrdersService, type Order } from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { PiGroupWorkspaceComponent } from '@kppdf/features';
import { OrderHubTrayComponent } from '@kppdf/features/order-hub';
import { orderStatusLabel } from '../orders/order-status';

const ACTIVE_ORDER_STATUSES = new Set(['confirmed', 'in_production', 'ready', 'shipped']);

type QueueFilter = 'all' | 'active';

/** NX Home — the post-login starting point for the operator's day. */
@Component({
  selector: 'pi-home-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiGroupWorkspaceComponent, RouterLink, PiStatusBannerComponent, OrderHubTrayComponent],
  template: `
    <app-pi-group-workspace [toc]="[]" tocActiveId="" [chips]="[]" activeId="">
      <main class="py-6" data-test="home-page">
        <div class="flex items-start justify-between gap-4 mb-6">
          <div>
            <div class="eyebrow">Рабочий день</div>
            <h1 class="font-display text-2xl m-0">Главная</h1>
            <p class="text-sm text-muted-foreground mt-2 mb-0">
              Очередь заказов и связанные рабочие шаги — в одном месте.
            </p>
          </div>
          <a routerLink="/orders" class="pi-outline-btn pi-focus-ring" data-test="home-orders-link">
            Все заказы
          </a>
        </div>

        <div class="flex items-center gap-3 mb-4 flex-wrap">
          <label class="sr-only" for="home-search">Поиск заказов</label>
          <input
            id="home-search"
            type="search"
            class="pi-input w-64 pi-focus-ring"
            placeholder="Поиск по номеру…"
            [value]="search()"
            (input)="onSearch($event)"
            data-test="home-search"
          />
          <label class="sr-only" for="home-status-filter">Фильтр статуса</label>
          <select
            id="home-status-filter"
            class="pi-input w-auto pi-focus-ring"
            [value]="filter()"
            (change)="onFilter($event)"
            data-test="home-status-filter"
          >
            <option value="all">Все заказы</option>
            <option value="active">Активные</option>
          </select>
          <span class="text-sm text-muted-foreground" data-test="home-count">{{ visibleRows().length }} заказов</span>
        </div>

        @if (status() === 'loading') {
          <div class="text-sm text-muted-foreground" data-test="home-loading">Загрузка…</div>
        }

        @if (status() === 'error') {
          <app-pi-status-banner
            tone="destructive"
            [message]="error()"
            actionLabel="Повторить"
            (action)="load()"
            data-test="home-error"
          />
        }

        @if (status() === 'success' && visibleRows().length === 0) {
          <div class="pi-dashed-panel p-8 text-center" data-test="home-empty">
            {{ search().trim() || filter() === 'active' ? 'По выбранному фильтру заказов нет.' : 'Заказов пока нет.' }}
          </div>
        }

        @if (status() === 'success' && visibleRows().length > 0) {
          <div class="pi-table-surface hairline rounded-sm overflow-hidden bg-paper-raised" role="table" aria-label="Очередь заказов" data-test="home-queue-table">
            <div class="grid grid-cols-[1.5rem_minmax(0,1.3fr)_minmax(6rem,0.7fr)_minmax(8rem,0.9fr)_minmax(6rem,0.7fr)_minmax(5rem,0.6fr)_minmax(3rem,0.4fr)] gap-4 px-4 py-2 text-xs text-muted-foreground hairline-bottom" role="row">
              <span role="columnheader" aria-hidden="true"></span>
              <span role="columnheader">Номер</span>
              <span role="columnheader">Дата</span>
              <span role="columnheader">Статус</span>
              <span role="columnheader">Оплата</span>
              <span role="columnheader">Готовность</span>
              <span role="columnheader" aria-label="Открыть карточку"></span>
            </div>
            @for (row of visibleRows(); track row._id) {
              <div
                class="grid grid-cols-[1.5rem_minmax(0,1.3fr)_minmax(6rem,0.7fr)_minmax(8rem,0.9fr)_minmax(6rem,0.7fr)_minmax(5rem,0.6fr)_minmax(3rem,0.4fr)] gap-4 items-center px-4 py-2 hairline-bottom last:border-b-0 cursor-pointer hover:bg-paper-2 pi-focus-ring border-l-2"
                role="row"
                data-test="home-row"
                tabindex="0"
                [class.bg-paper-2]="expandedId() === row._id"
                [class.border-l-gold-deep]="expandedId() === row._id"
                [class.border-l-transparent]="expandedId() !== row._id"
                [attr.aria-expanded]="expandedId() === row._id"
                (click)="toggleExpand(row._id)"
                (keydown.enter)="toggleExpand(row._id)"
                (keydown.space)="onRowSpace($event, row._id)"
              >
                <span role="cell" aria-hidden="true" class="text-muted-foreground" data-test="home-row-chevron">
                  {{ expandedId() === row._id ? '▾' : '▸' }}
                </span>
                <span class="font-medium truncate" role="cell">{{ row.number }}</span>
                <span class="text-sm text-muted-foreground" role="cell">{{ dateLabel(row.date) }}</span>
                <span class="text-sm" role="cell">{{ statusLabel(row.status) }}</span>
                <span class="text-sm" role="cell">{{ row.isPaid ? 'Оплачен' : 'Не оплачен' }}</span>
                <span class="text-sm" role="cell">{{ readinessLabel(row) }}</span>
                <a
                  class="pi-icon-btn pi-icon-btn-doc pi-focus-ring justify-self-end"
                  [routerLink]="['/orders', row._id]"
                  role="cell"
                  aria-label="Открыть карточку заказа"
                  data-test="home-row-link"
                  (click)="$event.stopPropagation()"
                >
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
              @if (expandedId() === row._id) {
                <app-order-hub-tray [order]="row" data-test="home-row-expand" />
              }
            }
          </div>
        }
      </main>
    </app-pi-group-workspace>
  `,
})
export class HomePage implements OnInit {
  private readonly ordersApi = inject(PiOrdersService);

  readonly rows = signal<readonly Order[]>([]);
  readonly status = signal<'loading' | 'success' | 'error'>('loading');
  readonly error = signal('Не удалось загрузить очередь заказов.');
  readonly search = signal('');
  readonly filter = signal<QueueFilter>('all');
  readonly expandedId = signal<string | null>(null);
  readonly visibleRows = computed(() => {
    const query = this.search().trim().toLocaleLowerCase('ru-RU');
    const filter = this.filter();
    return this.rows().filter((row) => {
      const matchesSearch = !query || row.number.toLocaleLowerCase('ru-RU').includes(query);
      const matchesFilter = filter === 'all' || ACTIVE_ORDER_STATUSES.has(row.status ?? '');
      return matchesSearch && matchesFilter;
    });
  });

  protected readonly statusLabel = orderStatusLabel;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.status.set('loading');
    this.expandedId.set(null);
    void firstValueFrom(this.ordersApi.list()).then((result) => {
      if (!result.ok) {
        this.error.set(extractErrorMessage(result.error));
        this.status.set('error');
        return;
      }
      this.rows.set(result.data ?? []);
      this.status.set('success');
    });
  }

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
    this.expandedId.set(null);
  }

  onFilter(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.filter.set(value === 'active' ? 'active' : 'all');
    this.expandedId.set(null);
  }

  toggleExpand(orderId: string): void {
    this.expandedId.update((current) => (current === orderId ? null : orderId));
  }

  protected onRowSpace(event: Event, orderId: string): void {
    event.preventDefault();
    this.toggleExpand(orderId);
  }

  protected dateLabel(date?: string): string {
    if (!date) return '—';
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString('ru-RU');
  }

  protected readinessLabel(order: Order): string {
    const items = order.items ?? [];
    if (items.length === 0) return '—';
    const ready = items.filter((item) => item.readyForWork === true).length;
    return `${ready} из ${items.length}`;
  }
}
