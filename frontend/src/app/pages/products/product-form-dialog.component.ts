import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  inject,
  signal,
  viewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { RouterLink } from '@angular/router';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { TextareaComponent } from '../../shared/ui/textarea/textarea.component';
import { PiFormSectionComponent } from '../../shared/ui/form-section';
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
import { CategoriesService, Category } from '../../shared/services/categories.service';
import {
  PiColorReferencesService,
  ColorReference,
} from '../../shared/services/pi-color-references.service';
import { PhotosService, type Photo } from '../../shared/services/photos.service';
import { AuthService } from '../../core/auth.service';
import { PiOverflowSelectComponent } from '../../shared/ui/overflow-select/pi-overflow-select.component';
import { ProductBomPanelComponent } from './product-bom-panel.component';

type Result = Product | null | undefined;

const KIND_OPTIONS: { value: ProductKind; label: string }[] = [
  { value: 'good', label: 'Изделие' },
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
 * Reworked from the compact form-variant dialog to the wide content DSL
 * (TZ-MATERIALS-301 pattern): `variant="content"` + `[maxWidth]="'1000px'"`
 * with an ALWAYS-VISIBLE sticky footer (Save/Cancel). The shared
 * PiDialogComponent content template already provides
 * `overflow-y-auto` on the body and `sticky bottom-0 bg-paper` on the
 * footer, so long forms never push «Сохранить» off-screen.
 *
 * Sections (in order):
 *  1. Основные: name, sku, kind, status, isActive
 *  2. Цена и учёт: listPrice, categoryId, subcategory
 *  3. Габариты и цвет: L/W/H, единицы, weightKg, RAL
 *  4. Описание/Заметки: description, notes
 *  5. Изображения: photo upload (PhotosService, TZ-MATERIALS-306 паттерн)
 *
 * In edit mode the existing ProductBomPanel is embedded below the passport;
 * create mode shows a save-then-edit hint. Composition writes remain in the panel.
 *
 * RAL contract (TZ-PRODUCTS-301/302):
 *  - Список грузится из `PiColorReferencesService.list({ activeOnly: true })`
 *    (кэш активного каталога — TZ-DOC-309 паттерн).
 *  - Опция «Не выбран» очищает `ralCode` (null).
 *  - Значение опции = `ColorReference.slug` (стабильный ключ; seed-цвет
 *    «Не выбран» = `ne_vybran`). Backend `Product.ralCode` остаётся строкой.
 *  - Если справочник пуст — hint «Добавьте цвета в справочнике» + ссылка
 *    на `/dictionaries/color-references` (только admin/manager).
 *  - Редактирование товара с legacy-значением ralCode (не в активном
 *    списке) показывает disabled-fallback опцию — селект никогда не
 *    пустой молча (unitFallback паттерн из TZ-MATERIALS-302).
 *
 * Regression: все существующие data-test/id атрибуты и create/update
 * payload-логика сохранены; добавлены `categoryId` и `photoIds`.
 *
 * Standalone + OnPush + signal-based.
 */
@Component({
  selector: 'app-product-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    PiDialogComponent,
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
    TextareaComponent,
    PiFormSectionComponent,
    PiOverflowSelectComponent,
    ProductBomPanelComponent,
  ],
  template: `
    <app-pi-dialog
      [title]="isEdit() ? 'Редактировать изделие' : 'Новое изделие'"
      [variant]="'content'"
      [maxWidth]="'min(1120px, calc(100vw - 2rem))'"
    >
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="space-y-form-field"
        data-test="product-form"
      >
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <!-- ─── Основные ─── -->
          <app-pi-form-section title="Основные" headingId="product-sec-basics" tone="gold">
            <div class="grid grid-cols-1 gap-form-field">
              <app-pi-form-field label="Название" htmlFor="prod-name" [error]="errorFor('name')">
                <app-pi-input
                  id="prod-name"
                  formControlName="name"
                  placeholder="Название изделия"
                  [invalid]="hasError('name')"
                />
              </app-pi-form-field>

              <app-pi-form-field
                label="Артикул"
                htmlFor="prod-sku"
                [required]="true"
                [error]="errorFor('sku')"
              >
                <app-pi-input
                  id="prod-sku"
                  formControlName="sku"
                  placeholder="Артикул изделия"
                  [invalid]="hasError('sku')"
                />
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
                  class="w-full h-10 px-control-x text-sm hairline rounded-sm bg-paper text-ink font-body pi-focus-ring transition-colors"
                >
                  @for (opt of KIND_OPTIONS; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
              </app-pi-form-field>

              <app-pi-form-field label="Статус" htmlFor="prod-status">
                <select
                  id="prod-status"
                  formControlName="status"
                  class="w-full h-10 px-control-x text-sm hairline rounded-sm bg-paper text-ink font-body pi-focus-ring transition-colors"
                >
                  @for (opt of STATUS_OPTIONS; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
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
          </app-pi-form-section>

          <!-- ─── Цена и учёт ─── -->
          <app-pi-form-section
            title="Цена и учёт"
            headingId="product-sec-accounting"
            tone="neutral"
          >
            <div class="grid grid-cols-1 gap-form-field">
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

              <app-pi-form-field
                label="Категория"
                htmlFor="prod-category"
                hint="Из справочника категорий (тип «изделие»). Пусто = «Без категории»."
              >
                <app-pi-overflow-select
                  [items]="categoryItems()"
                  [value]="form.controls.categoryId.value ?? ''"
                  (valueChange)="onCategoryChange($event)"
                  searchable="auto"
                  placeholder="— без категории —"
                  ariaLabel="Категория"
                  dataTest="prod-category"
                />
              </app-pi-form-field>

              <app-pi-form-field label="Подкатегория" htmlFor="prod-subcategory">
                <app-pi-input
                  id="prod-subcategory"
                  formControlName="subcategory"
                  placeholder="Подкатегория"
                />
              </app-pi-form-field>
            </div>
          </app-pi-form-section>

          <!-- ─── Габариты и цвет ─── -->
          <app-pi-form-section
            title="Габариты и цвет"
            headingId="product-sec-dimensions"
            tone="dimensions"
          >
            <div class="grid grid-cols-2 gap-form-field items-end">
              <app-pi-form-field label="Длина" htmlFor="prod-len">
                <div class="max-w-[8rem]">
                  <app-pi-input
                    id="prod-len"
                    type="number"
                    formControlName="dimLength"
                    placeholder="0"
                  />
                </div>
              </app-pi-form-field>
              <app-pi-form-field label="Ширина" htmlFor="prod-width">
                <div class="max-w-[8rem]">
                  <app-pi-input
                    id="prod-width"
                    type="number"
                    formControlName="dimWidth"
                    placeholder="0"
                  />
                </div>
              </app-pi-form-field>
              <app-pi-form-field label="Высота" htmlFor="prod-height">
                <div class="max-w-[8rem]">
                  <app-pi-input
                    id="prod-height"
                    type="number"
                    formControlName="dimHeight"
                    placeholder="0"
                  />
                </div>
              </app-pi-form-field>
              <app-pi-form-field label="Ед. габаритов" htmlFor="prod-dimUnit">
                <select
                  id="prod-dimUnit"
                  formControlName="dimUnit"
                  class="pi-input w-full max-w-[8rem]"
                >
                  @for (u of DIMENSION_UNIT_OPTIONS; track u) {
                    <option [value]="u">{{ u }}</option>
                  }
                </select>
              </app-pi-form-field>
              <app-pi-form-field label="Вес, кг" htmlFor="prod-weight">
                <div class="max-w-[8rem]">
                  <app-pi-input
                    id="prod-weight"
                    type="number"
                    formControlName="weightKg"
                    placeholder="0"
                  />
                </div>
              </app-pi-form-field>
              <app-pi-form-field
                label="Единица"
                htmlFor="prod-unit"
                [required]="true"
                [error]="errorFor('unit')"
              >
                <div class="max-w-[8rem]">
                  <app-pi-input
                    id="prod-unit"
                    formControlName="unit"
                    placeholder="шт, м, кг"
                    [invalid]="hasError('unit')"
                  />
                </div>
              </app-pi-form-field>
            </div>

            <div class="mt-4">
              <app-pi-form-field
                label="Цвет"
                htmlFor="prod-ral"
                hint="Выбор из справочника цветов. Системный «Не выбран» очищает поле."
              >
                <div class="relative max-w-[14rem]" #colorDropdownHost>
                  <button
                    type="button"
                    id="prod-ral"
                    class="w-full h-10 px-control-x text-sm hairline rounded-sm bg-paper text-ink font-body pi-focus-ring transition-colors flex items-center gap-2"
                    [attr.aria-expanded]="colorOpen()"
                    (click)="toggleColor()"
                    data-test="color-dropdown-trigger"
                  >
                    @if (selectedColor(); as c) {
                      <span
                        class="block w-4 h-4 rounded-full hairline shrink-0"
                        [style.background]="c.hex || '#9CA3AF'"
                        [attr.aria-hidden]="true"
                      ></span>
                      <span class="truncate">{{ c.name }}</span>
                    } @else if (colorFallback(); as fb) {
                      <span class="truncate text-muted-foreground">{{ fb }}</span>
                    } @else {
                      <span class="text-muted-foreground">Не выбран</span>
                    }
                    <span class="ml-auto opacity-60" aria-hidden="true">▾</span>
                  </button>

                  @if (colorOpen()) {
                    <div
                      class="absolute left-0 right-0 z-30 mt-1 bg-paper hairline rounded-sm shadow-sm max-h-64 overflow-y-auto"
                      role="listbox"
                      [attr.aria-label]="'Выбор цвета RAL'"
                      data-test="color-dropdown-panel"
                    >
                      <div class="p-2 hairline-b">
                        <input
                          type="search"
                          class="pi-input w-full"
                          placeholder="Поиск цвета…"
                          [value]="colorSearch()"
                          (input)="onColorSearch($event)"
                          aria-label="Поиск цвета"
                          data-test="color-search-input"
                        />
                      </div>
                      <button
                        type="button"
                        class="w-full text-left px-3 py-2 text-sm hover:bg-paper-2 transition-colors"
                        (click)="selectColor(null)"
                        data-test="color-option-none"
                      >
                        Не выбран
                      </button>
                      @if (colorsLoading()) {
                        <p class="px-3 py-2 text-xs text-muted-foreground" role="status">
                          Загрузка цветов…
                        </p>
                      } @else if (colorsError()) {
                        <p class="px-3 py-2 text-xs text-destructive" role="alert">
                          {{ colorsError() }}
                        </p>
                      } @else if (colors().length === 0) {
                        <p class="px-3 py-2 text-xs text-muted-foreground">
                          Добавьте цвета в справочнике.
                        </p>
                        @if (canManageColors()) {
                          <a
                            [routerLink]="['/dictionaries/color-references']"
                            class="block px-3 py-2 text-xs text-sunrise-warm hover:underline"
                            data-test="colors-dictionary-link"
                          >
                            Открыть справочник цветов →
                          </a>
                        }
                      } @else if (filteredColors().length === 0) {
                        <p class="px-3 py-2 text-xs text-muted-foreground">Ничего не найдено.</p>
                      } @else {
                        @for (c of filteredColors(); track c._id) {
                          <button
                            type="button"
                            class="w-full text-left px-3 py-2 text-sm hover:bg-paper-2 transition-colors flex items-center gap-2"
                            [class.bg-paper-2]="form.controls.ralCode.value === c.slug"
                            (click)="selectColor(c)"
                            [attr.data-test]="'color-option-' + c.slug"
                          >
                            <span
                              class="block w-4 h-4 rounded-full hairline shrink-0"
                              [style.background]="c.hex || '#9CA3AF'"
                              [attr.aria-hidden]="true"
                            ></span>
                            <span class="truncate">{{ c.name }}</span>
                          </button>
                        }
                      }
                    </div>
                  }
                </div>
              </app-pi-form-field>
            </div>
          </app-pi-form-section>
        </div>

        <!-- Composition is edit-only: the shared ProductBomPanel owns its write-path. -->

        <!-- ─── 7. Описание/Заметки ─── -->
        <app-pi-form-section
          title="Описание и заметки"
          headingId="product-sec-description"
          tone="neutral"
        >
          <div class="grid grid-cols-1 gap-form-field">
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
                ariaLabel="Описание"
              />
            </app-pi-form-field>

            <app-pi-form-field label="Заметки" htmlFor="prod-notes" [error]="errorFor('notes')">
              <app-pi-textarea
                id="prod-notes"
                formControlName="notes"
                [rows]="2"
                [maxLength]="4000"
                ariaLabel="Заметки"
              />
            </app-pi-form-field>
          </div>
        </app-pi-form-section>

        <!-- ─── 8. Изображения ─── -->
        <app-pi-form-section title="Изображения" headingId="product-sec-images" tone="neutral">
          <div class="flex items-baseline justify-between mb-form-row">
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
              Нет фото. Можно загрузить несколько изображений изделия.
            </p>
          }
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            @for (p of photos(); track p._id; let i = $index) {
              <div
                class="relative hairline rounded-sm overflow-hidden bg-paper-2"
                [attr.data-test]="'photo-thumb-' + i"
              >
                <img
                  [src]="p.storageUrl"
                  [alt]="p.originalFilename || 'Фото изделия'"
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
        </app-pi-form-section>

        @if (editProductId(); as productId) {
          <section
            class="max-h-[34rem] overflow-y-auto hairline rounded-sm bg-paper-2/30"
            data-test="product-composition-editor"
          >
            <app-product-bom-panel
              [productId]="productId"
              (changed)="onCompositionChanged()"
              data-test="product-bom-panel"
            />
          </section>
        } @else {
          <section
            class="hairline rounded-sm bg-paper-2/30 px-3 py-3"
            data-test="composition-create-hint"
          >
            <p class="text-sm text-muted-foreground m-0">
              Сначала сохраните изделие — затем откройте редактирование, чтобы собрать состав.
            </p>
          </section>
        }

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
  constructor() {
    this.loadCategories();
    this.loadColors();
    this.loadPhotos();
    if (this.data) {
      this.form.patchValue({
        name: this.data.name,
        sku: this.data.sku ?? null,
        kind: this.data.kind,
        unit: this.data.unit,
        subcategory: this.data.subcategory ?? null,
        status: this.data.status ?? 'new',
        listPrice: this.data.listPrice ?? null,
        isActive: this.data.isActive ?? true,
        // Detail GET populates categoryId as { _id, name } — store only the id.
        categoryId: this.refId(this.data.categoryId),
        dimLength: this.data.dimensions?.length ?? null,
        dimWidth: this.data.dimensions?.width ?? null,
        dimHeight: this.data.dimensions?.height ?? null,
        dimUnit: this.data.dimensions?.unit ?? 'mm',
        weightKg: this.data.weightKg ?? null,
        ralCode: this.data.ralCode ?? null,
        description: this.data.description ?? null,
        notes: this.data.notes ?? null,
      });
    }
  }

  protected readonly KIND_OPTIONS = KIND_OPTIONS;
  protected readonly STATUS_OPTIONS = STATUS_OPTIONS;
  protected readonly DIMENSION_UNIT_OPTIONS = DIMENSION_UNIT_OPTIONS;

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(ProductsService);
  private readonly toast = inject(PiToastService);
  private readonly ref = inject<DialogRef<Result>>(PI_DIALOG_REF);
  private readonly data = inject<Product | null>(PI_DIALOG_DATA);
  private readonly categoriesService = inject(CategoriesService);
  private readonly colorsService = inject(PiColorReferencesService);
  private readonly photosService = inject(PhotosService);
  private readonly auth = inject(AuthService);

  private readonly dropdownHost = viewChild<ElementRef<HTMLElement>>('colorDropdownHost');

  protected readonly isEdit = signal<boolean>(this.data != null);
  protected readonly editProductId = computed(() => this.data?._id ?? null);
  protected readonly submitting = signal<boolean>(false);
  protected readonly uploading = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);

  // ─── Categories ───
  protected readonly categories = signal<Category[]>([]);
  protected readonly categoriesLoading = signal(false);
  protected readonly categoriesError = signal<string | null>(null);
  protected readonly categoryItems = computed(() => [
    { id: '', label: '— без категории —' },
    ...this.categories().map((c) => ({ id: c._id, label: c.name })),
  ]);

  // ─── Colors (RAL) ───
  protected readonly colors = signal<ColorReference[]>([]);
  protected readonly colorsLoading = signal(false);
  protected readonly colorsError = signal<string | null>(null);
  protected readonly colorSearch = signal('');
  protected readonly colorOpen = signal(false);

  /** Active colors filtered by the in-dropdown search (name or slug). */
  protected readonly filteredColors = computed<ColorReference[]>(() => {
    const q = this.colorSearch().trim().toLowerCase();
    const list = this.colors();
    if (!q) return list;
    return list.filter((c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
  });

  /**
   * Resolve the current ralCode value to a ColorReference (for the swatch +
   * label). Deliberately a METHOD, not a computed(): the form control value
   * is not a signal, so a computed() would never re-evaluate when
   * selectColor() patches ralCode and would return a stale cache.
   */
  protected selectedColor(): ColorReference | null {
    const v = this.form.controls.ralCode.value;
    if (!v) return null;
    return this.colors().find((c) => c.slug === v) ?? null;
  }

  /**
   * Legacy/unknown ralCode not present in the ACTIVE colors list (e.g. a
   * deactivated color or pre-dictionary free text) — rendered as a disabled
   * fallback so the trigger is never silently blank (unitFallback pattern).
   */
  protected colorFallback(): string | null {
    const v = this.form.controls.ralCode.value;
    if (!v) return null;
    return this.colors().some((c) => c.slug === v) ? null : v;
  }

  /** «Открыть справочник цветов» — только для admin/manager (route guard mirror). */
  protected readonly canManageColors = computed<boolean>(() => {
    const u = this.auth.user();
    return u?.role === 'admin' || u?.role === 'manager';
  });

  // ─── Photos ───
  protected readonly photos = signal<Photo[]>([]);
  /** Photo IDs marked for deletion; applied on submit (atomic with save, TZ-MATERIALS-306). */
  private readonly pendingPhotoDeletions = signal<string[]>([]);
  /** Photo IDs uploaded in THIS session (not yet saved). Cleaned up on cancel/destroy. */
  private readonly newlyUploadedIds = signal<string[]>([]);
  /** Flag: was the form submitted? If false at destroy, clean up newlyUploadedIds. */
  private submitted = false;

  protected readonly form = this.fb.group({
    name: this.fb.control('', [Validators.maxLength(256)]),
    sku: this.fb.control<string | null>(null, [Validators.required, Validators.maxLength(64)]),
    kind: this.fb.control<ProductKind>('good', Validators.required),
    unit: this.fb.control('', [Validators.required, Validators.maxLength(16)]),
    subcategory: this.fb.control<string | null>(null, [Validators.maxLength(64)]),
    status: this.fb.control<ProductStatus>('new'),
    listPrice: this.fb.control<number | null>(null, [Validators.min(0)]),
    isActive: this.fb.control<boolean>(true),
    categoryId: this.fb.control<string | null>(null),
    dimLength: this.fb.control<number | null>(null, [Validators.min(0)]),
    dimWidth: this.fb.control<number | null>(null, [Validators.min(0)]),
    dimHeight: this.fb.control<number | null>(null, [Validators.min(0)]),
    dimUnit: this.fb.control<string>('mm'),
    weightKg: this.fb.control<number | null>(null, [Validators.min(0)]),
    ralCode: this.fb.control<string | null>(null, [Validators.maxLength(64)]),
    description: this.fb.control<string | null>(null, [Validators.maxLength(4000)]),
    notes: this.fb.control<string | null>(null, [Validators.maxLength(4000)]),
  });

  /** Close the RAL panel when clicking anywhere outside the dropdown host. */
  @HostListener('document:pointerdown', ['$event'])
  protected onDocumentPointerDown(e: PointerEvent): void {
    if (!this.colorOpen()) return;
    const host = this.dropdownHost()?.nativeElement;
    if (host && !host.contains(e.target as Node)) {
      this.colorOpen.set(false);
    }
  }

  ngOnDestroy(): void {
    this.cleanupOrphanUploads();
  }

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

  private loadColors(): void {
    this.colorsLoading.set(true);
    this.colorsError.set(null);
    this.colorsService.list({ activeOnly: true }).subscribe((res) => {
      this.colorsLoading.set(false);
      if (res.ok) {
        this.colors.set(res.data ?? []);
      } else {
        this.colors.set([]);
        this.colorsError.set(extractErrorMessage(res.error));
      }
    });
  }

  private loadPhotos(): void {
    const ids = this.data?.photoIds ?? [];
    if (ids.length === 0) return;
    this.photosService.list().subscribe((res) => {
      if (res.ok) {
        this.photos.set(res.data.filter((p) => ids.includes(p._id)));
      } else {
        this.toast.error(extractErrorMessage(res.error));
      }
    });
  }

  // ─── Catalog dropdown handlers ───

  protected onCategoryChange(categoryId: string): void {
    this.form.controls.categoryId.setValue(categoryId || null);
    this.form.controls.categoryId.markAsDirty();
  }

  // ─── RAL dropdown handlers ───

  protected toggleColor(): void {
    this.colorOpen.update((v) => !v);
  }

  protected onColorSearch(e: Event): void {
    this.colorSearch.set((e.target as HTMLInputElement).value);
  }

  protected selectColor(c: ColorReference | null): void {
    this.form.controls.ralCode.setValue(c ? c.slug : null);
    this.colorOpen.set(false);
    this.colorSearch.set('');
  }

  // ─── Photos ───

  onPhotoSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (files.length === 0) return;
    this.uploading.set(true);
    // photosService.upload() returns Observable<SilentResult<Photo>> — never
    // errors, so forkJoin always completes; per-file failures via res.ok.
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
      } else if (uploaded.length > 0) {
        this.toast.success(`Загружено фото: ${uploaded.length}`);
      }
    });
  }

  /**
   * Remove photo from form state. DEFER the actual DELETE on the server
   * until `onSubmit` (collected in `pendingPhotoDeletions`) so the
   * Product.photoIds[] update is atomic with the product save
   * (TZ-MATERIALS-306 pattern) — on cancel, nothing is deleted.
   */
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
          // best-effort: report but never block the save
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
    this.pendingPhotoDeletions.set([]);
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
    const listPrice = this.asNumber(v.listPrice);
    const weightKg = this.asNumber(v.weightKg);
    const dimLength = this.asNumber(v.dimLength);
    const dimWidth = this.asNumber(v.dimWidth);
    const dimHeight = this.asNumber(v.dimHeight);
    const dimensions =
      dimLength != null || dimWidth != null || dimHeight != null
        ? {
            ...(dimLength != null ? { length: dimLength } : {}),
            ...(dimWidth != null ? { width: dimWidth } : {}),
            ...(dimHeight != null ? { height: dimHeight } : {}),
            unit: v.dimUnit || 'mm',
          }
        : undefined;

    const photoIds = this.photos().map((p) => p._id);

    const payload: Omit<Partial<Product>, 'ralCode' | 'categoryId'> & {
      ralCode?: string | null;
      categoryId?: string | null;
    } = {
      name: v.name,
      kind: v.kind,
      unit: v.unit,
      status: v.status,
      isActive: v.isActive,
    };
    payload.sku = v.sku?.trim() ?? '';

    if (v.subcategory) payload.subcategory = v.subcategory;
    if (listPrice != null) payload.listPrice = listPrice;
    // ralCode/categoryId are PATCHED EXPLICITLY (including null) so that
    // choosing «Не выбран» / «— без категории —» on edit actually CLEARS
    // the previously stored value — the backend $set applies the null.
    // Empty string must become null (IsMongoId rejects "").
    payload.ralCode = v.ralCode?.trim() ? v.ralCode.trim() : null;
    payload.categoryId = this.refId(v.categoryId);
    if (dimensions) payload.dimensions = dimensions;
    if (weightKg != null) payload.weightKg = weightKg;
    if (v.description) payload.description = v.description;
    if (v.notes) payload.notes = v.notes;
    if (photoIds.length > 0) payload.photoIds = photoIds;

    this.submitting.set(true);
    this.errorMessage.set(null);
    const obs = this.data
      ? this.service.update(this.data._id, payload)
      : this.service.create(payload);
    obs.subscribe((res) => {
      if (res.ok) {
        this.submitted = true;
        // Atomic: after the product save succeeds, apply pending photo deletions.
        this.applyPendingPhotoDeletions();
        this.toast.success(this.isEdit() ? 'Изделие обновлено' : 'Изделие создано');
        this.ref.close(res.data);
      } else {
        this.errorMessage.set(extractErrorMessage(res.error));
        this.submitting.set(false);
      }
    });
  }

  protected onCompositionChanged(): void {
    // BOM writes stay in ProductBomPanel; passport submit remains independent.
    this.form.markAsDirty();
  }

  protected onCancel(): void {
    // Orphan cleanup runs in ngOnDestroy (single source of truth for all
    // close paths). ref.close(null) triggers destroy; cleanup runs there.
    this.ref.close(null);
  }

  /** Normalize populated `{ _id }` / empty string → id or null. */
  private refId(value: unknown): string | null {
    if (value == null || value === '') return null;
    if (typeof value === 'string') {
      const t = value.trim();
      return t.length > 0 ? t : null;
    }
    if (typeof value === 'object' && value !== null && '_id' in value) {
      return this.refId((value as { _id: unknown })._id);
    }
    return null;
  }

  /** Number inputs often yield strings — coerce before API validation. */
  private asNumber(value: unknown): number | null {
    if (value == null || value === '') return null;
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) ? n : null;
  }

  /**
   * If the form was cancelled (or destroyed without submit), delete any
   * photos uploaded in this session — they have no product reference and
   * would otherwise leak on the server (TZ-MATERIALS-306 orphan pattern).
   */
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
}
