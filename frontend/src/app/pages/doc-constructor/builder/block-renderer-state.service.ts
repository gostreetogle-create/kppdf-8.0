import { Injectable, computed, signal } from '@angular/core';
import { blockKey } from '../../../shared/template-block/template-block.types';
import type { Rect } from './snap-engine';
import type { BlockLayout } from '../../../shared/template-block/template-block-layout';

import {
  BLOCK_TYPE_LABELS,
  type BlockType,
  type TemplateBlock,
} from '../../../shared/template-block/template-block.types';
import type { TableColumn } from '../../../shared/services/pi-table-templates.service';

/** Default image dimensions for overlay without explicit size. */
export const OVERLAY_DEFAULT_WIDTH = 300;
export const OVERLAY_DEFAULT_HEIGHT = 200;

/**
 * TZ-235.B — BlockRendererStateService.
 *
 * Pure state + calculation service for a single TemplateBlock's rendering
 * state. Holds signals for current block, selection, snap config, and
 * local drag/resize UI state. Exposes computed values and pure math
 * functions for snap-to-grid, snap-to-block, drag position, and resize.
 *
 * Provided at COMPONENT level — each <app-block-renderer> gets its own
 * instance. No HttpClient, no DomSanitizer — pure signals + math.
 */
@Injectable()
export class BlockRendererStateService {
  // ── Block input (set from component via effect) ──
  readonly block = signal<TemplateBlock>(null!);

  // ── Selection state ──
  readonly selected = signal<boolean>(false);
  readonly multiSelected = signal<boolean>(false);

  // ── Snap config (from parent inputs) ──
  readonly snapEnabled = signal<boolean>(true);
  readonly gridSize = signal<number>(20);
  readonly boundaryPadding = signal<number>(0);

  // ── Local drag override (visual-only, cleared when API response arrives) ──
  readonly dragActive = signal(false);
  readonly dragLeft = signal(0);
  readonly dragTop = signal(0);

  // ── Local resize override (visual-only, cleared when API response arrives) ──
  readonly resizeActive = signal(false);
  readonly resizeWidth = signal(0);
  readonly resizeHeight = signal(0);

  // ── Current width/margin from block settings ──
  readonly currentWidth = signal<number>(100);
  readonly currentMarginLeft = signal<number>(0);

  /** Snap threshold in pixels. */
  readonly SNAP_THRESHOLD = 8;

  // ═══════════════════════════════════════════════════════════
  //  Computed signals — image
  // ═══════════════════════════════════════════════════════════

  readonly imageUrl = computed<string | null>(() => {
    const b = this.block();
    if (b.type !== 'image') return null;
    const s = b.settings as Record<string, unknown> | undefined;
    const url = (s?.['imageUrl'] as string) ?? null;
    // TZ-DOC-333 soft-guard: legacy blocks may still carry a session-local
    // `blob:` URL persisted before the upload endpoint existed. Render it as
    // «no image» instead of a broken <img> — the block resolves to a real
    // /uploads/... URL once the photo is (re)uploaded via the inspector.
    if (url && (url.startsWith('blob:') || url.startsWith('data:'))) return null;
    return url;
  });

  readonly imageWidth = computed<number | null>(() => {
    const s = this.block().settings as Record<string, unknown> | undefined;
    return (s?.['imageWidth'] as number) ?? null;
  });

  readonly imageHeight = computed<number | null>(() => {
    const s = this.block().settings as Record<string, unknown> | undefined;
    return (s?.['imageHeight'] as number) ?? null;
  });

  readonly isOverlay = computed<boolean>(() => {
    const b = this.block();
    if (b.type !== 'image') return false;
    const s = b.settings as Record<string, unknown> | undefined;
    return (s?.['overlay'] as boolean) ?? false;
  });

  readonly overlayLeft = computed<number>(() => {
    const s = this.block().settings as Record<string, unknown> | undefined;
    return (s?.['overlayLeft'] as number) ?? 0;
  });

