import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  Injector,
  computed,
  inject,
  signal,
  viewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, of, type Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RouterLink } from '@angular/router';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { TextareaComponent } from '../../shared/ui/textarea/textarea.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiToastService } from '../../shared/ui/toast';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { extractErrorMessage, type SilentResult } from '../../core/silent-http';
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
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';
import {
  CompositionLine,
  CompositionLineUpsertDto,
  ProductModule,
  ProductModulesService,
} from '../../shared/services/pi-product-modules.service';
import {
  ProductCompositionPickerDialogComponent,
  ProductCompositionPickerResult,
} from './product-composition-picker-dialog.component';
import { ProductModulePickerDialogComponent } from './product-module-picker-dialog.component';
import {
  MATERIAL_KIND_LABELS,
  Material,
  MaterialsService,
} from '../../shared/services/materials.service';

type Result = Product | null | undefined;

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
 * Reworked from the compact form-variant dialog to the wide content DSL
 * (TZ-MATERIALS-301 pattern): `variant="content"` + `[maxWidth]="'1000px'"`
 * with an ALWAYS-VISIBLE sticky footer (Save/Cancel). The shared
 * PiDialogComponent content template already provides
 * `overflow-y-auto` on the body and `sticky bottom-0 bg-paper` on the
 * footer, so long forms never push «Сохранить» off-screen.
 *
 * Sections (in order):
 *  1. Основные данные: name, sku, kind, unit, status
 *  2. Категория: categoryId (dropdown из CategoriesService) + subcategory
 *  3. Цены: listPrice, isActive
 *  4. Габариты: L/W/H + unit (4 inputs)
 *  5. Цвет (RAL): searchable dropdown из PiColorReferencesService
 *     (активные цвета, swatch + name; свободный ввод НЕ допускается)
 *  6. Модули в составе: карточки привязанных модулей (имя, артикул,
 *     «N материалов», удаление ×) + «+ Добавить модуль» (мульти-picker
 *     TZ-PRODUCTS-303); submit через атомарные POST/DELETE
 *     /products/:id/modules (TZ-83 D.3, race-safe $addToSet/$pull)
 *  7. Дополнительно: weightKg
 *  8. Описание/Заметки: description, notes
 *  9. Изображения: photo upload (PhotosService, TZ-MATERIALS-306 паттерн)
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
  ],
  template: `
    <app-pi-dialog
      [title]="isEdit() ? 'Редактировать продукт' : 'Создать продукт'"
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
        <!-- ─── 1. Основные данные ─── -->
        <div>
          <p class="eyebrow mb-form-row">Основные данные</p>
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
                class="w-full h-10 px-control-x text-sm hairline rounded-sm bg-paper text-ink font-body pi-focus-ring transition-colors"
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
          </div>
        </div>

        <!-- ─── 2. Категория ─── -->
        <div>
          <p class="eyebrow mb-form-row">Категория</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field">
            <app-pi-form-field
              label="Категория"
              htmlFor="prod-category"
              hint="Из справочника категорий (тип «продукт»). Пусто = «Без категории»."
            >
              <select id="prod-category" formControlName="categoryId" class="pi-input w-full">
                <option [ngValue]="null">— без категории —</option>
                @if (categoriesLoading()) {
                  <option [ngValue]="null" disabled>Загрузка категорий…</option>
                } @else if (categoriesError()) {
                  <option [ngValue]="null" disabled>Ошибка загрузки категорий</option>
                } @else {
                  @for (c of categories(); track c._id) {
                    <option [ngValue]="c._id">{{ c.name }}</option>
                  }
                }
              </select>
            </app-pi-form-field>

            <app-pi-form-field label="Подкатегория" htmlFor="prod-subcategory">
              <app-pi-input
                id="prod-subcategory"
                formControlName="subcategory"
                placeholder="Подкатегория"
              />
            </app-pi-form-field>
          </div>
        </div>

        <!-- ─── 3. Цены ─── -->
        <div>
          <p class="eyebrow mb-form-row">Цены</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field">
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

        <!-- ─── 4. Габариты ─── -->
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

        <!-- ─── 5. Цвет (RAL) ─── -->
        <div>
          <p class="eyebrow mb-form-row">Цвет (RAL)</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field items-start">
            <app-pi-form-field
              label="Цвет"
              htmlFor="prod-ral"
              hint="Выбор из справочника цветов. Системный «Не выбран» очищает поле."
            >
              <div class="relative" #colorDropdownHost>
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

            <app-pi-form-field label="Вес, кг" htmlFor="prod-weight">
              <app-pi-input
                id="prod-weight"
                type="number"
                formControlName="weightKg"
                placeholder="0"
              />
            </app-pi-form-field>
          </div>
        </div>

        <!-- ─── 6. Модули в составе ─── -->
        <div>
          <div class="flex items-baseline justify-between mb-form-row">
            <div>
              <p class="eyebrow">Состав</p>
              <p class="text-sm font-medium">Модули, материалы и изделия</p>
              <p class="text-xs text-muted-foreground">
                сырьё добавляется только через модуль; детали = Material.materialKind
              </p>
            </div>
            <app-pi-button
              type="button"
              variant="outline"
              size="sm"
              (click)="openModulePicker()"
              data-test="add-module"
            >
              + Добавить модуль
            </app-pi-button>
          </div>

          @if (attachedModules().length === 0 && modulesLoading()) {
            <p class="text-xs text-muted-foreground" role="status">Загрузка модулей…</p>
          } @else if (attachedModules().length === 0 && modulesError()) {
            <p class="text-xs text-destructive" role="alert">{{ modulesError() }}</p>
          }
          <div class="space-y-2">
            @if (isComplex()) {
              <span
                class="inline-flex items-center px-2 py-1 text-xs hairline rounded-sm bg-sunrise-warm/10 text-sunrise-warm"
                data-test="complex-badge"
                >Комплекс</span
              >
            }
            <div class="flex gap-2">
              <app-pi-button
                type="button"
                variant="outline"
                size="sm"
                (click)="openCompositionPicker()"
                data-test="add-composition-line"
                >+ Добавить в состав</app-pi-button
              >
            </div>
            @if (attachedModules().length === 0 && !modulesLoading() && !modulesError()) {
              <p class="text-xs text-muted-foreground">
                Нет модулей в составе. Добавьте строку состава.
              </p>
            }
            @for (line of compositionRows(); track line._id) {
              @if (line.lineType !== 'module') {
                <div
                  class="flex items-center gap-3 p-2 hairline rounded-sm bg-paper-2/30"
                  [attr.data-test]="'composition-line-' + line._id"
                >
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium">{{ compositionLabel(line) }}</p>
                    <p class="text-xs text-muted-foreground">
                      {{ line.refId }} · количество {{ line.quantity }}
                    </p>
                  </div>
                  @if (line.lineType === 'product') {
                    <span class="text-xs font-mono">Цена: {{ line.unitPriceOverride ?? '—' }}</span>
                  }
                </div>
              }
            }
            @for (m of attachedModules(); track m._id) {
              <div
                class="flex items-center gap-3 p-2 hairline rounded-sm bg-paper-2/30"
                [attr.data-test]="'module-card-' + m._id"
              >
                <div
                  class="w-10 h-10 rounded-sm hairline bg-paper flex items-center justify-center text-muted-foreground text-sm font-medium shrink-0"
                  aria-hidden="true"
                >
                  {{ (m.name || 'M').charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium truncate">{{ m.name }}</p>
                  <p class="text-xs text-muted-foreground">
                    {{ m.article ?? '—' }} · {{ m.materials.length }} материалов
                  </p>
                </div>
                <label class="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                  <span class="eyebrow">Кол-во</span>
                  <app-pi-input
                    type="number"
                    class="w-20"
                    [value]="'' + moduleQty(m._id)"
                    (valueChange)="setModuleQty(m._id, $event)"
                    aria-label="Количество модуля в составе"
                    data-test="module-qty"
                  />
                </label>
                <app-pi-button
                  type="button"
                  variant="destructive"
                  size="icon"
                  [attr.aria-label]="'Удалить модуль ' + m.name"
                  (click)="removeModule(m._id)"
                  data-test="remove-module"
                >
                  ×
                </app-pi-button>
              </div>
            }
          </div>
        </div>

        <!-- ─── 7. Описание/Заметки ─── -->
        <div>
          <p class="eyebrow mb-form-row">Описание и заметки</p>
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
        </div>

        <!-- ─── 8. Изображения ─── -->
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
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
    this.loadModules();
    this.seedAttachedModules();
    this.compositionLines.set(this.data?.composition ?? []);
    this.materialsService.list({ limit: 200 }).subscribe((res) => {
      if (res.ok) this.materialCatalog.set(res.data.items);
    });
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
        categoryId: this.data.categoryId ?? null,
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
  private readonly modulesService = inject(ProductModulesService);
  private readonly materialsService = inject(MaterialsService);
  private readonly dialog = inject(PiDialogService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly auth = inject(AuthService);

  private readonly dropdownHost = viewChild<ElementRef<HTMLElement>>('colorDropdownHost');

  protected readonly isEdit = signal<boolean>(this.data != null);
  protected readonly submitting = signal<boolean>(false);
  protected readonly uploading = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);

  // ─── Categories ───
  protected readonly categories = signal<Category[]>([]);
  protected readonly categoriesLoading = signal(false);
  protected readonly categoriesError = signal<string | null>(null);

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

  // ─── Modules (в составе) ───
  /** Черновик привязанных модулей (карточки). */
  protected readonly attachedModules = signal<ProductModule[]>([]);
  /** Каталог модулей для picker'а (loading/error по образцу RAL dropdown). */
  protected readonly modulesLoading = signal(false);
  protected readonly modulesError = signal<string | null>(null);
  private readonly moduleCatalog = signal<ProductModule[]>([]);
  /** Строковые moduleIds из данных товара — резолвятся после загрузки каталога. */
  private pendingStringModuleIds: string[] = [];
  /** Кол-во каждой линии (по moduleId) — composition quantity, default 1. */
  private readonly moduleQuantities = signal<Record<string, number>>({});
  /** Состав-снимок исходных module-линий (для diff на submit; пуст на legacy). */
  private originalComposition: CompositionLine[] = [];
  private readonly compositionLines = signal<CompositionLine[]>([]);
  private readonly materialCatalog = signal<Material[]>([]);
  protected readonly compositionRows = computed(() => this.compositionLines());
  protected readonly isComplex = computed(() =>
    this.compositionLines().some((line) => line.lineType === 'product'),
  );

  // ─── Photos ───
  protected readonly photos = signal<Photo[]>([]);
  /** Photo IDs marked for deletion; applied on submit (atomic with save, TZ-MATERIALS-306). */
  private readonly pendingPhotoDeletions = signal<string[]>([]);
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

  // ─── Modules (в составе) ───

  /**
   * Загружает каталог модулей для picker'а (активный список, из которого
   * пользователь выбирает). Состояния loading/error — по образцу
   * PiColorReference dropdown из TZ-PRODUCTS-302.
   * После успешной загрузки резолвим отложенные строковые moduleIds
   * (см. `seedAttachedModules` / `resolvePendingStringModuleIds`).
   */
  private loadModules(): void {
    this.modulesLoading.set(true);
    this.modulesError.set(null);
    this.modulesService.list().subscribe((res) => {
      this.modulesLoading.set(false);
      if (res.ok) {
        this.moduleCatalog.set(res.data);
        this.resolvePendingStringModuleIds();
      } else {
        this.moduleCatalog.set([]);
        this.modulesError.set(extractErrorMessage(res.error));
      }
    });
  }

  /**
   * Первичное наполнение черновика из данных редактируемого товара.
   * `productModuleIds` приходит populated (объекты) либо строками-ids.
   * Объекты кладём сразу; строки откладываем в `pendingStringModuleIds`
   * и резолвим из каталога, когда он загрузится (каталог грузится
   * асинхронно — резолвить строки здесь синхронно нельзя, иначе они
   * молча пропадут из черновика и на submit превратятся в DELETE).
   */
  private seedAttachedModules(): void {
    const moduleLines = (this.data?.composition ?? []).filter(
      (l): l is CompositionLine & { lineType: 'module' } => l.lineType === 'module',
    );
    // Dual-read (TZ-CATALOG-317): composition-first, legacy productModuleIds
    // только пока состав не мигрирован (TZ-CATALOG-304).
    if (moduleLines.length > 0) {
      this.originalComposition = moduleLines;
      const qty: Record<string, number> = {};
      const stringIds: string[] = [];
      moduleLines.forEach((l) => {
        qty[l.refId] = l.quantity ?? 1;
        stringIds.push(l.refId);
      });
      this.moduleQuantities.set(qty);
      this.pendingStringModuleIds = stringIds;
      this.resolvePendingStringModuleIds();
      return;
    }
    const raw = this.data?.productModuleIds ?? [];
    if (raw.length === 0) return;
    const objects: ProductModule[] = [];
    const stringIds: string[] = [];
    raw.forEach((m) => {
      if (typeof m === 'object' && m !== null && '_id' in m) {
        objects.push(m as ProductModule);
      } else if (typeof m === 'string') {
        stringIds.push(m);
      }
    });
    this.attachedModules.set(objects);
    this.pendingStringModuleIds = stringIds;
    // Каталог мог уже успеть загрузиться (быстрый ответ/тест) — пробуем сразу.
    this.resolvePendingStringModuleIds();
  }

  /**
   * Резолв отложенных строковых moduleIds через загруженный каталог.
   * Неразрешённые ids остаются в очереди (каталог может ещё не прийти);
   * повторный вызов происходит из `loadModules` success.
   */
  private resolvePendingStringModuleIds(): void {
    if (this.pendingStringModuleIds.length === 0) return;
    const byId = new Map(this.moduleCatalog().map((m) => [m._id, m]));
    const resolved: ProductModule[] = [];
    const unresolved: string[] = [];
    this.pendingStringModuleIds.forEach((id) => {
      const m = byId.get(id);
      if (m) {
        resolved.push(m);
      } else {
        unresolved.push(id);
      }
    });
    this.pendingStringModuleIds = unresolved;
    if (resolved.length > 0) {
      this.attachedModules.update((cur) => {
        const existing = new Set(cur.map((m) => m._id));
        return [...cur, ...resolved.filter((m) => !existing.has(m._id))];
      });
    }
  }

  protected compositionLabel(line: CompositionLine): string {
    if (line.lineType === 'product') return 'Изделие';
    if (line.lineType === 'module') return 'Модуль';
    const material = this.materialCatalog().find((item) => item._id === line.refId);
    return material
      ? `Материал · ${material.materialKind ? MATERIAL_KIND_LABELS[material.materialKind] : 'тип не указан'}`
      : 'Материал';
  }

  /** Opens the product/module/material composition picker. */
  protected openCompositionPicker(): void {
    const productId = this.data?._id;
    if (!productId) {
      this.toast.error('Сначала сохраните изделие, затем добавляйте материалы и изделия в состав');
      return;
    }
    const ref = this.dialog.open<ProductCompositionPickerResult | null>(
      ProductCompositionPickerDialogComponent,
      {
        data: { productId },
        width: 'lg',
        parentDestroyRef: this.destroyRef,
      },
    );
    onDialogCloseOnce(ref, this.injector, (result) => {
      if (!result) return;
      const dto: CompositionLineUpsertDto =
        result.lineType === 'product'
          ? {
              lineType: 'product',
              refId: result.refId,
              quantity: 1,
              ...(result.unitPriceOverride != null
                ? { unitPriceOverride: result.unitPriceOverride }
                : {}),
            }
          : { lineType: result.lineType, refId: result.refId, quantity: 1 };
      this.modulesService.addProductCompositionLine(productId, dto).subscribe((res) => {
        if (res.ok) {
          this.compositionLines.set(res.data);
          this.toast.success('Строка добавлена в состав');
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    });
  }

  /** Открывает мульти-picker модулей; результат — массив moduleId[]. */
  protected openModulePicker(): void {
    const excludeIds = this.attachedModules().map((m) => m._id);
    const ref = this.dialog.open<string[] | null>(ProductModulePickerDialogComponent, {
      data: {
        productId: this.data?._id ?? '',
        excludeIds,
        multi: true,
      },
      width: 'lg',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (ids) => {
      this.addModules(ids);
    });
  }

  /** Добавляет карточки из выбранных id (дедупликация по _id). */
  protected addModules(ids: string[]): void {
    if (ids.length === 0) return;
    const byId = new Map(this.moduleCatalog().map((m) => [m._id, m]));
    const fresh: ProductModule[] = [];
    this.attachedModules.update((cur) => {
      const existing = new Set(cur.map((m) => m._id));
      const items = ids
        .map((id) => byId.get(id))
        .filter((m): m is ProductModule => m !== undefined && !existing.has(m._id));
      fresh.push(...items);
      return items.length > 0 ? [...cur, ...items] : cur;
    });
    if (fresh.length > 0) {
      this.moduleQuantities.update((q) => {
        const next = { ...q };
        fresh.forEach((m) => {
          if (next[m._id] == null) next[m._id] = 1;
        });
        return next;
      });
    }
    // dirty-state tracking: добавление модулей → «Сохранить» активна
    this.form.markAsDirty();
  }

  /** Удаляет карточку из черновика (само привязывание не трогаем до submit). */
  protected removeModule(id: string): void {
    this.attachedModules.update((cur) => cur.filter((m) => m._id !== id));
    this.moduleQuantities.update((q) => {
      const next = { ...q };
      delete next[id];
      return next;
    });
    this.form.markAsDirty();
  }

  /** Текущее количество модуля (composition quantity; default 1). */
  protected moduleQty(moduleId: string): number {
    return this.moduleQuantities()[moduleId] ?? 1;
  }

  /** Обновляет количество линии (composition quantity). Минимум 0.000001 как в DTO. */
  protected setModuleQty(moduleId: string, rawValue: string | Event): void {
    const text =
      typeof rawValue === 'string' ? rawValue : (rawValue.target as HTMLInputElement).value;
    const raw = Number(text);
    const qty = Number.isFinite(raw) ? Math.max(0.000001, raw) : 1;
    this.moduleQuantities.update((q) => ({ ...q, [moduleId]: qty }));
    this.form.markAsDirty();
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
    const dimensions =
      v.dimLength != null || v.dimWidth != null || v.dimHeight != null
        ? {
            ...(v.dimLength != null ? { length: v.dimLength } : {}),
            ...(v.dimWidth != null ? { width: v.dimWidth } : {}),
            ...(v.dimHeight != null ? { height: v.dimHeight } : {}),
            unit: v.dimUnit,
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
    if (v.sku) payload.sku = v.sku;
    if (v.subcategory) payload.subcategory = v.subcategory;
    if (v.listPrice != null) payload.listPrice = v.listPrice;
    // ralCode/categoryId are PATCHED EXPLICITLY (including null) so that
    // choosing «Не выбран» / «— без категории —» on edit actually CLEARS
    // the previously stored value — the backend $set applies the null.
    payload.ralCode = v.ralCode ?? null;
    payload.categoryId = v.categoryId ?? null;
    if (dimensions) payload.dimensions = dimensions;
    if (v.weightKg != null) payload.weightKg = v.weightKg;
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
        // Modules: atomic POST/DELETE diff vs the original attachment set.
        this.syncModules(res.data._id).subscribe((allOk) => {
          if (!allOk) {
            this.toast.error('Часть модулей не синхронизирована — проверьте состав товара');
          }
          this.toast.success(this.isEdit() ? 'Продукт обновлён' : 'Продукт создан');
          this.ref.close(res.data);
        });
      } else {
        this.errorMessage.set(extractErrorMessage(res.error));
        this.submitting.set(false);
      }
    });
  }

  /**
   * Синхронизация «модули в составе» через composition API (TZ-CATALOG-317).
   * Контракт зафиксирован по коду:
   *   POST   /products/:productId/composition  { lineType:'module', refId, quantity }
   *   PATCH  /products/:productId/composition/:lineId  { quantity }
   *   DELETE /products/:productId/composition/:lineId
   *   backend/src/modules/product/product.controller.ts (TZ-CATALOG-302)
   *
   * Diff исходного состава (data.composition module-линии; на legacy —
   * пуст, тогда каждый модуль черновика добавляется POST'ом как новая
   * composition-линия) против черновика: удалённые → DELETE, новые → POST,
   * изменённое quantity → PATCH. Возвращает true если все операции ok
   * (silent-http, никогда не бросают).
   */
  private syncModules(productId: string): Observable<boolean> {
    const draftIds = new Set(this.attachedModules().map((m) => m._id));
    const originalByRef = new Map(this.originalComposition.map((l) => [l.refId, l]));
    const calls: Observable<SilentResult<unknown>>[] = [];

    // Удаление: линии состава, которых больше нет в черновике → DELETE.
    this.originalComposition.forEach((line) => {
      if (!draftIds.has(line.refId)) {
        calls.push(this.modulesService.removeProductCompositionLine(productId, line._id));
      }
    });

    // Добавление/изменение: для каждого модуля черновика.
    this.attachedModules().forEach((m) => {
      const qty = this.moduleQuantities()[m._id] ?? 1;
      const existing = originalByRef.get(m._id);
      if (existing) {
        if (existing.quantity !== qty) {
          calls.push(
            this.modulesService.updateProductCompositionLine(productId, existing._id, {
              quantity: qty,
            }),
          );
        }
      } else {
        calls.push(
          this.modulesService.addProductCompositionLine(productId, {
            lineType: 'module',
            refId: m._id,
            quantity: qty,
          }),
        );
      }
    });

    if (calls.length === 0) return of(true);
    return forkJoin(calls).pipe(map((results) => results.every((r) => r.ok)));
  }

  protected onCancel(): void {
    // Orphan cleanup runs in ngOnDestroy (single source of truth for all
    // close paths). ref.close(null) triggers destroy; cleanup runs there.
    this.ref.close(null);
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
