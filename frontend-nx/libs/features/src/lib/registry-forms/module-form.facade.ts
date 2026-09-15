/**
 * TZ-NX-REGISTRY-FORMS-FACADE — domain facade for `ModuleFormDialogComponent`.
 *
 * Owns: form/catalog/photo/work-type signals and every load/submit/payload
 * method — moved as-is from the dialog. `PI_DIALOG_DATA` / `PI_DIALOG_REF`
 * are DI tokens (not `@Input()`s), so this facade — provided in the same
 * dialog's `providers` array — injects them directly (same pattern as
 * `RoleFormFacade`/`MaterialFormFacade`). `@ViewChild`s (`formEl`,
 * `compositionBlock`) stay on the component (only it can resolve against
 * its own template); the DOM-focus side effects from `onSubmit()` and
 * `ngAfterViewInit()` are bridged via lookup methods / a callback parameter.
 */
import { DestroyRef, Injectable, Injector, computed, inject, signal } from '@angular/core';
import { FormArray, FormGroup, FormControl, NonNullableFormBuilder, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  PiCategoriesService,
  PiModulesService,
  PiPhotosService,
  PiWorkTypesService,
  type Category,
  type CreateProductModulePayload,
  type ProductModule,
  type ProductModuleWorkTypePayload,
  type PhotoFrame,
  type WorkType,
} from '@kppdf/data-access';
import { normalizePhotoFrame, photoFrameOf, PiPhotoDropzoneComponent, type PiPhotoItem } from '@kppdf/ui/photo';
import { PiDialogService, PI_DIALOG_DATA, PI_DIALOG_REF } from '@kppdf/ui/dialog';
import type { DialogRef } from '@kppdf/ui/dialog';
import { extractErrorMessage } from '@kppdf/util-http';
import { confirmDirtyClose } from '@kppdf/features/composition';
import { onDialogCloseOnce } from './ui/on-dialog-close-once';
import { CategoryFormDialogComponent, type CategoryFormDialogData } from './ui/category-form-dialog.component';
import type { ModuleFormDialogData } from './ui/module-form-dialog.component';

export type WorkTypeFormGroup = FormGroup<{
  workTypeId: FormControl<string>;
  estimatedHours: FormControl<number | null>;
  sortOrder: FormControl<number>;
  days: FormControl<number | null>;
}>;

function resolveWorkTypeId(row: NonNullable<ProductModule['workTypes']>[number] | undefined): string {
  if (!row) return '';
  return typeof row.workTypeId === 'string' ? row.workTypeId : row.workTypeId._id;
}

