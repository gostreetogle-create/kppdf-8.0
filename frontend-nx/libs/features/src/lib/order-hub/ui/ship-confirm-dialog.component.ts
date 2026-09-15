import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiDialogComponent, PI_DIALOG_DATA, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import type { Order } from '@kppdf/data-access';

export interface ShipConfirmDialogData {
  readonly order: Order;
}

export interface ShipConfirmResult {
  readonly recipient?: string;
  readonly address?: string;
  readonly driverInfo?: string;
}

function counterpartyLabel(order: Order): string {
  const cp = order.counterpartyId;
  return cp && typeof cp === 'object' ? (cp.name ?? '') : '';
}

function siteAddressLabel(order: Order): string {
  const site = order.siteId;
  return site && typeof site === 'object' ? (site.address ?? '') : '';
}

/**
 * TZ-NX-SHIP-S3 — «Отгружено» без документа, mirrors legacy `ShipConfirmDialogComponent`
 * (TZ-DESK-430). Whole-order ship; ship-with-doc still happens via the `/shipping`
 * registry create form (S1) for the warehouse-tracked case.
 */
@Component({
  selector: 'pi-ship-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, PiDialogComponent],
  template: `
    <app-pi-dialog
      [title]="'Отметить заказ ' + data.order.number + ' отгруженным?'"
      variant="form"
      width="sm"
      [showClose]="true"
      (userClose)="cancel()"
    >
      <div body class="flex flex-col gap-3">
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
      <div footer class="flex justify-end gap-3">
        <app-pi-button type="button" variant="outline" (click)="cancel()" data-test="ship-confirm-cancel">
          Отмена
        </app-pi-button>
        <app-pi-button type="button" variant="default" (click)="confirm()" data-test="ship-confirm-submit">
          Отгружено
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class ShipConfirmDialogComponent {
  readonly data = inject<ShipConfirmDialogData>(PI_DIALOG_DATA);
  private readonly ref = inject<DialogRef<ShipConfirmResult | undefined>>(PI_DIALOG_REF);

  protected readonly recipient = signal(counterpartyLabel(this.data.order));
  protected readonly address = signal(siteAddressLabel(this.data.order));
  protected readonly note = signal('');

  confirm(): void {
    this.ref.close({
      recipient: this.recipient().trim() || undefined,
      address: this.address().trim() || undefined,
      driverInfo: this.note().trim() || undefined,
    });
  }

  cancel(): void {
    this.ref.close(undefined);
  }
}
