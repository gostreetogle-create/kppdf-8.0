import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { Order } from './orders.service';
import { OrderFormPanelComponent } from './order-form-panel.component';

type Result = Order | null | undefined;

/**
 * OrderFormDialogComponent — thin dialog shell over `OrderFormPanelComponent`
 * (TZ-DESK-402). `/orders` and `/desk` share the same form and write-path; this
 * component only adds the `PiDialog` chrome and maps panel outputs to the
 * dialog close result.
 */
@Component({
  selector: 'app-order-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiDialogComponent, OrderFormPanelComponent],
  template: `
    <app-pi-dialog [title]="data ? 'Редактировать заказ' : 'Создать заказ'" [width]="'lg'">
      <app-order-form-panel
        body
        [order]="data"
        (saved)="onSaved($event)"
        (cancelled)="onCancelled()"
        class="block h-full min-h-0"
      />
    </app-pi-dialog>
  `,
})
export class OrderFormDialogComponent {
  private readonly ref = inject<DialogRef<Result>>(PI_DIALOG_REF);
  protected readonly data = inject<Order | null>(PI_DIALOG_DATA);

  protected onSaved(order: Order): void {
    this.ref.close(order);
  }

  protected onCancelled(): void {
    this.ref.close(null);
  }
}
