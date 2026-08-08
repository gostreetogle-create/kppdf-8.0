import {
  NAV_CATEGORY_LABELS,
  NAV_CATEGORY_ORDER,
  NAV_CATEGORY_SHORT_LABELS,
} from './app-layout.component';

/**
 * TZ-UX-304 — L→R order = product cycle + frequency; Dictionaries after Docs.
 * TZ-UX-307 — shortLabel under icon; full RU in NAV_CATEGORY_LABELS (aria/title).
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
