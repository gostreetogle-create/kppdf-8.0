/**
 * Pure typed geometry helpers for Magnetic Grid + Alignment Guides.
 *
 * TZ-237.MAGNETIC-GRID-r0 (vertical slice). This module is the single
 * source of truth for the *visual* geometry of the magnetic grid and
 * alignment guides in the Document Constructor (Конструктор).
 *
 * TZ-259.4/5/6: extended with normalized-layout resize math, positioned
 * block rect conversion, and multi-select alignment — all pure, no DOM.
 *
 * Constraints:
 *   - Angular DI: NONE. No DOM, no signals, no zone. Pure functions
 *     so the engine can be unit-tested deterministically without
 *     TestBed.
 *   - DOM-free: callers convert any DOMRect/block/state to `Rect`
 *     before calling. This module never reads from the DOM.
 *   - Read-only types: every public type is `readonly` to prevent
 *     accidental mutation downstream.
 *
 * Scope (explicit):
 *   - Alignment candidates: overlay image blocks + canonical positioned
 *     (layout) blocks. Flow blocks have no absolute coordinates and are
 *     deliberately out of scope.
 *   - Single-block drag. Multi-select drag is deferred (the
 *     `multiSelected` signal exists in the renderer, but its UI
 *     shipping is post-this-slice).
 *
 * Decoupling from existing snap math:
 *   The position of the dragged block continues to be driven by the
 *   existing helpers in `BlockRendererStateService`
 *   (`applySnapToGrid`, `snapToBlockEdges`). This engine only
 *   computes WHERE to draw guide lines based on the currently
 *   snapped rect; it does not (and must not) move the block.
 *
 * Determinism contract:
 *   `computeAlignmentGuides` returns a sorted array. Identical inputs
 *   ALWAYS produce identical outputs in identical order. This is
 *   required so Angular's @for + track expressions do not flicker
 *   guides during fast drag.
 */

import {
  normalizeBlockLayout,
  type BlockLayout,
} from '../../../shared/template-block/template-block-layout';

export interface Rect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
  /** Stable identifier used for self-exclusion and tie-breaking. */
  readonly blockId: string;
}

export type Axis = 'x' | 'y';

export type GuideKind = 'edge' | 'center';

export type GuideEdge = 'left' | 'right' | 'cx' | 'top' | 'bottom' | 'cy';

export interface SnapGuide {
  readonly axis: Axis;
  /**
   * The coordinate at which to draw the guide line, in the same
   * canvas-relative pixel units used by the overlay layer.
   */
  readonly coordinate: number;
  readonly kind: GuideKind;
  readonly edge: GuideEdge;
  /** The neighbour that produced this guide (not the dragged block). */
  readonly targetBlockId: string;
  /** |draggedValue - targetValue| in canvas px. Smaller = closer. */
  readonly distance: number;
}

/**
 * Centralised snap threshold used by both the existing position
 * controller and the new visual engine. Eight pixels matches the
 * existing `SNAP_THRESHOLD` in `BlockRendererStateService`; this
 * is the explicit public mirror so the visual layer does not need
 * to import the per-instance service to know the threshold.
 */
export const SNAP_THRESHOLD_PX = 8;

/**
 * Snap a single value to the nearest grid multiple.
 * Returns the original value unchanged when gridSize is non-positive
 * or non-finite.
 */
export function snapValueToGrid(
  value: number,
  gridSize: number,
): { readonly snapped: number; readonly isSnapped: boolean } {
  if (!Number.isFinite(gridSize) || gridSize <= 0) {
    return { snapped: value, isSnapped: false };
  }
  const snapped = Math.round(value / gridSize) * gridSize;
  return { snapped, isSnapped: snapped === value };
}

/**
 * Snap (left, top) independently to their nearest grid multiples.
 * Equivalent to the existing `applySnapToGrid` helper in
 * `BlockRendererStateService`; exposed here so the canvas grid
 * layer can compute its visual baseline without reaching into
 * the per-instance renderer service.
 */
