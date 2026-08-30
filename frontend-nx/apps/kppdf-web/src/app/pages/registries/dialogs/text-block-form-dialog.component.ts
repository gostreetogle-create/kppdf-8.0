import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { PiTextBlockCategoriesService, PiTextBlocksService, type TextBlock } from '@kppdf/data-access';
import { PiRichTextEditorComponent } from '@kppdf/ui/rich-text';
import { PiDialogComponent, PI_DIALOG_DATA, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import { ButtonComponent } from '@kppdf/ui/button';
import { FormFieldComponent } from '@kppdf/ui/form-field';
import { InputComponent } from '@kppdf/ui/input';
import { extractErrorMessage } from '@kppdf/util-http';
import { textBlockPayload } from '../data/doc-studio-registry-actions';

export interface TextBlockFormDialogData { readonly mode: 'create' | 'edit'; readonly textBlock?: TextBlock | null; }

@Component({ selector: 'pi-text-block-form-dialog', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, PiDialogComponent, ButtonComponent, FormFieldComponent, InputComponent, PiRichTextEditorComponent],
  template: `<app-pi-dialog [title]="data.mode === 'edit' ? 'Редактировать текст' : 'Создать текст'" variant="content" [showClose]="true">
    <form body [formGroup]="form" (ngSubmit)="submit()" class="space-y-3" data-test="text-block-form">
      <div class="grid md:grid-cols-2 gap-form-field">
        <app-pi-form-field label="Название" htmlFor="text-name" [required]="true"><app-pi-input id="text-name" formControlName="name" /></app-pi-form-field>
        <app-pi-form-field label="Slug" htmlFor="text-slug" [required]="true"><app-pi-input id="text-slug" formControlName="slug" /></app-pi-form-field>
        <app-pi-form-field label="Теги" htmlFor="text-tags"><app-pi-input id="text-tags" formControlName="tags" placeholder="через запятую" /></app-pi-form-field>
        <app-pi-form-field label="Категория" htmlFor="text-category"><select id="text-category" formControlName="categoryId" class="pi-input w-full"><option value="">Без выбора</option>@for (category of categories(); track category._id) {<option [value]="category._id">{{ category.name }}</option>}</select></app-pi-form-field>
        <app-pi-form-field label="Порядок" htmlFor="text-sort"><app-pi-input id="text-sort" type="number" formControlName="sortOrder" /></app-pi-form-field>
      </div>
      <app-pi-form-field label="Содержание" htmlFor="text-content"><app-pi-rich-text formControlName="content" /></app-pi-form-field>
      @if (errorMessage()) { <p role="alert" class="text-destructive text-sm">{{ errorMessage() }}</p> }
    </form>
    <div footer class="flex justify-end gap-3"><app-pi-button variant="default" [disabled]="saving()" (click)="submit()">{{ saving() ? 'Сохранение…' : 'Сохранить' }}</app-pi-button><app-pi-button variant="outline" (click)="ref.close(undefined)">Отмена</app-pi-button></div>
  </app-pi-dialog>`
})
export class TextBlockFormDialogComponent {
  protected readonly data = inject<TextBlockFormDialogData>(PI_DIALOG_DATA);
  protected readonly ref = inject<DialogRef<TextBlock | null | undefined>>(PI_DIALOG_REF);
  private readonly service = inject(PiTextBlocksService);
  private readonly categoryService = inject(PiTextBlockCategoriesService);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly saving = signal(false); protected readonly errorMessage = signal<string | null>(null); protected readonly categories = signal<readonly { _id: string; name: string }[]>([]);
  protected readonly form = this.fb.group({ name: ['', Validators.required], slug: ['', Validators.required], tags: [''], categoryId: [''], sortOrder: [0], content: [''] });
  constructor() { const row = this.data.textBlock; if (row) this.form.patchValue({ name: row.name, slug: row.slug, tags: row.tags.join(', '), categoryId: row.categoryId ?? '', sortOrder: row.sortOrder, content: row.content }); void this.loadCategories(); }
  private async loadCategories(): Promise<void> { const result = await firstValueFrom(this.categoryService.list()); if (result.ok) this.categories.set(result.data); }
  protected async submit(): Promise<void> { if (this.saving() || this.form.invalid) { this.form.markAllAsTouched(); return; } this.saving.set(true); this.errorMessage.set(null); const result = this.data.mode === 'edit' && this.data.textBlock ? await firstValueFrom(this.service.update(this.data.textBlock._id, textBlockPayload(this.form.getRawValue()))) : await firstValueFrom(this.service.create(textBlockPayload(this.form.getRawValue()))); this.saving.set(false); if (!result.ok) { this.errorMessage.set(extractErrorMessage(result.error)); return; } this.ref.close(result.data); }
}
