import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { ReactiveFormsModule, type FormArray } from '@angular/forms';
import type { PhotoFrame } from '@kppdf/data-access';
import { type Material, type MaterialKind } from '@kppdf/data-access';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiPhotoDropzoneComponent } from '@kppdf/ui/photo';
import { PiDialogComponent } from '@kppdf/ui/dialog';
import { FormFieldComponent } from '@kppdf/ui/form-field';
import { InputComponent } from '@kppdf/ui/input';
import { TextareaComponent } from '@kppdf/ui/textarea';
import { PiFormSectionComponent } from '@kppdf/ui/form-section';
import { CompositionPanelComponent } from '../../composition/composition-panel.component';
import { RegistryCreateButtonComponent } from '../registry-create-button.component';
import { MaterialFormFacade, type DimensionGroup } from './material-form.facade';

export interface MaterialFormDialogData {
  readonly mode: 'create' | 'edit';
  readonly material?: Material | null;
  readonly lockMaterialKind?: MaterialKind;
  readonly allowKindSelect?: boolean;
  readonly entityLabel?: string;
}

@Component({
  selector: 'pi-material-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MaterialFormFacade],
  imports: [
    ReactiveFormsModule,
    PiDialogComponent,
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
    TextareaComponent,
    PiFormSectionComponent,
    PiPhotoDropzoneComponent,
    CompositionPanelComponent,
    RegistryCreateButtonComponent,
  ],
  template: `
    <app-pi-dialog
      [title]="dialogTitle()"
      variant="content"
      [maxWidth]="'min(1120px, calc(100vw - 2rem))'"
      [showClose]="true"
    >
      <form body #formEl [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4" data-test="material-form">
        <app-pi-form-section title="Основные данные" headingId="mat-form-basics" tone="gold">
          <div class="grid md:grid-cols-12 gap-form-field">
            <app-pi-form-field
              label="Название"
              htmlFor="mat-name"
              [required]="true"
              [error]="fieldError('name')"
              class="md:col-span-8"
            >
              <app-pi-input id="mat-name" formControlName="name" [invalid]="invalid('name')" />
            </app-pi-form-field>

            <app-pi-form-field
              label="Артикул"
              htmlFor="mat-article"
              [required]="true"
              [error]="fieldError('article')"
              class="md:col-span-4"
            >
              <app-pi-input id="mat-article" formControlName="article" [invalid]="invalid('article')" />
            </app-pi-form-field>

            <app-pi-form-field
              label="Единица"
              htmlFor="mat-unit"
              [required]="true"
              [error]="fieldError('unit')"
              class="md:col-span-3"
            >
              <select id="mat-unit" formControlName="unit" class="pi-input w-full" data-test="mat-unit">
                <option value="" disabled>— выберите —</option>
                @for (u of units(); track u.key) {
                  <option [value]="u.key">{{ u.label }}{{ u.symbol ? ' (' + u.symbol + ')' : '' }}</option>
                }
              </select>
            </app-pi-form-field>

            <app-pi-form-field label="Внутр. код" htmlFor="mat-sku" class="md:col-span-3">
              <app-pi-input id="mat-sku" formControlName="sku" />
            </app-pi-form-field>

            @if (showKindSelect()) {
              <app-pi-form-field label="Вид" htmlFor="mat-kind" class="md:col-span-3">
                <select
                  id="mat-kind"
                  formControlName="materialKind"
                  class="pi-input w-full"
                  data-test="material-kind-select"
                >
                  @for (k of kindOptions(); track k) {
                    <option [value]="k">{{ formatKind(k) }}</option>
                  }
                </select>
              </app-pi-form-field>
            }

            <app-pi-form-field
              label="Категория"
              htmlFor="mat-category"
              [required]="categoryRequired()"
              [error]="fieldError('categoryId')"
              class="md:col-span-6"
            >
              <div class="flex items-center gap-2">
                <select
                  id="mat-category"
                  formControlName="categoryId"
                  class="pi-input flex-1"
                  data-test="mat-category"
                >
                  <option value="">{{ categoryRequired() ? '— выберите —' : 'Без категории' }}</option>
                  @for (c of categories(); track c._id) {
                    <option [value]="c._id">{{ c.name }}</option>
                  }
                </select>
                <pi-registry-create-button
                  label="Создать категорию"
                  dataTest="mat-category-create"
                  (createClick)="openCreateCategory()"
                />
              </div>
            </app-pi-form-field>

            <app-pi-form-field label="Цена, ₽" htmlFor="mat-price" class="md:col-span-3">
              <app-pi-input id="mat-price" type="number" formControlName="pricePerUnit" />
            </app-pi-form-field>

            <app-pi-form-field label="Масса, кг" htmlFor="mat-weight" class="md:col-span-3">
              <app-pi-input id="mat-weight" type="number" formControlName="weightKg" />
            </app-pi-form-field>
          </div>
        </app-pi-form-section>

        <app-pi-form-section title="Справочные поля" headingId="mat-form-ref" tone="neutral">
          <div class="grid md:grid-cols-12 gap-form-field">
            <app-pi-form-field label="Сортамент" htmlFor="mat-assortment" class="md:col-span-4">
              <app-pi-input id="mat-assortment" formControlName="assortment" />
            </app-pi-form-field>
            <app-pi-form-field label="Стандарт" htmlFor="mat-standard" class="md:col-span-4">
              <app-pi-input id="mat-standard" formControlName="standardRef" />
            </app-pi-form-field>
            <app-pi-form-field label="Марка" htmlFor="mat-grade" class="md:col-span-4">
              <app-pi-input id="mat-grade" formControlName="materialGrade" />
            </app-pi-form-field>
            <app-pi-form-field
              label="Цвета (через запятую)"
              htmlFor="mat-colors"
              hint="Опции заказа у поставщика"
              class="md:col-span-12"
            >
              <app-pi-input id="mat-colors" formControlName="colorsText" />
            </app-pi-form-field>
          </div>
        </app-pi-form-section>

        <app-pi-form-section title="Фото" headingId="mat-form-photos" tone="neutral">
          <pi-photo-dropzone
            [photos]="photoItems()"
            [mainPhotoId]="mainPhotoId()"
            [uploading]="photosUploading()"
            [errorMessage]="photoError()"
            (filesSelected)="onPhotosSelected($event)"
            (removePhoto)="onPhotoRemove($event)"
            (mainChanged)="onPhotoMainChanged($event)"
            (frameSave)="onPhotoFrameSave($event)"
            (invalidFileType)="onPhotoInvalidType()"
            data-test="material-photo-dropzone"
          />
        </app-pi-form-section>

        <app-pi-form-section title="Описание" headingId="mat-form-notes" tone="neutral">
          <div class="grid md:grid-cols-2 gap-form-field">
            <app-pi-form-field label="Описание" htmlFor="mat-description">
              <app-pi-textarea id="mat-description" formControlName="description" [rows]="2" />
            </app-pi-form-field>
            <app-pi-form-field label="Заметки" htmlFor="mat-notes">
              <app-pi-textarea id="mat-notes" formControlName="notes" [rows]="2" />
            </app-pi-form-field>
          </div>
        </app-pi-form-section>

        <app-pi-form-section title="Габариты" headingId="mat-form-dims" tone="dimensions">
          <div class="mb-2">
            <app-pi-button type="button" variant="outline" size="sm" (click)="addDimension()" data-test="add-dimension">
              + Добавить размер
            </app-pi-button>
          </div>
          <div formArrayName="dimensions" class="space-y-2">
            @for (group of dimensionsArray.controls; track $index; let i = $index) {
              <div [formGroupName]="i" class="grid grid-cols-12 gap-2 items-center" [attr.data-test]="'dimension-row-' + i">
                <select formControlName="type" class="pi-input col-span-4 text-xs">
                  @for (opt of dimensionTypes; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
                <app-pi-input type="number" formControlName="value" class="col-span-3" />
                <label class="col-span-4 text-xs inline-flex items-center gap-2">
                  <input type="checkbox" formControlName="isImmutable" />
                  Неизменяемый
                </label>
                <app-pi-button
                  type="button"
                  variant="destructive"
                  size="icon"
                  [attr.aria-label]="'Удалить размер ' + (i + 1)"
                  (click)="removeDimension(i)"
                  >×</app-pi-button
                >
              </div>
            }
          </div>
        </app-pi-form-section>

        @if (isDetailForm()) {
          @if (savedId(); as id) {
            <pi-composition-panel parentKind="material" [entityId]="id" data-test="detail-bom-composition" />
          } @else {
            <p class="text-sm text-muted-foreground" data-test="detail-bom-create-hint">
              Сохраните деталь, чтобы указать материалы (сырьё).
            </p>
          }
        }

        @if (errorMessage()) {
          <p role="alert" class="text-xs text-destructive" data-test="material-form-error">{{ errorMessage() }}</p>
        }
      </form>

      <div footer class="flex gap-3 justify-end">
        <app-pi-button type="button" variant="default" [disabled]="submitting()" (click)="onSubmit()" data-test="material-form-save">
          {{ submitting() ? 'Сохранение…' : 'Сохранить' }}
        </app-pi-button>
        <app-pi-button type="button" variant="outline" (click)="onCancel()" data-test="material-form-cancel">
          Отмена
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class MaterialFormDialogComponent {
  @ViewChild('formEl') private formEl?: ElementRef<HTMLFormElement>;
  private readonly facade = inject(MaterialFormFacade);

  protected readonly dimensionTypes = this.facade.dimensionTypes;
  protected readonly formatKind = this.facade.formatKind;

  protected readonly submitting = this.facade.submitting;
  protected readonly errorMessage = this.facade.errorMessage;
  protected readonly units = this.facade.units;
  protected readonly categories = this.facade.categories;
  protected readonly savedId = this.facade.savedId;
  protected readonly mode = this.facade.mode;

  protected readonly photoItems = this.facade.photoItems;
  protected readonly mainPhotoId = this.facade.mainPhotoId;
  protected readonly photosUploading = this.facade.photosUploading;
  protected readonly photoError = this.facade.photoError;

  protected readonly isDetailForm = this.facade.isDetailForm;
  protected readonly categoryRequired = this.facade.categoryRequired;
  protected readonly dialogTitle = this.facade.dialogTitle;
  protected readonly showKindSelect = this.facade.showKindSelect;
  protected readonly kindOptions = this.facade.kindOptions;

  protected readonly form = this.facade.form;

  protected get dimensionsArray(): FormArray<DimensionGroup> {
    return this.facade.dimensionsArray;
  }

  protected invalid(name: Parameters<MaterialFormFacade['invalid']>[0]): boolean {
    return this.facade.invalid(name);
  }

  protected fieldError(name: Parameters<MaterialFormFacade['fieldError']>[0]): string {
    return this.facade.fieldError(name);
  }

  protected openCreateCategory(): void {
    this.facade.openCreateCategory();
  }

  protected addDimension(): void {
    this.facade.addDimension();
  }

  protected removeDimension(index: number): void {
    this.facade.removeDimension(index);
  }

  protected onCancel(): void {
    this.facade.onCancel();
  }

  protected async onSubmit(): Promise<void> {
    await this.facade.onSubmit(() => this.focusFirstInvalidField());
  }

  protected async onPhotosSelected(files: File[]): Promise<void> {
    await this.facade.onPhotosSelected(files);
  }

  protected onPhotoRemove(id: string): void {
    this.facade.onPhotoRemove(id);
  }

  protected onPhotoMainChanged(id: string | null): void {
    this.facade.onPhotoMainChanged(id);
  }

  protected async onPhotoFrameSave(event: { id: string; frame: Partial<PhotoFrame> }): Promise<void> {
    await this.facade.onPhotoFrameSave(event);
  }

  protected onPhotoInvalidType(): void {
    this.facade.onPhotoInvalidType();
  }

  private focusFirstInvalidField(): void {
    const htmlId = this.facade.firstInvalidFieldHtmlId();
    if (!htmlId) return;
    const host = this.formEl?.nativeElement.querySelector<HTMLElement>(`#${htmlId}`);
    if (!host) return;
    // `app-pi-input` puts `id` on its host tag, not the native `<input>` it wraps — reach inside.
    const el = host.matches('input, select, textarea')
      ? host
      : (host.querySelector<HTMLElement>('input, select, textarea') ?? host);
    queueMicrotask(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus({ preventScroll: true });
    });
  }
}
