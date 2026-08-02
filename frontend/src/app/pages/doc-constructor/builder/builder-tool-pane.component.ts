import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse, httpResource } from '@angular/common/http';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import {
  LucideAngularModule,
  Database,
  FileText,
  Table as TableIcon,
  Plus,
  Minus,
} from 'lucide-angular';
import { TextBlocksService } from '../../../shared/services/pi-text-blocks.service';
import {
  TextBlockCategoriesService,
  type TextBlockCategory,
} from '../../../shared/services/pi-text-block-categories.service';
import { TableTemplatesService } from '../../../shared/services/pi-table-templates.service';
import { BuilderTextFilterService } from './builder-text-filter.service';
import { extractErrorMessage } from '../../../core/silent-http';
import {
  BLOCK_TYPE_LABELS,
  BLOCK_TYPE_HINTS,
  type BlockType,
} from '../../../shared/template-block/template-block.types';
// ButtonComponent removed: tool-pane uses inline `<button>` elements (tool-pane__add, tool-pane__upload-button) so no Paper & Ink Button import needed. (Was NG8113 unused import — fixed.)
import { CANVAS_DROPLIST_ID, type AddBlockPayload } from './builder.types';
import type { TextBlock } from '../../../shared/services/pi-text-blocks.service';
import type { TableTemplate } from '../../../shared/services/pi-table-templates.service';

/**
 * TZ-86 Phase D.1 + D.2 — `BuilderToolPane` (left pane).
 *
 * Three collapsible accordion-tabs:
 *   1. **Тексты** — list TextBlock items via httpResource.
 *   2. **Таблицы** — list TableTemplate items via httpResource.
 *   3. _Отступ removed in TZ-DOC-319_
 *
 * Phase D.2.2 (drag-from-palette): each palette list is wrapped in
 * `cdkDropList` with `[cdkDropListConnectedTo]="['canvas-droplist']"`. Each
 * item is a `cdkDrag` with `[cdkDragData]="<AddBlockPayload>"`. Dropping
 * an item on the canvas (which has matching id) triggers BuilderCanvas's
 * `(dropAdd)` output, which routes back to BuilderPage.
 *
 * Decorations, orientation, and opacity controls have been moved to the
 * inspector (right pane) to avoid duplication.
 *
 * Pattern fidelity: same OnPush + signals + httpResource as Phase D.1.
 */