  readonly overlayTop = computed<number>(() => {
    const s = this.block().settings as Record<string, unknown> | undefined;
    return (s?.['overlayTop'] as number) ?? 0;
  });

  /** Canonical normalized geometry is the preferred free-positioning mode. */
  readonly isPositioned = computed<boolean>(() => this.block().layout !== undefined);
  readonly positionedDragActive = signal(false);
  readonly positionedDragLeft = signal(0);
  readonly positionedDragTop = signal(0);
  readonly layoutDragDelta = signal<{ dx: number; dy: number } | null>(null);
  readonly layoutDragBlockIds = signal<ReadonlySet<string>>(new Set());

  // TZ-259.4: live resize preview for canonical (layout) blocks. While a
  // resize gesture is active this holds the proposed normalized layout;
  // the layoutLeft/Top/Width/Height computeds below prefer it over the
  // committed block layout so the browser paints the preview instantly.
  readonly layoutResize = signal<BlockLayout | null>(null);

  readonly layoutLeft = computed<number>(() => {
    const resize = this.layoutResize();
    if (resize) return resize.x * 100;
    const layout = this.block().layout;
    const delta = this.layoutDragDelta();
    const isPreviewTarget = this.layoutDragBlockIds().has(blockKey(this.block()));
    if (delta && layout && isPreviewTarget) return (layout.x + delta.dx) * 100;
    return this.positionedDragActive() ? this.positionedDragLeft() : (layout?.x ?? 0) * 100;
  });
  readonly layoutTop = computed<number>(() => {
    const resize = this.layoutResize();
    if (resize) return resize.y * 100;
    const layout = this.block().layout;
    const delta = this.layoutDragDelta();
    const isPreviewTarget = this.layoutDragBlockIds().has(blockKey(this.block()));
    if (delta && layout && isPreviewTarget) return (layout.y + delta.dy) * 100;
    return this.positionedDragActive() ? this.positionedDragTop() : (layout?.y ?? 0) * 100;
  });
  readonly layoutWidth = computed<number>(() => {
    const resize = this.layoutResize();
    if (resize) return resize.width * 100;
    return (this.block().layout?.width ?? 1) * 100;
  });
  readonly layoutHeight = computed<number | null>(() => {
    const resize = this.layoutResize();
    if (resize) return resize.height === undefined ? null : resize.height * 100;
    const height = this.block().layout?.height;
    return height === undefined ? null : height * 100;
  });
  readonly layoutRotation = computed<number>(() => this.block().layout?.rotation ?? 0);
  readonly layoutZIndex = computed<number>(() => this.block().layout?.zIndex ?? 1);

  // ═══════════════════════════════════════════════════════════
  //  Computed signals — background color
  // ═══════════════════════════════════════════════════════════

  readonly blockBgColor = computed<string>(() => {
    const s = this.block().settings as Record<string, unknown> | undefined;
    return blockBackgroundCss(s?.['blockBackgroundColor'], s?.['blockOpacity']);
  });

  // ═══════════════════════════════════════════════════════════
  //  Computed signals — table
  // ═══════════════════════════════════════════════════════════

  readonly tableColumns = computed<TableColumn[]>(() => {
    const b = this.block();
    if (b.type !== 'table') return [];
    const s = b.settings as Record<string, unknown> | undefined;
    return (s?.['tableTemplateColumns'] as TableColumn[]) ?? [];
  });

  readonly tableRows = computed<unknown[][]>(() => {
    const b = this.block();
    if (b.type !== 'table') return [];
    const s = b.settings as Record<string, unknown> | undefined;
    return (s?.['tableTemplateSampleRows'] as unknown[][]) ?? [];
  });

  // ═══════════════════════════════════════════════════════════
  //  Computed signals — multi-column
  // ═══════════════════════════════════════════════════════════

  readonly hasColumns = computed<boolean>(() => {
    const cols = this.block().columns;
    return !!cols && cols.length > 0;
  });

