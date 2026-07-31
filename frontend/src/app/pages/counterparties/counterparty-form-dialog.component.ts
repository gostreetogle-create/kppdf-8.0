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
import {
  Counterparty,
  CounterpartyRole,
  CounterpartyService,
} from '../../shared/services/pi-counterparty.service';

@Component({
  selector: 'app-counterparty-form-dialog',
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
    <app-pi-dialog
      [title]="isEdit ? 'Редактировать контрагента' : 'Создать контрагента'"
      [width]="'lg'"
    >
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="space-y-form-field"
        data-test="counterparty-form"
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field">
          <app-pi-form-field
            label="Полное наименование"
            htmlFor="counterparty-name"
            [required]="true"
            [error]="errorFor('name')"
            ><app-pi-input
              id="counterparty-name"
              formControlName="name"
              placeholder="ООО «Ромашка»"
              [invalid]="hasError('name')"
          /></app-pi-form-field>
          <app-pi-form-field label="Краткое наименование" htmlFor="counterparty-short"
            ><app-pi-input
              id="counterparty-short"
              formControlName="shortName"
              placeholder="Ромашка"
          /></app-pi-form-field>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-form-field">
          <app-pi-form-field
            label="ИНН"
            htmlFor="counterparty-inn"
            [required]="true"
            [error]="errorFor('inn')"
            ><app-pi-input
              id="counterparty-inn"
              formControlName="inn"
              placeholder="10 или 12 цифр"
              [invalid]="hasError('inn')"
          /></app-pi-form-field>
          <app-pi-form-field label="КПП" htmlFor="counterparty-kpp"
            ><app-pi-input id="counterparty-kpp" formControlName="kpp"
          /></app-pi-form-field>
          <app-pi-form-field label="ОГРН" htmlFor="counterparty-ogrn"
            ><app-pi-input id="counterparty-ogrn" formControlName="ogrn"
          /></app-pi-form-field>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field">
          <app-pi-form-field label="Юридическая форма" htmlFor="counterparty-legal-form"
            ><app-pi-input
              id="counterparty-legal-form"
              formControlName="legalForm"
              placeholder="ООО"
          /></app-pi-form-field>
          <app-pi-form-field label="Тип" htmlFor="counterparty-legal-type"
            ><app-pi-input
              id="counterparty-legal-type"
              formControlName="legalType"
              placeholder="ooo / ip / ao…"
          /></app-pi-form-field>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field">
          <app-pi-form-field label="Контактное лицо" htmlFor="counterparty-signer"
            ><app-pi-input id="counterparty-signer" formControlName="signerName" placeholder="ФИО"
          /></app-pi-form-field>
          <app-pi-form-field label="Должность подписанта" htmlFor="counterparty-position"
            ><app-pi-input id="counterparty-position" formControlName="signerPosition"
          /></app-pi-form-field>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-form-field">
          <app-pi-form-field label="Банк" htmlFor="counterparty-bank"
            ><app-pi-input id="counterparty-bank" formControlName="bankName"
          /></app-pi-form-field>
          <app-pi-form-field label="БИК" htmlFor="counterparty-bik"
            ><app-pi-input id="counterparty-bik" formControlName="bankBik"
          /></app-pi-form-field>
          <app-pi-form-field label="Расчётный счёт" htmlFor="counterparty-account"
            ><app-pi-input id="counterparty-account" formControlName="bankAccount"
          /></app-pi-form-field>
        </div>
        <app-pi-form-field label="Роли контрагента" [required]="true" [error]="errorFor('roles')">
          <div class="flex flex-wrap gap-2">
            @for (role of roles(); track role._id) {
              <label
                class="inline-flex items-center gap-2 min-h-touch px-control-x py-control-y hairline rounded-sm cursor-pointer hover:bg-paper-2 transition-colors"
                [class.bg-sunrise-warm]="form.controls.roles.value.includes(role.slug)"
                [class.text-paper]="form.controls.roles.value.includes(role.slug)"
              >
                <input
                  type="checkbox"
                  class="sr-only"
                  [attr.name]="'counterparty-role-' + role.slug"
                  [checked]="form.controls.roles.value.includes(role.slug)"
                  (change)="onRoleToggle(role.slug, $any($event.target).checked)"
                />
                <span class="text-sm">{{ role.name }}</span>
              </label>
            }
          </div>
          @if (rolesLoadError()) {
            <p role="alert" class="text-xs text-destructive">{{ rolesLoadError() }}</p>
          } @else if (roles().length === 0) {
            <p class="text-xs text-muted-foreground">Роли пока не настроены.</p>
          }
        </app-pi-form-field>
        <div class="flex items-center gap-2">
          <app-pi-checkbox formControlName="isActive" ariaLabel="Активен" />
          <span class="text-sm">Активен</span>
        </div>
        @if (formError()) {
          <p role="alert" class="text-xs text-destructive">{{ formError() }}</p>
        }
      </form>
      <div footer class="flex gap-3">
        <app-pi-button
          variant="default"
          [disabled]="form.invalid || submitting() || !!rolesLoadError()"
          (click)="onSubmit()"
          >{{ submitting() ? 'Сохранение…' : 'Сохранить' }}</app-pi-button
        ><app-pi-button variant="ghost" (click)="onCancel()">Отмена</app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class CounterpartyFormDialogComponent {
  protected readonly data = inject<Counterparty | null>(PI_DIALOG_DATA);
  protected readonly ref = inject<DialogRef<Counterparty | null>>(PI_DIALOG_REF);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(CounterpartyService);
  private readonly toast = inject(PiToastService);
  protected readonly isEdit = this.data != null;
  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly roles = signal<CounterpartyRole[]>([]);
  protected readonly rolesLoadError = signal<string | null>(null);
  protected readonly form = this.fb.group({
    name: this.fb.control(this.data?.name ?? '', [Validators.required, Validators.maxLength(256)]),
    shortName: this.fb.control(this.data?.shortName ?? '', [Validators.maxLength(128)]),
    inn: this.fb.control(this.data?.inn ?? '', [
      Validators.required,
      Validators.pattern(/^\d{10,12}$/),
    ]),
    kpp: this.fb.control(this.data?.kpp ?? '', [Validators.maxLength(16)]),
    ogrn: this.fb.control(this.data?.ogrn ?? '', [Validators.maxLength(16)]),
    legalForm: this.fb.control(this.data?.legalForm ?? ''),
    legalType: this.fb.control(this.data?.legalType ?? '', [
      Validators.pattern(/^(ooo|ip|pao|ao|other)$/),
    ]),
    signerName: this.fb.control(this.data?.signerName ?? ''),
    signerPosition: this.fb.control(this.data?.signerPosition ?? ''),
    bankName: this.fb.control(this.data?.bankName ?? ''),
    bankBik: this.fb.control(this.data?.bankBik ?? '', [Validators.maxLength(9)]),
    bankAccount: this.fb.control(this.data?.bankAccount ?? '', [Validators.maxLength(32)]),
    roles: this.fb.control<string[]>(this.data?.roles ?? [], [Validators.minLength(1)]),
    isActive: this.fb.control(this.data?.isActive ?? true),
  });

  constructor() {
    this.service.listRoles().subscribe((result) => {
      if (result.ok) {
        this.roles.set(result.data.filter((role) => role.isActive));
      } else {
        this.rolesLoadError.set(extractErrorMessage(result.error));
      }
    });
  }

  protected onRoleToggle(slug: string, checked: boolean): void {
    const current = this.form.controls.roles.value;
    const next = checked
      ? [...new Set([...current, slug])]
      : current.filter((value) => value !== slug);
    this.form.controls.roles.setValue(next);
    this.form.controls.roles.markAsDirty();
  }

  protected hasError(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.dirty || control.touched);
  }

  protected errorFor(name: keyof typeof this.form.controls): string {
    const control = this.form.controls[name];
    if (!this.hasError(name)) return '';
    if (control.errors?.['required']) return 'Обязательное поле';
    if (control.errors?.['minlength']) return 'Выберите хотя бы одну роль';
    if (control.errors?.['pattern']) {
      return name === 'inn'
        ? 'ИНН должен содержать 10–12 цифр'
        : 'Допустимые значения: ooo, ip, pao, ao, other';
    }
    return 'Некорректное значение';
  }
  protected onSubmit(): void {
    if (this.submitting()) return;
    if (this.rolesLoadError()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const payload: Partial<Counterparty> = {
      ...value,
      legalType: (value.legalType || undefined) as Counterparty['legalType'],
      shortName: value.shortName || undefined,
      kpp: value.kpp || undefined,
      ogrn: value.ogrn || undefined,
      bankName: value.bankName || undefined,
      bankBik: value.bankBik || undefined,
      bankAccount: value.bankAccount || undefined,
      signerName: value.signerName || undefined,
      signerPosition: value.signerPosition || undefined,
      legalForm: value.legalForm || undefined,
      roles: value.roles,
      type: this.data?.type ?? [],
    };
    this.submitting.set(true);
    this.formError.set(null);
    const request = this.data
      ? this.service.update(this.data._id, payload)
      : this.service.create(payload);
    request.subscribe((result) => {
      if (result.ok) {
        this.toast.success(this.isEdit ? 'Контрагент обновлён' : 'Контрагент создан');
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
