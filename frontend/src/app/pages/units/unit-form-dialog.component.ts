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
import { Unit, UnitsService } from '../dictionaries/units.service';

@Component({
  selector: 'app-unit-form-dialog',
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
    <app-pi-dialog [title]="isEdit ? 'Редактировать единицу' : 'Создать единицу'" [width]="'md'">
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="space-y-form-field"
        data-test="unit-form"
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field">
          <app-pi-form-field
            label="Ключ"
            htmlFor="unit-key"
            [required]="true"
            [error]="errorFor('key')"
            ><app-pi-input
              id="unit-key"
              formControlName="key"
              placeholder="kg, m, pcs"
              [disabled]="isEdit"
              [invalid]="hasError('key')"
          /></app-pi-form-field>
          <app-pi-form-field
            label="Название"
            htmlFor="unit-label"
            [required]="true"
            [error]="errorFor('label')"
            ><app-pi-input
              id="unit-label"
              formControlName="label"
              placeholder="Килограмм"
              [invalid]="hasError('label')"
          /></app-pi-form-field>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field">
          <app-pi-form-field label="Символ" htmlFor="unit-symbol"
            ><app-pi-input id="unit-symbol" formControlName="symbol" placeholder="кг"
          /></app-pi-form-field>
          <app-pi-form-field label="Категория" htmlFor="unit-category"
            ><app-pi-input id="unit-category" formControlName="category" placeholder="mass"
          /></app-pi-form-field>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field">
          <app-pi-form-field label="Порядок" htmlFor="unit-sort"
            ><app-pi-input id="unit-sort" type="number" formControlName="sortOrder"
          /></app-pi-form-field>
          <label class="inline-flex items-center gap-2 text-sm self-end pb-2"
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
        ><app-pi-button variant="ghost" (click)="onCancel()">Отмена</app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class UnitFormDialogComponent {
  protected readonly data = inject<Unit | null>(PI_DIALOG_DATA);
  protected readonly ref = inject<DialogRef<Unit | null>>(PI_DIALOG_REF);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(UnitsService);
  private readonly toast = inject(PiToastService);
  protected readonly isEdit = this.data != null;
  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly form = this.fb.group({
    key: this.fb.control(this.data?.key ?? '', [
      Validators.required,
      Validators.maxLength(32),
      Validators.pattern(new RegExp('^[a-zA-Z0-9_\\-°²³µ¼½¾·./]+$')),
    ]),
    label: this.fb.control(this.data?.label ?? '', [
      Validators.required,
      Validators.maxLength(128),
    ]),
    symbol: this.fb.control(this.data?.symbol ?? '', [Validators.maxLength(16)]),
    category: this.fb.control(this.data?.category ?? '', [Validators.maxLength(32)]),
    sortOrder: this.fb.control(this.data?.sortOrder ?? 0, [Validators.min(0)]),
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
    if (c.errors?.['pattern']) return 'Недопустимый формат ключа';
    return 'Некорректное значение';
  }
  protected onSubmit(): void {
    if (this.submitting()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const payload = {
      key: value.key,
      label: value.label,
      symbol: value.symbol || undefined,
      category: value.category || undefined,
      sortOrder: value.sortOrder,
      isActive: value.isActive,
    };
    this.submitting.set(true);
    this.formError.set(null);
    const request = this.data
      ? this.service.update(this.data.key, payload)
      : this.service.create(payload);
    request.subscribe((result) => {
      if (result.ok) {
        this.toast.success(this.isEdit ? 'Единица обновлена' : 'Единица создана');
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
