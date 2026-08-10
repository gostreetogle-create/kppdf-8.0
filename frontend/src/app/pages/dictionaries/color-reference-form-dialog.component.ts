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

const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const RAL_NAME_RE = /^RAL\s*(\d{4})(?:\s*[—-]\s*(.+))?$/i;

interface ParsedRalName {
  code: string | null;
  title: string;
}

function parseRalName(name: string | undefined): ParsedRalName {
  const match = name?.trim().match(RAL_NAME_RE);
  return match ? { code: match[1], title: match[2]?.trim() ?? '' } : { code: null, title: '' };
}

/**
 * TZ-PRODUCTS-301 — create/edit dialog for color references (RAL).
 *
 * Contract (backend TZ-PRODUCTS-301):
 *   - `name` is required; `slug` is OPTIONAL — the server generates it
 *     from the name (Russian→Latin transliteration) when omitted.
 *   - `hex` is optional and validated client-side as `#RRGGBB` (mirrors the
 *     backend `@IsHexColor()` — 400 on invalid hex).
 *   - System colors are read-only: the page disables edit/delete for them;
 *     this dialog is only opened for non-system colors.
 *   - Copy flow: the page passes `{ ...c, _id: undefined }` — the dialog
 *     detects create-mode by the missing `_id` and pre-fills the fields.
 *
 * Layout: `variant="content"` + `[maxWidth]="'min(1120px, calc(100vw - 2rem))'"` — wide dialog with
 * internal body scroll and an ALWAYS-VISIBLE sticky footer (Save/Cancel).
 * The shared PiDialogComponent content template already provides the
 * flex-column + min-h-0 + overflow-y-auto body and `sticky bottom-0 bg-paper`
 * footer (TZ-MATERIALS dialog layout fix contract), so long forms never push
 * «Сохранить» off-screen.
 *
 * NOTE (switch binding): `app-pi-switch` does NOT implement
 * ControlValueAccessor, so it is bound manually via `[checked]` +
 * `(checkedChange)` (same convention as dictionaries/templates pages).
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
      [maxWidth]="'min(1120px, calc(100vw - 2rem))'"
    >
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="space-y-form-field"
        data-test="color-reference-form"
      >
        <!-- ─── Two-column layout: basics (left) + appearance (right) ─── -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-form-field items-start">
          <!-- ─── LEFT: код и подпись ─── -->
          <div class="space-y-form-field">
            <p class="eyebrow">Основное</p>

            @if (isRalMode()) {
              <app-pi-form-field
                label="Код RAL"
                htmlFor="cr-ral-code"
                hint="Введите номер RAL — префикс подставится сам. Только 4 цифры."
                [required]="true"
                [error]="errorFor('ralCode')"
              >
                <div class="flex items-center gap-2">
                  <span
                    class="h-10 inline-flex items-center px-3 hairline rounded-sm bg-paper-2 font-mono text-sm"
                    >RAL</span
                  >
                  <app-pi-input
                    id="cr-ral-code"
                    type="tel"
                    formControlName="ralCode"
                    placeholder="9003"
                    ariaLabel="Четыре цифры кода RAL"
                    [invalid]="hasError('ralCode')"
                    (valueChange)="onRalCodeInput($event)"
                    data-test="ral-code-input"
                  />
                </div>
              </app-pi-form-field>

              <app-pi-form-field label="Название / описание" htmlFor="cr-title">
                <app-pi-input
                  id="cr-title"
                  formControlName="title"
                  placeholder="Сигнальный белый"
                  data-test="ral-title-input"
                />
              </app-pi-form-field>
            } @else {
              <app-pi-form-field
                label="Название"
                htmlFor="cr-name"
                [required]="true"
                [error]="errorFor('name')"
              >
                <app-pi-input
                  id="cr-name"
                  formControlName="name"
                  placeholder="Название цвета"
                  [invalid]="hasError('name')"
                />
              </app-pi-form-field>
            }

            <app-pi-form-field
              label="Slug (ключ)"
              htmlFor="cr-slug"
              hint="Необязательно — сервер сгенерирует из названия. Строчные латинские, цифры, дефис."
              [error]="errorFor('slug')"
            >
              <app-pi-input
                id="cr-slug"
                formControlName="slug"
                placeholder="ral-9003-signalny-belyy"
                [invalid]="hasError('slug')"
              />
            </app-pi-form-field>

            <app-pi-form-field label="Описание" htmlFor="cr-description">
              <app-pi-textarea
                id="cr-description"
                formControlName="description"
                [rows]="2"
                [maxLength]="512"
                ariaLabel="Описание цвета"
              />
            </app-pi-form-field>
          </div>

          <!-- ─── RIGHT: цвет (hex swatch) + настройки ─── -->
          <div class="space-y-form-field">
            <p class="eyebrow">Цвет</p>

            <app-pi-form-field
              label="Hex (#RRGGBB)"
              htmlFor="cr-hex"
              hint="Необязательно. Swatch-кружок в таблице и в RAL-выпадающем списке товара."
              [error]="errorFor('hex')"
            >
              <div class="flex items-center gap-3">
                <label
                  class="inline-flex items-center justify-center w-12 h-12 rounded-sm hairline cursor-pointer overflow-hidden shrink-0"
                  [style.background]="hexPreview()"
                  [class.border-destructive]="hasError('hex')"
                  data-test="hex-swatch-picker"
                >
                  <input
                    id="cr-hex"
                    type="color"
                    formControlName="hex"
                    class="sr-only"
                    aria-label="Выбрать цвет"
                    data-test="hex-color-input"
                  />
                  <span class="text-[10px] font-mono text-paper mix-blend-difference">#</span>
                </label>
                <app-pi-input
                  formControlName="hex"
                  placeholder="#F4F4F4"
                  class="flex-1 font-mono"
                  [invalid]="hasError('hex')"
                />
              </div>
            </app-pi-form-field>

            <div class="hairline rounded-sm bg-paper-2 px-3 py-2 space-y-3">
              <label
                class="inline-flex items-center gap-2 min-h-touch px-control-x py-control-y hairline rounded-sm cursor-pointer"
              >
                <input
                  id="cr-isActive"
                  type="checkbox"
                  formControlName="isActive"
                  class="w-4 h-4"
                />
                <span class="text-sm">Активен (доступен в RAL-списке товара)</span>
              </label>

              <div class="flex items-center justify-between gap-2">
                <div>
                  <p class="text-sm">Цвет по умолчанию</p>
                  <p class="text-xs text-muted-foreground">
                    Автоподстановка для товаров без выбранного цвета
                  </p>
                </div>
                <app-pi-switch
                  id="cr-isDefault"
                  [checked]="form.controls.isDefault.value"
                  (checkedChange)="onIsDefaultChange($event)"
                  ariaLabel="Цвет по умолчанию"
                  data-test="is-default-switch"
                />
              </div>
            </div>
          </div>
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

  /**
   * Create-mode when no `_id` — supports the page's copy flow, which passes
   * `{ ...c, _id: undefined }` to pre-fill the fields.
   */
  protected readonly isEdit = signal(this.data != null && !!this.data._id);
  private readonly parsedRalName = parseRalName(this.data?.name);
  protected readonly isRalMode = signal(this.data == null || this.parsedRalName.code != null);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.group({
    name: this.fb.control(
      this.data?.name ?? '',
      this.isRalMode()
        ? [Validators.maxLength(128)]
        : [Validators.required, Validators.maxLength(128)],
    ),
    ralCode: this.fb.control(
      this.parsedRalName.code ?? '',
      this.isRalMode()
        ? [Validators.required, Validators.pattern(/^\d{4}$/)]
        : [Validators.pattern(/^\d{4}$/)],
    ),
    title: this.fb.control(this.parsedRalName.title, [Validators.maxLength(128)]),
    slug: this.fb.control(this.data?.slug ?? '', [
      Validators.maxLength(64),
      Validators.pattern(/^[a-z0-9-]+$/),
    ]),
    hex: this.fb.control(this.data?.hex ?? '', [
      Validators.maxLength(7),
      Validators.pattern(HEX_RE),
    ]),
    description: this.fb.control(this.data?.description ?? '', [Validators.maxLength(512)]),
    isActive: this.fb.control(this.data?.isActive ?? true),
    isDefault: this.fb.control(this.data?.isDefault ?? false),
  });

  /** Live swatch preview — falls back to a neutral placeholder when empty/invalid. */
  protected hexPreview(): string {
    const v = (this.form.controls.hex.value ?? '').trim();
    return HEX_RE.test(v) ? v : '#9CA3AF';
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
      if (name === 'ralCode') return 'Введите ровно 4 цифры';
      return name === 'hex'
        ? 'Формат: #RRGGBB (например, #F4F4F4)'
        : 'Только строчные латинские, цифры, дефис';
    }
    return 'Некорректное значение';
  }

  protected onIsDefaultChange(value: boolean): void {
    this.form.controls.isDefault.setValue(value);
  }

  protected onRalCodeInput(value: string): void {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits !== value) this.form.controls.ralCode.setValue(digits);
  }

  protected onSubmit(): void {
    if (this.submitting()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const name = this.isRalMode()
      ? `RAL ${v.ralCode}${v.title.trim() ? ` — ${v.title.trim()}` : ''}`
      : v.name.trim();
    const payload: {
      name: string;
      slug?: string;
      hex?: string;
      description?: string;
      isActive?: boolean;
      isDefault?: boolean;
    } = {
      name,
      slug: v.slug || undefined,
      isActive: v.isActive,
      isDefault: v.isDefault,
    };
    const hex = (v.hex ?? '').trim();
    if (hex) payload.hex = hex;
    if (v.description) payload.description = v.description;

    this.submitting.set(true);
    this.errorMessage.set(null);

    const obs = this.data?._id
      ? this.service.update(this.data._id, payload)
      : this.service.create(payload);

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
