import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { ReactiveFormsModule, type FormArray } from '@angular/forms';
import type { PhotoFrame, ProductModule } from '@kppdf/data-access';
import { ButtonComponent } from '@kppdf/ui/button';
import { PiPhotoDropzoneComponent } from '@kppdf/ui/photo';
import { PiDialogComponent } from '@kppdf/ui/dialog';
import { FormFieldComponent } from '@kppdf/ui/form-field';
import { InputComponent } from '@kppdf/ui/input';
import { PiFormSectionComponent } from '@kppdf/ui/form-section';
import { CompositionPanelComponent } from '../../composition/composition-panel.component';
import { scrollCompositionBlockIntoView } from '../../composition/composition-focus-scroll';
import { RegistryCreateButtonComponent } from '../registry-create-button.component';
import { ModuleFormFacade, type WorkTypeFormGroup } from './module-form.facade';

export interface ModuleFormDialogData {
  mode: 'create' | 'edit';
  module?: ProductModule;
  focusComposition?: boolean;
}

@Component({
  selector: 'pi-module-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ModuleFormFacade],
  imports: [
    ReactiveFormsModule,
    PiDialogComponent,
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
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
      <form body #formEl [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4" data-test="module-form">
        <app-pi-form-section title="Модуль" headingId="module-main" tone="gold">
          <div class="grid md:grid-cols-12 gap-form-field">
            <app-pi-form-field label="Название" htmlFor="mod-name" [required]="true" class="md:col-span-8">
              <app-pi-input id="mod-name" formControlName="name" />
            </app-pi-form-field>
            <app-pi-form-field label="Артикул" htmlFor="mod-article" [required]="true" class="md:col-span-4">
              <app-pi-input id="mod-article" formControlName="article" />
            </app-pi-form-field>
            <app-pi-form-field label="Категория" htmlFor="mod-category" [required]="true" class="md:col-span-6">
              <div class="flex items-center gap-2">
                <select id="mod-category" formControlName="categoryId" class="pi-input flex-1" data-test="mod-category">
                  <option value="">— выберите —</option>
                  @for (c of categories(); track c._id) {
                    <option [value]="c._id">{{ c.name }}</option>
                  }
                </select>
                <pi-registry-create-button
                  label="Создать категорию"
                  dataTest="mod-category-create"
                  (createClick)="openCreateCategory()"
                />
              </div>
            </app-pi-form-field>
            <app-pi-form-field label="Ширина" htmlFor="mod-w" class="md:col-span-3">
              <app-pi-input id="mod-w" type="number" formControlName="width" />
            </app-pi-form-field>
            <app-pi-form-field label="Высота" htmlFor="mod-h" class="md:col-span-3">
              <app-pi-input id="mod-h" type="number" formControlName="height" />
            </app-pi-form-field>
            <app-pi-form-field label="Глубина" htmlFor="mod-d" class="md:col-span-3">
              <app-pi-input id="mod-d" type="number" formControlName="depth" />
            </app-pi-form-field>
            <app-pi-form-field label="Ед. габаритов" htmlFor="mod-dim-unit" class="md:col-span-3">
              <app-pi-input id="mod-dim-unit" formControlName="dimUnit" />
            </app-pi-form-field>
            <app-pi-form-field label="Вес" htmlFor="mod-weight" class="md:col-span-3">
              <app-pi-input id="mod-weight" type="number" formControlName="weight" />
            </app-pi-form-field>
            <app-pi-form-field label="Порядок" htmlFor="mod-sort" class="md:col-span-3">
              <app-pi-input id="mod-sort" type="number" formControlName="sortOrder" />
            </app-pi-form-field>
          </div>
        </app-pi-form-section>

        <app-pi-form-section title="Фото" headingId="module-photos" tone="neutral">
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
            data-test="module-photo-dropzone"
          />
        </app-pi-form-section>

        <app-pi-form-section title="Виды работ" headingId="module-work-types" tone="neutral">
          <div class="flex items-baseline justify-between gap-3 mb-form-row">
            <p class="text-sm text-muted-foreground">
              Длительность Ганта — «Дней» в строке модуля; норма, ч — только себестоимость. На заказе срок можно скорректировать на Ганте.
            </p>
            <app-pi-button type="button" variant="outline" size="sm" (click)="addWorkType()" data-test="module-work-type-add">
              + Добавить вид работы
            </app-pi-button>
          </div>
          <div formArrayName="workTypes" class="space-y-2" data-test="module-work-types">
            @for (group of workTypesArray.controls; track $index; let i = $index) {
              <div [formGroupName]="i" class="grid grid-cols-12 gap-2 items-end p-2 hairline rounded-sm bg-paper-2/30" [attr.data-test]="'module-work-type-row-' + i">
                <label class="block col-span-4">
                  <span class="eyebrow block mb-1.5">Вид работы</span>
                  <select formControlName="workTypeId" (change)="seedDaysFromCatalog(i)" class="pi-input w-full" [attr.aria-label]="'Вид работы ' + (i + 1)" data-test="module-work-type-select">
                    <option value="">— выберите —</option>
                    @for (workType of workTypes(); track workType._id) {
                      <option [value]="workType._id">{{ workType.name }}</option>
                    }
                  </select>
                </label>
                <app-pi-form-field label="Дней" [htmlFor]="'module-work-type-days-' + i" class="col-span-2">
                  <app-pi-input [id]="'module-work-type-days-' + i" type="number" formControlName="days" data-test="module-work-type-days" />
                </app-pi-form-field>
                <app-pi-form-field label="Норма, ч" [htmlFor]="'module-work-type-hours-' + i" class="col-span-2">
                  <app-pi-input [id]="'module-work-type-hours-' + i" type="number" formControlName="estimatedHours" data-test="module-work-type-hours" />
                </app-pi-form-field>
                <app-pi-form-field label="Порядок" [htmlFor]="'module-work-type-sort-' + i" class="col-span-2">
                  <app-pi-input [id]="'module-work-type-sort-' + i" type="number" formControlName="sortOrder" data-test="module-work-type-sort" />
                </app-pi-form-field>
                <div class="flex gap-1 col-span-2" role="group" [attr.aria-label]="'Порядок строки ' + (i + 1)">
                  <app-pi-button type="button" variant="outline" size="icon" [disabled]="i === 0" (click)="moveWorkType(i, -1)" [attr.aria-label]="'Поднять вид работы ' + (i + 1)" data-test="module-work-type-up">↑</app-pi-button>
                  <app-pi-button type="button" variant="outline" size="icon" [disabled]="i === workTypesArray.length - 1" (click)="moveWorkType(i, 1)" [attr.aria-label]="'Опустить вид работы ' + (i + 1)" data-test="module-work-type-down">↓</app-pi-button>
                  <app-pi-button type="button" variant="destructive" size="icon" (click)="removeWorkType(i)" [attr.aria-label]="'Удалить вид работы ' + (i + 1)" data-test="module-work-type-remove">×</app-pi-button>
                </div>
              </div>
            } @empty {
              <p class="text-sm text-muted-foreground" data-test="module-work-types-empty">Виды работ не добавлены.</p>
            }
          </div>
        </app-pi-form-section>

        @if (savedId(); as id) {
          <div
            #compositionBlock
            tabindex="-1"
            [attr.data-test]="focusComposition() ? 'module-composition-focus' : 'module-composition-block'"
          >
            <pi-composition-panel parentKind="module" [entityId]="id" />
          </div>
        } @else {
          <p class="text-sm text-muted-foreground" data-test="module-composition-create-hint">
            Сохраните модуль, чтобы редактировать состав.
          </p>
        }

        @if (errorMessage()) {
          <p role="alert" class="text-xs text-destructive" data-test="module-form-error">{{ errorMessage() }}</p>
        }
      </form>

      <div footer class="flex gap-3 justify-end sticky bottom-0 bg-paper">
        <app-pi-button type="button" variant="default" [disabled]="submitting()" (click)="onSubmit()" data-test="module-form-save">
          {{ submitting() ? 'Сохранение…' : 'Сохранить' }}
        </app-pi-button>
        <app-pi-button type="button" variant="outline" (click)="onCancel()" data-test="module-form-cancel">Отмена</app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class ModuleFormDialogComponent implements AfterViewInit {
  @ViewChild('compositionBlock') private compositionBlock?: ElementRef<HTMLElement>;
  @ViewChild('formEl') private formEl?: ElementRef<HTMLFormElement>;
  private readonly facade = inject(ModuleFormFacade);

  protected readonly submitting = this.facade.submitting;
  protected readonly errorMessage = this.facade.errorMessage;
  protected readonly savedId = this.facade.savedId;
  protected readonly focusComposition = this.facade.focusComposition;

  protected readonly workTypes = this.facade.workTypes;
  protected readonly categories = this.facade.categories;

  protected readonly photoItems = this.facade.photoItems;
  protected readonly mainPhotoId = this.facade.mainPhotoId;
  protected readonly photosUploading = this.facade.photosUploading;
  protected readonly photoError = this.facade.photoError;

  protected readonly dialogTitle = this.facade.dialogTitle;
  protected readonly form = this.facade.form;

  protected get workTypesArray(): FormArray<WorkTypeFormGroup> {
    return this.facade.workTypesArray;
  }

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

  protected openCreateCategory(): void {
    this.facade.openCreateCategory();
  }

  protected addWorkType(): void {
    this.facade.addWorkType();
  }

  protected removeWorkType(index: number): void {
    this.facade.removeWorkType(index);
  }

  protected moveWorkType(index: number, direction: -1 | 1): void {
    this.facade.moveWorkType(index, direction);
  }

  protected seedDaysFromCatalog(index: number): void {
    this.facade.seedDaysFromCatalog(index);
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
    const htmlId = this.facade.firstInvalidRequiredFieldHtmlId();
    const host = htmlId
      ? this.formEl?.nativeElement.querySelector<HTMLElement>(`#${htmlId}`)
      : this.focusFirstInvalidWorkTypeRow();
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

  private focusFirstInvalidWorkTypeRow(): HTMLElement | null {
    const index = this.facade.firstInvalidWorkTypeIndex();
    if (index < 0) return null;
    return (
      this.formEl?.nativeElement.querySelector<HTMLElement>(
        `[data-test="module-work-type-row-${index}"] select`,
      ) ?? null
    );
  }
}
