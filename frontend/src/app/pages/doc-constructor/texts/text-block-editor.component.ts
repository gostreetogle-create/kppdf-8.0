/**
 * TZ-104.6 — `TextBlockEditorComponent`.
 *
 * Visual editor for constructing text blocks with multi-column layout.
 * Each column gets its own `PiRichTextEditorComponent` instance.
 *
 * Layout:
 *   ┌─ Name ──────────────────────────────────────────┐
 *   ├──────────────────────────────────────────────────┤
 *   │ [1] [2] [3] [4] [5] [6] [7] [8]  ← Колонок     │
 *   ├────────┬────────┬────────┬────────┬──────────────┤
 *   │ Col 1  │ Col 2  │ Col 3  │ Col 4  │  [+]         │
 *   │ [RTE]  │ [RTE]  │ [RTE]  │ [RTE]  │              │
 *   └────────┴────────┴────────┴────────┴──────────────┘
 *   │ [✓ Активен]  [💾 Сохранить]  [✕ Отмена]         │
 * └────────────────────────────────────────────────────┘
 *
 * Emits `(save)` with the full TextBlock payload on save.
 * Emits `(cancel)` when the user presses Cancel.
 */

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { PiRichTextEditorComponent } from '../../../shared/ui/rich-text/pi-rich-text-editor.component';
import { PiToastService } from '../../../shared/ui/toast';
import { TextBlocksService, type TextBlock, type TextBlockColumn } from '../../../shared/services/pi-text-blocks.service';
import { extractErrorMessage } from '../../../core/silent-http';

@Component({
  selector: 'app-text-block-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ButtonComponent, PiRichTextEditorComponent],
  template: `
    <div class="tbe">
      <!-- Name -->
      <div class="tbe-field">
        <label class="tbe-label" for="tbe-name">Название блока</label>
        <input
          id="tbe-name"
          class="pi-input w-full"
          [formControl]="nameControl"
          placeholder="Например: Условия поставки"
        />
        @if (nameControl.invalid && (nameControl.dirty || nameControl.touched)) {
          <span class="tbe-error">Введите название</span>
        }
      </div>

      <!-- Column count selector -->
      <div class="tbe-columns-selector">
        <span class="tbe-label">Колонок:</span>
        <div class="tbe-columns-buttons">
          @for (n of columnOptions(); track n) {
            <button
              type="button"
              class="tbe-col-btn"
              [class.is-active]="columnsCount() === n"
              (click)="setColumns(n)"
              [attr.aria-label]="n + ' колонок'"
            >{{ n }}</button>
          }
          <span class="tbe-columns-hint">деление на равные части по ширине</span>
        </div>
      </div>

      <!-- Columns grid -->
      @if (columns().length > 0) {
        <div
          class="tbe-grid"
          [style.grid-template-columns]="gridTemplate()"
        >
          @for (col of columns(); track trackByColId($index, col); let idx = $index) {
            <div class="tbe-col">
              <div class="tbe-col-header">
                <span class="tbe-col-label">Часть {{ idx + 1 }}</span>
                @if (columns().length > 1) {
                  <button
                    type="button"
                    class="tbe-col-remove"
                    (click)="removeColumn(idx)"
                    title="Удалить колонку"
                    aria-label="Удалить колонку {{ idx + 1 }}"
                  >✕</button>
                }
              </div>
              <app-pi-rich-text
                [(value)]="col.content"
                [placeholder]="'Напишите текст для части ' + (idx + 1) + '…'"
                [showToolbar]="true"
              />
            </div>
          }
          @if (columns().length < 8) {
            <button
              type="button"
              class="tbe-add-col"
              (click)="addColumn()"
              title="Добавить колонку"
              aria-label="Добавить колонку"
            >
              <span class="tbe-add-col-plus">+</span>
              <span class="tbe-add-col-text">Колонку</span>
            </button>
          }
        </div>
      }

      <!-- Active toggle -->
      <label class="tbe-check">
        <input type="checkbox" [formControl]="activeControl" />
        <span>Блок активен (доступен в конструкторе документов)</span>
      </label>

      <!-- Error banner -->
      @if (errorMessage()) {
        <div role="alert" class="tbe-banner tbe-banner--error">
          {{ errorMessage() }}
        </div>
      }

      <!-- Actions -->
      <div class="tbe-actions">
        <app-pi-button variant="ghost" (click)="onCancel()">Отмена</app-pi-button>
        <app-pi-button
          variant="default"
          [disabled]="nameControl.invalid || saving()"
          (click)="onSave()"
        >
          {{ saving() ? 'Сохранение…' : 'Сохранить блок' }}
        </app-pi-button>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .tbe {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .tbe-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .tbe-label {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: oklch(var(--color-muted));
      }

      .tbe-error {
        font-size: 12px;
        color: oklch(var(--color-destructive));
      }

      .tbe-check {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: oklch(var(--color-ink));
        cursor: pointer;
        user-select: none;
      }

      .tbe-check input[type='checkbox'] {
        width: 16px;
        height: 16px;
        border: 1px solid oklch(var(--color-rule));
        border-radius: 2px;
        accent-color: oklch(var(--color-ink));
      }

      /* Column selector */
      .tbe-columns-selector {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }

      .tbe-columns-buttons {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .tbe-col-btn {
        width: 32px;
        height: 32px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 600;
        font-family: inherit;
        background: transparent;
        color: oklch(var(--color-ink));
        border: 1px solid oklch(var(--color-rule));
        border-radius: 2px;
        cursor: pointer;
        transition: all 80ms ease;
      }

      .tbe-col-btn:hover {
        background: oklch(var(--color-sunrise-soft));
      }

      .tbe-col-btn.is-active {
        background: oklch(var(--color-ink));
        color: oklch(var(--color-paper));
        border-color: oklch(var(--color-ink));
      }

      .tbe-columns-hint {
        font-size: 11px;
        color: oklch(var(--color-muted));
      }

      /* Grid */
      .tbe-grid {
        display: grid;
        gap: 12px;
        align-items: start;
      }

      .tbe-col {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .tbe-col-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 4px;
      }

      .tbe-col-label {
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: oklch(var(--color-muted));
      }

      .tbe-col-remove {
        width: 20px;
        height: 20px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        background: transparent;
        color: oklch(var(--color-muted));
        border: 1px solid transparent;
        border-radius: 2px;
        cursor: pointer;
        transition: all 80ms ease;
      }

      .tbe-col-remove:hover {
        color: oklch(var(--color-destructive));
        background: oklch(var(--color-destructive) / 0.1);
      }

      /* Add column button */
      .tbe-add-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        min-height: 100px;
        border: 1px dashed oklch(var(--color-rule));
        border-radius: 2px;
        background: transparent;
        color: oklch(var(--color-muted));
        cursor: pointer;
        transition: all 120ms ease;
        font-family: inherit;
        padding: 16px;
      }

      .tbe-add-col:hover {
        border-color: oklch(var(--color-ink));
        color: oklch(var(--color-ink));
        background: oklch(var(--color-sunrise-soft) / 0.3);
      }

      .tbe-add-col-plus {
        font-size: 28px;
        font-weight: 300;
        line-height: 1;
      }

      .tbe-add-col-text {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      /* Banner */
      .tbe-banner {
        padding: 10px 14px;
        font-size: 13px;
        border-radius: 2px;
      }

      .tbe-banner--error {
        background: oklch(var(--color-destructive) / 0.1);
        color: oklch(var(--color-destructive));
        border: 1px solid oklch(var(--color-destructive) / 0.3);
      }

      /* Actions */
      .tbe-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding-top: 8px;
        border-top: 1px solid oklch(var(--color-rule));
      }
    `,
  ],
})
export class TextBlockEditorComponent {
  /** Existing TextBlock to edit, or null for new block. */
  readonly block = input<TextBlock | null>(null);