export function applySnapToGrid(
  left: number,
  top: number,
  gridSize: number,
): { readonly snappedLeft: number; readonly snappedTop: number } {
  const { snapped: snappedLeft } = snapValueToGrid(left, gridSize);
  const { snapped: snappedTop } = snapValueToGrid(top, gridSize);
  return { snappedLeft, snappedTop };
}

/**
 * Compute candidate alignment guides (up to 6 per drag — 3 per axis)
 * for the currently dragged rectangle against every neighbour in
 * `others`.
 *
 * Output is sorted deterministically:
 *   1. smaller distance wins;
 *   2. edges before centres (edge > center);
 *   3. lexicographic `targetBlockId` asc (cold tie-breaker).
 *
 * Self-exclusion is enforced defensively: neighbours whose
 * `blockId` matches `dragged.blockId` are skipped, regardless of
 * whether the caller already filtered. This is intentional — the
 * caller contract is "no self in others", but the math should not
 * rely on it.
 *
 * Returns `[]` when:
 *   - `others` is empty;
 *   - threshold is negative or non-finite;
 *   - `dragged` has non-positive width or height;
 *   - any candidate has non-positive dimensions or non-finite
 *     coordinates (silently skipped).
 */
/**
 * Collapse a sorted candidate list of guides to AT MOST one per
 * (axis, kind, edge) tuple. Keeps the FIRST occurrence of each key
 * in the input order, which under `computeAlignmentGuides` is
 * always the closest match (smaller distance first; edges before
 * centres as a tie-break; lex `targetBlockId` as the cold tie-break).
 *
 * The engine itself does NOT collapse — it returns the deterministic
 * full candidate list. This helper applies the visual layer's
 * "no-fan-of-lines" policy and belongs at the caller side; tests of
 * the pure engine therefore stay decoupled from canvas-side choices.
 *
 * Returns an empty array for empty input.
 */
/** Selection policy for marquee/rectangle selection (TZ-DOC-272). */
export type MarqueePolicy = 'intersect' | 'contain';

/**
 * Compute which candidate rects are selected by a marquee rectangle.
 * Pure + deterministic — block ids are returned in input order.
 *
 * The marquee rect may carry NEGATIVE width/height (the user dragged
 * up-left / down-left), so all four edges are normalised first.
 *
 * Policies (documented, TZ-DOC-272 AC):
 *   - `intersect` (default): a block is selected when its rectangle
 *     overlaps the marquee by a positive area (touching edges only does
 *     NOT count — the comparisons are strict).
 *   - `contain`: a block is selected only when it lies fully inside the
 *     marquee (inclusive edges).
 *
 * Candidates with non-positive dimensions or non-finite coordinates are
 * skipped (same defensive contract as `computeAlignmentGuides`).
 */
export function selectRectsInMarquee(
  candidates: ReadonlyArray<Rect>,
  marquee: Rect,
  policy: MarqueePolicy = 'intersect',
): string[] {
  const mLeft = Math.min(marquee.left, marquee.left + marquee.width);
  const mTop = Math.min(marquee.top, marquee.top + marquee.height);
  const mRight = Math.max(marquee.left, marquee.left + marquee.width);
  const mBottom = Math.max(marquee.top, marquee.top + marquee.height);
  const out: string[] = [];

  for (const c of candidates) {
    if (!Number.isFinite(c.left) || !Number.isFinite(c.top) || c.width <= 0 || c.height <= 0) {
      continue;
    }
    const cRight = c.left + c.width;
    const cBottom = c.top + c.height;
    const intersects = mLeft < cRight && mRight > c.left && mTop < cBottom && mBottom > c.top;
    const contained = mLeft <= c.left && mTop <= c.top && mRight >= cRight && mBottom >= cBottom;
    if (policy === 'contain' ? contained : intersects) out.push(c.blockId);
  }
  return out;
}