@Component({
  selector: 'app-builder-tool-pane',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, CdkDropList, CdkDrag],
  template: `
    <aside class="tool-pane" aria-label="Палитра блоков">
      <header class="tool-pane__header">
        <h2 class="tool-pane__title">Палитра</h2>
        <p class="tool-pane__subtitle">Перетащите блок на холст или нажмите «+»</p>
      </header>

      <!-- Section 1: Text-blocks (drag-enabled) -->
      <section class="tool-pane__section" [class.is-open]="isOpen('texts')">
        <button
          type="button"
          class="tool-pane__section-toggle pi-focus-ring"
          (click)="toggle('texts')"
          [attr.aria-expanded]="isOpen('texts')"
        >
          <lucide-icon [img]="FileTextIcon" [size]="14"></lucide-icon>
          <span class="tool-pane__section-title">Тексты</span>
        </button>
        @if (isOpen('texts')) {
          <div class="tool-pane__filter">
            <label class="tool-pane__filter-label" for="tb-category-filter">Категория</label>
            <select
              id="tb-category-filter"
              class="tool-pane__filter-select"
              [value]="selectedCategoryId() ?? ''"
              (change)="onCategoryChange($event)"
              [disabled]="categoryLoading()"
              aria-label="Фильтр текстов по категории"
              data-test="tool-pane-category-filter"
            >
              <option value="">Все</option>
              @for (cat of categories(); track cat._id) {
                <option [value]="cat._id">{{ cat.name }}</option>
              }
            </select>
          </div>
          @if (textsRes.isLoading()) {
            <p class="tool-pane__loading">Загрузка…</p>
          } @else if (textsRes.error()) {
            <p class="tool-pane__error">{{ textErrorMessage() }}</p>
          } @else if (textsRes.value() && textsRes.value()!.length > 0) {
            <ul
              cdkDropList
              [cdkDropListData]="textsRes.value()"
              [cdkDropListConnectedTo]="canvasDroplistId"
              class="tool-pane__list"
            >
              @for (t of textsRes.value(); track t._id) {
                <li
                  cdkDrag
                  [cdkDragData]="{ source: 'text-block', textBlock: t }"
                  class="tool-pane__item"
                >
                  <div class="tool-pane__item-text">
                    <span class="tool-pane__item-label">{{ t.name }}</span>
                    @if (t.category) {
                      <span class="tool-pane__item-hint">{{ t.category }}</span>
                    }
                  </div>
                  <button
                    type="button"
                    class="tool-pane__add pi-focus-ring"
                    [attr.aria-label]="'Добавить текст ' + t.name"
                    [title]="'Добавить текст ' + t.name"
                    (click)="onAddFromTextBlock(t)"
                  >
                    <lucide-icon [img]="PlusIcon" [size]="14"></lucide-icon>
                  </button>
                </li>
              }
            </ul>
          } @else {
            <p class="tool-pane__empty">
              {{ selectedCategoryId() ? 'Нет блоков в этой категории' : 'Нет сохранённых текстов' }}
            </p>
          }
        }
      </section>

      <!-- Section 3: Table templates (drag-enabled) -->
      <section class="tool-pane__section" [class.is-open]="isOpen('tables')">
        <button
          type="button"
          class="tool-pane__section-toggle pi-focus-ring"
          (click)="toggle('tables')"
          [attr.aria-expanded]="isOpen('tables')"
        >
          <lucide-icon [img]="TableIconSvg" [size]="14"></lucide-icon>
          <span class="tool-pane__section-title">Таблицы</span>
        </button>
        @if (isOpen('tables')) {
          @if (tablesRes.isLoading()) {
            <p class="tool-pane__loading">Загрузка…</p>
          } @else if (tablesRes.error()) {
            <p class="tool-pane__error">{{ tableErrorMessage() }}</p>
          } @else if (tablesRes.value() && tablesRes.value()!.length > 0) {
            <ul
              cdkDropList
              [cdkDropListData]="tablesRes.value()"
              [cdkDropListConnectedTo]="canvasDroplistId"
              class="tool-pane__list"
            >
              @for (t of tablesRes.value(); track t._id) {
                <li
                  cdkDrag
                  [cdkDragData]="{ source: 'table-template', tableTemplate: t }"
                  class="tool-pane__item"
                >
                  <div class="tool-pane__item-text">
                    <span class="tool-pane__item-label">{{ t.name }}</span>
                    @if (t.description) {
                      <span class="tool-pane__item-hint">{{ t.description }}</span>
                    }
                  </div>
                  <button
                    type="button"
                    class="tool-pane__add pi-focus-ring"
                    [attr.aria-label]="'Добавить таблицу ' + t.name"
                    [title]="'Добавить таблицу ' + t.name"
                    (click)="onAddFromTable(t)"
                  >
                    <lucide-icon [img]="PlusIcon" [size]="14"></lucide-icon>
                  </button>
                </li>
              }
            </ul>
          } @else {
            <p class="tool-pane__empty">Нет сохранённых шаблонов таблиц</p>
          }
        }
      </section>

      <!-- Section 3 removed (TZ-DOC-319) -->
    </aside>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 280px;
        flex-shrink: 0;
        height: 100%;
        overflow-y: auto;
        background: var(--color-paper);
        border-right: 1px solid var(--color-rule);
      }

      .tool-pane__header {
        padding: 16px 16px 8px;
        border-bottom: 1px solid var(--color-rule);
      }

      .tool-pane__title {
        font-size: 13px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--color-ink);
        margin: 0 0 4px;
      }

      .tool-pane__subtitle {
        font-size: 11px;
        color: var(--color-muted);
        margin: 0;
      }

      .tool-pane__quick-add {
        padding: 8px 16px;
        border-bottom: 1px solid var(--color-rule);
      }

      .tool-pane__quick-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        width: 100%;
        padding: 8px 12px;
        font-size: 12px;
        font-weight: 500;
        border: 1px dashed var(--color-rule);
        border-radius: 4px;
        background: var(--color-paper);
        color: var(--color-muted-foreground-strong);
        cursor: pointer;
        transition: all 150ms ease;
      }

      .tool-pane__quick-btn:hover {
        border-color: var(--color-ink);
        color: var(--color-ink);
        background: var(--color-paper-2);
      }

      /* .tool-pane__spacer-* rules removed (TZ-DOC-319) */

      .tool-pane__section {
        border-bottom: 1px solid var(--color-rule);
      }

      .tool-pane__section-toggle {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 10px 16px;
        background: transparent;
        border: none;
        cursor: pointer;
        color: var(--color-ink);
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        text-align: left;
      }

      .tool-pane__section-toggle:hover {
        background: color-mix(in oklch, var(--color-sunrise-soft) 40%, transparent);
      }

      .tool-pane__section-title {
        flex: 1;
      }

      .tool-pane__filter {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 16px 8px;
      }

      .tool-pane__filter-label {
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--color-muted);
      }

      .tool-pane__filter-select {
        flex: 1;
        min-width: 0;
        padding: 4px 8px;
        font-size: 12px;
        font-family: inherit;
        color: var(--color-ink);
        background: var(--color-paper);
        border: 1px solid var(--color-rule);
        cursor: pointer;
      }

      .tool-pane__filter-select:focus {
        outline: none;
        outline: 1px solid var(--color-sunrise-warm);
        outline-offset: -1px;
      }

      .tool-pane__filter-select:disabled {
        opacity: 0.6;
        cursor: default;
      }

      .tool-pane__list {
        list-style: none;
        margin: 0;
        padding: 4px 0 8px;
      }

      .tool-pane__item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 16px;
        transition: background 100ms ease;
        cursor: grab;
      }

      .tool-pane__item:hover {
        background: color-mix(in oklch, var(--color-sunrise-soft) 40%, transparent);
      }

      .tool-pane__item:active {
        cursor: grabbing;
      }

      .tool-pane__item-text {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .tool-pane__item-label {
        font-size: 13px;
        color: var(--color-ink);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .tool-pane__item-hint {
        font-size: 10px;
        color: var(--color-muted);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .tool-pane__add {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: 1px solid var(--color-rule);
        color: var(--color-ink);
        cursor: pointer;
        border-radius: 2px;
        transition: all 100ms ease;
      }

      .tool-pane__add:hover {
        background: var(--color-ink);
        color: var(--color-paper);
        border-color: var(--color-ink);
      }

      .tool-pane__subgroup {
        padding: 4px 0 8px;
      }

      .tool-pane__subgroup-title {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--color-muted);
        margin: 4px 16px 4px;
        font-weight: 600;
      }

      .tool-pane__loading,
      .tool-pane__error,
      .tool-pane__empty,
      .tool-pane__hint {
        padding: 8px 16px;
        font-size: 12px;
        color: var(--color-muted);
        margin: 0;
      }

      .tool-pane__error {
        color: var(--color-destructive);
      }

      /* CDK drag preview for palette items */
      .cdk-drag-preview {
        box-sizing: border-box;
        background: var(--color-paper);
        border: 1px solid var(--color-ink);
        opacity: 0.9;
        padding: 6px 16px;
        font-size: 13px;
        color: var(--color-ink);
      }
    `,
  ],
})
export class BuilderToolPaneComponent {
  // Outputs
  readonly addBlock = output<AddBlockPayload>();

