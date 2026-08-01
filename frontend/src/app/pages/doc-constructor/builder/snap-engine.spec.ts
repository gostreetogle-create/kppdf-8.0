/**
 * Unit tests for `snap-engine.ts` — pure geometry helpers driving the
 * Document Constructor magnetic grid + alignment guides (TZ-237.MAGNETIC-GRID-r0).
 *
 * No TestBed. No Angular DI. No DOM. Just deterministic math.
 */
import {
  applySnapToGrid,
  collapseAlignmentGuides,
  computeAlignmentGuides,
  computeAlignLayouts,
  computeLayoutResize,
  layoutBlockToRect,
  overlayBlockToRect,
  snapValueToGrid,
  SNAP_THRESHOLD_PX,
  type Rect,
  type SnapGuide,
} from './snap-engine';
import type { BlockLayout } from '../../../shared/template-block/template-block-layout';

const rect = (id: string, left: number, top: number, w: number, h: number): Rect => ({
  blockId: id,
  left,
  top,
  width: w,
  height: h,
});

describe('snapValueToGrid', () => {
  it('rounds to nearest multiple of gridSize', () => {
    expect(snapValueToGrid(13, 10).snapped).toBe(10);
    expect(snapValueToGrid(17, 10).snapped).toBe(20);
    expect(snapValueToGrid(15, 10).snapped).toBe(20);
  });

  it('marks isSnapped only when input is already on the grid', () => {
    expect(snapValueToGrid(10, 10)).toEqual({ snapped: 10, isSnapped: true });
    expect(snapValueToGrid(11, 10).isSnapped).toBe(false);
  });

  it('returns input unchanged for non-positive or non-finite gridSize', () => {
    expect(snapValueToGrid(17, 0)).toEqual({ snapped: 17, isSnapped: false });
    expect(snapValueToGrid(17, -10)).toEqual({ snapped: 17, isSnapped: false });
    expect(snapValueToGrid(17, Number.NaN)).toEqual({ snapped: 17, isSnapped: false });
    expect(snapValueToGrid(17, Number.POSITIVE_INFINITY)).toEqual({
      snapped: 17,
      isSnapped: false,
    });
  });
});

describe('applySnapToGrid', () => {
  it('snaps left and top independently', () => {
    expect(applySnapToGrid(13, 25, 10)).toEqual({ snappedLeft: 10, snappedTop: 30 });
  });

  it('returns inputs unchanged when gridSize is invalid', () => {
    expect(applySnapToGrid(13, 25, 0)).toEqual({ snappedLeft: 13, snappedTop: 25 });
  });
});

