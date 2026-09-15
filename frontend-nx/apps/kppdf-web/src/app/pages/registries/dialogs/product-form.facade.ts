/**
 * TZ-NX-REGISTRY-FORMS-FACADE — domain facade for `ProductFormDialogComponent`.
 *
 * Owns: form/catalog/photo signals and every load/submit/payload method —
 * moved as-is from the dialog. `PI_DIALOG_DATA` / `PI_DIALOG_REF` are DI
 * tokens (not `@Input()`s), so this facade — provided in the same dialog's
 * `providers` array — injects them directly (same pattern as
 * `RoleFormFacade`/`MaterialFormFacade`/`ModuleFormFacade`). `@ViewChild`s
 * (`formEl`, `compositionBlock`) stay on the component; the DOM-focus side
 * effects from `onSubmit()` and `ngAfterViewInit()` are bridged via a
 * lookup method / callback parameter.
 */
import { DestroyRef, Injectable, Injector, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  PiCategoriesService,
  PiProductsService,
  PiPhotosService,
  PiUnitsService,
  type Category,
  type CreateProductPayload,
  type ProductDetail,
  type ProductKind,
  type ProductStatus,
  type PhotoFrame,
  type Unit,
} from '@kppdf/data-access';
import { normalizePhotoFrame, photoFrameOf, PiPhotoDropzoneComponent, type PiPhotoItem } from '@kppdf/ui/photo';
import { PiDialogService, PI_DIALOG_DATA, PI_DIALOG_REF } from '@kppdf/ui/dialog';
import type { DialogRef } from '@kppdf/ui/dialog';
import { extractErrorMessage } from '@kppdf/util-http';
import { confirmDirtyClose } from '@kppdf/features/composition';
import { onDialogCloseOnce } from '../../on-dialog-close-once';
import { CategoryFormDialogComponent, type CategoryFormDialogData } from './category-form-dialog.component';
import type { ProductFormDialogData } from './product-form-dialog.component';

export const KIND_OPTIONS: { value: ProductKind; label: string }[] = [
  { value: 'good', label: 'Товар' },
  { value: 'service', label: 'Услуга' },
  { value: 'work', label: 'Работа' },
];

export const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'draft', label: 'Черновик' },
  { value: 'new', label: 'Новый' },
  { value: 'active', label: 'Активный' },
  { value: 'archived', label: 'Архив' },
];

@Injectable()
export class ProductFormFacade {
  readonly kindOptions = KIND_OPTIONS;
  readonly statusOptions = STATUS_OPTIONS;

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly productsService = inject(PiProductsService);
  private readonly photosService = inject(PiPhotosService);
  private readonly unitsService = inject(PiUnitsService);
  private readonly categoriesService = inject(PiCategoriesService);
  readonly data = inject<ProductFormDialogData>(PI_DIALOG_DATA);
  private readonly ref = inject<DialogRef<ProductDetail | null | undefined>>(PI_DIALOG_REF);
  private readonly dialog = inject(PiDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly savedId = signal<string | null>(null);
  readonly focusComposition = signal(!!this.data.focusComposition);
  readonly units = signal<Unit[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly mode = signal<'create' | 'edit'>(this.data.mode);
  readonly productEntity = signal<ProductDetail | undefined>(this.data.product);

  /** WAVE-NX-CATALOG-PHOTOS P1: локальное состояние фото; write — только на Save. */
  readonly photoItems = signal<PiPhotoItem[]>([]);
  readonly mainPhotoId = signal<string | null>(null);
  readonly photosUploading = signal(false);
  readonly photoError = signal<string | null>(null);
  /** Загруженные, но ещё не сохранённые на entity id — удаляются через API при cancel-сценарии не требуются. */
  private readonly pendingPhotoIds = signal<Set<string>>(new Set());

  readonly dialogTitle = computed(() =>
    this.mode() === 'edit' ? 'Редактировать изделие' : 'Создать изделие',
  );

  readonly form = this.fb.group({
    name: this.fb.control('', [Validators.maxLength(256)]),
    sku: this.fb.control('', [Validators.required, Validators.maxLength(64)]),
    kind: this.fb.control<ProductKind>('good', Validators.required),
    unit: this.fb.control('', [Validators.required, Validators.maxLength(16)]),
    status: this.fb.control<ProductStatus>('new'),
    listPrice: this.fb.control<number | null>(null),
    categoryId: this.fb.control('', Validators.required),
    weightKg: this.fb.control<number | null>(null),
    description: this.fb.control(''),
    notes: this.fb.control(''),
  });

  constructor() {
    void this.loadUnits();
    void this.loadCategories();
    if (this.data.product) {
      this.savedId.set(this.data.product._id);
      this.patchProduct(this.data.product);
    }
  }

  onCancel(): void {
    confirmDirtyClose(
      this.dialog,
      this.destroyRef,
      this.injector,
      () => this.form.dirty,
      () => this.ref.close(this.productEntity() ?? undefined),
    );
  }

  async onSubmit(onInvalid?: () => void): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set(this.buildInvalidMessage());
      onInvalid?.();
      return;
    }
    const payload = this.buildPayload();
    this.submitting.set(true);
    this.errorMessage.set(null);
    const existing = this.productEntity();
    const res =
      this.mode() === 'edit' && existing
        ? await firstValueFrom(this.productsService.update(existing._id, payload))
        : await firstValueFrom(this.productsService.create(payload));
    this.submitting.set(false);
    if (!res.ok) {
      this.errorMessage.set(extractErrorMessage(res.error));
      return;
    }
    this.savedId.set(res.data._id);
    this.productEntity.set(res.data);
    this.mode.set('edit');
    this.form.markAsPristine();
    if (this.data.mode === 'edit') {
      this.ref.close(res.data);
    }
  }

