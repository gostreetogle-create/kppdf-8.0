import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PiOrdersService, type Order } from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { orderStatusLabel } from './order-status';

@Component({
  selector: 'pi-orders-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiStatusBannerComponent, RouterLink],
  template: `
    <main class="px-panel-inset py-6" data-test="orders-list">
      <div class="mb-6">
        <div class="eyebrow">Сделки</div>
        <h1 class="font-display text-2xl m-0">Заказы</h1>
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
          <div class="grid grid-cols-[minmax(0,1.4fr)_minmax(8rem,1fr)_minmax(7rem,0.8fr)_minmax(5rem,0.7fr)_minmax(6rem,0.6fr)] gap-4 px-4 py-2 text-xs text-muted-foreground hairline-bottom" role="row">
            <span role="columnheader">Номер</span>
            <span role="columnheader">Статус</span>
            <span role="columnheader">Оплата</span>
            <span role="columnheader">КП</span>
            <span role="columnheader" aria-label="Открыть карточку"></span>
          </div>
          @for (row of rows(); track row._id) {
            <div
              class="grid grid-cols-[minmax(0,1.4fr)_minmax(8rem,1fr)_minmax(7rem,0.8fr)_minmax(5rem,0.7fr)_minmax(6rem,0.6fr)] gap-4 items-center px-4 py-3 hairline-bottom last:border-b-0"
              role="row"
              data-test="orders-row"
            >
              <span class="font-medium truncate" role="cell">{{ row.number }}</span>
              <span class="text-sm" role="cell">{{ statusLabel(row.status) }}</span>
              <span class="text-sm" role="cell">{{ row.isPaid ? 'Оплачен' : 'Не оплачен' }}</span>
              <span class="text-sm text-muted-foreground" role="cell">{{ row.quotationId ? 'Есть КП' : 'Без КП' }}</span>
              <a class="pi-button pi-button-secondary" [routerLink]="['/orders', row._id]" role="cell" data-test="orders-row-link">
                Карточка
              </a>
            </div>
          }
        </div>
      }
    </main>
  `,
})
export class OrdersListPage implements OnInit {
  private readonly ordersApi = inject(PiOrdersService);

  readonly rows = signal<readonly Order[]>([]);
  readonly status = signal<'loading' | 'success' | 'error'>('loading');
  readonly error = signal('Не удалось загрузить заказы.');

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.status.set('loading');
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
}
