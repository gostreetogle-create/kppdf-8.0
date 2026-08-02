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

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { LucideAngularModule } from 'lucide-angular';
import {
  blockKey,
  type BlockLayout,
  type TemplateBlock,
} from '../../../shared/template-block/template-block.types';
import {
  clampLayoutDelta,
  normalizeBlockLayout,
} from '../../../shared/template-block/template-block-layout';
import type { Rect } from './snap-engine';
import { computeLayoutResize, type LayoutResizeHandle, RESIZE_CURSORS } from './snap-engine';
import {
  BlockRendererStateService,
  OVERLAY_DEFAULT_WIDTH,
  OVERLAY_DEFAULT_HEIGHT,
} from './block-renderer-state.service';

/**
 * TZ-235.B — BlockRenderer (thin host).
 *
 * Renders ONE TemplateBlock on the builder canvas. All signals, computed
 * values, snap math, and resize calculations live in BlockRendererStateService.
 * This component is responsible for:
 *   - Wiring parent inputs → service signals
 *   - DOM event listeners (mousedown/mousemove/mouseup for drag/resize)
 *   - DomSanitizer.bypassSecurityTrustHtml (requires injection context)
 *   - Output emissions back to parent
 *
 * Pattern: state = source of truth (service), template wires to state.
 * Follows TZ-235.A convention.
 */
