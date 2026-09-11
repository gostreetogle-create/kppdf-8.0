import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  PiTextBlockCategoriesService,
  type TextBlockCategory,
  type TextBlockCategoryPayload,
} from '@kppdf/data-access';
import { PiDialogComponent, PI_DIALOG_DATA, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import { ButtonComponent } from '@kppdf/ui/button';
import { FormFieldComponent } from '@kppdf/ui/form-field';
import { InputComponent } from '@kppdf/ui/input';
import { TextareaComponent } from '@kppdf/ui/textarea';
import { CheckboxComponent } from '@kppdf/ui/checkbox';
import { extractErrorMessage } from '@kppdf/util-http';

export interface TextBlockCategoryFormDialogData {
  readonly mode: 'create' | 'edit';
  readonly category?: TextBlockCategory | null;
  /** Create mode only: creating a subcategory under this root — omit to create a root. */
  readonly parentId?: string | null;
  readonly parentName?: string | null;
}

/**
 * TZ-NX-TEXT-CAT-NX-CRUD — create/edit dialog for `TextBlockCategory`
 * (root or subcategory). `isDefault` is only offered for roots — the
 * BE (`assertDefaultNotOnSubcategory`) rejects it on a subcategory.
 * `parentId` is only ever SET here at create time (fixed by which "+"
 * button opened the dialog); this form does not offer re-parenting an
 * existing category.
 */
@Component({
  selector: 'pi-text-block-category-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    PiDialogComponent,
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
    TextareaComponent,
    CheckboxComponent,
  ],
  template: `<app-pi-dialog [title]="title" variant="content" [showClose]="true">
    <form body [formGroup]="form" (ngSubmit)="submit()" class="space-y-3" data-test="text-block-category-form">
      @if (parentLabel) {
        <p class="text-xs text-muted-foreground" data-test="text-block-category-parent-hint">
          Подкатегория в «{{ parentLabel }}»
        </p>
      }
      <app-pi-form-field label="Название" htmlFor="tbc-name" [required]="true">
        <app-pi-input id="tbc-name" formControlName="name" data-test="text-block-category-name" />
      </app-pi-form-field>
      <app-pi-form-field label="Описание" htmlFor="tbc-description">
        <app-pi-textarea id="tbc-description" formControlName="description" [rows]="2" />
      </app-pi-form-field>
      <div class="inline-flex items-center gap-2 text-sm">
        <app-pi-checkbox formControlName="isActive" ariaLabel="Активна" data-test="text-block-category-active" />
        <span>Активна</span>
      </div>
      @if (isRoot) {
        <div class="inline-flex items-center gap-2 text-sm">
          <app-pi-checkbox formControlName="isDefault" ariaLabel="По умолчанию" data-test="text-block-category-default" />
          <span>По умолчанию для новых текстов</span>
        </div>
      }
      @if (errorMessage()) {
        <p role="alert" class="text-destructive text-sm">{{ errorMessage() }}</p>
      }
    </form>
    <div footer class="flex justify-end gap-3">
      <app-pi-button variant="default" [disabled]="saving()" (click)="submit()" data-test="text-block-category-save">
        {{ saving() ? 'Сохранение…' : 'Сохранить' }}
      </app-pi-button>
      <app-pi-button variant="outline" (click)="ref.close(undefined)">Отмена</app-pi-button>
    </div>
  </app-pi-dialog>`,
})
export class TextBlockCategoryFormDialogComponent {
  protected readonly data = inject<TextBlockCategoryFormDialogData>(PI_DIALOG_DATA);
  protected readonly ref = inject<DialogRef<TextBlockCategory | undefined>>(PI_DIALOG_REF);
  private readonly service = inject(PiTextBlockCategoriesService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly title: string;
  /** Root-ness at open time: edit — the category's own parentId; create — whether a parentId context was given. */
  protected readonly isRoot: boolean;
  protected readonly parentLabel: string | null;

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    isActive: [true],
    isDefault: [false],
  });

  constructor() {
    const category = this.data.category;
    this.isRoot = this.data.mode === 'edit' ? !category?.parentId : !this.data.parentId;
    this.parentLabel = this.data.mode === 'create' ? this.data.parentName ?? null : null;
    this.title =
      this.data.mode === 'edit'
        ? 'Редактировать категорию'
        : this.parentLabel
          ? 'Создать подкатегорию'
          : 'Создать категорию';
    if (category) {
      this.form.patchValue({
        name: category.name,
        description: category.description ?? '',
        isActive: category.isActive,
        isDefault: category.isDefault ?? false,
      });
    }
  }

  protected async submit(): Promise<void> {
    if (this.saving() || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.errorMessage.set(null);
    const raw = this.form.getRawValue();
    const payload: TextBlockCategoryPayload = {
      name: raw.name,
      description: raw.description || undefined,
      isActive: raw.isActive,
      isDefault: this.isRoot ? raw.isDefault : false,
      ...(this.data.mode === 'create' && this.data.parentId ? { parentId: this.data.parentId } : {}),
    };
    const result =
      this.data.mode === 'edit' && this.data.category
        ? await firstValueFrom(this.service.update(this.data.category._id, payload))
        : await firstValueFrom(this.service.create(payload));
    this.saving.set(false);
    if (!result.ok) {
      this.errorMessage.set(extractErrorMessage(result.error));
      return;
    }
    this.ref.close(result.data);
  }
}
