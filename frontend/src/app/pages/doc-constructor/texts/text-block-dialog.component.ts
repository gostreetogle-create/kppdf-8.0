import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { marked } from 'marked';
import { PiDialogComponent } from '../../../shared/ui/dialog/pi-dialog.component';
import { PI_DIALOG_DATA, PI_DIALOG_REF } from '../../../shared/ui/dialog/dialog.tokens';
import type { DialogRef } from '../../../shared/ui/dialog/pi-dialog.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { TextBlock, TextBlocksService } from '../../../shared/services/pi-text-blocks.service';
import { extractErrorMessage } from '../../../core/silent-http';
import { PiToastService } from '../../../shared/ui/toast';

/**
 * TZ-86 Phase C.2 — TextBlockFormDialog.
 *
 * /doc-constructor/texts → «Создать / Редактировать».
 *
 * Side-by-side markdown preview (textarea :: rendered HTML), powered by
 * `marked` package (Phase C.0 install). Side-by-side reduces eye-saccade and
 * matches other TZ-86 spec contract — paper & ink design system tolerates
 * 50/50 split inside `width="lg"` dialog.
 *
 * Slug auto-generation: Russian transliteration (а→a, ё→yo, щ→shch, ю→yu, я→ya, …)
 * — mirrors backend transliteration (kebab-case + lowercase). If user supplies slug
 * manually, treat as override.
 *
 * Tags: comma-separated input, sanitised to kebab-case on commit.
 */
@Component({
  selector: 'app-text-block-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, PiDialogComponent, ButtonComponent],
  template: `
    <app-pi-dialog [title]="data ? 'Редактировать текстовый блок' : 'Новый текстовый блок'" [width]="'lg'" [showClose]="true">
      <div body class="grid grid-cols-2 gap-6">
        <div class="space-y-4">
          <label class="block text-sm">
            <span class="eyebrow block mb-1.5 text-ink">Название</span>
            <input class="pi-input w-full" formControlName="name" name="name" placeholder="Стандартные условия поставки" data-test="name-input" />
          </label>

          <label class="block text-sm">
            <span class="eyebrow block mb-1.5 text-ink">Slug</span>
            <input class="pi-input w-full font-mono text-xs" formControlName="slug" name="slug" placeholder="standartnye-usloviya-postavki" data-test="slug-input" />
            <span class="text-xs text-muted-foreground mt-1 block">автогенерация из названия — пусто = использовать серверную</span>
          </label>

          <fieldset>
            <legend class="eyebrow block mb-1.5 text-ink">Категория</legend>
            <div class="grid grid-cols-2 gap-2">
              @for (c of categories; track c.key) {
                <label class="flex items-center gap-2 cursor-pointer hairline px-3 py-2 rounded-sm hover:bg-paper-2 transition-colors">
                  <input type="radio" [value]="c.key" formControlName="category" name="category" />
                  <span class="text-sm">{{ c.label }}</span>
                </label>
              }
            </div>
          </fieldset>

          <label class="block text-sm">
            <span class="eyebrow block mb-1.5 text-ink">Теги (через запятую)</span>
            <input class="pi-input w-full" formControlName="tagsInput" name="tags" placeholder="поставка, оплата, гарантия" />
          </label>

          <label class="block text-sm">
            <span class="eyebrow block mb-1.5 text-ink">Содержимое (CommonMark markdown)</span>
            <textarea
              class="pi-input w-full font-mono text-xs"
              rows="14"
              formControlName="content"
              name="content"
              placeholder="# Условия&#10;&#10;1. Поставка в течение …&#10;2. Оплата по факту."
              data-test="content-input"
            ></textarea>
          </label>

          <div class="grid grid-cols-2 gap-4">
            <label class="block text-sm">
              <span class="eyebrow block mb-1.5 text-ink">Порядок</span>
              <input class="pi-input w-full" type="number" formControlName="sortOrder" name="sortOrder" placeholder="0" />
            </label>
            <label class="flex items-center gap-2 mt-7 cursor-pointer">
              <input type="checkbox" formControlName="isActive" name="isActive" />
              <span class="text-sm">Активен</span>
            </label>
          </div>
        </div>

        <div class="space-y-2">
          <span class="eyebrow text-ink">Предпросмотр</span>
          <div class="hairline rounded-sm bg-paper-2 px-5 py-4 text-sm text-ink min-h-[24rem] overflow-y-auto" [innerHTML]="previewHtml()"></div>
          <p class="text-xs text-muted-foreground">CommonMark: <code># заголовок</code>, <code>**жирный**</code>, <code>- список</code>, <code>[ссылка](url)</code>.</p>
        </div>
      </div>

      <div footer>
        @if (errorMessage()) {
          <span class="text-sm text-destructive mr-auto">{{ errorMessage() }}</span>
        }
        <app-pi-button variant="ghost" (click)="onCancel()" data-test="cancel-button">Отмена</app-pi-button>
        <app-pi-button
          variant="default"
          [disabled]="form.invalid || saving()"
          (click)="onSave()"
          data-test="save-button"
        >
          {{ saving() ? 'Сохранение…' : 'Сохранить' }}
        </app-pi-button>
      </div>
    </app-pi-dialog>
  `,
})
export class TextBlockFormDialogComponent {
  /** Provided by PiDialogService.open() via child DI injector. May be null for create mode. */
  protected readonly data: TextBlock | null = inject<TextBlock | null>(PI_DIALOG_DATA);

