import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { ReservationCounters } from '../order-workspace.facade';

/**
 * TZ-NX-ORDER-WS-LOGISTICS — dumb Логистика section: Склад (reservation
 * counters, no cells) + Отгрузка (active-shipment summary or the
 * «Отгружено»/«Отменить отгрузку» actions, same wording/data-test as
 * `order-hub-tray.component.ts`'s reference markup — whole-order only, no
 * per-line ship). No facade injection; dialogs/writes live on
 * `OrderWorkspaceFacade`.
 */
@Component({
  selector: 'pi-order-ws-logistics',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-5" data-test="logistics-groups">
      <section class="min-w-0 hairline rounded-sm bg-paper p-4" data-test="logistics-warehouse">
        <div class="flex items-baseline gap-3 flex-wrap mb-2">
          <h3 class="text-sm font-medium m-0">Склад</h3>
          <a routerLink="/storage-items" class="pi-outline-btn ml-auto" data-test="logistics-warehouse-link">Открыть</a>
        </div>
        @if (reservationLoading()) {
          <p class="text-xs text-muted-foreground m-0">Загрузка…</p>
        } @else if (reservationError(); as err) {
          <p class="text-xs text-destructive m-0" role="alert" data-test="logistics-warehouse-error">{{ err }}</p>
        } @else if (reservationCounters().total === 0) {
          <p class="text-xs text-muted-foreground m-0" data-test="logistics-warehouse-empty">Нет броней</p>
        } @else {
          <p class="text-xs m-0" data-test="logistics-warehouse-counters">
            Активных {{ reservationCounters().active }} · всего {{ reservationCounters().total }}
          </p>
        }
      </section>

      <section class="min-w-0 hairline rounded-sm bg-paper p-4" data-test="logistics-shipping">
        <div class="flex items-baseline gap-3 flex-wrap mb-2">
          <h3 class="text-sm font-medium m-0">Отгрузка</h3>
          <span class="text-xs text-muted-foreground" data-test="logistics-whole-order-hint">целым заказом</span>
          <a
            [routerLink]="['/shipping']"
            [queryParams]="{ orderId: orderId() }"
            class="pi-outline-btn ml-auto"
            data-test="logistics-shipping-link"
          >
            Открыть раздел «Отгрузка»
          </a>
        </div>
        @if (shipmentsLoading()) {
          <p class="text-xs text-muted-foreground m-0">Загрузка…</p>
        } @else if (shipmentsError(); as err) {
          <p class="text-xs text-destructive m-0" role="alert" data-test="logistics-shipment-error">{{ err }}</p>
        } @else if (hasShipment()) {
          <div class="flex flex-col gap-0.5" data-test="logistics-shipment-block">
            <span class="text-xs" data-test="logistics-shipment-summary">
              Отгружен: {{ shipmentNumber() }} · {{ shipmentDateLabel() }}
            </span>
            @if (!shipmentHasDocs()) {
              <span class="text-xs text-muted-foreground" data-test="logistics-shipment-no-docs">Документ не оформлен</span>
            }
            @if (shipmentCancellable()) {
              <button
                type="button"
                class="pi-outline-btn pi-outline-btn-destructive w-full mt-1"
                data-test="logistics-cancel-shipment"
                (click)="cancelShipment.emit()"
              >
                Отменить отгрузку
              </button>
            }
          </div>
        } @else if (canMarkShipped()) {
          <button type="button" class="pi-outline-btn w-full" data-test="logistics-ship-button" (click)="ship.emit()">
            Отгружено
          </button>
        } @else {
          <p class="text-xs text-muted-foreground m-0" data-test="logistics-shipment-none">Отгрузка не оформлена</p>
        }
      </section>
    </div>
  `,
})
export class OrderWsLogisticsComponent {
  readonly reservationLoading = input(false);
  readonly reservationError = input<string | null>(null);
  readonly reservationCounters = input<ReservationCounters>({ active: 0, total: 0 });
  readonly shipmentsLoading = input(false);
  readonly shipmentsError = input<string | null>(null);
  readonly hasShipment = input(false);
  readonly shipmentNumber = input('—');
  readonly shipmentDateLabel = input('—');
  readonly shipmentHasDocs = input(false);
  readonly shipmentCancellable = input(false);
  readonly canMarkShipped = input(false);
  readonly orderId = input('');

  readonly ship = output<void>();
  readonly cancelShipment = output<void>();
}
