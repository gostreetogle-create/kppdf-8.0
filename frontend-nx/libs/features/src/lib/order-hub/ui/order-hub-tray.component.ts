import { ChangeDetectionStrategy, Component, OnInit, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { type Order, type OrderItem } from '@kppdf/data-access';
import { CompositionTreeComponent, type CompositionTreeSelectEvent } from '@kppdf/features/composition';
import { orderStatusLabel } from './order-status';
import { OrderHubFacade } from '../order-hub.facade';

/**
 * Order hub expand — hub-only (TZ-NX-DEALS-D2). Most desk-write controls (confirm,
 * add-line, notebook) stay legacy-only until a dedicated `/desk` route ships (out
 * of this wave). Groups per PO visual lock (2026-08-15, `docs/pages/orders.page.md`
 * § Визуальная иерархия expand): Заказ → Исполнение (Снабжение/Производство/
 * Готовность) → Логистика (Склад/Отгрузка) → Документы.
 *
 * TZ-NX-SHIP-S2 — «Отгрузка» block reads real `Shipment` data (row-expand-lazy
 * budget: supply=1 + reservations=1 + shipments=1).
 * TZ-NX-SHIP-S3 — «Отгружено» whole-order ship-without-doc IS a hub-write
 * control (`order-ship-button`, confirm dialog → `PiOrdersService.ship()`).
 * TZ-NX-SHIP-S4 — «Отменить отгрузку» (`order-cancel-shipment-button`) mirrors
 * the registry's TZ-SHIP-433 gate (draft/scheduled, no `dispatchedAt`) via
 * `PiShipmentsService.cancelShipment`; registry cancel (S1, `/shipping`) is
 * unchanged — this is the same API, just reachable without leaving `/orders`.
 *
 * TZ-NX-ORDER-HUB-FACADE — domain signals + load/ship/reserve/cancel/
 * composition methods moved to `OrderHubFacade`; this component stays a
 * thin host (template + input wiring).
 */
@Component({
  selector: 'app-order-hub-tray',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [OrderHubFacade],
  imports: [RouterLink, CompositionTreeComponent],
  template: `
    <div
      class="order-hub-tray bg-paper-2 border-t hairline"
      data-test="order-hub-tray"
      role="region"
      [attr.aria-label]="'Сводка заказа: ' + order().number"
    >
      <div class="px-4 pt-4" data-test="order-hub-actions">
        <a
          [routerLink]="['/orders', order()._id]"
          class="pi-outline-btn pi-focus-ring"
          data-test="order-hub-edit-cta"
          (click)="$event.stopPropagation()"
          >Редактировать заказ</a
        >
      </div>
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-5 p-4" data-test="order-lifecycle-groups">
        <!-- Заказ -->
        <section class="min-w-0 hairline rounded-sm bg-paper p-4" data-test="order-group-order">
          <button
            type="button"
            class="flex items-center gap-3 w-full min-h-touch text-left text-sm pi-focus-ring rounded-sm hover:bg-paper-2 px-2"
            [attr.aria-expanded]="compositionExpanded()"
            (click)="toggleComposition()"
            data-test="order-composition-toggle"
          >
            <span class="font-medium">Состав заказа</span>
            <span class="flex-1"></span>
            <span class="text-xs text-muted-foreground">
              {{ order().items?.length ?? 0 }} поз.
            </span>
            <span class="border hairline px-2 py-0.5 text-xs rounded-sm" aria-hidden="true">
              {{ compositionExpanded() ? 'свернуть' : 'раскрыть' }}
            </span>
          </button>
          @if (compositionExpanded()) {
            <div class="border-t hairline pt-3 mt-3" data-test="order-composition-panel">
              @if ((order().items?.length ?? 0) === 0) {
                <p class="text-xs text-muted-foreground m-0">Состав пуст.</p>
              } @else if (compositionLoading()) {
                <p class="text-sm text-muted-foreground py-3 m-0" data-test="order-composition-loading">
                  Загрузка состава…
                </p>
              } @else {
                <div class="space-y-3" data-test="order-composition-tree">
                  @for (item of order().items ?? []; track trackItem($index, item)) {
                    <div>
                      <div class="text-xs text-muted-foreground mb-1" data-test="order-item-fact">
                        {{ lineLabel(item) }} ·
                        {{ item.readyForWork === true ? 'готово' : 'не готово' }}
                      </div>
                      @if (compositionRoots()[$index]; as root) {
                        <pi-composition-tree
                          [root]="root"
                          [selectedId]="compositionSelectedId()"
                          ariaLabel="Состав изделия в заказе"
                          (selectedChange)="onCompositionSelect($event)"
                        />
                      } @else {
                        <p class="text-xs text-muted-foreground m-0" data-test="order-composition-line">
                          {{ lineLabel(item) }}
                        </p>
                      }
                    </div>
                  }
                </div>
              }
              <a
                [routerLink]="['/orders', order()._id]"
                class="pi-outline-btn mt-3"
                (click)="$event.stopPropagation()"
                >Редактировать заказ</a
              >
            </div>
          }
        </section>

        <!-- Исполнение: Снабжение + Производство + Готовность -->
        <section class="min-w-0 hairline rounded-sm bg-paper p-4" data-test="order-group-execution">
          <h3 class="text-sm font-medium text-ink m-0 mb-3">Исполнение</h3>

          <div class="flex flex-col gap-3">
            <section class="min-w-0 flex flex-col gap-1.5 rounded-sm bg-paper-2 p-3" data-test="order-supply-block">
              <div class="flex items-baseline gap-3 flex-wrap">
                <span class="text-xs text-muted-foreground">Снабжение</span>
                <button
                  type="button"
                  class="pi-outline-btn ml-auto disabled:opacity-40 disabled:cursor-not-allowed"
                  data-test="order-confirm-materials"
                  (click)="openKitReserveConfirm($event)"
                  [disabled]="(order().items?.length ?? 0) === 0"
                >
                  Подтвердить материалы
                </button>
                <a
                  routerLink="/supply"
                  [queryParams]="{ orderId: order()._id }"
                  class="pi-outline-btn"
                  data-test="order-supply-link"
                  (click)="$event.stopPropagation()"
                  >Снабжение</a
                >
              </div>
              @if (supplyLoading()) {
                <p class="text-xs text-muted-foreground m-0">Загрузка…</p>
              } @else if (supplyError()) {
                <p class="text-xs text-destructive m-0" role="alert" data-test="order-supply-error">
                  {{ supplyError() }}
                </p>
              } @else if (supplyCounters().total === 0) {
                <p class="text-xs text-muted-foreground m-0">Нет задач снабжения</p>
              } @else {
                <p class="text-xs m-0" data-test="order-supply-counters">
                  Заказано {{ supplyCounters().ordered }} · Получено {{ supplyCounters().received }} · всего
                  {{ supplyCounters().total }}
                </p>
              }
            </section>

            <section
              class="min-w-0 flex flex-col gap-1.5 rounded-sm bg-paper-2 p-3"
              data-test="order-production-block"
            >
              <div class="flex items-baseline gap-3 flex-wrap">
                <span class="text-xs text-muted-foreground">Производство</span>
                <a
                  routerLink="/production"
                  [queryParams]="{ orderId: order()._id }"
                  class="pi-outline-btn ml-auto"
                  data-test="order-production-link"
                  (click)="$event.stopPropagation()"
                  >Производство</a
                >
              </div>
              <p class="text-xs text-muted-foreground m-0">Оценка в цехе</p>
            </section>

            <section
              class="min-w-0 flex flex-col gap-1 rounded-sm bg-paper-2 p-3"
              data-test="order-readiness-block"
            >
              <div class="flex items-baseline gap-3 flex-wrap">
                <span class="text-xs text-muted-foreground">Готовность</span>
                <span class="text-sm m-0 font-medium" data-test="order-readiness-summary">
                  {{ readinessLabel() }}
                </span>
                <a
                  [routerLink]="['/orders', order()._id]"
                  class="pi-outline-btn ml-auto"
                  data-test="order-readiness-link"
                  (click)="$event.stopPropagation()"
                  >Редактировать заказ</a
                >
              </div>
              @if ((order().items?.length ?? 0) > 0) {
                <ul class="m-0 mt-1 pl-4 space-y-0.5 text-sm" data-test="order-readiness-lines">
                  @for (item of order().items ?? []; track trackItem($index, item)) {
                    <li>
                      {{ lineLabel(item) }} ·
                      <span
                        [class.text-muted-foreground]="item.readyForWork !== true"
                        [attr.data-test]="item.readyForWork === true ? 'order-readiness-ready' : 'order-readiness-not-ready'"
                      >
                        {{ item.readyForWork === true ? 'готово' : 'не готово' }}
                      </span>
                    </li>
                  }
                </ul>
              }
            </section>
          </div>
        </section>

        <!-- Логистика: Склад + Отгрузка -->
        <section class="min-w-0 hairline rounded-sm bg-paper p-4" data-test="order-group-logistics">
          <h3 class="text-sm font-medium text-ink m-0 mb-3">Логистика</h3>

          <div class="flex flex-col gap-3">
            <section class="min-w-0 flex flex-col gap-1 rounded-sm bg-paper-2 p-3" data-test="order-warehouse-block">
              <div class="flex items-baseline gap-3 flex-wrap">
                <span class="text-xs text-muted-foreground">Склад</span>
                <a
                  routerLink="/storage-items"
                  class="pi-outline-btn ml-auto"
                  data-test="order-warehouse-link"
                  (click)="$event.stopPropagation()"
                  >Открыть</a
                >
              </div>
              @if (reservationLoading()) {
                <p class="text-xs text-muted-foreground m-0 mt-1">Загрузка…</p>
              } @else if (reservationError()) {
                <p class="text-xs text-destructive m-0 mt-1" role="alert" data-test="order-warehouse-error">
                  {{ reservationError() }}
                </p>
              } @else if (reservationCounters().total === 0) {
                <p class="text-xs text-muted-foreground m-0 mt-1">Нет броней</p>
              } @else {
                <p class="text-xs m-0 mt-1" data-test="order-warehouse-counters">
                  Активных {{ reservationCounters().active }} · всего {{ reservationCounters().total }}
                </p>
              }
            </section>

            <section
              class="min-w-0 flex flex-col gap-1 rounded-sm bg-paper-2 p-3"
              data-test="order-shipping-block"
            >
              <div class="flex items-baseline gap-3 flex-wrap">
                <span class="text-xs text-muted-foreground">Отгрузка</span>
                <a
                  [routerLink]="['/shipping']"
                  [queryParams]="{ orderId: order()._id }"
                  class="pi-outline-btn ml-auto"
                  data-test="order-shipping-link"
                  (click)="$event.stopPropagation()"
                  >Открыть раздел „Отгрузка“</a
                >
              </div>
              @if (shipmentsLoading()) {
                <p class="text-xs text-muted-foreground m-0 mt-1">Загрузка…</p>
              } @else if (shipmentsError()) {
                <p class="text-xs text-destructive m-0 mt-1" role="alert" data-test="order-shipment-error">
                  {{ shipmentsError() }}
                </p>
              } @else if (hasShipment()) {
                <div class="flex flex-col gap-0.5 mt-1" data-test="order-shipment-block">
                  <span class="text-xs" data-test="order-shipment-summary">
                    Отгружен: {{ shipmentNumber() }} · {{ shipmentDateLabel() }}
                  </span>
                  @if (!shipmentHasDocs()) {
                    <span class="text-xs text-muted-foreground" data-test="order-shipment-no-docs">
                      Документ не оформлен
                    </span>
                  }
                  @if (shipmentCancellable()) {
                    <button
                      type="button"
                      class="pi-outline-btn pi-outline-btn-destructive w-full mt-1"
                      (click)="cancelActiveShipment($event)"
                      data-test="order-cancel-shipment-button"
                    >
                      Отменить отгрузку
                    </button>
                  }
                </div>
              } @else if (canMarkShipped()) {
                <button
                  type="button"
                  class="pi-outline-btn w-full mt-1"
                  (click)="openShipConfirm($event)"
                  data-test="order-ship-button"
                >
                  Отгружено
                </button>
              } @else {
                <p class="text-xs text-muted-foreground m-0 mt-1" data-test="order-shipping-summary">
                  Отгрузка не оформлена
                </p>
              }
            </section>
          </div>
        </section>

        <!-- Документы -->
        <section class="min-w-0 hairline rounded-sm bg-paper p-4" data-test="order-group-documents">
          <h3 class="text-sm font-medium text-ink m-0 mb-3">Документы</h3>
          <a
            routerLink="/doc-constructor/templates"
            [queryParams]="{ source: 'order', sourceId: order()._id }"
            class="pi-outline-btn"
            data-test="order-documents-link"
            (click)="$event.stopPropagation()"
            >Шаблоны документов</a
          >
        </section>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class OrderHubTrayComponent implements OnInit {
  readonly order = input.required<Order>();

  protected readonly facade = inject(OrderHubFacade);

  protected readonly compositionExpanded = this.facade.compositionExpanded;
  protected readonly compositionLoading = this.facade.compositionLoading;
  protected readonly compositionRoots = this.facade.compositionRoots;
  protected readonly compositionSelectedId = this.facade.compositionSelectedId;

  protected readonly supplyLoading = this.facade.supplyLoading;
  protected readonly supplyError = this.facade.supplyError;
  protected readonly supplyCounters = this.facade.supplyCounters;

  protected readonly reservationLoading = this.facade.reservationLoading;
  protected readonly reservationError = this.facade.reservationError;
  protected readonly reservationCounters = this.facade.reservationCounters;

  protected readonly shipmentsLoading = this.facade.shipmentsLoading;
  protected readonly shipmentsError = this.facade.shipmentsError;
  protected readonly shipments = this.facade.shipments;

  protected readonly statusLabel = orderStatusLabel;

  constructor() {
    this.facade.bind({ order: this.order });
  }

  ngOnInit(): void {
    // Row-expand-lazy (HUB-303 budget: supply=1 + reservations=1 + shipments=1).
    // Composition stays behind its own disclosure — loaded only on first toggle.
    this.facade.init();
  }

  protected trackItem(index: number, item: OrderItem): string {
    return `${index}:${item.productId}`;
  }

  protected lineLabel(item: OrderItem): string {
    return item.productName || `Изделие ${item.productId.slice(0, 8)}…`;
  }

  protected readinessLabel(): string {
    const items = this.order().items ?? [];
    if (items.length === 0) return '—';
    const ready = items.filter((item) => item.readyForWork === true).length;
    return `${ready} из ${items.length}`;
  }

  protected onCompositionSelect(ev: CompositionTreeSelectEvent): void {
    this.facade.onCompositionSelect(ev);
  }

  protected toggleComposition(): void {
    this.facade.toggleComposition();
  }

  protected openKitReserveConfirm(event: Event): void {
    this.facade.openKitReserveConfirm(event);
  }

  protected hasShipment(): boolean {
    return this.facade.hasShipment();
  }

  protected shipmentNumber(): string {
    return this.facade.shipmentNumber();
  }

  protected shipmentDateLabel(): string {
    return this.facade.shipmentDateLabel();
  }

  protected shipmentHasDocs(): boolean {
    return this.facade.shipmentHasDocs();
  }

  protected shipmentCancellable(): boolean {
    return this.facade.shipmentCancellable();
  }

  protected cancelActiveShipment(event: Event): void {
    this.facade.cancelActiveShipment(event);
  }

  protected canMarkShipped(): boolean {
    return this.facade.canMarkShipped();
  }

  protected openShipConfirm(event: Event): void {
    this.facade.openShipConfirm(event);
  }
}
