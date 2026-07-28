import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../shared/ui/input/input.component';

import { PiEntityFormComponent } from '../../shared/dsl/entity-form/pi-entity-form.component';
import { PI_DIALOG_DATA } from '../../shared/ui/dialog/dialog.tokens';

import {
  Organization,
  OrganizationsService,
  ORG_TYPES,
  ORG_TYPE_LABELS,
  type OrgType,
} from '../../shared/services/organizations.service';

/**
 * TZ-232.G — OrganizationFormDialog migrated onto `<pi-entity-form>`.
 *
 * Preserves the org-specific UX:
 *  - Multi-role type toggle (chip-style checkboxes for ORG_TYPES[])
 *  - INN pattern validation (10-12 digits)
 *
 * Migrated boilerplate removed:
 *  - Submitting signal / formError signal management
 *  - SubmitGuard wiring (now in wrapper)
 *  - Toast on save / error (now in wrapper)
 *  - ref.close() / markedAllAsTouched (now in wrapper)
 */
@Component({
  selector: 'app-organization-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormFieldComponent,
    InputComponent,
    PiEntityFormComponent,
  ],
  template: `
    <app-pi-entity-form
      [mutator]="mutator"
      [endpoint]="'organizations'"
      [title]="isEdit ? 'Редактировать организацию' : 'Создать организацию'"
      [formGroup]="form"
      [payloadFn]="payloadFn"
      [isEdit]="isEdit"
      [createSuccessMessage]="'Организация создана'"
      [updateSuccessMessage]="'Организация обновлена'"
      [width]="'lg'"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field" fields>
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

      <app-pi-form-field label="Типы (роли)" fields>
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

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field" fields>
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
    </app-pi-entity-form>
  `,
})
export class OrganizationFormDialogComponent {
  protected readonly data = inject<Organization | null>(PI_DIALOG_DATA);
  protected readonly mutator = inject(OrganizationsService);
  protected readonly allTypes = ORG_TYPES;
  protected readonly typeLabels = ORG_TYPE_LABELS;
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly isEdit = this.data != null;

  protected readonly form = this.fb.group({
    name: this.fb.control('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(256),
    ]),
    shortName: this.fb.control<string | null>(null, [Validators.maxLength(128)]),
    inn: this.fb.control('', [Validators.required, Validators.pattern(/^\d{10,12}$/)]),
    kpp: this.fb.control<string | null>(null, [Validators.maxLength(16)]),
    type: this.fb.control<OrgType[]>(this.data?.type ?? []),
    signerName: this.fb.control<string | null>(this.data?.signerName ?? null),
    signerPosition: this.fb.control<string | null>(this.data?.signerPosition ?? null),
  });

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

  protected readonly payloadFn = (): Partial<Organization> => {
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
    return payload;
  };

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
}
