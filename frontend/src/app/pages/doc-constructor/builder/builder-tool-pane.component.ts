import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
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
  FileText,
  Table as TableIcon,
  Image as ImageIcon,
  Layers,
  Plus,
  Ungroup,
  X,
} from 'lucide-angular';
import {
  TextBlockCategoriesService,
  type TextBlockCategory,
} from '../../../shared/services/pi-text-block-categories.service';
import { BuilderTextFilterService } from './builder-text-filter.service';
import { extractErrorMessage } from '../../../core/silent-http';
import {
  BLOCK_TYPE_LABELS,
  BLOCK_TYPE_HINTS,
  type BlockType,
} from '../../../shared/template-block/template-block.types';
import { CANVAS_DROPLIST_ID, type AddBlockPayload } from './builder.types';
import type { TextBlock } from '../../../shared/services/pi-text-blocks.service';
import type { TableTemplate } from '../../../shared/services/pi-table-templates.service';

/**
 * Builder left palette — icon rail + overlay flyout (does not push canvas).
 *
 * Four exclusive sections (one open at a time):
 *   1. Группы — persisted flat groups via groupId
 *   2. Тексты — TextBlock catalog
 *   3. Таблицы — TableTemplate catalog
 *   4. Фото — file picker → overlay image
 *
 * Flyout auto-collapses after placing a block (click or drag-drop).
 * Drag-from-palette: cdkDropList connected to canvas-droplist.
 */
