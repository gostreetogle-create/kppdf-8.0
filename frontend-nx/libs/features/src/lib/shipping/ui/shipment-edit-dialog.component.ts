import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PiShipmentsService, type Shipment, type Warehouse } from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiDialogComponent, PI_DIALOG_DATA, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import { PiFormSectionComponent } from '@kppdf/ui/form-section';
import { FormFieldComponent } from '@kppdf/ui/form-field';
import { InputComponent } from '@kppdf/ui/input';

export interface ShipmentEditDialogData {
  readonly shipment: Shipment;
  readonly warehouses: readonly Warehouse[];
}

/** TZ-NX-SHIP-S1 — recipient/address/driver/warehouse/notes, mirrors legacy shipping row editor. */
@Component({
  selector: 'pi-shipment-edit-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, PiDialogComponent, PiFormSectionComponent, FormFieldComponent, InputComponent],
  template: `
    <app-pi-dialog title="Изменить отгрузку" variant="content" width="md" [showClose]="true" (userClose)="cancel()">
      <div body class="space-y-4" data-test="shipping-edit-form">
        <app-pi-form-section title="Получатель и склад" headingId="shipment-edit-basics" tone="gold">
          <div class="space-y-form-field">
            <app-pi-form-field label="Получатель" htmlFor="shipment-edit-recipient">
              <app-pi-input id="shipment-edit-recipient" [value]="recipient()" (valueChange)="recipient.set($event)" data-test="shipping-edit-recipient" />
            </app-pi-form-field>
            <app-pi-form-field label="Адрес" htmlFor="shipment-edit-address">
              <app-pi-input id="shipment-edit-address" [value]="address()" (valueChange)="address.set($event)" data-test="shipping-edit-address" />
            </app-pi-form-field>
            <app-pi-form-field label="Водитель / перевозчик" htmlFor="shipment-edit-driver">
              <app-pi-input id="shipment-edit-driver" [value]="driverInfo()" (valueChange)="driverInfo.set($event)" data-test="shipping-edit-driver" />
            </app-pi-form-field>
            <app-pi-form-field label="Склад" htmlFor="shipment-edit-warehouse" [required]="true">
              <select
                id="shipment-edit-warehouse"
                class="pi-input w-full"
                [value]="warehouseId()"
                (change)="onWarehouseChange($event)"
                data-test="shipping-edit-warehouse"
              >
                <option value="">Выберите склад…</option>
                @for (warehouse of data.warehouses; track warehouse._id) {
                  <option [value]="warehouse._id">{{ warehouse.name }}</option>
                }
              </select>
            </app-pi-form-field>
            @if (data.warehouses.length === 0) {
              <p class="text-xs text-destructive m-0" role="alert" data-test="shipping-edit-warehouses-empty">
                Нет складов — создайте в разделе «Склад».
              </p>
            }
            <app-pi-form-field label="Примечание" htmlFor="shipment-edit-notes">
              <textarea id="shipment-edit-notes" class="pi-input w-full min-h-16" [value]="notes()" (input)="onNotesInput($event)" data-test="shipping-edit-notes"></textarea>
            </app-pi-form-field>
          </div>
        </app-pi-form-section>

        @if (error()) {
          <p class="text-sm text-destructive m-0" role="alert" data-test="shipping-edit-error">{{ error() }}</p>
        }
      </div>

      <div footer class="flex justify-end gap-3">
        <app-pi-button type="button" variant="outline" [disabled]="saving()" (click)="cancel()">Отмена</app-pi-button>
        <app-pi-button
          type="button"
          variant="default"
          [disabled]="saving() || !isKnownWarehouse()"
          (click)="submit()"
          data-test="shipping-edit-save"
        >
          {{ saving() ? 'Сохранение…' : 'Сохранить' }}
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class ShipmentEditDialogComponent {
  readonly data = inject<ShipmentEditDialogData>(PI_DIALOG_DATA);
  readonly ref = inject<DialogRef<boolean>>(PI_DIALOG_REF);
  private readonly shipmentsApi = inject(PiShipmentsService);

  readonly saving = signal(false);
  readonly error = signal('');
  readonly recipient = signal(this.data.shipment.recipient ?? '');
  readonly address = signal(this.data.shipment.address ?? '');
  readonly driverInfo = signal(this.data.shipment.driverInfo ?? '');
  readonly warehouseId = signal(this.data.shipment.warehouseId ?? '');
  readonly notes = signal(this.data.shipment.notes ?? '');

  readonly knownWarehouseIds = computed(() => new Set(this.data.warehouses.map((w) => w._id)));

  onWarehouseChange(event: Event): void {
    this.warehouseId.set((event.target as HTMLSelectElement).value);
  }

  onNotesInput(event: Event): void {
    this.notes.set((event.target as HTMLTextAreaElement).value);
  }

  isKnownWarehouse(): boolean {
    const id = this.warehouseId();
    return !!id && this.knownWarehouseIds().has(id);
  }

  async submit(): Promise<void> {
    if (this.saving()) return;
    if (!this.isKnownWarehouse()) {
      this.error.set('Выберите склад из списка');
      return;
    }
    this.saving.set(true);
    this.error.set('');
    const result = await firstValueFrom(
      this.shipmentsApi.update(this.data.shipment._id, {
        recipient: this.recipient(),
        address: this.address(),
        driverInfo: this.driverInfo(),
        notes: this.notes(),
        warehouseId: this.warehouseId() || undefined,
      }),
    );
    if (result.ok) {
      this.ref.close(true);
    } else {
      this.error.set(extractErrorMessage(result.error) || 'Не удалось сохранить отгрузку');
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.ref.close(false);
  }
}
