/**
 * Pure typed geometry helpers for Magnetic Grid + Alignment Guides.
 *
 * TZ-237.MAGNETIC-GRID-r0 (vertical slice). This module is the single
 * source of truth for the *visual* geometry of the magnetic grid and
 * alignment guides in the Document Constructor (Конструктор).
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
 *   - Alignment candidates: overlay image blocks ONLY. Flow blocks
 *     have no absolute coordinates and are deliberately out of scope.
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
export function collapseAlignmentGuides(
  guides: readonly SnapGuide[],
): readonly SnapGuide[] {
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
    if (
      !Number.isFinite(o.left) ||
      !Number.isFinite(o.top) ||
      o.width <= 0 ||
      o.height <= 0
    ) {
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
export function overlayBlockToRect(
  block: OverlayLikeBlock,
): Rect | null {
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
  if (
    rawLeft != null &&
    (typeof rawLeft !== 'number' || !Number.isFinite(rawLeft))
  ) {
    return null;
  }
  if (
    rawTop != null &&
    (typeof rawTop !== 'number' || !Number.isFinite(rawTop))
  ) {
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
