import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { OrderWorkspaceFacade, OrderWsHeaderComponent } from '@kppdf/features/order-workspace';
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
  imports: [PiStatusBannerComponent, OrderWsHeaderComponent],
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
            <pi-order-ws-header
              [statusLabel]="statusLabel(order.status)"
              [bannerTone]="bannerTone(order.status)"
              [counterpartyName]="facade.counterpartyName()"
              [siteName]="facade.siteName()"
              [organizationName]="facade.organizationName()"
              [quotationId]="facade.quotationId()"
              [quotationNumber]="facade.quotationNumber()"
              [paid]="facade.paid()"
              [confirming]="facade.confirming()"
              [cancelling]="facade.cancelling()"
              [canConfirm]="facade.canConfirm()"
              [canCancel]="facade.canCancel()"
              [orderDateLabel]="facade.fmtDate(order.date)"
              (paidToggle)="onPaidToggle($event)"
              (openQuotation)="facade.openQuotationInStudio()"
              (confirmOrder)="facade.confirmOrder()"
              (cancelOrder)="facade.cancelOrder()"
            />
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