@Component({
  selector: 'app-block-renderer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkDrag, LucideAngularModule],
  providers: [BlockRendererStateService],
  styleUrl: './block-renderer.component.css',
  template: `
    <!-- ═══ CANONICAL MODE: every new block has normalized page geometry ═══ -->
    @if (state.isPositioned()) {
      <div
        class="group block-renderer block-renderer--positioned"
        [class.is-selected]="selected()"
        [class.is-multi-selected]="multiSelected()"
        [class.is-inactive]="!block().isActive"
        [attr.data-block-type]="block().type"
        [attr.aria-selected]="selected() || multiSelected()"
        role="button"
        tabindex="0"
        [style.left.%]="state.layoutLeft()"
        [style.top.%]="state.layoutTop()"
        [style.width.%]="state.layoutWidth()"
        [style.height.%]="state.layoutHeight()"
        [style.z-index]="state.layoutZIndex()"
        [style.transform]="'rotate(' + state.layoutRotation() + 'deg)'"
        (click)="onSelect($event)"
        (mousedown)="!preview() && onPositionedDragStart($event)"
        (dblclick)="!preview() && onLayoutDblClick($event)"
        (keydown.enter)="onSelect($event)"
        (keydown.space)="onSelect($event)"
      >
        @if (selected() && !preview()) {
          <!-- TZ-259.4: canonical resize handles — edges + corners -->
          @for (h of RESIZE_HANDLES; track h) {
            <div
              class="block-renderer__resize block-renderer__resize--{{ h }}"
              [attr.data-handle]="h"
              (mousedown)="onLayoutResizeStart($event, h)"
              (click)="$event.stopPropagation()"
              [attr.title]="resizeHandleTitle(h)"
            ></div>
          }
        }
        @if (!preview()) {
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
        }
        @if (sizeEditOpen() && !preview()) {
          <!-- TZ-259.4: double-click size editor (px) -->
          <div
            class="block-renderer__size-editor"
            (mousedown)="$event.stopPropagation()"
            (click)="$event.stopPropagation()"
            (dblclick)="$event.stopPropagation()"
          >
            <span class="block-renderer__size-editor-title">Размер, px</span>
            <label class="block-renderer__size-editor-field">
              <span>Ш</span>
              <input
                type="number"
                min="20"
                [value]="sizeEditWidthPx()"
                (input)="onSizeEditInput($event, 'w')"
              />
            </label>
            <label class="block-renderer__size-editor-field">
              <span>В</span>
              <input
                type="number"
                min="20"
                [value]="sizeEditHeightPx()"
                (input)="onSizeEditInput($event, 'h')"
              />
            </label>
            <button
              type="button"
              class="block-renderer__size-editor-apply"
              (click)="applySizeEdit()"
            >
              Применить
            </button>
          </div>
        }
        <div class="block-renderer__body">
          @if (!preview()) {
            <div class="block-renderer__header">
              <span class="block-renderer__type">{{ state.typeLabel() }}</span>
              @if (state.bindingBadge()) {
                <span class="block-renderer__binding" [title]="state.bindingBadgeTooltip()">{{
                  state.bindingBadge()
                }}</span>
              }
            </div>
          }
          @if (block().type === 'image' && state.imageUrl()) {
            <div class="block-renderer__image-wrap">
              <img
                [src]="state.imageUrl()"
                [alt]="block().title || 'Изображение'"
                class="block-renderer__image"
                draggable="false"
                loading="lazy"
                [style.width]="'100%'"
                [style.height]="'100%'"
              />
            </div>
          } @else if (block().type === 'table' && state.tableColumns().length > 0) {
            <div class="block-renderer__table-wrap">
              <table class="block-renderer__table">
                <thead>
                  <tr>
                    @for (col of state.tableColumns(); track col.key) {
                      <th [style.text-align]="col.align">{{ col.label }}</th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (row of state.tableRows(); track $index) {
                    <tr>
                      @for (cell of row; track $index; let ci = $index) {
                        <td [style.text-align]="state.tableColumns()[ci]?.align ?? 'left'">
                          {{
                            state.formatTableCell(cell, state.tableColumns()[ci]?.type ?? 'text')
                          }}
                        </td>
                      }
                    </tr>
                  } @empty {
                    <tr>
                      <td
                        [attr.colspan]="state.tableColumns().length"
                        class="block-renderer__table-empty"
                      >
                        Нет данных
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else if (state.hasColumns()) {
            <div
              class="block-renderer__columns"
              [style.grid-template-columns]="state.columnsGridTemplate()"
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
            <div
              class="block-renderer__content"
              [innerHTML]="byPassHtml(state.renderedContent())"
            ></div>
          }
        </div>
      </div>
    } @else if (state.isOverlay()) {
      <div
        class="group block-renderer block-renderer--overlay"
        [class.is-selected]="selected()"
        [class.is-inactive]="!block().isActive"
        [attr.data-block-type]="block().type"
        [attr.aria-selected]="selected()"
        [attr.role]="'button'"
        [attr.tabindex]="'0'"
        [style.left.px]="state.dragActive() ? state.dragLeft() : state.overlayLeft()"
        [style.top.px]="state.dragActive() ? state.dragTop() : state.overlayTop()"
        [style.background-color]="state.blockBgColor() || null"
        (click)="onSelect($event)"
        (mousedown)="!preview() && onOverlayDragStart($event)"
        (keydown.enter)="onSelect($event)"
        (keydown.space)="onSelect($event)"
        (keydown.arrowUp)="onArrowKey($event, 'up')"
        (keydown.arrowDown)="onArrowKey($event, 'down')"
      >
        @if (!preview()) {
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
        }

        @if (block().type === 'image' && state.imageUrl()) {
          <!-- TZ-DOC-270: two-layer containment for overlay images. The
               OUTER wrap keeps overflow:visible so the corner-resize handle
               (right:-8px/bottom:-8px) stays clickable; the INNER clip
               container is overflow:hidden so the image is never painted
               outside the frame. -->
          <div class="block-renderer__image-wrap block-renderer__image-wrap--overlay">
            <div class="block-renderer__image-clip">
              <img
                [src]="state.imageUrl()"
                [alt]="block().title || 'Изображение'"
                class="block-renderer__image block-renderer__image--overlay"
                draggable="false"
                [style.width.px]="
                  state.resizeActive()
                    ? state.resizeWidth()
                    : (state.imageWidth() ?? OVERLAY_DEFAULT_WIDTH)
                "
                [style.height.px]="
                  state.resizeActive()
                    ? state.resizeHeight()
                    : (state.imageHeight() ?? OVERLAY_DEFAULT_HEIGHT)
                "
              />
            </div>
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
          <div class="block-renderer__body">
            <div class="block-renderer__header">
              <span class="block-renderer__type">{{ state.typeLabel() }}</span>
            </div>
            <div
              class="block-renderer__content"
              [innerHTML]="byPassHtml(state.renderedContent())"
            ></div>
          </div>
        }
      </div>
    } @else {
      <!-- ═══ FLOW MODE: with cdkDrag ═══ -->
      <div
        cdkDrag
        cdkDragLockAxis="y"
        [class.is-preview]="preview()"
        class="group block-renderer"
        [class.is-selected]="selected()"
        [class.is-multi-selected]="multiSelected()"
        [class.is-inactive]="!block().isActive"
        [attr.data-block-type]="block().type"
        [attr.aria-selected]="selected() || multiSelected()"
        [attr.role]="'button'"
        [attr.tabindex]="'0'"
        [style.width.%]="state.currentWidth()"
        [style.margin-left.%]="state.currentMarginLeft()"
        [style.background-color]="state.blockBgColor() || null"
        (click)="onSelect($event)"
        (keydown.enter)="onSelect($event)"
        (keydown.space)="onSelect($event)"
        (keydown.arrowUp)="onArrowKey($event, 'up')"
        (keydown.arrowDown)="onArrowKey($event, 'down')"
      >
        @if (selected() && !preview()) {
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
        @if (!preview()) {
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
        }
        @if (!preview()) {
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
        }
        <div class="block-renderer__body">
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
          @if (block().type === 'table' && state.tableColumns().length > 0) {
            <div class="block-renderer__table-wrap">
              <table class="block-renderer__table">
                <thead>
                  <tr>
                    @for (col of state.tableColumns(); track col.key) {
                      <th [style.text-align]="col.align" [style.width]="col.width + 'px'">
                        {{ col.label }}
                      </th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @if (state.tableRows().length > 0) {
                    @for (row of state.tableRows(); track $index) {
                      <tr>
                        @for (cell of row; track $index; let ci = $index) {
                          <td [style.text-align]="state.tableColumns()[ci]?.align ?? 'left'">
                            {{
                              state.formatTableCell(cell, state.tableColumns()[ci]?.type ?? 'text')
                            }}
                          </td>
                        }
                      </tr>
                    }
                  } @else {
                    <tr>
                      <td
                        [attr.colspan]="state.tableColumns().length"
                        class="block-renderer__table-empty"
                      >
                        Нет данных
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else if (block().type === 'image' && state.imageUrl()) {
            <div class="block-renderer__image-wrap">
              <img
                [src]="state.imageUrl()"
                [alt]="block().title || 'Изображение'"
                class="block-renderer__image"
                [style.width]="state.imageWidth() ? state.imageWidth() + 'px' : '100%'"
                [style.height]="state.imageHeight() ? state.imageHeight() + 'px' : 'auto'"
                loading="lazy"
              />
            </div>
          } @else if (block().type === 'spacer') {
            <div class="block-renderer__spacer" [style.height.px]="block().height ?? 40"></div>
          } @else if (state.hasColumns()) {
            @if (block().content) {
              <div class="block-renderer__content block-renderer__content--preamble">
                {{ state.renderedContent() }}
              </div>
            }
            <div
              class="block-renderer__columns"
              [style.grid-template-columns]="state.columnsGridTemplate()"
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
              <span class="block-renderer__type">{{ state.typeLabel() }}</span>
              @if (state.bindingBadge()) {
                <span class="block-renderer__binding" [title]="state.bindingBadgeTooltip()">{{
                  state.bindingBadge()
                }}</span>
              }
            </div>
            <div
              class="block-renderer__content"
              [innerHTML]="byPassHtml(state.renderedContent())"
            ></div>
          }
        </div>
      </div>
    }
  `,
})
export class BlockRendererComponent {
  // ── Parent inputs ──
  readonly block = input.required<TemplateBlock>();
  readonly selected = input<boolean>(false);
  readonly multiSelected = input<boolean>(false);
  readonly groupBlocks = input<TemplateBlock[]>([]);
  readonly layoutDragDelta = input<{ dx: number; dy: number } | null>(null);
  readonly layoutDragBlockIds = input<ReadonlySet<string>>(new Set());
  readonly snapEnabled = input<boolean>(true);
  readonly gridSize = input<number>(20);
  readonly boundaryPadding = input<number>(0);
  /** TZ-259.2: when true, render print-preview — no editor chrome, no drag. */
  readonly preview = input<boolean>(false);

