import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { TextareaComponent } from '../../shared/ui/textarea/textarea.component';
import { SwitchComponent } from '../../shared/ui/switch/switch.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiToastService } from '../../shared/ui/toast';
import { extractErrorMessage } from '../../core/silent-http';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import {
  PiColorReferencesService,
  ColorReference,
} from '../../shared/services/pi-color-references.service';

type Result = ColorReference | null | undefined;

const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;

/**
 * TZ-PRODUCTS-301 — create/edit dialog for color references.
 *
 * Contract (backend TZ-PRODUCTS-301):
 *   - `name` is required; `slug` is OPTIONAL — the server generates it from
 *     the name (Russian→Latin transliteration, kebab-case) when omitted.
 *   - `hex` is REQUIRED and validated as `#RRGGBB` (400 on anything else).
 *     The UI offers a native color picker + a text field that mirrors it.
 *   - `isDefault` marks the color as the server-side default for product
 *     forms (org scope, falling back to system «Не выбран»).
 *   - System colors are read-only: the page disables edit/delete for them;
 *     this dialog is only opened for non-system colors.
 *
 * Layout: `variant="content"` + `[maxWidth]="'1000px'"` — wide dialog with
 * internal body scroll and an ALWAYS-VISIBLE sticky footer (Save/Cancel).
 * The shared PiDialogComponent content template provides `overflow-y-auto`
 * on the body and `sticky bottom-0 bg-paper` on the footer (TZ-MATERIALS
 * dialog fix), so long forms never push «Сохранить» off-screen.
 */
@Component({
  selector: 'app-color-reference-form-dialog',
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
  ],
  template: `
    <app-pi-dialog
      [title]="isEdit() ? 'Редактировать цвет' : 'Создать цвет'"
      [variant]="'content'"
      [maxWidth]="'1000px'"
    >
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="space-y-form-field"
        data-test="color-reference-form"
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field items-start">
          <div class="space-y-form-field">
            <p class="eyebrow">Основные данные</p>

            <app-pi-form-field
              label="Название"
              htmlFor="cr-name"
              [required]="true"
              [error]="errorFor('name')"
            >
              <app-pi-input
                id="cr-name"
                formControlName="name"
                placeholder="RAL 9003 (Сигнальный белый)"
                [invalid]="hasError('name')"
              />
            </app-pi-form-field>

            <app-pi-form-field
              label="Slug (ключ)"
              htmlFor="cr-slug"
              hint="Необязательно — сервер сгенерирует из названия. Строчные латинские, цифры, дефис."
              [error]="errorFor('slug')"
            >
              <app-pi-input
                id="cr-slug"
                formControlName="slug"
                placeholder="ral-9003-signal-white"
                [invalid]="hasError('slug')"
              />
            </app-pi-form-field>
          </div>

          <div class="space-y-form-field">
            <p class="eyebrow">Цвет и свойства</p>

            <app-pi-form-field
              label="Цвет (HEX)"
              htmlFor="cr-hex"
              [required]="true"
              hint="#RRGGBB — например #FFFFFF"
              [error]="errorFor('hex')"
            >
              <div class="flex items-center gap-2">
                <input
                  id="cr-hex"
                  formControlName="hex"
                  class="pi-input w-full mono"
                  [class.border-destructive]="hasError('hex')"
                  placeholder="#FFFFFF"
                  data-test="cr-hex"
                />
                <label
                  class="shrink-0 inline-flex items-center gap-1 min-h-touch px-2 hairline rounded-sm bg-paper hover:bg-paper-2 cursor-pointer transition-colors"
                  [attr.aria-label]="'Выбрать цвет'"
                >
                  <input
                    type="color"
                    class="w-8 h-8 cursor-pointer border-0 bg-transparent p-0"
                    [value]="normalizedHex()"
                    (input)="onPickerInput($event)"
                    aria-label="Палитра"
                  />
                </label>
              </div>
            </app-pi-form-field>

            <app-pi-form-field
              label="Описание"
              htmlFor="cr-description"
              [error]="errorFor('description')"
            >
              <app-pi-textarea
                id="cr-description"
                formControlName="description"
                [rows]="2"
                [maxLength]="512"
                [invalid]="hasError('description')"
                ariaLabel="Описание цвета"
              />
            </app-pi-form-field>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field items-center">
          <app-pi-form-field
            label="Цвет по умолчанию"
            htmlFor="cr-isDefault"
            hint="Автоподстановка для новых товаров"
          >
            <app-pi-switch
              id="cr-isDefault"
              [checked]="form.controls.isDefault.value"
              (checkedChange)="onIsDefaultChange($event)"
              ariaLabel="Цвет по умолчанию"
            />
          </app-pi-form-field>

          <app-pi-form-field label="Порядок сортировки" htmlFor="cr-sortOrder">
            <input
              id="cr-sortOrder"
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
export class ColorReferenceFormDialogComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(PiColorReferencesService);
  private readonly toast = inject(PiToastService);
  private readonly ref = inject<DialogRef<Result>>(PI_DIALOG_REF);
  private readonly data = inject<ColorReference | null>(PI_DIALOG_DATA);

  protected readonly isEdit = signal(this.data != null);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.group({
    name: this.fb.control(this.data?.name ?? '', [Validators.required, Validators.maxLength(128)]),
    slug: this.fb.control(this.data?.slug ?? '', [
      Validators.maxLength(64),
      Validators.pattern(/^[a-z0-9-]+$/),
    ]),
    hex: this.fb.control(this.data?.hex ?? '#FFFFFF', [
      Validators.required,
      Validators.pattern(HEX_PATTERN),
    ]),
    description: this.fb.control(this.data?.description ?? '', [Validators.maxLength(512)]),
    isDefault: this.fb.control(this.data?.isDefault ?? false),
    sortOrder: this.fb.control(this.data?.sortOrder ?? 0),
  });

  /** Uppercased hex for the native picker's `value` binding (#RRGGBB required). */
  protected normalizedHex(): string {
    const v = this.form.controls.hex.value.trim();
    return HEX_PATTERN.test(v) ? v.toUpperCase() : '#FFFFFF';
  }

  protected onPickerInput(e: Event): void {
    const hex = (e.target as HTMLInputElement).value;
    if (HEX_PATTERN.test(hex)) {
      this.form.controls.hex.setValue(hex.toUpperCase());
    }
  }

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
    if (c.errors?.['pattern']) {
      return name === 'hex' ? 'Формат #RRGGBB' : 'Только строчные латинские, цифры, дефис';
    }
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
      hex: string;
      description?: string;
      isDefault?: boolean;
      sortOrder?: number;
    } = {
      name: v.name,
      slug: v.slug || undefined,
      hex: v.hex.trim().toUpperCase(),
      isDefault: v.isDefault,
      sortOrder: v.sortOrder,
    };
    if (v.description) payload.description = v.description;

    this.submitting.set(true);
    this.errorMessage.set(null);

    const obs = this.data
      ? this.service.update(this.data._id, payload)
      : this.service.create(payload);

    // Typed-result pattern: `res` is SilentResult<ColorReference>, not
    // `unknown` — the explicit generic flows from update()/create() above.
    obs.subscribe((res) => {
      if (res.ok) {
        this.toast.success(this.isEdit() ? 'Цвет обновлён' : 'Цвет создан');
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