  readonly columnsGridTemplate = computed<string>(() => {
    const cols = this.block().columns;
    if (!cols || cols.length === 0) return '1fr';
    const total = cols.reduce((sum, c) => sum + (c.width ?? 1), 0);
    return cols.map((c) => `${((c.width ?? 1) / total) * 100}fr`).join(' ');
  });

  // ═══════════════════════════════════════════════════════════
  //  Computed signals — labels & content
  // ═══════════════════════════════════════════════════════════

  readonly typeLabel = computed<string>(
    () => BLOCK_TYPE_LABELS[this.block().type] ?? this.block().type,
  );

  readonly bindingBadge = computed<string | null>(() => {
    const b = this.block().dataBinding;
    if (!b) return null;
    if (b.source === 'static') return `static: ${b.value ?? ''}`;
    if (b.field) return `${String(b.source)}.${b.field}`;
    return String(b.source);
  });

  readonly bindingBadgeTooltip = computed<string>(() => {
    const b = this.block().dataBinding;
    if (!b) return '';
    const parts: string[] = [String(b.source)];
    if (b.field) parts.push(b.field);
    if (b.format) parts.push(`format: ${b.format}`);
    return parts.join(' · ');
  });

  readonly renderedContent = computed<string>(() => {
    const b = this.block();
    // Canvas shows document body only. `title` is catalog metadata (e.g. text-block
    // name) — never paint it into the template frame.
    if (b.content?.trim()) return b.content;
    if (b.type !== 'text' && b.title?.trim()) return b.title;
    const placeholders: Record<BlockType, string> = {
      header: 'Заголовок без текста',
      text: 'Текстовый блок без содержимого',
      table: 'Таблица без шаблона',
      image: 'Изображение не выбрано',
      signature: 'Место для подписи',
      spacer: '',
    };
    return placeholders[b.type] ?? '—';
  }); // ═══════════════════════════════════════════════════════════
  //  Drag geometry (TZ-237.MAGNETIC-GRID-r0)
  // ═══════════════════════════════════════════════════════════
  /**
   * Live rectangle of the overlay block during drag. Returns `null`
   * when no drag is active, when only a resize is in progress, or
   * when the block has no positive image dimensions.
   *
   * Reads: `dragActive`, `dragLeft`, `dragTop`, and the existing
   * fully-typed `imageWidth()` / `imageHeight()` computeds — we
   * deliberately do NOT re-introspect the indexed `settings` record
   * to keep type narrowing clean. Returns `null` while a resize
   * (not a drag) is in progress so consumers don't confuse the two
   * gestures — the alignment-guide engine is drag-only for this
   * vertical slice.
   */
  readonly dragRect = computed<Rect | null>(() => {
    if (!this.dragActive()) return null;
    if (this.resizeActive()) return null;
    const w = this.imageWidth();
    const h = this.imageHeight();
    if (w == null || h == null) return null;
    if (!(w > 0) || !(h > 0)) return null;
    return {
      // blockKey is the project's stable block identity (uses _id,
      // tempId, or an order-based index). The R1 contract is to
      // NEVER reach for `block.id` directly — it does not exist.
      blockId: blockKey(this.block()),
      left: this.dragLeft(),
      top: this.dragTop(),
      width: w,
      height: h,
    };
  });

  // ═══════════════════════════════════════════════════════════
  //  Cell formatting (pure function)
  // ═══════════════════════════════════════════════════════════

  formatTableCell(value: unknown, type: string): string {
    if (value == null || value === '') return '—';
    if (type === 'bool') return value ? 'Да' : 'Нет';
    if (type === 'number') {
      const n = Number(value);
      return Number.isFinite(n) ? new Intl.NumberFormat('ru-RU').format(n) : '—';
    }
    if (type === 'currency') {
      const n = Number(value);
      return Number.isFinite(n)
        ? new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(n)
        : '—';
    }
    if (type === 'date') {
      const d = new Date(String(value));
      return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('ru-RU');
    }
    const text = String(value);
    if (/^(null|undefined|NaN)$/i.test(text)) return '—';
    return text;
  }

  // ═══════════════════════════════════════════════════════════
  //  Snap helpers (pure functions)
  // ═══════════════════════════════════════════════════════════

