import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonComponent } from '../../shared/ui/button/button.component';
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
  imports: [ReactiveFormsModule, ButtonComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="grid gap-4" data-test="work-type-form">
      <p class="eyebrow text-muted-foreground">{{ isEdit ? 'Редактирование' : 'Создание' }} вида работ</p>

      <label class="block">
        <span class="eyebrow block mb-1.5">Название <span class="text-destructive">*</span></span>
        <input
          id="wt-name"
          type="text"
          formControlName="name"
          autocomplete="off"
          maxlength="200"
          data-test="name-input"
          class="pi-input w-full"
        />
      </label>

      <div class="grid grid-cols-2 gap-3">
        <label class="block">
          <span class="eyebrow block mb-1.5">Секция</span>
          <input
            id="wt-section"
            type="text"
            formControlName="section"
            autocomplete="off"
            maxlength="100"
            data-test="section-input"
            class="pi-input w-full"
          />
        </label>
        <label class="block">
          <span class="eyebrow block mb-1.5">Отдел</span>
          <input
            id="wt-department"
            type="text"
            formControlName="department"
            autocomplete="off"
            maxlength="100"
            data-test="department-input"
            class="pi-input w-full"
          />
        </label>
      </div>

      <label class="block">
        <span class="eyebrow block mb-1.5">Описание</span>
        <textarea
          id="wt-description"
          rows="3"
          formControlName="description"
          maxlength="1000"
          data-test="description-input"
          class="pi-input w-full"
        ></textarea>
      </label>

      <div class="grid grid-cols-2 gap-3">
        <label class="block">
          <span class="eyebrow block mb-1.5">Норма часов (на единицу)</span>
          <input
            id="wt-default-duration"
            type="number"
            step="0.01"
            min="0"
            formControlName="defaultDurationHours"
            data-test="duration-input"
            class="pi-input w-full font-mono"
          />
        </label>
        <label class="block">
          <span class="eyebrow block mb-1.5">Ставка (₽/час)</span>
          <input
            id="wt-hourly-rate"
            type="number"
            step="0.01"
            min="0"
            formControlName="hourlyRate"
            data-test="rate-input"
            class="pi-input w-full font-mono"
          />
        </label>
      </div>

      <label class="flex items-center gap-2 select-none cursor-pointer">
        <input id="wt-active" type="checkbox" formControlName="isActive" data-test="active-checkbox" />
        <span class="eyebrow">Активен</span>
      </label>

      @if (formError()) {
        <div role="alert" class="border hairline border-destructive rounded-sm px-3 py-2 text-sm text-destructive">
          {{ formError() }}
        </div>
      }

      <div class="flex justify-end gap-2 pt-2 hairline-t mt-2">
        <app-pi-button variant="ghost" type="button" (click)="onCancel()" data-test="cancel-button">
          Отмена
        </app-pi-button>
        <app-pi-button
          variant="default"
          type="submit"
          [disabled]="form.invalid || submitting()"
          data-test="submit-button"
        >
          {{ submitting() ? 'Сохранение…' : (isEdit ? 'Сохранить' : 'Создать') }}
        </app-pi-button>
      </div>
    </form>
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
    name: this.fb.control<string>(this.data?.name ?? '', [Validators.required, Validators.maxLength(200)]),
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
