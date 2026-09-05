import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  PiWorkTypesService,
  type WorkType,
  type WorkTypeWritePayload,
} from '@kppdf/data-access';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiDialogComponent, PI_DIALOG_DATA, PI_DIALOG_REF } from '@kppdf/ui/dialog';
import type { DialogRef } from '@kppdf/ui/dialog';
import { FormFieldComponent } from '@kppdf/ui/form-field';
import { InputComponent } from '@kppdf/ui/input';
import { TextareaComponent } from '@kppdf/ui/textarea';
import { PiFormSectionComponent } from '@kppdf/ui/form-section';
import { CheckboxComponent } from '@kppdf/ui/checkbox';
import { extractErrorMessage } from '@kppdf/util-http';

export interface WorkTypeFormDialogData {
  readonly mode: 'create' | 'edit';
  readonly workType?: WorkType | null;
}

@Component({
  selector: 'pi-work-type-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    PiDialogComponent,
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
    TextareaComponent,
    PiFormSectionComponent,
    CheckboxComponent,
  ],
  template: `
    <app-pi-dialog
      [title]="data.mode === 'edit' ? 'Редактировать вид работ' : 'Создать вид работ'"
      variant="content"
      [maxWidth]="'min(720px, calc(100vw - 2rem))'"
      [showClose]="true"
    >
      <form body [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4" data-test="work-type-form">
        <app-pi-form-section title="Основные данные" headingId="work-type-form-basics" tone="gold">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-form-field">
            <app-pi-form-field label="Название" htmlFor="work-type-name" [required]="true" [error]="fieldError('name')">
              <app-pi-input id="work-type-name" formControlName="name" [invalid]="invalid('name')" data-test="work-type-name" />
            </app-pi-form-field>
            <app-pi-form-field label="Секция" htmlFor="work-type-section">
              <app-pi-input id="work-type-section" formControlName="section" data-test="work-type-section" />
            </app-pi-form-field>
            <app-pi-form-field label="Отдел" htmlFor="work-type-department">
              <app-pi-input id="work-type-department" formControlName="department" data-test="work-type-department" />
            </app-pi-form-field>
            <app-pi-form-field label="Дней по умолчанию" htmlFor="work-type-days" hint="Подставляется при добавлении вида работ к модулю; фактический срок — в модуле / на Ганте заказа.">
              <app-pi-input id="work-type-days" type="number" formControlName="days" data-test="work-type-days" />
            </app-pi-form-field>
            <app-pi-form-field label="Ставка, ₽/час" htmlFor="work-type-rate" [required]="true" [error]="fieldError('hourlyRate')">
              <app-pi-input id="work-type-rate" type="number" formControlName="hourlyRate" [invalid]="invalid('hourlyRate')" data-test="work-type-hourly-rate" />
            </app-pi-form-field>
            <app-pi-form-field label="Цвет (hue 0–359)" htmlFor="work-type-hue">
              <app-pi-input id="work-type-hue" type="number" formControlName="accentHue" data-test="work-type-accent-hue" />
            </app-pi-form-field>
          </div>
          <app-pi-form-field label="Описание" htmlFor="work-type-description">
            <app-pi-textarea id="work-type-description" formControlName="description" [rows]="2" data-test="work-type-description" />
          </app-pi-form-field>
          <div class="inline-flex items-center gap-2 text-sm">
            <app-pi-checkbox formControlName="isActive" ariaLabel="Активен" data-test="work-type-active" />
            <span>Активен</span>
          </div>
        </app-pi-form-section>

        @if (errorMessage()) {
          <p role="alert" class="text-xs text-destructive" data-test="work-type-form-error">{{ errorMessage() }}</p>
        }
      </form>
      <div footer class="flex justify-end gap-3">
        <app-pi-button type="button" variant="outline" (click)="onCancel()" data-test="work-type-cancel">Отмена</app-pi-button>
        <app-pi-button type="button" [disabled]="submitting()" (click)="onSubmit()" data-test="work-type-save">
          {{ submitting() ? 'Сохранение…' : 'Сохранить' }}
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class WorkTypeFormDialogComponent {
  readonly data = inject<WorkTypeFormDialogData>(PI_DIALOG_DATA);
  private readonly ref = inject<DialogRef<WorkType | null | undefined>>(PI_DIALOG_REF);
  private readonly service = inject(PiWorkTypesService);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.group({
    name: this.fb.control(this.data.workType?.name ?? '', [Validators.required, Validators.maxLength(200)]),
    section: this.fb.control(this.data.workType?.section ?? ''),
    department: this.fb.control(this.data.workType?.department ?? ''),
    description: this.fb.control(this.data.workType?.description ?? ''),
    days: this.fb.control<number | null>(this.data.workType?.days ?? null, [Validators.min(1)]),
    hourlyRate: this.fb.control<number | null>(this.data.workType?.hourlyRate ?? null, [Validators.required, Validators.min(0)]),
    accentHue: this.fb.control<number | null>(this.data.workType?.accentHue ?? null, [Validators.min(0), Validators.max(359)]),
    isActive: this.fb.control(this.data.workType?.isActive ?? true),
  });

  protected invalid(name: 'name' | 'hourlyRate'): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.dirty || control.touched);
  }

  protected fieldError(name: 'name' | 'hourlyRate'): string {
    const control = this.form.controls[name];
    if (!control.invalid || (!control.dirty && !control.touched)) return '';
    if (control.errors?.['required']) return 'Обязательное поле';
    if (control.errors?.['min']) return name === 'hourlyRate' ? 'Ставка не может быть отрицательной' : 'Укажите значение не меньше 1';
    return 'Некорректное значение';
  }

  protected async onSubmit(): Promise<void> {
    if (this.submitting()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const payload: WorkTypeWritePayload = {
      name: value.name.trim(),
      hourlyRate: Number(value.hourlyRate),
      isActive: value.isActive,
      ...(value.section.trim() ? { section: value.section.trim() } : {}),
      ...(value.department.trim() ? { department: value.department.trim() } : {}),
      ...(value.description.trim() ? { description: value.description.trim() } : {}),
      ...(value.days == null ? { days: null } : { days: Number(value.days) }),
      ...(value.accentHue == null ? { accentHue: null } : { accentHue: Number(value.accentHue) }),
    };
    this.submitting.set(true);
    this.errorMessage.set(null);
    const result = this.data.mode === 'edit' && this.data.workType
      ? await firstValueFrom(this.service.update(this.data.workType._id, payload))
      : await firstValueFrom(this.service.create(payload));
    this.submitting.set(false);
    if (!result.ok) {
      this.errorMessage.set(extractErrorMessage(result.error));
      return;
    }
    this.ref.close(result.data);
  }

  protected onCancel(): void {
    this.ref.close(undefined);
  }
}
