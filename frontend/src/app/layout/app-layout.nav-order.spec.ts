import { NAV_CATEGORY_ORDER } from './app-layout.component';

/**
 * TZ-UX-304 — L→R order = product cycle + frequency; Dictionaries after Docs.
 */
describe('NAV_CATEGORY_ORDER (TZ-UX-304)', () => {
  it('lists top categories left→right as lifecycle / usage flow', () => {
    expect([...NAV_CATEGORY_ORDER]).toEqual([
      'catalog',
      'clients',
      'deals',
      'design',
      'supply',
      'production',
      'warehouse',
      'docs',
      'reference',
      'admin',
    ]);
  });
});
