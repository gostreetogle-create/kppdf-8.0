import { ChangeDetectionStrategy, Component, inject, signal, OnDestroy } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { TextareaComponent } from '../../shared/ui/textarea/textarea.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiToastService } from '../../shared/ui/toast';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { extractErrorMessage } from '../../core/silent-http';
import {
  Product,
  ProductKind,
  ProductsService,
  ProductStatus,
} from '../../shared/services/products.service';
import { Category, CategoriesService } from '../../shared/services/categories.service';
import {
  ColorReference,
  ColorReferencesService,
} from '../../shared/services/pi-color-references.service';
import { Photo, PhotosService } from '../../shared/services/photos.service';

type Result = Product | null | undefined;

/** Slug системного цвета «Не выбран» (seed TZ-PRODUCTS-301, isDefault=true). */
const SYSTEM_DEFAULT_COLOR_SLUG = 'ne-vybran';

const KIND_OPTIONS: { value: ProductKind; label: string }[] = [
  { value: 'good', label: 'Товар' },
  { value: 'service', label: 'Услуга' },
  { value: 'work', label: 'Работа' },
];

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'draft', label: 'Черновик' },
  { value: 'new', label: 'Новый' },
  { value: 'active', label: 'Активный' },
  { value: 'archived', label: 'Архив' },
];

const DIMENSION_UNIT_OPTIONS = ['mm', 'cm', 'm'] as const;

/**
 * ProductFormDialogComponent — create/edit product (TZ-PRODUCTS-302).
 *
 * Wide content dialog (`variant="content"` + `maxWidth 1000px`, sticky
 * footer via the shared PiDialog contract — the same DSL as materials).
 * Fields are grouped into eyebrow sections:
 *
 *   1. Основные данные   — name, sku, kind, unit, subcategory, status
 *   2. Категория и цены  — categoryId (CategoriesService, type 'product'),
 *                          listPrice, isActive
 *   3. Габариты          — L/W/H + unit (full width)
 *   4. Дополнительно     — weightKg + Цвет (RAL) dropdown
 *   5. Изображения       — photo upload (TZ-MATERIALS-306 pattern; Product
 *                          has `photoIds` only — no mainPhotoId on backend)
 *   6. Описание и заметки — description, notes textareas
 *
 * RAL dropdown (TZ-PRODUCTS-302):
 *   - colors come from `ColorReferencesService.list({ activeOnly: true })`
 *     (system «Не выбран» color included — global seed from TZ-PRODUCTS-301).
 *   - option value = color `slug`; the payload keeps the backend string
 *     contract `ralCode` (NO `colorId` on backend Product — SUCCESSOR for
 *     TZ-PRODUCTS-303). A swatch chip beside the select previews the chosen
 *     hex.
 *   - default selection: SYSTEM_DEFAULT_COLOR_SLUG when nothing chosen
 *     (mirror of the categories default-selection pattern).
 *   - loading / error / empty states; empty state offers a link to
 *     /color-references (admin dictionary).
 *   - legacy `ralCode` values absent from the dictionary render as a
 *     disabled fallback option (material unitFallback pattern) so edit
 *     never silently blanks the select.
 *
 * Submit: double-submit guard (`submitting`), dialog stays open on API
 * error, toast + close(result) on success.
 *
 * Standalone + OnPush + signal-based.
 */
