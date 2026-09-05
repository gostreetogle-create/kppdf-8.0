import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { PiPeopleService, PiWorkTypesService, type Person, type PersonWritePayload, type WorkType } from '@kppdf/data-access';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiDialogComponent, PI_DIALOG_DATA, PI_DIALOG_REF } from '@kppdf/ui/dialog';
import type { DialogRef } from '@kppdf/ui/dialog';
import { FormFieldComponent } from '@kppdf/ui/form-field';
import { InputComponent } from '@kppdf/ui/input';
import { TextareaComponent } from '@kppdf/ui/textarea';
import { PiFormSectionComponent } from '@kppdf/ui/form-section';
import { CheckboxComponent } from '@kppdf/ui/checkbox';
import { extractErrorMessage } from '@kppdf/util-http';

export interface WorkerFormDialogData {
  readonly mode: 'create' | 'edit';
  readonly person?: Person | null;
}

@Component({
  selector: 'pi-worker-form-dialog',
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
      [title]="data.mode === 'edit' ? 'Редактировать человека' : 'Создать человека'"
      variant="content"
      [maxWidth]="'min(820px, calc(100vw - 2rem))'"
      [showClose]="true"
    >
      <form body [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4" data-test="worker-form">
        <app-pi-form-section title="Основные данные" headingId="worker-form-basics" tone="gold">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-form-field">
            <app-pi-form-field label="Фамилия" htmlFor="worker-last-name" [required]="true" [error]="fieldError('lastName')">
              <app-pi-input id="worker-last-name" formControlName="lastName" [invalid]="invalid('lastName')" data-test="worker-last-name" />
            </app-pi-form-field>
            <app-pi-form-field label="Имя" htmlFor="worker-first-name" [required]="true" [error]="fieldError('firstName')">
              <app-pi-input id="worker-first-name" formControlName="firstName" [invalid]="invalid('firstName')" data-test="worker-first-name" />
            </app-pi-form-field>
            <app-pi-form-field label="Отчество" htmlFor="worker-patronymic">
              <app-pi-input id="worker-patronymic" formControlName="patronymic" data-test="worker-patronymic" />
            </app-pi-form-field>
          </div>
        </app-pi-form-section>

        <app-pi-form-section title="Контакты и должность" headingId="worker-form-contact" tone="neutral">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-form-field">
            <app-pi-form-field label="Должность" htmlFor="worker-position">
              <app-pi-input id="worker-position" formControlName="position" data-test="worker-position" />
            </app-pi-form-field>
            <app-pi-form-field label="Отдел" htmlFor="worker-department">
              <app-pi-input id="worker-department" formControlName="department" data-test="worker-department" />
            </app-pi-form-field>
            <app-pi-form-field label="Email" htmlFor="worker-email">
              <app-pi-input id="worker-email" type="email" formControlName="email" data-test="worker-email" />
            </app-pi-form-field>
            <app-pi-form-field label="Телефон" htmlFor="worker-phone">
              <app-pi-input id="worker-phone" type="tel" formControlName="phone" data-test="worker-phone" />
            </app-pi-form-field>
          </div>
        </app-pi-form-section>

        <app-pi-form-section title="Навыки и заметки" headingId="worker-form-skills" tone="neutral">
          <fieldset class="space-y-2" data-test="worker-work-types-fieldset">
            <legend class="text-sm font-medium text-ink">Виды работ</legend>
            <p class="text-xs text-muted-foreground">Выберите навыки — по ним человек появится в подписях Ганта.</p>
            @if (workTypesLoading()) {
              <p class="text-xs text-muted-foreground">Загрузка видов работ…</p>
            } @else if (!workTypes().length) {
              <p class="text-xs text-muted-foreground">Справочник видов работ пуст.</p>
            } @else {
              <div class="max-h-40 overflow-y-auto border hairline rounded-sm p-2 space-y-1.5">
                @for (workType of workTypes(); track workType._id) {
                  <label class="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      class="pi-focus-ring"
                      [checked]="selectedWorkTypeIds().has(workType._id)"
                      (change)="toggleWorkType(workType._id, $event)"
                      [attr.data-test]="'worker-work-type-' + workType._id"
                    />
                    <span>{{ workType.name }}</span>
                    @if (workType.days != null) {
                      <span class="text-[11px] text-muted-foreground">{{ workType.days }}д</span>
                    }
                  </label>
                }
              </div>
            }
          </fieldset>
          <app-pi-form-field label="Заметки" htmlFor="worker-notes">
            <app-pi-textarea id="worker-notes" formControlName="notes" [rows]="3" data-test="worker-notes" />
          </app-pi-form-field>
          <div class="inline-flex items-center gap-2 text-sm">
            <app-pi-checkbox formControlName="isActive" ariaLabel="Активен" data-test="worker-active" />
            <span>Активен</span>
          </div>
        </app-pi-form-section>

        @if (errorMessage()) {
          <p role="alert" class="text-xs text-destructive" data-test="worker-form-error">{{ errorMessage() }}</p>
        }
      </form>
      <div footer class="flex justify-end gap-3">
        <app-pi-button type="button" variant="outline" (click)="onCancel()" data-test="worker-cancel">Отмена</app-pi-button>
        <app-pi-button type="button" [disabled]="submitting()" (click)="onSubmit()" data-test="worker-save">
          {{ submitting() ? 'Сохранение…' : 'Сохранить' }}
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class WorkerFormDialogComponent {
  readonly data = inject<WorkerFormDialogData>(PI_DIALOG_DATA);
  private readonly ref = inject<DialogRef<Person | null | undefined>>(PI_DIALOG_REF);
  private readonly peopleService = inject(PiPeopleService);
  private readonly workTypesService = inject(PiWorkTypesService);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly workTypes = signal<WorkType[]>([]);
  protected readonly workTypesLoading = signal(true);
  protected readonly selectedWorkTypeIds = signal(new Set<string>(this.data.person?.workTypeIds ?? []));

  protected readonly form = this.fb.group({
    lastName: this.fb.control(this.data.person?.lastName ?? '', [Validators.required, Validators.maxLength(120)]),
    firstName: this.fb.control(this.data.person?.firstName ?? '', [Validators.required, Validators.maxLength(120)]),
    patronymic: this.fb.control(this.data.person?.patronymic ?? ''),
    position: this.fb.control(this.data.person?.position ?? ''),
    department: this.fb.control(this.data.person?.department ?? ''),
    email: this.fb.control(this.data.person?.email ?? ''),
    phone: this.fb.control(this.data.person?.phone ?? ''),
    notes: this.fb.control(this.data.person?.notes ?? '', [Validators.maxLength(500)]),
    isActive: this.fb.control(this.data.person?.isActive ?? true),
  });

  ngOnInit(): void {
    this.workTypesService.list({ activeOnly: true }).subscribe((result) => {
      this.workTypesLoading.set(false);
      if (result.ok) this.workTypes.set(result.data.items);
    });
  }

  protected toggleWorkType(id: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const next = new Set(this.selectedWorkTypeIds());
    if (checked) next.add(id);
    else next.delete(id);
    this.selectedWorkTypeIds.set(next);
  }

  protected invalid(name: 'lastName' | 'firstName'): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.dirty || control.touched);
  }

  protected fieldError(name: 'lastName' | 'firstName'): string {
    const control = this.form.controls[name];
    if (!control.invalid || (!control.dirty && !control.touched)) return '';
    if (control.errors?.['required']) return 'Обязательное поле';
    if (control.errors?.['maxlength']) return 'Слишком длинное значение';
    return 'Некорректное значение';
  }

  protected async onSubmit(): Promise<void> {
    if (this.submitting()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const payload: PersonWritePayload = {
      lastName: value.lastName.trim(),
      firstName: value.firstName.trim(),
      workTypeIds: [...this.selectedWorkTypeIds()],
      isActive: value.isActive,
      ...(value.patronymic.trim() ? { patronymic: value.patronymic.trim() } : {}),
      ...(value.position.trim() ? { position: value.position.trim() } : {}),
      ...(value.department.trim() ? { department: value.department.trim() } : {}),
      ...(value.email.trim() ? { email: value.email.trim().toLowerCase() } : {}),
      ...(value.phone.trim() ? { phone: value.phone.trim() } : {}),
      ...(value.notes.trim() ? { notes: value.notes.trim() } : {}),
    };
    this.submitting.set(true);
    this.errorMessage.set(null);
    const result = this.data.mode === 'edit' && this.data.person
      ? await firstValueFrom(this.peopleService.update(this.data.person._id, payload))
      : await firstValueFrom(this.peopleService.create(payload));
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
