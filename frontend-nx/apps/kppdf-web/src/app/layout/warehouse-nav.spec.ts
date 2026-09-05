import { NAV_CATEGORIES, filterNavCategories } from './nav-categories';

describe('W1 warehouse navigation', () => {
  it('exposes only named warehouses, balances, and movements without dashboard', () => {
    const warehouse = NAV_CATEGORIES.find((category) => category.id === 'warehouse');
    expect(warehouse?.entryPath).toBe('/warehouses');
    expect(warehouse?.items.map((item) => item.path)).toEqual([
      '/warehouses',
      '/storage-items',
      '/stock-movements',
    ]);
    expect(warehouse?.items.map((item) => item.label)).toEqual(['Склады', 'Остатки', 'Движения']);
  });

  it('keeps the three warehouse links when routes and page ACL are available', () => {
    const existing = new Set(['/warehouses', '/storage-items', '/stock-movements']);
    const result = filterNavCategories(NAV_CATEGORIES, existing, undefined, () => true, 'manager');
    const warehouse = result.find((category) => category.id === 'warehouse');
    expect(warehouse?.items.map((item) => item.path)).toEqual([
      '/warehouses',
      '/storage-items',
      '/stock-movements',
    ]);
  });
});
