/**
 * Unit tests for `snap-engine.ts` — pure geometry helpers driving the
 * Document Constructor magnetic grid + alignment guides (TZ-237.MAGNETIC-GRID-r0).
 *
 * No TestBed. No Angular DI. No DOM. Just deterministic math.
 */
import {
  applySnapToGrid,
  computeAlignmentGuides,
  overlayBlockToRect,
  snapValueToGrid,
  SNAP_THRESHOLD_PX,
  type Rect,
} from './snap-engine';

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
