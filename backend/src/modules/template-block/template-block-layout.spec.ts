import {
  clampLayoutDelta,
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
