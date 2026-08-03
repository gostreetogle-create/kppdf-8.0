import type { DataBindingFormat, DataBindingSource } from './template-block.types';

/** Canonical normalized layout. x/y/width/height are fractions of a page. */
export interface BlockLayout {
  page: number;
  x: number;
  y: number;
  width: number;
  height?: number;
  zIndex: number;
  rotation: number;
}

export type BlockSource =
  | { kind: 'text-block'; refId: string; mode: 'live' | 'snapshot' }
  | { kind: 'table-template'; refId: string; mode: 'live' | 'snapshot' }
  | {
      kind: 'field';
      source: Exclude<DataBindingSource, 'static'>;
      field: string;
      format?: DataBindingFormat;
    }
  | { kind: 'literal'; value: string };

export interface LegacyOverlaySettings {
  overlay?: unknown;
  overlayLeft?: unknown;
  overlayTop?: unknown;
  imageWidth?: unknown;
  imageHeight?: unknown;
  zIndex?: unknown;
}

const DEFAULT_LAYOUT: BlockLayout = {
  page: 1,
  x: 0,
  y: 0,
  width: 1,
  zIndex: 1,
  rotation: 0,
};

function finite(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/** Clamp a canonical layout to a valid single-page normalized range. */
export function normalizeBlockLayout(layout: Partial<BlockLayout> | null | undefined): BlockLayout {
  // The canvas and renderer currently expose one page. Keep the field in the
  // contract for forward-compatible pagination, but never render page 2 into
  // the wrong page until page containers are implemented end-to-end.
  const page = Math.min(1, Math.max(1, Math.floor(finite(layout?.page, DEFAULT_LAYOUT.page))));
  const width = Math.min(1, Math.max(0.001, finite(layout?.width, DEFAULT_LAYOUT.width)));
  const x = Math.min(1 - width, Math.max(0, finite(layout?.x, DEFAULT_LAYOUT.x)));
  const rawHeight =
    layout?.height === undefined
      ? undefined
      : Math.min(1, Math.max(0.001, finite(layout.height, 0.1)));
  const y =
    rawHeight === undefined
      ? Math.min(1, Math.max(0, finite(layout?.y, DEFAULT_LAYOUT.y)))
      : Math.min(1 - rawHeight, Math.max(0, finite(layout?.y, DEFAULT_LAYOUT.y)));

  return {
    page,
    x,
    y,
    width,
    ...(rawHeight === undefined ? {} : { height: rawHeight }),
    zIndex: Math.max(0, Math.floor(finite(layout?.zIndex, DEFAULT_LAYOUT.zIndex))),
    rotation: finite(layout?.rotation, DEFAULT_LAYOUT.rotation),
  };
}

/** Convert the existing image overlay settings to the canonical contract. */
export function legacyOverlayToLayout(
  settings: LegacyOverlaySettings | null | undefined,
  paperWidthPx: number,
  paperHeightPx: number,
): BlockLayout | null {
  if (!settings || settings.overlay !== true) return null;
  if (!(paperWidthPx > 0) || !(paperHeightPx > 0)) return null;

  const left = finite(settings.overlayLeft, 0);
  const top = finite(settings.overlayTop, 0);
  const width = finite(settings.imageWidth, 300);
  const height = finite(settings.imageHeight, 200);

  return normalizeBlockLayout({
    page: 1,
    x: left / paperWidthPx,
    y: top / paperHeightPx,
    width: width / paperWidthPx,
    height: height / paperHeightPx,
    zIndex: finite(settings.zIndex, 20),
    rotation: 0,
  });
}

/**
 * Clamp one normalized pointer delta against the union of selected block bounds.
 * Keeping this pure makes single- and group-drag behavior deterministic and
 * prevents each block from being clamped independently at the page edge.
 */
export function clampLayoutDelta(
  layouts: readonly BlockLayout[],
  dx: number,
  dy: number,
): { dx: number; dy: number } {
  if (layouts.length === 0) return { dx: 0, dy: 0 };
  const normalized = layouts.map((layout) => normalizeBlockLayout(layout));
  const minX = Math.min(...normalized.map((layout) => layout.x));
  const minY = Math.min(...normalized.map((layout) => layout.y));
  const maxX = Math.max(...normalized.map((layout) => layout.x + layout.width));
  const maxY = Math.max(...normalized.map((layout) => layout.y + (layout.height ?? 0.1)));
  return {
    dx: Math.max(-minX, Math.min(1 - maxX, finite(dx, 0))),
    dy: Math.max(-minY, Math.min(1 - maxY, finite(dy, 0))),
  };
}

/** Default placement for a newly inserted block, stacked below existing blocks. */
export function defaultBlockLayout(index: number): BlockLayout {
  const row = Math.max(0, Math.floor(index));
  const y = Math.min(0.85, 0.04 + row * 0.12);
  return normalizeBlockLayout({
    page: 1,
    x: 0.08,
    y,
    width: 0.84,
    // Starter min-height; block-renderer auto-fits to content after paint.
    height: 0.12,
    zIndex: 1,
    rotation: 0,
  });
}

/** Layer-order operations for canonical positioned blocks (TZ-DOC-271). */
export type LayerOrderMode = 'front' | 'back' | 'raise' | 'lower';

/**
 * Compute a NEW compact z-index for every positioned block after a
 * layer-order operation applied to `targetIds`. Pure + deterministic:
 * identical inputs always produce identical outputs.
 *
 * Semantics (documented multi-select behaviour):
 *   - `front`: the selected blocks move to the TOP of the stack, preserving
 *     their internal order;
 *   - `back`:  the selected blocks move to the BOTTOM of the stack,
 *     preserving their internal order;
 *   - `raise`: each selected block swaps with the nearest unselected block
 *     above it (a selected group rises as a unit past the non-selected);
 *   - `lower`: each selected block swaps with the nearest unselected block
 *     below it (symmetric to raise).
 *
 * The result is a FULL compact reindex (0..n-1) so callers can diff and
 * emit only the blocks whose zIndex actually changed. `normalizeBlockLayout`
 * clamps zIndex to >= 0, so sequential reindexing never collides with the
 * clamp and never produces negative or NaN values.
 */
export function computeLayerOrder(
  entries: ReadonlyArray<{ blockId: string; zIndex: number }>,
  targetIds: ReadonlySet<string>,
  mode: LayerOrderMode,
): Map<string, number> {
  const result = new Map<string, number>();
  if (entries.length === 0 || targetIds.size === 0) return result;

  // Stable sort: zIndex asc, original index as tie-breaker.
  const sorted = entries
    .map((e, i) => ({ blockId: e.blockId, zIndex: e.zIndex, order: i }))
    .sort((a, b) => a.zIndex - b.zIndex || a.order - b.order);
  const isTarget = (id: string): boolean => targetIds.has(id);
  const originalIndex = new Map<string, number>(sorted.map((e, i) => [e.blockId, i]));

  const selected = sorted.filter((e) => isTarget(e.blockId));
  const others = sorted.filter((e) => !isTarget(e.blockId));
  if (selected.length === 0 || others.length === 0) {
    // All blocks selected (or none) — nothing to reorder.
    sorted.forEach((e, i) => result.set(e.blockId, i));
    return result;
  }

  let ordered: Array<{ blockId: string; zIndex: number; order: number }>;
  if (mode === 'front') {
    // Selected group to the TOP as a unit, internal order preserved.
    ordered = [...others, ...selected];
  } else if (mode === 'back') {
    // Selected group to the BOTTOM as a unit, internal order preserved.
    ordered = [...selected, ...others];
  } else if (mode === 'raise') {
    // Group rises by ONE slot: re-insert it right above the nearest
    // non-selected block currently above the group's top. Internal order
    // is always preserved (works for single AND multi selection).
    const groupTop = Math.max(...sorted.map((e, i) => (isTarget(e.blockId) ? i : -1)));
    const aboveIdx = others.findIndex((o) => originalIndex.get(o.blockId)! > groupTop);
    if (aboveIdx === -1) {
      // Already at the top — no-op.
      sorted.forEach((e, i) => result.set(e.blockId, i));
      return result;
    }
    ordered = [
      ...others.slice(0, aboveIdx),
      others[aboveIdx],
      ...selected,
      ...others.slice(aboveIdx + 1),
    ];
  } else {
    // Group sinks by ONE slot: re-insert it right below the nearest
    // non-selected block currently below the group's bottom.
    const groupBottom = Math.min(...sorted.map((e, i) => (isTarget(e.blockId) ? i : Infinity)));
    let belowIdx = -1;
    for (let i = others.length - 1; i >= 0; i--) {
      if (originalIndex.get(others[i].blockId)! < groupBottom) {
        belowIdx = i;
        break;
      }
    }
    if (belowIdx === -1) {
      // Already at the bottom — no-op.
      sorted.forEach((e, i) => result.set(e.blockId, i));
      return result;
    }
    ordered = [
      ...others.slice(0, belowIdx),
      ...selected,
      others[belowIdx],
      ...others.slice(belowIdx + 1),
    ];
  }

  ordered.forEach((e, idx) => result.set(e.blockId, idx));
  return result;
}
