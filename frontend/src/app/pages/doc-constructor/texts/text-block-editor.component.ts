/**
 * TextBlockEditorComponent — редактор текстового блока (Stitch / Paper & Ink).
 *
 * Единая панель форматирования, постановочные данные, колоночная сетка.
 */

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  QueryList,
  ViewChildren,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import {
  PiRichTextEditorComponent,
  type ActiveStates,
} from '../../../shared/ui/rich-text/pi-rich-text-editor.component';
import { PiToastService } from '../../../shared/ui/toast';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { onDialogCloseOnce } from '../../../shared/util/on-dialog-close-once';
import { TextBlocksService, type TextBlock, type TextBlockColumn } from '../../../shared/services/pi-text-blocks.service';
import type { DataSourcesResponse } from '../../../shared/services/pi-registry.service';
import { extractErrorMessage } from '../../../core/silent-http';
import {
  DataFieldPickerDialogComponent,
  type DataFieldSelection,
} from './data-field-picker-dialog.component';

@Component({
  selector: 'app-text-block-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ButtonComponent, PiRichTextEditorComponent],
  template: `
    <section class="tbe-shell">
      <div class="tbe-accent" aria-hidden="true"></div>

      <header class="tbe-head">
        <span class="eyebrow text-sunrise-warm">Конструктор · Тексты</span>
        <h1 class="tbe-title font-display">Текстовые блоки</h1>
      </header>

      <div class="tbe-meta">
        <div class="tbe-meta-name">
          <label class="eyebrow text-muted-foreground" for="tbe-name">Название блока</label>
          <input
            id="tbe-name"
            class="tbe-input"
            [formControl]="nameControl"
            placeholder="Например: Технические характеристики"
          />
          @if (nameControl.invalid && (nameControl.dirty || nameControl.touched)) {
            <span class="tbe-error">Введите название</span>
          }
        </div>

        <div class="tbe-meta-cols">
          <span class="eyebrow text-muted-foreground">Колонок</span>
          <div class="tbe-col-seg" role="group" aria-label="Количество колонок">
            @for (n of columnOptions(); track n) {
              <button
                type="button"
                class="tbe-col-seg-btn"
                [class.is-active]="columnsCount() === n"
                (click)="setColumns(n)"
              >{{ n }}</button>
            }
          </div>
        </div>

        <label class="tbe-active-check">
          <input type="checkbox" [formControl]="activeControl" />
          <span class="eyebrow">Активен</span>
        </label>
      </div>

      @if (columns().length > 0) {
        <div class="tbe-toolbar hairline rounded-sm">
          <span class="tbe-toolbar-badge eyebrow">Колонка #{{ activeColIndex() + 1 }}</span>
          <span class="tbe-toolbar-sep" aria-hidden="true"></span>
          <div class="tbe-toolbar-group" role="toolbar" aria-label="Форматирование">
            <button type="button" class="tbe-tool" [class.is-active]="toolbarStates().h1" (click)="runCmd('h1')">H1</button>
            <button type="button" class="tbe-tool" [class.is-active]="toolbarStates().h2" (click)="runCmd('h2')">H2</button>
            <button type="button" class="tbe-tool" [class.is-active]="toolbarStates().h3" (click)="runCmd('h3')">H3</button>
            <span class="tbe-toolbar-sep" aria-hidden="true"></span>
            <button type="button" class="tbe-tool" [class.is-active]="toolbarStates().bold" (click)="runCmd('bold')"><strong>B</strong></button>
            <button type="button" class="tbe-tool" [class.is-active]="toolbarStates().italic" (click)="runCmd('italic')"><em>I</em></button>
            <button type="button" class="tbe-tool" [class.is-active]="toolbarStates().underline" (click)="runCmd('underline')"><u>U</u></button>
            <span class="tbe-toolbar-sep" aria-hidden="true"></span>
            <button type="button" class="tbe-tool" [class.is-active]="toolbarStates().alignLeft" (click)="runCmd('left')" title="По левому краю">≡</button>
            <button type="button" class="tbe-tool" [class.is-active]="toolbarStates().alignCenter" (click)="runCmd('center')" title="По центру">≡</button>
            <button type="button" class="tbe-tool" [class.is-active]="toolbarStates().alignRight" (click)="runCmd('right')" title="По правому краю">≡</button>
          </div>
        </div>

        <div class="tbe-data-strip hairline-y">
          <div class="tbe-data-strip-left">
            <span class="eyebrow">Постановочные данные</span>
            <span class="text-sm text-muted-foreground italic">
              Вставка в колонку #{{ activeColIndex() + 1 }} — токены подставляются при сборке документа
            </span>
          </div>
          <app-pi-button variant="outline" size="sm" class="tbe-data-btn" (click)="openDataPicker()">
            ⊕ Вставить поле…
          </app-pi-button>
        </div>

        <div class="tbe-workspace">
          <div class="tbe-tabs" role="tablist">
            @for (col of columns(); track trackByColId($index, col); let idx = $index) {
              <button
                type="button"
                class="tbe-tab eyebrow"
                [class.is-active]="activeColIndex() === idx"
                (click)="selectColumn(idx)"
              >#{{ idx + 1 }}</button>
            }
            @if (columns().length < 8) {
              <button type="button" class="tbe-tab tbe-tab--add eyebrow" (click)="addColumn()">+</button>
            }
          </div>

          <div class="tbe-grid" [style.grid-template-columns]="gridTemplate()">
            @for (col of columns(); track trackByColId($index, col); let idx = $index) {
              <div
                class="tbe-col"
                [class.is-active]="activeColIndex() === idx"
                [class.is-dimmed]="activeColIndex() !== idx"
                (mousedown)="selectColumn(idx)"
              >
                @if (isColumnEmpty(col)) {
                  <div class="tbe-col-empty eyebrow text-muted-foreground">Пусто</div>
                }
                <app-pi-rich-text
                  [value]="col.content"
                  (valueChange)="onColumnContentChange(idx, $event)"
                  [placeholder]="'Колонка ' + (idx + 1) + '…'"
                  [showToolbar]="false"
                  [selected]="activeColIndex() === idx"
                  (activate)="selectColumn(idx)"
                  (statesChange)="onEditorStatesChange(idx, $event)"
                />
              </div>
            }
          </div>
        </div>
      }

      <footer class="tbe-footer hairline-t">
        @if (errorMessage()) {
          <div role="alert" class="tbe-banner tbe-banner--error">{{ errorMessage() }}</div>
        }
        <div class="tbe-footer-actions">
          <app-pi-button variant="ghost" (click)="onCancel()">Отмена</app-pi-button>
          <app-pi-button variant="default" [disabled]="nameControl.invalid || saving()" (click)="onSave()">
            {{ saving() ? 'Сохранение…' : 'Сохранить блок' }}
          </app-pi-button>
        </div>
      </footer>
    </section>
  `,
  styles: [`
    :host { display: block; }

    .tbe-shell {
      position: relative;
      display: flex;
      flex-direction: column;
      background: var(--color-paper);
      border: 2px solid var(--color-ink);
      overflow: hidden;
    }

    .tbe-accent {
      height: 4px;
      background: linear-gradient(
        90deg,
        var(--color-sunrise-warm),
        var(--color-sunrise-glow),
        var(--color-sunrise-warm)
      );
    }

    .tbe-head {
      padding: 24px 32px 8px;
    }
    .tbe-title {
      margin: 8px 0 0;
      font-size: 32px;
      font-weight: 600;
      line-height: 1.2;
      color: var(--color-ink);
    }

    .tbe-meta {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      gap: 24px;
      padding: 0 32px 24px;
    }
    .tbe-meta-name {
      flex: 1 1 280px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 0;
    }
    .tbe-input {
      width: 100%;
      padding: 12px 16px;
      font-size: 16px;
      font-family: inherit;
      color: var(--color-ink);
      background: var(--color-paper-main, var(--color-paper));
      border: 1px solid var(--color-rule);
      border-radius: 0;
    }
    .tbe-input:focus {
      outline: none;
      border-color: var(--color-ink);
      outline: 1px solid var(--color-sunrise-warm);
      outline-offset: -1px;
    }
    .tbe-error { font-size: 12px; color: var(--color-destructive); }

    .tbe-meta-cols {
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex-shrink: 0;
    }
    .tbe-col-seg {
      display: flex;
      border: 1px solid var(--color-ink);
    }
    .tbe-col-seg-btn {
      min-width: 40px;
      padding: 12px 14px;
      font-family: ui-monospace, monospace;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      background: var(--color-paper);
      color: var(--color-ink);
      border: none;
      border-left: 1px solid var(--color-rule);
      cursor: pointer;
    }
    .tbe-col-seg-btn:first-child { border-left: none; }
    .tbe-col-seg-btn:hover { background: var(--color-paper-2); }
    .tbe-col-seg-btn.is-active {
      background: var(--color-ink);
      color: var(--color-paper);
    }

    .tbe-active-check {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 4px;
      cursor: pointer;
      user-select: none;
    }
    .tbe-active-check input {
      width: 18px;
      height: 18px;
      accent-color: var(--color-ink);
    }

    .tbe-toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 32px 16px;
      padding: 4px 8px;
      background: var(--color-paper-2);
    }
    .tbe-toolbar-badge {
      padding: 6px 12px;
      background: var(--color-ink);
      color: var(--color-paper);
      flex-shrink: 0;
    }
    .tbe-toolbar-sep {
      width: 1px;
      height: 24px;
      background: var(--color-rule);
      flex-shrink: 0;
    }
    .tbe-toolbar-group {
      display: flex;
      align-items: center;
      gap: 2px;
      flex-wrap: wrap;
    }
    .tbe-tool {
      min-width: 32px;
      height: 32px;
      padding: 0 8px;
      font-size: 12px;
      font-weight: 700;
      background: transparent;
      border: none;
      color: var(--color-ink);
      cursor: pointer;
    }
    .tbe-tool:hover { background: var(--color-paper); }
    .tbe-tool.is-active {
      background: var(--color-ink);
      color: var(--color-paper);
    }

    .tbe-data-strip {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 32px;
      background: var(--color-paper-2);
    }
    .tbe-data-strip-left {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 12px;
      min-width: 0;
    }
    :host ::ng-deep .tbe-data-btn {
      border-color: var(--color-sunrise-warm) !important;
      color: var(--color-ink);
    }

    .tbe-workspace {
      padding: 0 32px 32px;
      background: var(--color-paper-2);
    }
    .tbe-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 16px;
    }
    .tbe-tab {
      padding: 8px 20px;
      background: var(--color-paper);
      border: 1px solid var(--color-rule);
      color: var(--color-ink);
      cursor: pointer;
    }
    .tbe-tab.is-active {
      background: var(--color-ink);
      color: var(--color-paper);
      border-color: var(--color-ink);
    }
    .tbe-tab--add {
      border-style: dashed;
      color: var(--color-muted-foreground-strong);
    }
    .tbe-tab--add:hover {
      border-color: var(--color-ink);
      color: var(--color-ink);
    }

    .tbe-grid {
      display: grid;
      gap: 24px;
      align-items: stretch;
    }
    .tbe-col {
      position: relative;
      min-height: 240px;
      padding: 16px;
      background: var(--color-paper-main, var(--color-paper));
      border: 2px solid var(--color-rule);
      transition: border-color 120ms ease, opacity 120ms ease;
    }
    .tbe-col.is-active {
      background: var(--color-paper);
      border-color: var(--color-sunrise-warm);
      opacity: 1;
    }
    .tbe-col.is-dimmed {
      opacity: 0.6;
    }
    .tbe-col-empty {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      z-index: 0;
    }
    .tbe-col app-pi-rich-text {
      position: relative;
      z-index: 1;
      display: block;
      min-height: 180px;
    }

    .tbe-footer {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      gap: 16px;
      padding: 24px 32px;
    }
    .tbe-footer-actions {
      display: flex;
      gap: 12px;
      margin-left: auto;
    }
    .tbe-banner {
      flex: 1 1 100%;
      padding: 8px 12px;
      font-size: 13px;
      border-radius: 2px;
    }
    .tbe-banner--error {
      background: color-mix(in oklch, var(--color-destructive) 10%, transparent);
      color: var(--color-destructive);
      border: 1px solid color-mix(in oklch, var(--color-destructive) 30%, transparent);
    }
  `],
})
export class TextBlockEditorComponent {
  readonly block = input<TextBlock | null>(null);
  readonly save = output<TextBlock>();
  readonly cancel = output<void>();

