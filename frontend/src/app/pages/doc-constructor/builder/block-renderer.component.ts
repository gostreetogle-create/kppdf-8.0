/*!
 * ⚠ innerHTML trust-model notice
 *
 * This file uses DomSanitizer.bypassSecurityTrustHtml() on text-block column
 * content (see byPassHtml() below). This bypasses Angular's default DOM
 * sanitizer, which would otherwise strip inline style attributes needed for
 * TipTap-formatted content (bold/italic/color/highlight) to display with
 * visual fidelity.
 *
 * The bypass is safe because of the following trust boundaries:
 *   1. Server-side DOMPurify pass — ACTIVE. `sanitizeHtml()` / `sanitizeBlockContent()`
 *      in `backend/src/common/sanitize-html.ts` strips <script>, <iframe>,
 *      on*-handlers, javascript: URIs, and other injection vectors at write
 *      time (text-block + template-block services). All paths converge on
 *      safe HTML including bulk-import and dev fixtures.
 *   2. TipTap editor validation — TipTap uses ProseMirror's schema system;
 *      unknown HTML nodes and dangerous attributes are rejected at the
 *      editor layer.
 *   3. RBAC — TextBlock / TemplateBlock CRUD endpoints are admin/manager
 *      only (TZ-91 Phase A1+A4 whitelist).
 *
 * Before adding a new [innerHTML] usage anywhere on this file, update the
 * trust model above AND confirm server-side sanitization is wired.
 * Conventional short reference: trust-model see file header banner.
 */

import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { LucideAngularModule } from 'lucide-angular';
import {
  BLOCK_TYPE_LABELS,
  type BlockType,
  type TemplateBlock,
} from '../../../shared/template-block/template-block.types';
import type { TableColumn } from '../../../shared/services/pi-table-templates.service';

/**
 * TZ-86 Phase D.1 — BlockRenderer (leaf, presentational).
 *
 * Renders ONE TemplateBlock on the builder canvas. Wraps the content in
 * a cdkDrag so the parent BuilderCanvas (cdkDropList) can reorder it.
 *
 * Selection model:
 *   - Click anywhere on the block (NOT the drag-handle) → emits (select)
 *   - The parent BuilderPage keeps a selectedId signal and reflects
 *     it back via the selected input → 2px ink outline + bg-sunrise-soft
 *
 * Rendering per type:
 *   - header   → bold H2-like text + optional horizontal hairline rule
 *   - text     → raw content as paragraph (no markdown for MVP)
 *   - table    → shows a 1-row summary «Таблица: {title}» + binding source label
 *   - image    → placeholder «Изображение: {title}» (no upload for MVP)
 *   - signature→ centered «Подпись: {title}» with hairline underline
 *
 * Data-binding badge: if dataBinding is non-null, show a small sunrise-warm
 * pill «[source.field]» so the user can see at a glance which blocks are
 * dynamic vs static.
 *
 * Multi-column (TZ-104.6+): when block.columns[] is non-empty, renders
 * a CSS grid with one cell per column. Each cell's HTML goes through
 * byPassHtml() which calls DomSanitizer.bypassSecurityTrustHtml() —
 * see the file-header banner for the trust-model rationale.
 *
 * Precedence rule (TZ-104.7 NIT #2): when BOTH content and columns[]
 * are present, render content ABOVE the columns grid as a preamble — the
 * user keeps their prose, the multi-column layout stays intact. If only
 * content is present, render the existing renderedContent() plain-text
 * fallback. If only columns[] is present, render the grid alone.
 *
 * No service injection (other than DOM sanitizer for HTML escaping). All
 * inputs come from the parent; outputs go back up.
 */
