import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { PiCategoriesService, type Category, type CategoryType } from '@kppdf/data-access';
import { PiDialogComponent, PI_DIALOG_DATA, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import { ButtonComponent } from '@kppdf/ui/button';
import { FormFieldComponent } from '@kppdf/ui/form-field';
import { InputComponent } from '@kppdf/ui/input';
import { TextareaComponent } from '@kppdf/ui/textarea';
import { CheckboxComponent } from '@kppdf/ui/checkbox';
import { extractErrorMessage } from '@kppdf/util-http';

export interface CategoryFormDialogData {
  readonly mode: 'create' | 'edit';
  readonly category?: Category | null;
  /** Full current list — used to filter the parent picker to same-type siblings as `type` changes. */
  readonly categories: readonly Category[];
}

/** RU labels for the 3 wireable types (audit scope) — `general` stays out of the create dropdown. */
export const CATEGORY_TYPE_OPTIONS: ReadonlyArray<{ value: CategoryType; label: string }> = [
  { value: 'material', label: 'Детали' },
  { value: 'product', label: 'Изделия' },
  { value: 'module', label: 'Модули' },
];

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

/** Best-effort RU→Latin transliteration for the skuPrefix suggestion — not a general-purpose slugifier. */
function transliterate(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .map((ch) => CYRILLIC_TO_LATIN[ch] ?? ch)
    .join('');
}

/** `skuPrefix` must match `^[A-Z0-9-]+$` (backend `CreateCategoryDto`) — this always satisfies it. */
export function suggestSkuPrefix(name: string): string {
  const upper = transliterate(name)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return upper.slice(0, 16) || 'CAT';
}

/**
 * TZ-NX-REG-CATEGORIES-CRUD — create/edit for `Category` (reused by
 * material/product/module category selects, wired in the follow-up TZs of
 * this wave). `slug` is never its own form field — derived from `skuPrefix`
 * (already Latin-only by construction), so the operator only ever thinks
 * about one code, not two.
 */
@Component({
  selector: 'pi-category-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    PiDialogComponent,
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
    TextareaComponent,
    CheckboxComponent,
  ],
  template: `<app-pi-dialog [title]="title" variant="content" [showClose]="true" (userClose)="ref.close(undefined)">
    <form body [formGroup]="form" (ngSubmit)="submit()" class="space-y-3" data-test="category-form">
      <app-pi-form-field label="Название" htmlFor="cat-name" [required]="true">
        <app-pi-input id="cat-name" formControlName="name" (valueChange)="onNameChange($event)" data-test="category-name" />
      </app-pi-form-field>
      <label class="flex flex-col gap-1 text-sm" for="cat-type">
        <span>Категория чего *</span>
        <select
          id="cat-type"
          class="pi-input pi-focus-ring"
          formControlName="type"
          (change)="onTypeChange()"
          data-test="category-type"
        >
          @for (opt of typeOptions; track opt.value) {
            <option [value]="opt.value">{{ opt.label }}</option>
          }
        </select>
      </label>
      <label class="flex flex-col gap-1 text-sm" for="cat-parent">
        <span>Родительская категория (необязательно)</span>
        <select id="cat-parent" class="pi-input pi-focus-ring" formControlName="parentId" data-test="category-parent">
          <option value="">Без родителя</option>
          @for (p of parentOptions(); track p._id) {
            <option [value]="p._id">{{ p.name }}</option>
          }
        </select>
      </label>
      <app-pi-form-field label="Префикс SKU" htmlFor="cat-sku" [required]="true">
        <app-pi-input id="cat-sku" formControlName="skuPrefix" (valueChange)="onSkuPrefixChange($event)" data-test="category-sku" />
      </app-pi-form-field>
      <app-pi-form-field label="Описание" htmlFor="cat-description">
        <app-pi-textarea id="cat-description" formControlName="description" [rows]="2" />
      </app-pi-form-field>
      <div class="inline-flex items-center gap-2 text-sm">
        <app-pi-checkbox formControlName="isActive" ariaLabel="Активна" data-test="category-active" />
        <span>Активна</span>
      </div>
      @if (errorMessage()) {
        <p role="alert" class="text-destructive text-sm" data-test="category-form-error">{{ errorMessage() }}</p>
      }
    </form>
    <div footer class="flex justify-end gap-3">
      <app-pi-button variant="default" [disabled]="saving()" (click)="submit()" data-test="category-save">
        {{ saving() ? 'Сохранение…' : 'Сохранить' }}
      </app-pi-button>
      <app-pi-button variant="outline" (click)="ref.close(undefined)">Отмена</app-pi-button>
    </div>
  </app-pi-dialog>`,
})
export class CategoryFormDialogComponent {
  protected readonly data = inject<CategoryFormDialogData>(PI_DIALOG_DATA);
  protected readonly ref = inject<DialogRef<Category | undefined>>(PI_DIALOG_REF);
  private readonly service = inject(PiCategoriesService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly typeOptions = CATEGORY_TYPE_OPTIONS;

  protected readonly title = this.data.mode === 'edit' ? 'Редактировать категорию' : 'Создать категорию';

  /** Auto-suggest skuPrefix from name until the operator edits skuPrefix by hand. */
  private skuPrefixTouched = false;

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    type: this.fb.control<CategoryType>(this.data.category?.type ?? 'material', Validators.required),
    parentId: [this.data.category?.parentId ?? ''],
    skuPrefix: ['', Validators.required],
    description: [''],
    isActive: [true],
  });

  /**
   * A plain `signal`, not `computed()` — `computed()` only tracks other
   * Signal reads, and `FormControl.value` is a plain property, not a
   * Signal, so a `computed()` here would never re-run when `type` changes
   * via the native `<select>`'s `(change)` handler. Kept in sync manually
   * from `onTypeChange()` (and once at construction).
   */
  protected readonly parentOptions = signal<readonly Category[]>([]);

  constructor() {
    const category = this.data.category;
    if (category) {
      this.skuPrefixTouched = true;
      this.form.patchValue({
        name: category.name,
        type: category.type,
        parentId: category.parentId ?? '',
        skuPrefix: category.skuPrefix,
        description: category.description ?? '',
        isActive: category.isActive,
      });
    }
    this.updateParentOptions();
  }

  private updateParentOptions(): void {
    const type = this.form.controls.type.value;
    const editingId = this.data.category?._id;
    this.parentOptions.set(this.data.categories.filter((c) => c.type === type && c._id !== editingId));
  }

  protected onNameChange(value: string): void {
    if (!this.skuPrefixTouched) {
      this.form.controls.skuPrefix.setValue(suggestSkuPrefix(value));
    }
  }

  protected onSkuPrefixChange(value: string): void {
    this.skuPrefixTouched = value.trim().length > 0;
  }

  protected onTypeChange(): void {
    this.updateParentOptions();
    const stillValid = this.parentOptions().some((p) => p._id === this.form.controls.parentId.value);
    if (!stillValid) this.form.controls.parentId.setValue('');
  }

  protected async submit(): Promise<void> {
    if (this.saving() || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.errorMessage.set(null);
    const raw = this.form.getRawValue();
    const skuPrefix = raw.skuPrefix.trim().toUpperCase();
    const payload = {
      name: raw.name.trim(),
      slug: skuPrefix.toLowerCase(),
      type: raw.type,
      skuPrefix,
      parentId: raw.parentId || undefined,
      description: raw.description.trim() || undefined,
      isActive: raw.isActive,
    };
    const result =
      this.data.mode === 'edit' && this.data.category
        ? await firstValueFrom(this.service.update(this.data.category._id, payload))
        : await firstValueFrom(this.service.create(payload));
    this.saving.set(false);
    if (!result.ok) {
      this.errorMessage.set(extractErrorMessage(result.error));
      return;
    }
    this.ref.close(result.data);
  }
}
