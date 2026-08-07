import { catalogKindHue, catalogKindOklch, catalogKindWash } from './catalog-kind-oklch';

describe('catalogKindOklch (TZ-CATALOG-330)', () => {
  it('maps product / module / material to distinct default hues', () => {
    expect(catalogKindHue('product')).toBe(45);
    expect(catalogKindHue('module')).toBe(230);
    expect(catalogKindHue('material')).toBe(145);
    expect(catalogKindHue('material', 'raw')).toBe(95);
    expect(catalogKindHue('material', 'part')).toBe(145);
  });

  it('returns oklch fills and washes', () => {
    expect(catalogKindOklch('product')).toMatch(/^oklch\(/);
    expect(catalogKindWash('module')).toContain('/ 0.14)');
    expect(catalogKindOklch('product')).not.toEqual(catalogKindOklch('module'));
  });
});