@Component({
  selector: 'app-block-renderer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkDrag, CdkDragHandle, LucideAngularModule],
  template: `
    <div
      cdkDrag
      cdkDragLockAxis="y"
      class="group block-renderer"
      [class.is-selected]="selected()"
      [class.is-multi-selected]="multiSelected()"
      [class.is-inactive]="!block().isActive"
      [attr.data-block-type]="block().type"
      [attr.aria-selected]="selected() || multiSelected()"
      [attr.role]="'button'"
      [attr.tabindex]="'0'"
      [style.width.%]="currentWidth()"
      [style.margin-left.%]="currentMarginLeft()"
      (click)="onSelect($event)"
      (keydown.enter)="onSelect($event)"
      (keydown.space)="onSelect($event)"
      (keydown.arrowUp)="onArrowKey($event, 'up')"
      (keydown.arrowDown)="onArrowKey($event, 'down')"
    >
      <!-- Resize handles (visible when selected) — left & right side bars -->
      @if (selected()) {
        <div
          class="block-renderer__resize-side block-renderer__resize-side--left"
          (mousedown)="onResizeStart($event, 'left')"
          (click)="$event.stopPropagation()"
          title="Перетащите вправо для отступа слева"
        ></div>
        <div
          class="block-renderer__resize-side block-renderer__resize-side--right"
          (mousedown)="onResizeStart($event, 'right')"
          (click)="$event.stopPropagation()"
          title="Перетащите влево для отступа справа"
        ></div>
      }
      <!-- Multi-select checkbox (visible on hover or when multi-selected) -->
      <div
        class="block-renderer__checkbox"
        [class.is-visible]="multiSelected()"
        (click)="onCheckboxClick($event)"
        (keydown.enter)="onCheckboxClick($event)"
        (keydown.space)="onCheckboxClick($event)"
        (mousedown)="$event.stopPropagation()"
        role="checkbox"
        [attr.aria-checked]="multiSelected()"
        [attr.aria-label]="multiSelected() ? 'Убрать из выделения' : 'Выбрать блок'"
        [attr.tabindex]="multiSelected() ? '0' : '-1'"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          @if (multiSelected()) {
            <rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="2"
              fill="var(--color-gold)"
              stroke="var(--color-gold)"
            />
            <polyline points="9 12 11 14 15 10" stroke="white" stroke-width="2.5" />
          } @else {
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" />
          }
        </svg>
      </div>
      <div class="block-renderer__body">
        <!-- TZ-211: Drag handle (grip dots) -->
        <div class="block-renderer__drag-handle" cdkDragHandle title="Перетащите для перемещения">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="8" cy="6" r="2"/><circle cx="16" cy="6" r="2"/>
            <circle cx="8" cy="12" r="2"/><circle cx="16" cy="12" r="2"/>
            <circle cx="8" cy="18" r="2"/><circle cx="16" cy="18" r="2"/>
          </svg>
        </div>
        @if (block().type === 'table' && tableColumns().length > 0) {
          <!-- Table block: render actual table with columns and sample rows -->
          <div class="block-renderer__table-wrap">
            <table class="block-renderer__table">
              <thead>
                <tr>
                  @for (col of tableColumns(); track col.key) {
                    <th [style.text-align]="col.align" [style.width]="col.width + 'px'">
                      {{ col.label }}
                    </th>
                  }
                </tr>
              </thead>
              <tbody>
                @if (tableRows().length > 0) {
                  @for (row of tableRows(); track $index) {
                    <tr>
                      @for (cell of row; track $index; let ci = $index) {
                        <td [style.text-align]="tableColumns()[ci]?.align ?? 'left'">
                          {{ formatTableCell(cell, tableColumns()[ci]?.type ?? 'text') }}
                        </td>
                      }
                    </tr>
                  }
                } @else {
                  <tr>
                    <td [attr.colspan]="tableColumns().length" class="block-renderer__table-empty">
                      Нет данных
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else if (block().type === 'spacer') {
          <!-- Spacer block: empty space -->
          <div class="block-renderer__spacer" [style.height.px]="block().height ?? 40"></div>
        } @else if (hasColumns()) {
          <!-- Multi-column text block -->
          @if (block().content) {
            <div class="block-renderer__content block-renderer__content--preamble">
              {{ renderedContent() }}
            </div>
          }
          <div
            class="block-renderer__columns"
            [style.grid-template-columns]="columnsGridTemplate()"
          >
            @for (col of block().columns; track col.id) {
              <div class="block-renderer__column" [innerHTML]="byPassHtml(col.content)"></div>
            }
          </div>
        } @else {
          <!-- Default text rendering -->
          <div class="block-renderer__header">
            <span class="block-renderer__type">{{ typeLabel() }}</span>
            @if (bindingBadge()) {
              <span class="block-renderer__binding" [title]="bindingBadgeTooltip()">
                {{ bindingBadge() }}
              </span>
            }
          </div>
          <div class="block-renderer__content">
            {{ renderedContent() }}
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .block-renderer {
        position: relative;
        display: flex;
        gap: 8px;
        align-items: flex-start;
        padding: 10px 12px;
        background: var(--color-paper);
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        cursor: pointer;
        transition:
          background 120ms ease,
          border-color 120ms ease,
          box-shadow 120ms ease;
      }

      /* TZ-211: Hover — paper-3 background */
      .block-renderer:hover {
        background: var(--color-paper-3);
      }

      /* TZ-211: Selected — gold border + shadow */
      .block-renderer.is-selected {
        border-color: var(--color-gold);
        background: var(--color-paper);
        box-shadow: 0 0 0 1px var(--color-gold), 0 2px 8px -2px rgba(0, 0, 0, 0.1);
      }

      /* TZ-211: Multi-selected — gold-soft background */
      .block-renderer.is-multi-selected {
        border-color: var(--color-gold);
        background: var(--color-gold-soft);
      }

      /* Multi-select checkbox */
      .block-renderer__checkbox {
        position: absolute;
        top: 8px;
        left: 8px;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 150ms ease;
        cursor: pointer;
        z-index: 5;
      }

      .block-renderer:hover .block-renderer__checkbox,
      .block-renderer__checkbox.is-visible {
        opacity: 1;
      }

      .block-renderer.is-inactive {
        opacity: 0.5;
      }

      .block-renderer__body {
        flex: 1;
        min-width: 0;
      }

      .block-renderer__header {
        display: flex;
        gap: 8px;
        align-items: center;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-muted);
        margin-bottom: 4px;
      }

      .block-renderer__type {
        font-weight: 600;
      }

      .block-renderer__binding {
        background: var(--color-gold-soft);
        color: var(--color-gold);
        padding: 1px 6px;
        border-radius: 2px;
        font-size: 10px;
        font-family: ui-monospace, monospace;
        text-transform: none;
        letter-spacing: 0;
      }

      .block-renderer__content {
        font-size: 14px;
        color: var(--color-ink);
        line-height: 1.5;
        word-wrap: break-word;
      }

      /* TZ-104.7 NIT #2: preamble spacing — a thin margin separates the
         prose above from the columns grid below. */
      .block-renderer__content--preamble {
        margin-bottom: 8px;
        padding-bottom: 8px;
        border-bottom: 1px dashed var(--color-rule);
      }

      /* Header variant — larger weight */
      .block-renderer[data-block-type='header'] .block-renderer__content {
        font-size: 18px;
        font-weight: 600;
      }

      /* Signature variant — centered, italic */
      .block-renderer[data-block-type='signature'] {
        align-items: center;
        justify-content: center;
        flex-direction: column;
      }
      .block-renderer[data-block-type='signature'] .block-renderer__content {
        font-style: italic;
        text-align: center;
        border-top: 1px solid var(--color-rule);
        padding-top: 8px;
        width: 100%;
      }

      /* Table variant — content styled as caption */
      .block-renderer[data-block-type='table'] .block-renderer__content {
        font-family: ui-monospace, monospace;
        font-size: 13px;
        color: var(--color-muted);
      }

      /* Table block — actual table rendering */
      .block-renderer__table-title {
        font-weight: 600;
        color: var(--color-ink);
      }
      .block-renderer__table-wrap {
        overflow-x: auto;
        margin-top: 4px;
      }
      .block-renderer__table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
      }
      .block-renderer__table th {
        padding: 6px 8px;
        text-align: left;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-muted-foreground-strong);
        background: var(--color-paper-2);
        border-bottom: 1px solid var(--color-ink);
        white-space: nowrap;
      }
      .block-renderer__table td {
        padding: 5px 8px;
        border-bottom: 1px solid var(--color-rule);
        color: var(--color-ink);
        word-break: break-word;
      }
      .block-renderer__table tr:last-child td {
        border-bottom: none;
      }
      .block-renderer__table-empty {
        text-align: center;
        font-style: italic;
        color: var(--color-muted-foreground-strong);
        padding: 12px 8px;
      }

      /* ═══ Drag Handle — TZ-211 ═══ */
      .block-renderer__drag-handle {
        position: absolute;
        left: -20px;
        top: 50%;
        transform: translateY(-50%);
        width: 16px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-muted);
        opacity: 0;
        transition: opacity 150ms ease, color 150ms ease;
        cursor: grab;
        z-index: 5;
      }

      .block-renderer:hover .block-renderer__drag-handle {
        opacity: 0.5;
      }

      .block-renderer:hover .block-renderer__drag-handle:hover {
        opacity: 1;
        color: var(--color-gold);
      }

      /* Spacer block */
      .block-renderer__spacer {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 0 16px;
      }
      .block-renderer__spacer-line {
        flex: 1;
        height: 1px;
        background: var(--color-rule);
      }
      .block-renderer__spacer-label {
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-muted-foreground-strong);
        white-space: nowrap;
      }

      /* Multi-column grid layout */
      .block-renderer__columns {
        display: grid;
        gap: 12px;
        font-size: 14px;
        color: var(--color-ink);
        line-height: 1.5;
        width: 100%;
      }

      .block-renderer__column {
        min-width: 0;
        overflow-wrap: anywhere;
        word-break: break-word;
      }

      .block-renderer__column :first-child {
        margin-top: 0;
      }

      .block-renderer__column :last-child {
        margin-bottom: 0;
      }

      .block-renderer__column p {
        margin: 0 0 0.5em;
      }

      /* Trust-model-mandated multi-column fidelity rules.
         TZ-104.7 NIT #4: cover both 'strong'|'em' (TipTap default in v3)
         and legacy/manual 'b'|'i' (HTML standard + paste-in survivals). */
      .block-renderer__column strong,
      .block-renderer__column b {
        font-weight: 600;
      }
      .block-renderer__column em,
      .block-renderer__column i {
        font-style: italic;
      }

      /* Resize side handles — left & right bars, always subtly visible */
      .block-renderer__resize-side {
        position: absolute;
        top: 0;
        width: 8px;
        height: 100%;
        cursor: ew-resize;
        opacity: 0.25;
        transition: opacity 150ms ease;
        z-index: 10;
      }

      .block-renderer__resize-side--left {
        left: -4px;
        border-left: 2px solid var(--color-muted);
      }

      .block-renderer__resize-side--right {
        right: -4px;
        border-right: 2px solid var(--color-muted);
      }

      .block-renderer:hover .block-renderer__resize-side,
      .block-renderer.is-selected .block-renderer__resize-side {
        opacity: 0.6;
      }

      .block-renderer__resize-side--left:hover,
      .block-renderer__resize-side--left.is-dragging {
        border-left-color: var(--color-gold);
        opacity: 1;
      }

      .block-renderer__resize-side--right:hover,
      .block-renderer__resize-side--right.is-dragging {
        border-right-color: var(--color-gold);
        opacity: 1;
      }

      /* Print: hide editor-only elements */
      @media print {
        .block-renderer {
          border: none !important;
          border-radius: 0 !important;
          padding: 0 !important;
          margin-left: 0 !important;
          width: 100% !important;
          background: transparent !important;
          break-inside: avoid;
        }
        .block-renderer__resize-side,
        .block-renderer__checkbox {
          display: none !important;
        }
        .block-renderer__spacer {
          break-inside: avoid;
        }
      }
    `,
  ],
})
export class BlockRendererComponent {
  /** The block to render. */
  readonly block = input.required<TemplateBlock>();
  /** Whether this block is the currently-selected one (drives outline). */
  readonly selected = input<boolean>(false);
  /** Whether this block is in multi-select mode (Ctrl+Click). */
  readonly multiSelected = input<boolean>(false);
  /** Emitted when the user clicks/keys to select this block. */
  readonly select = output<TemplateBlock>();
  /** Emitted on Ctrl/Meta+click for multi-select toggle. */
  readonly multiSelect = output<TemplateBlock>();
  /** Emitted when the user finishes resizing the block. Carries new width & marginLeft. */
  readonly widthChange = output<{ width: number; marginLeft: number }>();

