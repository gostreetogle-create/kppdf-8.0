import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../ui/button/button.component';
import { FormFieldComponent } from '../ui/form-field/form-field.component';
import { InputComponent } from '../ui/input/input.component';
import { PiDialogComponent } from '../ui/dialog/pi-dialog.component';
import { PI_DIALOG_REF } from '../ui/dialog/dialog.tokens';
import type { DialogRef } from '../ui/dialog/pi-dialog.service';
import { PiToastService } from '../ui/toast';
import { PersonsService, type Person } from '../services/pi-persons.service';
import { extractErrorMessage } from '../../core/silent-http';

/**
 * TZ-PARTY-306 — inline create for contact persons (PersonsService, not Workers).
 * Compact form opened from overflow-select + buttons in counterparty / KP flows.
 */
@Component({
  selector: 'app-person-quick-create-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    PiDialogComponent,
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
  ],
  template: `
    <app-pi-dialog title="Новое контактное лицо" [width]="'sm'" variant="form" [animate]="false">
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="grid grid-cols-1 sm:grid-cols-2 gap-form-field"
        data-test="person-quick-create-form"
      >
        <app-pi-form-field label="Фамилия" htmlFor="pqc-lastName" [error]="errorFor('lastName')">
          <app-pi-input
            id="pqc-lastName"
            formControlName="lastName"
            placeholder="Иванов"
            [invalid]="hasError('lastName')"
            data-test="pqc-last-name"
          />
        </app-pi-form-field>

        <app-pi-form-field
          label="Имя"
          htmlFor="pqc-firstName"
          [required]="true"
          [error]="errorFor('firstName')"
        >
          <app-pi-input
            id="pqc-firstName"
            formControlName="firstName"
            placeholder="Иван"
            [invalid]="hasError('firstName')"
            data-test="pqc-first-name"
          />
        </app-pi-form-field>

        <app-pi-form-field class="sm:col-span-2" label="Отчество" htmlFor="pqc-patronymic">
          <app-pi-input
            id="pqc-patronymic"
            formControlName="patronymic"
            placeholder="Иванович"
            data-test="pqc-patronymic"
          />
        </app-pi-form-field>

        <app-pi-form-field label="Телефон" htmlFor="pqc-phone">
          <app-pi-input
            id="pqc-phone"
            formControlName="phone"
            placeholder="+7 900 000-00-00"
            data-test="pqc-phone"
          />
        </app-pi-form-field>

        <app-pi-form-field label="Почта" htmlFor="pqc-email" [error]="errorFor('email')">
          <app-pi-input
            id="pqc-email"
            type="email"
            formControlName="email"
            placeholder="name@example.ru"
            [invalid]="hasError('email')"
            data-test="pqc-email"
          />
        </app-pi-form-field>

        <app-pi-form-field class="sm:col-span-2" label="Должность" htmlFor="pqc-position">
          <app-pi-input
            id="pqc-position"
            formControlName="position"
            placeholder="Менеджер по закупкам"
            data-test="pqc-position"
          />
        </app-pi-form-field>

        @if (errorMessage()) {
          <p role="alert" class="sm:col-span-2 text-xs text-destructive" data-test="pqc-form-error">
            {{ errorMessage() }}
          </p>
        }
      </form>

      <div footer class="flex justify-end gap-2">
        <app-pi-button type="button" variant="ghost" (click)="onCancel()">Отмена</app-pi-button>
        <app-pi-button
          type="button"
          variant="default"
          [disabled]="submitting()"
          (click)="onSubmit()"
          data-test="pqc-save"
        >
          {{ submitting() ? 'Создание…' : 'Создать' }}
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class PersonQuickCreateDialogComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly personsService = inject(PersonsService);
  private readonly toast = inject(PiToastService);
  private readonly ref = inject<DialogRef<Person | null>>(PI_DIALOG_REF);

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.group({
    lastName: this.fb.control('', [Validators.maxLength(64)]),
    firstName: this.fb.control('', [Validators.required, Validators.maxLength(64)]),
    patronymic: this.fb.control('', [Validators.maxLength(64)]),
    phone: this.fb.control('', [Validators.maxLength(32)]),
    email: this.fb.control('', [Validators.email, Validators.maxLength(256)]),
    position: this.fb.control('', [Validators.maxLength(128)]),
  });

  protected hasError(name: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.dirty || c.touched);
  }

  protected errorFor(name: keyof typeof this.form.controls): string {
    const c = this.form.controls[name];
    if (!c.invalid || (!c.dirty && !c.touched)) return '';
    if (c.errors?.['required']) return 'Обязательное поле';
    if (c.errors?.['email']) return 'Некорректный адрес почты';
    if (c.errors?.['maxlength']) {
      return `Максимум ${c.errors['maxlength'].requiredLength} символов`;
    }
    return 'Некорректное значение';
  }

  protected onSubmit(): void {
    if (this.submitting()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const payload: Partial<Person> = {
      firstName: v.firstName.trim(),
    };
    const lastName = v.lastName.trim();
    const patronymic = v.patronymic.trim();
    const phone = v.phone.trim();
    const email = v.email.trim();
    const position = v.position.trim();
    if (lastName) payload.lastName = lastName;
    if (patronymic) payload.patronymic = patronymic;
    if (phone) payload.phone = phone;
    if (email) payload.email = email;
    if (position) payload.position = position;

    this.submitting.set(true);
    this.errorMessage.set(null);
    this.personsService.create(payload).subscribe((res) => {
      if (res.ok) {
        this.toast.success('Контактное лицо создано');
        this.ref.close(res.data);
        return;
      }
      this.errorMessage.set(extractErrorMessage(res.error));
      this.submitting.set(false);
    });
  }

  protected onCancel(): void {
    this.ref.close(null);
  }
}
