import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { FormArray, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { TextareaComponent } from '../../shared/ui/textarea/textarea.component';
import { PiDialogComponent } from '../../shared/ui/dialog/pi-dialog.component';
import { PiFormSectionComponent } from '../../shared/ui/form-section';
import { DialogRef } from '../../shared/ui/dialog/pi-dialog.service';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../shared/ui/dialog/dialog.tokens';
import { PiToastService } from '../../shared/ui/toast';
import {
  ProductModule,
  ProductModuleUpsertDto,
  ProductModulesService,
  WorkTypeInModule,
} from '../../shared/services/pi-product-modules.service';
import { WorkTypesService } from '../../shared/services/pi-work-types.service';
import { toOptionalNumber } from '../../shared/forms/to-optional-number';
import { extractErrorMessage } from '../../core/silent-http';
import { focusDialogField, isSaveAndContinueKey } from '../../shared/util/dialog-save-and-continue';
import { PiPhotoDropzoneComponent } from '../../shared/ui/photo';
import {
  PhotosService,
  uploadPhotosWithProgress,
  type Photo,
} from '../../shared/services/photos.service';
import { ProductModulePhotosService } from '../../shared/services/pi-product-module-photos.service';
import { forkJoin } from 'rxjs';

/**
 * TZ-83 Phase C: ModuleFormDialog.
 *
 * Поля:
 *  - name (required)
 *  - article
 *  - dimensions.width / height / depth + unit
 *  - weight
 *  - notes (description)
 *  - workTypes[] — FormArray (workTypeId picker + estimatedHours + sortOrder)
 *
 * workTypes lookup происходит через WorkTypesService.list() на mount
 * (однократно), сохраняется в сигнале `workTypesCatalog`.
 */
@Component({
  selector: 'app-module-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
    TextareaComponent,
    PiDialogComponent,
    PiFormSectionComponent,
    PiPhotoDropzoneComponent,
  ],
  template: `
    <!-- TZ-UX-DIALOG-305: Module FullEditor = kind C width (parity with material/product). -->
    <app-pi-dialog
      [title]="isEdit ? 'Редактировать модуль' : 'Создать модуль'"
      [variant]="'content'"
      [maxWidth]="'min(1120px, calc(100vw - 2rem))'"
    >
      <form
        body
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        class="space-y-form-field overflow-y-auto min-h-0"
        data-test="module-form"
      >
        <app-pi-form-section title="Основные данные" headingId="module-sec-basics" tone="gold">
          <!-- TZ-UX-FORM-310: 12-col → name lg (8) + article sm (4), not 50/50. -->
          <div class="grid md:grid-cols-12 gap-form-field">
            <app-pi-form-field
              label="Название"
              htmlFor="mod-name"
              [required]="true"
              [error]="
                form.controls.name.invalid && form.controls.name.touched ? 'Обязательное поле' : ''
              "
              class="md:col-span-8"
            >
              <app-pi-input
                id="mod-name"
                formControlName="name"
                data-save-continue-first="true"
                placeholder="Название модуля"
                [invalid]="form.controls.name.invalid && form.controls.name.touched"
                data-test="name-input"
              />
            </app-pi-form-field>
            <app-pi-form-field
              label="Артикул"
              htmlFor="mod-article"
              [required]="true"
              [error]="
                form.controls.article.invalid && form.controls.article.touched
                  ? 'Обязательное поле'
                  : ''
              "
              class="md:col-span-4"
            >
              <app-pi-input
                id="mod-article"
                formControlName="article"
                placeholder="Артикул модуля"
                [invalid]="form.controls.article.invalid && form.controls.article.touched"
                data-test="article-input"
              />
            </app-pi-form-field>
          </div>
        </app-pi-form-section>

        <!-- TZ-UX-FORM-310: Dimensions + weight = single band (6 fields, not 4+1 separate). -->
        <app-pi-form-section
          title="Габариты и вес"
          headingId="module-sec-dimensions"
          tone="dimensions"
        >
          <div class="grid md:grid-cols-12 gap-form-field items-end">
            <div formGroupName="dimensions" class="contents">
              <app-pi-form-field label="Ширина" htmlFor="mod-width" class="md:col-span-2">
                <app-pi-input
                  id="mod-width"
                  type="number"
                  formControlName="width"
                  placeholder="0"
                  style="max-width: 5.5rem; text-align: right; font-variant-numeric: tabular-nums"
                  data-test="dim-width"
                />
              </app-pi-form-field>
              <app-pi-form-field label="Высота" htmlFor="mod-height" class="md:col-span-2">
                <app-pi-input
                  id="mod-height"
                  type="number"
                  formControlName="height"
                  placeholder="0"
                  style="max-width: 5.5rem; text-align: right; font-variant-numeric: tabular-nums"
                  data-test="dim-height"
                />
              </app-pi-form-field>
              <app-pi-form-field label="Глубина" htmlFor="mod-depth" class="md:col-span-2">
                <app-pi-input
                  id="mod-depth"
                  type="number"
                  formControlName="depth"
                  placeholder="0"
                  style="max-width: 5.5rem; text-align: right; font-variant-numeric: tabular-nums"
                  data-test="dim-depth"
                />
              </app-pi-form-field>
              <app-pi-form-field label="Ед." htmlFor="mod-dim-unit" class="md:col-span-2">
                <app-pi-input
                  id="mod-dim-unit"
                  formControlName="unit"
                  placeholder="мм"
                  style="max-width: 7rem"
                  data-test="dim-unit"
                />
              </app-pi-form-field>
            </div>
            <app-pi-form-field label="Вес (кг)" htmlFor="mod-weight" class="md:col-span-4">
              <app-pi-input
                id="mod-weight"
                type="number"
                formControlName="weight"
                placeholder="0"
                style="max-width: 5.5rem; text-align: right; font-variant-numeric: tabular-nums"
                data-test="weight-input"
              />
            </app-pi-form-field>
          </div>
        </app-pi-form-section>

        <app-pi-form-section title="Дополнительно" headingId="module-sec-extra" tone="neutral">
          <app-pi-form-field label="Заметки / описание" htmlFor="mod-notes">
            <app-pi-textarea
              id="mod-notes"
              [rows]="3"
              formControlName="notes"
              data-test="notes-input"
            />
          </app-pi-form-field>

          <div data-test="module-photo-section">
            <p class="eyebrow">Фото</p>
            <app-pi-photo-dropzone
              [photos]="photos()"
              [uploading]="photosUploading()"
              [progressPercent]="photoUploadProgress()"
              [errorMessage]="photoErrorMessage()"
              (uploadRequest)="onUploadRequest($event)"
              (deleteRequest)="onDeleteRequest($event)"
              (invalidFileType)="onInvalidPhotoType()"
            />
          </div>

          <div>
            <div class="flex items-baseline justify-between mb-form-row">
              <p class="eyebrow">Виды работ в составе</p>
              <app-pi-button
                type="button"
                variant="outline"
                size="sm"
                (click)="addWorkType()"
                data-test="wt-add"
              >
                + Добавить вид работы
              </app-pi-button>
            </div>
            <div formArrayName="workTypes" class="space-y-2">
              @for (ctrl of workTypesArray.controls; track $index) {
                <div
                  [formGroupName]="$index"
                  class="grid grid-cols-12 gap-2 items-end p-2 hairline rounded-sm bg-paper-2/30"
                >
                  <label class="block col-span-6">
                    <span class="eyebrow block mb-1.5">Вид работы</span>
                    <select
                      class="pi-input w-full"
                      formControlName="workTypeId"
                      data-test="wt-select"
                    >
                      <option value="">— не выбрано —</option>
                      @for (wt of workTypesCatalog(); track wt._id) {
                        <option [value]="wt._id">{{ wt.name }}</option>
                      }
                    </select>
                  </label>
                  <label class="block col-span-3">
                    <span class="eyebrow block mb-1.5">Норма (ч)</span>
                    <app-pi-input
                      type="number"
                      formControlName="estimatedHours"
                      placeholder="0"
                      data-test="wt-hours"
                    />
                  </label>
                  <label class="block col-span-2">
                    <span class="eyebrow block mb-1.5">Сорт.</span>
                    <app-pi-input
                      type="number"
                      formControlName="sortOrder"
                      placeholder="0"
                      data-test="wt-sort"
                    />
                  </label>
                  <app-pi-button
                    type="button"
                    variant="destructive"
                    size="icon"
                    (click)="removeWorkType($index)"
                    aria-label="Удалить строку"
                  >
                    ×
                  </app-pi-button>
                </div>
              }
            </div>
          </div>
        </app-pi-form-section>

        <!-- TZ-UX-COMPOSE-301: состав не редактируется в форме — на карточке / QC L -->
        <app-pi-form-section title="Состав" headingId="module-sec-composition" tone="neutral">
          <p class="text-sm text-muted-foreground" data-test="composition-hint">
            Состав (модули и материалы) собирается на карточке модуля или в быстром создании
            (профиль L).
          </p>
        </app-pi-form-section>

        @if (formError()) {
          <p role="alert" class="text-xs text-destructive">
            {{ formError() }}
          </p>
        }
      </form>

      <div footer class="flex gap-3 items-center">
        <span class="text-[11px] text-muted-foreground mr-auto" data-test="save-continue-hint">
          Ctrl+Enter — сохранить и создать ещё
        </span>
        <app-pi-button
          variant="default"
          type="submit"
          [disabled]="form.invalid || submitting()"
          data-test="submit-button"
        >
          {{ submitting() ? 'Сохранение…' : isEdit ? 'Сохранить' : 'Создать' }}
        </app-pi-button>
        <app-pi-button
          variant="outline"
          type="button"
          (click)="onCancel()"
          data-test="cancel-button"
        >
          Отмена
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class ModuleFormDialogComponent implements OnDestroy {
  // TZ-83 cleanup: use proper token exports — DialogRef (not PiDialogRef),
  // PI_DIALOG_DATA / PI_DIALOG_REF. DialogRef already exists as exported
  // interface in pi-dialog.service.ts.
  protected readonly ref = inject<DialogRef<ProductModule | null>>(PI_DIALOG_REF);
  protected readonly data = inject<ProductModule | null>(PI_DIALOG_DATA);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly modules = inject(ProductModulesService);
  private readonly workTypes = inject(WorkTypesService);
  private readonly toast = inject(PiToastService);
  private readonly photosService = inject(PhotosService);
  private readonly modulePhotos = inject(ProductModulePhotosService);

  protected readonly isEdit = this.data != null;
  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly workTypesCatalog = signal<{ _id: string; name: string }[]>([]);
  protected readonly photos = signal<Photo[]>([]);
  protected readonly photosUploading = signal(false);
  protected readonly photoUploadProgress = signal<number | null>(null);
  protected readonly photoErrorMessage = signal<string | null>(null);
  private readonly newlyUploadedIds = signal<string[]>([]);
  private submitted = false;

  protected readonly form = this.fb.group({
    name: this.fb.control<string>(this.data?.name ?? '', [
      Validators.required,
      Validators.maxLength(200),
    ]),
    article: this.fb.control<string>(this.data?.article ?? '', [
      Validators.required,
      Validators.maxLength(64),
    ]),
    dimensions: this.fb.group({
      width: this.fb.control<number | null>(this.data?.dimensions?.width ?? null),
      height: this.fb.control<number | null>(this.data?.dimensions?.height ?? null),
      depth: this.fb.control<number | null>(this.data?.dimensions?.depth ?? null),
      unit: this.fb.control<string>(this.data?.dimensions?.unit ?? 'мм'),
    }),
    weight: this.fb.control<number | null>(this.data?.weight ?? null),
    notes: this.fb.control<string>(''),
    workTypes: this.fb.array(
      (this.data?.workTypes ?? []).map((wt) =>
        this.fb.group({
          workTypeId: this.fb.control<string>(
            typeof wt.workTypeId === 'string' ? wt.workTypeId : wt.workTypeId._id,
            [Validators.required],
          ),
          estimatedHours: this.fb.control<number>(wt.estimatedHours ?? 0),
          sortOrder: this.fb.control<number>(wt.sortOrder ?? 0),
        }),
      ),
    ),
  });

  // Plain getter (not computed) — we need the FormArray ref itself; @for {@for (ctrl of workTypesArray.controls; ...)}
  // reads `.controls` from the FormArray, NOT from a Signal.
  protected get workTypesArray(): FormArray {
    return this.form.controls.workTypes as FormArray;
  }

  constructor() {
    this.workTypes.list({ activeOnly: true }).subscribe((res) => {
      if (res.ok) {
        this.workTypesCatalog.set(res.data.items.map((w) => ({ _id: w._id, name: w.name })));
      }
    });
  }

  protected addWorkType(): void {
    (this.form.controls.workTypes as FormArray).push(
      this.fb.group({
        workTypeId: this.fb.control<string>('', [Validators.required]),
        estimatedHours: this.fb.control<number>(0),
        sortOrder: this.fb.control<number>(0),
      }),
    );
  }

  protected removeWorkType(idx: number): void {
    (this.form.controls.workTypes as FormArray).removeAt(idx);
  }

  @HostListener('document:keydown', ['$event'])
  protected onDocumentKeydown(event: KeyboardEvent): void {
    if (!isSaveAndContinueKey(event)) return;
    event.preventDefault();
    this.onSubmit(true);
  }

  protected onUploadRequest(files: File[]): void {
    if (files.length === 0) return;
    this.photosUploading.set(true);
    this.photoUploadProgress.set(null);
    this.photoErrorMessage.set(null);
    uploadPhotosWithProgress(this.photosService, files, (percent) =>
      this.photoUploadProgress.set(percent),
    ).subscribe((results) => {
      const uploaded: Photo[] = [];
      const failed: string[] = [];
      results.forEach((result, index) => {
        if (result.ok) {
          uploaded.push(result.data);
        } else {
          failed.push(files[index].name);
        }
      });
      if (uploaded.length > 0) {
        this.photos.update((current) => [...current, ...uploaded]);
        this.newlyUploadedIds.update((ids) => [...ids, ...uploaded.map((photo) => photo._id)]);
      }
      this.photosUploading.set(false);
      this.photoUploadProgress.set(null);
      if (failed.length > 0) {
        const message = `Не удалось загрузить: ${failed.join(', ')}`;
        this.photoErrorMessage.set(message);
        this.toast.error(message);
      }
    });
  }

  protected onInvalidPhotoType(): void {
    this.photoErrorMessage.set(PiPhotoDropzoneComponent.INVALID_FILE_TYPE_MESSAGE);
  }

  protected onDeleteRequest(id: string): void {
    this.photos.update((current) => current.filter((photo) => photo._id !== id));
    this.newlyUploadedIds.update((ids) => ids.filter((photoId) => photoId !== id));
    this.photosService.remove(id).subscribe((result) => {
      if (!result.ok) this.toast.error(extractErrorMessage(result.error));
    });
  }

  ngOnDestroy(): void {
    if (this.submitted) return;
    this.newlyUploadedIds().forEach((id) => this.photosService.remove(id).subscribe());
  }

  protected onSubmit(saveAndContinue = false): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const workTypesRaw = v.workTypes ?? [];
    const width = toOptionalNumber(v.dimensions.width);
    const height = toOptionalNumber(v.dimensions.height);
    const depth = toOptionalNumber(v.dimensions.depth);
    const weight = toOptionalNumber(v.weight);
    const dimensions = {
      ...(width === undefined ? {} : { width }),
      ...(height === undefined ? {} : { height }),
      ...(depth === undefined ? {} : { depth }),
      ...(v.dimensions.unit ? { unit: v.dimensions.unit } : {}),
    };
    const payload: ProductModuleUpsertDto = {
      name: v.name,
      article: v.article.trim(),
      dimensions,
      ...(weight === undefined ? {} : { weight }),
      workTypes: workTypesRaw.map((w): WorkTypeInModule => {
        const estimatedHours = toOptionalNumber(w.estimatedHours);
        const sortOrder = toOptionalNumber(w.sortOrder);
        return {
          workTypeId: w.workTypeId,
          ...(estimatedHours === undefined ? {} : { estimatedHours }),
          ...(sortOrder === undefined ? {} : { sortOrder }),
        } as WorkTypeInModule;
      }),
    };
    this.submitting.set(true);
    const op = this.isEdit
      ? this.modules.update(this.data!._id, payload)
      : this.modules.create(payload);
    op.subscribe((res) => {
      this.submitting.set(false);
      if (res.ok && res.data) {
        this.attachUploadedPhotos(res.data._id, () => {
          this.submitted = true;
          if (saveAndContinue) {
            if (!this.isEdit) this.resetForNextCreate();
            this.toast.success('Сохранено — можно создать следующий');
            return;
          }
          this.toast.success(this.isEdit ? 'Модуль обновлён' : 'Модуль создан');
          this.ref.close(res.data);
        });
      } else if (res.ok) {
        this.formError.set('Модуль создан, но сервер не вернул его идентификатор.');
      } else {
        const msg = extractErrorMessage(res.error);
        this.formError.set(msg);
        this.toast.error(msg);
      }
    });
  }

  private attachUploadedPhotos(moduleId: string, done: () => void): void {
    const uploaded = this.photos();
    if (uploaded.length === 0) {
      done();
      return;
    }
    forkJoin(
      uploaded.map((photo, index) =>
        this.modulePhotos.attach({
          productModuleId: moduleId,
          photoId: photo._id,
          isMain: index === 0,
          sortOrder: index,
        }),
      ),
    ).subscribe((results) => {
      const failed = results.filter((result) => !result.ok).length;
      if (failed > 0) {
        this.toast.error(`Не удалось привязать фото: ${failed}`);
      }
      done();
    });
  }

  private resetForNextCreate(): void {
    this.form.controls.workTypes.clear();
    this.form.reset({
      name: '',
      article: '',
      dimensions: { width: null, height: null, depth: null, unit: 'мм' },
      weight: null,
      notes: '',
      workTypes: [],
    });
    this.formError.set(null);
    this.photos.set([]);
    this.newlyUploadedIds.set([]);
    this.photoErrorMessage.set(null);
    this.submitted = false;
    this.focusedReset();
  }

  private focusedReset(): void {
    focusDialogField('[data-save-continue-first="true"]');
  }

  protected onCancel(): void {
    this.ref.close(null);
  }
}