  private readonly ref = inject<DialogRef<TextBlock | null>>(PI_DIALOG_REF);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(TextBlocksService);
  private readonly toast = inject(PiToastService);

  /** Live markdown preview via marked. Sync = no flicker. */
  protected readonly previewHtml = computed<string>(() => {
    const raw = this.form.controls.content.value ?? '';
    return marked.parse(raw, { async: false }) as string;
  });

  protected readonly saving = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly categories: Array<{ key: TextBlock['category']; label: string }> = [
    { key: 'legal', label: 'Юридическое' },
    { key: 'intro', label: 'Вступление' },
    { key: 'outro', label: 'Заключение' },
    { key: 'custom', label: 'Прочее' },
  ];

  protected readonly form = this.fb.group({
    name: this.fb.control(this.data?.name ?? '', [Validators.required, Validators.maxLength(200)]),
    slug: this.fb.control(this.data?.slug ?? '', []),
    category: this.fb.control<TextBlock['category']>(this.data?.category ?? 'custom', [
      Validators.required,
    ]),
    tagsInput: this.fb.control(this.data?.tags?.join(', ') ?? '', []),
    content: this.fb.control(this.data?.content ?? '', [
      Validators.required,
      Validators.maxLength(10_000),
    ]),
    sortOrder: this.fb.control(this.data?.sortOrder ?? 0, []),
    isActive: this.fb.control(this.data?.isActive ?? true, []),
  });

  protected onCancel(): void {
    this.ref.close(null);
  }

  protected onSave(): void {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    this.errorMessage.set(null);

    const v = this.form.getRawValue();
    const tags = (v.tagsInput ?? '')
      .split(',')
      .map((t: string) => t.trim().toLowerCase().replace(/\s+/g, '-'))
      .filter(Boolean);

    const payload: Partial<TextBlock> = {
      name: v.name,
      slug: v.slug || undefined,
      category: v.category,
      tags,
      content: v.content,
      sortOrder: v.sortOrder,
      isActive: v.isActive,
    };

    const obs = this.data
      ? this.service.update(this.data._id, payload)
      : this.service.create(payload);

    obs.subscribe((res) => {
      this.saving.set(false);
      if (res.ok) {
        this.toast.success(this.data ? 'Текстовый блок обновлён' : 'Текстовый блок создан');
        this.ref.close(res.data);
      } else {
        const msg = extractErrorMessage(res.error as HttpErrorResponse);
        this.errorMessage.set(msg);
        this.toast.error(msg);
      }
    });
  }
}