describe('computeAlignmentGuides', () => {
  const makeDragged = (overrides: Partial<Rect> = {}): Rect => ({
    blockId: 'self',
    left: 100,
    top: 100,
    width: 50,
    height: 50,
    ...overrides,
  });

  it('returns no guides when `others` is empty', () => {
    expect(computeAlignmentGuides(makeDragged(), [])).toEqual([]);
  });

  it('returns no guides when threshold is negative or non-finite', () => {
    const other = rect('n', 105, 100, 50, 50);
    expect(computeAlignmentGuides(makeDragged(), [other], -1)).toEqual([]);
    expect(computeAlignmentGuides(makeDragged(), [other], Number.NaN)).toEqual([]);
    expect(computeAlignmentGuides(makeDragged(), [other], Number.POSITIVE_INFINITY)).toEqual([]);
  });

  it('returns no guides when dragged rect has non-positive dimensions', () => {
    expect(
      computeAlignmentGuides(makeDragged({ width: 0 }), [rect('n', 100, 100, 50, 50)]),
    ).toEqual([]);
    expect(
      computeAlignmentGuides(makeDragged({ height: 0 }), [rect('n', 100, 100, 50, 50)]),
    ).toEqual([]);
  });

  it('returns no guides when neighbour is outside the default threshold', () => {
    // dragged.left = 100; other.left = 0; diff = 100 > SNAP_THRESHOLD_PX (8).
    // Move top off-axis so no Y-axis exact matches sneak in.
    expect(computeAlignmentGuides(makeDragged(), [rect('a', 0, 200, 50, 50)])).toEqual([]);
  });

  it('returns X-axis guides when left/right/cx are all within threshold', () => {
    // The symmetric alignment: dragged at (100,100)+(50,50) and other at
    // (105,200)+(50,50) — both blocks share width=50, so left diff = right
    // diff = cx diff = 5. All three X-axis guides are produced. The first
    // one (left edge, kind=edge) is the leading result by tie-break.
    const other = rect('n', 105, 200, 50, 50);
    const guides = computeAlignmentGuides(makeDragged(), [other]);
    expect(guides).toHaveLength(3);
    expect(guides.every((g) => g.axis === 'x')).toBe(true);
    expect(guides.every((g) => g.distance === 5 && g.targetBlockId === 'n')).toBe(true);
    // First is the left-edge guide (smallest lex among edges, edge>center).
    expect(guides[0]).toMatchObject({
      axis: 'x',
      kind: 'edge',
      edge: 'left',
      coordinate: 105,
      targetBlockId: 'n',
      distance: 5,
    });
  });

  it('returns a right-edge guide when right edges align within threshold', () => {
    // dragged.right = 150; other.right = 100 + 50 = 150; diff 0.
    const other = rect('n', 100, 140, 50, 50);
    const guides = computeAlignmentGuides(makeDragged(), [other]);
    expect(guides.some((g) => g.axis === 'x' && g.kind === 'edge' && g.edge === 'right')).toBe(
      true,
    );
  });

  it('returns top and bottom edge guides on Y axis', () => {
    const other = rect('n', 200, 105, 50, 50); // top diff 5, bottom = 105+50=155 vs 150 → diff 5
    const guides = computeAlignmentGuides(makeDragged(), [other]);
    const yGuides = guides.filter((g) => g.axis === 'y');
    expect(yGuides.length).toBeGreaterThanOrEqual(1);
    expect(yGuides[0]).toMatchObject({ kind: 'edge', edge: 'top' });
  });

  it('returns a center-x guide when horizontal centres align within threshold', () => {
    // dragged.cx = 125; other.cx = 125 when other.left=100, other.width=50 → diff 0.
    const other = rect('n', 100, 200, 50, 50);
    const guides = computeAlignmentGuides(makeDragged(), [other]);
    expect(guides.some((g) => g.axis === 'x' && g.kind === 'center')).toBe(true);
  });

  it('returns a center-y guide when vertical centres align within threshold', () => {
    // dragged.cy = 125; other.cy = 125 → diff 0.
    const other = rect('n', 200, 100, 50, 50);
    const guides = computeAlignmentGuides(makeDragged(), [other]);
    expect(guides.some((g) => g.axis === 'y' && g.kind === 'center')).toBe(true);
  });

  it('defensively skips the dragged block even if erroneously present in others', () => {
    // Self-exclusion must work even when the self rect has perfect Y-axis matches.
    const self = makeDragged();
    expect(computeAlignmentGuides(self, [self])).toEqual([]);
  });

  it('defensively ignores neighbours with NaN or Infinity coordinates', () => {
    expect(
      computeAlignmentGuides(makeDragged(), [rect('n', Number.NaN, 200, 50, 50)]),
    ).toEqual([]);
    expect(
      computeAlignmentGuides(makeDragged(), [rect('n', 0, Number.POSITIVE_INFINITY, 50, 50)]),
    ).toEqual([]);
    expect(
      computeAlignmentGuides(makeDragged(), [rect('n', 0, 200, Number.NaN, 50)]),
    ).toEqual([]);
    expect(
      computeAlignmentGuides(makeDragged(), [rect('n', 0, 200, 50, -1)]),
    ).toEqual([]);
  });

  it('honours a custom threshold parameter', () => {
    // Other block offset on Y so only the X-axis edges can collide, isolating
    // the threshold parameter from y-axis exact matches that would otherwise
    // sneak in against default-threshold tests.
    const other = rect('n', 110, 200, 50, 50); // left diff 10; y-axis all out
    expect(computeAlignmentGuides(makeDragged(), [other])).toEqual([]);
    const guidesAt12 = computeAlignmentGuides(makeDragged(), [other], 12);
    // left (diff 10), right (diff 10), cx (diff 10) all within 12.
    expect(guidesAt12).toHaveLength(3);
    expect(guidesAt12.every((g) => g.distance === 10 && g.targetBlockId === 'n')).toBe(true);
  });

  it('sorts candidates deterministically: smaller distance first', () => {
    // Position the dragged rect so neither candidate collides on
    // top/bottom/center axes — only the X-axis edges differ.
    // dragged: top=100, cy=125, bottom=150, left=100, right=150, cx=125.
    const dragged = makeDragged({ left: 100, top: 100, width: 50, height: 50 });
    const close = rect('z', 102, 200, 50, 50); // left diff 2; y-axis all out of threshold
    const far = rect('a', 90, 200, 50, 50); // left diff 10; y-axis all out of threshold
    const guides = computeAlignmentGuides(dragged, [far, close]);
    // Only `close` is within the default threshold (8); `far` diff 10 is excluded.
    expect(guides).toHaveLength(3);
    // Left edge, right edge, centerX all at distance 2 for `close`.
    expect(guides.every((g) => g.targetBlockId === 'z' && g.distance === 2)).toBe(true);
  });

  it('sorts candidates deterministically when multiple candidates share distance band', () => {
    // Two candidates at different distances; all guides are y-axis.
    const dragged = makeDragged({ left: 100, top: 100, width: 50, height: 50 });
    const nearer = rect('z', 200, 102, 50, 50); // top=102 diff 2, bottom=152 diff 2, cy=127 diff 2
    const farther = rect('a', 200, 106, 50, 50); // top=106 diff 6, bottom=156 diff 6, cy=131 diff 6
    const guides = computeAlignmentGuides(dragged, [farther, nearer]);
    const nearerGuides = guides.filter((g) => g.targetBlockId === 'z');
    const fartherGuides = guides.filter((g) => g.targetBlockId === 'a');
    expect(nearerGuides.every((g) => g.distance === 2)).toBe(true);
    expect(fartherGuides.every((g) => g.distance === 6)).toBe(true);
    expect(guides[0].targetBlockId).toBe('z');
    expect(guides[guides.length - 1].targetBlockId).toBe('a');
  });

  it('tie-breaks edges before centres when distances are equal', () => {
    // Make both an edge match and a center match at distance 0.
    const dragged = makeDragged({ left: 100, top: 100, width: 50, height: 50 });
    const edgeCandidate = rect('b', 100, 200, 50, 50); // top edge match (distance 0)
    const centerCandidate = rect('a', 100, 100, 50, 50); // left AND cx AND top AND cy all match distance 0
    const guides = computeAlignmentGuides(dragged, [centerCandidate, edgeCandidate]);
    const edgeIdx = guides.findIndex((g) => g.targetBlockId === 'b' && g.kind === 'edge');
    const centerIdx = guides.findIndex((g) => g.targetBlockId === 'a' && g.kind === 'center');
    expect(edgeIdx).toBeLessThan(centerIdx);
    expect(edgeIdx).toBeGreaterThanOrEqual(0);
    expect(centerIdx).toBeGreaterThanOrEqual(0);
  });

  it('breaks final ties lexicographically by targetBlockId', () => {
    const dragged = makeDragged({ left: 100, top: 100, width: 50, height: 50 });
    const aEdge = rect('a', 100, 200, 50, 50);
    const bEdge = rect('b', 100, 200, 50, 50);
    const guides = computeAlignmentGuides(dragged, [bEdge, aEdge]);
    const aIdx = guides.findIndex((g) => g.targetBlockId === 'a');
    const bIdx = guides.findIndex((g) => g.targetBlockId === 'b');
    expect(aIdx).toBeLessThan(bIdx);
  });

  it('SNAP_THRESHOLD_PX default is 8 pixels and matches BlockRendererStateService SNAP_THRESHOLD', () => {
    expect(SNAP_THRESHOLD_PX).toBe(8);
  });
});