  /** Emitted when user saves successfully. */
  readonly save = output<TextBlock>();

  /** Emitted when user cancels. */
  readonly cancel = output<void>();

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(TextBlocksService);
  private readonly toast = inject(PiToastService);

  protected readonly nameControl = this.fb.control('', [
    Validators.required,
    Validators.maxLength(200),
  ]);
  protected readonly activeControl = this.fb.control(true);

  /** Number of columns (signals-based, not formcontrol). */
  protected readonly columnsCount = signal<number>(1);

  /** Array of column data. */
  protected readonly columns = signal<TextBlockColumn[]>([]);

  protected readonly saving = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);

  /** Grid template columns — equal widths. */
  protected readonly gridTemplate = computed(() => {
    const count = this.columns().length;
    if (count <= 1) return '1fr';
    return '1fr '.repeat(count).trim();
  });

  protected readonly columnOptions = computed(() => {
    const opts: number[] = [];
    for (let i = 1; i <= 8; i++) opts.push(i);
    return opts;
  });

  constructor() {
    // Hydrate from existing block
    const existing = this.block();
    if (existing) {
      this.nameControl.setValue(existing.name);
      this.activeControl.setValue(existing.isActive);

      if (existing.columns && existing.columns.length > 0) {
        const cols = existing.columns.map((c) => ({
          id: c.id || crypto.randomUUID(),
          content: c.content || '',
          width: c.width || 1,
        }));
        this.columns.set(cols);
        this.columnsCount.set(cols.length);
      } else {
        // Single column from existing content
        this.columns.set([{
          id: crypto.randomUUID(),
          content: existing.content || '',
          width: 1,
        }]);
        this.columnsCount.set(1);
      }
    } else {
      // Fresh start — 1 empty column
      this.columns.set([this.makeColumn()]);
    }
  }

  protected trackByColId(_index: number, col: TextBlockColumn): string {
    return col.id;
  }

  protected setColumns(n: number): void {
    const current = this.columns();
    const currentLen = current.length;

    if (n === currentLen) return;

    if (n > currentLen) {
      // Add columns
      const toAdd = n - currentLen;
      const next = [...current];
      for (let i = 0; i < toAdd; i++) {
        next.push(this.makeColumn());
      }
      this.columns.set(next);
    } else {
      // Remove from end
      this.columns.set(current.slice(0, n));
    }

    this.columnsCount.set(n);
  }

  protected addColumn(): void {
    this.columns.update((cols) => [...cols, this.makeColumn()]);
    this.columnsCount.update((n) => n + 1);
  }

  protected removeColumn(index: number): void {
    const next = this.columns().filter((_, i) => i !== index);
    this.columns.set(next);
    this.columnsCount.set(next.length);
  }

  protected onCancel(): void {
    this.cancel.emit();
  }

  protected onSave(): void {
    if (this.nameControl.invalid || this.saving()) {
      this.nameControl.markAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const cols = this.columns();
    const payload: Partial<TextBlock> = {
      name: this.nameControl.value,
      isActive: this.activeControl.value,
      columns: cols,
      // For single-column blocks, also save as content for backward compat
      content: cols.length === 1 ? cols[0].content : '',
    };

    const obs = this.block()
      ? this.service.update(this.block()!._id, payload)
      : this.service.create(payload);

    obs.subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.ok) {
          this.toast.success(
            this.block() ? 'Блок сохранён' : 'Блок создан',
          );
          this.save.emit(res.data);
        } else {
          const msg = extractErrorMessage(res.error);
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

  private makeColumn(): TextBlockColumn {
    return { id: crypto.randomUUID(), content: '', width: 1 };
  }
}
