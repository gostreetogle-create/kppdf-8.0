import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { ButtonComponent } from '@kppdf/ui/button';
import { OrderWorkspaceFacade } from '@kppdf/features/order-workspace';
import { orderStatusLabel } from './order-status';

/**
 * NX order workspace (`TZ-NX-ORDER-WS-FACADE-SHELL`, wave
 * `docs/agent-checklists/WAVE-NX-ORDER-WORKSPACE.md`). Thin glue: loading/
 * routing lives on `OrderWorkspaceFacade` (page-scoped provider, not root);
 * this page only lays out the five workspace sections (Шапка · Состав ·
 * Исполнение · Логистика · Документы) — the latter three are empty hosts
 * until the following chain TZs (HEADER/COMPOSITION already covered by
 * Шапка/Состав below; EXECUTION/LOGISTICS/DOCS-CHIPS populate the rest).
 */
@Component({
  selector: 'pi-order-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [OrderWorkspaceFacade],
  imports: [PiStatusBannerComponent, ButtonComponent],
  template: `
    <main class="px-panel-inset py-6" data-test="order-detail">
      <div class="mb-6">
        <div class="eyebrow">Сделки</div>
        <h1 class="font-display text-2xl m-0" data-test="order-title">
          @if (facade.order(); as order) {
            Заказ №{{ order.number }}
          } @else {
            Заказ
          }
        </h1>
      </div>

      @if (facade.status() === 'loading') {
        <div class="text-sm text-muted-foreground" data-test="order-loading">Загрузка…</div>
      }

      @if (facade.status() === 'error') {
        <app-pi-status-banner
          tone="destructive"
          [message]="facade.error()"
          actionLabel="Повторить"
          (action)="facade.load()"
          data-test="order-error"
        />
      }

      @if (facade.status() === 'success' && facade.order(); as order) {
        <div class="space-y-6" data-test="order-body">
          <section data-test="order-ws-header">
            <app-pi-status-banner [tone]="bannerTone(order.status)" [message]="statusLabel(order.status)" />

            <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4 text-sm mt-4">
              <div>
                <div class="text-xs text-muted-foreground">Заказчик</div>
                <div class="font-medium">{{ facade.counterpartyName() ?? '—' }}</div>
              </div>
              <div>
                <div class="text-xs text-muted-foreground">Объект</div>
                <div class="font-medium">{{ facade.siteName() ?? '—' }}</div>
              </div>
            </div>

            <div class="flex items-center justify-between gap-4 mt-4">
              <div class="text-sm">
                <span class="text-muted-foreground">КП: </span>
                @if (facade.quotationId(); as quotationId) {
                  <span class="font-medium" data-test="order-quotation">{{ facade.quotationNumber() ?? 'Есть КП' }}</span>
                } @else {
                  <span class="font-medium" data-test="order-no-quotation">Без КП</span>
                }
              </div>
              @if (facade.quotationId()) {
                <app-pi-button
                  variant="secondary"
                  type="button"
                  data-test="order-open-studio"
                  (click)="facade.openQuotationInStudio()"
                >
                  КП в студии
                </app-pi-button>
              }
            </div>

            <label class="flex items-center gap-3 text-sm cursor-pointer select-none mt-4">
              <input
                type="checkbox"
                class="pi-checkbox"
                data-test="order-paid-toggle"
                [checked]="facade.paid()"
                (change)="onPaidToggle($event)"
              />
              <span>Оплачен</span>
            </label>
          </section>

          <section data-test="order-ws-composition">
            <h2 class="text-sm font-medium m-0 mb-2">Состав</h2>
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

          <section data-test="order-ws-execution">
            <h2 class="text-sm font-medium m-0 mb-2">Исполнение</h2>
          </section>

          <section data-test="order-ws-logistics">
            <h2 class="text-sm font-medium m-0 mb-2">Логистика</h2>
          </section>

          <section data-test="order-ws-documents">
            <h2 class="text-sm font-medium m-0 mb-2">Документы</h2>
          </section>
        </div>
      }
    </main>
  `,
})
export class OrderDetailPage implements OnInit {
  protected readonly facade = inject(OrderWorkspaceFacade);

  protected readonly statusLabel = orderStatusLabel;

  ngOnInit(): void {
    this.facade.load();
  }

  protected bannerTone(status?: string): 'warning' | 'info' | 'destructive' | 'neutral' {
    return this.facade.bannerTone(status);
  }

  protected onPaidToggle(event: Event): void {
    const target = event.target as HTMLInputElement;
    void this.facade.setPaid(target.checked, target);
  }
}
