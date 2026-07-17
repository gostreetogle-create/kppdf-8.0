/*!
 * ⚠ innerHTML trust-model notice
 *
 * This file uses DomSanitizer.bypassSecurityTrustHtml() on text-block column
 * content (see byPassHtml() below). This bypasses Angular's default DOM
 * sanitizer, which would otherwise strip inline style attributes needed for
 * TipTap-formatted content (bold/italic/color/highlight) to display with
 * visual fidelity.
 *
 * The bypass is safe ONLY because of the following trust boundaries:
 *   1. TipTap editor validation — TipTap uses ProseMirror's schema system;
 *      unknown HTML nodes (e.g. <script>, <iframe>, <object>) and
 *      dangerous attributes (e.g. onclick, onerror) are rejected at the
 *      editor layer.
 *   2. RBAC — TextBlock / TemplateBlock CRUD endpoints are admin/manager
 *      only (TZ-91 Phase A1+A4 whitelist).
 *   3. Future: server-side DOMPurify pass — NOT YET IMPLEMENTED.
 *      Bulk-import paths (ImportJobsModule) and dev fixtures can write
 *      columns WITHOUT going through TipTap, leaving server-side sanitization
 *      as a TODO defense-in-depth layer (see TZ-105.3 followup backlog).
 *
 * Before adding a new [innerHTML] usage anywhere on this file, update the
 * trust model above AND confirm server-side sanitization is wired.
 * Conventional short reference: trust-model see file header banner.
 */

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { LucideAngularModule } from 'lucide-angular';
import { PiCanvasBlockHandleComponent } from '../../../shared/ui/canvas/pi-canvas-block-handle.component';
import {
  BLOCK_TYPE_LABELS,
  type BlockType,
  type TemplateBlock,
} from '../../../shared/template-block/template-block.types';
import type { TextBlockColumn } from '../../../shared/services/pi-text-blocks.service';

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
  imports: [CdkDrag, LucideAngularModule, PiCanvasBlockHandleComponent],
  template: `
    <div
      cdkDrag
      cdkDragLockAxis="y"
      class="group block-renderer"
      [class.is-selected]="selected()"
      [class.is-inactive]="!block().isActive"
      [attr.data-block-type]="block().type"
      [attr.aria-selected]="selected()"
      [attr.role]="'button'"
      [attr.tabindex]="'0'"
      (click)="onSelect($event)"
      (keydown.enter)="onSelect($event)"
      (keydown.space)="onSelect($event)"
    >
      <pi-canvas-block-handle />
      <div class="block-renderer__body">
        @if (!hasColumns()) {
          <div class="block-renderer__header">
            <span class="block-renderer__type">{{ typeLabel() }}</span>
            @if (bindingBadge()) {
              <span class="block-renderer__binding" [title]="bindingBadgeTooltip()">
                {{ bindingBadge() }}
              </span>
            }
          </div>
        }
        @if (hasColumns()) {
          <!-- TZ-104.7 NIT #2: if 'content' is also present, render it ABOVE
               the columns grid as a plain-text preamble so user prose isn't
               silently dropped during single-HTML → multi-column migration. -->
          @if (block().content) {
            <div class="block-renderer__content block-renderer__content--preamble">
              {{ renderedContent() }}
            </div>
          }
          <div class="block-renderer__columns" [style.grid-template-columns]="columnsGridTemplate()">
            @for (col of block().columns; track col.id) {
              <!-- trust-model: see file header banner for innerHTML bypass rationale -->
              <div class="block-renderer__column" [innerHTML]="byPassHtml(col.content)"></div>
            }
          </div>
        } @else {
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
        transition: background 120ms ease, border-color 120ms ease;
      }

      .block-renderer:hover {
        background: color-mix(in oklch, var(--color-sunrise-soft) 50%, transparent);
      }

      .block-renderer.is-selected {
        border-color: var(--color-ink);
        border-width: 2px;
        padding: 9px 11px;
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
        background: color-mix(in oklch, var(--color-sunrise-warm) 20%, transparent);
        color: var(--color-sunrise-warm);
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
    `,
  ],
})
export class BlockRendererComponent {
  /** The block to render. */
  readonly block = input.required<TemplateBlock>();
  /** Whether this block is the currently-selected one (drives outline). */
  readonly selected = input<boolean>(false);
  /** Emitted when the user clicks/keys to select this block. */
  readonly select = output<TemplateBlock>();

  /**
   * DOM sanitizer injected to bypass Angular's default innerHTML stripping.
   * See the file-header banner for the trust-model rationale.
   */
  private readonly sanitizer = inject(DomSanitizer);

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
    this.select.emit(this.block());
  }
}
