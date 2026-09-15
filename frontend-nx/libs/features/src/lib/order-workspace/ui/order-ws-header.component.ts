import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PiStatusBannerComponent } from '@kppdf/ui/status-banner';
import { ButtonComponent } from '@kppdf/ui/button';

/**
 * TZ-NX-ORDER-WS-HEADER — dumb workspace header: number/status banner,
 * dates, Заказчик/Объект/Наша фирма/КП grid, isPaid checkbox, and the only
 * three live lifecycle CTAs (Подтвердить/Отменить/back). No facade
 * injection — all state comes in via inputs, all writes go out via
 * outputs; `OrderWorkspaceFacade` owns the actual PATCH/POST + confirm
 * dialogs. `paidToggle` forwards the raw native `Event` unchanged so the
 * page's existing `onPaidToggle` (same since TZ-NX-ORDER-WS-FACADE-SHELL)
 * still reads `event.target` as the real DOM checkbox — no DOM-revert
 * behavior risk from moving the markup into this component.
 */
@Component({
  selector: 'pi-order-ws-header',
  standalone: true,
  imports: [RouterLink, PiStatusBannerComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-pi-status-banner [tone]="bannerTone()" [message]="statusLabel()" />

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mt-4">
      <div>
        <div class="text-xs text-muted-foreground">Заказчик</div>
        @if (counterpartyName(); as name) {
          <a
            class="font-medium underline-offset-2 hover:underline"
            routerLink="/counterparties"
            data-test="order-counterparty-link"
          >
            {{ name }}
          </a>
        } @else {
          <div class="font-medium">—</div>
        }
      </div>
      <div>
        <div class="text-xs text-muted-foreground">Объект</div>
        <div class="font-medium">{{ siteName() ?? '—' }}</div>
      </div>
      <div>
        <div class="text-xs text-muted-foreground">Наша фирма</div>
        <div class="font-medium">{{ organizationName() ?? '—' }}</div>
      </div>
      <div>
        <div class="text-xs text-muted-foreground">Дата заказа</div>
        <div class="font-medium" data-test="order-date">{{ orderDateLabel() }}</div>
      </div>
    </div>

    <div class="flex items-center justify-between gap-4 mt-4">
      <div class="text-sm">
        <span class="text-muted-foreground">КП: </span>
        @if (quotationId()) {
          <span class="font-medium" data-test="order-quotation">{{ quotationNumber() ?? 'Есть КП' }}</span>
        } @else {
          <span class="font-medium" data-test="order-no-quotation">Без КП</span>
        }
      </div>
      @if (quotationId()) {
        <app-pi-button variant="secondary" type="button" data-test="order-open-studio" (click)="openQuotation.emit()">
          КП в студии
        </app-pi-button>
      }
    </div>

    <label class="flex items-center gap-3 text-sm cursor-pointer select-none mt-4">
      <input
        type="checkbox"
        class="pi-checkbox"
        data-test="order-paid-toggle"
        [checked]="paid()"
        (change)="paidToggle.emit($event)"
      />
      <span>Оплачен</span>
    </label>

    <div class="flex flex-wrap items-center gap-3 mt-4">
      @if (canConfirm()) {
        <app-pi-button
          variant="default"
          type="button"
          data-test="order-confirm"
          [disabled]="confirming()"
          (click)="confirmOrder.emit()"
        >
          {{ confirming() ? 'Подтверждаем…' : 'Подтвердить заказ' }}
        </app-pi-button>
      }
      @if (canCancel()) {
        <app-pi-button
          variant="secondary"
          type="button"
          data-test="order-cancel"
          [disabled]="cancelling()"
          (click)="cancelOrder.emit()"
        >
          {{ cancelling() ? 'Отменяем…' : 'Отменить заказ' }}
        </app-pi-button>
      }
      <span class="flex-1"></span>
      <a class="pi-outline-btn" routerLink="/orders" data-test="order-back-to-list">← К списку</a>
      <a class="pi-outline-btn" routerLink="/home" data-test="order-back-home">На Главную</a>
    </div>
  `,
})
export class OrderWsHeaderComponent {
  readonly statusLabel = input('');
  readonly bannerTone = input<'warning' | 'info' | 'destructive' | 'neutral'>('info');
  readonly counterpartyName = input<string | null>(null);
  readonly siteName = input<string | null>(null);
  readonly organizationName = input<string | null>(null);
  readonly quotationId = input<string | null>(null);
  readonly quotationNumber = input<string | null>(null);
  readonly paid = input(false);
  readonly confirming = input(false);
  readonly cancelling = input(false);
  readonly canConfirm = input(false);
  readonly canCancel = input(false);
  readonly orderDateLabel = input('—');

  readonly paidToggle = output<Event>();
  readonly openQuotation = output<void>();
  readonly confirmOrder = output<void>();
  readonly cancelOrder = output<void>();
}
