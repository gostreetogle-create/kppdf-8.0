import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import type { PhotoFrame, ProductDetail } from '@kppdf/data-access';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiPhotoDropzoneComponent } from '@kppdf/ui/photo';
import { PiDialogComponent } from '@kppdf/ui/dialog';
import { FormFieldComponent } from '@kppdf/ui/form-field';
import { InputComponent } from '@kppdf/ui/input';
import { TextareaComponent } from '@kppdf/ui/textarea';
import { PiFormSectionComponent } from '@kppdf/ui/form-section';
import { CompositionPanelComponent } from '../../composition/composition-panel.component';
import { scrollCompositionBlockIntoView } from '../../composition/composition-focus-scroll';
import { RegistryCreateButtonComponent } from '../registry-create-button.component';
import { ProductFormFacade } from './product-form.facade';

export interface ProductFormDialogData {
  mode: 'create' | 'edit';
  product?: ProductDetail;
  focusComposition?: boolean;
}

@Component({
  selector: 'pi-product-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ProductFormFacade],
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
      (userClose)="onCancel()"
    >
      <form body #formEl [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4" data-test="product-form">
        <app-pi-form-section title="Изделие" headingId="product-main" tone="gold">
          <div class="grid md:grid-cols-12 gap-form-field">
            <app-pi-form-field label="Название" htmlFor="prod-name" class="md:col-span-8">
              <app-pi-input id="prod-name" formControlName="name" />
            </app-pi-form-field>
            <app-pi-form-field label="Артикул" htmlFor="prod-sku" [required]="true" [error]="fieldError('sku')" class="md:col-span-4">
              <app-pi-input id="prod-sku" formControlName="sku" />
            </app-pi-form-field>
            <app-pi-form-field label="Тип" htmlFor="prod-kind" [required]="true" [error]="fieldError('kind')" class="md:col-span-3">
              <select id="prod-kind" formControlName="kind" class="pi-input w-full">
                @for (k of kindOptions; track k.value) {
                  <option [value]="k.value">{{ k.label }}</option>
                }
              </select>
            </app-pi-form-field>
            <app-pi-form-field label="Единица" htmlFor="prod-unit" [required]="true" [error]="fieldError('unit')" class="md:col-span-3">
              <select id="prod-unit" formControlName="unit" class="pi-input w-full" data-test="product-unit">
                <option value="" disabled>— выберите —</option>
                @for (u of units(); track u.key) {
                  <option [value]="u.key">{{ u.label }}</option>
                }
              </select>
            </app-pi-form-field>
            <app-pi-form-field label="Статус" htmlFor="prod-status" class="md:col-span-3">
              <select id="prod-status" formControlName="status" class="pi-input w-full">
                @for (s of statusOptions; track s.value) {
                  <option [value]="s.value">{{ s.label }}</option>
                }
              </select>
            </app-pi-form-field>
            <app-pi-form-field label="Цена, ₽" htmlFor="prod-price" class="md:col-span-3">
              <app-pi-input id="prod-price" type="number" formControlName="listPrice" />
            </app-pi-form-field>
            <app-pi-form-field label="Категория" htmlFor="prod-category" [required]="true" [error]="fieldError('categoryId')" class="md:col-span-6">
              <div class="flex items-center gap-2">
                <select id="prod-category" formControlName="categoryId" class="pi-input flex-1" data-test="prod-category">
                  <option value="">— выберите —</option>
                  @for (c of categories(); track c._id) {
                    <option [value]="c._id">{{ c.name }}</option>
                  }
                </select>
                <pi-registry-create-button
                  label="Создать категорию"
                  dataTest="prod-category-create"
                  (createClick)="openCreateCategory()"
                />
              </div>
            </app-pi-form-field>
            <app-pi-form-field label="Масса, кг" htmlFor="prod-weight" class="md:col-span-3">
              <app-pi-input id="prod-weight" type="number" formControlName="weightKg" />
            </app-pi-form-field>
          </div>
          <div class="grid md:grid-cols-2 gap-form-field">
            <app-pi-form-field label="Описание" htmlFor="prod-description">
              <app-pi-textarea id="prod-description" formControlName="description" [rows]="2" />
            </app-pi-form-field>
            <app-pi-form-field label="Заметки" htmlFor="prod-notes">
              <app-pi-textarea id="prod-notes" formControlName="notes" [rows]="2" />
            </app-pi-form-field>
          </div>
        </app-pi-form-section>

        <app-pi-form-section title="Фото" headingId="product-photos" tone="neutral">
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
            data-test="product-photo-dropzone"
          />
        </app-pi-form-section>

        @if (savedId(); as id) {
          <div
            #compositionBlock
            tabindex="-1"
            [attr.data-test]="focusComposition() ? 'product-composition-focus' : 'product-composition-block'"
          >
            <pi-composition-panel
              parentKind="product"
              [entityId]="id"
              [isComplex]="productEntity()?.isComplex === true"
            />
          </div>
        } @else {
          <div class="space-y-1" data-test="product-composition-create-hint">
            <p class="text-sm text-muted-foreground">
              Сохраните изделие, чтобы редактировать состав.
            </p>
            <p class="text-sm text-muted-foreground" data-test="product-complex-hint">
              Комплекс — когда в состав входят другие изделия (настраивается в блоке «Состав» после сохранения).
            </p>
          </div>
        }

        @if (errorMessage()) {
          <p role="alert" class="text-xs text-destructive" data-test="product-form-error">{{ errorMessage() }}</p>
        }
      </form>

      <div footer class="flex gap-3 justify-end sticky bottom-0 bg-paper">
        <app-pi-button type="button" variant="default" [disabled]="submitting()" (click)="onSubmit()" data-test="product-form-save">
          {{ submitting() ? 'Сохранение…' : 'Сохранить' }}
        </app-pi-button>
        <app-pi-button type="button" variant="outline" (click)="onCancel()" data-test="product-form-cancel">Отмена</app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class ProductFormDialogComponent implements AfterViewInit {
  @ViewChild('compositionBlock') private compositionBlock?: ElementRef<HTMLElement>;
  @ViewChild('formEl') private formEl?: ElementRef<HTMLFormElement>;
  private readonly facade = inject(ProductFormFacade);

  protected readonly kindOptions = this.facade.kindOptions;
  protected readonly statusOptions = this.facade.statusOptions;

  protected readonly submitting = this.facade.submitting;
  protected readonly errorMessage = this.facade.errorMessage;
  protected readonly savedId = this.facade.savedId;
  protected readonly focusComposition = this.facade.focusComposition;
  protected readonly units = this.facade.units;
  protected readonly categories = this.facade.categories;
  protected readonly productEntity = this.facade.productEntity;

  protected readonly photoItems = this.facade.photoItems;
  protected readonly mainPhotoId = this.facade.mainPhotoId;
  protected readonly photosUploading = this.facade.photosUploading;
  protected readonly photoError = this.facade.photoError;

  protected readonly dialogTitle = this.facade.dialogTitle;
  protected readonly form = this.facade.form;

  ngAfterViewInit(): void {
    if (this.facade.focusComposition()) {
      scrollCompositionBlockIntoView(this.compositionBlock?.nativeElement);
    }
  }

  protected onCancel(): void {
    this.facade.onCancel();
  }

  protected async onSubmit(): Promise<void> {
    await this.facade.onSubmit(() => this.focusFirstInvalidField());
  }

  protected fieldError(key: 'sku' | 'kind' | 'unit' | 'categoryId'): string | null {
    return this.facade.fieldError(key);
  }

  protected openCreateCategory(): void {
    this.facade.openCreateCategory();
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
