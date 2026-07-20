import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CheckboxComponent } from '../../shared/ui/checkbox/checkbox.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { TextareaComponent } from '../../shared/ui/textarea/textarea.component';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiToastService } from '../../shared/ui/toast';
import { WorkType, WorkTypesService } from '../../shared/services/pi-work-types.service';
import { extractErrorMessage } from '../../core/silent-http';

/**
 * TZ-83 Phase B: WorkTypeFormDialog.
 *
 * Create/edit form. Standard ReactiveFormsModule + NonNullableFormBuilder.
 * `pi-dialog` system expects `data: WorkType | null` (null → create).
 */
@Component({
  selector: 'app-work-type-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    CheckboxComponent,
    FormFieldComponent,
    InputComponent,
    TextareaComponent,
    PiDialogComponent,
  ],
  template: `
    <app-pi-dialog
      [title]="isEdit ? 'Редактировать вид работ' : 'Создать вид работ'"
      [width]="'md'"
    >
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="space-y-form-field"
        data-test="work-type-form"
      >
        <app-pi-form-field
          label="Название"
          htmlFor="wt-name"
          [required]="true"
          [error]="
            form.controls.name.invalid && form.controls.name.touched ? 'Обязательное поле' : ''
          "
        >
          <app-pi-input
            id="wt-name"
            formControlName="name"
            placeholder="Название вида работ"
            [invalid]="form.controls.name.invalid && form.controls.name.touched"
            data-test="name-input"
          />
        </app-pi-form-field>

        <div class="grid grid-cols-2 gap-form-field">
          <app-pi-form-field label="Секция" htmlFor="wt-section">
            <app-pi-input
              id="wt-section"
              formControlName="section"
              placeholder="Секция"
              data-test="section-input"
            />
          </app-pi-form-field>
          <app-pi-form-field label="Отдел" htmlFor="wt-department">
            <app-pi-input
              id="wt-department"
              formControlName="department"
              placeholder="Отдел"
              data-test="department-input"
            />
          </app-pi-form-field>
        </div>

        <app-pi-form-field label="Описание" htmlFor="wt-description">
          <app-pi-textarea
            id="wt-description"
            [rows]="3"
            formControlName="description"
            [maxLength]="1000"
            data-test="description-input"
          />
        </app-pi-form-field>

        <div class="grid grid-cols-2 gap-form-field">
          <app-pi-form-field label="Норма часов (на единицу)" htmlFor="wt-default-duration">
            <app-pi-input
              id="wt-default-duration"
              type="number"
              formControlName="defaultDurationHours"
              placeholder="0"
              data-test="duration-input"
            />
          </app-pi-form-field>
          <app-pi-form-field label="Ставка (₽/час)" htmlFor="wt-hourly-rate">
            <app-pi-input
              id="wt-hourly-rate"
              type="number"
              formControlName="hourlyRate"
              placeholder="0"
              data-test="rate-input"
            />
          </app-pi-form-field>
        </div>

        <div class="flex items-center gap-2">
          <app-pi-checkbox
            formControlName="isActive"
            ariaLabel="Активен"
            data-test="active-checkbox"
          />
          <span class="text-sm">Активен</span>
        </div>

        @if (formError()) {
          <p role="alert" class="text-xs text-destructive">
            {{ formError() }}
          </p>
        }
      </form>

      <div footer class="flex gap-3">
        <app-pi-button variant="ghost" type="button" (click)="onCancel()" data-test="cancel-button">
          Отмена
        </app-pi-button>
        <app-pi-button
          variant="default"
          type="submit"
          [disabled]="form.invalid || submitting()"
          data-test="submit-button"
        >
          {{ submitting() ? 'Сохранение…' : isEdit ? 'Сохранить' : 'Создать' }}
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class WorkTypeFormDialogComponent {
  // TZ-83 cleanup: import tokens by canonical name (PI_DIALOG_*),
  // and use plain `signal()` in component instead of singleton indirection.
  protected readonly ref = inject<DialogRef<WorkType | null>>(PI_DIALOG_REF);
  protected readonly data = inject<WorkType | null>(PI_DIALOG_DATA);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(WorkTypesService);
  private readonly toast = inject(PiToastService);

  protected readonly isEdit = this.data != null;
  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly form = this.fb.group({
    name: this.fb.control<string>(this.data?.name ?? '', [
      Validators.required,
      Validators.maxLength(200),
    ]),
    section: this.fb.control<string>(this.data?.section ?? ''),
    department: this.fb.control<string>(this.data?.department ?? ''),
    description: this.fb.control<string>(this.data?.description ?? ''),
    defaultDurationHours: this.fb.control<number | null>(this.data?.defaultDurationHours ?? null),
    hourlyRate: this.fb.control<number | null>(this.data?.hourlyRate ?? null),
    isActive: this.fb.control<boolean>(this.data?.isActive ?? true),
  });

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const payload: Partial<WorkType> = {
      name: v.name,
      section: v.section || undefined,
      department: v.department || undefined,
      description: v.description || undefined,
      defaultDurationHours: v.defaultDurationHours ?? undefined,
      hourlyRate: v.hourlyRate ?? undefined,
      isActive: v.isActive,
    };
    this.submitting.set(true);
    const op = this.isEdit
      ? this.service.update(this.data!._id, payload)
      : this.service.create(payload);
    op.subscribe((res) => {
      this.submitting.set(false);
      if (res.ok) {
        this.toast.success(this.isEdit ? 'Вид работ обновлён' : 'Вид работ создан');
        this.ref.close(res.data ?? null);
      } else {
        const msg = extractErrorMessage(res.error);
        this.formError.set(msg);
        this.toast.error(msg);
      }
    });
  }

  protected onCancel(): void {
    this.ref.close(null);
  }
}

// TZ-83 cleanup: removed SubmittingSignal/FormErrorSignal singletons — using
// component-local signals directly. Both fields above are `signal(false)` and
// `signal<string | null>(null)` respectively, scoped to this component instance.
// Previous singleton design accidentally shared state across all open dialogs.
