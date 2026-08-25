import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { TextareaComponent } from '../../shared/ui/textarea/textarea.component';
import { PiFormSectionComponent } from '../../shared/ui/form-section';
import { SwitchComponent } from '../../shared/ui/switch/switch.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiToastService } from '../../shared/ui/toast';
import { extractErrorMessage } from '../../core/silent-http';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import {
  DocumentTemplateCategoriesService,
  DocumentTemplateCategory,
} from '../../shared/services/pi-document-template-categories.service';

type Result = DocumentTemplateCategory | null | undefined;

/**
 * TZ-DOC-308 — create/edit dialog for document-template categories.
 *
 * Contract (backend TZ-DOC-307):
 *   - `name` is required; `slug` is OPTIONAL — the server generates it
 *     from the name (Russian→Latin transliteration) when omitted, so the
 *     user never has to invent an ASCII key for a Cyrillic name.
 *   - `isDefault` marks the category as the server-side default for new
 *     templates (org scope, falling back to system «Общее»).
 *   - System categories are read-only: the page disables edit/delete for
 *     them; this dialog is only opened for non-system categories.
 *
 * NOTE (switch binding): `app-pi-switch` does NOT implement
 * ControlValueAccessor, so `formControlName` on it would throw a runtime
 * «No value accessor» error. It is bound manually via `[checked]` +
 * `(checkedChange)` → `onIsDefaultChange` (same convention as
 * dictionaries/templates pages).
 */
@Component({
  selector: 'app-doc-template-category-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    PiDialogComponent,
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
    TextareaComponent,
    SwitchComponent,
    PiFormSectionComponent,
  ],
  template: `
    <app-pi-dialog
      [title]="isEdit() ? 'Редактировать категорию шаблона' : 'Создать категорию шаблона'"
      [width]="'md'"
    >
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="space-y-form-field"
        data-test="doc-template-category-form"
      >
        <app-pi-form-section
          title="Основные данные"
          headingId="doc-category-sec-basics"
          tone="gold"
        >
          <app-pi-form-field
            label="Название"
            htmlFor="dtc-name"
            [required]="true"
            [error]="errorFor('name')"
          >
            <app-pi-input
              id="dtc-name"
              formControlName="name"
              placeholder="Коммерческие предложения"
              [invalid]="hasError('name')"
            />
          </app-pi-form-field>

          <app-pi-form-field
            label="Slug (ключ)"
            htmlFor="dtc-slug"
            hint="Необязательно — сервер сгенерирует из названия. Строчные латинские, цифры, дефис."
            [error]="errorFor('slug')"
          >
            <app-pi-input id="dtc-slug" formControlName="slug" [invalid]="hasError('slug')" />
          </app-pi-form-field>

          <app-pi-form-field label="Описание" htmlFor="dtc-description">
            <app-pi-textarea
              id="dtc-description"
              formControlName="description"
              [rows]="2"
              [maxLength]="512"
              ariaLabel="Описание категории шаблона"
            />
          </app-pi-form-field>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field items-center">
            <app-pi-form-field
              label="Категория по умолчанию"
              htmlFor="dtc-isDefault"
              hint="Автоподстановка для новых шаблонов"
            >
              <app-pi-switch
                id="dtc-isDefault"
                [checked]="form.controls.isDefault.value"
                (checkedChange)="onIsDefaultChange($event)"
                ariaLabel="Категория по умолчанию"
              />
            </app-pi-form-field>

            <app-pi-form-field label="Порядок сортировки" htmlFor="dtc-sortOrder">
              <input
                id="dtc-sortOrder"
                type="number"
                formControlName="sortOrder"
                min="0"
                class="pi-input w-full mono"
              />
            </app-pi-form-field>
          </div>

          @if (errorMessage()) {
            <p role="alert" class="text-xs text-destructive">{{ errorMessage() }}</p>
          }
        </app-pi-form-section>
      </form>

      <div footer class="flex gap-3">
        <app-pi-button
          type="button"
          variant="default"
          [disabled]="submitting()"
          (click)="onSubmit()"
        >
          {{ submitting() ? 'Сохранение…' : 'Сохранить' }}
        </app-pi-button>
        <app-pi-button type="button" variant="ghost" (click)="onCancel()"> Отмена </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class DocumentTemplateCategoryFormDialogComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(DocumentTemplateCategoriesService);
  private readonly toast = inject(PiToastService);
  private readonly ref = inject<DialogRef<Result>>(PI_DIALOG_REF);
  private readonly data = inject<DocumentTemplateCategory | null>(PI_DIALOG_DATA);

  protected readonly isEdit = signal(this.data != null);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.group({
    name: this.fb.control(this.data?.name ?? '', [Validators.required, Validators.maxLength(128)]),
    slug: this.fb.control(this.data?.slug ?? '', [
      Validators.maxLength(64),
      Validators.pattern(/^[a-z0-9-]+$/),
    ]),
    description: this.fb.control(this.data?.description ?? '', [Validators.maxLength(512)]),
    isDefault: this.fb.control(this.data?.isDefault ?? false),
    sortOrder: this.fb.control(this.data?.sortOrder ?? 0),
  });

  protected hasError(name: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.dirty || c.touched);
  }

  protected errorFor(name: keyof typeof this.form.controls): string {
    const c = this.form.controls[name];
    if (!c.invalid || (!c.dirty && !c.touched)) return '';
    if (c.errors?.['required']) return 'Обязательное поле';
    if (c.errors?.['maxlength']) {
      return `Максимум ${c.errors['maxlength'].requiredLength} символов`;
    }
    if (c.errors?.['pattern']) return 'Только строчные латинские, цифры, дефис';
    return 'Некорректное значение';
  }

  protected onIsDefaultChange(value: boolean): void {
    this.form.controls.isDefault.setValue(value);
  }

  protected onSubmit(): void {
    if (this.submitting()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const payload: {
      name: string;
      slug?: string;
      description?: string;
      isDefault?: boolean;
      sortOrder?: number;
    } = {
      name: v.name,
      slug: v.slug || undefined,
      isDefault: v.isDefault,
      sortOrder: v.sortOrder,
    };
    if (v.description) payload.description = v.description;

    this.submitting.set(true);
    this.errorMessage.set(null);

    const obs = this.data
      ? this.service.update(this.data._id, payload)
      : this.service.create(payload);

    obs.subscribe((res) => {
      if (res.ok) {
        this.toast.success(this.isEdit() ? 'Категория обновлена' : 'Категория создана');
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
