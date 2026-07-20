import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiToastService } from '../../shared/ui/toast';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { extractErrorMessage } from '../../core/silent-http';
import {
  Organization,
  OrganizationsService,
  ORG_TYPES,
  ORG_TYPE_LABELS,
  type OrgType,
} from '../../shared/services/organizations.service';

type Result = Organization | null | undefined;

@Component({
  selector: 'app-organization-form-dialog',
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
    <app-pi-dialog
      [title]="isEdit() ? 'Редактировать организацию' : 'Создать организацию'"
      [width]="'lg'"
    >
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="space-y-form-field"
        data-test="organization-form"
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field">
          <app-pi-form-field
            label="Полное наименование"
            htmlFor="org-name"
            [required]="true"
            [error]="errorFor('name')"
          >
            <app-pi-input
              id="org-name"
              formControlName="name"
              placeholder="Полное наименование"
              [invalid]="hasError('name')"
            />
          </app-pi-form-field>

          <app-pi-form-field
            label="Краткое наименование"
            htmlFor="org-shortName"
            [error]="errorFor('shortName')"
          >
            <app-pi-input
              id="org-shortName"
              formControlName="shortName"
              placeholder="Краткое наименование"
            />
          </app-pi-form-field>

          <app-pi-form-field
            label="ИНН"
            htmlFor="org-inn"
            [required]="true"
            [error]="errorFor('inn')"
          >
            <app-pi-input
              id="org-inn"
              formControlName="inn"
              placeholder="ИНН"
              [invalid]="hasError('inn')"
            />
          </app-pi-form-field>

          <app-pi-form-field label="КПП" htmlFor="org-kpp" [error]="errorFor('kpp')">
            <app-pi-input id="org-kpp" formControlName="kpp" placeholder="КПП" />
          </app-pi-form-field>
        </div>

        <app-pi-form-field label="Типы (роли)">
          <div class="flex flex-wrap gap-2">
            @for (t of allTypes; track t) {
              <label
                class="inline-flex items-center gap-2 min-h-touch px-control-x py-control-y hairline rounded-sm cursor-pointer hover:bg-paper-2 transition-colors"
                [class.bg-sunrise-warm]="form.controls.type.value.includes(t)"
                [class.text-paper]="form.controls.type.value.includes(t)"
                [class.border-ink]="form.controls.type.value.includes(t)"
              >
                <input
                  type="checkbox"
                  [attr.name]="'org-type-' + t"
                  [checked]="form.controls.type.value.includes(t)"
                  (change)="onTypeToggle(t, $any($event.target).checked)"
                  class="sr-only"
                />
                <span class="text-sm">{{ typeLabels[t] }}</span>
              </label>
            }
          </div>
        </app-pi-form-field>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field">
          <app-pi-form-field label="Контактное лицо" htmlFor="org-signer">
            <app-pi-input
              id="org-signer"
              formControlName="signerName"
              placeholder="ФИО контактного лица"
            />
          </app-pi-form-field>

          <app-pi-form-field label="Должность" htmlFor="org-position">
            <app-pi-input
              id="org-position"
              formControlName="signerPosition"
              placeholder="Должность"
            />
          </app-pi-form-field>
        </div>

        @if (errorMessage()) {
          <p role="alert" class="text-xs text-destructive">
            {{ errorMessage() }}
          </p>
        }
      </form>

      <div footer class="flex gap-3">
        <app-pi-button
          type="button"
          variant="default"
          [disabled]="form.invalid || submitting()"
          (click)="onSubmit()"
        >
          {{ submitting() ? 'Сохранение…' : 'Сохранить' }}
        </app-pi-button>
        <app-pi-button type="button" variant="ghost" (click)="onCancel()"> Отмена </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class OrganizationFormDialogComponent {
  constructor() {
    if (this.data) {
      this.form.patchValue({
        name: this.data.name,
        shortName: this.data.shortName ?? null,
        inn: this.data.inn,
        kpp: this.data.kpp ?? null,
        type: this.data.type ?? [],
        signerName: this.data.signerName ?? null,
        signerPosition: this.data.signerPosition ?? null,
      });
    }
  }
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(OrganizationsService);
  private readonly toast = inject(PiToastService);
  private readonly ref = inject<DialogRef<Result>>(PI_DIALOG_REF);
  private readonly data = inject<Organization | null>(PI_DIALOG_DATA);

  protected readonly allTypes = ORG_TYPES;
  protected readonly typeLabels = ORG_TYPE_LABELS;

  protected readonly isEdit = signal<boolean>(this.data != null);
  protected readonly submitting = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.group({
    name: this.fb.control('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(256),
    ]),
    shortName: this.fb.control<string | null>(null, [Validators.maxLength(128)]),
    inn: this.fb.control('', [Validators.required, Validators.pattern(/^\d{10,12}$/)]),
    kpp: this.fb.control<string | null>(null, [Validators.maxLength(16)]),
    type: this.fb.control<OrgType[]>([]),
    signerName: this.fb.control<string | null>(null),
    signerPosition: this.fb.control<string | null>(null),
  });

  protected onTypeToggle(t: OrgType, checked: boolean): void {
    const current = this.form.controls.type.value ?? [];
    const next = checked ? [...new Set([...current, t])] : current.filter((x) => x !== t);
    this.form.controls.type.setValue(next);
  }

  protected hasError(name: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.dirty || c.touched);
  }

  protected errorFor(name: keyof typeof this.form.controls): string {
    const c = this.form.controls[name];
    if (!c.invalid || (!c.dirty && !c.touched)) return '';
    if (c.errors?.['required']) return 'Обязательное поле';
    if (c.errors?.['pattern']) return 'Некорректный формат';
    if (c.errors?.['email']) return 'Невалидный e-mail';
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
    const payload: Partial<Organization> = {
      name: v.name,
      inn: v.inn,
      type: v.type,
    };
    if (v.shortName) payload.shortName = v.shortName;
    if (v.kpp) payload.kpp = v.kpp;
    if (v.signerName) payload.signerName = v.signerName;
    if (v.signerPosition) payload.signerPosition = v.signerPosition;

    this.submitting.set(true);
    this.errorMessage.set(null);
    const obs = this.data
      ? this.service.update(this.data._id, payload)
      : this.service.create(payload);
    obs.subscribe((res) => {
      if (res.ok) {
        this.toast.success(this.isEdit() ? 'Организация обновлена' : 'Организация создана');
        this.ref.close(res.data);
      } else {
        this.errorMessage.set(extractErrorMessage(res.error));
        this.submitting.set(false);
      }
    });
  }

  protected onCancel(): void {
    this.ref.close(null);
  }
}
