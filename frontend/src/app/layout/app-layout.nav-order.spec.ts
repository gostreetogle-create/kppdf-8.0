import { NAV_CATEGORY_ORDER } from './app-layout.component';

/**
 * TZ-NAV-301 — lifecycle menu order (L→R) must match audit canon.
 */
describe('NAV_CATEGORY_ORDER (TZ-NAV-301)', () => {
  it('lists top categories left→right as lifecycle flow', () => {
    expect([...NAV_CATEGORY_ORDER]).toEqual([
      'reference',
      'catalog',
      'clients',
      'deals',
      'design',
      'supply',
      'production',
      'warehouse',
      'docs',
      'admin',
    ]);
  });
});