@Injectable()
export class ModuleFormFacade {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly modulesService = inject(PiModulesService);
  private readonly photosService = inject(PiPhotosService);
  private readonly workTypesService = inject(PiWorkTypesService);
  private readonly categoriesService = inject(PiCategoriesService);
  readonly data = inject<ModuleFormDialogData>(PI_DIALOG_DATA);
  private readonly ref = inject<DialogRef<ProductModule | null | undefined>>(PI_DIALOG_REF);
  private readonly dialog = inject(PiDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly savedId = signal<string | null>(null);
  readonly focusComposition = signal(!!this.data.focusComposition);

  readonly mode = signal<'create' | 'edit'>(this.data.mode);
  private readonly moduleEntity = signal<ProductModule | undefined>(this.data.module);
  readonly workTypes = signal<WorkType[]>([]);
  readonly categories = signal<Category[]>([]);

  /** WAVE-NX-CATALOG-PHOTOS P1: локальное состояние фото; write — только на Save. */
  readonly photoItems = signal<PiPhotoItem[]>([]);
  readonly mainPhotoId = signal<string | null>(null);
  readonly photosUploading = signal(false);
  readonly photoError = signal<string | null>(null);

  readonly dialogTitle = computed(() =>
    this.mode() === 'edit' ? 'Редактировать модуль' : 'Создать модуль',
  );

  readonly form = this.fb.group({
    name: this.fb.control('', [Validators.required, Validators.maxLength(200)]),
    article: this.fb.control('', [Validators.required, Validators.maxLength(64)]),
    categoryId: this.fb.control('', Validators.required),
    width: this.fb.control<number | null>(null),
    height: this.fb.control<number | null>(null),
    depth: this.fb.control<number | null>(null),
    dimUnit: this.fb.control('mm'),
    weight: this.fb.control<number | null>(null),
    sortOrder: this.fb.control<number | null>(null),
    workTypes: this.fb.array<WorkTypeFormGroup>([]),
  });

  get workTypesArray(): FormArray<WorkTypeFormGroup> {
    return this.form.controls.workTypes;
  }

  constructor() {
    void this.loadWorkTypes();
    void this.loadCategories();
    if (this.data.module) {
      this.savedId.set(this.data.module._id);
      this.patchModule(this.data.module);
    }
  }

  onCancel(): void {
    confirmDirtyClose(
      this.dialog,
      this.destroyRef,
      this.injector,
      () => this.form.dirty,
      () => this.ref.close(this.moduleEntity() ?? undefined),
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
    const existing = this.moduleEntity();
    const res =
      this.mode() === 'edit' && existing
        ? await firstValueFrom(this.modulesService.update(existing._id, payload))
        : await firstValueFrom(this.modulesService.create(payload));
    this.submitting.set(false);
    if (!res.ok) {
      this.errorMessage.set(extractErrorMessage(res.error));
      return;
    }
    this.savedId.set(res.data._id);
    this.moduleEntity.set(res.data);
    this.mode.set('edit');
    this.form.markAsPristine();
    if (this.data.mode === 'edit') {
      this.ref.close(res.data);
    }
  }

  /** Order matches the form layout — first invalid one gets focus/scroll. */
  private static readonly REQUIRED_FIELDS: ReadonlyArray<{
    key: 'name' | 'article' | 'categoryId';
    label: string;
    htmlId: string;
  }> = [
    { key: 'name', label: 'Название', htmlId: 'mod-name' },
    { key: 'article', label: 'Артикул', htmlId: 'mod-article' },
    { key: 'categoryId', label: 'Категория', htmlId: 'mod-category' },
  ];

  private buildInvalidMessage(): string {
    const missing = ModuleFormFacade.REQUIRED_FIELDS.filter(
      (f) => this.form.controls[f.key].invalid,
    ).map((f) => f.label);
    if (this.workTypesArray.controls.some((g) => g.invalid)) missing.push('Виды работ');
    return missing.length
      ? `Заполните обязательные поля: ${missing.join(', ')}`
      : 'Проверьте поля формы — есть некорректные значения.';
  }

  /** Html id of the first invalid required field, for the component's DOM focus/scroll. */
  firstInvalidRequiredFieldHtmlId(): string | undefined {
    return ModuleFormFacade.REQUIRED_FIELDS.find((f) => this.form.controls[f.key].invalid)?.htmlId;
  }

  /** Index of the first invalid work-type row, or -1 when none. */
  firstInvalidWorkTypeIndex(): number {
    return this.workTypesArray.controls.findIndex((g) => g.invalid);
  }

  /** ШАГ 2 — nested create, same pattern as `supply-request-form-dialog.openCreateMaterial`. */
  openCreateCategory(): void {
    const ref = this.dialog.open<Category | undefined>(CategoryFormDialogComponent, {
      data: {
        mode: 'create',
        category: null,
        categories: this.categories(),
        lockType: 'module',
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

  addWorkType(): void {
    this.workTypesArray.push(this.createWorkTypeGroup());
    this.form.markAsDirty();
  }

  removeWorkType(index: number): void {
    this.workTypesArray.removeAt(index);
    this.form.markAsDirty();
  }

  moveWorkType(index: number, direction: -1 | 1): void {
    const target = index + direction;
    if (target < 0 || target >= this.workTypesArray.length) return;
    const current = this.workTypesArray.at(index);
    this.workTypesArray.removeAt(index, { emitEvent: false });
    this.workTypesArray.insert(target, current, { emitEvent: false });
    this.form.markAsDirty();
  }

  private createWorkTypeGroup(row?: NonNullable<ProductModule['workTypes']>[number]): WorkTypeFormGroup {
    return this.fb.group({
      workTypeId: this.fb.control(resolveWorkTypeId(row), Validators.required),
      estimatedHours: this.fb.control(row?.estimatedHours ?? null),
      sortOrder: this.fb.control(row?.sortOrder ?? 0),
      days: this.fb.control(row?.days ?? null),
    });
  }

  /** Seeds an empty «Дней» field from the WorkType catalog default when a skill is picked (fallback, not a lock). */
  seedDaysFromCatalog(index: number): void {
    const group = this.workTypesArray.at(index);
    if (group.controls.days.value != null) return;
    const catalogDays = this.workTypes().find((wt) => wt._id === group.controls.workTypeId.value)?.days;
    if (catalogDays != null) group.controls.days.setValue(catalogDays);
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

  private async loadWorkTypes(): Promise<void> {
    const result = await firstValueFrom(this.workTypesService.list({ activeOnly: true }));
    if (result.ok) this.workTypes.set(result.data.items);
  }

  private async loadCategories(): Promise<void> {
    const result = await firstValueFrom(this.categoriesService.list({ type: 'module' }));
    if (result.ok) this.categories.set(result.data.filter((c) => c.isActive));
  }

  private patchModule(m: ProductModule): void {
    this.form.patchValue({
      name: m.name,
      article: m.article,
      categoryId: refId(m.categoryId) ?? '',
      width: m.dimensions?.width ?? null,
      height: m.dimensions?.height ?? null,
      depth: m.dimensions?.depth ?? null,
      dimUnit: m.dimensions?.unit ?? 'mm',
      weight: m.weight ?? null,
      sortOrder: m.sortOrder ?? null,
    });
    this.workTypesArray.clear();
    for (const row of m.workTypes ?? []) this.workTypesArray.push(this.createWorkTypeGroup(row));
    this.hydratePhotos(m.photoIds, m.mainPhotoId);
    this.form.markAsPristine();
  }

  /** Edit-load: строка-ссылка = достаточно для превью; populated объект — напрямую. */
  private hydratePhotos(refs: ProductModule['photoIds'], main: ProductModule['mainPhotoId']): void {
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

  private buildPayload(): CreateProductModulePayload {
    const v = this.form.getRawValue();
    const payload: CreateProductModulePayload = {
      name: v.name.trim(),
      article: v.article.trim(),
      categoryId: v.categoryId,
    };
    if (v.weight != null) payload.weight = Number(v.weight);
    if (v.sortOrder != null) payload.sortOrder = Number(v.sortOrder);
    if (v.width != null || v.height != null || v.depth != null || v.dimUnit) {
      payload.dimensions = {
        width: v.width ?? undefined,
        height: v.height ?? undefined,
        depth: v.depth ?? undefined,
        unit: v.dimUnit || undefined,
      };
    }
    payload.workTypes = v.workTypes
      .filter((row) => row.workTypeId.trim().length > 0)
      .map((row): ProductModuleWorkTypePayload => ({
        workTypeId: row.workTypeId,
        ...(row.estimatedHours == null ? {} : { estimatedHours: Number(row.estimatedHours) }),
        ...(row.sortOrder == null ? {} : { sortOrder: Number(row.sortOrder) }),
        ...(row.days == null ? {} : { days: Number(row.days) }),
      }));
    const photos = this.photoItems();
    if (photos.length > 0) {
      payload.photoIds = photos.map((p) => p._id);
      const main = this.mainPhotoId();
      if (main && photos.some((p) => p._id === main)) payload.mainPhotoId = main;
    } else if (this.mode() === 'edit') {
      payload.photoIds = [];
      payload.mainPhotoId = null;
    }
    return payload;
  }
}

/**
 * `categoryId` arrives populated on list/detail (BE `.populate('categoryId')`).
 * Same small helper as `material-form.facade.ts`'s own `refId()`;
 * no shared util exists for it yet.
 */
function refId(value: unknown): string | null {
  if (value == null || value === '') return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && '_id' in value) {
    return refId((value as { _id: unknown })._id);
  }
  return null;
}
