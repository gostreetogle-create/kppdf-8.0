import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { HttpErrorResponse, httpResource } from '@angular/common/http';
import { LucideAngularModule, Database, FileText, Table as TableIcon, Plus } from 'lucide-angular';
import { RegistryService } from '../../../shared/services/pi-registry.service';
import { TextBlocksService } from '../../../shared/services/pi-text-blocks.service';
import { TableTemplatesService } from '../../../shared/services/pi-table-templates.service';
import { extractErrorMessage } from '../../../core/silent-http';
import {
  BLOCK_TYPE_LABELS,
  BLOCK_TYPE_HINTS,
  type BlockType,
} from '../../../shared/template-block/template-block.types';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import type { TextBlock } from '../../../shared/services/pi-text-blocks.service';
import type { TableTemplate } from '../../../shared/services/pi-table-templates.service';

/**
 * TZ-86 Phase D.1 — `BuilderToolPane` (left pane).
 *
 * Three collapsible accordion-tabs:
 *
 *   1. **Структура** (built-in) — 5 buttons «+» per BlockType. Clicking
 *      emits `(addBlock)` with a NEW ephemeral block (tempId only, no _id).
 *      Parent BuilderPage adds it to the in-memory list, fires auto-save
 *      debounce, and on response swaps `tempId` for the server `_id`.
 *
 *   2. **Тексты** (text-blocks) — list of saved TextBlocks from backend.
 *      Each item has a «+» button that emits `(addBlock)` with type='text'
 *      AND pre-fills `content` with the TextBlock content + `title` with
 *      TextBlock name. dataBinding is set to `{source: 'static', value: ...}`
 *      (the text-block is static markdown content; future TZ: dedicated
 *      TextBlock source enum).
 *
 *   3. **Таблицы** (table-templates) — list of saved TableTemplates. Click
 *      emits `(addBlock)` with type='table' + `settings: { tableTemplateId }`.
 *
 *   4. **Данные** (registry) — list of DataSourceDescriptor groups; clicking
 *      a FIELD inserts a NEW block with that source.field binding
 *      (placeholder content «[organization.name]»).
 *
 * State: local signals for which tab is open + injected httpResource for
 * text-blocks / table-templates / data-sources lists.
 */
@Component({
  selector: 'app-builder-tool-pane',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, ButtonComponent],
  template: `
    <aside class="tool-pane" aria-label="Палитра блоков">
      <header class="tool-pane__header">
        <h2 class="tool-pane__title">Палитра</h2>
        <p class="tool-pane__subtitle">Перетащите блок на холст или нажмите «+»</p>
      </header>

      <!-- Section 1: Block types -->
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
          <ul class="tool-pane__list">
            @for (item of blockTypeItems; track item.type) {
              <li class="tool-pane__item">
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

      <!-- Section 2: Text-blocks -->
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
            <ul class="tool-pane__list">
              @for (t of textsRes.value() ?? []; track t._id) {
                <li class="tool-pane__item">
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

      <!-- Section 3: Table templates -->
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
            <ul class="tool-pane__list">
              @for (t of tablesRes.value() ?? []; track t._id) {
                <li class="tool-pane__item">
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

      <!-- Section 4: Data sources (registry) -->
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
                <ul class="tool-pane__list">
                  @for (f of src.fields; track f.key) {
                    <li class="tool-pane__item">
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
        background: oklch(var(--color-paper));
        border-right: 1px solid oklch(var(--color-rule));
      }

      .tool-pane__header {
        padding: 16px 16px 8px;
        border-bottom: 1px solid oklch(var(--color-rule));
      }

      .tool-pane__title {
        font-size: 13px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: oklch(var(--color-ink));
        margin: 0 0 4px;
      }

      .tool-pane__subtitle {
        font-size: 11px;
        color: oklch(var(--color-muted));
        margin: 0;
      }

      .tool-pane__section {
        border-bottom: 1px solid oklch(var(--color-rule));
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
        color: oklch(var(--color-ink));
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        text-align: left;
      }

      .tool-pane__section-toggle:hover {
        background: oklch(var(--color-sunrise-soft) / 0.4);
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
      }

      .tool-pane__item:hover {
        background: oklch(var(--color-sunrise-soft) / 0.4);
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
        color: oklch(var(--color-ink));
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .tool-pane__item-hint {
        font-size: 10px;
        color: oklch(var(--color-muted));
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
        border: 1px solid oklch(var(--color-rule));
        color: oklch(var(--color-ink));
        cursor: pointer;
        border-radius: 2px;
        transition: all 100ms ease;
      }

      .tool-pane__add:hover {
        background: oklch(var(--color-ink));
        color: oklch(var(--color-paper));
        border-color: oklch(var(--color-ink));
      }

      .tool-pane__subgroup {
        padding: 4px 0 8px;
      }

      .tool-pane__subgroup-title {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: oklch(var(--color-muted));
        margin: 4px 16px 4px;
        font-weight: 600;
      }

      .tool-pane__loading,
      .tool-pane__error,
      .tool-pane__empty {
        padding: 8px 16px;
        font-size: 12px;
        color: oklch(var(--color-muted));
        margin: 0;
      }

      .tool-pane__error {
        color: oklch(var(--color-destructive));
      }
    `,
  ],
})
export class BuilderToolPaneComponent {
  // Outputs
  readonly addBlock = output<AddBlockPayload>();

  // DI
  private readonly textBlocks = inject(TextBlocksService);
  private readonly tableTemplates = inject(TableTemplatesService);
  private readonly registry = inject(RegistryService);

  // Icons
  protected readonly DatabaseIcon = Database;
  protected readonly FileTextIcon = FileText;
  protected readonly TableIconSvg = TableIcon;
  protected readonly PlusIcon = Plus;

  // Tab state
  private readonly open = signal<Record<string, boolean>>({
    blocks: true,
    texts: false,
    tables: false,
    data: false,
  });
  protected readonly isOpen = (k: string): boolean => this.open()[k] === true;
  protected readonly toggle = (k: string): void => {
    this.open.update((s) => ({ ...s, [k]: !s[k] }));
  };

  // Static palette data
  protected readonly blockTypeItems = (['header', 'text', 'table', 'image', 'signature'] as const)
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
  protected readonly registryRes = httpResource(() => '/api/registry/data-sources');

  // Error extraction — runtime null guard: httpResource.error() returns
  // `unknown` and may be null on a successful or pending request. The
  // computed returns '' when no error is present (caller-side render
  // shows nothing in that case via the `@else if (textsRes.error())` branch).
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

  protected onAddFromData(
    sourceKey: 'organization' | 'counterparty' | 'product' | 'material' | 'work-type',
    field: { key: string; label: string; type: string },
  ): void {
    this.addBlock.emit({ source: 'data-binding', dataSource: sourceKey, field });
  }
}

/**
 * Discriminated union of the 4 ways a user can add a block from the tool pane.
 * BuilderPage handles the union and creates the appropriate TemplateBlock.
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
