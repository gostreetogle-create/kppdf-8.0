import { NAV_CATEGORY_LABELS, NAV_CATEGORY_ORDER } from './app-layout.component';

/**
 * TZ-UX-304 — L→R order = product cycle + frequency; Dictionaries after Docs.
 * TZ-UX-305 — full RU captions (no «Проект.» shortLabel).
 */
describe('NAV_CATEGORY_ORDER (TZ-UX-304/305)', () => {
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

  it('uses full RU labels without abbreviated shortLabel forms', () => {
    expect([...NAV_CATEGORY_LABELS]).toEqual([
      'Каталог',
      'Клиенты',
      'Сделки',
      'Проектирование',
      'Снабжение',
      'Производство',
      'Склад',
      'Документы',
      'Справочники',
      'Админ',
    ]);
    for (const label of NAV_CATEGORY_LABELS) {
      expect(label.endsWith('.')).toBe(false);
    }
  });
});
