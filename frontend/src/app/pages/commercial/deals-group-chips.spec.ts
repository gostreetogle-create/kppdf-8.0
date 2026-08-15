import { DEALS_TOC_CHIPS, KP_SECTION_CHIPS } from './deals-group-chips';

describe('Deals workspace chips (TZ-SALES-329)', () => {
  it('keeps the lifecycle surfaces in the dark TOC, Комбайн first (TZ-SWEEP-401)', () => {
    expect(DEALS_TOC_CHIPS.map((chip) => [chip.id, chip.route])).toEqual([
      ['dashboard', '/dashboard'],
      ['proposals', '/proposals/create'],
      ['contracts', '/contracts'],
      ['orders', '/orders'],
    ]);
  });

  it('Комбайн chip is labelled «Комбайн», not «Дашборд», with orders grant', () => {
    const [first] = DEALS_TOC_CHIPS;
    expect(first).toMatchObject({
      id: 'dashboard',
      label: 'Комбайн',
      route: '/dashboard',
      pageKey: 'orders',
    });
  });

  it('limits yellow subchips to proposal actions', () => {
    expect(KP_SECTION_CHIPS.map((chip) => [chip.id, chip.label, chip.route])).toEqual([
      ['create', 'Создать КП', '/proposals/create'],
      ['all', 'Все КП', '/proposals'],
    ]);
    expect(KP_SECTION_CHIPS.every((chip) => chip.pageKey === 'proposals')).toBe(true);
  });
});
