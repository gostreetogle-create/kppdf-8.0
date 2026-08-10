import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
  type ValidatorFn,
} from '@angular/forms';
import { PiDialogComponent } from '../dialog/pi-dialog.component';
import { ButtonComponent } from '../button/button.component';
import { FormFieldComponent } from '../form-field/form-field.component';
import { InputComponent } from '../input/input.component';
import { TextareaComponent } from '../textarea/textarea.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../dialog/dialog.tokens';
import type { DialogRef } from '../dialog/pi-dialog.service';
import { PiToastService } from '../toast';
import { extractErrorMessage } from '../../../core/silent-http';
import {
  ALLOWED_FIELD_KEYS,
  ENTITY_LABEL_RU,
  FORM_PROFILE_SIZES,
  FormProfilesService,
  LOCKED_REQUIRED,
  type FormProfileEntity,
  type FormProfileSize,
} from '../../services/form-profiles.service';
import {
  Product,
  ProductKind,
  ProductsService,
  ProductStatus,
} from '../../services/products.service';
import {
  ProductModule,
  ProductModulesService,
  type ProductModuleUpsertDto,
} from '../../services/pi-product-modules.service';
import { CategoriesService, type Category } from '../../services/categories.service';
import { controlKindFor, type QuickCreateControlKind } from './field-key-registry';
import { colSpanClass, controlMaxClass } from './field-capacity';
import { PiFormSectionComponent } from '../form-section';
import { PiPhotoDropzoneComponent } from '../photo';
import { PhotosService, type Photo } from '../../services/photos.service';
import { ProductBomPanelComponent } from '../../../pages/products/product-bom-panel.component';
import { PiOverflowSelectComponent } from '../overflow-select/pi-overflow-select.component';
import {
  dictionaryLabelOptions,
  PiDictionaryLabelsService,
} from '../../services/pi-dictionary-labels.service';
import { focusDialogField, isSaveAndContinueKey } from '../../util/dialog-save-and-continue';

/** Data injected into QuickCreate (create-only). */
export interface QuickCreateDialogData {
  entity: FormProfileEntity;
  /** Default M per audit D4 / TZ-DICT-316. */
  size?: FormProfileSize;
}

export type QuickCreateResult = Product | ProductModule | null;

const KIND_KEYS: readonly ProductKind[] = ['good', 'service', 'work'];

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'draft', label: 'Черновик' },
  { value: 'new', label: 'Новый' },
  { value: 'active', label: 'Активный' },
  { value: 'archived', label: 'Архив' },
];

const DIM_UNIT_OPTIONS = ['mm', 'cm', 'm'] as const;

/** TZ-UX-DIALOG-302 — prefer width over height; kind B from dialog-layout-canon. */
const SIZE_TO_WIDTH: Record<FormProfileSize, 'md' | 'lg' | 'xl'> = {
  S: 'md',
  M: 'lg',
  L: 'xl',
};

/**
 * TZ-DICT-316 — profile-driven QuickCreate (product | module).
 * FullEditor (product-form / module-form) stays for edit/detail.
 */
