/**
 * TextBlockEditorComponent — редактор текстового блока.
 *
 * Колоночная сетка, форматирование, размер шрифта, ширина колонок.
 * Колонки управляются через кнопки внизу (← ✕ →).
 * Тулбар применяет форматирование ко всей карточке если нет фокуса в тексте.
 */

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  QueryList,
  ViewChildren,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { httpResource } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { merge } from 'rxjs';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { SwitchComponent } from '../../../shared/ui/switch/switch.component';
import {
  PiRichTextEditorComponent,
  type ActiveStates,
} from '../../../shared/ui/rich-text/pi-rich-text-editor.component';
import { LucideAngularModule, AlignLeft, AlignCenter, AlignRight } from 'lucide-angular';
import { PiToastService } from '../../../shared/ui/toast';
import { PiDialogService } from '../../../shared/ui/dialog/pi-dialog.service';
import { onDialogCloseOnce } from '../../../shared/util/on-dialog-close-once';
import {
  TextBlocksService,
  type TextBlock,
  type TextBlockColumn,
} from '../../../shared/services/pi-text-blocks.service';
import {
  TextBlockCategoriesService,
  type TextBlockCategory,
} from '../../../shared/services/pi-text-block-categories.service';
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
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    SwitchComponent,
    PiRichTextEditorComponent,
    LucideAngularModule,
  ],
  template: `
    <section class="tbe-shell">
      <div class="tbe-accent" aria-hidden="true"></div>

      <header class="tbe-head">
        <span class="eyebrow text-sunrise-warm">Конструктор · Тексты</span>
        <h1 class="tbe-title font-display">Текстовые блоки</h1>
      </header>

      <div class="tbe-meta">
        <div class="tbe-meta-category">
          <label class="eyebrow text-muted-foreground" for="tbe-category">Категория</label>
          <select
            id="tbe-category"
            class="tbe-category-select"
            [value]="selectedCategoryId() ?? ''"
            (change)="onCategoryChange($event)"
            [disabled]="categoryLoading()"
            aria-label="Категория текстового блока"
            data-test="tbe-category-select"
          >
            <option value="">
              {{ categoryLoading() ? 'Загрузка…' : 'Не выбрана (будет назначена автоматически)' }}
            </option>
            @for (cat of categories(); track cat._id) {
              <option [value]="cat._id">{{ cat.name }}</option>
            }
          </select>
          @if (!categoryLoading() && categories().length === 0) {
            <span class="tbe-category-empty">Категорий нет — создайте в справочнике</span>
          }
        </div>

        <div class="tbe-meta-name">
          <label class="eyebrow text-muted-foreground" for="tbe-name">Название блока</label>
          <input
            id="tbe-name"
            class="tbe-input"
            [class.tbe-input--invalid]="nameInvalid()"
            [attr.aria-invalid]="nameInvalid() ? true : null"
            [formControl]="nameControl"
            placeholder="Например: Технические характеристики"
          />
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
              >
                {{ n }}
              </button>
            }
          </div>
        </div>

        <div class="tbe-active-switch">
          <span class="eyebrow" id="tbe-active-label">Активен</span>
          <app-pi-switch
            [checked]="activeControl.value"
            (checkedChange)="activeControl.setValue($event)"
            ariaLabel="Активен"
            id="tbe-is-active"
          />
        </div>
      </div>

      @if (columns().length > 0) {
        <div class="tbe-toolbar hairline rounded-sm">
          <span class="tbe-toolbar-badge eyebrow">Колонка #{{ activeColIndex() + 1 }}</span>
          <span class="tbe-toolbar-sep" aria-hidden="true"></span>
          <div class="tbe-toolbar-group" role="toolbar" aria-label="Форматирование">
            <button
              type="button"
              class="tbe-tool"
              [class.is-active]="toolbarStates().bold"
              (click)="runCmd('bold')"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              class="tbe-tool"
              [class.is-active]="toolbarStates().italic"
              (click)="runCmd('italic')"
            >
              <em>I</em>
            </button>
            <button
              type="button"
              class="tbe-tool"
              [class.is-active]="toolbarStates().underline"
              (click)="runCmd('underline')"
            >
              <u>U</u>
            </button>
            <span class="tbe-toolbar-sep" aria-hidden="true"></span>
            <button
              type="button"
              class="tbe-tool"
              [class.is-active]="toolbarStates().alignLeft"
              (click)="runCmd('left')"
              aria-label="По левому краю"
              title="По левому краю"
            >
              <lucide-icon [img]="AlignLeftIcon" [size]="14" aria-hidden="true"></lucide-icon>
            </button>
            <button
              type="button"
              class="tbe-tool"
              [class.is-active]="toolbarStates().alignCenter"
              (click)="runCmd('center')"
              aria-label="По центру"
              title="По центру"
            >
              <lucide-icon [img]="AlignCenterIcon" [size]="14" aria-hidden="true"></lucide-icon>
            </button>
            <button
              type="button"
              class="tbe-tool"
              [class.is-active]="toolbarStates().alignRight"
              (click)="runCmd('right')"
              aria-label="По правому краю"
              title="По правому краю"
            >
              <lucide-icon [img]="AlignRightIcon" [size]="14" aria-hidden="true"></lucide-icon>
            </button>
          </div>
          <span class="tbe-toolbar-sep" aria-hidden="true"></span>
          <div class="tbe-toolbar-group tbe-toolbar-size">
            <span class="eyebrow text-muted-foreground">Шрифт</span>
            <select
              class="tbe-size-select"
              [value]="activeFontSize()"
              (change)="onFontSizeChange($event)"
            >
              <option value="6">6</option>
              <option value="8">8</option>
              <option value="10">10</option>
              <option value="12">12</option>
              <option value="14">14</option>
              <option value="16">16</option>
              <option value="18">18</option>
              <option value="20">20</option>
              <option value="24">24</option>
              <option value="28">28</option>
              <option value="32">32</option>
            </select>
          </div>
          <span class="tbe-toolbar-sep" aria-hidden="true"></span>
          <div class="tbe-toolbar-group tbe-toolbar-width">
            <span class="eyebrow text-muted-foreground">Ширина</span>
            <input
              type="range"
              class="tbe-width-slider"
              [min]="10"
              [max]="80"
              [value]="activeColWidth()"
              (input)="onColWidthChange($event)"
            />
            <input
              type="number"
              class="tbe-width-input"
              [min]="5"
              [max]="90"
              [value]="activeColWidth()"
              (change)="onColWidthInput($event)"
            />
            <span class="eyebrow text-muted-foreground">%</span>
          </div>
        </div>

        <div class="tbe-data-strip hairline-y">
          <div class="tbe-data-strip-left">
            <span class="eyebrow">Постановочные данные</span>
            <span class="text-sm text-muted-foreground italic">
              Вставка в колонку #{{ activeColIndex() + 1 }} — токены подставляются при сборке
              документа
            </span>
          </div>
          <app-pi-button
            variant="outline"
            size="sm"
            class="tbe-data-btn"
            (click)="openDataPicker()"
          >
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
              >
                #{{ idx + 1 }}
              </button>
            }
            @if (columns().length < 8) {
              <button type="button" class="tbe-tab tbe-tab--add eyebrow" (click)="addColumn()">
                +
              </button>
            }
          </div>

          <div class="tbe-grid" [style.grid-template-columns]="gridTemplate()">
            @for (col of columns(); track trackByColId($index, col); let idx = $index) {
              <div
                class="tbe-col"
                [class.is-active]="activeColIndex() === idx"
                [class.is-dimmed]="activeColIndex() !== idx"
              >
                <div
                  class="tbe-col-editor"
                  (mousedown)="selectColumn(idx)"
                  [style.font-size.px]="col.fontSize ?? 14"
                >
                  <app-pi-rich-text
                    [value]="col.content"
                    (valueChange)="onColumnContentChange(idx, $event)"
                    [placeholder]="'Колонка ' + (idx + 1) + '…'"
                    [showToolbar]="false"
                    [selected]="activeColIndex() === idx"
                    (activate)="onEditorActivate(idx)"
                    (statesChange)="onEditorStatesChange(idx, $event)"
                  />
                </div>
                <div class="tbe-col-controls">
                  <button
                    type="button"
                    class="tbe-col-btn"
                    [disabled]="idx === 0"
                    (click)="moveColumn(idx, -1)"
                    title="Переместить влево"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    class="tbe-col-btn tbe-col-btn--delete"
                    (click)="removeColumn(idx)"
                    title="Удалить колонку"
                  >
                    ×
                  </button>
                  <button
                    type="button"
                    class="tbe-col-btn"
                    [disabled]="idx === columns().length - 1"
                    (click)="moveColumn(idx, 1)"
                    title="Переместить вправо"
                  >
                    ›
                  </button>
                </div>
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
          <app-pi-button
            variant="default"
            [disabled]="nameControl.invalid || saving()"
            (click)="onSave()"
          >
            {{ saving() ? 'Сохранение…' : 'Сохранить блок' }}
          </app-pi-button>
        </div>
      </footer>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

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
      .tbe-input--invalid {
        border-color: var(--color-destructive);
      }
      .tbe-input--invalid:focus {
        border-color: var(--color-destructive);
        outline-color: var(--color-destructive);
      }

      .tbe-meta-category {
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex-shrink: 0;
        min-width: 220px;
      }
      .tbe-category-select {
        padding: 12px 16px;
        font-size: 14px;
        font-family: inherit;
        color: var(--color-ink);
        background: var(--color-paper);
        border: 1px solid var(--color-rule);
        border-radius: 0;
        cursor: pointer;
      }
      .tbe-category-select:focus {
        outline: none;
        border-color: var(--color-ink);
        outline: 1px solid var(--color-sunrise-warm);
        outline-offset: -1px;
      }
      .tbe-category-select:disabled {
        opacity: 0.6;
        cursor: default;
      }
      .tbe-category-empty {
        font-size: 12px;
        color: var(--color-muted-foreground-strong);
      }

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
      .tbe-col-seg-btn:first-child {
        border-left: none;
      }
      .tbe-col-seg-btn:hover {
        background: var(--color-paper-2);
      }
      .tbe-col-seg-btn.is-active {
        background: var(--color-ink);
        color: var(--color-paper);
      }

      .tbe-active-switch {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 4px;
      }
      .tbe-tool lucide-icon {
        display: inline-flex;
      }

      .tbe-toolbar {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 32px 16px;
        padding: 4px 8px;
        background: var(--color-paper-2);
        flex-wrap: wrap;
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
      .tbe-tool:hover {
        background: var(--color-paper);
      }
      .tbe-tool.is-active {
        background: var(--color-ink);
        color: var(--color-paper);
      }

      .tbe-toolbar-size,
      .tbe-toolbar-width {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .tbe-size-select {
        padding: 4px 8px;
        font-size: 12px;
        font-family: inherit;
        border: 1px solid var(--color-rule);
        background: var(--color-paper);
        color: var(--color-ink);
        cursor: pointer;
      }
      .tbe-width-slider {
        width: 80px;
        height: 4px;
        accent-color: var(--color-ink);
        cursor: pointer;
      }
      .tbe-width-input {
        width: 48px;
        padding: 3px 4px;
        font-size: 12px;
        font-family: ui-monospace, monospace;
        text-align: center;
        border: 1px solid var(--color-rule);
        background: var(--color-paper);
        color: var(--color-ink);
      }
      .tbe-width-input:focus {
        outline: none;
        border-color: var(--color-sunrise-warm);
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
        flex: 1;
        display: flex;
        flex-direction: column;
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
        flex: 1;
      }
      .tbe-col {
        position: relative;
        display: flex;
        flex-direction: column;
        min-height: 280px;
        padding: 0;
        background: var(--color-paper-main, var(--color-paper));
        border: none;
        transition:
          background 120ms ease,
          opacity 120ms ease;
      }
      .tbe-col.is-active {
        background: var(--color-paper);
        opacity: 1;
      }
      .tbe-col.is-dimmed {
        opacity: 0.6;
      }
      .tbe-col-editor {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        min-height: 240px;
      }
      .tbe-col-editor ::ng-deep app-pi-rich-text {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        min-height: 240px;
      }
      .tbe-col-editor ::ng-deep .pi-rte-editor {
        flex: 1 1 auto;
        min-height: 240px;
        border: 1px solid var(--color-rule);
        border-radius: 4px;
        font-size: inherit !important;
      }
      .tbe-col-editor ::ng-deep .pi-rte-editor .ProseMirror {
        font-size: inherit !important;
        min-height: 216px;
      }
      .tbe-col.is-active ::ng-deep .pi-rte-editor {
        border: 2px solid var(--color-sunrise-warm);
      }
      .tbe-col.is-dimmed ::ng-deep .pi-rte-editor {
        border-color: var(--color-rule);
      }
      .tbe-col-controls {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0;
        border-top: 1px solid var(--color-rule);
        background: var(--color-paper);
        flex-shrink: 0;
      }
      .tbe-col-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 36px;
        font-size: 18px;
        font-weight: 700;
        color: var(--color-muted-foreground-strong);
        background: transparent;
        border: none;
        cursor: pointer;
        transition:
          background 100ms ease,
          color 100ms ease;
      }
      .tbe-col-btn:hover:not(:disabled) {
        background: var(--color-paper-2);
        color: var(--color-ink);
      }
      .tbe-col-btn:disabled {
        opacity: 0.3;
        cursor: default;
      }
      .tbe-col-btn--delete {
        color: var(--color-destructive);
        border-left: 1px solid var(--color-rule);
        border-right: 1px solid var(--color-rule);
      }
      .tbe-col-btn--delete:hover {
        background: color-mix(in oklch, var(--color-destructive) 8%, transparent);
        color: var(--color-destructive);
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
    `,
  ],
})
export class TextBlockEditorComponent {
  readonly block = input<TextBlock | null>(null);
  readonly save = output<TextBlock>();
  readonly cancel = output<void>();

