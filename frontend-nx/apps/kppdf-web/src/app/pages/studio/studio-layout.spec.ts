import {
  clampStudioLayoutPosition,
  coerceStudioBlockLayout,
  normalizeStudioBlockLayout,
  snapStudioLayoutToPageEdges,
  studioCenteredTextLayout,
  zIndexFromLayerOrder,
} from './studio-layout';

describe('studio layout helpers', () => {
  it('clamps position inside page bounds (fractions)', () => {
    expect(clampStudioLayoutPosition(-0.05, 0.9, 0.3, 0.12)).toEqual({ x: 0, y: 0.88 });
  });

  it('snaps left/top edges to page origin within threshold', () => {
    const sheet = { w: 800, h: 900 };
    const tx = 8 / sheet.w;
    const ty = 8 / sheet.h;
    expect(snapStudioLayoutToPageEdges(tx * 0.5, ty * 0.5, 0.3, 0.12, sheet.w, sheet.h)).toEqual({
      x: 0,
      y: 0,
    });
  });

  it('snaps right/bottom edges to page bounds within threshold', () => {
    const sheet = { w: 800, h: 900 };
    const tx = 8 / sheet.w;
    const ty = 8 / sheet.h;
    expect(
      snapStudioLayoutToPageEdges(1 - 0.3 - tx * 0.5, 1 - 0.12 - ty * 0.5, 0.3, 0.12, sheet.w, sheet.h),
    ).toEqual({ x: 0.7, y: 0.88 });
  });

  it('centers default text block', () => {
    expect(studioCenteredTextLayout(0.3, 0.12, 2)).toEqual({
      page: 1,
      x: 0.35,
      y: 0.44,
      width: 0.3,
      height: 0.12,
      zIndex: 2,
      rotation: 0,
    });
  });

  it('coerces mistaken percent values', () => {
    expect(
      coerceStudioBlockLayout({
        page: 1,
        x: 35,
        y: 44,
        width: 30,
        height: 12,
        zIndex: 1,
        rotation: 0,
      }),
    ).toEqual({
      page: 1,
      x: 0.35,
      y: 0.44,
      width: 0.3,
      height: 0.12,
      zIndex: 1,
      rotation: 0,
    });
  });

  it('maps layer order to z-index', () => {
    const map = zIndexFromLayerOrder(['a', 'b', 'c']);
    expect(map.get('a')).toBe(2);
    expect(map.get('b')).toBe(1);
    expect(map.get('c')).toBe(0);
  });
});