@Component({
  selector: 'app-quick-create-dialog',
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
    PiPhotoDropzoneComponent,
    ProductBomPanelComponent,
    PiOverflowSelectComponent,
  ],
  template: `
    <app-pi-dialog
      [title]="title()"
      variant="form"
      [width]="dialogWidth()"
      [maxWidth]="dialogMaxWidth()"
      data-test="quick-create-dialog"
    >
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="space-y-2 max-h-[min(70vh,calc(90vh-8rem))] overflow-y-auto min-h-0"
        data-test="quick-create-form"
      >
        <div
          class="flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Размер формы"
          data-test="size-switcher"
        >
          <span class="text-xs text-muted-foreground mr-1">Профиль</span>
          @for (sz of sizes; track sz) {
            <app-pi-button
              type="button"
              size="sm"
              [variant]="size() === sz ? 'default' : 'outline'"
              (click)="onSizeChange(sz)"
              [attr.data-test]="'size-' + sz"
              [attr.aria-pressed]="size() === sz"
            >
              {{ sz }}
            </app-pi-button>
          }
        </div>

        @if (createdProduct(); as created) {
          <app-pi-form-section
            title="Состав"
            headingId="qc-sec-composition"
            tone="neutral"
            data-test="qc-composition-section"
          >
            <p class="text-xs text-muted-foreground mb-3">
              Изделие создано. Состав можно добавить сейчас или позже в карточке изделия.
            </p>
            <app-product-bom-panel [productId]="created._id" data-test="qc-product-bom-panel" />
          </app-pi-form-section>
        } @else if (createdModule(); as created) {
          <app-pi-form-section
            title="Состав"
            headingId="qc-sec-composition"
            tone="neutral"
            data-test="qc-composition-section"
          >
            <p class="text-xs text-muted-foreground mb-3">
              Модуль создан. Состав можно добавить сейчас или позже в карточке модуля.
            </p>
            <app-product-bom-panel
              [productId]="created._id"
              rootKind="module"
              data-test="qc-module-bom-panel"
            />
          </app-pi-form-section>
        } @else if (loading()) {
          <p class="text-sm text-muted-foreground" data-test="qc-loading">Загрузка профиля…</p>
        } @else if (loadError()) {
          <div role="alert" class="space-y-2" data-test="qc-load-error">
            <p class="text-sm text-destructive">{{ loadError() }}</p>
            <app-pi-button type="button" variant="outline" size="sm" (click)="reloadProfile()">
              Повторить
            </app-pi-button>
          </div>
        } @else {
          <div class="space-y-3" data-test="qc-fields-sections">
            @if (basicKeys().length > 0) {
              <app-pi-form-section title="Основные данные" headingId="qc-sec-basics" tone="gold">
                <div [class]="fieldsGridClass()" data-test="qc-fields-grid-basics">
                  @for (key of basicKeys(); track key) {
                    <div [class]="fieldCellClass(key)" [attr.data-test]="'qc-cell-' + key">
                      @switch (kindOf(key)) {
                        @case ('select-kind') {
                          <app-pi-form-field
                            [label]="labelOf(key)"
                            [htmlFor]="'qc-' + key"
                            [required]="isRequired(key)"
                            [error]="errorFor(key)"
                          >
                            <select
                              [id]="'qc-' + key"
                              [formControlName]="key"
                              [class]="controlClass(key)"
                              [attr.data-test]="'qc-field-' + key"
                            >
                              @for (opt of kindOptions(); track opt.value) {
                                <option [value]="opt.value">{{ opt.label }}</option>
                              }
                            </select>
                          </app-pi-form-field>
                        }
                        @case ('select-status') {
                          <app-pi-form-field
                            [label]="labelOf(key)"
                            [htmlFor]="'qc-' + key"
                            [required]="isRequired(key)"
                          >
                            <select
                              [id]="'qc-' + key"
                              [formControlName]="key"
                              [class]="controlClass(key)"
                              [attr.data-test]="'qc-field-' + key"
                            >
                              @for (opt of statusOptions; track opt.value) {
                                <option [value]="opt.value">{{ opt.label }}</option>
                              }
                            </select>
                          </app-pi-form-field>
                        }
                        @case ('select-category') {
                          <app-pi-form-field [label]="labelOf(key)" [htmlFor]="'qc-' + key">
                            <app-pi-overflow-select
                              [items]="categoryItems()"
                              [value]="form.get(key)?.value ?? ''"
                              (valueChange)="onCategoryChange($event)"
                              searchable="auto"
                              placeholder="— без категории —"
                              ariaLabel="Категория"
                              [dataTest]="'qc-field-' + key"
                            />
                          </app-pi-form-field>
                        }
                        @case ('checkbox') {
                          <app-pi-form-field [label]="labelOf(key)" [htmlFor]="'qc-' + key">
                            <label
                              class="inline-flex items-center gap-2 h-8 px-control-x hairline rounded-sm cursor-pointer"
                            >
                              <input
                                [id]="'qc-' + key"
                                type="checkbox"
                                [formControlName]="key"
                                class="w-4 h-4"
                                [attr.data-test]="'qc-field-' + key"
                              />
                              <span class="text-sm">Доступен для заказов</span>
                            </label>
                          </app-pi-form-field>
                        }
                        @case ('dim-unit') {
                          <app-pi-form-field [label]="labelOf(key)" [htmlFor]="'qc-' + key">
                            <select
                              [id]="'qc-' + key"
                              [formControlName]="key"
                              [class]="controlClass(key)"
                              [attr.data-test]="'qc-field-' + key"
                            >
                              @for (u of dimUnitOptions; track u) {
                                <option [value]="u">{{ u }}</option>
                              }
                            </select>
                          </app-pi-form-field>
                        }
                        @case ('textarea') {
                          <app-pi-form-field [label]="labelOf(key)" [htmlFor]="'qc-' + key">
                            <app-pi-textarea
                              [id]="'qc-' + key"
                              [rows]="2"
                              size="sm"
                              customClass="min-h-0"
                              [formControlName]="key"
                              [attr.data-test]="'qc-field-' + key"
                            />
                          </app-pi-form-field>
                        }
                        @case ('number') {
                          <app-pi-form-field
                            [label]="labelOf(key)"
                            [htmlFor]="'qc-' + key"
                            [required]="isRequired(key)"
                            [error]="errorFor(key)"
                          >
                            <div [class]="controlMaxClassFor(key) || null">
                              <app-pi-input
                                [id]="'qc-' + key"
                                type="number"
                                size="sm"
                                [formControlName]="key"
                                [invalid]="hasError(key)"
                                [attr.data-test]="'qc-field-' + key"
                              />
                            </div>
                          </app-pi-form-field>
                        }
                        @default {
                          <app-pi-form-field
                            [label]="labelOf(key)"
                            [htmlFor]="'qc-' + key"
                            [required]="isRequired(key)"
                            [error]="errorFor(key)"
                          >
                            <div [class]="controlMaxClassFor(key) || null">
                              <app-pi-input
                                [id]="'qc-' + key"
                                size="sm"
                                [formControlName]="key"
                                [invalid]="hasError(key)"
                                [attr.data-test]="'qc-field-' + key"
                              />
                            </div>
                          </app-pi-form-field>
                        }
                      }
                    </div>
                  }
                </div>
              </app-pi-form-section>
            }
            @if (dimensionKeys().length > 0) {
              <app-pi-form-section title="Габариты" headingId="qc-sec-dimensions" tone="dimensions">
                <div [class]="fieldsGridClass()" data-test="qc-fields-grid-dimensions">
                  @for (key of dimensionKeys(); track key) {
                    <div [class]="fieldCellClass(key)" [attr.data-test]="'qc-cell-' + key">
                      @switch (kindOf(key)) {
                        @case ('number') {
                          <app-pi-form-field
                            [label]="labelOf(key)"
                            [htmlFor]="'qc-' + key"
                            [required]="isRequired(key)"
                            [error]="errorFor(key)"
                          >
                            <div [class]="controlMaxClassFor(key) || null">
                              <app-pi-input
                                [id]="'qc-' + key"
                                type="number"
                                size="sm"
                                [formControlName]="key"
                                [invalid]="hasError(key)"
                                [attr.data-test]="'qc-field-' + key"
                              />
                            </div>
                          </app-pi-form-field>
                        }
                        @case ('dim-unit') {
                          <app-pi-form-field [label]="labelOf(key)" [htmlFor]="'qc-' + key">
                            <select
                              [id]="'qc-' + key"
                              [formControlName]="key"
                              [class]="controlClass(key)"
                              [attr.data-test]="'qc-field-' + key"
                            >
                              @for (u of dimUnitOptions; track u) {
                                <option [value]="u">{{ u }}</option>
                              }
                            </select>
                          </app-pi-form-field>
                        }
                        @default {
                          <app-pi-form-field
                            [label]="labelOf(key)"
                            [htmlFor]="'qc-' + key"
                            [required]="isRequired(key)"
                            [error]="errorFor(key)"
                          >
                            <div [class]="controlMaxClassFor(key) || null">
                              <app-pi-input
                                [id]="'qc-' + key"
                                size="sm"
                                [formControlName]="key"
                                [invalid]="hasError(key)"
                                [attr.data-test]="'qc-field-' + key"
                              />
                            </div>
                          </app-pi-form-field>
                        }
                      }
                    </div>
                  }
                </div>
              </app-pi-form-section>
            }
            @if (extraKeys().length > 0) {
              <app-pi-form-section title="Дополнительно" headingId="qc-sec-extra" tone="neutral">
                <div [class]="fieldsGridClass()" data-test="qc-fields-grid-extra">
                  @for (key of extraKeys(); track key) {
                    <div [class]="fieldCellClass(key)" [attr.data-test]="'qc-cell-' + key">
                      @switch (kindOf(key)) {
                        @case ('textarea') {
                          <app-pi-form-field [label]="labelOf(key)" [htmlFor]="'qc-' + key">
                            <app-pi-textarea
                              [id]="'qc-' + key"
                              [rows]="2"
                              size="sm"
                              customClass="min-h-0"
                              [formControlName]="key"
                              [attr.data-test]="'qc-field-' + key"
                            />
                          </app-pi-form-field>
                        }
                        @default {
                          <app-pi-form-field
                            [label]="labelOf(key)"
                            [htmlFor]="'qc-' + key"
                            [required]="isRequired(key)"
                            [error]="errorFor(key)"
                          >
                            <div [class]="controlMaxClassFor(key) || null">
                              <app-pi-input
                                [id]="'qc-' + key"
                                size="sm"
                                [formControlName]="key"
                                [invalid]="hasError(key)"
                                [attr.data-test]="'qc-field-' + key"
                              />
                            </div>
                          </app-pi-form-field>
                        }
                      }
                    </div>
                  }
                </div>
              </app-pi-form-section>
            }
            @if (isPhotoCapable()) {
              <app-pi-form-section title="Дополнительно" headingId="qc-sec-photo" tone="neutral">
                <p class="eyebrow">Фото</p>
                <app-pi-photo-dropzone
                  [initialPhotos]="photos()"
                  (photosChange)="onPhotosChange($event)"
                  (uploadedPhotoIdsChange)="onUploadedPhotoIdsChange($event)"
                  (uploadStateChange)="onPhotoUploadState($event)"
                />
              </app-pi-form-section>
            }
          </div>
        }

        @if (createdProduct() || createdModule()) {
          <p class="text-xs text-muted-foreground" data-test="qc-created-hint">
            Состав опционален — нажмите «Готово», когда закончите.
          </p>
        } @else if (formError()) {
          <p role="alert" class="text-xs text-destructive" data-test="qc-form-error">
            {{ formError() }}
          </p>
        }
      </form>

      <div footer class="flex gap-3">
        @if (createdProduct() || createdModule()) {
          <app-pi-button variant="default" type="button" (click)="onDone()" data-test="done-button">
            Готово
          </app-pi-button>
        } @else {
          <span class="text-[11px] text-muted-foreground mr-auto" data-test="save-continue-hint">
            Ctrl+Enter — сохранить и создать ещё
          </span>
          <app-pi-button
            variant="ghost"
            type="button"
            (click)="onCancel()"
            data-test="cancel-button"
          >
            Отмена
          </app-pi-button>
          <app-pi-button
            variant="default"
            type="button"
            [disabled]="
              loading() || !!loadError() || form.invalid || submitting() || photosUploading()
            "
            (click)="onSubmit()"
            data-test="submit-button"
          >
            {{ submitting() ? 'Создание…' : 'Создать' }}
          </app-pi-button>
        }
      </div>
    </app-pi-dialog>
  `,
})
export class QuickCreateDialogComponent implements OnDestroy {
  protected readonly ref = inject<DialogRef<QuickCreateResult>>(PI_DIALOG_REF);
  private readonly data = inject<QuickCreateDialogData>(PI_DIALOG_DATA);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly profiles = inject(FormProfilesService);
  private readonly products = inject(ProductsService);
  private readonly modules = inject(ProductModulesService);
  private readonly categoriesSvc = inject(CategoriesService);
  private readonly toast = inject(PiToastService);
  private readonly photosService = inject(PhotosService);
  private readonly dictionaryLabels = inject(PiDictionaryLabelsService, { optional: true });

