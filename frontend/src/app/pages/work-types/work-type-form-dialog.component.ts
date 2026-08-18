import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CheckboxComponent } from '../../shared/ui/checkbox/checkbox.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { TextareaComponent } from '../../shared/ui/textarea/textarea.component';
import { PiFormSectionComponent } from '../../shared/ui/form-section';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiToastService } from '../../shared/ui/toast';
import { WorkType, WorkTypesService } from '../../shared/services/pi-work-types.service';
import { toOptionalNumber } from '../../shared/forms/to-optional-number';
import { extractErrorMessage } from '../../core/silent-http';

/**
 * TZ-PRODUCTION-302: empty/0 → null (unknown); otherwise must be integer ≥ 1.
 */
function daysValidator(c: { value: number | null }): { invalidDays: true } | null {
  if (c.value == null || c.value === 0) return null;
  return Number.isInteger(c.value) && c.value >= 1 ? null : { invalidDays: true };
}

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
    PiFormSectionComponent,
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
        <app-pi-form-section title="Основные данные" headingId="work-type-sec-basics" tone="gold">
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
        </app-pi-form-section>

        <app-pi-form-section title="Дополнительно" headingId="work-type-sec-extra" tone="neutral">
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
            <app-pi-form-field
              label="Ставка, ₽/час"
              htmlFor="wt-hourly-rate"
              [required]="true"
              [error]="
                form.controls.hourlyRate.invalid && form.controls.hourlyRate.touched
                  ? 'Укажите ставку (≥ 0)'
                  : ''
              "
            >
              <app-pi-input
                id="wt-hourly-rate"
                type="number"
                formControlName="hourlyRate"
                placeholder="0"
                [invalid]="form.controls.hourlyRate.invalid && form.controls.hourlyRate.touched"
                data-test="rate-input"
              />
            </app-pi-form-field>
          </div>

          <div class="grid grid-cols-2 gap-form-field">
            <app-pi-form-field
              label="Дней (календарных)"
              htmlFor="wt-days"
              [hint]="'Оценка длительности для Gantt. Пусто — неизвестно.'"
            >
              <app-pi-input
                id="wt-days"
                type="number"
                min="1"
                formControlName="days"
                placeholder="—"
                data-test="days-input"
              />
            </app-pi-form-field>
            <div class="flex items-end pb-2">
              <p class="text-xs text-muted-foreground">
                Оставьте пустым, если срок ещё не определён.
              </p>
            </div>
          </div>

          <fieldset data-test="accent-hue-fieldset">
            <legend class="text-sm font-medium mb-1">Цвет на Ганте</legend>
            <p class="text-xs text-muted-foreground mb-2">
              Один оттенок для полосок и карточек в кокпите. «Авто» — по id.
            </p>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="h-8 px-2 text-xs rounded-sm border hairline pi-focus-ring"
                [class.ring-2]="form.controls.accentHue.value == null"
                (click)="form.controls.accentHue.setValue(null)"
                data-test="accent-hue-auto"
              >
                Авто
              </button>
              @for (h of huePresets; track h) {
                <button
                  type="button"
                  class="w-8 h-8 rounded-sm border hairline pi-focus-ring"
                  [style.background]="hueSwatch(h)"
                  [class.ring-2]="form.controls.accentHue.value === h"
                  (click)="form.controls.accentHue.setValue(h)"
                  [attr.aria-label]="'Оттенок ' + h"
                  [attr.data-test]="'accent-hue-' + h"
                ></button>
              }
            </div>
          </fieldset>

          <div class="flex items-center gap-2">
            <app-pi-checkbox
              formControlName="isActive"
              ariaLabel="Активен"
              data-test="active-checkbox"
            />
            <span class="text-sm">Активен</span>
          </div>
        </app-pi-form-section>

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
          type="button"
          [disabled]="form.invalid || submitting()"
          (click)="onSubmit()"
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
    hourlyRate: this.fb.control<number | null>(this.data?.hourlyRate ?? null, [
      Validators.required,
      Validators.min(0),
    ]),
    days: this.fb.control<number | null>(this.data?.days ?? null, [daysValidator]),
    accentHue: this.fb.control<number | null>(this.data?.accentHue ?? null),
    isActive: this.fb.control<boolean>(this.data?.isActive ?? true),
  });

  protected readonly huePresets = [30, 85, 145, 200, 250, 300, 340] as const;

  protected hueSwatch(h: number): string {
    return `oklch(0.78 0.12 ${h})`;
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const hourlyRate = toOptionalNumber(v.hourlyRate);
    if (hourlyRate === undefined) {
      this.form.controls.hourlyRate.setErrors({ required: true });
      this.form.controls.hourlyRate.markAsTouched();
      return;
    }

    const defaultDurationHours = toOptionalNumber(v.defaultDurationHours);
    const days = toOptionalNumber(v.days);
    const accentHue = toOptionalNumber(v.accentHue);
    const payload: Partial<WorkType> = {
      name: v.name,
      section: v.section || undefined,
      department: v.department || undefined,
      description: v.description || undefined,
      ...(defaultDurationHours === undefined ? {} : { defaultDurationHours }),
      hourlyRate,
      days: days === undefined || days === 0 ? null : days,
      ...(accentHue === undefined ? {} : { accentHue }),
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
