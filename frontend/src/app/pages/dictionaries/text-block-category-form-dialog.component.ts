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
  TextBlockCategoriesService,
  TextBlockCategory,
} from '../../shared/services/pi-text-block-categories.service';

type Result = TextBlockCategory | null | undefined;

/**
 * TZ-DOC-316 — create/edit dialog for text-block categories.
 *
 * Contract (backend TZ-DOC-315):
 *   - `name` is required; `slug` is OPTIONAL — the server generates it
 *     from the name (Russian→Latin transliteration, kebab-case) when
 *     omitted, so the user never has to invent an ASCII key for a
 *     Cyrillic name.
 *   - `isDefault` marks the category as the server-side default for NEW
 *     text blocks (org scope, falling back to system «Общее»). The server
 *     enforces a single active default per scope; on 409 the UI shows the
 *     toast and the user can choose another category to be default.
 *   - System categories are read-only: the page disables edit/delete for
 *     them; this dialog is only opened for non-system categories.
 *
 * Whitelist payload: only the fields above are ever sent; the global
 * ValidationPipe strips anything else (400 on unknown fields is not
 * possible because we never send extras).
 *
 * NOTE (switch binding): `app-pi-switch` does NOT implement
 * ControlValueAccessor, so `formControlName` on it would throw a runtime
 * «No value accessor» error. It is bound manually via `[checked]` +
 * `(checkedChange)` (same convention as the dictionaries pages).
 */
@Component({
  selector: 'app-text-block-category-form-dialog',
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
      [title]="isEdit() ? 'Редактировать категорию текста' : 'Создать категорию текста'"
      [variant]="'content'"
      [maxWidth]="'min(1120px, calc(100vw - 2rem))'"
    >
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="space-y-form-field"
        data-test="text-block-category-form"
      >
        <app-pi-form-section
          title="Основные данные"
          headingId="text-category-sec-basics"
          tone="gold"
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field items-start">
            <div class="space-y-form-field">
              <app-pi-form-field
                label="Название"
                htmlFor="tbc-name"
                [required]="true"
                [error]="errorFor('name')"
              >
                <app-pi-input
                  id="tbc-name"
                  formControlName="name"
                  placeholder="Реквизиты контрагента"
                  [invalid]="hasError('name')"
                />
              </app-pi-form-field>

              <app-pi-form-field
                label="Slug (ключ)"
                htmlFor="tbc-slug"
                hint="Необязательно — сервер сгенерирует из названия. Строчные латинские, цифры, дефис."
                [error]="errorFor('slug')"
              >
                <app-pi-input id="tbc-slug" formControlName="slug" [invalid]="hasError('slug')" />
              </app-pi-form-field>
            </div>

            <div class="space-y-form-field">
              <app-pi-form-field label="Описание" htmlFor="tbc-description">
                <app-pi-textarea
                  id="tbc-description"
                  formControlName="description"
                  [rows]="2"
                  [maxLength]="512"
                  [invalid]="hasError('description')"
                  ariaLabel="Описание категории текста"
                />
              </app-pi-form-field>

              @if (isSystem()) {
                <p class="text-sm text-muted-foreground">
                  <span class="eyebrow hairline rounded-sm px-1.5 py-0.5 text-muted-foreground"
                    >системная</span
                  >
                  — управляется сервером, изменить нельзя
                </p>
              }
            </div>
          </div>
        </app-pi-form-section>

        <app-pi-form-section
          title="Дополнительно"
          headingId="text-category-sec-extra"
          tone="neutral"
        >
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-form-field items-center">
            <app-pi-form-field
              label="Активна"
              htmlFor="tbc-isActive"
              hint="Неактивные недоступны в редакторе блока"
            >
              <app-pi-switch
                id="tbc-isActive"
                [checked]="form.controls.isActive.value"
                (checkedChange)="onIsActiveChange($event)"
                ariaLabel="Категория активна"
              />
            </app-pi-form-field>

            <app-pi-form-field
              label="По умолчанию для новых блоков"
              htmlFor="tbc-isDefault"
              hint="Одна активная категория по умолчанию на область"
            >
              <app-pi-switch
                id="tbc-isDefault"
                [checked]="form.controls.isDefault.value"
                (checkedChange)="onIsDefaultChange($event)"
                ariaLabel="Категория по умолчанию"
              />
            </app-pi-form-field>

            <app-pi-form-field label="Порядок сортировки" htmlFor="tbc-sortOrder">
              <input
                id="tbc-sortOrder"
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
export class TextBlockCategoryFormDialogComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(TextBlockCategoriesService);
  private readonly toast = inject(PiToastService);
  private readonly ref = inject<DialogRef<Result>>(PI_DIALOG_REF);
  private readonly data = inject<TextBlockCategory | null>(PI_DIALOG_DATA);

  protected readonly isEdit = signal(this.data != null);
  protected readonly isSystem = signal(this.data?.isSystem ?? false);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.group({
    name: this.fb.control(this.data?.name ?? '', [Validators.required, Validators.maxLength(128)]),
    slug: this.fb.control(this.data?.slug ?? '', [
      Validators.maxLength(64),
      Validators.pattern(/^[a-z0-9-]+$/),
    ]),
    description: this.fb.control(this.data?.description ?? '', [Validators.maxLength(512)]),
    isActive: this.fb.control(this.data?.isActive ?? true),
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

  protected onIsActiveChange(value: boolean): void {
    this.form.controls.isActive.setValue(value);
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
      isActive?: boolean;
      isDefault?: boolean;
      sortOrder?: number;
    } = {
      name: v.name,
      slug: v.slug || undefined,
      isActive: v.isActive,
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