  snapValueToGrid(value: number, gs: number): { snapped: number; isSnapped: boolean } {
    const nearest = Math.round(value / gs) * gs;
    if (Math.abs(value - nearest) <= this.SNAP_THRESHOLD) {
      return { snapped: nearest, isSnapped: true };
    }
    return { snapped: value, isSnapped: false };
  }

  applySnapToGrid(
    left: number,
    top: number,
    gs: number,
  ): { snappedLeft: number; snappedTop: number } {
    const snapX = this.snapValueToGrid(left, gs);
    const snapY = this.snapValueToGrid(top, gs);
    return { snappedLeft: snapX.snapped, snappedTop: snapY.snapped };
  }

  /**
   * Snap position to edges of other blocks on the canvas.
   * Returns snapped position + which axes were snapped.
   */
  snapToBlockEdges(
    left: number,
    top: number,
    hostEl: HTMLElement | null,
    paper: HTMLElement | null,
  ): { snappedLeft: number; snappedTop: number; axisX: string | null; axisY: string | null } {
    if (!paper) return { snappedLeft: left, snappedTop: top, axisX: null, axisY: null };
    const img = hostEl?.querySelector('.block-renderer__image--overlay') as HTMLImageElement | null;
    // TZ-259.5: for positioned (non-image) blocks there is no overlay img,
    // so fall back to the host element's real rendered size — otherwise snap
    // math would use the 300×200 image default for every positioned block.
    const width =
      img?.offsetWidth ?? hostEl?.offsetWidth ?? this.imageWidth() ?? OVERLAY_DEFAULT_WIDTH;
    const height =
      img?.offsetHeight ?? hostEl?.offsetHeight ?? this.imageHeight() ?? OVERLAY_DEFAULT_HEIGHT;

    const paperRect = paper.getBoundingClientRect();
    // TZ-259.5: include canonical positioned blocks (`.canvas-layout-layer`)
    // alongside flow blocks and overlay images so magnetic snap works
    // between positioned blocks (tables ↔ text) too.
    const allBlocks = Array.from(
      paper.querySelectorAll<HTMLElement>(
        ':scope > .canvas-dropzone .block-renderer[role="button"], :scope > .canvas-overlay-layer .block-renderer--overlay, :scope > .canvas-layout-layer .block-renderer[role="button"]',
      ),
    );

    const otherBlocks = allBlocks.filter((el) => el !== hostEl);

    let snappedLeft = left;
    let snappedTop = top;
    let axisX: string | null = null;
    let axisY: string | null = null;

    const right = left + width;
    const bottom = top + height;
    const t = this.SNAP_THRESHOLD;

    for (const block of otherBlocks) {
      const rect = block.getBoundingClientRect();
      const bLeft = rect.left - paperRect.left;
      const bRight = bLeft + rect.width;
      const bTop = rect.top - paperRect.top;
      const bBottom = bTop + rect.height;

      if (Math.abs(left - bLeft) <= t) {
        snappedLeft = bLeft;
        axisX = 'left';
      } else if (Math.abs(left - bRight) <= t) {
        snappedLeft = bRight;
        axisX = 'left';
      }
      if (Math.abs(right - bLeft) <= t) {
        snappedLeft = bLeft - width;
        axisX = 'right';
      } else if (Math.abs(right - bRight) <= t) {
        snappedLeft = bRight - width;
        axisX = 'right';
      }
      if (Math.abs(top - bTop) <= t) {
        snappedTop = bTop;
        axisY = 'top';
      } else if (Math.abs(top - bBottom) <= t) {
        snappedTop = bBottom;
        axisY = 'top';
      }
      if (Math.abs(bottom - bTop) <= t) {
        snappedTop = bTop - height;
        axisY = 'bottom';
      } else if (Math.abs(bottom - bBottom) <= t) {
        snappedTop = bBottom - height;
        axisY = 'bottom';
      }
    }

    return { snappedLeft, snappedTop, axisX, axisY };
  }

