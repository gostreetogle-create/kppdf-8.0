import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import {
  PI_DIALOG_DATA,
  PI_DIALOG_REF,
} from '../../shared/ui/dialog/dialog.tokens';
import { PiToastService } from '../../shared/ui/toast';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import {
  Organization,
  OrganizationsService,
  ORG_TYPES,
  ORG_TYPE_LABELS,
  type OrgType,
} from './organizations.service';

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
            <input
              id="org-name"
              type="text"
              formControlName="name"
              maxlength="256"
              autocomplete="off"
              class="w-full h-10 px-control-x text-sm border hairline border-rule rounded-sm bg-paper text-ink font-body focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper transition-colors"
              [class.border-destructive]="hasError('name')"
            />
          </app-pi-form-field>

          <app-pi-form-field
            label="Краткое наименование"
            htmlFor="org-shortName"
            [error]="errorFor('shortName')"
          >
            <input
              id="org-shortName"
              type="text"
              formControlName="shortName"
              maxlength="128"
              autocomplete="off"
              class="w-full h-10 px-control-x text-sm border hairline border-rule rounded-sm bg-paper text-ink font-body focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper transition-colors"
            />
          </app-pi-form-field>

          <app-pi-form-field
            label="ИНН"
            htmlFor="org-inn"
            [required]="true"
            [error]="errorFor('inn')"
          >
            <input
              id="org-inn"
              type="text"
              formControlName="inn"
              maxlength="12"
              autocomplete="off"
              class="w-full h-10 px-control-x text-sm border hairline border-rule rounded-sm bg-paper text-ink font-body focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper transition-colors mono"
              [class.border-destructive]="hasError('inn')"
            />
          </app-pi-form-field>

          <app-pi-form-field
            label="КПП"
            htmlFor="org-kpp"
            [error]="errorFor('kpp')"
          >
            <input
              id="org-kpp"
              type="text"
              formControlName="kpp"
              maxlength="16"
              autocomplete="off"
              class="w-full h-10 px-control-x text-sm border hairline border-rule rounded-sm bg-paper text-ink font-body focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper transition-colors mono"
            />
          </app-pi-form-field>
        </div>

        <app-pi-form-field label="Типы (роли)">
          <div class="flex flex-wrap gap-2">
            @for (t of allTypes; track t) {
              <label
                class="inline-flex items-center gap-2 min-h-touch px-control-x py-control-y border hairline border-rule rounded-sm cursor-pointer hover:bg-paper-2 transition-colors"
                [class.bg-ink]="form.controls.type.value.includes(t)"
                [class.text-paper]="form.controls.type.value.includes(t)"
                [class.border-ink]="form.controls.type.value.includes(t)"
              >
                <input
                  type="checkbox"
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
          <app-pi-form-field
            label="Контактное лицо"
            htmlFor="org-signer"
          >
            <input
              id="org-signer"
              type="text"
              formControlName="signerName"
              autocomplete="off"
              class="w-full h-10 px-control-x text-sm border hairline border-rule rounded-sm bg-paper text-ink font-body focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper transition-colors"
            />
          </app-pi-form-field>

          <app-pi-form-field
            label="Должность"
            htmlFor="org-position"
          >
            <input
              id="org-position"
              type="text"
              formControlName="signerPosition"
              autocomplete="off"
              class="w-full h-10 px-control-x text-sm border hairline border-rule rounded-sm bg-paper text-ink font-body focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper transition-colors"
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
        <app-pi-button type="button" variant="ghost" (click)="onCancel()">
          Отмена
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class OrganizationFormDialogComponent implements OnInit {
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
    name: this.fb.control('', [Validators.required, Validators.minLength(1), Validators.maxLength(256)]),
    shortName: this.fb.control<string | null>(null, [Validators.maxLength(128)]),
    inn: this.fb.control('', [Validators.required, Validators.pattern(/^\d{10,12}$/)]),
    kpp: this.fb.control<string | null>(null, [Validators.maxLength(16)]),
    type: this.fb.control<OrgType[]>([]),
    signerName: this.fb.control<string | null>(null),
    signerPosition: this.fb.control<string | null>(null),
  });

  ngOnInit(): void {
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

  protected onTypeToggle(t: OrgType, checked: boolean): void {
    const current = this.form.controls.type.value ?? [];
    const next = checked
      ? [...new Set([...current, t])]
      : current.filter((x) => x !== t);
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
    obs.subscribe({
      next: (saved) => {
        this.toast.success(
          this.isEdit() ? 'Организация обновлена' : 'Организация создана',
        );
        this.ref.close(saved);
      },
      error: (err: unknown) => {
        const e = err as { error?: { message?: string }; message?: string };
        this.errorMessage.set(
          e?.error?.message ?? e?.message ?? 'Не удалось сохранить.',
        );
        this.submitting.set(false);
      },
    });
  }

  protected onCancel(): void {
    this.ref.close(null);
  }
}
