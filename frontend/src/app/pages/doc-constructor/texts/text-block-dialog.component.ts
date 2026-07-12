import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
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
 * Dialog for creating/editing a text block.
 *
 * Simplified: slug, category, tags, sortOrder removed — too confusing.
 * Only name + content + isActive. Russian-only interface.
 * Preview uses `marked` for live rendering.
 */
@Component({
  selector: 'app-text-block-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, PiDialogComponent, ButtonComponent],
  template: `
    <app-pi-dialog
      [title]="data ? 'Редактировать текстовый блок' : 'Новый текстовый блок'"
      [width]="'xl'"
      [maxWidth]="'1000px'"
    >
      <div body class="space-y-6">
        @if (errorMessage()) {
          <div
            role="alert"
            class="border hairline border-destructive rounded-sm px-4 py-3 text-sm text-destructive"
          >
            {{ errorMessage() }}
          </div>
        }

        <label class="block">
          <span class="eyebrow block mb-1.5 text-ink">Название</span>
          <input
            class="pi-input w-full"
            formControlName="name"
            name="name"
            placeholder="Например: Стандартные условия поставки"
            data-test="name-input"
          />
          @if (form.controls.name.invalid && (form.controls.name.dirty || form.controls.name.touched)) {
            <span class="text-xs text-destructive mt-1 block">Название обязательно</span>
          }
        </label>

        <label class="block">
          <span class="eyebrow block mb-1.5 text-ink">Содержимое</span>
          <textarea
            class="pi-input w-full font-mono text-sm"
            rows="12"
            formControlName="content"
            name="content"
            placeholder="Напишите текст блока..."
            data-test="content-input"
          ></textarea>
          <div class="flex items-center gap-1 mt-1">
            <span class="text-xs text-muted-foreground">
              Для форматирования используйте:
            </span>
            <span class="text-xs text-muted-foreground bg-paper-2 px-1.5 py-0.5 rounded-sm font-mono"># Заголовок</span>
            <span class="text-xs text-muted-foreground">·</span>
            <span class="text-xs text-muted-foreground bg-paper-2 px-1.5 py-0.5 rounded-sm font-mono">**жирный**</span>
            <span class="text-xs text-muted-foreground">·</span>
            <span class="text-xs text-muted-foreground bg-paper-2 px-1.5 py-0.5 rounded-sm font-mono">- список</span>
            <span class="text-xs text-muted-foreground">·</span>
            <span class="text-xs text-muted-foreground bg-paper-2 px-1.5 py-0.5 rounded-sm font-mono">[ссылка](url)</span>
          </div>
        </label>

        <!-- Live preview -->
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="eyebrow text-ink">Предпросмотр</span>
            @if (form.controls.content.value) {
              <span class="text-xs text-muted-foreground">(обновляется по мере ввода)</span>
            }
          </div>
          <div
            class="hairline rounded-sm bg-paper-2/50 px-5 py-4 text-sm text-ink min-h-[8rem] max-h-[20rem] overflow-y-auto"
            [innerHTML]="previewHtml()"
          >
            @if (!form.controls.content.value) {
              <p class="text-muted-foreground italic">Напишите содержимое — предпросмотр появится здесь</p>
            }
          </div>
        </div>

        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" formControlName="isActive" name="isActive"
            class="w-4 h-4 rounded-sm border-rule text-ink focus:ring-ink" />
          <span class="text-sm">Блок активен (доступен для вставки в шаблоны)</span>
        </label>
      </div>

      <div footer>
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
  protected readonly data: TextBlock | null = inject<TextBlock | null>(PI_DIALOG_DATA);

  private readonly ref = inject<DialogRef<TextBlock | null>>(PI_DIALOG_REF);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(TextBlocksService);
  private readonly toast = inject(PiToastService);

  protected readonly previewHtml = computed<string>(() => {
    const raw = this.form.controls.content.value ?? '';
    if (!raw.trim()) return '';
    try {
      return marked.parse(raw, { async: false }) as string;
    } catch {
      return '<p class="text-destructive">Ошибка при обработке содержимого</p>';
    }
  });

  protected readonly saving = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.group({
    name: this.fb.control(this.data?.name ?? '', [Validators.required, Validators.maxLength(200)]),
    content: this.fb.control(this.data?.content ?? '', [
      Validators.required,
      Validators.maxLength(10_000),
    ]),
    isActive: this.fb.control(this.data?.isActive ?? true, []),
  });

  protected onCancel(): void {
    this.ref.close(null);
  }

  protected onSave(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const v = this.form.getRawValue();
    const payload: Partial<TextBlock> = {
      name: v.name,
      content: v.content,
      isActive: v.isActive,
    };

    const obs = this.data
      ? this.service.update(this.data._id, payload)
      : this.service.create(payload);

    obs.subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.ok) {
          this.toast.success(this.data ? 'Текстовый блок сохранён' : 'Текстовый блок создан');
          this.ref.close(res.data);
        } else {
          const msg = extractErrorMessage(res.error as HttpErrorResponse);
          this.errorMessage.set(msg);
          this.toast.error(msg);
        }
      },
      error: (err) => {
        this.saving.set(false);
        const msg = extractErrorMessage(err);
        this.errorMessage.set(msg);
        this.toast.error(msg);
      },
    });
  }
}
