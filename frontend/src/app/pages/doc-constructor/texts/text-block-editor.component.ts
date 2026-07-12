/**
 * TZ-104.6 — `TextBlockEditorComponent`
 *
 * Визуальный редактор текстового блока.
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │ Название блока: [________________________]                  │
 * │                                                             │
 * │ Колонок: [1] [2] [3] [4] [5] [6] [7] [8]                  │
 * │                                                             │
 * │ ┌─ Документ ────────────────────────────────────────────┐ │
 * │ │ ░░░░░░░░░░░░░░░░░░ (серый фон, чтобы рамки видны) ░░ │ │
 * │ │  ┌────────── #1 ──────────┐ ┌────────── #2 ────────┐ │ │
 * │ │  │ [B] [I] [U] | [≡] [≡] │ │ [B] [I] [U] | [≡] [≡]│ │ │
 * │ │  │                       │ │                       │ │ │
 * │ │  │ текст...              │ │ текст...              │ │ │
 * │ │  └───────────────────────┘ └───────────────────────┘ │ │
 * │ └──────────────────────────────────────────────────────┘ │
 * │                                                           │
 * │ [✓ Активен]              [Отмена] [Сохранить блок]       │
 * └───────────────────────────────────────────────────────────┘
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
      <!-- ── Name field ── -->
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

      <!-- ── Column count selector ── -->
      <div class="tbe-columns-selector">
        <span class="tbe-label">Колонок:</span>
        <div class="tbe-columns-buttons">
          @for (n of columnOptions(); track n) {
            <button
              type="button"
              class="tbe-col-btn"
              [class.is-active]="columnsCount() === n"
              (click)="setColumns(n)"
            >{{ n }}</button>
          }
          <span class="tbe-columns-hint">— равные части по ширине</span>
        </div>
      </div>

      <!-- ── Document preview frame ── -->
      @if (columns().length > 0) {
        <div class="tbe-doc-frame">
          <div class="tbe-doc-frame-bar">
            <span class="tbe-doc-frame-bar-label">{{ nameControl.value || 'Текстовый блок' }}</span>
            <span class="tbe-doc-frame-bar-cols">{{ columns().length }} колонк{{ columns().length === 1 ? 'а' : columns().length < 5 ? 'и' : 'ок' }}</span>
          </div>

          <div class="tbe-doc-frame-body">
            <div
              class="tbe-grid"
              [style.grid-template-columns]="gridTemplate()"
            >
              @for (col of columns(); track trackByColId($index, col); let idx = $index) {
                <div class="tbe-block" [class.tbe-block--last]="idx === columns().length - 1">
                  <div class="tbe-block-toolbar">
                    <span class="tbe-block-toolbar-label">#{{ idx + 1 }}</span>
                    @if (columns().length > 1) {
                      <span class="tbe-block-remove-wrap">
                        <button
                          type="button"
                          class="tbe-block-remove"
                          (click)="removeColumn(idx)"
                          title="Удалить колонку"
                          aria-label="Удалить колонку {{ idx + 1 }}"
                        >✕</button>
                      </span>
                    }
                  </div>
                  <app-pi-rich-text
                    [(value)]="col.content"
                    [placeholder]="'Колонка ' + (idx + 1) + '…'"
                    [showToolbar]="true"
                    [compact]="true"
                  />
                </div>
              }

              @if (columns().length < 8) {
                <button type="button" class="tbe-block tbe-block--add" (click)="addColumn()"
                  title="Добавить колонку" aria-label="Добавить колонку">
                  <span class="tbe-block-add-icon">+</span>
                  <span class="tbe-block-add-text">Колонку</span>
                </button>
              }
            </div>
          </div>
        </div>
      }

      <!-- ── Controls row ── -->
      <div class="tbe-controls">
        <div class="tbe-controls-left">
          <label class="tbe-check">
            <input type="checkbox" [formControl]="activeControl" />
            <span>Активен</span>
          </label>
          @if (errorMessage()) {
            <div role="alert" class="tbe-banner tbe-banner--error">{{ errorMessage() }}</div>
          }
        </div>

        <div class="tbe-actions">
          <app-pi-button variant="ghost" (click)="onCancel()">Отмена</app-pi-button>
          <app-pi-button variant="default" [disabled]="nameControl.invalid || saving()" (click)="onSave()">
            {{ saving() ? 'Сохранение…' : 'Сохранить блок' }}
          </app-pi-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .tbe {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .tbe-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
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

    /* ── Column selector ── */
    .tbe-columns-selector {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .tbe-columns-buttons {
      display: flex;
      align-items: center;
      gap: 3px;
    }

    .tbe-col-btn {
      width: 30px;
      height: 30px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      font-family: inherit;
      background: oklch(var(--color-paper-2) / 0.4);
      color: oklch(var(--color-ink));
      border: 1px solid oklch(var(--color-rule));
      border-radius: 4px;
      cursor: pointer;
      transition: all 100ms ease;
    }
    .tbe-col-btn:hover {
      background: oklch(var(--color-sunrise-soft));
      border-color: oklch(var(--color-ink) / 0.4);
    }
    .tbe-col-btn.is-active {
      background: oklch(var(--color-ink));
      color: oklch(var(--color-paper));
      border-color: oklch(var(--color-ink));
      box-shadow: 0 0 0 2px oklch(var(--color-ink) / 0.25);
    }

    .tbe-columns-hint {
      font-size: 11px;
      color: oklch(var(--color-muted));
    }

    /* ── Document preview frame ── */
    .tbe-doc-frame {
      border: 2px solid oklch(var(--color-rule));
      border-radius: 4px;
      background: oklch(var(--color-paper));
      box-shadow: 0 2px 6px oklch(0 0 0 / 0.06);
      overflow: hidden;
    }

    .tbe-doc-frame-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 14px;
      background: oklch(var(--color-paper-2));
      border-bottom: 2px solid oklch(var(--color-rule));
    }

    .tbe-doc-frame-bar-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: oklch(var(--color-muted));
    }

    .tbe-doc-frame-bar-cols {
      font-size: 10px;
      color: oklch(var(--color-muted));
      opacity: 0.6;
    }

    .tbe-doc-frame-body {
      padding: 12px;
      background: oklch(var(--color-paper-2) / 0.45);
    }

    .tbe-grid {
      display: grid;
      gap: 0;
      align-items: stretch;
    }

    /* ── Individual block ── */
    .tbe-block {
      display: flex;
      flex-direction: column;
      border: 1px solid oklch(var(--color-rule));
      border-right: none;
      background: oklch(var(--color-paper));
      overflow: hidden;
      transition: border-color 120ms ease, box-shadow 120ms ease;
    }
    .tbe-block:hover {
      border-color: oklch(var(--color-ink) / 0.45);
      box-shadow: inset 0 0 0 1px oklch(var(--color-ink) / 0.12);
    }
    .tbe-block--last {
      border-right: 1px solid oklch(var(--color-rule));
    }
    .tbe-block--last:hover {
      border-right-color: oklch(var(--color-ink) / 0.45);
    }

    .tbe-block-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px 10px;
      background: oklch(var(--color-paper-2) / 0.5);
      border-bottom: 1px solid oklch(var(--color-rule));
    }

    .tbe-block-toolbar-label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: oklch(var(--color-muted));
    }

    .tbe-block-remove-wrap {
      display: flex;
    }

    .tbe-block-remove {
      width: 20px;
      height: 20px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      background: transparent;
      color: oklch(var(--color-destructive) / 0.6);
      border: 1px solid transparent;
      border-radius: 3px;
      cursor: pointer;
      transition: all 100ms ease;
    }
    .tbe-block-remove:hover {
      color: oklch(var(--color-destructive));
      background: oklch(var(--color-destructive) / 0.12);
      border-color: oklch(var(--color-destructive) / 0.25);
    }

    /* ── Add column button ── */
    .tbe-block--add {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      min-height: 70px;
      border: 1px dashed oklch(var(--color-rule));
      border-right: 1px dashed oklch(var(--color-rule));
      background: transparent;
      color: oklch(var(--color-muted));
      cursor: pointer;
      transition: all 120ms ease;
      font-family: inherit;
      padding: 12px;
    }
    .tbe-block--add:hover {
      border-color: oklch(var(--color-ink));
      color: oklch(var(--color-ink));
      background: oklch(var(--color-sunrise-soft) / 0.3);
    }
    .tbe-block-add-icon { font-size: 22px; font-weight: 200; line-height: 1; }
    .tbe-block-add-text { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }

    /* ── Controls row ── */
    .tbe-controls {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding-top: 12px;
      border-top: 1px solid oklch(var(--color-rule));
    }

    .tbe-controls-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .tbe-check {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: oklch(var(--color-ink));
      cursor: pointer;
      user-select: none;
    }
    .tbe-check input[type='checkbox'] {
      width: 14px;
      height: 14px;
      border: 1px solid oklch(var(--color-rule));
      border-radius: 2px;
      accent-color: oklch(var(--color-ink));
    }

    .tbe-banner {
      padding: 6px 10px;
      font-size: 12px;
      border-radius: 2px;
    }
    .tbe-banner--error {
      background: oklch(var(--color-destructive) / 0.1);
      color: oklch(var(--color-destructive));
      border: 1px solid oklch(var(--color-destructive) / 0.3);
    }

    .tbe-actions {
      display: flex;
      gap: 8px;
    }
  `],
})
export class TextBlockEditorComponent {
  readonly block = input<TextBlock | null>(null);
  readonly save = output<TextBlock>();
  readonly cancel = output<void>();

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(TextBlocksService);
  private readonly toast = inject(PiToastService);

  protected readonly nameControl = this.fb.control('', [Validators.required, Validators.maxLength(200)]);
  protected readonly activeControl = this.fb.control(true);

  protected readonly columnsCount = signal<number>(1);
  protected readonly columns = signal<TextBlockColumn[]>([]);
  protected readonly saving = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);

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
    const existing = this.block();
    if (existing) {
      this.nameControl.setValue(existing.name);
      this.activeControl.setValue(existing.isActive);
      if (existing.columns && existing.columns.length > 0) {
        this.columns.set(existing.columns.map((c) => ({
          id: c.id || crypto.randomUUID(),
          content: c.content || '',
          width: c.width || 1,
        })));
        this.columnsCount.set(existing.columns.length);
      } else {
        this.columns.set([{ id: crypto.randomUUID(), content: existing.content || '', width: 1 }]);
        this.columnsCount.set(1);
      }
    } else {
      this.columns.set([this.makeColumn()]);
    }
  }

  protected trackByColId(_index: number, col: TextBlockColumn): string { return col.id; }

  protected setColumns(n: number): void {
    const current = this.columns();
    if (n === current.length) return;
    if (n > current.length) {
      const next = [...current];
      for (let i = 0; i < n - current.length; i++) next.push(this.makeColumn());
      this.columns.set(next);
    } else {
      this.columns.set(current.slice(0, n));
    }
    this.columnsCount.set(n);
  }

  protected addColumn(): void {
    this.columns.update((cols) => [...cols, this.makeColumn()]);
    this.columnsCount.update((n) => n + 1);
  }

  protected removeColumn(index: number): void {
    this.columns.update((cols) => cols.filter((_, i) => i !== index));
    this.columnsCount.update((n) => n - 1);
  }

  protected onCancel(): void { this.cancel.emit(); }

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
      content: cols.length === 1 ? cols[0].content : '',
    };

    const obs = this.block()
      ? this.service.update(this.block()!._id, payload)
      : this.service.create(payload);

    obs.subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.ok) {
          this.toast.success(this.block() ? 'Блок сохранён' : 'Блок создан');
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
