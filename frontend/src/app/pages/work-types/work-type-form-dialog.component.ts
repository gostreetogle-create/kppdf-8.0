import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CheckboxComponent } from '../../shared/ui/checkbox/checkbox.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { TextareaComponent } from '../../shared/ui/textarea/textarea.component';

import { PiEntityFormComponent } from '../../shared/dsl/entity-form/pi-entity-form.component';
import { PI_DIALOG_DATA } from '../../shared/ui/dialog/dialog.tokens';

import { WorkType, WorkTypesService } from '../../shared/services/pi-work-types.service';

/**
 * TZ-232.G — WorkTypeFormDialog migrated onto `<pi-entity-form>`.
 *
 * Eliminates boilerplate previously duplicated across all form-dialogs:
 *  - Submitting signal / formError signal / markAllAsTouched orchestration
 *  - SubmitGuard wiring (the wrapper handles it)
 *  - Toast on save / error (the wrapper handles it)
 *  - ref.close() return-value contract (the wrapper handles it)
 *
 * The dialog now only owns:
 *  - Form construction (its own validators + initial value patching)
 *  - `payloadFn` — pure mapping from form value to API payload
 *    (coalesces empty strings to `undefined`, etc.)
 *  - Field template layout via [fields] projection
 */
@Component({
  selector: 'app-work-type-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    CheckboxComponent,
    FormFieldComponent,
    InputComponent,
    TextareaComponent,
    PiEntityFormComponent,
  ],
  template: `
    <app-pi-entity-form
      [mutator]="mutator"
      [endpoint]="'work-types'"
      [title]="isEdit ? 'Редактировать вид работ' : 'Создать вид работ'"
      [formGroup]="form"
      [payloadFn]="payloadFn"
      [isEdit]="isEdit"
      [createSuccessMessage]="'Вид работ создан'"
      [updateSuccessMessage]="'Вид работ обновлён'"
      [width]="'md'"
    >
      <app-pi-form-field
        label="Название"
        htmlFor="wt-name"
        [required]="true"
        [error]="nameError()"
        fields
      >
        <app-pi-input
          id="wt-name"
          formControlName="name"
          placeholder="Название вида работ"
          [invalid]="nameInvalid()"
          data-test="name-input"
        />
      </app-pi-form-field>

      <div class="grid grid-cols-2 gap-form-field" fields>
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

      <app-pi-form-field label="Описание" htmlFor="wt-description" fields>
        <app-pi-textarea
          id="wt-description"
          [rows]="3"
          formControlName="description"
          [maxLength]="1000"
          data-test="description-input"
        />
      </app-pi-form-field>

      <div class="grid grid-cols-2 gap-form-field" fields>
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

      <div class="flex items-center gap-2" fields>
        <app-pi-checkbox
          formControlName="isActive"
          ariaLabel="Активен"
          data-test="active-checkbox"
        />
        <span class="text-sm">Активен</span>
      </div>
    </app-pi-entity-form>
  `,
})
export class WorkTypeFormDialogComponent {
  protected readonly data = inject<WorkType | null>(PI_DIALOG_DATA);
  protected readonly mutator = inject(WorkTypesService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly isEdit = this.data != null;

  protected readonly form = this.fb.group({
    name: this.fb.control<string>(this.data?.name ?? '', [
      Validators.required,
      Validators.maxLength(200),
    ]),
    section: this.fb.control<string>(this.data?.section ?? ''),
    department: this.fb.control<string>(this.data?.department ?? ''),
    description: this.fb.control<string>(this.data?.description ?? ''),
    defaultDurationHours: this.fb.control<number | null>(
      this.data?.defaultDurationHours ?? null,
    ),
    hourlyRate: this.fb.control<number | null>(this.data?.hourlyRate ?? null),
    isActive: this.fb.control<boolean>(this.data?.isActive ?? true),
  });

  protected readonly payloadFn = (): Partial<WorkType> => {
    const v = this.form.getRawValue();
    return {
      name: v.name,
      section: v.section || undefined,
      department: v.department || undefined,
      description: v.description || undefined,
      defaultDurationHours: v.defaultDurationHours ?? undefined,
      hourlyRate: v.hourlyRate ?? undefined,
      isActive: v.isActive,
    };
  };

  // ─── Field error helpers (computed reactively from form state) ─────
  protected readonly nameInvalid = computed(
    () => this.form.controls.name.invalid && this.form.controls.name.touched,
  );
  protected readonly nameError = computed(() =>
    this.nameInvalid() ? 'Обязательное поле' : '',
  );
}
