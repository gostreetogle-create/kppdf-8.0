import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { HttpErrorResponse, httpResource } from '@angular/common/http';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import {
  LucideAngularModule,
  Database,
  FileText,
  Table as TableIcon,
  Plus,
  Image as ImageIcon,
  Upload,
} from 'lucide-angular';
import { RegistryService } from '../../../shared/services/pi-registry.service';
import { TextBlocksService } from '../../../shared/services/pi-text-blocks.service';
import { TableTemplatesService } from '../../../shared/services/pi-table-templates.service';
import { extractErrorMessage } from '../../../core/silent-http';
import {
  BLOCK_TYPE_LABELS,
  BLOCK_TYPE_HINTS,
  type BlockType,
} from '../../../shared/template-block/template-block.types';
// ButtonComponent removed: tool-pane uses inline `<button>` elements (tool-pane__add, tool-pane__upload-button) so no Paper & Ink Button import needed. (Was NG8113 unused import — fixed.)
import { CANVAS_DROPLIST_ID } from './builder-canvas.component';
import type { TextBlock } from '../../../shared/services/pi-text-blocks.service';
import type { TableTemplate } from '../../../shared/services/pi-table-templates.service';

/**
 * TZ-86 Phase D.1 + D.2 — `BuilderToolPane` (left pane).
 *
 * Five collapsible accordion-tabs:
 *   1. **Структура** — 5 buttons «+» per BlockType.
 *   2. **Тексты** — list TextBlock items via httpResource.
 *   3. **Таблицы** — list TableTemplate items via httpResource.
 *   4. **Данные** — DataSourceDescriptor groups from registry.
 *   5. **Декорации** (Phase D.2.1) — file input for background image upload
 *      (≤ 5 MB, png|jpeg|webp). Emits `(uploadBackground)` with the
 *      selected File; parent BuilderPage calls DocumentTemplatesService.
 *
 * Phase D.2.2 (drag-from-palette): each palette list is wrapped in
 * `cdkDropList` with `[cdkDropListConnectedTo]="['canvas-droplist']"`. Each
 * item is a `cdkDrag` with `[cdkDragData]="<AddBlockPayload>"`. Dropping
 * an item on the canvas (which has matching id) triggers BuilderCanvas's
 * `(dropAdd)` output, which routes back to BuilderPage.
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

      <!-- Section 1: Block types (drag-enabled) -->
      <section class="tool-pane__section" [class.is-open]="isOpen('blocks')">
        <button
          type="button"
          class="tool-pane__section-toggle pi-focus-ring"
          (click)="toggle('blocks')"
          [attr.aria-expanded]="isOpen('blocks')"
        >
          <span class="tool-pane__section-title">Блоки</span>
        </button>
        @if (isOpen('blocks')) {
          <ul
            cdkDropList
            [cdkDropListData]="blockTypeItems"
            [cdkDropListConnectedTo]="canvasDroplistId"
            class="tool-pane__list"
          >
            @for (item of blockTypeItems; track item.type) {
              <li
                cdkDrag
                [cdkDragData]="{ source: 'block-type', type: item.type }"
                class="tool-pane__item"
              >
                <div class="tool-pane__item-text">
                  <span class="tool-pane__item-label">{{ item.label }}</span>
                  <span class="tool-pane__item-hint">{{ item.hint }}</span>
                </div>
                <button
                  type="button"
                  class="tool-pane__add pi-focus-ring"
                  [attr.aria-label]="'Добавить ' + item.label"
                  [title]="'Добавить ' + item.label"
                  (click)="onAddBlockType(item.type)"
                >
                  <lucide-icon [img]="PlusIcon" [size]="14"></lucide-icon>
                </button>
              </li>
            }
          </ul>
        }
      </section>

      <!-- Section 2: Text-blocks (drag-enabled) -->
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
            <p class="tool-pane__empty">Нет сохранённых текстов</p>
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

      <!-- Section 4: Data sources (registry, drag-enabled) -->
      <section class="tool-pane__section" [class.is-open]="isOpen('data')">
        <button
          type="button"
          class="tool-pane__section-toggle pi-focus-ring"
          (click)="toggle('data')"
          [attr.aria-expanded]="isOpen('data')"
        >
          <lucide-icon [img]="DatabaseIcon" [size]="14"></lucide-icon>
          <span class="tool-pane__section-title">Данные</span>
        </button>
        @if (isOpen('data')) {
          @if (registryRes.isLoading()) {
            <p class="tool-pane__loading">Загрузка…</p>
          } @else if (registryRes.error()) {
            <p class="tool-pane__error">{{ registryErrorMessage() }}</p>
          } @else if (registryRes.value()) {
            @for (src of registryRes.value()!.sources; track src.key) {
              <div class="tool-pane__subgroup">
                <h4 class="tool-pane__subgroup-title">{{ src.label }}</h4>
                <ul
                  cdkDropList
                  [cdkDropListData]="src.fields"
                  [cdkDropListConnectedTo]="canvasDroplistId"
                  class="tool-pane__list"
                >
                  @for (f of src.fields; track f.key) {
                    <li
                      cdkDrag
                      [cdkDragData]="{ source: 'data-binding', dataSource: src.key, field: f }"
                      class="tool-pane__item"
                    >
                      <div class="tool-pane__item-text">
                        <span class="tool-pane__item-label">{{ f.label }}</span>
                        <span class="tool-pane__item-hint">{{ f.type }}</span>
                      </div>
                      <button
                        type="button"
                        class="tool-pane__add pi-focus-ring"
                        [attr.aria-label]="'Добавить поле ' + f.label"
                        [title]="'Добавить поле ' + f.label"
                        (click)="onAddFromData(src.key, f)"
                      >
                        <lucide-icon [img]="PlusIcon" [size]="14"></lucide-icon>
                      </button>
                    </li>
                  }
                </ul>
              </div>
            }
          }
        }
      </section>

      <!-- Section 5: Decorations (D.2.1) — background image upload -->
      <section class="tool-pane__section" [class.is-open]="isOpen('decorations')">
        <button
          type="button"
          class="tool-pane__section-toggle pi-focus-ring"
          (click)="toggle('decorations')"
          [attr.aria-expanded]="isOpen('decorations')"
        >
          <lucide-icon [img]="ImageIconSvg" [size]="14"></lucide-icon>
          <span class="tool-pane__section-title">Декорации</span>
        </button>
        @if (isOpen('decorations')) {
          <div class="tool-pane__decorations">
            <p class="tool-pane__hint">
              Загрузите фоновое изображение (PNG, JPEG, WebP, до 5 МБ)
            </p>
            <label class="tool-pane__upload">
              <input
                #fileInput
                type="file"
                accept="image/png,image/jpeg,image/webp"
                class="tool-pane__file-input"
                (change)="onFileChange($event)"
              />
              <span class="tool-pane__upload-button pi-focus-ring">
                <lucide-icon [img]="UploadIcon" [size]="14"></lucide-icon>
                Загрузить фон
              </span>
            </label>
          </div>
        }
      </section>
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

      .tool-pane__decorations {
        padding: 8px 16px 16px;
      }

      .tool-pane__upload {
        display: block;
        margin-top: 8px;
      }

      .tool-pane__file-input {
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

      .tool-pane__upload-button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        font-size: 12px;
        font-weight: 600;
        background: var(--color-paper-2);
        color: var(--color-ink);
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        cursor: pointer;
        transition: all 100ms ease;
      }

      .tool-pane__upload-button:hover {
        background: var(--color-ink);
        color: var(--color-paper);
        border-color: var(--color-ink);
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
  /** D.2.1: emitted when user picks a file in the Decorations tab. */
  readonly uploadBackground = output<File>();

  // DI
  private readonly textBlocks = inject(TextBlocksService);
  private readonly tableTemplates = inject(TableTemplatesService);
  private readonly registry = inject(RegistryService);

  // Icons
  protected readonly DatabaseIcon = Database;
  protected readonly FileTextIcon = FileText;
  protected readonly TableIconSvg = TableIcon;
  protected readonly PlusIcon = Plus;
  protected readonly ImageIconSvg = ImageIcon;
  protected readonly UploadIcon = Upload;

  // D.2.2: cdkDropListConnectedTo target — imported from builder-canvas so
  // the id string is single-sourced (see code-reviewer nit 2 on D.2).
  protected readonly canvasDroplistId = [CANVAS_DROPLIST_ID];

  // Tab state
  private readonly open = signal<Record<string, boolean>>({
    blocks: true,
    texts: false,
    tables: false,
    data: false,
    decorations: false,
  });
  protected readonly isOpen = (k: string): boolean => this.open()[k] === true;
  protected readonly toggle = (k: string): void => {
    this.open.update((s) => ({ ...s, [k]: !s[k] }));
  };

  // Static palette data
  protected readonly blockTypeItems = (['header', 'text', 'table', 'image', 'signature', 'spacer'] as const)
    .map((t) => ({
      type: t as BlockType,
      label: BLOCK_TYPE_LABELS[t],
      hint: BLOCK_TYPE_HINTS[t],
    }));

  // httpResource for live data
  protected readonly textsRes = httpResource<TextBlock[]>(
    () => '/api/text-blocks?isActive=true',
    { defaultValue: [] },
  );
  protected readonly tablesRes = httpResource<TableTemplate[]>(
    () => '/api/table-templates?isActive=true',
    { defaultValue: [] },
  );
  // Typed response (sources array of { key, label, type, fields[] }). Without
  // an explicit generic + defaultValue, httpResource infers the result as `{}`
  // and template access to `.sources` fails with TS2339.
  protected readonly registryRes = httpResource<{ sources: Array<{ key: string; label: string; type: string; fields: Array<{ key: string; label: string; type: string }> }> }>(
    () => '/api/registry/data-sources',
    { defaultValue: { sources: [] } },
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
  protected readonly registryErrorMessage = computed<string>(() => {
    const err = this.registryRes.error() as HttpErrorResponse | null;
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

  /**
   * `sourceKey` is widened to `string` because httpResource sources come back
   * as plain strings (not the discriminated union). The backend API
   * contractually returns only the 5 documented sources (organization,
   * counterparty, product, material, work-type) — see RegistryService and
   * the {@link AddBlockPayload} union definition — so a cast at emit site
   * is type-safe by construction.
   */
  protected onAddFromData(
    sourceKey: string,
    field: { key: string; label: string; type: string },
  ): void {
    this.addBlock.emit({
      source: 'data-binding',
      dataSource: sourceKey as 'organization' | 'counterparty' | 'product' | 'material' | 'work-type',
      field,
    });
  }

  /** D.2.1: file picker handler — emit the chosen File to BuilderPage. */
  protected onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploadBackground.emit(file);
    // Reset input so the same file can be re-selected later.
    input.value = '';
  }
}

/**
 * Discriminated union of the 4 ways a user can add a block from the tool pane.
 * BuilderPage handles the union and creates the appropriate TemplateBlock.
 * Phase D.2.2: this is also the `cdkDragData` carried by palette items.
 */
export type AddBlockPayload =
  | { source: 'block-type'; type: BlockType }
  | { source: 'text-block'; textBlock: TextBlock }
  | { source: 'table-template'; tableTemplate: TableTemplate }
  | {
      source: 'data-binding';
      dataSource: 'organization' | 'counterparty' | 'product' | 'material' | 'work-type';
      field: { key: string; label: string; type: string };
    };