@Component({
  selector: 'app-product-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    PiDialogComponent,
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
    TextareaComponent,
  ],
  template: `
    <app-pi-dialog
      [title]="isEdit() ? 'Редактировать продукт' : 'Создать продукт'"
      [variant]="'content'"
      [maxWidth]="'1000px'"
    >
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="space-y-form-field"
        data-test="product-form"
      >
        <!-- ─── Two-column: basics (left) + category/prices (right) ─── -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-form-field items-start">
          <!-- ─── LEFT: Основные данные ─── -->
          <div class="space-y-form-field">
            <p class="eyebrow">Основные данные</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field">
              <app-pi-form-field
                label="Название"
                htmlFor="prod-name"
                [required]="true"
                [error]="errorFor('name')"
              >
                <app-pi-input
                  id="prod-name"
                  formControlName="name"
                  placeholder="Название продукта"
                  [invalid]="hasError('name')"
                />
              </app-pi-form-field>

              <app-pi-form-field
                label="SKU"
                htmlFor="prod-sku"
                hint="Если не задан — генерируется автоматически"
                [error]="errorFor('sku')"
              >
                <app-pi-input id="prod-sku" formControlName="sku" placeholder="Артикул" />
              </app-pi-form-field>

              <app-pi-form-field
                label="Вид"
                htmlFor="prod-kind"
                [required]="true"
                [error]="errorFor('kind')"
              >
                <select
                  id="prod-kind"
                  formControlName="kind"
                  class="pi-input w-full"
                  [class.border-destructive]="hasError('kind')"
                >
                  @for (opt of KIND_OPTIONS; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
              </app-pi-form-field>

              <app-pi-form-field
                label="Единица"
                htmlFor="prod-unit"
                [required]="true"
                [error]="errorFor('unit')"
              >
                <app-pi-input
                  id="prod-unit"
                  formControlName="unit"
                  placeholder="шт, м, кг"
                  [invalid]="hasError('unit')"
                />
              </app-pi-form-field>

              <app-pi-form-field label="Подкатегория" htmlFor="prod-subcategory">
                <app-pi-input
                  id="prod-subcategory"
                  formControlName="subcategory"
                  placeholder="Подкатегория"
                />
              </app-pi-form-field>

              <app-pi-form-field label="Статус" htmlFor="prod-status">
                <select id="prod-status" formControlName="status" class="pi-input w-full">
                  @for (opt of STATUS_OPTIONS; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
              </app-pi-form-field>
            </div>
          </div>

          <!-- ─── RIGHT: Категория и цены ─── -->
          <div class="space-y-form-field">
            <p class="eyebrow">Категория и цены</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field">
              <app-pi-form-field
                label="Категория"
                htmlFor="prod-category"
                hint="Категории типа «Продукция». Пусто = без категории."
                [error]="errorFor('categoryId')"
              >
                <select id="prod-category" formControlName="categoryId" class="pi-input w-full">
                  <option [ngValue]="null">— без категории —</option>
                  @if (categoriesLoading()) {
                    <option [ngValue]="null" disabled>Загрузка категорий…</option>
                  } @else if (categoriesError()) {
                    <option [ngValue]="null" disabled>Ошибка загрузки категорий</option>
                  } @else {
                    @for (category of categories(); track category._id) {
                      <option [ngValue]="category._id">
                        {{ category.name
                        }}{{ category.skuPrefix ? ' · ' + category.skuPrefix : '' }}
                      </option>
                    }
                  }
                </select>
              </app-pi-form-field>

              <app-pi-form-field
                label="Цена (прайс), ₽"
                htmlFor="prod-price"
                [error]="errorFor('listPrice')"
              >
                <app-pi-input
                  id="prod-price"
                  type="number"
                  formControlName="listPrice"
                  placeholder="0.00"
                  [invalid]="hasError('listPrice')"
                />
              </app-pi-form-field>

              <app-pi-form-field label="Активен" htmlFor="prod-isActive">
                <label
                  class="inline-flex items-center gap-2 min-h-touch px-control-x py-control-y hairline rounded-sm cursor-pointer"
                >
                  <input
                    id="prod-isActive"
                    type="checkbox"
                    formControlName="isActive"
                    class="w-4 h-4"
                  />
                  <span class="text-sm">Доступен для заказов</span>
                </label>
              </app-pi-form-field>
            </div>
          </div>
        </div>

        <!-- ─── Габариты ─── -->
        <div>
          <p class="eyebrow mb-form-row">Габариты</p>
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-form-field items-end">
            <app-pi-form-field label="Длина" htmlFor="prod-len">
              <app-pi-input
                id="prod-len"
                type="number"
                formControlName="dimLength"
                placeholder="0"
              />
            </app-pi-form-field>
            <app-pi-form-field label="Ширина" htmlFor="prod-width">
              <app-pi-input
                id="prod-width"
                type="number"
                formControlName="dimWidth"
                placeholder="0"
              />
            </app-pi-form-field>
            <app-pi-form-field label="Высота" htmlFor="prod-height">
              <app-pi-input
                id="prod-height"
                type="number"
                formControlName="dimHeight"
                placeholder="0"
              />
            </app-pi-form-field>
            <app-pi-form-field label="Единица" htmlFor="prod-dimUnit">
              <select id="prod-dimUnit" formControlName="dimUnit" class="pi-input w-full">
                @for (u of DIMENSION_UNIT_OPTIONS; track u) {
                  <option [value]="u">{{ u }}</option>
                }
              </select>
            </app-pi-form-field>
          </div>
        </div>

        <!-- ─── Дополнительно ─── -->
        <div>
          <p class="eyebrow mb-form-row">Дополнительно</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field items-start">
            <app-pi-form-field label="Вес, кг" htmlFor="prod-weight">
              <app-pi-input
                id="prod-weight"
                type="number"
                formControlName="weightKg"
                placeholder="0"
              />
            </app-pi-form-field>

            <app-pi-form-field
              label="Цвет (RAL)"
              htmlFor="prod-ral"
              hint="Выбор из справочника «Цвета»."
            >
              <div class="flex items-center gap-2">
                <span
                  class="inline-block w-8 h-6 rounded-sm hairline shrink-0"
                  [style.background-color]="selectedColorHex() ?? '#ffffff'"
                  [attr.aria-label]="selectedColorHex() ?? 'Цвет не выбран'"
                  data-test="ral-swatch"
                ></span>
                <select id="prod-ral" formControlName="ralCode" class="pi-input w-full">
                  @if (colorsLoading()) {
                    <option value="" disabled>Загрузка цветов…</option>
                  } @else if (colorsError()) {
                    <option value="" disabled>Ошибка загрузки цветов</option>
                  } @else {
                    @for (c of colors(); track c._id) {
                      <option [value]="c.slug">{{ c.name }} ({{ c.hex }})</option>
                    }
                    @if (colorFallback(); as legacy) {
                      <option [value]="legacy" disabled>{{ legacy }} (не в справочнике)</option>
                    }
                  }
                </select>
              </div>
              @if (!colorsLoading() && !colorsError() && colors().length === 0) {
                <span class="block text-xs text-muted-foreground mt-1" data-test="colors-empty">
                  Цвета не настроены.
                  <button
                    type="button"
                    class="underline text-sunrise-warm cursor-pointer"
                    (click)="openColorReferences()"
                    data-test="open-color-references"
                  >
                    Открыть справочник цветов
                  </button>
                </span>
              }
            </app-pi-form-field>
          </div>
        </div>

        <!-- ─── Изображения ─── -->
        <div>
          <div class="flex items-baseline justify-between mb-form-row">
            <p class="eyebrow">Изображения</p>
            <label
              class="inline-flex items-center gap-1 min-h-touch px-control-x py-control-y text-xs hairline rounded-sm bg-paper hover:bg-paper-2 cursor-pointer transition-colors"
            >
              <span>+ Загрузить</span>
              <input
                type="file"
                accept="image/*"
                multiple
                class="sr-only"
                data-test="photo-input"
                (change)="onPhotoSelect($event)"
              />
            </label>
          </div>

          @if (uploading()) {
            <p class="text-xs text-muted-foreground">Загрузка…</p>
          }
          @if (photos().length === 0 && !uploading()) {
            <p class="text-xs text-muted-foreground">
              Нет фото. Можно загрузить несколько изображений продукта.
            </p>
          }
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            @for (p of photos(); track p._id; let i = $index) {
              <div
                class="relative hairline rounded-sm overflow-hidden bg-paper-2"
                [attr.data-test]="'photo-thumb-' + i"
              >
                <img
                  [src]="p.storageUrl"
                  [alt]="p.originalFilename || 'Фото продукта'"
                  class="block w-full h-24 object-cover"
                />
                <div class="flex items-center justify-end p-1 hairline-t">
                  <app-pi-button
                    type="button"
                    variant="destructive"
                    size="icon"
                    [attr.aria-label]="'Удалить фото ' + (i + 1)"
                    (click)="removePhoto(p._id)"
                  >
                    ×
                  </app-pi-button>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- ─── Описание и заметки ─── -->
        <div>
          <p class="eyebrow mb-form-row">Описание и заметки</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field items-start">
            <app-pi-form-field
              label="Описание"
              htmlFor="prod-description"
              [error]="errorFor('description')"
            >
              <app-pi-textarea
                id="prod-description"
                formControlName="description"
                [rows]="2"
                [maxLength]="4000"
                [invalid]="hasError('description')"
                ariaLabel="Описание"
              />
            </app-pi-form-field>

            <app-pi-form-field label="Заметки" htmlFor="prod-notes" [error]="errorFor('notes')">
              <app-pi-textarea
                id="prod-notes"
                formControlName="notes"
                [rows]="2"
                [maxLength]="4000"
                [invalid]="hasError('notes')"
                ariaLabel="Заметки"
              />
            </app-pi-form-field>
          </div>
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
          [disabled]="form.invalid || submitting() || uploading()"
          (click)="onSubmit()"
        >
          {{ uploading() ? 'Загрузка фото…' : submitting() ? 'Сохранение…' : 'Сохранить' }}
        </app-pi-button>
        <app-pi-button type="button" variant="ghost" (click)="onCancel()"> Отмена </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class ProductFormDialogComponent implements OnDestroy {
  protected readonly KIND_OPTIONS = KIND_OPTIONS;
  protected readonly STATUS_OPTIONS = STATUS_OPTIONS;
  protected readonly DIMENSION_UNIT_OPTIONS = DIMENSION_UNIT_OPTIONS;

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly colorsService = inject(ColorReferencesService);
  private readonly photosService = inject(PhotosService);
  private readonly toast = inject(PiToastService);
  private readonly router = inject(Router);
  private readonly ref = inject<DialogRef<Result>>(PI_DIALOG_REF);
  private readonly data = inject<Product | null>(PI_DIALOG_DATA);

  protected readonly isEdit = signal<boolean>(this.data != null);
  protected readonly submitting = signal<boolean>(false);
  protected readonly uploading = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);

  /** Active product categories (type 'product'); categoryId optional. */
  protected readonly categories = signal<Category[]>([]);
  protected readonly categoriesLoading = signal<boolean>(false);
  protected readonly categoriesError = signal<string | null>(null);

  /** Active colors from the ColorReference dictionary (incl. system «Не выбран»). */
  protected readonly colors = signal<ColorReference[]>([]);
  protected readonly colorsLoading = signal<boolean>(false);
  protected readonly colorsError = signal<string | null>(null);

  protected readonly photos = signal<Photo[]>([]);
  /** Photo IDs marked for deletion; applied on submit (atomic with save). */
  protected readonly pendingPhotoDeletions = signal<string[]>([]);
  /** Photo IDs uploaded in THIS session (not yet saved). Cleaned up on cancel/destroy. */
  private readonly newlyUploadedIds = signal<string[]>([]);
  /** Flag: was the form submitted? If false at destroy, clean up newlyUploadedIds. */
  private submitted = false;

  protected readonly form = this.fb.group({
    name: this.fb.control('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(256),
    ]),
    sku: this.fb.control<string | null>(null, [Validators.maxLength(64)]),
    kind: this.fb.control<ProductKind>('good', Validators.required),
    unit: this.fb.control('', [Validators.required, Validators.maxLength(16)]),
    subcategory: this.fb.control<string | null>(null, [Validators.maxLength(64)]),
    status: this.fb.control<ProductStatus>('new'),
    categoryId: this.fb.control<string | null>(null),
    listPrice: this.fb.control<number | null>(null, [Validators.min(0)]),
    isActive: this.fb.control<boolean>(true),
    dimLength: this.fb.control<number | null>(null, [Validators.min(0)]),
    dimWidth: this.fb.control<number | null>(null, [Validators.min(0)]),
    dimHeight: this.fb.control<number | null>(null, [Validators.min(0)]),
    dimUnit: this.fb.control<string>('mm'),
    weightKg: this.fb.control<number | null>(null, [Validators.min(0)]),
    // TZ-PRODUCTS-302: ralCode is now a ColorReference slug from the
    // dictionary (server-controlled transliteration), NOT free text — no
    // maxLength validator (a >16-char slug would fail on backend's
    // pre-existing @Length(0,16) with a visible 400 error, not a silently
    // disabled Save).
    ralCode: this.fb.control<string | null>(null),
    description: this.fb.control<string | null>(null, [Validators.maxLength(4000)]),
    notes: this.fb.control<string | null>(null, [Validators.maxLength(4000)]),
  });

  constructor() {
    this.loadCategories();
    this.loadColors();
    if (this.data) {
      this.patchFromData(this.data);
    }
  }

  ngOnDestroy(): void {
    this.cleanupOrphanUploads();
  }

  // ─── Data loading ───

  private loadCategories(): void {
    this.categoriesLoading.set(true);
    this.categoriesError.set(null);
    this.categoriesService.list('product').subscribe((res) => {
      this.categoriesLoading.set(false);
      if (res.ok) {
        this.categories.set((res.data ?? []).filter((c) => c.isActive !== false));
      } else {
        this.categories.set([]);
        this.categoriesError.set(extractErrorMessage(res.error));
      }
    });
  }

  /**
   * TZ-PRODUCTS-302: colors come from the ColorReference dictionary
   * (active only). On a successful load with no explicit ralCode, the
   * system default color («Не выбран», slug SYSTEM_DEFAULT_COLOR_SLUG) is
   * auto-selected — mirror of the categories default-selection pattern.
   */
  private loadColors(): void {
    this.colorsLoading.set(true);
    this.colorsError.set(null);
    this.colorsService.list({ activeOnly: true }).subscribe((res) => {
      this.colorsLoading.set(false);
      if (res.ok) {
        const list = res.data ?? [];
        this.colors.set(list);
        const current = this.form.get('ralCode')?.value as string | null | undefined;
        if (!current) {
          const def =
            list.find((c) => c.isDefault === true) ??
            list.find((c) => c.slug === SYSTEM_DEFAULT_COLOR_SLUG);
          if (def) {
            this.form.get('ralCode')?.setValue(def.slug);
          }
        }
      } else {
        this.colors.set([]);
        this.colorsError.set(extractErrorMessage(res.error));
      }
    });
  }

  private patchFromData(p: Product): void {
    this.form.patchValue({
      name: p.name,
      sku: p.sku ?? null,
      kind: p.kind,
      unit: p.unit,
      subcategory: p.subcategory ?? null,
      status: p.status ?? 'new',
      categoryId: normalizeId(p.categoryId),
      listPrice: p.listPrice ?? null,
      isActive: p.isActive ?? true,
      dimLength: p.dimensions?.length ?? null,
      dimWidth: p.dimensions?.width ?? null,
      dimHeight: p.dimensions?.height ?? null,
      dimUnit: p.dimensions?.unit ?? 'mm',
      weightKg: p.weightKg ?? null,
      ralCode: p.ralCode ?? null,
      description: p.description ?? null,
      notes: p.notes ?? null,
    });
    // Photos: backend may populate photoIds as `Photo` objects (detail
    // route) or return plain string ids (list route). Normalize, then load.
    const ids = (p.photoIds ?? [])
      .map((id) => normalizeId(id))
      .filter((id): id is string => typeof id === 'string' && id.length > 0);
    if (ids.length > 0) {
      this.photosService.list().subscribe((res) => {
        if (res.ok) {
          this.photos.set(res.data.filter((ph) => ids.includes(ph._id)));
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    }
  }

  /**
   * TZ-PRODUCTS-302: when editing a product whose ralCode is absent from
   * the active colors list (legacy free text like «RAL 9003»), render the
   * current value as a disabled fallback option so the select is never
   * silently blank and the payload keeps the original value.
   */
  protected colorFallback(): string | null {
    const v = this.form.get('ralCode')?.value as string | null | undefined;
    if (!v) return null;
    return this.colors().some((c) => c.slug === v) ? null : v;
  }

  /** Hex of the currently selected color (for the swatch preview), or null. */
  protected selectedColorHex(): string | null {
    const v = this.form.get('ralCode')?.value as string | null | undefined;
    if (!v) return null;
    return this.colors().find((c) => c.slug === v)?.hex ?? null;
  }

  protected openColorReferences(): void {
    this.ref.close(null);
    this.router.navigate(['/color-references']);
  }

  // ─── Photos ───

  onPhotoSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (files.length === 0) return;
    this.uploading.set(true);
    forkJoin(files.map((f) => this.photosService.upload(f))).subscribe((results) => {
      const uploaded: Photo[] = [];
      const failed: string[] = [];
      results.forEach((res, i) => {
        if (res.ok) {
          uploaded.push(res.data);
        } else {
          failed.push(files[i].name);
        }
      });
      if (uploaded.length > 0) {
        this.photos.update((cur) => [...cur, ...uploaded]);
        this.newlyUploadedIds.update((cur) => [...cur, ...uploaded.map((p) => p._id)]);
      }
      this.uploading.set(false);
      input.value = '';
      if (failed.length > 0) {
        this.toast.error(
          `Не удалось загрузить: ${failed.join(', ')} (загружено ${uploaded.length})`,
        );
      } else {
        this.toast.success(`Загружено фото: ${uploaded.length}`);
      }
    });
  }

  removePhoto(id: string): void {
    this.photos.update((cur) => cur.filter((p) => p._id !== id));
    this.pendingPhotoDeletions.update((cur) => [...cur, id]);
  }

  private applyPendingPhotoDeletions(): void {
    const pending = this.pendingPhotoDeletions();
    if (pending.length === 0) return;
    pending.forEach((id) => {
      this.photosService.remove(id).subscribe((res) => {
        if (!res.ok) {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
    this.pendingPhotoDeletions.set([]);
  }

  private cleanupOrphanUploads(): void {
    if (this.submitted) return;
    const orphans = this.newlyUploadedIds();
    if (orphans.length === 0) return;
    orphans.forEach((id) => {
      this.photosService.remove(id).subscribe({
        error: () => {
          /* best-effort */
        },
      });
    });
    this.newlyUploadedIds.set([]);
  }

  // ─── Form helpers ───

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
    if (c.errors?.['min']) return `Минимум ${c.errors['min'].min}`;
    return 'Некорректное значение';
  }

  // ─── Submit ───

  protected onSubmit(): void {
    if (this.submitting() || this.uploading()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const dimensions =
      v.dimLength != null || v.dimWidth != null || v.dimHeight != null
        ? {
            ...(v.dimLength != null ? { length: v.dimLength } : {}),
            ...(v.dimWidth != null ? { width: v.dimWidth } : {}),
            ...(v.dimHeight != null ? { height: v.dimHeight } : {}),
            unit: v.dimUnit,
          }
        : undefined;

    const payload: Partial<Product> = {
      name: v.name,
      kind: v.kind,
      unit: v.unit,
      status: v.status,
      isActive: v.isActive,
    };
    if (v.sku) payload.sku = v.sku;
    if (v.categoryId) payload.categoryId = v.categoryId;
    if (v.subcategory) payload.subcategory = v.subcategory;
    if (v.listPrice != null) payload.listPrice = v.listPrice;
    if (dimensions) payload.dimensions = dimensions;
    if (v.weightKg != null) payload.weightKg = v.weightKg;
    // RAL: backend keeps the string `ralCode` contract (no colorId yet —
    // SUCCESSOR for TZ-PRODUCTS-303). Fall back to the system default
    // «Не выбран» slug when nothing was chosen.
    payload.ralCode = v.ralCode || SYSTEM_DEFAULT_COLOR_SLUG;
    const photoIds = this.photos().map((p) => p._id);
    if (photoIds.length > 0) payload.photoIds = photoIds;
    if (v.description) payload.description = v.description;
    if (v.notes) payload.notes = v.notes;

    this.submitting.set(true);
    this.errorMessage.set(null);
    const obs = this.data
      ? this.service.update(this.data._id, payload)
      : this.service.create(payload);
    obs.subscribe((res) => {
      if (res.ok) {
        this.submitted = true;
        this.applyPendingPhotoDeletions();
        this.toast.success(this.isEdit() ? 'Продукт обновлён' : 'Продукт создан');
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

/** Normalize a populated Mongo reference or scalar id for select controls. */
function normalizeId(value: unknown): string | null {
  if (typeof value === 'string' && value.length > 0) return value;
  if (value && typeof value === 'object' && '_id' in value) {
    const id = (value as { _id?: unknown })._id;
    return typeof id === 'string' && id.length > 0 ? id : null;
  }
  return null;
}