  protected readonly AlignLeftIcon = AlignLeft;
  protected readonly AlignCenterIcon = AlignCenter;
  protected readonly AlignRightIcon = AlignRight;

  @ViewChildren(PiRichTextEditorComponent) private editors!: QueryList<PiRichTextEditorComponent>;

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(TextBlocksService);
  private readonly categoryService = inject(TextBlockCategoriesService);
  private readonly toast = inject(PiToastService);
  private readonly dialog = inject(PiDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly nameControl = this.fb.control('', [
    Validators.required,
    Validators.maxLength(200),
  ]);
  protected readonly activeControl = this.fb.control(true);

  protected readonly columnsCount = signal<number>(1);
  protected readonly columns = signal<TextBlockColumn[]>([]);
  protected readonly categories = signal<TextBlockCategory[]>([]);
  protected readonly categoryLoading = signal(true);
  protected readonly selectedCategoryId = signal<string | null>(null);
  protected readonly activeColIndex = signal<number>(0);
  protected readonly saving = signal<boolean>(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly editorFocused = signal<boolean>(false);
  protected readonly toolbarStates = signal<ActiveStates>({
    bold: false,
    italic: false,
    underline: false,
    alignLeft: false,
    alignCenter: false,
    alignRight: false,
  });

  private readonly nameFormTick = signal(0);
  private readonly nameAttempted = signal(false);
  protected readonly nameInvalid = computed(() => {
    this.nameFormTick();
    this.nameAttempted();
    return (
      this.nameControl.invalid &&
      (this.nameControl.dirty || this.nameControl.touched || this.nameAttempted())
    );
  });

  protected readonly registryRes = httpResource<DataSourcesResponse>(
    () => '/api/registry/data-sources',
    { defaultValue: { sources: [] } },
  );

  protected readonly gridTemplate = computed(() => {
    const cols = this.columns();
    if (cols.length <= 1) return '1fr';
    const total = cols.reduce((sum, c) => sum + (c.width ?? 1), 0);
    return cols.map((c) => `${((c.width ?? 1) / total) * 100}fr`).join(' ');
  });

  protected readonly activeFontSize = computed(() => {
    const col = this.columns()[this.activeColIndex()];
    return String(col?.fontSize ?? 14);
  });

  protected readonly activeColWidth = computed(() => {
    const col = this.columns()[this.activeColIndex()];
    if (!col) return 25;
    const total = this.columns().reduce((sum, c) => sum + (c.width ?? 1), 0);
    return Math.round(((col.width ?? 1) / total) * 100);
  });

  protected readonly columnOptions = computed(() => Array.from({ length: 8 }, (_, i) => i + 1));

  constructor() {
    merge(this.nameControl.valueChanges, this.nameControl.statusChanges)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.nameFormTick.update((n) => n + 1));

    // TZ-DOC-316 — load the ACTIVE catalog for the category picker once per
    // editor instance. For a NEW block auto-select the server-side default
    // (active isDefault category) so the user sees the same behaviour the
    // backend would apply; existing blocks keep their own categoryId.
    this.categoryService
      .list({ activeOnly: true })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.categoryLoading.set(false);
        if (!res.ok) return;
        const cats = res.data ?? [];
        this.categories.set(cats);
        const existingId = this.block()?.categoryId;
        if (existingId) {
          this.selectedCategoryId.set(existingId);
        } else if (!this.selectedCategoryId()) {
          const def = cats.find((c) => c.isDefault && c.isActive);
          if (def) this.selectedCategoryId.set(def._id);
        }
      });
    // Init handled by initEffect (signal inputs set AFTER constructor)
  }

  /** Block whose inputs were already applied — prevents effect feedback loops. */
  private initializedBlockId: string | null = null;

  private readonly initEffect = effect(() => {
    const existing = this.block();
    if (!existing) {
      if (this.columns().length === 0) {
        this.columns.set([this.makeColumn()]);
      }
      return;
    }
    // Apply block inputs exactly ONCE per block id. The effect must NOT read
    // selectedCategoryId (that would re-trigger it on every user change and
    // clobber the user's «Не выбрана» / re-selection with the block value).
    if (existing._id === this.initializedBlockId) return;
    this.initializedBlockId = existing._id;
    this.nameControl.setValue(existing.name);
    this.activeControl.setValue(existing.isActive);
    if (existing.categoryId) {
      this.selectedCategoryId.set(existing.categoryId);
    }
    if (existing.columns && existing.columns.length > 0) {
      this.columns.set(
        existing.columns.map((c) => ({
          id: c.id || crypto.randomUUID(),
          content: c.content || '',
          width: c.width ?? 1,
          fontSize: c.fontSize ?? 14,
        })),
      );
      this.columnsCount.set(existing.columns.length);
    } else {
      this.columns.set([
        { id: crypto.randomUUID(), content: existing.content || '', width: 1, fontSize: 14 },
      ]);
      this.columnsCount.set(1);
    }
    this.activeColIndex.set(0);
  });

  protected trackByColId(_index: number, col: TextBlockColumn): string {
    return col.id;
  }

  protected selectColumn(index: number): void {
    this.activeColIndex.set(index);
    this.editorFocused.set(false);
    queueMicrotask(() => {
      const ed = this.editors?.get(index);
      ed?.refreshActiveStates();
      if (ed) this.toolbarStates.set(ed.getActiveStates());
    });
  }

  protected onEditorActivate(index: number): void {
    this.activeColIndex.set(index);
    this.editorFocused.set(true);
  }

  protected onEditorStatesChange(index: number, states: ActiveStates): void {
    if (index === this.activeColIndex()) this.toolbarStates.set(states);
  }

  protected onColumnContentChange(index: number, html: string): void {
    this.columns.update((cols) => cols.map((c, i) => (i === index ? { ...c, content: html } : c)));
  }

  protected onFontSizeChange(event: Event): void {
    const size = Number((event.target as HTMLSelectElement).value);
    const idx = this.activeColIndex();
    this.columns.update((cols) => cols.map((c, i) => (i === idx ? { ...c, fontSize: size } : c)));
  }

  protected onColWidthChange(event: Event): void {
    const pct = Number((event.target as HTMLInputElement).value);
    this.applyColWidth(pct);
  }

  protected onColWidthInput(event: Event): void {
    const pct = Math.max(5, Math.min(90, Number((event.target as HTMLInputElement).value) || 25));
    this.applyColWidth(pct);
  }

  private applyColWidth(pct: number): void {
    const idx = this.activeColIndex();
    const cols = this.columns();
    const total = cols.reduce((sum, c) => sum + (c.width ?? 1), 0);
    const newWidth = (pct / 100) * total;
    this.columns.update((cs) =>
      cs.map((c, i) => (i === idx ? { ...c, width: Math.round(newWidth * 100) / 100 } : c)),
    );
  }

  protected runCmd(cmd: 'bold' | 'italic' | 'underline' | 'left' | 'center' | 'right'): void {
    const ed = this.editors?.get(this.activeColIndex());
    if (!ed) return;
    if (!this.editorFocused()) {
      ed.focusEditor();
      ed.selectAll();
    }
    switch (cmd) {
      case 'bold':
        ed.toggleBold();
        break;
      case 'italic':
        ed.toggleItalic();
        break;
      case 'underline':
        ed.toggleUnderline();
        break;
      case 'left':
        ed.setTextAlign('left');
        break;
      case 'center':
        ed.setTextAlign('center');
        break;
      case 'right':
        ed.setTextAlign('right');
        break;
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

  protected moveColumn(fromIndex: number, direction: -1 | 1): void {
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= this.columns().length) return;
    this.columns.update((cols) => {
      const next = [...cols];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    this.selectColumn(toIndex);
  }

  protected removeColumn(index: number): void {
    if (this.columns().length <= 1) return;
    this.columns.update((cols) => cols.filter((_, i) => i !== index));
    this.columnsCount.update((n) => n - 1);
    if (this.activeColIndex() >= this.columns().length) {
      this.activeColIndex.set(this.columns().length - 1);
    }
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
      requestAnimationFrame(() => {
        this.editors?.get(colIndex)?.insertContent(token);
        this.toast.success(`Вставлено ${token}`);
      });
    });
  }

  protected onCategoryChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    // «Не выбрана» (empty) → null → categoryId NOT sent; the backend
    // resolveDefault assigns the org/system default on create.
    this.selectedCategoryId.set(value ? value : null);
  }

  protected onCancel(): void {
    this.cancel.emit();
  }

  protected onSave(): void {
    if (this.nameControl.invalid || this.saving()) {
      this.nameAttempted.set(true);
      this.nameControl.markAsTouched();
      this.nameFormTick.update((n) => n + 1);
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
    // TZ-DOC-316 — include categoryId ONLY when the user explicitly selected
    // one; undefined is omitted so the server applies its default (AC #10).
    const categoryId = this.selectedCategoryId();
    if (categoryId) payload.categoryId = categoryId;
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
    return { id: crypto.randomUUID(), content: '', width: 1, fontSize: 14 };
  }
}
