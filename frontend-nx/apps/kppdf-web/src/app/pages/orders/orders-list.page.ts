import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PiOrdersService, type Order } from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { PiGroupWorkspaceComponent } from '@kppdf/features';
import { DEALS_TOC_CHIPS } from '../deals-group-chips';
import { orderStatusLabel } from './order-status';
import { OrderHubTrayComponent } from './order-hub-tray.component';

@Component({
  selector: 'pi-orders-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiStatusBannerComponent, RouterLink, PiGroupWorkspaceComponent, OrderHubTrayComponent],
  template: `
    <app-pi-group-workspace [toc]="toc" tocActiveId="orders" [chips]="[]" activeId="">
    <main class="py-6" data-test="orders-list">
      <div class="flex items-center justify-between gap-4 mb-6">
        <div>
          <div class="eyebrow">Сделки</div>
          <h1 class="font-display text-2xl m-0">Заказы</h1>
        </div>
        <button class="pi-button pi-button-primary" type="button" data-test="orders-create" (click)="create()">
          Создать заказ
        </button>
      </div>

      @if (status() === 'loading') {
        <div class="text-sm text-muted-foreground" data-test="orders-loading">Загрузка…</div>
      }

      @if (status() === 'error') {
        <app-pi-status-banner
          tone="destructive"
          [message]="error()"
          actionLabel="Повторить"
          (action)="load()"
          data-test="orders-error"
        />
      }

      @if (status() === 'success' && rows().length === 0) {
        <div class="pi-dashed-panel p-8 text-center" data-test="orders-empty">
          Заказов пока нет.
        </div>
      }

      @if (status() === 'success' && rows().length > 0) {
        <div
          class="pi-table-surface hairline rounded-sm overflow-hidden bg-paper-raised"
          role="table"
          aria-label="Заказы"
          data-test="orders-table"
        >
          <div class="grid grid-cols-[minmax(0,1.2fr)_minmax(6rem,0.7fr)_minmax(7rem,0.8fr)_minmax(5rem,0.7fr)_minmax(5rem,0.7fr)_minmax(5rem,0.7fr)_minmax(6rem,0.6fr)] gap-4 px-4 py-2 text-xs text-muted-foreground hairline-bottom" role="row">
            <span role="columnheader">Номер</span>
            <span role="columnheader">Дата</span>
            <span role="columnheader">Статус</span>
            <span role="columnheader">Оплата</span>
            <span role="columnheader">КП</span>
            <span role="columnheader">Готовность</span>
            <span role="columnheader" aria-label="Открыть карточку"></span>
          </div>
          @for (row of rows(); track row._id) {
            <div
              class="grid grid-cols-[minmax(0,1.2fr)_minmax(6rem,0.7fr)_minmax(7rem,0.8fr)_minmax(5rem,0.7fr)_minmax(5rem,0.7fr)_minmax(5rem,0.7fr)_minmax(6rem,0.6fr)] gap-4 items-center px-4 py-3 hairline-bottom last:border-b-0 cursor-pointer pi-focus-ring"
              role="row"
              data-test="orders-row"
              tabindex="0"
              [attr.aria-expanded]="expandedId() === row._id"
              (click)="toggleExpand(row._id)"
              (keydown.enter)="toggleExpand(row._id)"
              (keydown.space)="onRowSpace($event, row._id)"
            >
              <span class="font-medium truncate" role="cell">{{ row.number }}</span>
              <span class="text-sm text-muted-foreground" role="cell">{{ dateLabel(row.date) }}</span>
              <span class="text-sm" role="cell">{{ statusLabel(row.status) }}</span>
              <span class="text-sm" role="cell">{{ row.isPaid ? 'Оплачен' : 'Не оплачен' }}</span>
              <span class="text-sm text-muted-foreground" role="cell">{{ row.quotationId ? 'Есть КП' : 'Без КП' }}</span>
              <span class="text-sm" role="cell" data-test="orders-row-readiness">{{ readinessLabel(row) }}</span>
              <a
                class="pi-button pi-button-secondary"
                [routerLink]="['/orders', row._id]"
                role="cell"
                data-test="orders-row-link"
                (click)="$event.stopPropagation()"
              >
                Карточка
              </a>
            </div>
            @if (expandedId() === row._id) {
              <app-order-hub-tray [order]="row" data-test="orders-row-expand" />
            }
          }
        </div>
      }
    </main>
    </app-pi-group-workspace>
  `,
})
export class OrdersListPage implements OnInit {
  private readonly ordersApi = inject(PiOrdersService);
  private readonly router = inject(Router);

  protected readonly toc = DEALS_TOC_CHIPS;

  readonly rows = signal<readonly Order[]>([]);
  readonly status = signal<'loading' | 'success' | 'error'>('loading');
  readonly error = signal('Не удалось загрузить заказы.');

  /** Single expand (HUB pattern) — opening another row or reloading the list collapses it. */
  readonly expandedId = signal<string | null>(null);

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

  protected readonly statusLabel = orderStatusLabel;

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

  create(): void {
    void this.router.navigate(['/orders/create']);
  }
}
