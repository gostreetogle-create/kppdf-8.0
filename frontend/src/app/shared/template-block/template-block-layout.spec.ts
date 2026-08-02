import {
  clampLayoutDelta,
  computeLayerOrder,
  defaultBlockLayout,
  legacyOverlayToLayout,
  normalizeBlockLayout,
} from './template-block-layout';

describe('template-block-layout', () => {
  it('clamps normalized layout to the page bounds', () => {
    expect(
      normalizeBlockLayout({ page: 0.5, x: 0.9, y: 0.95, width: 0.4, height: 0.2, zIndex: -2 }),
    ).toEqual({
      page: 1,
      x: 0.6,
      y: 0.8,
      width: 0.4,
      height: 0.2,
      zIndex: 0,
      rotation: 0,
    });
  });

  it('converts legacy overlay pixels to normalized geometry', () => {
    expect(
      legacyOverlayToLayout(
        { overlay: true, overlayLeft: 100, overlayTop: 50, imageWidth: 200, imageHeight: 100 },
        1000,
        1000,
      ),
    ).toEqual({
      page: 1,
      x: 0.1,
      y: 0.05,
      width: 0.2,
      height: 0.1,
      zIndex: 20,
      rotation: 0,
    });
  });

  it('does not migrate non-overlay blocks', () => {
    expect(legacyOverlayToLayout({ overlay: false }, 1000, 1000)).toBeNull();
    expect(legacyOverlayToLayout(undefined, 1000, 1000)).toBeNull();
  });

  it('clamps one delta against the selected group bounds', () => {
    const result = clampLayoutDelta(
      [
        { page: 1, x: 0.1, y: 0.2, width: 0.2, height: 0.2, zIndex: 1, rotation: 0 },
        { page: 1, x: 0.6, y: 0.4, width: 0.3, height: 0.2, zIndex: 1, rotation: 0 },
      ],
      0.5,
      -0.5,
    );
    expect(result.dx).toBeCloseTo(0.1, 10);
    expect(result.dy).toBeCloseTo(-0.2, 10);
  });

  it('keeps the normalized renderer contract on one page', () => {
    expect(normalizeBlockLayout({ page: 4 }).page).toBe(1);
  });

  it('keeps unsupported pages visible to the DTO/service boundary', () => {
    expect(normalizeBlockLayout({ page: 2 }).page).toBe(1);
  });

  it('creates deterministic placement for new blocks', () => {
    expect(defaultBlockLayout(0)).toEqual({
      page: 1,
      x: 0.08,
      y: 0.04,
      width: 0.84,
      height: 0.06,
      zIndex: 1,
      rotation: 0,
    });
  });
});

describe('computeLayerOrder (TZ-DOC-271)', () => {
  const stack = () => [
    { blockId: 'a', zIndex: 0 },
    { blockId: 'b', zIndex: 1 },
    { blockId: 'c', zIndex: 2 },
    { blockId: 'd', zIndex: 3 },
  ];

  it('moves a single block to the front preserving others', () => {
    const result = computeLayerOrder(stack(), new Set(['b']), 'front');
    expect([...result.values()]).toEqual([0, 1, 2, 3]);
    expect(result.get('a')).toBe(0);
    expect(result.get('c')).toBe(1);
    expect(result.get('d')).toBe(2);
    expect(result.get('b')).toBe(3);
  });

  it('moves a single block to the back preserving others', () => {
    const result = computeLayerOrder(stack(), new Set(['c']), 'back');
    expect(result.get('c')).toBe(0);
    expect(result.get('a')).toBe(1);
    expect(result.get('b')).toBe(2);
    expect(result.get('d')).toBe(3);
  });

  it('raises a block one step (swap with the next unselected)', () => {
    const result = computeLayerOrder(stack(), new Set(['b']), 'raise');
    expect(result.get('b')).toBe(2);
    expect(result.get('c')).toBe(1);
    expect(result.get('a')).toBe(0);
    expect(result.get('d')).toBe(3);
  });

  it('lowers a block one step (swap with the previous unselected)', () => {
    const result = computeLayerOrder(stack(), new Set(['c']), 'lower');
    expect(result.get('c')).toBe(1);
    expect(result.get('b')).toBe(2);
    expect(result.get('a')).toBe(0);
    expect(result.get('d')).toBe(3);
  });

  it('raise at the top is a no-op', () => {
    const result = computeLayerOrder(stack(), new Set(['d']), 'raise');
    expect([...result.values()]).toEqual([0, 1, 2, 3]);
  });

  it('lower at the bottom is a no-op', () => {
    const result = computeLayerOrder(stack(), new Set(['a']), 'lower');
    expect([...result.values()]).toEqual([0, 1, 2, 3]);
  });

  it('moves a multi-selection to the front as a unit preserving internal order', () => {
    const result = computeLayerOrder(stack(), new Set(['a', 'c']), 'front');
    expect(result.get('b')).toBe(0);
    expect(result.get('d')).toBe(1);
    expect(result.get('a')).toBe(2);
    expect(result.get('c')).toBe(3);
  });

  it('moves a multi-selection to the back as a unit preserving internal order', () => {
    const result = computeLayerOrder(stack(), new Set(['b', 'd']), 'back');
    expect(result.get('b')).toBe(0);
    expect(result.get('d')).toBe(1);
    expect(result.get('a')).toBe(2);
    expect(result.get('c')).toBe(3);
  });

  it('raises a selected group as a unit by one slot, preserving internal order', () => {
    const result = computeLayerOrder(stack(), new Set(['a', 'b']), 'raise');
    // [a,b] rise one slot past c → [c, a, b, d]; internal order kept.
    expect(result.get('c')).toBe(0);
    expect(result.get('a')).toBe(1);
    expect(result.get('b')).toBe(2);
    expect(result.get('d')).toBe(3);
  });

  it('lowers a selected group as a unit by one slot, preserving internal order', () => {
    const result = computeLayerOrder(stack(), new Set(['c', 'd']), 'lower');
    // [c,d] sink one slot below b → [a, c, d, b]; internal order kept.
    expect(result.get('a')).toBe(0);
    expect(result.get('c')).toBe(1);
    expect(result.get('d')).toBe(2);
    expect(result.get('b')).toBe(3);
  });

  it('produces a compact 0..n-1 reindex (no gaps, no negatives)', () => {
    const result = computeLayerOrder(stack(), new Set(['a']), 'back');
    const values = [...result.values()].sort((x, y) => x - y);
    expect(values).toEqual([0, 1, 2, 3]);
  });

  it('is deterministic for identical inputs', () => {
    const a = computeLayerOrder(stack(), new Set(['b', 'c']), 'front');
    const b = computeLayerOrder(stack(), new Set(['b', 'c']), 'front');
    expect([...a.entries()]).toEqual([...b.entries()]);
  });

  it('returns an empty map for empty targets or empty entries', () => {
    expect(computeLayerOrder(stack(), new Set(), 'front').size).toBe(0);
    expect(computeLayerOrder([], new Set(['a']), 'front').size).toBe(0);
  });

  it('does not mutate the input entries', () => {
    const input = stack();
    computeLayerOrder(input, new Set(['b']), 'front');
    expect(input.map((e) => e.zIndex)).toEqual([0, 1, 2, 3]);
  });
});