@Component({
  selector: 'app-builder-tool-pane',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, CdkDropList, CdkDrag, RouterLink],
  template: `
    <aside class="tool-pane" aria-label="Палитра блоков">
      <nav class="tool-pane__rail" aria-label="Разделы палитры">
        <button
          type="button"
          class="tool-pane__rail-btn pi-focus-ring"
          [class.is-active]="isOpen('groups')"
          (click)="toggle('groups', $event)"
          [attr.aria-pressed]="isOpen('groups')"
          [attr.aria-expanded]="isOpen('groups')"
          title="Группы"
          aria-label="Группы"
          data-test="tool-pane-groups-toggle"
        >
          <lucide-icon [img]="LayersIcon" [size]="18"></lucide-icon>
          @if (groups().length > 0) {
            <span class="tool-pane__rail-badge">{{ groups().length }}</span>
          }
        </button>
        <button
          type="button"
          class="tool-pane__rail-btn pi-focus-ring"
          [class.is-active]="isOpen('texts')"
          (click)="toggle('texts', $event)"
          [attr.aria-pressed]="isOpen('texts')"
          [attr.aria-expanded]="isOpen('texts')"
          title="Тексты"
          aria-label="Тексты"
        >
          <lucide-icon [img]="FileTextIcon" [size]="18"></lucide-icon>
        </button>
        <button
          type="button"
          class="tool-pane__rail-btn pi-focus-ring"
          [class.is-active]="isOpen('tables')"
          (click)="toggle('tables', $event)"
          [attr.aria-pressed]="isOpen('tables')"
          [attr.aria-expanded]="isOpen('tables')"
          title="Таблицы"
          aria-label="Таблицы"
        >
          <lucide-icon [img]="TableIconSvg" [size]="18"></lucide-icon>
        </button>
        <button
          type="button"
          class="tool-pane__rail-btn pi-focus-ring"
          [class.is-active]="isOpen('photo')"
          (click)="toggle('photo', $event)"
          [attr.aria-pressed]="isOpen('photo')"
          [attr.aria-expanded]="isOpen('photo')"
          title="Фото"
          aria-label="Фото"
        >
          <lucide-icon [img]="ImageIconSvg" [size]="18"></lucide-icon>
        </button>
      </nav>

      @if (anyOpen()) {
        <div
          class="tool-pane__flyout"
          role="dialog"
          [attr.aria-label]="flyoutTitle()"
          aria-modal="true"
        >
          <header class="tool-pane__flyout-head">
            <h2 class="tool-pane__flyout-title">{{ flyoutTitle() }}</h2>
            <button
              type="button"
              class="tool-pane__flyout-close pi-focus-ring"
              (click)="collapse()"
              aria-label="Закрыть палитру"
              title="Закрыть"
            >
              <lucide-icon [img]="CloseIcon" [size]="16"></lucide-icon>
            </button>
          </header>

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
                      (cdkDragEnded)="collapse()"
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
                  @if (selectedCategoryId()) {
                    <p>Нет блоков в этой категории</p>
                  } @else {
                    <p>Нет текстовых блоков.</p>
                    <a
                      routerLink="/doc-constructor/texts"
                      class="tool-pane__empty-link pi-focus-ring"
                      data-test="tool-pane-texts-cta"
                      >Создать текст</a
                    >
                  }
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
                      (cdkDragEnded)="collapse()"
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
                  <p>Нет шаблонов таблиц.</p>
                  <a
                    routerLink="/doc-constructor/tables"
                    class="tool-pane__empty-link pi-focus-ring"
                    data-test="tool-pane-tables-cta"
                    >Создать таблицу</a
                  >
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
        </div>
      }
    </aside>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 48px;
        flex-shrink: 0;
        height: 100%;
        position: relative;
        z-index: 20;
      }

      .tool-pane {
        display: flex;
        height: 100%;
        position: relative;
      }

      .tool-pane__rail {
        width: 48px;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: var(--space-2) 0;
        height: 100%;
        box-sizing: border-box;
        background: var(--pi-bg-elevated);
        background-size: var(--pi-bg-elevated-size);
        background-blend-mode: var(--pi-bg-elevated-blend);
        border-right: 1px solid var(--color-rule);
      }

      .tool-pane__rail-btn {
        position: relative;
        width: 36px;
        height: 36px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid transparent;
        border-radius: 2px;
        background: transparent;
        color: var(--color-muted-foreground);
        cursor: pointer;
        transition:
          color 120ms ease,
          background 120ms ease,
          border-color 120ms ease;
      }

      .tool-pane__rail-btn:hover {
        color: var(--color-ink);
        background: color-mix(in oklch, var(--color-sunrise-soft) 40%, transparent);
      }

      .tool-pane__rail-btn.is-active {
        color: var(--color-ink);
        border-color: color-mix(in oklch, var(--color-gold) 60%, var(--color-rule));
        background: color-mix(in oklch, var(--color-gold) 18%, var(--color-paper));
      }

      .tool-pane__rail-badge {
        position: absolute;
        top: 2px;
        right: 2px;
        min-width: 14px;
        height: 14px;
        padding: 0 var(--space-1);
        font-size: 9px;
        font-weight: 700;
        line-height: 14px;
        text-align: center;
        color: var(--color-ink);
        background: var(--color-paper);
        border: 1px solid var(--color-rule);
        border-radius: 2px;
      }

      .tool-pane__flyout {
        position: absolute;
        left: 48px;
        top: 0;
        bottom: 0;
        width: 300px;
        /* TZ-UI-WR-503: popover-level stacking (WR-501 --z-* scale). */
        z-index: var(--z-popover);
        display: flex;
        flex-direction: column;
        min-height: 0;
        background: var(--pi-bg-elevated);
        background-size: var(--pi-bg-elevated-size);
        background-blend-mode: var(--pi-bg-elevated-blend);
        border-right: 1px solid var(--color-rule);
        animation: tool-pane-slide-in 160ms ease-out;
      }

      @keyframes tool-pane-slide-in {
        from {
          opacity: 0;
          transform: translateX(-8px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .tool-pane__flyout {
          animation: none;
        }
      }

      .tool-pane__flyout-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: calc(var(--space-2) + var(--space-1) / 2) var(--space-3);
        border-bottom: 1px solid var(--color-rule);
        flex-shrink: 0;
      }

      .tool-pane__flyout-title {
        margin: 0;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--color-ink);
      }

      .tool-pane__flyout-close {
        width: 28px;
        height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid transparent;
        border-radius: 2px;
        background: transparent;
        color: var(--color-muted-foreground);
        cursor: pointer;
      }

      .tool-pane__flyout-close:hover {
        color: var(--color-ink);
        border-color: var(--color-rule);
        background: var(--color-paper);
      }

      .tool-pane__panel {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding: calc(var(--space-2) + var(--space-1) / 2) var(--space-3) var(--space-3);
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
        flex-direction: column;
        align-items: stretch;
        gap: 6px;
        margin-bottom: calc(var(--space-2) + var(--space-1) / 2);
      }

      .tool-pane__filter-label {
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--color-muted-foreground);
      }

      .tool-pane__filter-select {
        width: 100%;
        padding: calc(var(--space-2) - var(--space-1) / 2) var(--space-2);
        font-size: 12px;
        font-family: inherit;
        color: var(--color-ink);
        background: var(--color-paper);
        border: 1px solid var(--color-rule);
        cursor: pointer;
      }

      .tool-pane__filter-select:focus {
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
        flex-direction: column;
        gap: 6px;
      }

      .tool-pane__item {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: var(--space-2) calc(var(--space-2) + var(--space-1) / 2);
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        background: var(--color-paper);
        transition:
          background 100ms ease,
          border-color 100ms ease;
        cursor: grab;
        max-width: none;
        min-width: 0;
        width: 100%;
        box-sizing: border-box;
      }

      .tool-pane__item:hover {
        border-color: var(--color-gold);
        background: color-mix(in oklch, var(--color-sunrise-soft) 35%, transparent);
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
        font-size: 12px;
        color: var(--color-ink);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .tool-pane__item-hint {
        font-size: 10px;
        color: var(--color-muted-foreground);
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
        background: var(--color-gold);
        color: var(--color-paper);
        border-color: var(--color-gold);
      }

      .tool-pane__loading,
      .tool-pane__error,
      .tool-pane__empty,
      .tool-pane__hint {
        padding: var(--space-1) 0;
        font-size: 12px;
        color: var(--color-muted-foreground);
        margin: 0;
      }

      .tool-pane__empty p {
        margin: 0 0 var(--space-2);
      }

      .tool-pane__empty-link {
        display: inline-flex;
        align-items: center;
        font-size: 12px;
        font-weight: 600;
        color: var(--color-gold);
        text-decoration: underline;
        text-underline-offset: 2px;
      }

      .tool-pane__photo {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }

      .tool-pane__upload-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: var(--space-2) var(--space-3);
        font-size: 12px;
        font-family: inherit;
        color: var(--color-ink);
        background: var(--color-paper);
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        cursor: pointer;
        transition:
          background 100ms ease,
          border-color 100ms ease;
      }

      .tool-pane__upload-button:hover {
        border-color: var(--color-gold);
        background: color-mix(in oklch, var(--color-sunrise-soft) 35%, transparent);
      }

      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: calc(var(--space-1) * -1);
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      .tool-pane__error {
        color: var(--color-destructive);
      }

      .cdk-drag-preview {
        box-sizing: border-box;
        background: var(--color-paper);
        border: 1px solid var(--color-gold);
        opacity: 0.92;
        padding: calc(var(--space-2) - var(--space-1) / 2) var(--space-3);
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

  readonly addBlock = output<AddBlockPayload>();
  readonly photoSelected = output<File>();
  readonly selectGroup = output<string>();
  readonly ungroupGroup = output<string>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly textBlockCategories = inject(TextBlockCategoriesService);
  private readonly textFilter = inject(BuilderTextFilterService);
  private readonly hostEl = inject(ElementRef<HTMLElement>);

  /** TZ-UI-WR-503: rail button that opened the current section — focus target on collapse. */
  private railFocusRef: HTMLElement | null = null;

  protected readonly FileTextIcon = FileText;
  protected readonly TableIconSvg = TableIcon;
  protected readonly ImageIconSvg = ImageIcon;
  protected readonly LayersIcon = Layers;
  protected readonly PlusIcon = Plus;
  protected readonly UngroupIcon = Ungroup;
  protected readonly CloseIcon = X;

  protected readonly canvasDroplistId = [CANVAS_DROPLIST_ID];

  private readonly open = signal<Record<string, boolean>>({
    groups: false,
    texts: false,
    tables: false,
    photo: false,
  });

  protected readonly isOpen = (k: string): boolean => this.open()[k] === true;
  protected readonly anyOpen = computed(() => Object.values(this.open()).some(Boolean));
  protected readonly flyoutTitle = computed(() => {
    const o = this.open();
    if (o['groups']) return 'Группы';
    if (o['texts']) return 'Тексты';
    if (o['tables']) return 'Таблицы';
    if (o['photo']) return 'Фото';
    return 'Палитра';
  });

  protected readonly toggle = (k: string, event?: Event): void => {
    if (event && event.currentTarget instanceof HTMLElement) {
      this.railFocusRef = event.currentTarget;
    }
    this.open.update((s) => {
      const next = !s[k];
      return { groups: false, texts: false, tables: false, photo: false, [k]: next };
    });
  };

  /** Close flyout — after place-on-canvas, explicit close, Esc or outside click. */
  collapse(): void {
    this.open.set({ groups: false, texts: false, tables: false, photo: false });
    // TZ-UI-WR-503: return focus to the rail button that opened the section.
    if (this.railFocusRef && this.railFocusRef.isConnected) {
      this.railFocusRef.focus({ preventScroll: true });
    }
    this.railFocusRef = null;
  }

  /** TZ-UI-WR-503: Escape closes the open flyout (stopPropagation only when open). */
  @HostListener('document:keydown.escape', ['$event'])
  protected onDocEscape(event: KeyboardEvent): void {
    if (!this.anyOpen()) return;
    event.stopPropagation();
    this.collapse();
  }

  /** TZ-UI-WR-503: pointer down outside the rail/flyout closes the flyout. */
  @HostListener('document:pointerdown', ['$event'])
  protected onDocPointerDown(event: PointerEvent): void {
    if (!this.anyOpen()) return;
    const target = event.target as Node | null;
    if (!target) return;
    // Inside the rail or the flyout — keep open (clicks on rail buttons
    // switch sections; clicks inside flyout interact with its content).
    if (this.hostEl.nativeElement.contains(target)) return;
    this.collapse();
  }

  protected readonly blockTypeItems = (
    ['header', 'text', 'table', 'image', 'signature'] as const
  ).map((t) => ({
    type: t as BlockType,
    label: BLOCK_TYPE_LABELS[t],
    hint: BLOCK_TYPE_HINTS[t],
  }));

  protected readonly categories = signal<TextBlockCategory[]>([]);
  protected readonly categoryLoading = signal(true);
  protected readonly selectedCategoryId = computed(() => this.textFilter.categoryId());

  protected categoryName(id: string | undefined): string | undefined {
    if (!id) return undefined;
    return this.categories().find((c) => c._id === id)?.name;
  }

  constructor() {
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
    this.textFilter.categoryId.set(value ? value : null);
  }

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

  protected readonly textErrorMessage = computed<string>(() => {
    const err = this.textsRes.error() as HttpErrorResponse | null;
    return err ? extractErrorMessage(err) : '';
  });
  protected readonly tableErrorMessage = computed<string>(() => {
    const err = this.tablesRes.error() as HttpErrorResponse | null;
    return err ? extractErrorMessage(err) : '';
  });

  protected onAddBlockType(type: BlockType): void {
    this.addBlock.emit({ source: 'block-type', type });
    this.collapse();
  }

  protected onAddFromTextBlock(t: TextBlock): void {
    this.addBlock.emit({ source: 'text-block', textBlock: t });
    this.collapse();
  }

  protected onAddFromTable(t: TableTemplate): void {
    this.addBlock.emit({ source: 'table-template', tableTemplate: t });
    this.collapse();
  }

  protected onPhotoInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.photoSelected.emit(file);
    input.value = '';
    this.collapse();
  }
}
