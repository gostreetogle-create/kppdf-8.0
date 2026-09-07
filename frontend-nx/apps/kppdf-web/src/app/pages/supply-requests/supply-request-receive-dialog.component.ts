import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  PiSupplyRequestsService,
  type SupplyRequest,
  type Warehouse,
} from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiDialogComponent, PI_DIALOG_DATA, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import { FormFieldComponent } from '@kppdf/ui/form-field';

export interface SupplyRequestReceiveDialogData {
  readonly request: SupplyRequest;
  readonly warehouses: readonly Warehouse[];
}

/**
 * TZ-NX-SUPPLY-S4-RECEIVE-TO-STOCK — HITL confirm dialog. Posts via
 * `PiSupplyRequestsService.receive`; the server is the sole write-path
 * (creates the `StockMovement` IN, this dialog never touches stock directly).
 */
@Component({
  selector: 'pi-supply-request-receive-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, PiDialogComponent, FormFieldComponent],
  template: `
    <app-pi-dialog title="Подтвердить получение" variant="content" width="sm" [showClose]="true" (userClose)="cancel()">
      <div body class="space-y-form-field" data-test="supply-request-receive-form">
        <p class="text-sm text-muted-foreground m-0">
          {{ data.request.title || data.request.article || 'Без названия' }} — план {{ data.request.qty }} {{ data.request.unit }}
        </p>
        <app-pi-form-field label="Склад" htmlFor="receive-warehouse" [required]="true">
          <select id="receive-warehouse" class="pi-input w-full" [value]="warehouseId()" (change)="onWarehouseChange($event)" data-test="supply-request-receive-warehouse">
            @if (data.warehouses.length === 0) {
              <option value="">Нет складов</option>
            }
            @for (w of data.warehouses; track w._id) {
              <option [value]="w._id">{{ w.name }}{{ w.isDefault ? ' (по умолчанию)' : '' }}</option>
            }
          </select>
        </app-pi-form-field>
        <app-pi-form-field label="Получено (факт)" htmlFor="receive-qty" [required]="true">
          <input id="receive-qty" type="number" min="0.0001" step="any" class="pi-input w-full" [value]="receivedQty()" (input)="onQtyChange($event)" data-test="supply-request-receive-qty" />
        </app-pi-form-field>
        @if (error()) {
          <p class="text-sm text-destructive m-0" role="alert" data-test="supply-request-receive-error">{{ error() }}</p>
        }
      </div>
      <div footer class="flex justify-end gap-3">
        <app-pi-button type="button" variant="outline" [disabled]="saving()" (click)="cancel()">Отмена</app-pi-button>
        <app-pi-button type="button" variant="default" [disabled]="saving()" (click)="submit()" data-test="supply-request-receive-submit">
          {{ saving() ? 'Проведение…' : 'Подтвердить' }}
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class SupplyRequestReceiveDialogComponent {
  readonly data = inject<SupplyRequestReceiveDialogData>(PI_DIALOG_DATA);
  readonly ref = inject<DialogRef<SupplyRequest | undefined>>(PI_DIALOG_REF);
  private readonly api = inject(PiSupplyRequestsService);

  readonly warehouseId = signal(this.data.warehouses.find((w) => w.isDefault)?._id ?? this.data.warehouses[0]?._id ?? '');
  readonly receivedQty = signal(this.data.request.qty);
  readonly saving = signal(false);
  readonly error = signal('');

  onWarehouseChange(event: Event): void {
    this.warehouseId.set((event.target as HTMLSelectElement).value);
  }

  onQtyChange(event: Event): void {
    this.receivedQty.set(Number((event.target as HTMLInputElement).value));
  }

  async submit(): Promise<void> {
    if (this.saving()) return;
    const qty = this.receivedQty();
    if (!Number.isFinite(qty) || qty <= 0) {
      this.error.set('Количество должно быть больше 0.');
      return;
    }
    if (!this.warehouseId()) {
      this.error.set('Выберите склад.');
      return;
    }

    this.saving.set(true);
    this.error.set('');
    const result = await firstValueFrom(
      this.api.receive(this.data.request._id, { warehouseId: this.warehouseId(), receivedQty: qty }),
    );
    if (result.ok) {
      this.ref.close(result.data);
    } else {
      this.error.set(extractErrorMessage(result.error));
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.ref.close(undefined);
  }
}
