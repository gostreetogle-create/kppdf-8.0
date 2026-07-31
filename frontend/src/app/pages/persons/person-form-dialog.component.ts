import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { TextareaComponent } from '../../shared/ui/textarea/textarea.component';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { PiToastService } from '../../shared/ui/toast';
import { extractErrorMessage } from '../../core/silent-http';
import { Person, PersonService } from '../../shared/services/pi-person.service';

@Component({
  selector: 'app-person-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
    TextareaComponent,
    PiDialogComponent,
  ],
  template: `
    <app-pi-dialog
      [title]="isEdit ? 'Редактировать физическое лицо' : 'Создать физическое лицо'"
      [width]="'md'"
    >
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="space-y-form-field"
        data-test="person-form"
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field">
          <app-pi-form-field
            label="Фамилия"
            htmlFor="person-last-name"
            [required]="true"
            [error]="errorFor('lastName')"
          >
            <app-pi-input
              id="person-last-name"
              formControlName="lastName"
              placeholder="Фамилия"
              [invalid]="hasError('lastName')"
            />
          </app-pi-form-field>
          <app-pi-form-field
            label="Имя"
            htmlFor="person-first-name"
            [required]="true"
            [error]="errorFor('firstName')"
          >
            <app-pi-input
              id="person-first-name"
              formControlName="firstName"
              placeholder="Имя"
              [invalid]="hasError('firstName')"
            />
          </app-pi-form-field>
        </div>
        <app-pi-form-field label="Отчество" htmlFor="person-patronymic">
          <app-pi-input
            id="person-patronymic"
            formControlName="patronymic"
            placeholder="Отчество"
          />
        </app-pi-form-field>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field">
          <app-pi-form-field label="Телефон" htmlFor="person-phone">
            <app-pi-input id="person-phone" type="tel" formControlName="phone" placeholder="+7…" />
          </app-pi-form-field>
          <app-pi-form-field label="E-mail" htmlFor="person-email" [error]="errorFor('email')">
            <app-pi-input
              id="person-email"
              type="email"
              formControlName="email"
              placeholder="name@example.com"
              [invalid]="hasError('email')"
            />
          </app-pi-form-field>
        </div>
        <app-pi-form-field label="Должность" htmlFor="person-position">
          <app-pi-input id="person-position" formControlName="position" placeholder="Должность" />
        </app-pi-form-field>
        <app-pi-form-field label="Примечание" htmlFor="person-notes">
          <app-pi-textarea
            id="person-notes"
            formControlName="notes"
            [rows]="3"
            [maxLength]="2000"
          />
        </app-pi-form-field>
        @if (formError()) {
          <p role="alert" class="text-xs text-destructive">{{ formError() }}</p>
        }
      </form>
      <div footer class="flex gap-3">
        <app-pi-button
          variant="default"
          type="submit"
          [disabled]="form.invalid || submitting()"
          (click)="onSubmit()"
          >{{ submitting() ? 'Сохранение…' : 'Сохранить' }}</app-pi-button
        >
        <app-pi-button variant="ghost" type="button" (click)="onCancel()">Отмена</app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class PersonFormDialogComponent {
  protected readonly data = inject<Person | null>(PI_DIALOG_DATA);
  protected readonly ref = inject<DialogRef<Person | null>>(PI_DIALOG_REF);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(PersonService);
  private readonly toast = inject(PiToastService);
  protected readonly isEdit = this.data != null;
  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly form = this.fb.group({
    lastName: this.fb.control(this.data?.lastName ?? '', [
      Validators.required,
      Validators.maxLength(64),
    ]),
    firstName: this.fb.control(this.data?.firstName ?? '', [
      Validators.required,
      Validators.maxLength(64),
    ]),
    patronymic: this.fb.control(this.data?.patronymic ?? '', [Validators.maxLength(64)]),
    phone: this.fb.control(this.data?.phone ?? '', [Validators.maxLength(32)]),
    email: this.fb.control(this.data?.email ?? '', [Validators.email]),
    position: this.fb.control(this.data?.position ?? '', [Validators.maxLength(128)]),
    notes: this.fb.control(this.data?.notes ?? '', [Validators.maxLength(2000)]),
  });

  protected hasError(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.dirty || control.touched);
  }

  protected errorFor(name: keyof typeof this.form.controls): string {
    const control = this.form.controls[name];
    if (!this.hasError(name)) return '';
    if (control.errors?.['required']) return 'Обязательное поле';
    if (control.errors?.['email']) return 'Некорректный e-mail';
    if (control.errors?.['maxlength'])
      return `Максимум ${control.errors['maxlength'].requiredLength} символов`;
    return 'Некорректное значение';
  }

  protected onSubmit(): void {
    if (this.submitting()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const payload: Partial<Person> = {
      lastName: value.lastName,
      firstName: value.firstName,
      patronymic: value.patronymic || undefined,
      phone: value.phone || undefined,
      email: value.email || undefined,
      position: value.position || undefined,
      notes: value.notes || undefined,
    };
    this.submitting.set(true);
    this.formError.set(null);
    const request = this.data
      ? this.service.update(this.data._id, payload)
      : this.service.create(payload);
    request.subscribe((result) => {
      if (result.ok) {
        this.toast.success(this.isEdit ? 'Физическое лицо обновлено' : 'Физическое лицо создано');
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
