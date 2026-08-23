import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../ui/button/button.component';
import { FormFieldComponent } from '../ui/form-field/form-field.component';
import { InputComponent } from '../ui/input/input.component';
import { PiDialogComponent } from '../ui/dialog/pi-dialog.component';
import { PI_DIALOG_REF } from '../ui/dialog/dialog.tokens';
import type { DialogRef } from '../ui/dialog/pi-dialog.service';
import { PiToastService } from '../ui/toast';
import { Counterparty, CounterpartyService } from '../services/pi-counterparty.service';
import { extractErrorMessage } from '../../core/silent-http';
import type { Site } from '../services/pi-site.service';

export type PartyQuickCreateResult = {
  counterparty: Counterparty;
  site: Pick<Site, '_id' | 'name' | 'address'>;
} | null;

/**
 * TZ-UI-PLUS-603 — compact counterparty + default site create from order form +.
 */
@Component({
  selector: 'app-party-quick-create-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    PiDialogComponent,
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
  ],
  template: `
    <app-pi-dialog title="Новый заказчик" [width]="'sm'" variant="form" [animate]="false">
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="grid grid-cols-1 sm:grid-cols-12 gap-form-field"
        data-test="party-quick-create-form"
      >
        <app-pi-form-field
          class="sm:col-span-5"
          label="Имя"
          htmlFor="pqc-name"
          [required]="true"
          [error]="errorFor('name')"
        >
          <app-pi-input
            id="pqc-name"
            formControlName="name"
            placeholder="ООО … / ИП …"
            [invalid]="hasError('name')"
            data-test="pqc-name"
          />
        </app-pi-form-field>

        <app-pi-form-field class="sm:col-span-3" label="Телефон" htmlFor="pqc-phone">
          <app-pi-input
            id="pqc-phone"
            formControlName="phone"
            placeholder="+7 …"
            style="max-width: 14rem"
            data-test="pqc-phone"
          />
        </app-pi-form-field>

        <app-pi-form-field
          class="sm:col-span-4"
          label="Адрес объекта"
          htmlFor="pqc-address"
          [required]="true"
          [error]="errorFor('address')"
        >
          <app-pi-input
            id="pqc-address"
            formControlName="address"
            placeholder="Город, улица…"
            [invalid]="hasError('address')"
            data-test="pqc-address"
          />
        </app-pi-form-field>

        @if (errorMessage()) {
          <p
            role="alert"
            class="sm:col-span-12 text-xs text-destructive"
            data-test="pqc-form-error"
          >
            {{ errorMessage() }}
          </p>
        }
      </form>

      <div footer class="flex justify-end gap-2">
        <app-pi-button type="button" variant="ghost" (click)="onCancel()">Отмена</app-pi-button>
        <app-pi-button
          type="button"
          variant="default"
          [disabled]="submitting()"
          (click)="onSubmit()"
          data-test="pqc-save"
        >
          {{ submitting() ? 'Создание…' : 'Создать' }}
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class PartyQuickCreateDialogComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly counterpartyService = inject(CounterpartyService);
  private readonly toast = inject(PiToastService);
  private readonly ref = inject<DialogRef<PartyQuickCreateResult>>(PI_DIALOG_REF);

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.group({
    name: this.fb.control('', [Validators.required]),
    phone: this.fb.control(''),
    address: this.fb.control('', [Validators.required]),
  });

  protected hasError(name: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.dirty || c.touched);
  }

  protected errorFor(name: keyof typeof this.form.controls): string {
    const c = this.form.controls[name];
    if (!c.invalid || (!c.dirty && !c.touched)) return '';
    if (c.errors?.['required']) return 'Обязательное поле';
    return 'Некорректное значение';
  }

  protected onSubmit(): void {
    if (this.submitting()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.errorMessage.set('Укажите имя и адрес объекта');
      return;
    }

    const v = this.form.getRawValue();
    this.submitting.set(true);
    this.errorMessage.set(null);
    this.counterpartyService
      .quickCreateParty({
        name: v.name.trim(),
        phone: v.phone?.trim() || undefined,
        address: v.address.trim(),
      })
      .subscribe((res) => {
        if (!res.ok) {
          this.errorMessage.set(extractErrorMessage(res.error));
          this.submitting.set(false);
          return;
        }
        this.toast.success('Заказчик и объект созданы');
        this.ref.close(res.data);
      });
  }

  protected onCancel(): void {
    this.ref.close(null);
  }
}