describe('collapseAlignmentGuides', () => {
  const g = (
    axis: SnapGuide['axis'],
    edge: SnapGuide['edge'],
    coordinate: number,
    distance: number,
    target = 't',
  ): SnapGuide => ({
    axis,
    coordinate,
    kind: edge === 'cx' || edge === 'cy' ? 'center' : 'edge',
    edge,
    targetBlockId: target,
    distance,
  });

  it('returns [] for empty input', () => {
    expect(collapseAlignmentGuides([])).toEqual([]);
  });

  it('preserves identity for a single guide', () => {
    const single = [g('x', 'left', 100, 5)];
    expect(collapseAlignmentGuides(single)).toEqual(single);
  });

  it('keeps only the FIRST occurrence per (axis, kind, edge) tuple', () => {
    // Three guides for the SAME x-edge-left key with different distances.
    // Engine sort order puts the smallest distance first — collapse
    // must preserve that ordering and drop the rest.
    const input = [
      g('x', 'left', 100, 2, 'a'),
      g('x', 'left', 100, 4, 'b'),
      g('x', 'left', 100, 6, 'c'),
    ];
    expect(collapseAlignmentGuides(input)).toEqual([input[0]]);
  });

  it('preserves guides with distinct (axis, kind, edge) tuples', () => {
    // Same X axis, but different edges (left / right) and a centre:
    // all three should be kept.
    const input = [
      g('x', 'left', 100, 2, 'a'),
      g('x', 'right', 200, 2, 'b'),
      g('x', 'cx', 150, 2, 'c'),
      g('y', 'top', 50, 2, 'd'),
      g('y', 'bottom', 100, 2, 'e'),
      g('y', 'cy', 75, 2, 'f'),
    ];
    expect(collapseAlignmentGuides(input)).toEqual(input);
  });

  it('deduplicates only the matching keys, preserves others in order', () => {
    const input = [
      g('x', 'left', 100, 2, 'a'), // unique x-edge-left
      g('x', 'left', 100, 4, 'b'), // dup x-edge-left → dropped
      g('y', 'top', 50, 2, 'c'), // unique y-edge-top
      g('x', 'left', 100, 6, 'd'), // dup x-edge-left → dropped
      g('x', 'cx', 150, 2, 'e'), // unique x-kind-center
    ];
    expect(collapseAlignmentGuides(input)).toEqual([
      input[0],
      input[2],
      input[4],
    ]);
  });

  it('treats cx (X center) and cy (Y center) as separate keys', () => {
    // Different axis, different edge — both survive.
    const input = [g('x', 'cx', 100, 2, 'a'), g('y', 'cy', 100, 2, 'b')];
    expect(collapseAlignmentGuides(input)).toEqual(input);
  });

  it('does NOT mutate input', () => {
    const input = [
      g('x', 'left', 100, 2, 'a'),
      g('x', 'left', 100, 4, 'b'),
    ];
    const snapshot = input.map((x) => ({ ...x }));
    collapseAlignmentGuides(input);
    expect(input).toEqual(snapshot);
  });
});

