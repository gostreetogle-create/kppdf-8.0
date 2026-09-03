import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PiOrdersService, type Order } from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { PiToastService } from '@kppdf/ui/toast';
import { orderStatusLabel } from './order-status';

/**
 * NX order card (TZ-NX-SALES-S35-ORDER-DETAIL). Read-only journal plus the
 * payment fact. Deliberately has NO stub-proposal surface: a direct order
 * renders «Без КП», and an order with a quotation gets only the studio link.
 */
@Component({
  selector: 'pi-order-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiStatusBannerComponent],
  template: `
    <main class="px-panel-inset py-6" data-test="order-detail">
      <div class="mb-6">
        <div class="eyebrow">Сделки</div>
        <h1 class="font-display text-2xl m-0" data-test="order-title">
          @if (order(); as order) {
            Заказ №{{ order.number }}
          } @else {
            Заказ
          }
        </h1>
      </div>

      @if (status() === 'loading') {
        <div class="text-sm text-muted-foreground" data-test="order-loading">Загрузка…</div>
      }

      @if (status() === 'error') {
        <app-pi-status-banner
          tone="destructive"
          [message]="error()"
          actionLabel="Повторить"
          (action)="load()"
          data-test="order-error"
        />
      }

      @if (status() === 'success' && order(); as order) {
        <div class="space-y-6" data-test="order-body">
          <app-pi-status-banner [tone]="bannerTone(order.status)" [message]="statusLabel(order.status)" />

          <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4 text-sm">
            <div>
              <div class="text-xs text-muted-foreground">Заказчик</div>
              <div class="font-medium">{{ counterpartyName() ?? '—' }}</div>
            </div>
            <div>
              <div class="text-xs text-muted-foreground">Объект</div>
              <div class="font-medium">{{ siteName() ?? '—' }}</div>
            </div>
          </div>

          <section>
            <h2 class="text-sm font-medium m-0 mb-2">Позиции</h2>
            @if (order.items && order.items.length > 0) {
              <div class="pi-table-surface hairline rounded-sm overflow-hidden bg-paper-raised">
                @for (item of order.items; track item.lineId ?? item.productId) {
                  <div
                    class="flex items-center justify-between gap-4 px-4 py-3 hairline-bottom last:border-b-0 text-sm"
                    data-test="order-item"
                  >
                    <span class="font-medium truncate">{{ item.productName ?? item.productId }}</span>
                    <span class="text-muted-foreground tabular-nums"
                      >×{{ item.quantity }}{{ item.unit ? ' ' + item.unit : '' }}</span
                    >
                  </div>
                }
              </div>
            } @else {
              <div class="pi-dashed-panel p-8 text-center text-sm text-muted-foreground" data-test="order-items-empty">
                В заказе нет изделий
              </div>
            }
          </section>

          <section class="flex items-center justify-between gap-4">
            <div class="text-sm">
              <span class="text-muted-foreground">КП: </span>
              @if (quotationId(); as quotationId) {
                <span class="font-medium" data-test="order-quotation">{{ quotationNumber() ?? 'Есть КП' }}</span>
              } @else {
                <span class="font-medium" data-test="order-no-quotation">Без КП</span>
              }
            </div>
            @if (quotationId()) {
              <button
                class="pi-button pi-button-secondary"
                type="button"
                data-test="order-open-studio"
                (click)="openQuotationInStudio()"
              >
                КП в студии
              </button>
            }
          </section>

          <label class="flex items-center gap-3 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              class="pi-checkbox"
              data-test="order-paid-toggle"
              [checked]="paid()"
              (change)="onPaidToggle($event)"
            />
            <span>Оплачен</span>
          </label>
        </div>
      }
    </main>
  `,
})
export class OrderDetailPage implements OnInit {
  private readonly ordersApi = inject(PiOrdersService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(PiToastService);

  readonly order = signal<Order | null>(null);
  /** Payment fact mirror: optimistically toggled, reverted on PATCH failure (isPaid не врёт). */
  readonly paid = signal(false);
  readonly status = signal<'loading' | 'success' | 'error'>('loading');
  readonly error = signal('Не удалось загрузить заказ.');

  protected readonly statusLabel = orderStatusLabel;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.status.set('loading');
    void firstValueFrom(this.ordersApi.getById(this.id())).then((result) => {
      if (!result.ok) {
        this.error.set(extractErrorMessage(result.error));
        this.status.set('error');
        return;
      }
      this.order.set(result.data ?? null);
      this.paid.set(result.data?.isPaid === true);
      this.status.set('success');
    });
  }

  bannerTone(status?: string): 'warning' | 'info' | 'destructive' | 'neutral' {
    if (status === 'draft') return 'warning';
    if (status === 'cancelled') return 'destructive';
    return 'info';
  }

  counterpartyName(): string | null {
    const c = this.order()?.counterpartyId;
    if (!c) return null;
    return typeof c === 'string' ? c : (c.name ?? null);
  }

  siteName(): string | null {
    const s = this.order()?.siteId;
    if (!s) return null;
    if (typeof s === 'string') return s;
    const parts = [s.name, s.address].filter((p): p is string => !!p);
    return parts.length > 0 ? parts.join(' · ') : null;
  }

  quotationId(): string | null {
    const q = this.order()?.quotationId;
    if (!q) return null;
    return typeof q === 'string' ? q : (q._id ?? null);
  }

  quotationNumber(): string | null {
    const q = this.order()?.quotationId;
    if (!q || typeof q === 'string') return null;
    return q.number ?? null;
  }

  async setPaid(paid: boolean, control?: HTMLInputElement): Promise<void> {
    const current = this.order();
    if (!current) return;
    const previous = this.paid();
    this.paid.set(paid);
    const result = await firstValueFrom(this.ordersApi.update(current._id, { isPaid: paid }));
    if (!result.ok) {
      this.toast.error('Не удалось сохранить отметку оплаты', {
        description: extractErrorMessage(result.error),
      });
      this.paid.set(previous);
      // Angular rewrites the checkbox only when the bound value changes; a failed
      // PATCH leaves the native toggle flipped, so re-assert the control itself.
      if (control) control.checked = previous;
      return;
    }
    if (result.data) {
      this.order.set(result.data);
      this.paid.set(result.data.isPaid === true);
    }
  }

  openQuotationInStudio(): void {
    const quotationId = this.quotationId();
    if (!quotationId) return;
    void this.router.navigate(['/studio'], { queryParams: { quotationId } });
  }

  protected onPaidToggle(event: Event): void {
    const target = event.target as HTMLInputElement;
    void this.setPaid(target.checked, target);
  }

  private id(): string {
    return this.route.snapshot.paramMap.get('id') ?? '';
  }
}