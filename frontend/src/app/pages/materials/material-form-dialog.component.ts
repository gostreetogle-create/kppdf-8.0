import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { forkJoin } from 'rxjs';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { TextareaComponent } from '../../shared/ui/textarea/textarea.component';
import {
  PI_DIALOG_DATA,
  PI_DIALOG_REF,
} from '../../shared/ui/dialog/dialog.tokens';
import { PiToastService } from '../../shared/ui/toast';
import { extractErrorMessage } from '../../core/silent-http';
import type { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import {
  Material,
  MaterialDimensionType,
  MaterialsService,
} from '../../shared/services/materials.service';
import { PhotosService, type Photo } from '../../shared/services/photos.service';
import {
  Organization,
  OrganizationsService,
} from '../../shared/services/organizations.service';

type Result = Material | null | undefined;

const DIMENSION_TYPES: { value: MaterialDimensionType; label: string }[] = [
  { value: 'length', label: 'Длина' },
  { value: 'width', label: 'Ширина' },
  { value: 'height', label: 'Высота' },
  { value: 'thickness', label: 'Толщина' },
  { value: 'diameter', label: 'Диаметр' },
  { value: 'depth', label: 'Глубина' },
];

interface DimensionFormGroup extends FormGroup {
  controls: {
    type: FormControl<MaterialDimensionType>;
    value: FormControl<number>;
    isImmutable: FormControl<boolean>;
  };
}

/**
 * MaterialFormDialogComponent — full Phase 8 refactor.
 *
 * Sections (in order):
 *  1. Basics: name, article, unit, sku, pricePerUnit, stockQty
 *  2. Supplier: dropdown of organizations filtered by type=supplier
 *  3. Dimensions: FormArray of {type, value, isImmutable} rows
 *  4. Photos: multi-upload with isMain radio, preview grid
 *  5. Notes: description, notes (textareas)
 *
 * On submit:
 *  - Upload any new files via PhotosService
 *  - Collect photoIds + mainPhotoId
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
  ],
  template: `
    <app-pi-dialog
      [title]="isEdit() ? 'Редактировать материал' : 'Создать материал'"
      [width]="'lg'"
    >
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="space-y-form-field"
        data-test="material-form"
      >
        <!-- ─── Basics ─── -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-form-field">
          <app-pi-form-field
            label="Название"
            htmlFor="mat-name"
            [required]="true"
            [error]="errorFor('name')"
          >
            <app-pi-input
              id="mat-name"
              formControlName="name"
              placeholder="Название материала"
              [invalid]="hasError('name')"
            />
          </app-pi-form-field>

          <app-pi-form-field
            label="Артикул"
            htmlFor="mat-article"
            [error]="errorFor('article')"
          >
            <app-pi-input
              id="mat-article"
              formControlName="article"
              placeholder="Артикул"
            />
          </app-pi-form-field>

          <app-pi-form-field
            label="Единица измерения"
            htmlFor="mat-unit"
            [required]="true"
            [error]="errorFor('unit')"
          >
            <select
              id="mat-unit"
              formControlName="unit"
              class="pi-input w-full"
              [class.border-destructive]="hasError('unit')"
            >
              <option value="" disabled>— выберите —</option>
              <option value="m2">м² (площадь)</option>
              <option value="m3">м³ (объём)</option>
              <option value="kg">кг (масса)</option>
              <option value="sheet">лист</option>
              <option value="pcs">штука</option>
            </select>
          </app-pi-form-field>

          <app-pi-form-field
            label="Код (SKU)"
            htmlFor="mat-sku"
            [error]="errorFor('sku')"
          >
            <app-pi-input
              id="mat-sku"
              formControlName="sku"
              placeholder="SKU"
            />
          </app-pi-form-field>

          <app-pi-form-field
            label="Цена за единицу, ₽"
            htmlFor="mat-price"
            [error]="errorFor('pricePerUnit')"
          >
            <app-pi-input
              id="mat-price"
              type="number"
              formControlName="pricePerUnit"
              placeholder="0.00"
              [invalid]="hasError('pricePerUnit')"
            />
          </app-pi-form-field>

          <app-pi-form-field
            label="Остаток на складе"
            htmlFor="mat-stock"
            [error]="errorFor('stockQty')"
          >
            <app-pi-input
              id="mat-stock"
              type="number"
              formControlName="stockQty"
              placeholder="0"
              [invalid]="hasError('stockQty')"
            />
          </app-pi-form-field>
        </div>

        <!-- ─── Supplier ─── -->
        <app-pi-form-field
          label="Поставщик"
          htmlFor="mat-supplier"
          hint="Только организации с типом «Поставщик». Управление в разделе «Организации»."
        >
          <select
            id="mat-supplier"
            formControlName="supplierId"
            class="pi-input w-full"
          >
            <option [ngValue]="null">— не указан —</option>
            @for (s of suppliers(); track s._id) {
              <option [ngValue]="s._id">
                {{ s.name }}{{ s.inn ? ' · ИНН ' + s.inn : '' }}
              </option>
            }
          </select>
        </app-pi-form-field>

        <!-- ─── Dimensions (FormArray) ─── -->
        <div>
          <div class="flex items-baseline justify-between mb-form-row">
            <p class="eyebrow">Габариты</p>
            <app-pi-button
              type="button"
              variant="outline"
              size="sm"
              (click)="addDimension()"
              data-test="add-dimension"
            >
              + Добавить размер
            </app-pi-button>
          </div>
          @if (dimensionsArray.controls.length === 0) {
            <p class="text-xs text-muted-foreground">
              Нет габаритов. Нажмите «+ Добавить размер» для ввода длины, ширины, толщины и т.п.
            </p>
          }
          <div formArrayName="dimensions" class="space-y-2">
            @for (
              dimGroup of dimensionsArray.controls;
              track $index;
              let i = $index
            ) {
              <div
                [formGroupName]="i"
                class="grid grid-cols-12 gap-2 items-center p-2 hairline rounded-sm bg-paper-2/30"
                [attr.data-test]="'dimension-row-' + i"
              >
                <select
                  [attr.id]="'mat-dim-type-' + i"
                  [attr.name]="'dim-type-' + i"
                  formControlName="type"
                  class="col-span-4 h-8 px-3 text-xs hairline rounded-sm bg-paper pi-focus-ring"
                  [attr.aria-label]="'Тип габарита ' + (i + 1)"
                >
                  @for (opt of DIMENSION_TYPES; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
                <app-pi-input
                  [attr.id]="'mat-dim-value-' + i"
                  type="number"
                  formControlName="value"
                  placeholder="0"
                  size="sm"
                  [attr.aria-label]="'Значение ' + (i + 1)"
                  class="col-span-3"
                />
                <label
                  class="col-span-4 inline-flex items-center gap-2 min-h-touch px-control-x text-sm cursor-pointer"
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
          <p class="text-xs text-muted-foreground mt-2">
            <span class="eyebrow text-sunrise-warm">?</span>
            «Неизменяемый» — downstream не может менять (например, толщина листа).
          </p>
        </div>

        <!-- ─── Photos ─── -->
        <div>
          <div class="flex items-baseline justify-between mb-form-row">
            <p class="eyebrow">Фотографии</p>
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
              Нет фото. Можно загрузить несколько, выбрать «главное» (используется в карточках).
            </p>
          }
          <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
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
                    class="inline-flex items-center gap-1 text-[10px] cursor-pointer min-h-touch px-1"
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

        <!-- ─── Notes ─── -->
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

        <app-pi-form-field
          label="Заметки"
          htmlFor="mat-notes"
          [error]="errorFor('notes')"
        >
          <app-pi-textarea
            id="mat-notes"
            formControlName="notes"
            [rows]="2"
            [maxLength]="2000"
            [invalid]="hasError('notes')"
            ariaLabel="Заметки"
          />
        </app-pi-form-field>

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
          [disabled]="submitting()"
          (click)="onSubmit()"
        >
          {{ submitting() ? 'Сохранение…' : 'Сохранить' }}
        </app-pi-button>
        <app-pi-button
          type="button"
          variant="ghost"
          (click)="onCancel()"
        >
          Отмена
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class MaterialFormDialogComponent implements OnInit {
  protected readonly DIMENSION_TYPES = DIMENSION_TYPES;

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(MaterialsService);
  private readonly orgs = inject(OrganizationsService);
  private readonly photosService = inject(PhotosService);
  private readonly toast = inject(PiToastService);
  private readonly ref = inject<DialogRef<Result>>(PI_DIALOG_REF);
  private readonly data = inject<Material | null>(PI_DIALOG_DATA);

  protected readonly isEdit = signal<boolean>(this.data != null);
  protected readonly submitting = signal<boolean>(false);
  protected readonly uploading = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly suppliers = signal<Organization[]>([]);
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
    article: this.fb.control<string | null>(null, [Validators.maxLength(64)]),
    unit: this.fb.control('', [
      Validators.required,
      Validators.maxLength(32),
    ]),
    sku: this.fb.control<string | null>(null),
    pricePerUnit: this.fb.control<number | null>(null, [Validators.min(0)]),
    stockQty: this.fb.control<number>(0, [Validators.min(0)]),
    supplierId: this.fb.control<string | null>(null),
    dimensions: this.fb.array<DimensionFormGroup>([]),
    description: this.fb.control<string | null>(null, [Validators.maxLength(2000)]),
    notes: this.fb.control<string | null>(null, [Validators.maxLength(2000)]),
  });

  get dimensionsArray(): FormArray<DimensionFormGroup> {
    return this.form.controls.dimensions as FormArray<DimensionFormGroup>;
  }

  ngOnInit(): void {
    this.loadSuppliers();
    if (this.data) {
      this.patchFromData(this.data);
    }
  }

  /**
   * Cleanup orphan uploads on EVERY close path (Cancel button, X, Esc,
   * backdrop, or ref.close() after submit failure). The `submitted` flag
   * distinguishes "saved → keep" from "any other close → cleanup".
   * Without this hook, photos uploaded then dismissed via X/Esc/backdrop
   * remain in the DB as orphans with no Material.photoIds reference.
   */
  ngOnDestroy(): void {
    this.cleanupOrphanUploads();
  }

  private loadSuppliers(): void {
    this.orgs.list({ type: 'supplier', limit: 200 }).subscribe((res) => {
      if (res.ok) {
        this.suppliers.set(res.data.items ?? []);
      } else {
        this.suppliers.set([]); // Empty dropdown on failure — non-critical.
      }
    });
  }

  private patchFromData(m: Material): void {
    this.form.patchValue({
      name: m.name,
      article: m.article ?? null,
      unit: m.unit,
      sku: m.sku ?? null,
      pricePerUnit: m.pricePerUnit ?? null,
      stockQty: m.stockQty ?? 0,
      supplierId: m.supplierId ?? null,
      description: m.description ?? null,
      notes: m.notes ?? null,
    });
    // Dimensions
    (m.dimensions ?? []).forEach((d) => {
      this.dimensionsArray.push(
        this.fb.group({
          type: this.fb.control<MaterialDimensionType>(d.type, Validators.required),
          value: this.fb.control<number>(d.value, [Validators.required, Validators.min(0)]),
          isImmutable: this.fb.control<boolean>(!!d.isImmutable),
        }) as DimensionFormGroup,
      );
    });
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
            m.mainPhotoId && typeof m.mainPhotoId === 'object'
              ? m.mainPhotoId._id
              : m.mainPhotoId;
          this.mainPhotoId.set(mainId ?? (mine[0]?._id ?? null));
        } else {
          this.toast.error(extractErrorMessage(res.error));
        }
      });
    }
  }

  // ─── Dimensions ───

  addDimension(): void {
    this.dimensionsArray.push(
      this.fb.group({
        type: this.fb.control<MaterialDimensionType>('length', Validators.required),
        value: this.fb.control<number>(0, [Validators.required, Validators.min(0)]),
        isImmutable: this.fb.control<boolean>(false),
      }) as DimensionFormGroup,
    );
  }

  removeDimension(i: number): void {
    this.dimensionsArray.removeAt(i);
  }

  // ─── Photos ───

  onPhotoSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (files.length === 0) return;
    this.uploading.set(true);
    // photosService.upload() returns Observable<SilentResult<Photo>> —
    // never errors. So forkJoin always completes successfully and
    // per-file failures are reported via res.ok === false.
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
        this.newlyUploadedIds.update((cur) => [
          ...cur,
          ...uploaded.map((p) => p._id),
        ]);
        if (!this.mainPhotoId()) {
          this.mainPhotoId.set(uploaded[0]._id);
        }
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

  protected onSubmit(): void {
    if (this.submitting()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const dimensions = (v.dimensions ?? []).map((d) => ({
      type: d.type,
      value: Number(d.value),
      isImmutable: !!d.isImmutable,
    }));
    const photoIds = this.photos().map((p) => p._id);
    const mainPhotoId = this.mainPhotoId();

    const payload: Partial<Material> = {
      name: v.name,
      unit: v.unit,
    };
    if (v.article) payload.article = v.article;
    if (v.sku) payload.sku = v.sku;
    if (v.pricePerUnit != null) payload.pricePerUnit = v.pricePerUnit;
    if (v.stockQty != null) payload.stockQty = v.stockQty;
    if (v.supplierId) payload.supplierId = v.supplierId;
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
        this.toast.success(
          this.isEdit() ? 'Материал обновлён' : 'Материал создан',
        );
        this.ref.close(res.data);
      } else {
        this.errorMessage.set(extractErrorMessage(res.error));
        this.submitting.set(false);
      }
    });
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
        error: () => {/* best-effort */},
      });
    });
    this.newlyUploadedIds.set([]);
  }
}