  protected readonly entity: FormProfileEntity = this.data.entity;
  protected readonly sizes = FORM_PROFILE_SIZES;
  protected readonly kindOptions = signal(
    dictionaryLabelOptions('productKind')
      .filter((item) => KIND_KEYS.includes(item.key as ProductKind))
      .map((item) => ({ value: item.key as ProductKind, label: item.label })),
  );
  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly dimUnitOptions = DIM_UNIT_OPTIONS;

  protected readonly size = signal<FormProfileSize>(this.data.size ?? 'M');
  protected readonly loading = signal(true);
  protected readonly loadError = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly visibleKeys = signal<string[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly categoryItems = computed(() => [
    { id: '', label: '— без категории —' },
    ...this.categories().map((c) => ({ id: c._id, label: c.name })),
  ]);
  protected readonly photos = signal<Photo[]>([]);
  protected readonly uploadedPhotoIds = signal<string[]>([]);
  protected readonly photosUploading = signal(false);
  protected readonly createdProduct = signal<Product | null>(null);
  /** TZ-UX-FORM-306: module L stays open with BomPanel after create. */
  protected readonly createdModule = signal<ProductModule | null>(null);
  private submitted = false;

  protected readonly isPhotoCapable = computed(
    () => this.entity === 'product' && this.size() === 'L',
  );

  protected onCategoryChange(categoryId: string): void {
    this.form.get('categoryId')?.setValue(categoryId);
    this.form.get('categoryId')?.markAsDirty();
  }

  private readonly basicFieldKeys = new Set([
    'name',
    'kind',
    'unit',
    'sku',
    'article',
    'listPrice',
    'categoryId',
    'isActive',
    'status',
  ]);
  private readonly dimensionFieldKeys = new Set([
    'dimLength',
    'dimWidth',
    'dimHeight',
    'dimUnit',
    'width',
    'height',
    'depth',
    'weightKg',
    'weight',
  ]);

  protected readonly basicKeys = computed(() =>
    this.visibleKeys().filter((key) => this.basicFieldKeys.has(key)),
  );
  protected readonly dimensionKeys = computed(() =>
    this.visibleKeys().filter((key) => this.dimensionFieldKeys.has(key)),
  );
  protected readonly extraKeys = computed(() =>
    this.visibleKeys().filter(
      (key) => !this.basicFieldKeys.has(key) && !this.dimensionFieldKeys.has(key),
    ),
  );

  protected readonly title = computed(() => `Быстрое создание: ${ENTITY_LABEL_RU[this.entity]}`);
  protected readonly dialogWidth = computed(() => SIZE_TO_WIDTH[this.size()]);
  protected readonly dialogMaxWidth = computed(() =>
    this.createdProduct() || this.createdModule() ? 'min(1100px, calc(100vw - 2rem))' : null,
  );
  protected readonly compositionCapable = computed(
    () => (this.entity === 'product' || this.entity === 'module') && this.size() === 'L',
  );

  /**
   * M/L (or ≥4 visible keys) → 12-col capacity packing (TZ-UX-FORM-301).
   * S stays single column; capacity spans ignored below md.
   */
  protected readonly useCapacityGrid = computed(() => {
    const sz = this.size();
    // S is intentionally a single-column quick form, regardless of how many
    // locked fields the profile contributes.
    return sz === 'M' || sz === 'L';
  });

  /** @deprecated alias for tests / callers expecting useTwoCol */
  protected readonly useTwoCol = this.useCapacityGrid;

  protected readonly fieldsGridClass = computed(() =>
    this.useCapacityGrid()
      ? 'grid grid-cols-1 md:grid-cols-12 gap-x-3 gap-y-2'
      : 'grid grid-cols-1 gap-y-2',
  );

  protected fieldCellClass(key: string): string {
    return colSpanClass(key, this.useCapacityGrid());
  }

  protected controlClass(key: string): string {
    const max = controlMaxClass(key, this.useCapacityGrid());
    // Compact control height in QuickCreate (formDensity) — h-8 vs default h-10.
    const base = 'pi-input w-full h-8 text-xs py-1';
    return max ? `${base} ${max}` : base;
  }

  protected controlMaxClassFor(key: string): string {
    return controlMaxClass(key, this.useCapacityGrid());
  }

  protected readonly form: FormGroup = this.buildForm(this.entity);

  constructor() {
    this.loadKindLabels();
    this.reloadProfile();
    if (this.entity === 'product') {
      this.categoriesSvc.list('product').subscribe((res) => {
        if (res.ok) {
          this.categories.set((res.data ?? []).filter((c) => c.isActive !== false));
        }
      });
    }
  }

  private loadKindLabels(): void {
    if (this.entity !== 'product') return;
    this.dictionaryLabels?.active('productKind').subscribe((labels) => {
      const options = labels
        .filter((item) => KIND_KEYS.includes(item.key as ProductKind))
        .map((item) => ({ value: item.key as ProductKind, label: item.label }));
      if (options.length > 0) this.kindOptions.set(options);
    });
  }

  protected kindOf(key: string): QuickCreateControlKind {
    return controlKindFor(key);
  }

  protected labelOf(key: string): string {
    return this.profiles.labelRu(key);
  }

  protected isRequired(key: string): boolean {
    return LOCKED_REQUIRED[this.entity].includes(key);
  }

  protected hasError(key: string): boolean {
    const c = this.form.get(key);
    return !!(c && c.invalid && c.touched);
  }

  protected errorFor(key: string): string {
    if (!this.hasError(key)) return '';
    const c = this.form.get(key);
    if (c?.errors?.['required']) return 'Обязательное поле';
    if (c?.errors?.['maxlength']) return 'Слишком длинное значение';
    return 'Некорректное значение';
  }

  protected onSizeChange(sz: FormProfileSize): void {
    if (this.size() === sz) return;
    this.size.set(sz);
    this.reloadProfile();
  }

  protected reloadProfile(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.formError.set(null);
    this.profiles.getOne(this.entity, this.size()).subscribe((result) => {
      this.loading.set(false);
      if (result.ok) {
        const keys = this.ensureLocked(result.data.visibleFieldKeys).filter((k) =>
          ALLOWED_FIELD_KEYS[this.entity].includes(k),
        );
        this.visibleKeys.set(keys);
        this.syncRequiredValidators(keys);
      } else {
        this.visibleKeys.set(this.ensureLocked([]));
        this.loadError.set(
          extractErrorMessage(result.error) || 'Не удалось загрузить профиль. Нажмите «Повторить».',
        );
      }
    });
  }

  protected onPhotosChange(photos: Photo[]): void {
    this.photos.set(photos);
  }

  protected onUploadedPhotoIdsChange(ids: string[]): void {
    this.uploadedPhotoIds.set(ids);
  }

  ngOnDestroy(): void {
    if (this.submitted) return;
    this.uploadedPhotoIds().forEach((id) => this.photosService.remove(id).subscribe());
  }

  protected onPhotoUploadState(uploading: boolean): void {
    this.photosUploading.set(uploading);
  }

  @HostListener('document:keydown', ['$event'])
  protected onDocumentKeydown(event: KeyboardEvent): void {
    if (!isSaveAndContinueKey(event)) return;
    event.preventDefault();
    this.onSubmit(true);
  }

  protected onSubmit(saveAndContinue = false): void {
    if (this.submitting() || this.loading() || this.loadError() || this.photosUploading()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.formError.set(null);

    if (this.entity === 'product') {
      this.products.create(this.buildProductPayload()).subscribe((res) => {
        this.submitting.set(false);
        if (res.ok) {
          this.submitted = true;
          if (saveAndContinue) {
            this.resetForNextCreate();
            this.toast.success('Сохранено — можно создать следующий');
            return;
          }
          this.toast.success('Продукт создан');
          if (this.compositionCapable() && res.data) {
            this.createdProduct.set(res.data);
          } else {
            this.ref.close(res.data ?? null);
          }
        } else {
          const msg = extractErrorMessage(res.error);
          this.formError.set(msg);
          this.toast.error(msg);
        }
      });
    } else {
      this.modules.create(this.buildModulePayload()).subscribe((res) => {
        this.submitting.set(false);
        if (res.ok) {
          this.submitted = true;
          if (saveAndContinue) {
            this.resetForNextCreate();
            this.toast.success('Сохранено — можно создать следующий');
            return;
          }
          this.toast.success('Модуль создан');
          if (this.compositionCapable() && res.data) {
            this.createdModule.set(res.data);
          } else {
            this.ref.close(res.data ?? null);
          }
        } else {
          const msg = extractErrorMessage(res.error);
          this.formError.set(msg);
          this.toast.error(msg);
        }
      });
    }
  }

  protected onDone(): void {
    this.ref.close(this.createdProduct() ?? this.createdModule());
  }

  private resetForNextCreate(): void {
    if (this.entity === 'product') {
      this.form.reset({
        name: '',
        kind: 'good',
        unit: 'шт',
        sku: '',
        listPrice: null,
        categoryId: '',
        isActive: true,
        status: 'draft',
        dimLength: null,
        dimWidth: null,
        dimHeight: null,
        dimUnit: 'mm',
        weightKg: null,
        description: '',
        notes: '',
      });
    } else {
      this.form.reset({
        name: '',
        article: '',
        width: null,
        height: null,
        depth: null,
        unit: 'мм',
        weight: null,
        notes: '',
      });
    }
    this.photos.set([]);
    this.uploadedPhotoIds.set([]);
    this.createdProduct.set(null);
    this.createdModule.set(null);
    this.formError.set(null);
    this.submitted = false;
    focusDialogField(
      this.entity === 'product' ? '[data-test="qc-field-sku"]' : '[data-test="qc-field-name"]',
    );
  }

  protected onCancel(): void {
    this.ref.close(null);
  }

  private ensureLocked(keys: string[]): string[] {
    const set = new Set(keys);
    for (const locked of LOCKED_REQUIRED[this.entity]) {
      set.add(locked);
    }
    // Stable order = allowlist order
    return ALLOWED_FIELD_KEYS[this.entity].filter((k) => set.has(k));
  }

  private syncRequiredValidators(visible: string[]): void {
    for (const key of ALLOWED_FIELD_KEYS[this.entity]) {
      const ctrl = this.form.get(key);
      if (!ctrl) continue;
      const extra = this.extraValidators(key);
      if (LOCKED_REQUIRED[this.entity].includes(key) && visible.includes(key)) {
        ctrl.setValidators([Validators.required, ...extra]);
      } else {
        ctrl.setValidators(extra.length ? extra : null);
      }
      ctrl.updateValueAndValidity({ emitEvent: false });
    }
  }

  private extraValidators(key: string): ValidatorFn[] {
    if (key === 'name') return [Validators.maxLength(200)];
    if (key === 'unit' && this.entity === 'product') return [Validators.maxLength(16)];
    if (key === 'sku' || key === 'article') return [Validators.maxLength(64)];
    return [];
  }

  private buildForm(entity: FormProfileEntity): FormGroup {
    if (entity === 'product') {
      return this.fb.group({
        name: this.fb.control('', [Validators.maxLength(200)]),
        kind: this.fb.control<ProductKind>('good', [Validators.required]),
        unit: this.fb.control('шт', [Validators.required, Validators.maxLength(16)]),
        sku: this.fb.control(''),
        listPrice: this.fb.control<number | null>(null),
        categoryId: this.fb.control<string>(''),
        isActive: this.fb.control(true),
        status: this.fb.control<ProductStatus>('draft'),
        dimLength: this.fb.control<number | null>(null),
        dimWidth: this.fb.control<number | null>(null),
        dimHeight: this.fb.control<number | null>(null),
        dimUnit: this.fb.control<string>('mm'),
        weightKg: this.fb.control<number | null>(null),
        description: this.fb.control(''),
        notes: this.fb.control(''),
      });
    }
    return this.fb.group({
      name: this.fb.control('', [Validators.required, Validators.maxLength(200)]),
      article: this.fb.control(''),
      width: this.fb.control<number | null>(null),
      height: this.fb.control<number | null>(null),
      depth: this.fb.control<number | null>(null),
      unit: this.fb.control('мм'),
      weight: this.fb.control<number | null>(null),
      notes: this.fb.control(''),
    });
  }

  private visibleSet(): Set<string> {
    return new Set(this.visibleKeys());
  }

  private buildProductPayload(): Partial<Product> {
    const v = this.form.getRawValue() as Record<string, unknown>;
    const vis = this.visibleSet();
    const payload: Partial<Product> = {
      name: String(v['name'] ?? ''),
      kind: v['kind'] as ProductKind,
      unit: String(v['unit'] ?? ''),
    };
    if (vis.has('sku') && v['sku']) payload.sku = String(v['sku']);
    if (vis.has('listPrice') && v['listPrice'] != null && v['listPrice'] !== '') {
      payload.listPrice = Number(v['listPrice']);
    }
    if (vis.has('categoryId') && v['categoryId']) {
      payload.categoryId = String(v['categoryId']);
    }
    if (vis.has('isActive')) payload.isActive = !!v['isActive'];
    if (vis.has('status') && v['status']) payload.status = v['status'] as ProductStatus;
    if (vis.has('weightKg') && v['weightKg'] != null && v['weightKg'] !== '') {
      payload.weightKg = Number(v['weightKg']);
    }
    if (vis.has('description') && v['description']) {
      payload.description = String(v['description']);
    }
    if (vis.has('notes') && v['notes']) payload.notes = String(v['notes']);
    if (this.isPhotoCapable() && this.photos().length > 0) {
      payload.photoIds = this.photos().map((photo) => photo._id);
    }

    const hasDim =
      (vis.has('dimLength') && v['dimLength'] != null && v['dimLength'] !== '') ||
      (vis.has('dimWidth') && v['dimWidth'] != null && v['dimWidth'] !== '') ||
      (vis.has('dimHeight') && v['dimHeight'] != null && v['dimHeight'] !== '');
    if (hasDim) {
      payload.dimensions = {
        ...(vis.has('dimLength') && v['dimLength'] != null
          ? { length: Number(v['dimLength']) }
          : {}),
        ...(vis.has('dimWidth') && v['dimWidth'] != null ? { width: Number(v['dimWidth']) } : {}),
        ...(vis.has('dimHeight') && v['dimHeight'] != null
          ? { height: Number(v['dimHeight']) }
          : {}),
        unit: vis.has('dimUnit') ? String(v['dimUnit'] ?? 'mm') : 'mm',
      };
    }
    return payload;
  }

  private buildModulePayload(): ProductModuleUpsertDto {
    const v = this.form.getRawValue() as Record<string, unknown>;
    const vis = this.visibleSet();
    const payload: ProductModuleUpsertDto = {
      name: String(v['name'] ?? ''),
      article: vis.has('article') ? String(v['article'] ?? '').trim() : '',
    };
    if (vis.has('weight') && v['weight'] != null && v['weight'] !== '') {
      payload.weight = Number(v['weight']);
    }
    // notes: allowlist L — FullEditor also keeps control but BE upsert omits notes.
    const hasDim =
      (vis.has('width') && v['width'] != null && v['width'] !== '') ||
      (vis.has('height') && v['height'] != null && v['height'] !== '') ||
      (vis.has('depth') && v['depth'] != null && v['depth'] !== '') ||
      (vis.has('unit') && !!v['unit']);
    if (hasDim) {
      payload.dimensions = {
        ...(vis.has('width') && v['width'] != null ? { width: Number(v['width']) } : {}),
        ...(vis.has('height') && v['height'] != null ? { height: Number(v['height']) } : {}),
        ...(vis.has('depth') && v['depth'] != null ? { depth: Number(v['depth']) } : {}),
        ...(vis.has('unit') && v['unit'] ? { unit: String(v['unit']) } : {}),
      };
    }
    return payload;
  }

  /** Expose FormControl for template typecheck helpers if needed. */
  protected ctrl(key: string): FormControl | null {
    return this.form.get(key) as FormControl | null;
  }
}