  // DI
  private readonly destroyRef = inject(DestroyRef);
  private readonly textBlocks = inject(TextBlocksService);
  private readonly tableTemplates = inject(TableTemplatesService);
  private readonly textBlockCategories = inject(TextBlockCategoriesService);
  private readonly textFilter = inject(BuilderTextFilterService);

  // Icons
  protected readonly DatabaseIcon = Database;
  protected readonly FileTextIcon = FileText;
  protected readonly TableIconSvg = TableIcon;
  protected readonly PlusIcon = Plus;
  protected readonly MinusIcon = Minus;

  // D.2.2: cdkDropListConnectedTo target — imported from builder-canvas so
  // the id string is single-sourced (see code-reviewer nit 2 on D.2).
  protected readonly canvasDroplistId = [CANVAS_DROPLIST_ID];

  // Tab state
  private readonly open = signal<Record<string, boolean>>({
    texts: false,
    tables: false,
  });
  protected readonly isOpen = (k: string): boolean => this.open()[k] === true;
  protected readonly toggle = (k: string): void => {
    this.open.update((s) => ({ ...s, [k]: !s[k] }));
  };

  // Static palette data
  protected readonly blockTypeItems = (
    ['header', 'text', 'table', 'image', 'signature'] as const
  ).map((t) => ({
    type: t as BlockType,
    label: BLOCK_TYPE_LABELS[t],
    hint: BLOCK_TYPE_HINTS[t],
  }));

