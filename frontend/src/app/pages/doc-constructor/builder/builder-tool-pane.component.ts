import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse, httpResource } from '@angular/common/http';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import {
  LucideAngularModule,
  Database,
  FileText,
  Table as TableIcon,
  Image as ImageIcon,
  Layers,
  Plus,
  Minus,
  Ungroup,
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
 * TZ-86 Phase D.1 + D.2 — `BuilderToolPane` (top horizontal palette).
 *
 * Four exclusive tabs (one open at a time):
 *   1. **Группы** — persisted flat groups via groupId.
 *   2. **Тексты** — list TextBlock items via httpResource.
 *   3. **Таблицы** — list TableTemplate items via httpResource.
 *   4. **Фото** — file picker → parent inserts overlay image block.
 *
 * Top-toolbar duplicates (Тексты/Таблицы/Фото) were removed — palette is the
 * single add entry point.
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
  imports: [LucideAngularModule, CdkDropList, CdkDrag, RouterLink],
  template: `
    <aside class="tool-pane" aria-label="Палитра блоков">
      <div class="tool-pane__bar">
        <span class="tool-pane__brand">Палитра</span>
        <div class="tool-pane__tabs" role="tablist" aria-label="Секции палитры">
          <button
            type="button"
            role="tab"
            class="tool-pane__tab pi-focus-ring"
            [class.is-active]="isOpen('groups')"
            (click)="toggle('groups')"
            [attr.aria-selected]="isOpen('groups')"
            [attr.aria-expanded]="isOpen('groups')"
            data-test="tool-pane-groups-toggle"
          >
            <lucide-icon [img]="LayersIcon" [size]="14"></lucide-icon>
            <span>Группы</span>
            @if (groups().length > 0) {
              <span class="tool-pane__tab-count">{{ groups().length }}</span>
            }
          </button>
          <button
            type="button"
            role="tab"
            class="tool-pane__tab pi-focus-ring"
            [class.is-active]="isOpen('texts')"
            (click)="toggle('texts')"
            [attr.aria-selected]="isOpen('texts')"
            [attr.aria-expanded]="isOpen('texts')"
          >
            <lucide-icon [img]="FileTextIcon" [size]="14"></lucide-icon>
            <span>Тексты</span>
          </button>
          <button
            type="button"
            role="tab"
            class="tool-pane__tab pi-focus-ring"
            [class.is-active]="isOpen('tables')"
            (click)="toggle('tables')"
            [attr.aria-selected]="isOpen('tables')"
            [attr.aria-expanded]="isOpen('tables')"
          >
            <lucide-icon [img]="TableIconSvg" [size]="14"></lucide-icon>
            <span>Таблицы</span>
          </button>
          <button
            type="button"
            role="tab"
            class="tool-pane__tab pi-focus-ring"
            [class.is-active]="isOpen('photo')"
            (click)="toggle('photo')"
            [attr.aria-selected]="isOpen('photo')"
            [attr.aria-expanded]="isOpen('photo')"
          >
            <lucide-icon [img]="ImageIconSvg" [size]="14"></lucide-icon>
            <span>Фото</span>
          </button>
        </div>
      </div>

      @if (isOpen('groups')) {
        <div class="tool-pane__panel" role="tabpanel">
          @if (groups().length === 0) {
            <p class="tool-pane__empty" data-test="tool-pane-groups-empty">
              Нет групп. Выделите 2+ блока и нажмите «Сгруппировать».
            </p>
          } @else {
            <ul class="tool-pane__list" data-test="tool-pane-groups-list">
              @for (g of groups(); track g.groupId) {
                <li class="tool-pane__item tool-pane__item--group">
                  <button
                    type="button"
                    class="tool-pane__group-select pi-focus-ring"
                    (click)="selectGroup.emit(g.groupId)"
                    [attr.aria-label]="'Выделить ' + g.label"
                    data-test="tool-pane-group-select"
                  >
                    <span class="tool-pane__item-label">{{ g.label }}</span>
                    <span class="tool-pane__item-hint">{{ g.count }} блоков</span>
                  </button>
                  <button
                    type="button"
                    class="tool-pane__add pi-focus-ring"
                    [attr.aria-label]="'Разгруппировать ' + g.label"
                    title="Разгруппировать"
                    (click)="ungroupGroup.emit(g.groupId); $event.stopPropagation()"
                    data-test="tool-pane-group-ungroup"
                  >
                    <lucide-icon [img]="UngroupIcon" [size]="14"></lucide-icon>
                  </button>
                </li>
              }
            </ul>
          }
        </div>
      }

      @if (isOpen('texts')) {
        <div class="tool-pane__panel" role="tabpanel">
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
                    @if (categoryName(t.categoryId); as name) {
                      <span class="tool-pane__item-hint">{{ name }}</span>
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
            <div class="tool-pane__empty" data-test="tool-pane-texts-empty">
              <p>
                {{
                  selectedCategoryId() ? 'Нет блоков в этой категории' : 'Нет сохранённых текстов'
                }}
              </p>
              <a
                class="tool-pane__empty-link pi-focus-ring"
                routerLink="/doc-constructor/texts"
                data-test="tool-pane-texts-cta"
              >
                Создать текстовый блок →
              </a>
            </div>
          }
        </div>
      }

      @if (isOpen('tables')) {
        <div class="tool-pane__panel" role="tabpanel">
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
            <div class="tool-pane__empty" data-test="tool-pane-tables-empty">
              <p>Нет сохранённых шаблонов таблиц</p>
              <a
                class="tool-pane__empty-link pi-focus-ring"
                routerLink="/doc-constructor/tables"
                data-test="tool-pane-tables-cta"
              >
                Создать шаблон таблицы →
              </a>
            </div>
          }
        </div>
      }

      @if (isOpen('photo')) {
        <div class="tool-pane__panel" role="tabpanel">
          <div class="tool-pane__photo">
            <p class="tool-pane__empty">PNG, JPEG или WebP — файл станет блоком на холсте.</p>
            <button
              type="button"
              class="tool-pane__upload-button pi-focus-ring"
              (click)="photoInput.click()"
              data-test="tool-pane-photo-upload"
            >
              <lucide-icon [img]="ImageIconSvg" [size]="14"></lucide-icon>
              Загрузить фото
            </button>
            <input
              #photoInput
              type="file"
              accept="image/png,image/jpeg,image/webp"
              class="sr-only"
              (change)="onPhotoInput($event)"
            />
          </div>
        </div>
      }
    </aside>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        flex-shrink: 0;
        background: var(--color-paper);
        border-bottom: 1px solid var(--color-rule);
      }

      .tool-pane__bar {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 4px 12px;
        background: var(--color-paper-2);
        border-bottom: 1px solid var(--color-rule);
        min-height: 36px;
      }

      .tool-pane__brand {
        flex-shrink: 0;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--color-ink);
      }

      .tool-pane__tabs {
        display: flex;
        align-items: center;
        gap: 2px;
        flex-wrap: wrap;
        min-width: 0;
      }

      .tool-pane__tab {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 10px;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 2px;
        cursor: pointer;
        color: var(--color-muted);
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        font-family: inherit;
        transition:
          color 100ms ease,
          background 100ms ease,
          border-color 100ms ease;
      }

      .tool-pane__tab:hover {
        color: var(--color-ink);
        background: color-mix(in oklch, var(--color-sunrise-soft) 40%, transparent);
      }

      .tool-pane__tab.is-active {
        color: var(--color-ink);
        background: var(--color-paper);
        border-color: var(--color-rule);
      }

      .tool-pane__tab-count {
        font-size: 10px;
        font-weight: 600;
        color: var(--color-muted);
        background: var(--color-paper);
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        padding: 0 5px;
        line-height: 16px;
      }

      .tool-pane__panel {
        max-height: 148px;
        overflow-y: auto;
        padding: 6px 12px 8px;
        background: var(--color-paper);
      }

      .tool-pane__item--group {
        cursor: default;
      }

      .tool-pane__group-select {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
        align-items: flex-start;
        padding: 0;
        border: none;
        background: transparent;
        cursor: pointer;
        text-align: left;
        font: inherit;
        color: inherit;
      }

      .tool-pane__filter {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
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
        max-width: 240px;
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
        padding: 0;
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        align-items: stretch;
      }

      .tool-pane__item {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 8px;
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        background: var(--color-paper-2);
        transition: background 100ms ease;
        cursor: grab;
        max-width: 220px;
        min-width: 0;
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
        gap: 1px;
      }

      .tool-pane__item-label {
        font-size: 12px;
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
        width: 22px;
        height: 22px;
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

      .tool-pane__loading,
      .tool-pane__error,
      .tool-pane__empty,
      .tool-pane__hint {
        padding: 4px 0;
        font-size: 12px;
        color: var(--color-muted);
        margin: 0;
      }

      .tool-pane__empty p {
        margin: 0 0 6px;
      }

      .tool-pane__empty-link {
        display: inline-flex;
        align-items: center;
        font-size: 12px;
        font-weight: 600;
        color: var(--color-ink);
        text-decoration: underline;
        text-underline-offset: 2px;
      }

      .tool-pane__empty-link:hover {
        color: var(--color-sunrise-warm, var(--color-ink));
      }

      .tool-pane__photo {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px 12px;
      }

      .tool-pane__photo .tool-pane__empty {
        padding: 0;
        flex: 1;
        min-width: 180px;
      }

      .tool-pane__upload-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 6px 12px;
        font-size: 12px;
        font-family: inherit;
        color: var(--color-ink);
        background: var(--color-paper-2);
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        cursor: pointer;
        transition:
          background 100ms ease,
          border-color 100ms ease;
      }

      .tool-pane__upload-button:hover {
        border-color: var(--color-ink);
        background: color-mix(in oklch, var(--color-sunrise-soft) 35%, transparent);
      }

      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
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
        padding: 6px 12px;
        font-size: 12px;
        color: var(--color-ink);
      }
    `,
  ],
})
export class BuilderToolPaneComponent {
  /** Persisted flat groups derived from blocks with a shared groupId. */
  readonly groups = input<
    Array<{ groupId: string; label: string; count: number; memberKeys?: string[] }>
  >([]);

