import {
  matchActiveCategoryId,
  NAV_CATEGORY_LABELS,
  NAV_CATEGORY_ORDER,
  NAV_CATEGORY_SHORT_LABELS,
} from './app-layout.component';

/**
 * TZ-UX-304 — L→R order = product cycle + frequency; Dictionaries after Docs.
 * TZ-UX-307 — shortLabel under icon; full RU in NAV_CATEGORY_LABELS (aria/title).
 * TZ-UX-308 — /categories → reference active (classification redirect canon).
 * TZ-NAV-302 — /people → clients; /work-types → production (Цех).
 */
describe('NAV_CATEGORY_ORDER (TZ-UX-304/307)', () => {
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

  it('uses shortLabel captions and full RU labels for aria/title', () => {
    expect([...NAV_CATEGORY_SHORT_LABELS]).toEqual([
      'Каталог',
      'Клиенты',
      'Сделки',
      'Проект',
      'Снабж.',
      'Цех',
      'Склад',
      'Докум.',
      'Справ.',
      'Админ',
    ]);
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
      'Администрирование',
    ]);
  });
});

describe('matchActiveCategoryId (TZ-UX-308)', () => {
  it('highlights reference on /categories and classification alias', () => {
    expect(matchActiveCategoryId('/categories')).toBe('reference');
    expect(matchActiveCategoryId('/dictionaries/classification')).toBe('reference');
    expect(matchActiveCategoryId('/doc-template-categories')).toBe('reference');
  });

  it('does not mark reference active on other sections', () => {
    expect(matchActiveCategoryId('/products')).toBe('catalog');
    expect(matchActiveCategoryId('/products/abc')).toBe('catalog');
  });
});

describe('matchActiveCategoryId (TZ-NAV-302)', () => {
  it('highlights clients on /people and /counterparties', () => {
    expect(matchActiveCategoryId('/people')).toBe('clients');
    expect(matchActiveCategoryId('/counterparties')).toBe('clients');
  });

  it('highlights production (Цех) on /work-types and /production', () => {
    expect(matchActiveCategoryId('/work-types')).toBe('production');
    expect(matchActiveCategoryId('/production')).toBe('production');
  });

  it('does not put work-types under catalog', () => {
    expect(matchActiveCategoryId('/work-types')).not.toBe('catalog');
    expect(matchActiveCategoryId('/products')).toBe('catalog');
  });
});
