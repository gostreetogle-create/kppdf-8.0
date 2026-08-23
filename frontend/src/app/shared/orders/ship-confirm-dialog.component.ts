import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ButtonComponent } from '../ui/button/button.component';
import { PiDialogComponent } from '../ui/dialog/pi-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../ui/dialog/dialog.tokens';
import type { DialogRef } from '../ui/dialog/pi-dialog.service';
import type { Order } from '../services/orders.service';

export interface ShipConfirmDialogData {
  order: Order;
}

export interface ShipConfirmResult {
  recipient?: string;
  address?: string;
  driverInfo?: string;
}

function counterpartyLabel(order: Order): string {
  const cp = order.counterpartyId;
  return cp && typeof cp === 'object' ? (cp.name ?? '') : '';
}

function siteAddressLabel(order: Order): string {
  if (order.deliveryAddress) return order.deliveryAddress;
  const site = order.siteId;
  return site && typeof site === 'object' ? (site.address ?? '') : '';
}

/**
 * TZ-DESK-430 — «Отгружено» без документа. Confirm-form с автозаполнением,
 * открывается через PiDialogService (не смена route). Отгрузка возможна
 * без накладной — метаданные момента формируют блок «Отгружен» в tray.
 */
@Component({
  selector: 'app-ship-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, PiDialogComponent],
  template: `
    <app-pi-dialog
      [title]="'Отметить заказ ' + data.order.number + ' отгруженным?'"
      [width]="'sm'"
      [variant]="'alert'"
      [showClose]="false"
      [animate]="false"
    >
      <div body class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <span class="text-xs text-muted-foreground">Заказ</span>
          <span class="text-sm" data-test="ship-confirm-order">{{ data.order.number }}</span>
        </div>
        <label class="flex flex-col gap-1">
          <span class="text-xs text-muted-foreground">Клиент / получатель</span>
          <input
            class="pi-input"
            [value]="recipient()"
            (input)="recipient.set($any($event.target).value)"
            data-test="ship-confirm-recipient"
          />
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-xs text-muted-foreground">Адрес</span>
          <input
            class="pi-input"
            [value]="address()"
            (input)="address.set($any($event.target).value)"
            data-test="ship-confirm-address"
          />
        </label>
        <div class="flex flex-col gap-1">
          <span class="text-xs text-muted-foreground">Дата/время</span>
          <span class="text-sm" data-test="ship-confirm-now">{{ nowLabel }}</span>
        </div>
        <label class="flex flex-col gap-1">
          <span class="text-xs text-muted-foreground">Примечание (опционально)</span>
          <textarea
            class="pi-input"
            rows="2"
            [value]="note()"
            (input)="note.set($any($event.target).value)"
            data-test="ship-confirm-note"
          ></textarea>
        </label>
      </div>
      <div footer>
        <app-pi-button
          variant="ghost"
          size="sm"
          data-test="ship-confirm-cancel"
          (click)="onCancel()"
        >
          Отмена
        </app-pi-button>
        <app-pi-button size="sm" data-test="ship-confirm-submit" (click)="onConfirm()">
          Отгружено
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class ShipConfirmDialogComponent {
  readonly data = inject<ShipConfirmDialogData>(PI_DIALOG_DATA);
  private readonly ref = inject<DialogRef<ShipConfirmResult>>(PI_DIALOG_REF);

  protected readonly recipient = signal(counterpartyLabel(this.data.order));
  protected readonly address = signal(siteAddressLabel(this.data.order));
  protected readonly note = signal('');
  protected readonly nowLabel = new Date().toLocaleString('ru-RU');

  protected onConfirm(): void {
    this.ref.close({
      recipient: this.recipient().trim() || undefined,
      address: this.address().trim() || undefined,
      driverInfo: this.note().trim() || undefined,
    });
  }

  protected onCancel(): void {
    this.ref.close();
  }
}