  // Outputs
  readonly addBlock = output<AddBlockPayload>();
  readonly photoSelected = output<File>();
  readonly selectGroup = output<string>();
  readonly ungroupGroup = output<string>();

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
  protected readonly ImageIconSvg = ImageIcon;
  protected readonly LayersIcon = Layers;
  protected readonly PlusIcon = Plus;
  protected readonly MinusIcon = Minus;
  protected readonly UngroupIcon = Ungroup;

  // D.2.2: cdkDropListConnectedTo target — imported from builder-canvas so
  // the id string is single-sourced (see code-reviewer nit 2 on D.2).
  protected readonly canvasDroplistId = [CANVAS_DROPLIST_ID];

  // Tab state — exclusive: at most one tab open
  private readonly open = signal<Record<string, boolean>>({
    groups: false,
    texts: false,
    tables: false,
    photo: false,
  });
  protected readonly isOpen = (k: string): boolean => this.open()[k] === true;
  protected readonly toggle = (k: string): void => {
    this.open.update((s) => {
      const next = !s[k];
      return {
        groups: false,
        texts: false,
        tables: false,
        photo: false,
        [k]: next,
      };
    });
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

  // TZ-DOC-326 — item hint resolves the categoryId FK → friendly name via
  // the loaded catalog (the legacy `category` enum was removed in 323).
  protected categoryName(id: string | undefined): string | undefined {
    if (!id) return undefined;
    return this.categories().find((c) => c._id === id)?.name;
  }

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
  protected readonly textsRes = httpResource<TextBlock[]>(
    () => {
      const cat = this.textFilter.categoryId();
      return cat
        ? `/api/text-blocks?isActive=true&categoryId=${encodeURIComponent(cat)}`
        : '/api/text-blocks?isActive=true';
    },
    { defaultValue: [] },
  );
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

  protected onPhotoInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.photoSelected.emit(file);
    input.value = '';
  }
}
