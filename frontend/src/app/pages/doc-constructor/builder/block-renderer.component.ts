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

import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { LucideAngularModule } from 'lucide-angular';
import type { TemplateBlock } from '../../../shared/template-block/template-block.types';
import { BlockRendererStateService } from './block-renderer-state.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * TZ-86 Phase D.1 — TZ-235.B — BlockRenderer (leaf, presentational).
 *
 * Renders ONE TemplateBlock on the builder canvas. Wraps the content in
 * a cdkDrag so the parent BuilderCanvas (cdkDropList) can reorder it.
 *
 * TZ-235.B: the imperative drag/resize/snap logic moved into
 * `BlockRendererStateService` (per-instance, `providers:`-scoped). This
 * component now only owns the template (HTML/CSS) + 4 simple output-emitting
 * handlers + byPassHtml + formatTableCell + a thin "mirror inputs to
 * service" effect. Lines: was 1484 → now ~870.
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
 * Precedence rule (TZ-104.7 NIT #2): when BOTH content and columns[] are
 * present, render content ABOVE the columns grid as a preamble. If only
 * content is present, render the existing renderedContent() plain-text
 * fallback. If only columns[] is present, render the grid alone.
 */
@Component({
  selector: 'app-block-renderer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkDrag, LucideAngularModule],
  // Per-instance state service (TZ-235.B): each block-renderer owns its own
  // drag/resize/snap state — no cross-block interference on canvas.
  providers: [BlockRendererStateService],
  template: `
    <!-- ═══ POSITIONED MODE: document-space geometry ═══ -->
    @if (isPositioned()) {
      <div
        class="group block-renderer block-renderer--positioned"
        [class.is-selected]="selected()"
        [class.is-multi-selected]="multiSelected()"
        [class.is-inactive]="!block().isActive"
        [attr.data-block-type]="block().type"
        [attr.aria-selected]="selected() || multiSelected()"
        [attr.role]="'button'"
        [attr.tabindex]="'0'"
        [style.left.px]="renderedLeft()"
        [style.top.px]="renderedTop()"
        [style.width.px]="renderedWidth()"
        [style.height.px]="renderedHeight()"
        [style.background-color]="blockBgColor() || null"
        (click)="onSelect($event)"
        (mousedown)="onPositionedDragStart($event)"
        (keydown.enter)="onSelect($event)"
        (keydown.space)="onSelect($event)"
        (keydown.arrowUp)="onArrowKey($event, 'up')"
        (keydown.arrowDown)="onArrowKey($event, 'down')"
      >
        @if (selected()) {
          <div
            class="block-renderer__positioned-resize"
            (mousedown)="onPositionedResizeStart($event)"
            (click)="$event.stopPropagation()"
            title="Изменить размер блока"
            aria-label="Изменить размер блока"
          ></div>
        }
        <div
          class="block-renderer__delete"
          (click)="onDeleteClick($event)"
          (keydown.enter)="onDeleteClick($event)"
          (mousedown)="$event.stopPropagation()"
          title="Удалить блок"
          role="button"
          tabindex="-1"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="3 6 5 6 21 6" />
            <path
              d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
            />
          </svg>
        </div>
        <div class="block-renderer__body">
          <div class="block-renderer__header">
            <span class="block-renderer__type">{{ typeLabel() }}</span>
            @if (bindingBadge()) {
              <span class="block-renderer__binding" [title]="bindingBadgeTooltip()">{{
                bindingBadge()
              }}</span>
            }
          </div>
          <div class="block-renderer__content" [innerHTML]="byPassHtml(renderedContent())"></div>
        </div>
      </div>
    } @else if (isOverlay()) {
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
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="3 6 5 6 21 6" />
            <path
              d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
            />
          </svg>
        </div>

        @if (block().type === 'image' && imageUrl()) {
          <div class="block-renderer__image-wrap block-renderer__image-wrap--overlay">
            <img
              [src]="imageUrl()"
              [alt]="block().title || 'Изображение'"
              class="block-renderer__image block-renderer__image--overlay"
              draggable="false"
              [style.width.px]="
                resizeActive() ? resizeWidth() : (imageWidth() ?? overlayDefaultWidth)
              "
              [style.height.px]="
                resizeActive() ? resizeHeight() : (imageHeight() ?? overlayDefaultHeight)
              "
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
                  <path
                    d="M12 0v12H0"
                    stroke="currentColor"
                    stroke-width="2"
                    fill="var(--color-paper)"
                  />
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
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="3 6 5 6 21 6" />
            <path
              d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
            />
          </svg>
        </div>
        <div class="block-renderer__body">
          <!-- Drag handle -->
          <div class="block-renderer__drag-handle" title="Перетащите для перемещения">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="8" cy="6" r="2" />
              <circle cx="16" cy="6" r="2" />
              <circle cx="8" cy="12" r="2" />
              <circle cx="16" cy="12" r="2" />
              <circle cx="8" cy="18" r="2" />
              <circle cx="16" cy="18" r="2" />
            </svg>
          </div>
          @if (block().type === 'table' && tableColumns().length > 0) {
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
                      <td
                        [attr.colspan]="tableColumns().length"
                        class="block-renderer__table-empty"
                      >
                        Нет данных
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else if (block().type === 'image' && imageUrl()) {
            <div class="block-renderer__image-wrap">
              <img
                [src]="imageUrl()"
                [alt]="block().title || 'Изображение'"
                class="block-renderer__image"
                [style.width]="imageWidth() ? imageWidth() + 'px' : '100%'"
                [style.height]="imageHeight() ? imageHeight() + 'px' : 'auto'"
                loading="lazy"
              />
            </div>
          } @else if (block().type === 'spacer') {
            <div class="block-renderer__spacer" [style.height.px]="block().height ?? 40"></div>
          } @else if (hasColumns()) {
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
                <div
                  class="block-renderer__column"
                  [style.font-size.px]="col.fontSize ?? 14"
                  [innerHTML]="byPassHtml(col.content)"
                ></div>
              }
            </div>
          } @else {
            <div class="block-renderer__header">
              <span class="block-renderer__type">{{ typeLabel() }}</span>
              @if (bindingBadge()) {
                <span class="block-renderer__binding" [title]="bindingBadgeTooltip()">{{
                  bindingBadge()
                }}</span>
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
        box-shadow:
          0 0 0 1px var(--color-gold),
          0 2px 8px -2px rgba(0, 0, 0, 0.1);
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
        transition:
          opacity 150ms ease,
          color 150ms ease;
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
        transition:
          opacity 150ms ease,
          color 150ms ease;
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

      /* ═══ Positioned mode — document-space free positioning ═══ */
      .block-renderer--positioned {
        position: absolute;
        z-index: 10;
        padding: 10px 12px;
        overflow: hidden;
        cursor: move;
        user-select: none;
        touch-action: none;
        box-sizing: border-box;
        transition: none;
      }

      .block-renderer--positioned.is-selected {
        outline: 2px solid var(--color-gold);
        outline-offset: 1px;
      }

      .block-renderer__positioned-resize {
        position: absolute;
        right: -1px;
        bottom: -1px;
        width: 14px;
        height: 14px;
        z-index: 15;
        cursor: nwse-resize;
        border-right: 3px solid var(--color-gold);
        border-bottom: 3px solid var(--color-gold);
        opacity: 0.9;
      }

      /* ═══ Overlay mode — legacy image free absolute positioning ═══ */
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
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
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
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
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
  // ─────────────────────────────────────────────────────────────────
  // Inputs (unchanged from pre-TZ-235.B)
  // ─────────────────────────────────────────────────────────────────
  readonly block = input.required<TemplateBlock>();
  readonly selected = input<boolean>(false);
  readonly multiSelected = input<boolean>(false);
  readonly snapEnabled = input<boolean>(true);
  readonly gridSize = input<number>(20);
  readonly boundaryPadding = input<number>(0);
  readonly pageSize = input<'A3' | 'A4' | 'A5' | 'Letter'>('A4');
  readonly orientation = input<'portrait' | 'landscape'>('portrait');

  // ─────────────────────────────────────────────────────────────────
  // Outputs (unchanged shape, but emitted via Subject subscriptions)
  // ─────────────────────────────────────────────────────────────────
  readonly select = output<TemplateBlock>();
  readonly multiSelect = output<TemplateBlock>();
  readonly widthChange = output<{ width: number; marginLeft: number }>();
  readonly overlayMove = output<{
    block: TemplateBlock;
    overlayLeft: number;
    overlayTop: number;
  }>();
  readonly overlayResize = output<{
    block: TemplateBlock;
    imageWidth: number;
    imageHeight: number;
  }>();
  readonly positionedGeometryChange = output<{
    block: TemplateBlock;
    geometry: import('./builder-geometry').PositionedGeometry;
  }>();
  readonly deleteRequest = output<string>();

  // ─────────────────────────────────────────────────────────────────
  // State service (per-instance providers-scoped)
  // ─────────────────────────────────────────────────────────────────
  protected readonly state = inject(BlockRendererStateService);

  /** DOM sanitizer lives in component (trust-model banner applies here). */
  private readonly sanitizer = inject(DomSanitizer);

  // ─────────────────────────────────────────────────────────────────
  // Service signal aliases — keeps template syntax unchanged:
  // template still uses `currentWidth()`, `dragActive()`, `isOverlay()`, etc.
  // (TZ-235.B zero-churn — no template diff required.)
  // ─────────────────────────────────────────────────────────────────
  protected readonly currentWidth = this.state.currentWidth;
  protected readonly currentMarginLeft = this.state.currentMarginLeft;
  protected readonly dragActive = this.state.dragActive;
  protected readonly dragLeft = this.state.dragLeft;
  protected readonly dragTop = this.state.dragTop;
  protected readonly resizeActive = this.state.resizeActive;
  protected readonly resizeWidth = this.state.resizeWidth;
  protected readonly resizeHeight = this.state.resizeHeight;
  protected readonly overlayDefaultWidth = this.state.overlayDefaultWidth;
  protected readonly overlayDefaultHeight = this.state.overlayDefaultHeight;
  protected readonly hasColumns = this.state.hasColumns;
  protected readonly imageUrl = this.state.imageUrl;
  protected readonly imageWidth = this.state.imageWidth;
  protected readonly imageHeight = this.state.imageHeight;
  protected readonly isOverlay = this.state.isOverlay;
  protected readonly isPositioned = this.state.isPositioned;
  protected readonly renderedLeft = this.state.renderedLeft;
  protected readonly renderedTop = this.state.renderedTop;
  protected readonly renderedWidth = this.state.renderedWidth;
  protected readonly renderedHeight = this.state.renderedHeight;
  protected readonly overlayLeft = this.state.overlayLeft;
  protected readonly overlayTop = this.state.overlayTop;
  protected readonly blockBgColor = this.state.blockBgColor;
  protected readonly tableColumns = this.state.tableColumns;
  protected readonly tableRows = this.state.tableRows;
  protected readonly columnsGridTemplate = this.state.columnsGridTemplate;
  protected readonly typeLabel = this.state.typeLabel;
  protected readonly bindingBadge = this.state.bindingBadge;
  protected readonly bindingBadgeTooltip = this.state.bindingBadgeTooltip;
  protected readonly renderedContent = this.state.renderedContent;

  constructor() {
    // ── Mirror inputs to service ──
    effect(() => this.state.setBlock(this.block()));
    effect(() =>
      this.state.setSnapSettings(this.snapEnabled(), this.gridSize(), this.boundaryPadding()),
    );
    effect(() => this.state.setPageSettings(this.pageSize(), this.orientation()));

    // ── Subscribe to service output streams, re-emit as Angular outputs ──
    // takeUntilDestroyed() — must be in constructor so Injector context is component.
    this.state.widthChange$.pipe(takeUntilDestroyed()).subscribe((e) => this.widthChange.emit(e));
    this.state.overlayMove$.pipe(takeUntilDestroyed()).subscribe((e) => this.overlayMove.emit(e));
    this.state.overlayResize$
      .pipe(takeUntilDestroyed())
      .subscribe((e) => this.overlayResize.emit(e));
    this.state.positionedGeometryChange$
      .pipe(takeUntilDestroyed())
      .subscribe((e) => this.positionedGeometryChange.emit(e));
  }

  // ─────────────────────────────────────────────────────────────────
  // DELEGATED MUTATING HANDLERS — pure forward to service
  // ─────────────────────────────────────────────────────────────────
  protected onResizeStart(event: MouseEvent, side: 'left' | 'right'): void {
    this.state.onResizeStart(event, side);
  }

  protected onOverlayDragStart(event: MouseEvent): void {
    this.state.onOverlayDragStart(event);
  }

  protected onCornerResizeStart(event: MouseEvent): void {
    this.state.onCornerResizeStart(event);
  }

  protected onPositionedDragStart(event: MouseEvent): void {
    this.state.onPositionedDragStart(event);
  }

  protected onPositionedResizeStart(event: MouseEvent): void {
    this.state.onPositionedResizeStart(event);
  }

  // ─────────────────────────────────────────────────────────────────
  // PURE HANDLERS — stay in component (emit outputs directly, no state)
  // ─────────────────────────────────────────────────────────────────

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
    const isOverlay = currentEl.closest('.block-renderer--overlay');
    const container = isOverlay
      ? currentEl.closest('.canvas-overlay-layer')
      : currentEl.closest('.canvas-dropzone');
    const allBlocks = container?.querySelectorAll<HTMLElement>(
      '.block-renderer[role="button"], .block-renderer--overlay[role="button"]',
    );
    if (!allBlocks || allBlocks.length === 0) return;
    const idx = Array.from(allBlocks).indexOf(currentEl);
    const next = direction === 'down' ? allBlocks[idx + 1] : allBlocks[idx - 1];
    if (next) next.focus();
  }

  // ─────────────────────────────────────────────────────────────────
  // FORMATTERS — stay in component
  // ─────────────────────────────────────────────────────────────────

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
