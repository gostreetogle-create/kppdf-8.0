import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import {
  OrderWorkspaceFacade,
  OrderWsCompositionComponent,
  OrderWsDocumentsComponent,
  OrderWsExecutionComponent,
  OrderWsHeaderComponent,
  OrderWsLogisticsComponent,
  OrderWsWorkflowChipsComponent,
} from '@kppdf/features/order-workspace';
import { orderStatusLabel } from './order-status';

/**
 * NX order workspace (`TZ-NX-ORDER-WS-FACADE-SHELL`, wave
 * `docs/agent-checklists/WAVE-NX-ORDER-WORKSPACE.md`, closed by
 * `TZ-NX-ORDER-WS-DOCS-CHIPS`). Thin glue: loading/routing lives on
 * `OrderWorkspaceFacade` (page-scoped provider, not root); this page lays
 * out workflow chips + the five workspace sections (Шапка · Состав ·
 * Исполнение · Логистика · Документы). No shell `setTools` — no live,
 * non-redundant tool-rail action was identified beyond what the header's
 * plain links already cover, so the rails stay history-only (the shell's
 * own default when a page registers nothing, not a placeholder).
 */
@Component({
  selector: 'pi-order-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [OrderWorkspaceFacade],
  imports: [
    PiStatusBannerComponent,
    OrderWsWorkflowChipsComponent,
    OrderWsHeaderComponent,
    OrderWsCompositionComponent,
    OrderWsExecutionComponent,
    OrderWsLogisticsComponent,
    OrderWsDocumentsComponent,
  ],
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
        <pi-order-ws-workflow-chips [orderId]="order._id" />

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
            <pi-order-ws-composition
              [items]="order.items ?? []"
              [editable]="facade.canEditComposition()"
              [products]="facade.products()"
              [expandedLineIndex]="facade.expandedLineIndex()"
              [lineTrees]="facade.lineTrees()"
              [lineTreeLoading]="facade.lineTreeLoading()"
              [savingLineIndex]="facade.savingLineIndex()"
              [removingLineIndex]="facade.removingLineIndex()"
              [addingLine]="facade.addingLine()"
              [newLineProductId]="facade.newLineProductId"
              [newLineQty]="facade.newLineQty"
              (toggleTree)="facade.toggleLineTree($event)"
              (qtyChange)="facade.updateQty($event.index, $event.quantity)"
              (readyChange)="facade.toggleReady($event.index, $event.ready)"
              (removeLine)="facade.removeLine($event)"
              (newLineProductIdChange)="facade.newLineProductId = $event"
              (newLineQtyChange)="facade.newLineQty = $event"
              (addLine)="facade.addLine()"
            />
          </section>

          <section data-test="order-ws-execution">
            <h2 class="text-sm font-medium m-0 mb-2">Исполнение</h2>
            <pi-order-ws-execution
              [supplyLoading]="facade.supplyLoading()"
              [supplyError]="facade.supplyError()"
              [supplyCounters]="facade.supplyCounters()"
              [pendingSupplyRequests]="facade.pendingSupplyRequests()"
              [orderId]="order._id"
              [plannedDateLabel]="facade.fmtDate(order.plannedDate)"
              [readyCount]="facade.readyLineCount()"
              [totalCount]="facade.totalLineCount()"
              (confirmMaterials)="facade.openKitReserveConfirm()"
              (retrySupply)="facade.loadSupply()"
            />
          </section>

          <section data-test="order-ws-logistics">
            <h2 class="text-sm font-medium m-0 mb-2">Логистика</h2>
            <pi-order-ws-logistics
              [reservationLoading]="facade.reservationLoading()"
              [reservationError]="facade.reservationError()"
              [reservationCounters]="facade.reservationCounters()"
              [shipmentsLoading]="facade.shipmentsLoading()"
              [shipmentsError]="facade.shipmentsError()"
              [hasShipment]="facade.hasShipment()"
              [shipmentNumber]="facade.shipmentNumber()"
              [shipmentDateLabel]="facade.shipmentDateLabel()"
              [shipmentHasDocs]="facade.shipmentHasDocs()"
              [shipmentCancellable]="facade.shipmentCancellable()"
              [canMarkShipped]="facade.canMarkShipped()"
              [orderId]="order._id"
              (ship)="facade.openShipConfirm()"
              (cancelShipment)="facade.cancelActiveShipment()"
            />
          </section>

          <section data-test="order-ws-documents">
            <h2 class="text-sm font-medium m-0 mb-2">Документы</h2>
            <pi-order-ws-documents [orderId]="order._id" />
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
