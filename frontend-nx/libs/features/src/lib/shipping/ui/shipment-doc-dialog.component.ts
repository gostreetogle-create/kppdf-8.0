import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PiShipmentsService, type Shipment } from '@kppdf/data-access';
import { extractErrorMessage } from '@kppdf/util-http';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiDialogComponent, PI_DIALOG_DATA, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import { PiFormSectionComponent } from '@kppdf/ui/form-section';
import { FormFieldComponent } from '@kppdf/ui/form-field';
import { InputComponent } from '@kppdf/ui/input';

export interface ShipmentDocDialogData {
  readonly shipment: Shipment;
}

export const DOC_TYPE_LABELS: Record<string, string> = {
  ttn: 'ТТН',
  upd: 'УПД',
  invoice: 'Счёт',
  other: 'Другое',
};

/** TZ-NX-SHIP-S1 — attach a shipment document (ТТН/УПД/счёт), mirrors legacy shipping doc form. */
@Component({
  selector: 'pi-shipment-doc-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, PiDialogComponent, PiFormSectionComponent, FormFieldComponent, InputComponent],
  template: `
    <app-pi-dialog title="Добавить документ" variant="content" width="md" [showClose]="true" (userClose)="cancel()">
      <div body class="space-y-4" data-test="shipping-doc-form">
        <app-pi-form-section title="Документ отгрузки" headingId="shipment-doc-basics" tone="gold">
          <div class="space-y-form-field">
            <app-pi-form-field label="Тип документа" htmlFor="shipment-doc-type" [required]="true">
              <select id="shipment-doc-type" class="pi-input w-full" [value]="type()" (change)="onTypeChange($event)" data-test="shipping-doc-type">
                @for (key of docTypes; track key) {
                  <option [value]="key">{{ docTypeLabels[key] }}</option>
                }
              </select>
            </app-pi-form-field>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <app-pi-form-field label="Номер" htmlFor="shipment-doc-number">
                <app-pi-input id="shipment-doc-number" [value]="number()" (valueChange)="number.set($event)" data-test="shipping-doc-number" />
              </app-pi-form-field>
              <app-pi-form-field label="Сумма" htmlFor="shipment-doc-amount">
                <app-pi-input id="shipment-doc-amount" type="number" [value]="amount().toString()" (valueChange)="onAmountInput($event)" data-test="shipping-doc-amount" />
              </app-pi-form-field>
            </div>
            <app-pi-form-field label="Примечание" htmlFor="shipment-doc-notes">
              <app-pi-input id="shipment-doc-notes" [value]="notes()" (valueChange)="notes.set($event)" data-test="shipping-doc-notes" />
            </app-pi-form-field>
          </div>
        </app-pi-form-section>

        @if (error()) {
          <p class="text-sm text-destructive m-0" role="alert" data-test="shipping-doc-error">{{ error() }}</p>
        }
      </div>

      <div footer class="flex justify-end gap-3">
        <app-pi-button type="button" variant="outline" [disabled]="saving()" (click)="cancel()">Отмена</app-pi-button>
        <app-pi-button type="button" variant="default" [disabled]="saving()" (click)="submit()" data-test="shipping-doc-submit">
          {{ saving() ? 'Добавление…' : 'Добавить' }}
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class ShipmentDocDialogComponent {
  readonly data = inject<ShipmentDocDialogData>(PI_DIALOG_DATA);
  readonly ref = inject<DialogRef<boolean>>(PI_DIALOG_REF);
  private readonly shipmentsApi = inject(PiShipmentsService);

  readonly docTypes = ['ttn', 'upd', 'invoice', 'other'] as const;
  readonly docTypeLabels = DOC_TYPE_LABELS;

  readonly saving = signal(false);
  readonly error = signal('');
  readonly type = signal<string>('ttn');
  readonly number = signal('');
  readonly amount = signal(0);
  readonly notes = signal('');

  onTypeChange(event: Event): void {
    this.type.set((event.target as HTMLSelectElement).value);
  }

  onAmountInput(value: string): void {
    this.amount.set(Number(value) || 0);
  }

  async submit(): Promise<void> {
    if (this.saving()) return;
    this.saving.set(true);
    this.error.set('');
    const result = await firstValueFrom(
      this.shipmentsApi.addDoc(this.data.shipment._id, {
        type: this.type(),
        number: this.number() || undefined,
        totalAmount: Number(this.amount()) || 0,
        notes: this.notes() || undefined,
      }),
    );
    if (result.ok) {
      this.ref.close(true);
    } else {
      this.error.set(extractErrorMessage(result.error) || 'Не удалось добавить документ');
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.ref.close(false);
  }
}
