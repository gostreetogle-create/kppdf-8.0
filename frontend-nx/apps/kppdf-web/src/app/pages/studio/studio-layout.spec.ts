import {
  clampStudioLayoutPosition,
  coerceStudioBlockLayout,
  normalizeStudioBlockLayout,
  snapStudioLayoutToPageEdges,
  studioCenteredTextLayout,
  studioImageLayoutAspectRatio,
  studioImageLayoutFromNaturalSize,
  studioImageResizeAspectRatio,
  studioProportionalImageResize,
  studioStaggerImageLayout,
  zIndexFromLayerOrder,
} from './studio-layout';
import type { StudioBlock } from '@kppdf/data-access';

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

  it('computes aspect-correct image layout at ~60% page width', () => {
    const layout = studioImageLayoutFromNaturalSize(1600, 900, 3, 1);
    expect(layout.width).toBeCloseTo(0.6, 3);
    expect(layout.height).toBeCloseTo(0.6 * (210 / 297) / (1600 / 900), 3);
    expect(layout.x).toBeCloseTo(0.5 - layout.width / 2, 3);
    expect(layout.zIndex).toBe(3);
  });

  it('derives layout-space aspect ratio from natural dimensions', () => {
    const block: StudioBlock = {
      _id: 'img',
      type: 'image',
      order: 0,
      title: 'Photo',
      content: '',
      layout: { page: 1, x: 0.2, y: 0.2, width: 0.5, height: 0.3, zIndex: 1, rotation: 0 },
      settings: { naturalWidth: 800, naturalHeight: 600 },
    };
    expect(studioImageLayoutAspectRatio(block)).toBeCloseTo((210 / 297) * (600 / 800), 4);
  });

  it('resizes image proportionally from width delta', () => {
    const start = { page: 1, x: 0.1, y: 0.1, width: 0.4, height: 0.28, zIndex: 1, rotation: 0 };
    const aspect = studioImageResizeAspectRatio(start);
    const next = studioProportionalImageResize(start, 0.1, aspect);
    expect(next.width).toBeCloseTo(0.5, 3);
    expect(next.height).toBeCloseTo(0.5 * aspect, 3);
  });

  it('does not jump at resize start when natural aspect differs from layout', () => {
    const start = { page: 1, x: 0.1, y: 0.1, width: 0.5, height: 0.35, zIndex: 1, rotation: 0 };
    const onScreenAspect = studioImageResizeAspectRatio(start);
    const naturalAspect = (210 / 297) * (600 / 800);
    expect(onScreenAspect).not.toBeCloseTo(naturalAspect, 2);
    const next = studioProportionalImageResize(start, 0, onScreenAspect);
    expect(next.width).toBeCloseTo(0.5, 5);
    expect(next.height).toBeCloseTo(0.35, 5);
  });

  it('staggers repeated image inserts on the same page', () => {
    const base = studioImageLayoutFromNaturalSize(1200, 800, 2, 1);
    const shifted = studioStaggerImageLayout(base, 2);
    expect(shifted.x).toBeGreaterThan(base.x);
    expect(shifted.y).toBeGreaterThan(base.y);
  });
});
