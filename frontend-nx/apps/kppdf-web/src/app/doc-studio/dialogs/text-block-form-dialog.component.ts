import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  PiTextBlockCategoriesService,
  PiTextBlocksService,
  type TextBlock,
  type TextBlockCategory,
} from '@kppdf/data-access';
import { PiRichTextEditorComponent } from '@kppdf/ui/rich-text';
import { PiDialogComponent, PI_DIALOG_DATA, PI_DIALOG_REF, type DialogRef } from '@kppdf/ui/dialog';
import { ButtonComponent } from '@kppdf/ui/button';
import { FormFieldComponent } from '@kppdf/ui/form-field';
import { InputComponent } from '@kppdf/ui/input';
import { extractErrorMessage } from '@kppdf/util-http';
import { textBlockPayload } from '../shared/doc-studio-payloads';

export interface TextBlockFormDialogData {
  readonly mode: 'create' | 'edit';
  readonly textBlock?: TextBlock | null;
}

/**
 * TZ-NX-TEXT-PICKER-FORM — cat -> subcat -> name -> body. `slug` is no
 * longer a form field (server auto-generates it, TZ-DOC-322/`slugify`).
 * `categoryId` submitted is always a LEAF (subcategory) — required;
 * `TextBlockCategoryService.assertAssignable` (TZ-NX-TEXT-CAT-PARENT) is
 * the server-side backstop if this form is ever bypassed.
 */
@Component({
  selector: 'pi-text-block-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    PiDialogComponent,
    ButtonComponent,
    FormFieldComponent,
    InputComponent,
    PiRichTextEditorComponent,
  ],
  template: `<app-pi-dialog [title]="data.mode === 'edit' ? 'Редактировать текст' : 'Создать текст'" variant="content" [showClose]="true">
    <form body [formGroup]="form" (ngSubmit)="submit()" class="space-y-3" data-test="text-block-form">
      <div class="grid md:grid-cols-2 gap-form-field">
        <app-pi-form-field label="Название" htmlFor="text-name" [required]="true"><app-pi-input id="text-name" formControlName="name" /></app-pi-form-field>
        <app-pi-form-field label="Теги" htmlFor="text-tags"><app-pi-input id="text-tags" formControlName="tags" placeholder="через запятую" /></app-pi-form-field>
        <app-pi-form-field label="Категория" htmlFor="text-root-category" [required]="true">
          <select id="text-root-category" [value]="rootId()" (change)="onRootChange($any($event.target).value)" class="pi-input w-full" data-test="text-root-category">
            <option value="">— выберите категорию —</option>
            @for (root of roots(); track root._id) {<option [value]="root._id">{{ root.name }}</option>}
          </select>
        </app-pi-form-field>
        <app-pi-form-field label="Подкатегория" htmlFor="text-category" [required]="true">
          <select id="text-category" formControlName="categoryId" class="pi-input w-full" [attr.disabled]="rootId() ? null : ''" data-test="text-sub-category">
            <option value="">{{ rootId() ? '— выберите подкатегорию —' : 'сначала выберите категорию' }}</option>
            @for (sub of subs(); track sub._id) {<option [value]="sub._id">{{ sub.name }}</option>}
          </select>
        </app-pi-form-field>
        <app-pi-form-field label="Порядок" htmlFor="text-sort"><app-pi-input id="text-sort" type="number" formControlName="sortOrder" /></app-pi-form-field>
      </div>
      <app-pi-form-field label="Содержание" htmlFor="text-content"><app-pi-rich-text [(value)]="content" /></app-pi-form-field>
      @if (errorMessage()) { <p role="alert" class="text-destructive text-sm">{{ errorMessage() }}</p> }
    </form>
    <div footer class="flex justify-end gap-3"><app-pi-button variant="default" [disabled]="saving()" (click)="submit()">{{ saving() ? 'Сохранение…' : 'Сохранить' }}</app-pi-button><app-pi-button variant="outline" (click)="ref.close(undefined)">Отмена</app-pi-button></div>
  </app-pi-dialog>`,
})
export class TextBlockFormDialogComponent {
  protected readonly data = inject<TextBlockFormDialogData>(PI_DIALOG_DATA);
  protected readonly ref = inject<DialogRef<TextBlock | null | undefined>>(PI_DIALOG_REF);
  private readonly service = inject(PiTextBlocksService);
  private readonly categoryService = inject(PiTextBlockCategoriesService);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly roots = signal<readonly TextBlockCategory[]>([]);
  protected readonly subs = signal<readonly TextBlockCategory[]>([]);
  protected readonly rootId = signal('');
  /** PiRichTextEditorComponent exposes a signal `model()`, not ControlValueAccessor — cannot live inside the reactive form as a formControlName. */
  protected readonly content = signal('');
  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    tags: [''],
    // Always enabled — a disabled FormControl is excluded from the parent
    // FormGroup's validity rollup, so disabling this via the control itself
    // (rather than the template's [attr.disabled] cosmetic gate below)
    // would silently defeat Validators.required and let an empty
    // categoryId through submit(). The visual "pick a category first"
    // gate is DOM-only, via [attr.disabled] on the <select> (not Angular's
    // [disabled] property binding, which would also warn about conflicting
    // with formControlName).
    categoryId: ['', Validators.required],
    sortOrder: [0],
  });

  constructor() {
    const row = this.data.textBlock;
    if (row) {
      this.form.patchValue({
        name: row.name,
        tags: row.tags.join(', '),
        sortOrder: row.sortOrder,
      });
      this.content.set(row.content);
    }
    void this.initCategories(row?.categoryId);
  }

  private async initCategories(leafId: string | undefined): Promise<void> {
    const [rootsResult, leaf] = await Promise.all([
      firstValueFrom(this.categoryService.list({ rootsOnly: true })),
      leafId ? firstValueFrom(this.categoryService.getById(leafId)) : Promise.resolve(null),
    ]);
    if (rootsResult.ok) this.roots.set(rootsResult.data);
    const parentId = leaf?.ok ? leaf.data.parentId : undefined;
    if (!parentId) return;
    this.rootId.set(parentId);
    await this.loadSubs(parentId);
    this.form.patchValue({ categoryId: leafId });
  }

  protected async onRootChange(rootId: string): Promise<void> {
    this.rootId.set(rootId);
    this.form.patchValue({ categoryId: '' });
    this.subs.set([]);
    if (rootId) await this.loadSubs(rootId);
  }

  private async loadSubs(rootId: string): Promise<void> {
    const result = await firstValueFrom(this.categoryService.list({ parentId: rootId }));
    if (result.ok) this.subs.set(result.data);
  }

  protected async submit(): Promise<void> {
    if (this.saving() || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.errorMessage.set(null);
    const payload = textBlockPayload({ ...this.form.getRawValue(), content: this.content() });
    const result =
      this.data.mode === 'edit' && this.data.textBlock
        ? await firstValueFrom(this.service.update(this.data.textBlock._id, payload))
        : await firstValueFrom(this.service.create(payload));
    this.saving.set(false);
    if (!result.ok) {
      this.errorMessage.set(extractErrorMessage(result.error));
      return;
    }
    this.ref.close(result.data);
  }
}
