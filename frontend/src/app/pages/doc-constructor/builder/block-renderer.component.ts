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
import { CdkDrag } from '@angular/cdk/drag-drop';
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
  imports: [CdkDrag, LucideAngularModule],
  template: `
    <!-- ═══ OVERLAY MODE: no cdkDrag, free absolute positioning ═══ -->
    @if (isOverlay()) {
      <div
        class="group block-renderer block-renderer--overlay"
        [class.is-selected]="selected()"
        [class.is-inactive]="!block().isActive"
        [attr.data-block-type]="block().type"
        [attr.aria-selected]="selected()"
        [attr.role]="'button'"
        [attr.tabindex]="'0'"
        [style.left.px]="dragActive() ? dragLeft() : overlayLeft()"
        [style.top.px]="dragActive() ? dragTop() : overlayTop()"
        [style.background-color]="blockBgColor() || null"
        (click)="onSelect($event)"
        (mousedown)="onOverlayDragStart($event)"
        (keydown.enter)="onSelect($event)"
        (keydown.space)="onSelect($event)"
        (keydown.arrowUp)="onArrowKey($event, 'up')"
        (keydown.arrowDown)="onArrowKey($event, 'down')"
      >
        <!-- Delete button -->
        <div
          class="block-renderer__delete"
          (click)="onDeleteClick($event)"
          (keydown.enter)="onDeleteClick($event)"
          (mousedown)="$event.stopPropagation()"
          title="Удалить блок"
          role="button"
          tabindex="-1"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </div>

        @if (block().type === 'image' && imageUrl()) {
          <div class="block-renderer__image-wrap block-renderer__image-wrap--overlay">
            <img
              [src]="imageUrl()"
              [alt]="block().title || 'Изображение'"
              class="block-renderer__image block-renderer__image--overlay"
              draggable="false"
              [style.width.px]="resizeActive() ? resizeWidth() : (imageWidth() ?? overlayDefaultWidth)"
              [style.height.px]="resizeActive() ? resizeHeight() : (imageHeight() ?? overlayDefaultHeight)"
            />
            <!-- Corner resize handle (proportional) -->
            @if (selected()) {
              <div
                class="block-renderer__corner-resize"
                (mousedown)="onCornerResizeStart($event)"
                (click)="$event.stopPropagation()"
                title="Перетащите для пропорционального изменения размера"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M12 0v12H0" stroke="currentColor" stroke-width="2" fill="var(--color-paper)"/>
                </svg>
              </div>
            }
          </div>
        } @else {
          <!-- Non-image overlay block fallback -->
          <div class="block-renderer__body">
            <div class="block-renderer__header">
              <span class="block-renderer__type">{{ typeLabel() }}</span>
            </div>
            <div class="block-renderer__content" [innerHTML]="byPassHtml(renderedContent())"></div>
          </div>
        }
      </div>
    } @else {
      <!-- ═══ FLOW MODE: with cdkDrag ═══ -->
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
        [style.background-color]="blockBgColor() || null"
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
        <!-- Multi-select checkbox -->
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
              <rect x="3" y="3" width="18" height="18" rx="2" fill="var(--color-gold)" stroke="var(--color-gold)" />
              <polyline points="9 12 11 14 15 10" stroke="white" stroke-width="2.5" />
            } @else {
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" />
            }
          </svg>
        </div>
        <!-- Delete button -->
        <div
          class="block-renderer__delete"
          (click)="onDeleteClick($event)"
          (keydown.enter)="onDeleteClick($event)"
          (mousedown)="$event.stopPropagation()"
          title="Удалить блок"
          role="button"
          tabindex="-1"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </div>
        <div class="block-renderer__body">
          <!-- Drag handle -->
          <div class="block-renderer__drag-handle" title="Перетащите для перемещения">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="8" cy="6" r="2"/><circle cx="16" cy="6" r="2"/>
              <circle cx="8" cy="12" r="2"/><circle cx="16" cy="12" r="2"/>
              <circle cx="8" cy="18" r="2"/><circle cx="16" cy="18" r="2"/>
            </svg>
          </div>
          @if (block().type === 'table' && tableColumns().length > 0) {
            <div class="block-renderer__table-wrap">
              <table class="block-renderer__table">
                <thead>
                  <tr>
                    @for (col of tableColumns(); track col.key) {
                      <th [style.text-align]="col.align" [style.width]="col.width + 'px'">{{ col.label }}</th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @if (tableRows().length > 0) {
                    @for (row of tableRows(); track $index) {
                      <tr>
                        @for (cell of row; track $index; let ci = $index) {
                          <td [style.text-align]="tableColumns()[ci]?.align ?? 'left'">{{ formatTableCell(cell, tableColumns()[ci]?.type ?? 'text') }}</td>
                        }
                      </tr>
                    }
                  } @else {
                    <tr>
                      <td [attr.colspan]="tableColumns().length" class="block-renderer__table-empty">Нет данных</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else if (block().type === 'image' && imageUrl()) {
            <div class="block-renderer__image-wrap">
              <img [src]="imageUrl()" [alt]="block().title || 'Изображение'" class="block-renderer__image"
                [style.width]="imageWidth() ? imageWidth() + 'px' : '100%'"
                [style.height]="imageHeight() ? imageHeight() + 'px' : 'auto'" loading="lazy" />
            </div>
          } @else if (block().type === 'spacer') {
            <div class="block-renderer__spacer" [style.height.px]="block().height ?? 40"></div>
          } @else if (hasColumns()) {
            @if (block().content) {
              <div class="block-renderer__content block-renderer__content--preamble">{{ renderedContent() }}</div>
            }
            <div class="block-renderer__columns" [style.grid-template-columns]="columnsGridTemplate()">
              @for (col of block().columns; track col.id) {
                <div class="block-renderer__column" [style.font-size.px]="col.fontSize ?? 14" [innerHTML]="byPassHtml(col.content)"></div>
              }
            </div>
          } @else {
            <div class="block-renderer__header">
              <span class="block-renderer__type">{{ typeLabel() }}</span>
              @if (bindingBadge()) {
                <span class="block-renderer__binding" [title]="bindingBadgeTooltip()">{{ bindingBadge() }}</span>
              }
            </div>
            <div class="block-renderer__content" [innerHTML]="byPassHtml(renderedContent())"></div>
          }
        </div>
      </div>
    }
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
        background: transparent;
        border: 1px solid var(--color-rule);
        border-radius: 2px;
        cursor: pointer;
        transition:
          background 120ms ease,
          border-color 120ms ease,
          box-shadow 120ms ease;
      }

      /* TZ-211: Hover — subtle highlight */
      .block-renderer:hover {
        background: rgba(128, 128, 128, 0.05);
      }

      /* TZ-211: Selected — gold border + shadow */
      .block-renderer.is-selected {
        border-color: var(--color-gold);
        background: rgba(255, 255, 255, 0.5);
        box-shadow: 0 0 0 1px var(--color-gold), 0 2px 8px -2px rgba(0, 0, 0, 0.1);
      }

      /* TZ-211: Multi-selected — gold-soft background */
      .block-renderer.is-multi-selected {
        border-color: var(--color-gold);
        background: rgba(255, 255, 255, 0.7);
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

      /* ═══ Delete Button — TZ-211 ═══ */
      .block-renderer__delete {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 150ms ease, color 150ms ease;
        cursor: pointer;
        z-index: 5;
        color: var(--color-muted);
      }

      .block-renderer:hover .block-renderer__delete {
        opacity: 0.5;
      }

      .block-renderer:hover .block-renderer__delete:hover {
        opacity: 1;
        color: var(--color-destructive);
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

      /* ═══ Image block (flow mode) ═══ */
      .block-renderer__image-wrap {
        position: relative;
        display: inline-block;
        max-width: 100%;
        line-height: 0;
      }

      .block-renderer__image {
        display: block;
        max-width: 100%;
        height: auto;
        border-radius: 2px;
        object-fit: contain;
      }

      /* ═══ Overlay mode — free absolute positioning ═══ */
      .block-renderer--overlay {
        position: absolute;
        z-index: 10;
        cursor: move;
        padding: 0;
        background: transparent;
        border: none;
        border-radius: 0;
        transition: none;
        user-select: none;
        touch-action: none;
      }

      .block-renderer--overlay:hover,
      .block-renderer--overlay.is-selected {
        background: transparent;
        border: none;
        box-shadow: none;
      }

      /* Selection ring for overlay blocks — thin gold outline around image */
      .block-renderer--overlay.is-selected .block-renderer__image-wrap--overlay {
        outline: 2px solid var(--color-gold);
        outline-offset: 2px;
        border-radius: 2px;
      }

      .block-renderer__image-wrap--overlay {
        position: relative;
        display: inline-block;
        line-height: 0;
      }

      .block-renderer__image--overlay {
        display: block;
        border: none;
        border-radius: 0;
        object-fit: contain;
      }

      /* Delete button for overlay — always visible on hover/selected */
      .block-renderer--overlay .block-renderer__delete {
        top: -10px;
        right: -10px;
        width: 22px;
        height: 22px;
        background: var(--color-paper);
        border: 1px solid var(--color-rule);
        border-radius: 50%;
        box-shadow: 0 1px 4px rgba(0,0,0,0.12);
        opacity: 0;
        transition: opacity 150ms ease;
      }

      .block-renderer--overlay:hover .block-renderer__delete,
      .block-renderer--overlay.is-selected .block-renderer__delete {
        opacity: 0.8;
      }

      .block-renderer--overlay .block-renderer__delete:hover {
        opacity: 1;
        color: var(--color-destructive);
      }

      /* ═══ Corner resize handle for overlay images ═══ */
      .block-renderer__corner-resize {
        position: absolute;
        right: -8px;
        bottom: -8px;
        width: 16px;
        height: 16px;
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;
        cursor: nwse-resize;
        z-index: 15;
        color: var(--color-gold);
        opacity: 0;
        transition: opacity 150ms ease;
      }

      .block-renderer--overlay.is-selected .block-renderer__corner-resize,
      .block-renderer--overlay:hover .block-renderer__corner-resize {
        opacity: 1;
      }

      .block-renderer__corner-resize:hover {
        color: var(--color-gold);
        opacity: 1;
      }

      .block-renderer__corner-resize svg {
        filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
      }

      /* ═══ Snap indicator — when overlay block snaps to grid or block edge ═══ */
      .block-renderer--overlay.is-snapping .block-renderer__image-wrap--overlay {
        outline-color: #4fc3f7;
        outline-width: 2px;
        outline-style: solid;
        outline-offset: 2px;
      }

      /* Subtle snap guide glow */
      .block-renderer--overlay.is-snapping {
        filter: drop-shadow(0 0 6px rgba(79, 195, 247, 0.35));
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
  /** Whether snap-to-grid is enabled for overlay blocks. */
  readonly snapEnabled = input<boolean>(true);
  /** Grid size in pixels for snapping. */
  readonly gridSize = input<number>(20);
  /** Padding from the paper edges that overlay blocks cannot cross (px). */
  readonly boundaryPadding = input<number>(0);
  /** Emitted when overlay block is dragged to a new position. */
  readonly overlayMove = output<{ block: TemplateBlock; overlayLeft: number; overlayTop: number }>();
  /** Emitted when overlay image is resized proportionally via corner handle. */
  readonly overlayResize = output<{ block: TemplateBlock; imageWidth: number; imageHeight: number }>();
  /** TZ-211: Emitted when user clicks delete button on block. */
  readonly deleteRequest = output<string>();

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

    // Auto-clear local drag override when settings catch up (after API debounce + response)
    effect(() => {
      const ol = this.overlayLeft();
      const dl = this.dragLeft();
      if (dl > 0 && ol === dl) {
        this.dragActive.set(false);
        this.dragLeft.set(0);
        this.dragTop.set(0);
      }
    });

    // Auto-clear local resize override when settings catch up (after API debounce + response)
    effect(() => {
      const w = this.imageWidth();
      const d = this.resizeWidth();
      // When settings signal (imageWidth) catches up to the displayed value (resizeWidth),
      // clear the local override. No visual flash since w === d at this point.
      if (d > 0 && w === d) {
        this.resizeActive.set(false);
        this.resizeWidth.set(0);
        this.resizeHeight.set(0);
      }
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
   * Start dragging an overlay block — captures start mouse position and block position.
   * On mousemove: updates overlayLeft/overlayTop relative to the paper container.
   * On mouseup: emits overlayMove with final position.
   */
  protected onOverlayDragStart(event: MouseEvent): void {
    // Only left mouse button, only on image blocks, only if not clicking delete/resize handles
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest('.block-renderer__delete') || target.closest('.block-renderer__corner-resize')) return;

    event.preventDefault();
    event.stopPropagation();

    const startMouseX = event.clientX;
    const startMouseY = event.clientY;
    // Use override value if previous drag's settings haven't arrived yet,
    // otherwise fall back to the stored settings value.
    const startLeft = this.dragActive() ? this.dragLeft() : this.overlayLeft();
    const startTop = this.dragActive() ? this.dragTop() : this.overlayTop();

    // Activate local signal override — prevents Angular CD from overwriting position via [style.left.px]
    this.dragActive.set(true);
    this.dragLeft.set(startLeft);
    this.dragTop.set(startTop);

    // Cache DOM refs at drag start — avoid querySelector on every mousemove
    const hostEl = (event.target as HTMLElement).closest('.block-renderer--overlay') as HTMLElement | null;
    const paper = document.querySelector('.pi-canvas-page-paper') as HTMLElement | null;
    const img = hostEl?.querySelector('.block-renderer__image--overlay') as HTMLImageElement | null;
    const cachedBlockW = img?.offsetWidth ?? this.imageWidth() ?? this.overlayDefaultWidth;
    const cachedBlockH = img?.offsetHeight ?? this.imageHeight() ?? this.overlayDefaultHeight;

    const cleanup = (): void => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseleave', onLeave);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    const onMove = (e: MouseEvent): void => {
      // Check if mouse button is still held (escape hatch for browser-out-of-focus)
      if (e.buttons === 0) {
        cleanup();
        return;
      }
      e.preventDefault();
      const deltaX = e.clientX - startMouseX;
      const deltaY = e.clientY - startMouseY;
      let newLeft = startLeft + deltaX;
      let newTop = startTop + deltaY;

      // Clamp to paper boundaries (using cached paper ref + cached block dimensions)
      if (paper) {
        const pad = this.boundaryPadding();
        const maxLeft = Math.max(0, paper.clientWidth - cachedBlockW - pad);
        const maxTop = Math.max(0, paper.scrollHeight - cachedBlockH - pad);
        newLeft = Math.max(pad, Math.min(maxLeft, newLeft));
        newTop = Math.max(pad, Math.min(maxTop, newTop));
      } else {
        newLeft = Math.max(0, newLeft);
        newTop = Math.max(0, newTop);
      }

      // Apply snapping if enabled
      if (this.snapEnabled()) {
        // Snap to grid
        const gridResult = this.applySnapToGrid(newLeft, newTop, this.gridSize());
        let hadSnap = gridResult.snappedLeft !== newLeft || gridResult.snappedTop !== newTop;
        newLeft = gridResult.snappedLeft;
        newTop = gridResult.snappedTop;

        // Snap to other blocks' edges (using cached paper ref)
        const blockSnap = this.snapToBlockEdges(newLeft, newTop, hostEl, paper);
        if (blockSnap.snappedLeft !== newLeft || blockSnap.snappedTop !== newTop) {
          hadSnap = true;
          this.snapAxisX = blockSnap.axisX;
          this.snapAxisY = blockSnap.axisY;
          newLeft = blockSnap.snappedLeft;
          newTop = blockSnap.snappedTop;
        }

        if (!hadSnap) {
          this.snapAxisX = null;
          this.snapAxisY = null;
        }
      } else {
        this.snapAxisX = null;
        this.snapAxisY = null;
      }

      // Update local signals so Angular CD doesn't overwrite with stale stored position
      this.dragLeft.set(newLeft);
      this.dragTop.set(newTop);
      // Set inline style for INSTANT visual feedback (before CD picks up the signal)
      if (hostEl) {
        hostEl.style.left = `${newLeft}px`;
        hostEl.style.top = `${newTop}px`;
        hostEl.classList.toggle('is-snapping', this.snapAxisX !== null || this.snapAxisY !== null);
        hostEl.dataset['snapAxisX'] = this.snapAxisX ?? '';
        hostEl.dataset['snapAxisY'] = this.snapAxisY ?? '';
      }
    };

    const onUp = (): void => {
      cleanup();
      // Read final values from signals (they're the source of truth)
      const finalLeft = this.dragLeft();
      const finalTop = this.dragTop();
      // Keep local override active — no visual flash while waiting for debounced API
      // Effect will auto-clear when overlayLeft()/overlayTop() catch up.

      this.overlayMove.emit({
        block: this.block(),
        overlayLeft: finalLeft,
        overlayTop: finalTop,
      });
    };

    // Escape hatch: if mouse leaves the document body, clean up
    const onLeave = (): void => {
      cleanup();
      // onLeave → user hasn't committed — restore old position from settings
      this.dragActive.set(false);
      this.dragLeft.set(0);
      this.dragTop.set(0);
    };

    document.body.style.cursor = 'move';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('mouseleave', onLeave);
  }

  /** Local signals for overlay drag — override Angular's style binding during drag. */
  protected readonly dragActive = signal(false);
  protected readonly dragLeft = signal(0);
  protected readonly dragTop = signal(0);

  /** Local signals for corner resize — override Angular's style binding during drag. */
  protected readonly resizeActive = signal(false);
  protected readonly resizeWidth = signal(0);
  protected readonly resizeHeight = signal(0);

  /** Current snap state during drag — tracks which axes are snapped. */
  private snapAxisX: string | null = null;
  private snapAxisY: string | null = null;

  /** Snap threshold in pixels. */
  private readonly SNAP_THRESHOLD = 8;

  /** Default image width when overlay is toggled on without explicit dimensions (prevents showing at natural resolution). */
  protected readonly overlayDefaultWidth = 300;
  /** Default image height calculated from a 3:2 ratio fallback. */
  protected readonly overlayDefaultHeight = 200;

  /**
   * Corner resize start — captures start mouse position and original image dimensions.
   * On mousemove: calculates new size maintaining aspect ratio.
   * On mouseup: emits overlayResize with final dimensions.
   */
  protected onCornerResizeStart(event: MouseEvent): void {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();

    // Get the actual natural dimensions of the image for aspect ratio
    const img = (event.target as HTMLElement).closest('.block-renderer__image-wrap--overlay')?.querySelector('img') as HTMLImageElement | null;
    const naturalW = img?.naturalWidth ?? this.imageWidth() ?? 200;
    const naturalH = img?.naturalHeight ?? this.imageHeight() ?? 200;
    const aspectRatio = naturalW / naturalH;

    const startMouseX = event.clientX;
    const startMouseY = event.clientY;
    // Use override value if previous resize's settings haven't arrived yet
    const startWidth = this.resizeActive() ? this.resizeWidth() : (this.imageWidth() ?? 200);
    const startHeight = this.resizeActive() ? this.resizeHeight() : (this.imageHeight() ?? 200);

    // Activate local signal override — Angular will render the correct size via signals, not DOM
    this.resizeActive.set(true);
    this.resizeWidth.set(startWidth);
    this.resizeHeight.set(startHeight);

    const cleanup = (): void => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseleave', onLeave);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    const onMove = (e: MouseEvent): void => {
      if (e.buttons === 0) {
        cleanup();
        return;
      }
      e.preventDefault();
      const deltaX = e.clientX - startMouseX;
      const deltaY = e.clientY - startMouseY;
      // Smooth proportional delta using diagonal distance
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const sign = deltaX + deltaY >= 0 ? 1 : -1;
      const smoothDelta = sign * distance;

      let newWidth = Math.round(Math.max(50, startWidth + smoothDelta));
      let newHeight = Math.round(newWidth / aspectRatio);

      if (newHeight < 20) {
        newHeight = 20;
        newWidth = Math.round(newHeight * aspectRatio);
      }

      // Update local signals — Angular CD picks up the change and applies via style binding
      this.resizeWidth.set(newWidth);
      this.resizeHeight.set(newHeight);
    };

    const onUp = (): void => {
      cleanup();
      // Read final values from signals BEFORE clearing (they're the source of truth)
      const finalW = this.resizeWidth();
      const finalH = this.resizeHeight();
      // Keep local override active at final size to prevent visual flash
      // (settings update comes after 1500ms debounce — photo would snap back to old size)
      // Effect in constructor will auto-clear when settings catch up.

      if (finalW > 0 && finalH > 0) {
        this.overlayResize.emit({
          block: this.block(),
          imageWidth: finalW,
          imageHeight: finalH,
        });
      }
    };

    const onLeave = (): void => {
      cleanup();
      // onLeave → user hasn't committed — restore old size from settings
      this.resizeActive.set(false);
      this.resizeWidth.set(0);
      this.resizeHeight.set(0);
    };

    document.body.style.cursor = 'nwse-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('mouseleave', onLeave);
  }



  /**
   * Snap a value to the nearest grid point.
   * Returns the snapped value and whether it was snapped.
   */
  private snapValueToGrid(value: number, gridSize: number): { snapped: number; isSnapped: boolean } {
    const nearest = Math.round(value / gridSize) * gridSize;
    if (Math.abs(value - nearest) <= this.SNAP_THRESHOLD) {
      return { snapped: nearest, isSnapped: true };
    }
    return { snapped: value, isSnapped: false };
  }

  /**
   * Apply grid snapping to both X and Y coordinates.
   */
  private applySnapToGrid(
    left: number, top: number, gridSize: number,
  ): { snappedLeft: number; snappedTop: number } {
    const snapX = this.snapValueToGrid(left, gridSize);
    const snapY = this.snapValueToGrid(top, gridSize);
    return { snappedLeft: snapX.snapped, snappedTop: snapY.snapped };
  }

  /**
   * Snap to edges of other blocks (both flow and overlay) on the canvas.
   * Returns the snapped position and which axes were snapped.
   */
  private snapToBlockEdges(
    left: number, top: number, hostEl: HTMLElement | null, paper: HTMLElement | null,
  ): { snappedLeft: number; snappedTop: number; axisX: string | null; axisY: string | null } {
    if (!paper) return { snappedLeft: left, snappedTop: top, axisX: null, axisY: null };
    const img = hostEl?.querySelector('.block-renderer__image--overlay') as HTMLImageElement | null;
    const width = img?.offsetWidth ?? this.imageWidth() ?? this.overlayDefaultWidth;
    const height = img?.offsetHeight ?? this.imageHeight() ?? this.overlayDefaultHeight;

    const paperRect = paper.getBoundingClientRect();
    const allBlocks = Array.from(
      paper.querySelectorAll<HTMLElement>(
        ':scope > .canvas-dropzone .block-renderer[role="button"], :scope > .canvas-overlay-layer .block-renderer--overlay',
      ),
    );

    // Exclude the currently dragged block
    const otherBlocks = allBlocks.filter((el) => el !== hostEl);

    let snappedLeft = left;
    let snappedTop = top;
    let axisX: string | null = null;
    let axisY: string | null = null;

    const right = left + width;
    const bottom = top + height;
    const threshold = this.SNAP_THRESHOLD;

    for (const block of otherBlocks) {
      const rect = block.getBoundingClientRect();
      const bLeft = rect.left - paperRect.left;
      const bRight = bLeft + rect.width;
      const bTop = rect.top - paperRect.top;
      const bBottom = bTop + rect.height;

      // Snap left edge
      if (Math.abs(left - bLeft) <= threshold) {
        snappedLeft = bLeft;
        axisX = 'left';
      } else if (Math.abs(left - bRight) <= threshold) {
        snappedLeft = bRight;
        axisX = 'left';
      }
      // Snap right edge
      if (Math.abs(right - bLeft) <= threshold) {
        snappedLeft = bLeft - width;
        axisX = 'right';
      } else if (Math.abs(right - bRight) <= threshold) {
        snappedLeft = bRight - width;
        axisX = 'right';
      }

      // Snap top edge
      if (Math.abs(top - bTop) <= threshold) {
        snappedTop = bTop;
        axisY = 'top';
      } else if (Math.abs(top - bBottom) <= threshold) {
        snappedTop = bBottom;
        axisY = 'top';
      }
      // Snap bottom edge
      if (Math.abs(bottom - bTop) <= threshold) {
        snappedTop = bTop - height;
        axisY = 'bottom';
      } else if (Math.abs(bottom - bBottom) <= threshold) {
        snappedTop = bBottom - height;
        axisY = 'bottom';
      }
    }

    return { snappedLeft, snappedTop, axisX, axisY };
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

  /** Image URL from block.settings.imageUrl. */
  protected readonly imageUrl = computed<string | null>(() => {
    const b = this.block();
    if (b.type !== 'image') return null;
    const settings = b.settings as Record<string, unknown> | undefined;
    return (settings?.['imageUrl'] as string) ?? null;
  });

  /** Image width in pixels from block.settings.imageWidth. */
  protected readonly imageWidth = computed<number | null>(() => {
    const b = this.block();
    const settings = b.settings as Record<string, unknown> | undefined;
    return (settings?.['imageWidth'] as number) ?? null;
  });

  /** Image height in pixels from block.settings.imageHeight. */
  protected readonly imageHeight = computed<number | null>(() => {
    const b = this.block();
    const settings = b.settings as Record<string, unknown> | undefined;
    return (settings?.['imageHeight'] as number) ?? null;
  });

  /** Whether image overlays other blocks (absolute positioning). */
  protected readonly isOverlay = computed<boolean>(() => {
    const b = this.block();
    if (b.type !== 'image') return false;
    const settings = b.settings as Record<string, unknown> | undefined;
    return (settings?.['overlay'] as boolean) ?? false;
  });

  /** Overlay X position in pixels. */
  protected readonly overlayLeft = computed<number>(() => {
    const b = this.block();
    const settings = b.settings as Record<string, unknown> | undefined;
    return (settings?.['overlayLeft'] as number) ?? 0;
  });

  /** Overlay Y position in pixels. */
  protected readonly overlayTop = computed<number>(() => {
    const b = this.block();
    const settings = b.settings as Record<string, unknown> | undefined;
    return (settings?.['overlayTop'] as number) ?? 0;
  });

  /**
   * Computed background-color CSS value.
   * Combines blockBackgroundColor (hex) with blockOpacity (alpha) into rgba().
   * Returns empty string when no color is set → block stays transparent.
   */
  protected readonly blockBgColor = computed<string>(() => {
    const b = this.block();
    const settings = b.settings as Record<string, unknown> | undefined;
    const color = settings?.['blockBackgroundColor'];
    const opacity = typeof settings?.['blockOpacity'] === 'number' ? settings['blockOpacity'] : 0;

    if (typeof color !== 'string' || color.length === 0) {
      return '';
    }

    // Parse hex (#RGB, #RRGGBB) to {r, g, b}
    const hex = color.replace('#', '');
    let r = 0, g = 0, b2 = 0;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b2 = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b2 = parseInt(hex.substring(4, 6), 16);
    }
    return `rgba(${r}, ${g}, ${b2}, ${opacity})`;
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
    const total = cols.reduce((sum, c) => sum + (c.width ?? 1), 0);
    return cols.map((c) => `${((c.width ?? 1) / total) * 100}fr`).join(' ');
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

  /** TZ-211: Delete button click handler. */
  protected onDeleteClick(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    const id = this.block()._id;
    if (id) this.deleteRequest.emit(id);
  }

  protected onArrowKey(event: Event, direction: 'up' | 'down'): void {
    const keyEvent = event as KeyboardEvent;
    keyEvent.preventDefault();
    const currentEl = keyEvent.target as HTMLElement;
    // Check if overlay block — overlay blocks are in the overlay layer, not in cdkDropList
    const isOverlay = currentEl.closest('.block-renderer--overlay');
    const container = isOverlay
      ? currentEl.closest('.canvas-overlay-layer')
      : currentEl.closest('.canvas-dropzone');
    const allBlocks = container?.querySelectorAll<HTMLElement>('.block-renderer[role="button"], .block-renderer--overlay[role="button"]');
    if (!allBlocks || allBlocks.length === 0) return;
    const idx = Array.from(allBlocks).indexOf(currentEl);
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
