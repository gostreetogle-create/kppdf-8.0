import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CheckboxComponent } from '../../shared/ui/checkbox/checkbox.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../shared/ui/toast';
import { extractErrorMessage } from '../../core/silent-http';
import { Currency, CurrencyService } from '../../shared/services/pi-currency.service';

@Component({
  selector: 'app-currency-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    CheckboxComponent,
    FormFieldComponent,
    InputComponent,
    PiDialogComponent,
  ],
  template: `
    <app-pi-dialog [title]="isEdit ? 'Редактировать валюту' : 'Создать валюту'" [width]="'lg'">
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="space-y-form-field"
        data-test="currency-form"
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field">
          <app-pi-form-field
            label="Ключ"
            htmlFor="currency-key"
            [required]="true"
            [error]="errorFor('key')"
          >
            <app-pi-input
              id="currency-key"
              formControlName="key"
              placeholder="RUB"
              [disabled]="isEdit"
              [invalid]="hasError('key')"
            />
          </app-pi-form-field>
          <app-pi-form-field
            label="Код ISO"
            htmlFor="currency-code"
            [required]="true"
            [error]="errorFor('code')"
          >
            <app-pi-input
              id="currency-code"
              formControlName="code"
              placeholder="643"
              [invalid]="hasError('code')"
            />
          </app-pi-form-field>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field">
          <app-pi-form-field
            label="Название"
            htmlFor="currency-label"
            [required]="true"
            [error]="errorFor('label')"
          >
            <app-pi-input
              id="currency-label"
              formControlName="label"
              placeholder="Российский рубль"
              [invalid]="hasError('label')"
            />
          </app-pi-form-field>
          <app-pi-form-field
            label="Символ"
            htmlFor="currency-symbol"
            [required]="true"
            [error]="errorFor('symbol')"
          >
            <app-pi-input
              id="currency-symbol"
              formControlName="symbol"
              placeholder="₽"
              [invalid]="hasError('symbol')"
            />
          </app-pi-form-field>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-form-field">
          <app-pi-form-field label="Курс" htmlFor="currency-rate"
            ><app-pi-input id="currency-rate" type="number" formControlName="rate"
          /></app-pi-form-field>
          <app-pi-form-field label="Точность" htmlFor="currency-precision"
            ><app-pi-input id="currency-precision" type="number" formControlName="precision"
          /></app-pi-form-field>
          <app-pi-form-field label="Порядок" htmlFor="currency-sort"
            ><app-pi-input id="currency-sort" type="number" formControlName="sortOrder"
          /></app-pi-form-field>
        </div>
        <app-pi-form-field label="Локаль" htmlFor="currency-locale"
          ><app-pi-input id="currency-locale" formControlName="locale" placeholder="ru-RU"
        /></app-pi-form-field>
        <div class="flex flex-wrap gap-5">
          <label class="inline-flex items-center gap-2 text-sm"
            ><app-pi-checkbox formControlName="isBase" ariaLabel="Базовая валюта" />Базовая
            валюта</label
          >
          <label class="inline-flex items-center gap-2 text-sm"
            ><app-pi-checkbox formControlName="isActive" ariaLabel="Активна" />Активна</label
          >
        </div>
        @if (formError()) {
          <p role="alert" class="text-xs text-destructive">{{ formError() }}</p>
        }
      </form>
      <div footer class="flex gap-3">
        <app-pi-button
          variant="default"
          [disabled]="form.invalid || submitting()"
          (click)="onSubmit()"
          >{{ submitting() ? 'Сохранение…' : 'Сохранить' }}</app-pi-button
        >
        <app-pi-button variant="ghost" (click)="onCancel()">Отмена</app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class CurrencyFormDialogComponent {
  protected readonly data = inject<Currency | null>(PI_DIALOG_DATA);
  protected readonly ref = inject<DialogRef<Currency | null>>(PI_DIALOG_REF);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(CurrencyService);
  private readonly toast = inject(PiToastService);
  protected readonly isEdit = this.data != null;
  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly form = this.fb.group({
    key: this.fb.control(this.data?.key ?? '', [
      Validators.required,
      Validators.pattern(/^[A-Z]{2,8}$/),
    ]),
    label: this.fb.control(this.data?.label ?? '', [
      Validators.required,
      Validators.maxLength(128),
    ]),
    code: this.fb.control(this.data?.code ?? '', [Validators.required, Validators.maxLength(8)]),
    symbol: this.fb.control(this.data?.symbol ?? '', [
      Validators.required,
      Validators.maxLength(8),
    ]),
    rate: this.fb.control(this.data?.rate ?? 1, [Validators.min(0)]),
    precision: this.fb.control(this.data?.precision ?? 2, [Validators.min(0)]),
    sortOrder: this.fb.control(this.data?.sortOrder ?? 0, [Validators.min(0)]),
    locale: this.fb.control(this.data?.locale ?? 'ru-RU', [Validators.maxLength(16)]),
    isBase: this.fb.control(this.data?.isBase ?? false),
    isActive: this.fb.control(this.data?.isActive ?? true),
  });

  protected hasError(name: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.dirty || c.touched);
  }
  protected errorFor(name: keyof typeof this.form.controls): string {
    const c = this.form.controls[name];
    if (!this.hasError(name)) return '';
    if (c.errors?.['required']) return 'Обязательное поле';
    if (c.errors?.['pattern']) return 'Используйте 2–8 заглавных латинских букв';
    if (c.errors?.['maxlength']) return `Максимум ${c.errors['maxlength'].requiredLength} символов`;
    return 'Некорректное значение';
  }
  protected onSubmit(): void {
    if (this.submitting()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const payload: Partial<Currency> = { ...value };
    this.submitting.set(true);
    this.formError.set(null);
    const request = this.data
      ? this.service.update(this.data.key, payload)
      : this.service.create(payload);
    request.subscribe((result) => {
      if (result.ok) {
        this.toast.success(this.isEdit ? 'Валюта обновлена' : 'Валюта создана');
        this.ref.close(result.data);
      } else {
        this.formError.set(extractErrorMessage(result.error));
        this.submitting.set(false);
      }
    });
  }
  protected onCancel(): void {
    this.ref.close(null);
  }
}