  // ── Outputs ──
  readonly select = output<TemplateBlock>();
  readonly multiSelect = output<TemplateBlock>();
  readonly widthChange = output<{ width: number; marginLeft: number }>();
  readonly overlayMove = output<{
    block: TemplateBlock;
    overlayLeft: number;
    overlayTop: number;
  }>();
  readonly layoutChanges = output<Array<{ block: TemplateBlock; layout: BlockLayout }>>();
  readonly layoutDragPreview = output<{
    blockId: string;
    blockIds: ReadonlySet<string>;
    delta: { dx: number; dy: number } | null;
  }>();
  readonly overlayResize = output<{
    block: TemplateBlock;
    imageWidth: number;
    imageHeight: number;
  }>();
  readonly deleteRequest = output<string>();
  /**
   * Live drag rectangle for the overlay block (TZ-237.MAGNETIC-GRID-r0).
   * Emits `null` when no drag is active or when only a resize gesture
   * is in progress. Consumed by `BuilderCanvasComponent` to render
   * alignment guides against neighbouring overlay blocks. The parent
   * never reads this synchronously — Angular signal change detection
   * handles the propagation.
   */
  readonly dragRectChange = output<Rect | null>();

  // ── DI ──
  protected readonly state = inject(BlockRendererStateService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly host = inject(ElementRef);

  // Constants for template
  protected readonly OVERLAY_DEFAULT_WIDTH = OVERLAY_DEFAULT_WIDTH;
  protected readonly OVERLAY_DEFAULT_HEIGHT = OVERLAY_DEFAULT_HEIGHT;

  /** TZ-259.4: canonical resize handle directions (clockwise from NW). */
  protected readonly RESIZE_HANDLES: LayoutResizeHandle[] = [
    'nw',
    'n',
    'ne',
    'e',
    'se',
    's',
    'sw',
    'w',
  ];

  /** TZ-259.4: double-click size editor (px) — open flag + current values. */
  protected readonly sizeEditOpen = signal(false);
  protected readonly sizeEditWidthPx = signal(0);
  protected readonly sizeEditHeightPx = signal(0);

  constructor() {
    // Sync block input → service
    effect(() => this.state.block.set(this.block()));

    // TZ-259.4: close the double-click size editor when the block changes
    // (selection switched) so the popup never lingers on another block.
    effect(() => {
      const b = this.block();
      if (b) this.sizeEditOpen.set(false);
    });

    // Sync selection inputs → service
    effect(() => this.state.selected.set(this.selected()));
    effect(() => this.state.multiSelected.set(this.multiSelected()));
    effect(() => this.state.layoutDragDelta.set(this.layoutDragDelta()));
    effect(() => this.state.layoutDragBlockIds.set(this.layoutDragBlockIds()));

    // Sync snap config → service
    effect(() => this.state.snapEnabled.set(this.snapEnabled()));
    effect(() => this.state.gridSize.set(this.gridSize()));
    effect(() => this.state.boundaryPadding.set(this.boundaryPadding()));

    // TZ-237.MAGNETIC-GRID-r0: forward dragRect for alignment-guide math.
    effect(() => this.dragRectChange.emit(this.state.dragRect()));

    // Sync width & marginLeft from block settings when block changes
    effect(() => {
      const b = this.block();
      const s = b.settings as Record<string, unknown> | undefined;
      const w = typeof s?.['width'] === 'number' ? s['width'] : 100;
      const ml = typeof s?.['marginLeft'] === 'number' ? s['marginLeft'] : 0;
      this.state.currentWidth.set(Math.max(20, Math.min(100, w)));
      this.state.currentMarginLeft.set(Math.max(0, Math.min(80, ml)));
    });

    // Auto-clear local drag override when settings catch up
    effect(() => {
      if (this.state.dragLeft() > 0 && this.state.overlayLeft() === this.state.dragLeft()) {
        this.state.dragActive.set(false);
        this.state.dragLeft.set(0);
        this.state.dragTop.set(0);
      }
    });

    // Auto-clear local resize override when settings catch up
    effect(() => {
      const w = this.state.imageWidth();
      if (this.state.resizeWidth() > 0 && w === this.state.resizeWidth()) {
        this.state.resizeActive.set(false);
        this.state.resizeWidth.set(0);
        this.state.resizeHeight.set(0);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════
  //  Delegates to state service
  // ═══════════════════════════════════════════════════════════

  protected byPassHtml(content: string | undefined): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content ?? '');
  }

  // ── Click / keyboard handlers ──

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

  // ── Resize handlers (DOM wiring in component, math delegated to service) ──

  protected onResizeStart(event: MouseEvent, side: 'left' | 'right'): void {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startWidth = this.state.currentWidth();
    const startMarginLeft = this.state.currentMarginLeft();
    const paper = (event.target as HTMLElement)?.closest('.pi-canvas-page-paper') as HTMLElement;
    const containerWidth = paper?.clientWidth ?? 720;
    const handle = event.target as HTMLElement;
    handle.classList.add('is-dragging');

    const onMove = (e: MouseEvent): void => {
      const deltaPx = e.clientX - startX;
      const result = this.state.computeSideResize(
        deltaPx,
        side,
        containerWidth,
        startWidth,
        startMarginLeft,
      );
      this.state.currentMarginLeft.set(result.marginLeft);
      this.state.currentWidth.set(result.width);
    };

    const onUp = (): void => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      handle.classList.remove('is-dragging');
      this.widthChange.emit({
        width: this.state.currentWidth(),
        marginLeft: this.state.currentMarginLeft(),
      });
    };

    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  // ── Canonical normalized-layout drag handler ──

  protected onPositionedDragStart(event: MouseEvent): void {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest('.block-renderer__delete')) return;
    if (target.closest('.block-renderer__resize')) return;
    if (target.closest('.block-renderer__size-editor')) return;
    event.preventDefault();
    event.stopPropagation();

    const startLayout = this.block().layout;
    const paper = target.closest('.pi-canvas-page-paper') as HTMLElement | null;
    if (!startLayout || !paper) return;
    const selectedGroup = this.groupBlocks();
    const draggedKey = blockKey(this.block());
    const isGroupDrag =
      selectedGroup.length > 1 && selectedGroup.some((b) => blockKey(b) === draggedKey);
    const groupLayouts = (isGroupDrag ? selectedGroup : [this.block()])
      .filter((b) => b.layout)
      .map((b) => ({ block: b, layout: b.layout! }));
    const startX = event.clientX;
    const startY = event.clientY;
    this.state.positionedDragActive.set(true);
    this.state.positionedDragLeft.set(startLayout.x * 100);
    this.state.positionedDragTop.set(startLayout.y * 100);
    const hostEl = target.closest('.block-renderer--positioned') as HTMLElement | null;
    const cleanup = (): void => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('blur', onLeave);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    let clampedDx = 0;
    let clampedDy = 0;
    const onMove = (moveEvent: MouseEvent): void => {
      moveEvent.preventDefault();
      const rawDx = (moveEvent.clientX - startX) / Math.max(1, paper.clientWidth);
      const rawDy = (moveEvent.clientY - startY) / Math.max(1, paper.clientHeight);
      // TZ-259.5: single-block positioned drags get magnetic snap (grid +
      // neighbour edges); group drags keep the pure clamp path.
      let clamped: { dx: number; dy: number };
      if (!isGroupDrag && groupLayouts.length === 1) {
        clamped = this.state.computePositionedDrag(
          groupLayouts[0].layout,
          rawDx,
          rawDy,
          paper,
          hostEl,
        );
      } else {
        clamped = clampLayoutDelta(
          groupLayouts.map(({ layout }) => layout),
          rawDx,
          rawDy,
        );
      }
      clampedDx = clamped.dx;
      clampedDy = clamped.dy;
      this.state.layoutDragDelta.set({ dx: clampedDx, dy: clampedDy });
      this.layoutDragPreview.emit({
        blockId: this.block()._id ?? this.block().tempId ?? '',
        blockIds: new Set(groupLayouts.map(({ block }) => blockKey(block))),
        delta: { dx: clampedDx, dy: clampedDy },
      });
      // TZ-259.5: live paper-px rect for alignment guides.
      const live = {
        left: (startLayout.x + clampedDx) * paper.clientWidth,
        top: (startLayout.y + clampedDy) * paper.clientHeight,
        width: startLayout.width * paper.clientWidth,
        height: (startLayout.height ?? 0.06) * paper.clientHeight,
      };
      this.dragRectChange.emit({
        blockId: blockKey(this.block()),
        ...live,
      });
    };
    const onLeave = (): void => {
      cleanup();
      this.state.positionedDragActive.set(false);
      this.state.layoutDragDelta.set(null);
      this.dragRectChange.emit(null);
      this.layoutDragPreview.emit({
        blockId: this.block()._id ?? this.block().tempId ?? '',
        blockIds: new Set(),
        delta: null,
      });
    };
    const onUp = (): void => {
      cleanup();
      const updates = groupLayouts.map(({ block, layout }) => ({
        block,
        layout: normalizeBlockLayout({
          ...layout,
          x: layout.x + clampedDx,
          y: layout.y + clampedDy,
        }),
      }));
      this.state.positionedDragActive.set(false);
      this.state.layoutDragDelta.set(null);
      this.dragRectChange.emit(null);
      this.layoutDragPreview.emit({
        blockId: this.block()._id ?? this.block().tempId ?? '',
        blockIds: new Set(),
        delta: null,
      });
      this.layoutChanges.emit(updates);
    };
    document.body.style.cursor = 'move';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('mouseleave', onLeave);
    window.addEventListener('blur', onLeave);
  }

  // ── TZ-259.4: canonical layout resize handler ──

  protected onLayoutResizeStart(event: MouseEvent, handle: LayoutResizeHandle): void {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    event.preventDefault();
    event.stopPropagation();
    const startLayout = this.block().layout;
    const paper = target.closest('.pi-canvas-page-paper') as HTMLElement | null;
    if (!startLayout || !paper) return;
    const startX = event.clientX;
    const startY = event.clientY;
    this.state.layoutResize.set(startLayout);
    const cleanup = (): void => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseleave', onLeave);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    const onMove = (moveEvent: MouseEvent): void => {
      if (moveEvent.buttons === 0) {
        cleanup();
        return;
      }
      moveEvent.preventDefault();
      const next = computeLayoutResize(
        startLayout,
        handle,
        { dx: moveEvent.clientX - startX, dy: moveEvent.clientY - startY },
        paper.clientWidth,
        paper.clientHeight,
      );
      this.state.layoutResize.set(next);
    };
    const onLeave = (): void => {
      cleanup();
      this.state.layoutResize.set(null);
    };
    const onUp = (): void => {
      cleanup();
      const final = this.state.layoutResize();
      this.state.layoutResize.set(null);
      if (final) {
        this.layoutChanges.emit([{ block: this.block(), layout: final }]);
      }
    };
    const cursor = RESIZE_CURSORS[handle] ?? 'nwse-resize';
    document.body.style.cursor = cursor;
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('mouseleave', onLeave);
  }

  // ── TZ-259.4: double-click size editor ──

  protected onLayoutDblClick(event: MouseEvent): void {
    const layout = this.block().layout;
    const paper = (event.target as HTMLElement).closest(
      '.pi-canvas-page-paper',
    ) as HTMLElement | null;
    if (!layout || !paper) return;
    this.sizeEditWidthPx.set(Math.round(layout.width * paper.clientWidth));
    this.sizeEditHeightPx.set(Math.round((layout.height ?? 0.06) * paper.clientHeight));
    this.sizeEditOpen.set(true);
  }

  protected onSizeEditInput(event: Event, axis: 'w' | 'h'): void {
    const value = Number((event.target as HTMLInputElement).value) || 0;
    if (axis === 'w') this.sizeEditWidthPx.set(Math.max(20, value));
    else this.sizeEditHeightPx.set(Math.max(20, value));
  }

  protected applySizeEdit(): void {
    const layout = this.block().layout;
    const paper = (this.host.nativeElement as HTMLElement).closest(
      '.pi-canvas-page-paper',
    ) as HTMLElement | null;
    if (!layout || !paper) return;
    const next = normalizeBlockLayout({
      ...layout,
      width: Math.min(1, this.sizeEditWidthPx() / Math.max(1, paper.clientWidth)),
      height: Math.min(1, this.sizeEditHeightPx() / Math.max(1, paper.clientHeight)),
    });
    this.sizeEditOpen.set(false);
    this.layoutChanges.emit([{ block: this.block(), layout: next }]);
  }

  protected resizeHandleTitle(handle: LayoutResizeHandle): string {
    const titles: Record<LayoutResizeHandle, string> = {
      n: 'Тяните для изменения высоты',
      s: 'Тяните для изменения высоты',
      e: 'Тяните для изменения ширины',
      w: 'Тяните для изменения ширины',
      ne: 'Тяните для изменения размера',
      nw: 'Тяните для изменения размера',
      se: 'Тяните для изменения размера',
      sw: 'Тяните для изменения размера',
    };
    return titles[handle];
  }

  // ── Overlay drag handler ──

  protected onOverlayDragStart(event: MouseEvent): void {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (
      target.closest('.block-renderer__delete') ||
      target.closest('.block-renderer__corner-resize')
    )
      return;

    event.preventDefault();
    event.stopPropagation();

    const startMouseX = event.clientX;
    const startMouseY = event.clientY;
    const startLeft = this.state.dragActive() ? this.state.dragLeft() : this.state.overlayLeft();
    const startTop = this.state.dragActive() ? this.state.dragTop() : this.state.overlayTop();

    this.state.dragActive.set(true);
    this.state.dragLeft.set(startLeft);
    this.state.dragTop.set(startTop);

    const hostEl = target.closest('.block-renderer--overlay') as HTMLElement | null;
    const paper = document.querySelector('.pi-canvas-page-paper') as HTMLElement | null;

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

      const pos = this.state.computeOverlayDrag(
        e,
        startMouseX,
        startMouseY,
        startLeft,
        startTop,
        paper,
        hostEl,
      );

      this.state.dragLeft.set(pos.left);
      this.state.dragTop.set(pos.top);

      if (hostEl) {
        hostEl.style.left = `${pos.left}px`;
        hostEl.style.top = `${pos.top}px`;
        const snapping = pos.snapAxisX !== null || pos.snapAxisY !== null;
        hostEl.classList.toggle('is-snapping', snapping);
        hostEl.dataset['snapAxisX'] = pos.snapAxisX ?? '';
        hostEl.dataset['snapAxisY'] = pos.snapAxisY ?? '';
      }
    };

    const onUp = (): void => {
      cleanup();
      this.overlayMove.emit({
        block: this.block(),
        overlayLeft: this.state.dragLeft(),
        overlayTop: this.state.dragTop(),
      });
    };

    const onLeave = (): void => {
      cleanup();
      this.state.dragActive.set(false);
      this.state.dragLeft.set(0);
      this.state.dragTop.set(0);
    };

    document.body.style.cursor = 'move';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('mouseleave', onLeave);
  }

