import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  HostListener,
  Injector,
  inject,
  signal,
  OnDestroy,
} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { TextareaComponent } from '../../shared/ui/textarea/textarea.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiToastService } from '../../shared/ui/toast';
import { extractErrorMessage } from '../../core/silent-http';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import {
  Material,
  MaterialDimensionType,
  MaterialKind,
  MATERIAL_KINDS,
  MaterialsService,
} from '../../shared/services/materials.service';
import {
  PhotosService,
  uploadPhotosWithProgress,
  type Photo,
} from '../../shared/services/photos.service';
import { Organization, OrganizationsService } from '../../shared/services/organizations.service';
import {
  CategoriesService,
  categoryPickerLabel,
  type Category,
} from '../../shared/services/categories.service';
import { Unit, UnitsService } from '../../pages/dictionaries/units.service';
import { PiFormSectionComponent } from '../../shared/ui/form-section';
import { PiOverflowSelectComponent } from '../../shared/ui/overflow-select/pi-overflow-select.component';
import { PiPhotoDropzoneComponent } from '../../shared/ui/photo';
import {
  dictionaryLabelOptions,
  PiDictionaryLabelsService,
} from '../../shared/services/pi-dictionary-labels.service';
import { focusDialogField, isSaveAndContinueKey } from '../../shared/util/dialog-save-and-continue';
import { PiDialogService } from '../../shared/ui/dialog/pi-dialog.service';
import { OrganizationFullEditorDialogComponent } from '../organizations/organization-full-editor-dialog.component';
import { onDialogCloseOnce } from '../../shared/util/on-dialog-close-once';

type Result = Material | null | undefined;

const DIMENSION_TYPES: { value: MaterialDimensionType; label: string }[] = [
  { value: 'length', label: 'Длина' },
  { value: 'width', label: 'Ширина' },
  { value: 'height', label: 'Высота' },
  { value: 'thickness', label: 'Толщина' },
  { value: 'diameter', label: 'Диаметр' },
  { value: 'depth', label: 'Глубина' },
];

/**
 * Empty-string sentinel for the materialKind control in the form.
 *
 * The form control is a plain string (no `null`) so a plain `<select>`
 * with `@for`-driven options works without template-typing gymnastics
 * (matches the existing `unit` selector pattern). On submit we map
 * `''` → field omitted from payload; legacy rows without kind stay
 * un-set rather than forced to `other` (server backfills `other`
 * itself on missing/null — see TZ-CATALOG-301).
 */
const KIND_NULL_SENTINEL = '';
/** Selector options for «Тип материала», keyed by canonical kind + sentinel for unknown. */
const KIND_KEYS: readonly MaterialKind[] = ['raw', 'part', 'fastener', 'purchased', 'other'];

interface DimensionFormGroup extends FormGroup {
  controls: {
    type: FormControl<MaterialDimensionType>;
    value: FormControl<number>;
    isImmutable: FormControl<boolean>;
  };
}

/**
 * MaterialFormDialogComponent — wide structured layout (TZ-MATERIALS-301).
 *
 * Layout:
 *  - `variant="content"` + `[maxWidth]="'min(1120px, …)'"` — wide dialog with
 *    internal body scroll and an ALWAYS-VISIBLE sticky footer (Save/Cancel).
 *    The shared PiDialogComponent content template already provides
 *    `overflow-y-auto` on the body and `sticky bottom-0 bg-paper` on the
 *    footer, so long forms no longer push «Сохранить» off-screen.
 *  - Two-column grid (collapses to one column on narrow viewports):
 *      LEFT  → required basics (name, article, unit, sku, price); stock moved to Склад
 *      RIGHT → optional data (supplier, description, notes, photos)
 *  - Dimensions stay in their own half-width section on desktop and use the
 *    full dialog width on mobile.
 *
 * Sections (in order):
 *  1. Основные данные (left): name, article, unit, sku, pricePerUnit
 *  2. Дополнительно (right): supplier, description, notes, photos
 *  3. Габариты (desktop half-width; FormArray of {type, value, isImmutable})
 *
 * On submit:
 *  - Upload any new files via PhotosService
 *  - Collect photoIds + mainPhotoId; Save disabled while uploading
 *  - POST/PATCH material with all fields
 *
 * Standalone + OnPush + signal-based.
 */