describe('overlayBlockToRect', () => {
  it('returns null when overlay flag is not true', () => {
    expect(
      overlayBlockToRect({
        blockId: 'a',
        settings: { overlay: false, imageWidth: 50, imageHeight: 50 },
      }),
    ).toBeNull();
    expect(
      overlayBlockToRect({
        blockId: 'a',
        settings: { overlay: undefined, imageWidth: 50, imageHeight: 50 },
      }),
    ).toBeNull();
  });

  it('returns null when settings are missing', () => {
    expect(overlayBlockToRect({ blockId: 'a', settings: null })).toBeNull();
    expect(overlayBlockToRect({ blockId: 'a' })).toBeNull();
  });

  it('returns null when dimensions are absent or non-positive', () => {
    expect(
      overlayBlockToRect({
        blockId: 'a',
        settings: { overlay: true, imageWidth: 0, imageHeight: 50 },
      }),
    ).toBeNull();
    expect(
      overlayBlockToRect({
        blockId: 'a',
        settings: { overlay: true, imageWidth: 50 as unknown },
      }),
    ).toBeNull();
    expect(
      overlayBlockToRect({
        blockId: 'a',
        settings: { overlay: true, imageWidth: 50, imageHeight: 50, overlayLeft: Number.NaN as unknown },
      }),
    ).toBeNull();
  });

  it('returns a Rect when overlay + positive dimensions + finite coordinates', () => {
    const r = overlayBlockToRect({
      blockId: 'x',
      settings: {
        overlay: true,
        overlayLeft: 10,
        overlayTop: 20,
        imageWidth: 100,
        imageHeight: 80,
      },
    });
    expect(r).toEqual({ blockId: 'x', left: 10, top: 20, width: 100, height: 80 });
  });

  it('defaults left/top to 0 when overlay has no explicit coordinates', () => {
    const r = overlayBlockToRect({
      blockId: 'x',
      settings: { overlay: true, imageWidth: 30, imageHeight: 40 },
    });
    expect(r).toEqual({ blockId: 'x', left: 0, top: 0, width: 30, height: 40 });
  });
});

