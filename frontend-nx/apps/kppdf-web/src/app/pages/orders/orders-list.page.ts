import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PiOrdersService, type Order } from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiGroupWorkspaceComponent } from '@kppdf/features';
import { DEALS_TOC_CHIPS } from '../deals-group-chips';
import { orderStatusLabel } from './order-status';
import { OrderHubTrayComponent } from './order-hub-tray.component';

@Component({
  selector: 'pi-orders-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiStatusBannerComponent, RouterLink, PiGroupWorkspaceComponent, OrderHubTrayComponent, ButtonComponent],
  template: `
    <app-pi-group-workspace [toc]="toc" tocActiveId="orders" [chips]="[]" activeId="">
    <main class="py-6" data-test="orders-list">
      <div class="flex items-center justify-between gap-4 mb-6">
        <div>
          <div class="eyebrow">Сделки</div>
          <h1 class="font-display text-2xl m-0">Заказы</h1>
        </div>
        <app-pi-button variant="default" type="button" data-test="orders-create" (click)="create()">
          Создать заказ
        </app-pi-button>
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
          <div class="grid grid-cols-[1.5rem_minmax(0,1.2fr)_minmax(6rem,0.7fr)_minmax(7rem,0.8fr)_minmax(5rem,0.7fr)_minmax(5rem,0.7fr)_minmax(5rem,0.7fr)_minmax(3rem,0.4fr)] gap-4 px-4 py-2 text-xs text-muted-foreground hairline-bottom" role="row">
            <span role="columnheader" aria-hidden="true"></span>
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
              class="grid grid-cols-[1.5rem_minmax(0,1.2fr)_minmax(6rem,0.7fr)_minmax(7rem,0.8fr)_minmax(5rem,0.7fr)_minmax(5rem,0.7fr)_minmax(5rem,0.7fr)_minmax(3rem,0.4fr)] gap-4 items-center px-4 py-2 hairline-bottom last:border-b-0 cursor-pointer hover:bg-paper-2 pi-focus-ring border-l-2"
              role="row"
              data-test="orders-row"
              tabindex="0"
              [class.bg-paper-2]="expandedId() === row._id"
              [class.border-l-gold-deep]="expandedId() === row._id"
              [class.border-l-transparent]="expandedId() !== row._id"
              [attr.aria-expanded]="expandedId() === row._id"
              (click)="toggleExpand(row._id)"
              (keydown.enter)="toggleExpand(row._id)"
              (keydown.space)="onRowSpace($event, row._id)"
            >
              <span role="cell" aria-hidden="true" class="text-muted-foreground" data-test="orders-row-chevron">
                {{ expandedId() === row._id ? '▾' : '▸' }}
              </span>
              <span class="font-medium truncate" role="cell">{{ row.number }}</span>
              <span class="text-sm text-muted-foreground" role="cell">{{ dateLabel(row.date) }}</span>
              <span class="text-sm" role="cell">{{ statusLabel(row.status) }}</span>
              <span class="text-sm" role="cell">{{ row.isPaid ? 'Оплачен' : 'Не оплачен' }}</span>
              <span class="text-sm text-muted-foreground" role="cell">{{ row.quotationId ? 'Есть КП' : 'Без КП' }}</span>
              <span class="text-sm" role="cell" data-test="orders-row-readiness">{{ readinessLabel(row) }}</span>
              <!-- Native <a> (not app-pi-button): ButtonComponent doesn't forward routerLink's
                   href host binding, which would silently drop hover-URL/open-in-new-tab.
                   TZ-NX-HUB-02 — icon (pi-icon-btn-doc), not a wide text button. -->
              <a
                class="pi-icon-btn pi-icon-btn-doc pi-focus-ring justify-self-end"
                [routerLink]="['/orders', row._id]"
                role="cell"
                aria-label="Открыть карточку заказа"
                data-test="orders-row-link"
                (click)="$event.stopPropagation()"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="8" y1="13" x2="16" y2="13" />
                  <line x1="8" y1="17" x2="13" y2="17" />
                </svg>
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
