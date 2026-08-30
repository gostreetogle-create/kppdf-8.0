import { studioSheetRect } from './studio-geometry';

describe('studioSheetRect', () => {
  it('keeps landscape at A4 ratio', () => {
    const rect = studioSheetRect(1200, 800, 'landscape');
    expect(rect.width / rect.height).toBeCloseTo(297 / 210, 3);
  });

  it('keeps portrait at A4 ratio', () => {
    const rect = studioSheetRect(1200, 800, 'portrait');
    expect(rect.width / rect.height).toBeCloseTo(210 / 297, 3);
  });

  it('landscape fits a short stage by height (first limiting side)', () => {
    // Legacy DOCPLAT-01 forced width and let the sheet overflow the stage height.
    const rect = studioSheetRect(1200, 500, 'landscape');
    expect(rect.height).toBeLessThanOrEqual(500 - 8);
    expect(rect.width / rect.height).toBeCloseTo(297 / 210, 3);
  });

  it('portrait fits a narrow stage by width (first limiting side)', () => {
    const rect = studioSheetRect(300, 800, 'portrait');
    expect(rect.width).toBeLessThanOrEqual(300 - 8);
    expect(rect.width / rect.height).toBeCloseTo(210 / 297, 3);
  });

  it('does not exceed the stage in either axis', () => {
    for (const orientation of ['portrait', 'landscape'] as const) {
      const rect = studioSheetRect(1200, 800, orientation);
      expect(rect.width).toBeLessThanOrEqual(1200 - 8);
      expect(rect.height).toBeLessThanOrEqual(800 - 8);
    }
  });
});