describe('layoutBlockToRect (TZ-259.5)', () => {
  const layout = (overrides: Partial<BlockLayout> = {}): BlockLayout => ({
    page: 1,
    x: 0.1,
    y: 0.2,
    width: 0.5,
    height: 0.1,
    zIndex: 1,
    rotation: 0,
    ...overrides,
  });

  it('converts normalized layout to paper-relative px', () => {
    const r = layoutBlockToRect({ blockId: 'b', layout: layout() }, 720, 1018);
    expect(r!.blockId).toBe('b');
    expect(r!.left).toBeCloseTo(72, 5);
    expect(r!.top).toBeCloseTo(203.6, 5);
    expect(r!.width).toBeCloseTo(360, 5);
    expect(r!.height).toBeCloseTo(101.8, 5);
  });

  it('defaults missing height to 0.06', () => {
    const l = layout({ height: undefined });
    const r = layoutBlockToRect({ blockId: 'b', layout: l }, 720, 1018);
    expect(r!.height).toBeCloseTo(0.06 * 1018, 5);
  });

  it('returns null for missing layout or non-positive paper dims', () => {
    expect(layoutBlockToRect({ blockId: 'b', layout: null }, 720, 1018)).toBeNull();
    expect(layoutBlockToRect({ blockId: 'b', layout: undefined }, 720, 1018)).toBeNull();
    expect(layoutBlockToRect({ blockId: 'b', layout: layout() }, 0, 1018)).toBeNull();
  });
});

describe('computeLayoutResize (TZ-259.4)', () => {
  const base: BlockLayout = {
    page: 1,
    x: 0.2,
    y: 0.2,
    width: 0.4,
    height: 0.2,
    zIndex: 1,
    rotation: 0,
  };

  it('east handle grows width without moving x', () => {
    const next = computeLayoutResize(base, 'e', { dx: 72, dy: 0 }, 720, 1000);
    expect(next.x).toBeCloseTo(0.2, 5);
    expect(next.width).toBeCloseTo(0.5, 5);
  });

  it('west handle moves x and shrinks width to keep right edge', () => {
    const next = computeLayoutResize(base, 'w', { dx: 72, dy: 0 }, 720, 1000);
    expect(next.x).toBeCloseTo(0.3, 5);
    expect(next.x + next.width).toBeCloseTo(0.6, 5);
  });

  it('south handle grows height without moving y', () => {
    const next = computeLayoutResize(base, 's', { dx: 0, dy: 50 }, 720, 1000);
    expect(next.y).toBeCloseTo(0.2, 5);
    expect(next.height).toBeCloseTo(0.25, 5);
  });

  it('north handle moves y and shrinks height to keep bottom edge', () => {
    const next = computeLayoutResize(base, 'n', { dx: 0, dy: -50 }, 720, 1000);
    expect(next.y).toBeCloseTo(0.15, 5);
    expect(next.y + next.height).toBeCloseTo(0.4, 5);
  });

  it('corner handles resize both axes', () => {
    const next = computeLayoutResize(base, 'se', { dx: 72, dy: 50 }, 720, 1000);
    expect(next.width).toBeCloseTo(0.5, 5);
    expect(next.height).toBeCloseTo(0.25, 5);
  });

  it('clamps to min width/height px', () => {
    const tiny = computeLayoutResize(base, 'w', { dx: 720, dy: 0 }, 720, 1000, 20);
    expect(tiny.width * 720).toBeGreaterThanOrEqual(19.9);
    const short = computeLayoutResize(base, 'n', { dx: 0, dy: -1000 }, 720, 1000, 20);
    expect(short.height * 1000).toBeGreaterThanOrEqual(19.9);
  });

  it('never lets the block leave the page bounds', () => {
    const far = computeLayoutResize(base, 'nw', { dx: -2000, dy: -2000 }, 720, 1000);
    expect(far.x).toBeGreaterThanOrEqual(0);
    expect(far.y).toBeGreaterThanOrEqual(0);
    const huge = computeLayoutResize(base, 'se', { dx: 2000, dy: 2000 }, 720, 1000);
    expect(huge.x + huge.width).toBeLessThanOrEqual(1.0001);
    expect(huge.y + huge.height).toBeLessThanOrEqual(1.0001);
  });
});