  /**
   * DOM sanitizer injected to bypass Angular's default innerHTML stripping.
   * See the file-header banner for the trust-model rationale.
   */
  private readonly sanitizer = inject(DomSanitizer);

  /** Current block width percentage (read from settings.width, default 100). */
  protected readonly currentWidth = signal<number>(100);
  /** Current block left margin percentage (read from settings.marginLeft, default 0). */
  protected readonly currentMarginLeft = signal<number>(0);

  constructor() {
    // Sync width & marginLeft from block settings when block changes
    effect(() => {
      const b = this.block();
      const settings = b.settings as Record<string, unknown> | undefined;
      const w = typeof settings?.['width'] === 'number' ? settings['width'] : 100;
      const ml = typeof settings?.['marginLeft'] === 'number' ? settings['marginLeft'] : 0;
      this.currentWidth.set(Math.max(20, Math.min(100, w)));
      this.currentMarginLeft.set(Math.max(0, Math.min(80, ml)));
    });
  }

  /**
   * Resize handle mousedown — starts a document-level drag to resize the block.
   * Side 'left' adjusts marginLeft; side 'right' adjusts width.
   * Width is calculated as a percentage of the paper container width.
   */
  protected onResizeStart(event: MouseEvent, side: 'left' | 'right'): void {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startWidth = this.currentWidth();
    const startMarginLeft = this.currentMarginLeft();
    // Find the paper container to get its width for percentage calculation
    const paper = (event.target as HTMLElement)?.closest('.pi-canvas-page-paper') as HTMLElement;
    const containerWidth = paper?.clientWidth ?? 720;

    // Visual feedback — highlight the active handle
    const handle = event.target as HTMLElement;
    handle.classList.add('is-dragging');

    const onMove = (e: MouseEvent): void => {
      const deltaPx = e.clientX - startX;
      const deltaPercent = (deltaPx / containerWidth) * 100;

      if (side === 'left') {
        // Left handle: drag right → increase marginLeft, decrease width
        const newMarginLeft = Math.max(0, Math.min(80, startMarginLeft + deltaPercent));
        const newWidth = Math.max(20, 100 - newMarginLeft);
        this.currentMarginLeft.set(Math.round(newMarginLeft));
        this.currentWidth.set(Math.round(newWidth));
      } else {
        // Right handle: drag left → decrease width
        const newWidth = Math.max(20, Math.min(100 - startMarginLeft, startWidth + deltaPercent));
        this.currentWidth.set(Math.round(newWidth));
      }
    };

    const onUp = (): void => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      handle.classList.remove('is-dragging');
      this.widthChange.emit({
        width: this.currentWidth(),
        marginLeft: this.currentMarginLeft(),
      });
    };

    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  /**
   * Wraps col.content (HTML string from TipTap) in a SafeHtml so that
   * inline style attributes for bold/italic/color/highlight pass through
   * to the rendered output. Without this, columns render as plain text.
   *
   * content ?? '' defensively handles missing content (empty SafeHtml).
   */
  protected byPassHtml(content: string | undefined): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content ?? '');
  }

  protected readonly hasColumns = computed<boolean>(() => {
    const cols = this.block().columns;
    return !!cols && cols.length > 0;
  });

  /** Table columns from block.settings.tableTemplateColumns (populated on drop). */
  protected readonly tableColumns = computed<TableColumn[]>(() => {
    const b = this.block();
    if (b.type !== 'table') return [];
    const settings = b.settings as Record<string, unknown> | undefined;
    const cols = settings?.['tableTemplateColumns'] as TableColumn[] | undefined;
    return cols ?? [];
  });

  /** Table sample rows from block.settings.tableTemplateSampleRows. */
  protected readonly tableRows = computed<unknown[][]>(() => {
    const b = this.block();
    if (b.type !== 'table') return [];
    const settings = b.settings as Record<string, unknown> | undefined;
    const rows = settings?.['tableTemplateSampleRows'] as unknown[][] | undefined;
    return rows ?? [];
  });

  /**
   * TZ-104.7 NIT #1 — defensive width normalization. Legacy DB rows from
   * pre-TZ-104.6 epochs (or dev-fixture columns written without width)
   * can have col.width === undefined. Splicing '${undefined}%' into the
   * template collapses the column to 0px. Fall back to equal share so
   * legacy rows still render visibly.
   */
  protected readonly columnsGridTemplate = computed<string>(() => {
    const cols = this.block().columns;
    if (!cols || cols.length === 0) return '1fr';
    return cols.map(() => '1fr').join(' ');
  });

  protected readonly typeLabel = computed<string>(
    () => BLOCK_TYPE_LABELS[this.block().type] ?? this.block().type,
  );

  protected readonly bindingBadge = computed<string | null>(() => {
    const b = this.block().dataBinding;
    if (!b) return null;
    if (b.source === 'static') return `static: ${b.value ?? ''}`;
    if (b.field) return `${b.source}.${b.field}`;
    return b.source;
  });

  protected readonly bindingBadgeTooltip = computed<string>(() => {
    const b = this.block().dataBinding;
    if (!b) return '';
    const parts: string[] = [b.source];
    if (b.field) parts.push(b.field);
    if (b.format) parts.push(`format: ${b.format}`);
    return parts.join(' · ');
  });

  /**
   * Per-type rendering — for MVP we keep all types text-based (no image
   * upload, no table render). The shape is '{title} · {content}' so the
   * user can see the input even without visual fidelity.
   *
   * Also reused as the multi-column path's preamble (TZ-104.7 NIT #2).
   */
  protected readonly renderedContent = computed<string>(() => {
    const b = this.block();
    const parts: string[] = [];
    if (b.title) parts.push(b.title);
    if (b.content) parts.push(b.content);
    if (!parts.length) {
      // No content — show a placeholder appropriate to the type
      const placeholders: Record<BlockType, string> = {
        header: 'Заголовок без текста',
        text: 'Текстовый блок без содержимого',
        table: 'Таблица без шаблона',
        image: 'Изображение не выбрано',
        signature: 'Место для подписи',
        spacer: 'Разделитель',
      };
      return placeholders[b.type] ?? '—';
    }
    return parts.join(' · ');
  });

  protected onSelect(event: Event): void {
    event.stopPropagation();
    if (event instanceof MouseEvent && (event.ctrlKey || event.metaKey)) {
      this.multiSelect.emit(this.block());
    } else {
      this.select.emit(this.block());
    }
  }

  protected onCheckboxClick(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.multiSelect.emit(this.block());
  }

  protected onArrowKey(event: Event, direction: 'up' | 'down'): void {
    const keyEvent = event as KeyboardEvent;
    keyEvent.preventDefault();
    const allBlocks = (keyEvent.target as HTMLElement)
      ?.closest('.canvas-dropzone')
      ?.querySelectorAll<HTMLElement>('.block-renderer[role="button"]');
    if (!allBlocks || allBlocks.length === 0) return;
    const current = keyEvent.target as HTMLElement;
    const idx = Array.from(allBlocks).indexOf(current);
    const next = direction === 'down' ? allBlocks[idx + 1] : allBlocks[idx - 1];
    if (next) next.focus();
  }

  /** Format a table cell value based on column type. */
  protected formatTableCell(value: unknown, type: string): string {
    if (value == null || value === '') return '—';
    if (type === 'bool') return value ? 'Да' : 'Нет';
    if (type === 'number') {
      const n = Number(value);
      return Number.isFinite(n) ? new Intl.NumberFormat('ru-RU').format(n) : String(value);
    }
    if (type === 'currency') {
      const n = Number(value);
      return Number.isFinite(n)
        ? new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(n)
        : String(value);
    }
    if (type === 'date') {
      const d = new Date(String(value));
      return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString('ru-RU');
    }
    return String(value);
  }
}
