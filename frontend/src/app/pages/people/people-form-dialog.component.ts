import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CheckboxComponent } from '../../shared/ui/checkbox/checkbox.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { TextareaComponent } from '../../shared/ui/textarea/textarea.component';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { PiFormSectionComponent } from '../../shared/ui/form-section';
import { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiToastService } from '../../shared/ui/toast';
import {
  CreatePersonPayload,
  Person,
  PiWorkersService,
} from '../../shared/services/pi-workers.service';
import { WorkTypesService, type WorkType } from '../../shared/services/pi-work-types.service';
import { extractErrorMessage } from '../../core/silent-http';

/**
 * TZ-UX-306 / WORKERS-302.FOLLOWUP — create/edit Worker («Люди»).
 * Opens via PiDialogService.open (parentDestroyRef required).
 */
@Component({
  selector: 'app-people-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    CheckboxComponent,
    FormFieldComponent,
    InputComponent,
    TextareaComponent,
    PiDialogComponent,
    PiFormSectionComponent,
  ],
  template: `
    <app-pi-dialog
      [title]="isEdit ? 'Редактировать человека' : 'Добавить человека'"
      [width]="'lg'"
      [animate]="false"
    >
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="space-y-form-field"
        data-test="people-form"
      >
        @if (formError()) {
          <div
            role="alert"
            class="border hairline border-destructive rounded-sm px-3 py-2 text-sm text-destructive"
          >
            {{ formError() }}
          </div>
        }

        <app-pi-form-section title="Основные данные" headingId="people-sec-basics" tone="gold">
          <div class="grid grid-cols-1 gap-form-field md:grid-cols-12 md:gap-x-3 md:gap-y-2">
            <app-pi-form-field
              class="md:col-span-4"
              label="Фамилия"
              htmlFor="p-last"
              [required]="true"
              [error]="
                form.controls.lastName.invalid && form.controls.lastName.touched
                  ? 'Обязательное поле'
                  : ''
              "
            >
              <app-pi-input
                id="p-last"
                formControlName="lastName"
                placeholder="Иванов"
                [invalid]="form.controls.lastName.invalid && form.controls.lastName.touched"
                data-test="last-name-input"
              />
            </app-pi-form-field>
            <app-pi-form-field
              class="md:col-span-4"
              label="Имя"
              htmlFor="p-first"
              [required]="true"
              [error]="
                form.controls.firstName.invalid && form.controls.firstName.touched
                  ? 'Обязательное поле'
                  : ''
              "
            >
              <app-pi-input
                id="p-first"
                formControlName="firstName"
                placeholder="Иван"
                [invalid]="form.controls.firstName.invalid && form.controls.firstName.touched"
                data-test="first-name-input"
              />
            </app-pi-form-field>
            <app-pi-form-field class="md:col-span-4" label="Отчество" htmlFor="p-patronymic">
              <app-pi-input
                id="p-patronymic"
                formControlName="patronymic"
                placeholder="Иванович"
                data-test="patronymic-input"
              />
            </app-pi-form-field>
          </div>
        </app-pi-form-section>

        <app-pi-form-section
          title="Контакты и должность"
          headingId="people-sec-contact"
          tone="neutral"
        >
          <div class="grid grid-cols-1 gap-form-field md:grid-cols-12 md:gap-x-3 md:gap-y-2">
            <app-pi-form-field class="md:col-span-8" label="Должность" htmlFor="p-position">
              <app-pi-input
                id="p-position"
                formControlName="position"
                placeholder="Менеджер"
                data-test="position-input"
              />
            </app-pi-form-field>
            <app-pi-form-field class="md:col-span-4" label="Отдел" htmlFor="p-department">
              <app-pi-input
                id="p-department"
                formControlName="department"
                placeholder="Цех"
                data-test="department-input"
              />
            </app-pi-form-field>

            <app-pi-form-field class="md:col-span-8" label="Email" htmlFor="p-email">
              <app-pi-input
                id="p-email"
                type="email"
                formControlName="email"
                placeholder="name@example.com"
                data-test="email-input"
              />
            </app-pi-form-field>
            <app-pi-form-field class="md:col-span-4" label="Телефон" htmlFor="p-phone">
              <div class="max-w-[14rem]">
                <app-pi-input
                  id="p-phone"
                  formControlName="phone"
                  placeholder="+7 …"
                  data-test="phone-input"
                />
              </div>
            </app-pi-form-field>
          </div>
        </app-pi-form-section>

        <app-pi-form-section
          title="Виды работ и заметки"
          headingId="people-sec-work"
          tone="neutral"
        >
          <fieldset class="space-y-2" data-test="work-types-fieldset">
            <legend class="text-sm font-medium text-ink">Виды работ</legend>
            <p class="text-xs text-muted-foreground">
              К какому виду работ привязан человек — так он появится на диаграмме Ганта.
            </p>
            @if (workTypesLoading()) {
              <p class="text-xs text-muted-foreground">Загрузка видов работ…</p>
            } @else if (!workTypes().length) {
              <p class="text-xs text-muted-foreground">Справочник видов работ пуст.</p>
            } @else {
              <div class="max-h-40 overflow-y-auto border hairline rounded-sm p-2 space-y-1.5">
                @for (wt of workTypes(); track wt._id) {
                  <label class="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      class="pi-focus-ring"
                      [checked]="selectedWorkTypeIds().has(wt._id)"
                      (change)="toggleWorkType(wt._id, $event)"
                      [attr.data-test]="'work-type-' + wt._id"
                    />
                    <span>{{ wt.name }}</span>
                    @if (wt.days != null) {
                      <span class="text-[11px] text-muted-foreground">{{ wt.days }}д</span>
                    }
                  </label>
                }
              </div>
            }
          </fieldset>

          <app-pi-form-field label="Заметки" htmlFor="p-notes">
            <app-pi-textarea
              id="p-notes"
              [rows]="3"
              formControlName="notes"
              [maxLength]="500"
              data-test="notes-input"
            />
          </app-pi-form-field>

          <div class="flex items-center gap-2">
            <app-pi-checkbox
              formControlName="isActive"
              ariaLabel="Активен"
              data-test="active-checkbox"
            />
            <span class="text-sm">Активен</span>
          </div>
        </app-pi-form-section>
      </form>

      <div footer class="flex justify-end gap-2">
        <app-pi-button type="button" variant="ghost" (click)="onCancel()" data-test="cancel-button">
          Отмена
        </app-pi-button>
        <app-pi-button
          type="button"
          variant="default"
          [disabled]="submitting()"
          (click)="onSubmit()"
          data-test="save-button"
        >
          {{ submitting() ? 'Сохранение…' : 'Сохранить' }}
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class PeopleFormDialogComponent implements OnInit {
  private readonly data = inject<Person | null>(PI_DIALOG_DATA);
  private readonly ref = inject<DialogRef<Person | null>>(PI_DIALOG_REF);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(PiWorkersService);
  private readonly workTypesApi = inject(WorkTypesService);
  private readonly toast = inject(PiToastService);

  protected readonly isEdit = this.data != null;
  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly workTypes = signal<WorkType[]>([]);
  protected readonly workTypesLoading = signal(true);
  protected readonly selectedWorkTypeIds = signal(new Set<string>(this.data?.workTypeIds ?? []));

  protected readonly form = this.fb.group({
    lastName: this.fb.control(this.data?.lastName ?? '', [
      Validators.required,
      Validators.maxLength(120),
    ]),
    firstName: this.fb.control(this.data?.firstName ?? '', [
      Validators.required,
      Validators.maxLength(120),
    ]),
    patronymic: this.fb.control(this.data?.patronymic ?? ''),
    position: this.fb.control(this.data?.position ?? ''),
    department: this.fb.control(this.data?.department ?? ''),
    email: this.fb.control(this.data?.email ?? '', [Validators.maxLength(120)]),
    phone: this.fb.control(this.data?.phone ?? ''),
    notes: this.fb.control(this.data?.notes ?? '', [Validators.maxLength(500)]),
    isActive: this.fb.control(this.data?.isActive ?? true),
  });

  ngOnInit(): void {
    this.workTypesApi.list({ activeOnly: true }).subscribe((res) => {
      this.workTypesLoading.set(false);
      if (res.ok) this.workTypes.set(res.data?.items ?? []);
    });
  }

  protected toggleWorkType(id: string, ev: Event): void {
    const checked = (ev.target as HTMLInputElement).checked;
    const next = new Set(this.selectedWorkTypeIds());
    if (checked) next.add(id);
    else next.delete(id);
    this.selectedWorkTypeIds.set(next);
  }

  protected onSubmit(): void {
    if (this.submitting()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const payload: CreatePersonPayload = {
      lastName: v.lastName.trim(),
      firstName: v.firstName.trim(),
      patronymic: v.patronymic.trim() || undefined,
      position: v.position.trim() || undefined,
      department: v.department.trim() || undefined,
      email: v.email.trim() || undefined,
      phone: v.phone.trim() || undefined,
      notes: v.notes.trim() || undefined,
      isActive: v.isActive,
      workTypeIds: [...this.selectedWorkTypeIds()],
    };
    this.submitting.set(true);
    this.formError.set(null);
    const op = this.isEdit
      ? this.service.update(this.data!._id, payload)
      : this.service.create(payload);
    op.subscribe((res) => {
      this.submitting.set(false);
      if (res.ok) {
        this.toast.success(this.isEdit ? 'Сохранено' : 'Человек добавлен');
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