  /** Order matches the form layout — first invalid one gets focus/scroll. */
  private static readonly REQUIRED_FIELDS: ReadonlyArray<{
    key: 'sku' | 'kind' | 'unit' | 'categoryId';
    label: string;
    htmlId: string;
  }> = [
    { key: 'sku', label: 'Артикул', htmlId: 'prod-sku' },
    { key: 'kind', label: 'Тип', htmlId: 'prod-kind' },
    { key: 'unit', label: 'Единица', htmlId: 'prod-unit' },
    { key: 'categoryId', label: 'Категория', htmlId: 'prod-category' },
  ];

  private buildInvalidMessage(): string {
    const missing = ProductFormFacade.REQUIRED_FIELDS.filter(
      (f) => this.form.controls[f.key].invalid,
    ).map((f) => f.label);
    return missing.length
      ? `Заполните обязательные поля: ${missing.join(', ')}`
      : 'Проверьте поля формы — есть некорректные значения.';
  }

  /** Html id of the first invalid required field, for the component's DOM focus/scroll. */
  firstInvalidFieldHtmlId(): string | undefined {
    return ProductFormFacade.REQUIRED_FIELDS.find((f) => this.form.controls[f.key].invalid)?.htmlId;
  }

  /** `app-pi-form-field [error]` hint for a required control, shown once touched. */
  fieldError(key: 'sku' | 'kind' | 'unit' | 'categoryId'): string | null {
    const control = this.form.controls[key];
    return control.invalid && control.touched ? 'Обязательное поле' : null;
  }

  private async loadUnits(): Promise<void> {
    const res = await firstValueFrom(this.unitsService.list({ limit: 100, isActive: true }));
    if (res.ok) this.units.set(res.data.items.filter((u) => u.isActive));
  }

  private async loadCategories(): Promise<void> {
    const res = await firstValueFrom(this.categoriesService.list({ type: 'product' }));
    if (res.ok) this.categories.set(res.data.filter((c) => c.isActive));
  }

