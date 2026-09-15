import { ChangeDetectionStrategy, Component, DestroyRef, Injector, OnInit, computed, inject } from '@angular/core';
import type { CreateCounterpartyPayload, CreateOrganizationPayload, CreateSitePayload } from '@kppdf/data-access';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { PiDialogService } from '@kppdf/ui/dialog';
import { PiGroupWorkspaceComponent, type GroupChip } from '@kppdf/features';
import {
  OrderWorkspaceFacade,
  OrderWsCompositionComponent,
  OrderWsDocumentsComponent,
  OrderWsExecutionComponent,
  OrderWsHeaderComponent,
  OrderWsLogisticsComponent,
} from '@kppdf/features/order-workspace';
import { orderStatusLabel } from './order-status';
import { onDialogCloseOnce } from '../on-dialog-close-once';
import { CounterpartyFormDialogComponent } from '../counterparties/counterparty-form-dialog.component';
import { OrganizationFormDialogComponent } from './organization-form-dialog.component';
import { SiteFormDialogComponent, type SiteFormDialogData } from './site-form-dialog.component';

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
    PiGroupWorkspaceComponent,
    OrderWsHeaderComponent,
    OrderWsCompositionComponent,
    OrderWsExecutionComponent,
    OrderWsLogisticsComponent,
    OrderWsDocumentsComponent,
  ],
  template: `
    <app-pi-group-workspace
      [toc]="[]"
      tocActiveId=""
      [chips]="chips()"
      activeId="order"
      dataTestPrefix="order-workflow-chip"
    >
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
                [organizations]="facade.organizations()"
                [counterparties]="facade.counterparties()"
                [sites]="facade.sites()"
                [organizationId]="facade.organizationId()"
                [counterpartyId]="facade.counterpartyId()"
                [siteId]="facade.siteId()"
                [savingMeta]="facade.savingMeta()"
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
                (organizationIdChange)="facade.setOrganization($event)"
                (counterpartyIdChange)="facade.setCounterparty($event)"
                (siteIdChange)="facade.setSite($event)"
                (createOrganization)="openCreateOrganization()"
                (createCounterparty)="openCreateCounterparty()"
                (createSite)="openCreateSite()"
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
                (createProduct)="facade.openCreateProduct()"
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
    </app-pi-group-workspace>
  `,
})
export class OrderDetailPage implements OnInit {
  protected readonly facade = inject(OrderWorkspaceFacade);
  private readonly dialog = inject(PiDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly statusLabel = orderStatusLabel;

  /**
   * TZ-NX-ORDER-WS-CHROME-TOP — workflow strip fed into `PiGroupWorkspace`'s
   * sticky `[chips]` row (was `OrderWsWorkflowChipsComponent`'s own
   * body-level `<nav>` below the h1). Empty until the order loads — same
   * gate the old component had (it only ever rendered inside the loaded
   * branch). `order` self-links to its own detail route, same pattern as
   * `home.page.ts`'s active "home" chip.
   */
  protected readonly chips = computed<readonly GroupChip[]>(() => {
    const order = this.facade.order();
    if (!order) return [];
    const orderId = order._id;
    return [
      { id: 'home', label: 'Главная', route: '/home' },
      { id: 'quotation', label: 'КП', route: '/studio' },
      { id: 'production', label: 'Гант', route: '/production', queryParams: { orderId } },
      { id: 'supply', label: 'Снабжение', route: '/supply', queryParams: { orderId } },
      { id: 'shipping', label: 'Отгрузка', route: '/shipping', queryParams: { orderId } },
      { id: 'order', label: 'Заказ', route: `/orders/${orderId}` },
    ];
  });

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

  /**
   * TZ-NX-ORDER-WS-META-INLINE — the three «+» quick-create flows open
   * their dialog here (app-level, same app as the dialog components) and
   * hand the resulting payload to the facade, which owns the actual
   * POST + order PATCH. `OrderWsHeaderComponent` stays dumb — it only
   * emits the click.
   */
  protected openCreateOrganization(): void {
    const ref = this.dialog.open<CreateOrganizationPayload | undefined>(OrganizationFormDialogComponent, {
      width: 'sm',
      ariaLabel: 'Создать нашу фирму',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (payload) => {
      if (payload) void this.facade.createOrganization(payload);
    });
  }

  protected openCreateCounterparty(): void {
    const ref = this.dialog.open<CreateCounterpartyPayload | undefined>(CounterpartyFormDialogComponent, {
      data: {},
      width: 'sm',
      ariaLabel: 'Создать заказчика',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (payload) => {
      if (payload) void this.facade.createCounterparty(payload);
    });
  }

  protected openCreateSite(): void {
    const counterpartyId = this.facade.counterpartyId();
    if (!counterpartyId) return;
    const data: SiteFormDialogData = { counterpartyId };
    const ref = this.dialog.open<CreateSitePayload | undefined>(SiteFormDialogComponent, {
      data,
      width: 'sm',
      ariaLabel: 'Создать объект',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (payload) => {
      if (payload) void this.facade.createSite(payload);
    });
  }
}