@Component({
  selector: 'app-material-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    PiDialogComponent,
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
    TextareaComponent,
    PiFormSectionComponent,
    PiOverflowSelectComponent,
    PiPhotoDropzoneComponent,
  ],
  template: `
    <app-pi-dialog
      [title]="isEdit() ? 'Редактировать материал' : 'Создать материал'"
      [variant]="'content'"
      [maxWidth]="'min(1120px, calc(100vw - 2rem))'"
    >
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="space-y-4"
        data-test="material-form"
      >
        <!-- ─── Two-column layout: basics (left) + optional (right) ─── -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          <!-- ─── LEFT: обязательные основные данные ─── -->
          <app-pi-form-section title="Основные данные" headingId="mat-sec-basics" tone="gold">
            <!-- TZ-UX-FORM-311: 12-col → name lg (8) + article sm (4), not 50/50. -->
            <div class="grid md:grid-cols-12 gap-form-field">
              <app-pi-form-field
                label="Название"
                htmlFor="mat-name"
                [required]="true"
                [error]="errorFor('name')"
                class="md:col-span-8"
              >
                <app-pi-input
                  id="mat-name"
                  formControlName="name"
                  data-save-continue-first="true"
                  placeholder="Название материала"
                  [invalid]="hasError('name')"
                />
              </app-pi-form-field>

              <app-pi-form-field
                label="Артикул"
                htmlFor="mat-article"
                [required]="true"
                [error]="errorFor('article')"
                class="md:col-span-4"
              >
                <app-pi-input
                  id="mat-article"
                  formControlName="article"
                  placeholder="Артикул материала"
                  [invalid]="hasError('article')"
                />
              </app-pi-form-field>

              <app-pi-form-field
                label="Единица"
                htmlFor="mat-unit"
                [required]="true"
                [error]="errorFor('unit')"
                class="md:col-span-2"
              >
                <select
                  id="mat-unit"
                  formControlName="unit"
                  class="pi-input w-full"
                  [class.border-destructive]="hasError('unit')"
                >
                  <option value="" disabled>— выберите —</option>
                  @if (unitsLoading()) {
                    <option value="" disabled>Загрузка…</option>
                  } @else if (unitsError()) {
                    <option value="" disabled>Ошибка загрузки</option>
                    @if (unitFallback(); as fb) {
                      <option [value]="fb" disabled>{{ fb }} (неактивна)</option>
                    }
                  } @else {
                    @for (u of units(); track u.key) {
                      <option [value]="u.key">
                        {{ u.label }}{{ u.symbol ? ' (' + u.symbol + ')' : '' }}
                      </option>
                    }
                    @if (unitFallback(); as fb) {
                      <option [value]="fb" disabled>{{ fb }} (неактивна)</option>
                    }
                  }
                </select>
              </app-pi-form-field>

              <!-- TZ-UX-FORM-311: SKU = sm (4-col). -->
              <app-pi-form-field
                label="Внутренний код материала"
                htmlFor="mat-sku"
                [error]="errorFor('sku')"
                class="md:col-span-4"
              >
                <app-pi-input id="mat-sku" formControlName="sku" placeholder="M-0001" />
              </app-pi-form-field>

              <!-- TZ-UX-FORM-311: Kind = sm (4-col). -->
              <app-pi-form-field
                label="Тип материала"
                htmlFor="mat-materialKind"
                hint="Сырьё, деталь, метиз, покупное — для классификации и фильтра."
                class="md:col-span-4"
              >
                <select
                  id="mat-materialKind"
                  formControlName="materialKind"
                  class="pi-input w-full"
                  data-test="material-kind-select"
                >
                  @for (opt of kindOptions(); track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
              </app-pi-form-field>

              <app-pi-form-field
                label="Категория"
                htmlFor="mat-category"
                hint="Из справочника категорий (тип «материал»)."
                class="md:col-span-8"
              >
                <div class="pi-select-add-row">
                  <app-pi-overflow-select
                    [items]="categoryItems()"
                    [value]="form.controls.categoryId.value ?? ''"
                    (valueChange)="onCategoryChange($event)"
                    searchable="auto"
                    placeholder="— без категории —"
                    ariaLabel="Категория материала"
                    dataTest="mat-category"
                  />
                  <button
                    type="button"
                    class="pi-select-add-btn"
                    (click)="openCreateCategory()"
                    title="Новая категория материала"
                    aria-label="Новая категория материала"
                    data-test="mat-category-add"
                  >
                    +
                  </button>
                </div>
                @if (showNewCategory()) {
                  <div class="mt-2 flex items-center gap-2" data-test="mat-category-quick-create">
                    <app-pi-input
                      id="mat-new-category-name"
                      [value]="newCategoryName()"
                      (valueChange)="newCategoryName.set($event)"
                      placeholder="Название категории"
                      ariaLabel="Название новой категории"
                    />
                    <app-pi-button
                      type="button"
                      variant="default"
                      [disabled]="creatingCategory()"
                      (click)="saveNewCategory()"
                      data-test="mat-category-quick-save"
                    >
                      {{ creatingCategory() ? '…' : 'Создать' }}
                    </app-pi-button>
                    <app-pi-button
                      type="button"
                      variant="ghost"
                      [disabled]="creatingCategory()"
                      (click)="cancelNewCategory()"
                    >
                      Отмена
                    </app-pi-button>
                  </div>
                }
              </app-pi-form-field>

              <!-- ─── TZ-CATALOG-301 / 316: масса в кг (≥ 0) ─── -->
              <!-- TZ-UX-FORM-311: Weight = nano (2-col) + max-w + tabular-nums. -->
              <app-pi-form-field
                label="Масса, кг"
                htmlFor="mat-weightKg"
                [error]="errorFor('weightKg')"
                class="md:col-span-2"
              >
                <app-pi-input
                  id="mat-weightKg"
                  type="number"
                  formControlName="weightKg"
                  placeholder="0.00"
                  step="0.001"
                  min="0"
                  [invalid]="hasError('weightKg')"
                  ariaLabel="Масса в килограммах"
                  style="max-width: 5.5rem; text-align: right; font-variant-numeric: tabular-nums"
                />
              </app-pi-form-field>

              <!-- TZ-UX-FORM-311: Price = xs (2-col) + max-w + tabular-nums. -->
              <app-pi-form-field
                label="Цена, ₽"
                htmlFor="mat-price"
                [error]="errorFor('pricePerUnit')"
                class="md:col-span-2"
              >
                <app-pi-input
                  id="mat-price"
                  type="number"
                  formControlName="pricePerUnit"
                  placeholder="0.00"
                  [invalid]="hasError('pricePerUnit')"
                  style="max-width: 7rem; text-align: right; font-variant-numeric: tabular-nums"
                />
              </app-pi-form-field>

              <p class="md:col-span-4 text-[11px] text-muted-foreground leading-snug">
                Остаток — в разделе «Склад».
              </p>
            </div>
          </app-pi-form-section>

          <!-- ─── RIGHT: необязательные данные ─── -->
          <app-pi-form-section title="Дополнительно" headingId="mat-sec-extra" tone="neutral">
            <!-- TZ-UX-FORM-311: assortment/standard/grade = sm (4-col each) in 12-col grid. -->
            <div class="grid md:grid-cols-12 gap-form-field">
              <app-pi-form-field
                label="Сортамент"
                htmlFor="mat-assortment"
                [error]="errorFor('assortment')"
                hint="Профиль: труба, лист, уголок…"
                class="md:col-span-4"
              >
                <app-pi-input
                  id="mat-assortment"
                  formControlName="assortment"
                  placeholder="Лист, Труба…"
                  [invalid]="hasError('assortment')"
                />
              </app-pi-form-field>
              <app-pi-form-field
                label="Стандарт"
                htmlFor="mat-standardRef"
                [error]="errorFor('standardRef')"
                hint="ГОСТ, ASTM, DIN…"
                class="md:col-span-4"
              >
                <app-pi-input
                  id="mat-standardRef"
                  formControlName="standardRef"
                  placeholder="ГОСТ 19904-90"
                  [invalid]="hasError('standardRef')"
                />
              </app-pi-form-field>
              <app-pi-form-field
                label="Марка"
                htmlFor="mat-materialGrade"
                [error]="errorFor('materialGrade')"
                hint="Ст 3, AISI 304…"
                class="md:col-span-4"
              >
                <app-pi-input
                  id="mat-materialGrade"
                  formControlName="materialGrade"
                  placeholder="Ст3"
                  [invalid]="hasError('materialGrade')"
                />
              </app-pi-form-field>
            </div>

            <app-pi-form-field
              label="Поставщик"
              htmlFor="mat-supplier"
              [error]="suppliersError()"
              [hint]="suppliersLoading() ? 'Загрузка поставщиков…' : null"
            >
              <div class="pi-select-add-row">
                <app-pi-overflow-select
                  [items]="supplierItems()"
                  [value]="form.controls.supplierId.value ?? ''"
                  (valueChange)="onSupplierChange($event)"
                  [disabled]="suppliersLoading()"
                  searchable="auto"
                  placeholder="— не указан —"
                  ariaLabel="Поставщик"
                  dataTest="mat-supplier"
                />
                <button
                  type="button"
                  class="pi-select-add-btn"
                  (click)="openCreateSupplier()"
                  [disabled]="suppliersLoading()"
                  title="Новый поставщик"
                  aria-label="Новый поставщик"
                  data-test="mat-supplier-add"
                >
                  +
                </button>
              </div>
              @if (!suppliersLoading() && !suppliersError() && suppliers().length === 0) {
                <p class="mt-1 text-xs text-muted-foreground" data-test="supplier-empty-hint">
                  Нет поставщиков — нажмите + или
                  <a href="/organizations" class="underline underline-offset-2"
                    >откройте справочник</a
                  >.
                </p>
              }
            </app-pi-form-field>

            <app-pi-form-field
              label="Описание"
              htmlFor="mat-description"
              [error]="errorFor('description')"
            >
              <app-pi-textarea
                id="mat-description"
                formControlName="description"
                [rows]="2"
                [maxLength]="2000"
                [invalid]="hasError('description')"
                ariaLabel="Описание"
              />
            </app-pi-form-field>

            <app-pi-form-field label="Заметки" htmlFor="mat-notes" [error]="errorFor('notes')">
              <app-pi-textarea
                id="mat-notes"
                formControlName="notes"
                [rows]="2"
                [maxLength]="2000"
                [invalid]="hasError('notes')"
                ariaLabel="Заметки"
              />
            </app-pi-form-field>

            <!-- ─── Photos ─── -->
            <div>
              <div class="mb-form-row">
                <p class="eyebrow">Фото</p>
              </div>
              <app-pi-photo-dropzone
                [photos]="photos()"
                [uploading]="uploading()"
                [progressPercent]="uploadProgress()"
                (uploadRequest)="onPhotoUpload($event)"
                (deleteRequest)="removePhoto($event)"
              />
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                @for (p of photos(); track p._id; let i = $index) {
                  <div
                    class="relative hairline rounded-sm overflow-hidden bg-paper-2"
                    [class.border-ink]="p._id === mainPhotoId()"
                    [attr.data-test]="'photo-thumb-' + i"
                  >
                    <img
                      [src]="p.storageUrl"
                      [alt]="p.originalFilename || 'Фото материала'"
                      class="block w-full h-24 object-cover"
                    />
                    <div class="flex items-center justify-between p-1 hairline-t">
                      <label
                        class="inline-flex items-center gap-1 text-[11px] cursor-pointer min-h-touch px-1"
                      >
                        <input
                          type="radio"
                          name="mainPhoto"
                          [checked]="p._id === mainPhotoId()"
                          (change)="setMainPhoto(p._id)"
                          [attr.aria-label]="'Сделать главным ' + (i + 1)"
                        />
                        <span>Главное</span>
                      </label>
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
          </app-pi-form-section>
        </div>

        <!-- ─── Dimensions: half-width on desktop, full-width on mobile ─── -->
        <div class="w-full lg:w-1/2 max-w-xl hairline-t pt-4" data-test="dimensions-section-wrap">
          <app-pi-form-section title="Габариты" headingId="mat-sec-dims" tone="dimensions">
            <div class="flex items-baseline justify-between mb-form-row">
              <app-pi-button
                type="button"
                variant="outline"
                size="sm"
                [disabled]="!canAddDimension()"
                (click)="addDimension()"
                data-test="add-dimension"
                [attr.title]="canAddDimension() ? null : 'Все типы габаритов уже добавлены'"
              >
                + Добавить размер
              </app-pi-button>
            </div>
            <div formArrayName="dimensions" class="space-y-2">
              @for (dimGroup of dimensionsArray.controls; track $index; let i = $index) {
                <div
                  [formGroupName]="i"
                  class="grid grid-cols-12 gap-2 items-center p-2 hairline rounded-sm bg-paper"
                  [attr.data-test]="'dimension-row-' + i"
                >
                  <select
                    [attr.id]="'mat-dim-type-' + i"
                    [attr.name]="'dim-type-' + i"
                    formControlName="type"
                    class="col-span-4 h-8 px-3 text-xs hairline rounded-sm bg-paper pi-focus-ring"
                    [attr.aria-label]="'Тип габарита ' + (i + 1)"
                  >
                    @for (opt of dimensionTypeOptionsFor(i); track opt.value) {
                      <option [value]="opt.value">{{ opt.label }}</option>
                    }
                  </select>
                  <!-- TZ-UX-FORM-311: dim value = nano max-w + tabular-nums. -->
                  <app-pi-input
                    [attr.id]="'mat-dim-value-' + i"
                    type="number"
                    formControlName="value"
                    placeholder="0"
                    size="sm"
                    [attr.aria-label]="'Значение ' + (i + 1)"
                    class="col-span-3"
                    style="max-width: 5.5rem; text-align: right; font-variant-numeric: tabular-nums"
                  />
                  <label
                    class="col-span-4 inline-flex items-center gap-2 min-h-touch px-control-x text-sm cursor-pointer"
                    title="Нельзя менять в модулях/изделиях (например толщина листа)"
                  >
                    <input
                      [attr.id]="'mat-dim-immutable-' + i"
                      [attr.name]="'dim-immutable-' + i"
                      type="checkbox"
                      formControlName="isImmutable"
                      class="w-4 h-4"
                      [attr.aria-label]="'Неизменяемый ' + (i + 1)"
                    />
                    <span>Неизменяемый</span>
                  </label>
                  <app-pi-button
                    type="button"
                    variant="destructive"
                    size="icon"
                    [attr.aria-label]="'Удалить габарит ' + (i + 1)"
                    (click)="removeDimension(i)"
                  >
                    ×
                  </app-pi-button>
                </div>
              }
            </div>
          </app-pi-form-section>
        </div>

        @if (errorMessage()) {
          <p role="alert" class="text-xs text-destructive">
            {{ errorMessage() }}
          </p>
        }
      </form>

      <div footer class="flex gap-3 items-center">
        @if (!isEdit()) {
          <span class="text-[11px] text-muted-foreground mr-auto" data-test="save-continue-hint">
            Ctrl+Enter — сохранить и создать ещё
          </span>
        }
        <app-pi-button
          type="button"
          variant="default"
          [disabled]="submitting() || uploading()"
          (click)="onSubmit()"
        >
          {{ uploading() ? 'Загрузка фото…' : submitting() ? 'Сохранение…' : 'Сохранить' }}
        </app-pi-button>
        <app-pi-button type="button" variant="outline" (click)="onCancel()"> Отмена </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class MaterialFormDialogComponent implements OnDestroy {
  constructor() {
    this.loadSuppliers();
    this.loadCategories();
    this.loadKindLabels();
    this.loadUnits();
    if (this.data) {
      this.patchFromData(this.data);
    }
  }
  protected readonly DIMENSION_TYPES = DIMENSION_TYPES;
  protected readonly kindOptions = signal([
    { value: KIND_NULL_SENTINEL, label: '— не указан —' },
    ...dictionaryLabelOptions('materialKind')
      .filter((item) => KIND_KEYS.includes(item.key as MaterialKind))
      .map((item) => ({ value: item.key as MaterialKind, label: item.label })),
  ] as { value: typeof KIND_NULL_SENTINEL | MaterialKind; label: string }[]);

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(MaterialsService);
  private readonly orgs = inject(OrganizationsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly unitsService = inject(UnitsService);
  private readonly dictionaryLabels = inject(PiDictionaryLabelsService, { optional: true });
  private readonly photosService = inject(PhotosService);
  private readonly toast = inject(PiToastService);
  private readonly ref = inject<DialogRef<Result>>(PI_DIALOG_REF);
  private readonly data = inject<Material | null>(PI_DIALOG_DATA);
  private readonly dialog = inject(PiDialogService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isEdit = signal<boolean>(this.data != null);
  protected readonly submitting = signal<boolean>(false);
  protected readonly uploading = signal<boolean>(false);
  /** null = indeterminate while browser/proxy omits Content-Length. */
  protected readonly uploadProgress = signal<number | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly suppliers = signal<Organization[]>([]);
  protected readonly suppliersLoading = signal<boolean>(false);
  protected readonly suppliersError = signal<string | null>(null);
  protected readonly categories = signal<Category[]>([]);
  protected readonly categoriesLoading = signal(false);
  protected readonly categoriesError = signal<string | null>(null);
  protected readonly showNewCategory = signal(false);
  protected readonly newCategoryName = signal('');
  protected readonly creatingCategory = signal(false);
  protected readonly categoryItems = computed(() => [
    { id: '', label: '— без категории —' },
    ...this.categories().map((c) => ({ id: c._id, label: categoryPickerLabel(c) })),
  ]);
  protected readonly supplierItems = computed(() => [
    { id: '', label: '— не указан —' },
    ...this.suppliers().map((s) => ({
      id: s._id,
      label: `${s.name}${s.inn ? ' · ИНН ' + s.inn : ''}`,
    })),
  ]);
  /** Active units from GET /units/active (canonical `key` stored in Material.unit). */
  protected readonly units = signal<Unit[]>([]);
  protected readonly unitsLoading = signal<boolean>(false);
  protected readonly unitsError = signal<string | null>(null);

  /**
   * TZ-MATERIALS-302: when editing a material whose canonical `unit` key is
   * absent from the active units list (e.g. the unit was deactivated), render
   * the current key as a disabled fallback option so the select is never
   * silently blank and the payload keeps the canonical key.
   */
  protected unitFallback(): string | null {
    const v = this.form.get('unit')?.value as string | null | undefined;
    if (!v) return null;
    return this.units().some((u) => u.key === v) ? null : v;
  }
  protected readonly photos = signal<Photo[]>([]);
  protected readonly mainPhotoId = signal<string | null>(null);
  /** Photo IDs marked for deletion; applied on submit (atomic with save). */
  protected readonly pendingPhotoDeletions = signal<string[]>([]);
  /** Photo IDs uploaded in THIS session (not yet saved to material). Cleaned up on cancel/destroy. */
  private readonly newlyUploadedIds = signal<string[]>([]);
  /** Flag: was the form submitted? If false at destroy, clean up newlyUploadedIds. */
  private submitted = false;

  protected readonly form = this.fb.group({
    name: this.fb.control('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(256),
    ]),
    article: this.fb.control<string | null>(null, [Validators.required, Validators.maxLength(64)]),
    unit: this.fb.control('', [Validators.required, Validators.maxLength(32)]),
    sku: this.fb.control<string | null>(null),
    // TZ-CATALOG-301 / 316 — new fields on FE:
    // `materialKind` is a free string ('' sentinel = no kind selected).
    // `weightKg` is a number ≥ 0 (BE validates Min(0); FE mirrors).
    // The three reference strings match the BE Length(0, 256) cap so
    // pasting a too-long ГОСТ number is caught at save with a red
    // border + sr-only error rather than a round-trip 400.
    materialKind: this.fb.control<string>(KIND_NULL_SENTINEL),
    categoryId: this.fb.control<string | null>(null),
    weightKg: this.fb.control<number | null>(null, [Validators.min(0)]),
    assortment: this.fb.control<string | null>(null, [Validators.maxLength(256)]),
    standardRef: this.fb.control<string | null>(null, [Validators.maxLength(256)]),
    materialGrade: this.fb.control<string | null>(null, [Validators.maxLength(256)]),
    pricePerUnit: this.fb.control<number | null>(null, [Validators.min(0)]),
    supplierId: this.fb.control<string | null>(null),
    dimensions: this.fb.array<DimensionFormGroup>([]),
    description: this.fb.control<string | null>(null, [Validators.maxLength(2000)]),
    notes: this.fb.control<string | null>(null, [Validators.maxLength(2000)]),
  });

  get dimensionsArray(): FormArray<DimensionFormGroup> {
    return this.form.controls.dimensions as FormArray<DimensionFormGroup>;
  }

  /**
   * Cleanup orphan uploads on EVERY close path (Cancel button, X, Esc,
   * backdrop, or ref.close() after submit failure). The `submitted` flag
   * distinguishes "saved → keep" from "any other close → cleanup".
   * Without this hook, photos uploaded then dismissed via X/Esc/backdrop
   * remain in the DB as orphans with no Material.photoIds reference.
   */
  @HostListener('document:keydown', ['$event'])
  protected onDocumentKeydown(event: KeyboardEvent): void {
    if (!isSaveAndContinueKey(event)) return;
    event.preventDefault();
    this.onSubmit(true);
  }

  ngOnDestroy(): void {
    this.cleanupOrphanUploads();
  }

  protected onSupplierChange(supplierId: string): void {
    this.form.controls.supplierId.setValue(supplierId || null);
    this.form.controls.supplierId.markAsDirty();
  }

  protected openCreateSupplier(): void {
    const ref = this.dialog.open<Organization | null>(OrganizationFullEditorDialogComponent, {
      data: null,
      width: 'lg',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce<Organization | null>(ref, this.injector, (org) => {
      if (!org.type?.includes('supplier') || org.isActive === false) return;
      this.suppliers.update((list) =>
        list.some((s) => s._id === org._id) ? list : [...list, org],
      );
      this.onSupplierChange(org._id);
    });
  }

  private loadCategories(): void {
    this.categoriesLoading.set(true);
    this.categoriesService.list('material').subscribe((res) => {
      this.categoriesLoading.set(false);
      if (res.ok) {
        this.categories.set(res.data ?? []);
      } else {
        this.categories.set([]);
        this.categoriesError.set(extractErrorMessage(res.error));
      }
    });
  }

  protected onCategoryChange(categoryId: string): void {
    this.form.controls.categoryId.setValue(categoryId || null);
    this.form.controls.categoryId.markAsDirty();
  }

  protected openCreateCategory(): void {
    this.showNewCategory.set(true);
    this.newCategoryName.set('');
  }

  protected cancelNewCategory(): void {
    this.showNewCategory.set(false);
    this.newCategoryName.set('');
    this.creatingCategory.set(false);
  }

  protected saveNewCategory(): void {
    const name = this.newCategoryName().trim();
    if (!name || this.creatingCategory()) return;
    const stamp = Date.now().toString(36);
    const slug =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || `cat-${stamp}`;
    const skuPrefix =
      name
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '')
        .slice(0, 8) || 'CAT';
    this.creatingCategory.set(true);
    this.categoriesService
      .create({ name, slug: slug.slice(0, 64), skuPrefix, type: 'material', isActive: true })
      .subscribe((res) => {
        this.creatingCategory.set(false);
        if (!res.ok) {
          this.toast.error(extractErrorMessage(res.error));
          return;
        }
        const created = res.data;
        this.categories.update((list) =>
          list.some((c) => c._id === created._id) ? list : [...list, created],
        );
        this.onCategoryChange(created._id);
        this.cancelNewCategory();
        this.toast.success('Категория создана');
      });
  }

  private loadSuppliers(): void {
    this.suppliersLoading.set(true);
    this.suppliersError.set(null);
    this.orgs.list({ type: 'supplier', limit: 200 }).subscribe((res) => {
      this.suppliersLoading.set(false);
      if (res.ok) {
        // Backend list does not filter `isActive`; only offer active suppliers.
        this.suppliers.set((res.data.items ?? []).filter((o) => o.isActive !== false));
      } else {
        this.suppliers.set([]);
        this.suppliersError.set(extractErrorMessage(res.error));
      }
    });
  }

  /**
   * TZ-MATERIALS-302: units come from GET /units/active, never hardcoded.
   * The canonical `Unit.key` is stored in `Material.unit` (free-text FK
   * contract); label/symbol are display-only.
   */
  private loadKindLabels(): void {
    this.dictionaryLabels?.active('materialKind').subscribe((labels) => {
      const options: { value: typeof KIND_NULL_SENTINEL | MaterialKind; label: string }[] = [
        { value: KIND_NULL_SENTINEL, label: '— не указан —' },
        ...labels
          .filter((item) => KIND_KEYS.includes(item.key as MaterialKind))
          .map((item) => ({ value: item.key as MaterialKind, label: item.label })),
      ];
      if (options.length > 1) this.kindOptions.set(options);
    });
  }

  private loadUnits(): void {
    this.unitsLoading.set(true);
    this.unitsError.set(null);
    this.unitsService.listActive().subscribe((res) => {
      this.unitsLoading.set(false);
      if (res.ok) {
        this.units.set(res.data ?? []);
      } else {
        this.units.set([]);
        this.unitsError.set(extractErrorMessage(res.error));
      }
    });
  }

  private patchFromData(m: Material): void {
    this.form.patchValue({
      name: m.name,
      article: m.article ?? null,
      unit: m.unit,
      sku: m.sku ?? null,
      // TZ-CATALOG-301 / 316:
      //  - `materialKind`: server may send `null | undefined | ''` for
      //    legacy rows — we treat them all as "— не указан —"
      //    (KIND_NULL_SENTINEL), so the select is never blank and
      //    `onPayload()` correctly OMITS the field on save (server
      //    backfills `other` on its own).
      //  - `weightKg`: BE schema allows `undefined`; FE coerces to `null`
      //    so the number input's placeholder ("0.00") shows on edit.
      //  - assortment / standardRef / materialGrade: free-text, optional.
      materialKind:
        m.materialKind && (MATERIAL_KINDS as readonly string[]).includes(m.materialKind)
          ? m.materialKind
          : KIND_NULL_SENTINEL,
      categoryId: this.refId(m.categoryId),
      weightKg: m.weightKg ?? null,
      assortment: m.assortment ?? null,
      standardRef: m.standardRef ?? null,
      materialGrade: m.materialGrade ?? null,
      pricePerUnit: m.pricePerUnit ?? null,
      supplierId: m.supplierId ?? null,
      description: m.description ?? null,
      notes: m.notes ?? null,
    });
    // Dimensions — один type на материал (дубликаты из legacy срезаем)
    const seen = new Set<MaterialDimensionType>();
    for (const d of m.dimensions ?? []) {
      if (seen.has(d.type)) continue;
      seen.add(d.type);
      this.dimensionsArray.push(
        this.fb.group({
          type: this.fb.control<MaterialDimensionType>(d.type, Validators.required),
          value: this.fb.control<number>(d.value, [Validators.required, Validators.min(0)]),
          isImmutable: this.fb.control<boolean>(!!d.isImmutable),
        }) as DimensionFormGroup,
      );
    }
    // Photos
    const ids = m.photoIds ?? [];
    if (ids.length > 0) {
      this.photosService.list().subscribe((res) => {
        if (res.ok) {
          const all = res.data;
          const mine = all.filter((p) => ids.includes(p._id));
          this.photos.set(mine);
          // Backend may auto-populate `mainPhotoId` as a `Photo` object
          // instead of a string ID. Normalize to the string ID for the
          // radio-button check `p._id === mainPhotoId()`.
          const mainId =
            m.mainPhotoId && typeof m.mainPhotoId === 'object' ? m.mainPhotoId._id : m.mainPhotoId;
          this.mainPhotoId.set(mainId ?? mine[0]?._id ?? null);
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    }
  }

  // ─── Dimensions ───

  /** Можно добавить строку, только пока есть свободный тип (Д./Ш./В.…). */
  protected canAddDimension(): boolean {
    return this.nextUnusedDimensionType() != null;
  }

  /**
   * В select строки — текущий тип + ещё не занятые (нельзя выбрать второй «В.»).
   */
  protected dimensionTypeOptionsFor(rowIndex: number): typeof DIMENSION_TYPES {
    const current = this.dimensionsArray.at(rowIndex)?.controls.type.value;
    const usedElsewhere = new Set(
      this.dimensionsArray.controls
        .map((g, i) => (i === rowIndex ? null : g.controls.type.value))
        .filter((t): t is MaterialDimensionType => t != null),
    );
    return DIMENSION_TYPES.filter((t) => t.value === current || !usedElsewhere.has(t.value));
  }

  addDimension(): void {
    const type = this.nextUnusedDimensionType();
    if (!type) return;
    this.dimensionsArray.push(
      this.fb.group({
        type: this.fb.control<MaterialDimensionType>(type, Validators.required),
        value: this.fb.control<number>(0, [Validators.required, Validators.min(0)]),
        isImmutable: this.fb.control<boolean>(false),
      }) as DimensionFormGroup,
    );
  }

  /**
   * Следующий свободный тип в порядке Длина → … → Глубина.
   * Если все шесть заняты — null (седьмой ряд не создаём).
   */
  private nextUnusedDimensionType(): MaterialDimensionType | null {
    const used = new Set(this.dimensionsArray.controls.map((g) => g.controls.type.value));
    return DIMENSION_TYPES.find((t) => !used.has(t.value))?.value ?? null;
  }

  removeDimension(i: number): void {
    this.dimensionsArray.removeAt(i);
  }

  // ─── Photos ───

  onPhotoSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.onPhotoUpload(Array.from(input.files ?? []));
  }

  onPhotoUpload(files: File[]): void {
    if (files.length === 0) return;
    this.uploading.set(true);
    this.uploadProgress.set(null);
    uploadPhotosWithProgress(this.photosService, files, (percent) =>
      this.uploadProgress.set(percent),
    ).subscribe((results) => {
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
        if (!this.mainPhotoId()) {
          this.mainPhotoId.set(uploaded[0]._id);
        }
      }
      this.uploading.set(false);
      this.uploadProgress.set(null);
      if (failed.length > 0) {
        this.toast.error(
          `Не удалось загрузить: ${failed.join(', ')} (загружено ${uploaded.length})`,
        );
      } else {
        this.toast.success(`Загружено фото: ${uploaded.length}`);
      }
    });
  }

  setMainPhoto(id: string): void {
    this.mainPhotoId.set(id);
  }

  /**
   * Remove photo from form state. DEFER actual DELETE on the server
   * until `onSubmit` (collected in `pendingPhotoDeletions` signal)
   * so the Material.photoIds[] update is atomic with the material save.
   */
  removePhoto(id: string): void {
    this.photos.update((cur) => cur.filter((p) => p._id !== id));
    this.pendingPhotoDeletions.update((cur) => [...cur, id]);
    if (this.mainPhotoId() === id) {
      this.mainPhotoId.set(this.photos()[0]?._id ?? null);
    }
  }

  private applyPendingPhotoDeletions(): void {
    const pending = this.pendingPhotoDeletions();
    if (pending.length === 0) return;
    pending.forEach((id) => {
      this.photosService.remove(id).subscribe((res) => {
        if (!res.ok) {
          // best-effort: log via toast
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
    if (c.errors?.['minlength']) {
      return `Минимум ${c.errors['minlength'].requiredLength} символа`;
    }
    if (c.errors?.['maxlength']) {
      return `Максимум ${c.errors['maxlength'].requiredLength} символов`;
    }
    if (c.errors?.['min']) {
      return `Минимум ${c.errors['min'].min}`;
    }
    return 'Некорректное значение';
  }

  // ─── Submit ───

  protected onSubmit(saveAndContinue = false): void {
    if (this.submitting() || this.uploading()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const dimensionsRaw = (v.dimensions ?? []).map((d) => ({
      type: d.type,
      value: Number(d.value),
      isImmutable: !!d.isImmutable,
    }));
    // Один type на материал — защита от дублей в payload
    const seenTypes = new Set<string>();
    const dimensions = dimensionsRaw.filter((d) => {
      if (seenTypes.has(d.type)) return false;
      seenTypes.add(d.type);
      return true;
    });
    const photoIds = this.photos().map((p) => p._id);
    const mainPhotoId = this.mainPhotoId();

    const payload: Partial<Material> = {
      name: v.name,
      unit: v.unit,
    };
    payload.article = v.article?.trim() ?? '';
    if (v.sku) payload.sku = v.sku;
    // TZ-CATALOG-301 / 316 — new fields on FE;
    // empty-string sentinel → field omitted; non-empty → typed value.
    if (v.materialKind && v.materialKind !== KIND_NULL_SENTINEL) {
      payload.materialKind = v.materialKind as MaterialKind;
    }
    if (v.weightKg != null && String(v.weightKg) !== '') {
      const parsed = Number(v.weightKg);
      if (!Number.isNaN(parsed)) payload.weightKg = parsed;
    }
    if (v.assortment) payload.assortment = v.assortment;
    if (v.standardRef) payload.standardRef = v.standardRef;
    if (v.materialGrade) payload.materialGrade = v.materialGrade;
    if (v.pricePerUnit != null && String(v.pricePerUnit) !== '') {
      const parsed = Number(v.pricePerUnit);
      if (!Number.isNaN(parsed)) payload.pricePerUnit = parsed;
    }
    if (v.supplierId) payload.supplierId = v.supplierId;
    const categoryId = this.refId(v.categoryId);
    if (categoryId) payload.categoryId = categoryId;
    if (dimensions.length > 0) payload.dimensions = dimensions;
    if (photoIds.length > 0) payload.photoIds = photoIds;
    if (mainPhotoId) payload.mainPhotoId = mainPhotoId;
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
        // Atomic: after material save succeeds, apply pending photo deletions.
        this.applyPendingPhotoDeletions();
        if (saveAndContinue) {
          if (!this.isEdit()) this.resetForNextCreate();
          this.submitting.set(false);
          this.toast.success('Сохранено — можно создать следующий');
          return;
        }
        this.toast.success(this.isEdit() ? 'Материал обновлён' : 'Материал создан');
        this.ref.close(res.data);
      } else {
        this.errorMessage.set(extractErrorMessage(res.error));
        this.submitting.set(false);
      }
    });
  }

  private resetForNextCreate(): void {
    this.dimensionsArray.clear();
    this.form.reset({
      name: '',
      article: null,
      unit: '',
      sku: null,
      materialKind: KIND_NULL_SENTINEL,
      categoryId: null,
      weightKg: null,
      assortment: null,
      standardRef: null,
      materialGrade: null,
      pricePerUnit: null,
      supplierId: null,
      dimensions: [],
      description: null,
      notes: null,
    });
    this.photos.set([]);
    this.mainPhotoId.set(null);
    this.newlyUploadedIds.set([]);
    this.pendingPhotoDeletions.set([]);
    this.submitted = false;
    this.errorMessage.set(null);
    focusDialogField('[data-save-continue-first="true"]');
  }

  protected onCancel(): void {
    // Orphan cleanup runs in ngOnDestroy (single source of truth for all
    // close paths). ref.close(null) triggers destroy; cleanup will run there.
    this.ref.close(null);
  }

  /**
   * If the form was cancelled (or destroyed without submit), delete any
   * photos that were uploaded in this session — they have no material
   * reference and would otherwise leak on the server.
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

  private refId(value: unknown): string | null {
    if (value == null || value === '') return null;
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null && '_id' in value) {
      return this.refId((value as { _id: unknown })._id);
    }
    return null;
  }
}