  // TZ-DOC-317 — active categories for the filter dropdown (TZ-DOC-309 cache).
  protected readonly categories = signal<TextBlockCategory[]>([]);
  protected readonly categoryLoading = signal(true);
  protected readonly selectedCategoryId = computed(() => this.textFilter.categoryId());

  constructor() {
    // TZ-DOC-309 pattern: reuse the cached active catalog from the service
    // (never a raw duplicate GET on every builder open).
    this.textBlockCategories
      .list({ activeOnly: true })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.categoryLoading.set(false);
        if (res.ok) this.categories.set(res.data ?? []);
      });
  }

  protected onCategoryChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    // «Все» (empty) → null → no categoryId param on the request.
    this.textFilter.categoryId.set(value ? value : null);
  }

  // httpResource for live data. The «Тексты» URL is rebuilt whenever the
  // shared filter categoryId changes → server-side Mongo filter (TZ-DOC-315).
  protected readonly textsRes = httpResource<TextBlock[]>(() => {
    const cat = this.textFilter.categoryId();
    return cat
      ? `/api/text-blocks?isActive=true&categoryId=${encodeURIComponent(cat)}`
      : '/api/text-blocks?isActive=true';
  }, { defaultValue: [] });
  protected readonly tablesRes = httpResource<TableTemplate[]>(
    () => '/api/table-templates?isActive=true',
    { defaultValue: [] },
  );
  // Error extraction — runtime null guard: httpResource.error() returns
  // `unknown` and may be null on a successful or pending request.
  protected readonly textErrorMessage = computed<string>(() => {
    const err = this.textsRes.error() as HttpErrorResponse | null;
    return err ? extractErrorMessage(err) : '';
  });
  protected readonly tableErrorMessage = computed<string>(() => {
    const err = this.tablesRes.error() as HttpErrorResponse | null;
    return err ? extractErrorMessage(err) : '';
  });

  // Handlers — emit addBlock events to parent BuilderPage
  protected onAddBlockType(type: BlockType): void {
    this.addBlock.emit({ source: 'block-type', type });
  }

  protected onAddFromTextBlock(t: TextBlock): void {
    this.addBlock.emit({ source: 'text-block', textBlock: t });
  }

  protected onAddFromTable(t: TableTemplate): void {
    this.addBlock.emit({ source: 'table-template', tableTemplate: t });
  }
}