  @ViewChildren(PiRichTextEditorComponent) private editors!: QueryList<PiRichTextEditorComponent>;

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(TextBlocksService);
  private readonly toast = inject(PiToastService);
  private readonly dialog = inject(PiDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly nameControl = this.fb.control('', [Validators.required, Validators.maxLength(200)]);
  protected readonly activeControl = this.fb.control(true);

  protected readonly columnsCount = signal<number>(1);
  protected readonly columns = signal<TextBlockColumn[]>([]);
  protected readonly activeColIndex = signal<number>(0);
  protected readonly saving = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly toolbarStates = signal<ActiveStates>({
    bold: false, italic: false, underline: false,
    h1: false, h2: false, h3: false,
    alignLeft: false, alignCenter: false, alignRight: false,
  });

  protected readonly registryRes = httpResource<DataSourcesResponse>(
    () => '/api/registry/data-sources',
    { defaultValue: { sources: [] } },
  );

  protected readonly gridTemplate = computed(() => {
    const n = this.columns().length;
    if (n <= 1) return '1fr';
    return `repeat(${n}, minmax(0, 1fr))`;
  });

  protected readonly columnOptions = computed(() => Array.from({ length: 8 }, (_, i) => i + 1));

  constructor() {
    const existing = this.block();
    if (existing) {
      this.nameControl.setValue(existing.name);
      this.activeControl.setValue(existing.isActive);
      if (existing.columns && existing.columns.length > 0) {
        this.columns.set(existing.columns.map((c) => ({
          id: c.id || crypto.randomUUID(),
          content: c.content || '',
          width: c.width ?? 1,
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

  protected trackByColId(_index: number, col: TextBlockColumn): string {
    return col.id;
  }

  protected isColumnEmpty(col: TextBlockColumn): boolean {
    const html = col.content?.trim() ?? '';
    return !html || html === '<p></p>' || html === '<p><br></p>';
  }

  protected selectColumn(index: number): void {
    this.activeColIndex.set(index);
    queueMicrotask(() => {
      const ed = this.editors?.get(index);
      ed?.refreshActiveStates();
      if (ed) this.toolbarStates.set(ed.getActiveStates());
    });
  }

  protected onEditorStatesChange(index: number, states: ActiveStates): void {
    if (index === this.activeColIndex()) {
      this.toolbarStates.set(states);
    }
  }

  protected onColumnContentChange(index: number, html: string): void {
    this.columns.update((cols) =>
      cols.map((c, i) => (i === index ? { ...c, content: html } : c)),
    );
  }

  protected runCmd(cmd: 'bold' | 'italic' | 'underline' | 'h1' | 'h2' | 'h3' | 'left' | 'center' | 'right'): void {
    const ed = this.editors?.get(this.activeColIndex());
    if (!ed) return;
    ed.focusEditor();
    switch (cmd) {
      case 'bold': ed.toggleBold(); break;
      case 'italic': ed.toggleItalic(); break;
      case 'underline': ed.toggleUnderline(); break;
      case 'h1': ed.toggleHeading(1); break;
      case 'h2': ed.toggleHeading(2); break;
      case 'h3': ed.toggleHeading(3); break;
      case 'left': ed.setTextAlign('left'); break;
      case 'center': ed.setTextAlign('center'); break;
      case 'right': ed.setTextAlign('right'); break;
    }
    queueMicrotask(() => this.toolbarStates.set(ed.getActiveStates()));
  }

  protected setColumns(n: number): void {
    const current = this.columns();
    if (n === current.length) return;
    if (n > current.length) {
      const next = [...current];
      for (let i = 0; i < n - current.length; i++) next.push(this.makeColumn());
      this.columns.set(next);
    } else {
      this.columns.set(current.slice(0, n));
      if (this.activeColIndex() >= n) this.activeColIndex.set(n - 1);
    }
    this.columnsCount.set(n);
  }

  protected addColumn(): void {
    if (this.columns().length >= 8) return;
    this.columns.update((cols) => [...cols, this.makeColumn()]);
    this.columnsCount.update((n) => n + 1);
    this.selectColumn(this.columns().length - 1);
  }

  protected openDataPicker(): void {
    const colIndex = this.activeColIndex();
    this.editors?.get(colIndex)?.saveSelection();

    const sources = this.registryRes.value()?.sources ?? [];
    const ref = this.dialog.open<DataFieldSelection | null>(DataFieldPickerDialogComponent, {
      data: { sources, columnIndex: colIndex },
      width: '896px',
      parentDestroyRef: this.destroyRef,
    });
    onDialogCloseOnce(ref, this.injector, (sel) => {
      if (!sel) return;
      const token = `{{${sel.source}.${sel.field.key}}}`;
      // Defer until dialog overlay releases focus trap.
      requestAnimationFrame(() => {
        this.editors?.get(colIndex)?.insertContent(token);
      });
    });
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