  // ═══════════════════════════════════════════════════════════
  //  Drag position calculation (pure)
  // ═══════════════════════════════════════════════════════════

  computeOverlayDrag(
    event: MouseEvent,
    startMouseX: number,
    startMouseY: number,
    startLeft: number,
    startTop: number,
    paper: HTMLElement | null,
    hostEl: HTMLElement | null,
  ): { left: number; top: number; snapAxisX: string | null; snapAxisY: string | null } {
    const deltaX = event.clientX - startMouseX;
    const deltaY = event.clientY - startMouseY;
    let newLeft = startLeft + deltaX;
    let newTop = startTop + deltaY;

    const img = hostEl?.querySelector('.block-renderer__image--overlay') as HTMLImageElement | null;
    const bw = img?.offsetWidth ?? this.imageWidth() ?? OVERLAY_DEFAULT_WIDTH;
    const bh = img?.offsetHeight ?? this.imageHeight() ?? OVERLAY_DEFAULT_HEIGHT;

    if (paper) {
      const pad = this.boundaryPadding();
      newLeft = Math.max(pad, Math.min(Math.max(0, paper.clientWidth - bw - pad), newLeft));
      newTop = Math.max(pad, Math.min(Math.max(0, paper.scrollHeight - bh - pad), newTop));
    } else {
      newLeft = Math.max(0, newLeft);
      newTop = Math.max(0, newTop);
    }

    let axisX: string | null = null;
    let axisY: string | null = null;

    if (this.snapEnabled()) {
      const g = this.applySnapToGrid(newLeft, newTop, this.gridSize());
      const hadGridSnap = g.snappedLeft !== newLeft || g.snappedTop !== newTop;
      newLeft = g.snappedLeft;
      newTop = g.snappedTop;

      const bs = this.snapToBlockEdges(newLeft, newTop, hostEl, paper);
      if (bs.snappedLeft !== newLeft || bs.snappedTop !== newTop) {
        axisX = bs.axisX;
        axisY = bs.axisY;
        newLeft = bs.snappedLeft;
        newTop = bs.snappedTop;
      } else if (hadGridSnap) {
        axisX = null;
        axisY = null;
      }
    }

    return { left: newLeft, top: newTop, snapAxisX: axisX, snapAxisY: axisY };
  }

  // ═══════════════════════════════════════════════════════════
  //  TZ-259.5 — Positioned (layout) drag with magnetic snap (pure)
  // ═══════════════════════════════════════════════════════════

  /**
   * Snap a normalized layout drag delta to the grid and to neighbouring
   * block edges. Inputs are normalized (fractions of the paper); the
   * math converts to paper px for the shared `snapToBlockEdges` DOM
   * pass, then converts back. Pure in the sense that it only reads
   * `paper`/`hostEl` for geometry and never mutates state.
   */
  computePositionedDrag(
    startLayout: BlockLayout,
    rawDx: number,
    rawDy: number,
    paper: HTMLElement | null,
    hostEl: HTMLElement | null,
  ): { dx: number; dy: number } {
    if (!paper) return { dx: rawDx, dy: rawDy };
    const pw = Math.max(1, paper.clientWidth);
    const ph = Math.max(1, paper.clientHeight);
    const startLeft = startLayout.x * pw;
    const startTop = startLayout.y * ph;
    const width = startLayout.width * pw;
    const height = (startLayout.height ?? 0.06) * ph;

    let left = startLeft + rawDx * pw;
    let top = startTop + rawDy * ph;

    if (this.snapEnabled()) {
      const g = this.applySnapToGrid(left, top, this.gridSize());
      left = g.snappedLeft;
      top = g.snappedTop;
      const bs = this.snapToBlockEdges(left, top, hostEl, paper);
      left = bs.snappedLeft;
      top = bs.snappedTop;
    }

    const pad = this.boundaryPadding();
    left = Math.max(pad, Math.min(Math.max(0, pw - width - pad), left));
    top = Math.max(pad, Math.min(Math.max(0, ph - height - pad), top));

    return { dx: (left - startLeft) / pw, dy: (top - startTop) / ph };
  }