describe('computeAlignLayouts (TZ-259.6)', () => {
  const entry = (blockId: string, layout: Partial<BlockLayout> = {}) => ({
    blockId,
    layout: {
      page: 1,
      x: 0,
      y: 0,
      width: 0.1,
      height: 0.1,
      zIndex: 1,
      rotation: 0,
      ...layout,
    },
  });

  it('returns empty for empty input', () => {
    expect(computeAlignLayouts([], 'left')).toEqual([]);
  });

  it('aligns left edges to the minimum x', () => {
    const out = computeAlignLayouts(
      [entry('a', { x: 0.3 }), entry('b', { x: 0.1 }), entry('c', { x: 0.5 })],
      'left',
    );
    expect(out.map((e) => e.layout.x)).toEqual([0.1, 0.1, 0.1]);
  });

  it('aligns right edges to the maximum right', () => {
    // max(x + width): a → 0.3 + 0.1 = 0.4; b → 0.1 + 0.2 = 0.3 ⇒ target 0.4.
    const out = computeAlignLayouts(
      [entry('a', { x: 0.3 }), entry('b', { x: 0.1, width: 0.2 })],
      'right',
    );
    expect(out[0].layout.x + out[0].layout.width).toBeCloseTo(0.4, 5);
    expect(out[1].layout.x + out[1].layout.width).toBeCloseTo(0.4, 5);
  });

  it('center-x aligns horizontal centers', () => {
    const out = computeAlignLayouts(
      [entry('a', { x: 0.2, width: 0.2 }), entry('b', { x: 0.5, width: 0.1 })],
      'center-x',
    );
    const ca = out[0].layout.x + out[0].layout.width / 2;
    const cb = out[1].layout.x + out[1].layout.width / 2;
    expect(ca).toBeCloseTo(cb, 5);
  });

  it('top aligns y to the minimum', () => {
    const out = computeAlignLayouts(
      [entry('a', { y: 0.3 }), entry('b', { y: 0.05 })],
      'top',
    );
    expect(out.map((e) => e.layout.y)).toEqual([0.05, 0.05]);
  });

  it('same-width sets every block to the widest', () => {
    const out = computeAlignLayouts(
      [entry('a', { width: 0.2 }), entry('b', { width: 0.4 }), entry('c', { width: 0.1 })],
      'same-width',
    );
    expect(out.map((e) => e.layout.width)).toEqual([0.4, 0.4, 0.4]);
  });

  it('distribute-h spreads left edges evenly across the span', () => {
    // Span is [min x, max (x+width)] = [0, 0.6]; with n=3 the gap is 0.3,
    // so left edges land at 0 / 0.3 / 0.6 (blocks keep their own widths).
    const out = computeAlignLayouts(
      [entry('a', { x: 0.0 }), entry('b', { x: 0.25 }), entry('c', { x: 0.5 })],
      'distribute-h',
    );
    expect(out[0].layout.x).toBeCloseTo(0.0, 5);
    expect(out[1].layout.x).toBeCloseTo(0.3, 5);
    expect(out[2].layout.x).toBeCloseTo(0.6, 5);
  });

  it('preserves order and identity of input entries', () => {
    const out = computeAlignLayouts(
      [entry('z', { x: 0.5 }), entry('a', { x: 0.1 })],
      'left',
    );
    expect(out.map((e) => e.blockId)).toEqual(['z', 'a']);
    expect(out[0].layout.x).toBeCloseTo(0.1, 5);
  });
});