  // ── Corner resize handler ──

  protected onCornerResizeStart(event: MouseEvent): void {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();

    const img = (event.target as HTMLElement)
      .closest('.block-renderer__image-wrap--overlay')
      ?.querySelector('img') as HTMLImageElement | null;
    const naturalW = img?.naturalWidth ?? this.state.imageWidth() ?? 200;
    const naturalH = img?.naturalHeight ?? this.state.imageHeight() ?? 200;

    const startMouseX = event.clientX;
    const startMouseY = event.clientY;
    const startWidth = this.state.resizeActive()
      ? this.state.resizeWidth()
      : (this.state.imageWidth() ?? 200);

    this.state.resizeActive.set(true);
    this.state.resizeWidth.set(startWidth);
    this.state.resizeHeight.set(this.state.imageHeight() ?? 200);

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
      const size = this.state.computeCornerResize(
        e,
        startMouseX,
        startMouseY,
        startWidth,
        naturalW,
        naturalH,
      );
      this.state.resizeWidth.set(size.width);
      this.state.resizeHeight.set(size.height);
    };

    const onUp = (): void => {
      cleanup();
      const finalW = this.state.resizeWidth();
      const finalH = this.state.resizeHeight();
      if (finalW > 0 && finalH > 0) {
        this.overlayResize.emit({ block: this.block(), imageWidth: finalW, imageHeight: finalH });
      }
    };

    const onLeave = (): void => {
      cleanup();
      this.state.resizeActive.set(false);
      this.state.resizeWidth.set(0);
      this.state.resizeHeight.set(0);
    };

    document.body.style.cursor = 'nwse-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('mouseleave', onLeave);
  }
}