  // ═══════════════════════════════════════════════════════════
  //  Resize calculation (pure)
  // ═══════════════════════════════════════════════════════════

  /**
   * TZ-DOC-270: corner resize for overlay images, hardened against
   * zero/negative/NaN dimensions. The caller passes naturalWidth /
   * naturalHeight which are 0 before the image finishes loading, and
   * startWidth can come from corrupted settings — any of those would
   * otherwise propagate NaN into the persisted size. Every input is
   * sanitised to a finite positive default before the math runs, and
   * the output is clamped to the same positive minima as before.
   */
  computeCornerResize(
    event: MouseEvent,
    startMouseX: number,
    startMouseY: number,
    startWidth: number,
    naturalW: number,
    naturalH: number,
  ): { width: number; height: number } {
    const safeNaturalW =
      Number.isFinite(naturalW) && naturalW > 0 ? naturalW : OVERLAY_DEFAULT_WIDTH;
    const safeNaturalH =
      Number.isFinite(naturalH) && naturalH > 0 ? naturalH : OVERLAY_DEFAULT_HEIGHT;
    const safeStart =
      Number.isFinite(startWidth) && startWidth > 0 ? startWidth : OVERLAY_DEFAULT_WIDTH;

    const deltaX = event.clientX - startMouseX;
    const deltaY = event.clientY - startMouseY;
    const aspectRatio = safeNaturalW / safeNaturalH;

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const sign = deltaX + deltaY >= 0 ? 1 : -1;
    const smoothDelta = sign * distance;

    let newWidth = Math.round(Math.max(50, safeStart + smoothDelta));
    let newHeight = Math.round(newWidth / aspectRatio);

    if (newHeight < 20) {
      newHeight = 20;
      newWidth = Math.round(newHeight * aspectRatio);
    }

    return { width: newWidth, height: newHeight };
  }

  computeSideResize(
    deltaPx: number,
    side: 'left' | 'right',
    containerWidth: number,
    startWidth: number,
    startMarginLeft: number,
  ): { width: number; marginLeft: number } {
    const deltaPercent = (deltaPx / containerWidth) * 100;

    if (side === 'left') {
      const newMarginLeft = Math.max(0, Math.min(80, startMarginLeft + deltaPercent));
      return {
        marginLeft: Math.round(newMarginLeft),
        width: Math.round(Math.max(20, 100 - newMarginLeft)),
      };
    }
    return {
      marginLeft: startMarginLeft,
      width: Math.round(Math.max(20, Math.min(100 - startMarginLeft, startWidth + deltaPercent))),
    };
  }
}

/** Clamp an opacity value to [0, 1]; non-finite values become 0. */
export function clampOpacity(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

/**
 * TZ-DOC-273 — render a block background as an `rgba()` string, or `''` for
 * transparent. Strict hex-only validation (`#RGB`/`#RRGGBB`, optional `#`):
 * CSS injection (`url(...)`), gradients, named colors, and NaN are rejected.
 * Opacity is clamped to [0, 1]. Mirrored server-side by `blockBackgroundStyle`
 * in `backend/src/modules/document-template/layout-renderer.ts` so the
 * generated document renders the same values as the builder preview.
 */
export function blockBackgroundCss(color: unknown, opacity: unknown): string {
  if (typeof color !== 'string' || color.length === 0) return '';
  const hex = color.startsWith('#') ? color.slice(1) : color;
  if (!/^[0-9a-fA-F]{3}$/.test(hex) && !/^[0-9a-fA-F]{6}$/.test(hex)) return '';

  const parts =
    hex.length === 3
      ? [hex[0] + hex[0], hex[1] + hex[1], hex[2] + hex[2]]
      : [hex.slice(0, 2), hex.slice(2, 4), hex.slice(4, 6)];
  const rgb = parts.map((p) => parseInt(p, 16));
  if (rgb.some((v) => !Number.isFinite(v))) return '';
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${clampOpacity(opacity)})`;
}