export function collapseAlignmentGuides(guides: readonly SnapGuide[]): readonly SnapGuide[] {
  if (guides.length === 0) return [];
  const seen = new Set<string>();
  const out: SnapGuide[] = [];
  for (const g of guides) {
    const key = `${g.axis}|${g.kind}|${g.edge}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(g);
  }
  return out;
}

export function computeAlignmentGuides(
  dragged: Rect,
  others: ReadonlyArray<Rect>,
  threshold: number = SNAP_THRESHOLD_PX,
): readonly SnapGuide[] {
  if (others.length === 0) return [];
  if (!Number.isFinite(threshold) || threshold < 0) return [];
  if (dragged.width <= 0 || dragged.height <= 0) return [];

  const dragRight = dragged.left + dragged.width;
  const dragCx = dragged.left + dragged.width / 2;
  const dragBottom = dragged.top + dragged.height;
  const dragCy = dragged.top + dragged.height / 2;

  const out: SnapGuide[] = [];

  for (const o of others) {
    if (o.blockId === dragged.blockId) continue;
    if (!Number.isFinite(o.left) || !Number.isFinite(o.top) || o.width <= 0 || o.height <= 0) {
      continue;
    }

    const oRight = o.left + o.width;
    const oCx = o.left + o.width / 2;
    const oBottom = o.top + o.height;
    const oCy = o.top + o.height / 2;

    const pushIfNear = (
      axis: Axis,
      kind: GuideKind,
      edge: GuideEdge,
      dValue: number,
      tValue: number,
      blockId: string,
    ): void => {
      if (!Number.isFinite(dValue) || !Number.isFinite(tValue)) return;
      const diff = Math.abs(dValue - tValue);
      if (diff <= threshold) {
        out.push({
          axis,
          coordinate: tValue,
          kind,
          edge,
          targetBlockId: blockId,
          distance: diff,
        });
      }
    };

    // X axis: left / right edges + horizontal center.
    pushIfNear('x', 'edge', 'left', dragged.left, o.left, o.blockId);
    pushIfNear('x', 'edge', 'right', dragRight, oRight, o.blockId);
    pushIfNear('x', 'center', 'cx', dragCx, oCx, o.blockId);

    // Y axis: top / bottom edges + vertical center.
    pushIfNear('y', 'edge', 'top', dragged.top, o.top, o.blockId);
    pushIfNear('y', 'edge', 'bottom', dragBottom, oBottom, o.blockId);
    pushIfNear('y', 'center', 'cy', dragCy, oCy, o.blockId);
  }

  out.sort((a, b) => {
    if (a.distance !== b.distance) return a.distance - b.distance;
    if (a.kind !== b.kind) return a.kind === 'edge' ? -1 : 1;
    return a.targetBlockId.localeCompare(b.targetBlockId);
  });

  return out;
}

/**
 * Minimal structural shape used by `overlayBlockToRect`. Accepts
 * any object that has a stable `blockId` and an optional `settings`
 * record; decouples the engine from the full `TemplateBlock`
 * transport type so the engine imports cleanly.
 *
 * Settings is intentionally typed as a generic `Record<string, unknown>`
 * rather than the project's concrete `BlockSettings`: the project's
 * `settings` field is itself indexed (`Record<string, unknown>`),
 * and the engine does its own runtime type-narrowing per field.
 * This keeps the engine free of `any` casts at the boundary.
 */
export interface OverlayLikeBlock {
  /** Stable block identity. Caller picks the convention (id, key, etc.). */
  readonly blockId: string;
  readonly settings?: Readonly<Record<string, unknown>> | null;
}

/**
 * Convert an overlay-like block to a `Rect` for the alignment-guide
 * engine. Returns `null` for flow blocks, missing coordinates, or
 * non-positive dimensions — the caller is expected to filter out
 * `null` entries before passing the list into `computeAlignmentGuides`.
 *
 * Defaults `left`/`top` to `0` when the overlay has no explicit
 * coordinates yet (the overlay is rendered at the natural origin).
 * Field accesses use bracket notation (`s['imageWidth']`) because
 * the input type is `Record<string, unknown>` — explicit runtime
 * type guards replace compile-time type narrowing.
 */
export function overlayBlockToRect(block: OverlayLikeBlock): Rect | null {
  const s = block.settings;
  if (!s) return null;
  if (s['overlay'] !== true) return null;

  // ── Image dimensions are mandatory for an overlay rect. ──
  const rawW = s['imageWidth'];
  const rawH = s['imageHeight'];
  if (typeof rawW !== 'number' || typeof rawH !== 'number') return null;
  if (!Number.isFinite(rawW) || !Number.isFinite(rawH)) return null;
  if (rawW <= 0 || rawH <= 0) return null;

  // ── Coordinates may be absent (omit OK → default 0), BUT if present
  // must be a finite number. NaN / Infinity are rejected outright so
  // callers cannot ship corrupt geometry into the alignment engine. ──
  const rawLeft = s['overlayLeft'];
  const rawTop = s['overlayTop'];
  if (rawLeft != null && (typeof rawLeft !== 'number' || !Number.isFinite(rawLeft))) {
    return null;
  }
  if (rawTop != null && (typeof rawTop !== 'number' || !Number.isFinite(rawTop))) {
    return null;
  }
  const left = typeof rawLeft === 'number' ? rawLeft : 0;
  const top = typeof rawTop === 'number' ? rawTop : 0;

  return {
    blockId: block.blockId,
    left,
    top,
    width: rawW,
    height: rawH,
  };
}

// ═══════════════════════════════════════════════════════════════
//  TZ-259.4 — Normalized-layout resize math (pure)
// ═══════════════════════════════════════════════════════════════

/** Resize handle directions for canonical (layout) blocks. */
export type LayoutResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

/** CSS cursor per resize handle direction (mirrors the handle geometry). */
export const RESIZE_CURSORS: Readonly<Record<LayoutResizeHandle, string>> = {
  n: 'ns-resize',
  s: 'ns-resize',
  e: 'ew-resize',
  w: 'ew-resize',
  ne: 'nesw-resize',
  sw: 'nesw-resize',
  nw: 'nwse-resize',
  se: 'nwse-resize',
};

/**
 * Resize a normalized layout by a pointer delta (px) relative to a paper
 * sized `paperW` x `paperH` (px). Edges and corners move/scale the
 * rectangle; `normalizeBlockLayout` re-clamps to page bounds and
 * min dimensions. Pure and deterministic — unit-testable without DOM.
 */
export function computeLayoutResize(
  start: BlockLayout,
  handle: LayoutResizeHandle,
  deltaPx: { dx: number; dy: number },
  paperW: number,
  paperH: number,
  minWidthPx = 20,
  minHeightPx = 20,
): BlockLayout {
  const pw = Math.max(1, paperW);
  const ph = Math.max(1, paperH);
  const dx = deltaPx.dx / pw;
  const dy = deltaPx.dy / ph;
  const minW = minWidthPx / pw;
  const minH = minHeightPx / ph;

  let x = start.x;
  let y = start.y;
  let w = start.width;
  let h = start.height ?? 0.06;

  if (handle.includes('e')) {
    w = Math.min(1 - x, Math.max(minW, w + dx));
  }
  if (handle.includes('w')) {
    const newX = Math.min(x + w - minW, Math.max(0, x + dx));
    w = w + (x - newX);
    x = newX;
  }
  if (handle.includes('s')) {
    h = Math.min(1 - y, Math.max(minH, h + dy));
  }
  if (handle.includes('n')) {
    const newY = Math.min(y + h - minH, Math.max(0, y + dy));
    h = h + (y - newY);
    y = newY;
  }

  return normalizeBlockLayout({ ...start, x, y, width: w, height: h });
}

// ═══════════════════════════════════════════════════════════════
//  TZ-259.5 — Positioned (layout) block → Rect (pure)
// ═══════════════════════════════════════════════════════════════

/**
 * Convert a canonical layout block to a paper-relative px `Rect` so the
 * alignment-guide engine can treat positioned blocks exactly like
 * overlay blocks. Returns `null` when the block has no layout or
 * non-positive dimensions.
 */
export function layoutBlockToRect(
  block: { blockId: string; layout?: BlockLayout | null },
  paperW: number,
  paperH: number,
): Rect | null {
  const l = block.layout;
  if (!l) return null;
  if (!(paperW > 0) || !(paperH > 0)) return null;
  const width = l.width * paperW;
  const height = (l.height ?? 0.06) * paperH;
  if (!(width > 0) || !(height > 0)) return null;
  return {
    blockId: block.blockId,
    left: l.x * paperW,
    top: l.y * paperH,
    width,
    height,
  };
}

// ═══════════════════════════════════════════════════════════════
//  TZ-259.6 — Multi-select alignment / distribution (pure)
// ═══════════════════════════════════════════════════════════════

export type AlignMode =
  | 'left'
  | 'center-x'
  | 'right'
  | 'top'
  | 'middle-y'
  | 'bottom'
  | 'distribute-h'
  | 'distribute-v'
  | 'same-width'
  | 'same-height';

export interface AlignEntry {
  readonly blockId: string;
  readonly layout: BlockLayout;
}

/**
 * Compute new normalized layouts that align/distribute a group of
 * positioned blocks. Pure and deterministic: identical inputs always
 * produce identical outputs. Returns an entry per input (order
 * preserved), each with the normalized layout for that block.
 */
export function computeAlignLayouts(
  entries: readonly AlignEntry[],
  mode: AlignMode,
): readonly AlignEntry[] {
  if (entries.length === 0) return entries;
  const layouts = entries.map((e) => normalizeBlockLayout(e.layout));

  const left = Math.min(...layouts.map((l) => l.x));
  const top = Math.min(...layouts.map((l) => l.y));
  const right = Math.max(...layouts.map((l) => l.x + l.width));
  const bottom = Math.max(...layouts.map((l) => l.y + (l.height ?? 0.06)));
  const cx = (left + right) / 2;
  const cy = (top + bottom) / 2;

  let next: BlockLayout[];

  switch (mode) {
    case 'left':
      next = layouts.map((l) => normalizeBlockLayout({ ...l, x: left }));
      break;
    case 'center-x':
      next = layouts.map((l) => normalizeBlockLayout({ ...l, x: cx - l.width / 2 }));
      break;
    case 'right':
      next = layouts.map((l) => normalizeBlockLayout({ ...l, x: right - l.width }));
      break;
    case 'top':
      next = layouts.map((l) => normalizeBlockLayout({ ...l, y: top }));
      break;
    case 'middle-y':
      next = layouts.map((l) => normalizeBlockLayout({ ...l, y: cy - (l.height ?? 0.06) / 2 }));
      break;
    case 'bottom':
      next = layouts.map((l) => normalizeBlockLayout({ ...l, y: bottom - (l.height ?? 0.06) }));
      break;
    case 'same-width': {
      const maxW = Math.max(...layouts.map((l) => l.width));
      next = layouts.map((l) => normalizeBlockLayout({ ...l, width: maxW }));
      break;
    }
    case 'same-height': {
      const maxH = Math.max(...layouts.map((l) => l.height ?? 0.06));
      next = layouts.map((l) => normalizeBlockLayout({ ...l, height: maxH }));
      break;
    }
    case 'distribute-h': {
      // Sort by current x, keep first/last anchors, spread evenly.
      const sorted = layouts.map((l, i) => ({ l, i })).sort((a, b) => a.l.x - b.l.x);
      const gap = sorted.length > 1 ? (right - left) / (sorted.length - 1) : 0;
      const placed = new Array<BlockLayout>(layouts.length);
      sorted.forEach(({ l, i }, idx) => {
        placed[i] = normalizeBlockLayout({ ...l, x: left + gap * idx });
      });
      next = placed;
      break;
    }
    case 'distribute-v': {
      const sorted = layouts.map((l, i) => ({ l, i })).sort((a, b) => a.l.y - b.l.y);
      const gap = sorted.length > 1 ? (bottom - top) / (sorted.length - 1) : 0;
      const placed = new Array<BlockLayout>(layouts.length);
      sorted.forEach(({ l, i }, idx) => {
        placed[i] = normalizeBlockLayout({ ...l, y: top + gap * idx });
      });
      next = placed;
      break;
    }
  }

  return entries.map((e, i) => ({ blockId: e.blockId, layout: next[i] }));
}