  /** ШАГ 2 — nested create, same pattern as `supply-request-form-dialog.openCreateMaterial`. */
  openCreateCategory(): void {
    const ref = this.dialog.open<Category | undefined>(CategoryFormDialogComponent, {
      data: {
        mode: 'create',
        category: null,
        categories: this.categories(),
        lockType: 'product',
      } satisfies CategoryFormDialogData,
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (category) => {
      if (!category) return;
      this.categories.update((list) => [...list, category]);
      this.form.controls.categoryId.setValue(category._id);
      this.form.markAsDirty();
    });
  }

  /** P1 write-path: upload → append id, main = first when empty. */
  async onPhotosSelected(files: File[]): Promise<void> {
    if (files.length === 0 || this.photosUploading()) return;
    this.photosUploading.set(true);
    this.photoError.set(null);
    const uploaded: PiPhotoItem[] = [];
    for (const file of files) {
      const res = await firstValueFrom(this.photosService.upload(file));
      if (!res.ok) {
        this.photoError.set(extractErrorMessage(res.error));
        break;
      }
      uploaded.push(res.data);
      this.pendingPhotoIds().add(res.data._id);
    }
    if (uploaded.length > 0) {
      this.photoItems.update((list) => [...list, ...uploaded]);
      if (this.mainPhotoId() === null) {
        this.mainPhotoId.set(uploaded[0]._id);
      }
      this.form.markAsDirty();
    }
    this.photosUploading.set(false);
  }

  onPhotoRemove(id: string): void {
    this.photoItems.update((list) => list.filter((p) => p._id !== id));
    if (this.mainPhotoId() === id) {
      const rest = this.photoItems();
      this.mainPhotoId.set(rest.length > 0 ? rest[0]._id : null);
    }
    this.pendingPhotoIds().delete(id);
    void this.photosService.remove(id).subscribe({
      error: () => {
        /* silent: entity Save всё равно уберёт ссылку (B-PHOTO) */
      },
    });
    this.form.markAsDirty();
  }

  onPhotoMainChanged(id: string | null): void {
    this.mainPhotoId.set(id);
    this.form.markAsDirty();
  }

  async onPhotoFrameSave(event: { id: string; frame: Partial<PhotoFrame> }): Promise<void> {
    this.photoError.set(null);
    const res = await firstValueFrom(this.photosService.updateFrame(event.id, event.frame));
    if (!res.ok) {
      this.photoError.set(extractErrorMessage(res.error));
      return;
    }
    const savedFrame = res.data.frame ?? normalizePhotoFrame({
      ...this.photoItems().find((photo) => photo._id === event.id)?.frame,
      ...event.frame,
    });
    this.photoItems.update((list) =>
      list.map((photo) => (photo._id === event.id ? { ...photo, frame: savedFrame } : photo)),
    );
  }

  onPhotoInvalidType(): void {
    this.photoError.set(PiPhotoDropzoneComponent.INVALID_FILE_TYPE_MESSAGE);
  }

  private patchProduct(p: ProductDetail): void {
    this.form.patchValue({
      name: p.name ?? '',
      sku: p.sku ?? '',
      kind: p.kind,
      unit: p.unit,
      status: p.status ?? 'new',
      listPrice: p.listPrice ?? null,
      categoryId: refId(p.categoryId) ?? '',
      weightKg: p.weightKg ?? null,
      description: p.description ?? '',
      notes: p.notes ?? '',
    });
    this.hydratePhotos(p.photoIds, p.mainPhotoId);
  }

  /** Edit-load: строка-ссылка = достаточно для превью (legacy storageUrl pattern), populated объект — напрямую. */
  private hydratePhotos(
    refs: ProductDetail['photoIds'],
    main: ProductDetail['mainPhotoId'],
  ): void {
    const items: PiPhotoItem[] = [];
    for (const ref of refs ?? []) {
      if (typeof ref === 'string') {
        items.push({ _id: ref, storageUrl: `/api/photos/${ref}/raw` });
      } else if (ref && typeof ref === 'object' && '_id' in ref) {
        const doc = ref as Record<string, unknown> & { storageUrl?: string };
        const frame = photoFrameOf(doc);
        items.push({
          _id: String(doc['_id']),
          storageUrl: typeof doc.storageUrl === 'string' ? doc.storageUrl : `/api/photos/${String(doc['_id'])}/raw`,
          ...(frame ? { frame } : {}),
        });
      }
    }
    this.photoItems.set(items);
    const mainId =
      main == null
        ? null
        : typeof main === 'string'
          ? main
          : typeof main === 'object' && '_id' in main
            ? String((main as Record<string, unknown>)['_id'])
            : null;
    this.mainPhotoId.set(mainId ?? (items.length > 0 ? items[0]._id : null));
  }

  private buildPayload(): CreateProductPayload {
    const v = this.form.getRawValue();
    const payload: CreateProductPayload = {
      sku: v.sku.trim(),
      kind: v.kind,
      unit: v.unit,
    };
    if (v.name?.trim()) payload.name = v.name.trim();
    if (v.status) payload.status = v.status;
    if (v.listPrice != null) payload.listPrice = Number(v.listPrice);
    if (v.categoryId?.trim()) payload.categoryId = v.categoryId.trim();
    if (v.weightKg != null) payload.weightKg = Number(v.weightKg);
    if (v.description?.trim()) payload.description = v.description.trim();
    if (v.notes?.trim()) payload.notes = v.notes.trim();
    const photos = this.photoItems();
    if (photos.length > 0) {
      payload.photoIds = photos.map((p) => p._id);
      const main = this.mainPhotoId();
      if (main && photos.some((p) => p._id === main)) payload.mainPhotoId = main;
    } else if (this.mode() === 'edit') {
      // Все фото убрали в edit → пустой массив, main сбрасывается на BE (validate: не в photoIds).
      payload.photoIds = [];
      payload.mainPhotoId = null;
    }
    return payload;
  }
}

/**
 * `categoryId` (and other refs) arrive populated (`GET /products` and detail
 * both `.populate('categoryId')`) — extracts the id either way. Same small
 * helper as `material-form.facade.ts`'s own `refId()`; no shared util exists
 * for it yet (also duplicated in `production-read.facade.ts`).
 */
function refId(value: unknown): string | null {
  if (value == null || value === '') return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && '_id' in value) {
    return refId((value as { _id: unknown })._id);
  }
  return null;
}
