import { DEALS_TOC_CHIPS, KP_SECTION_CHIPS } from './deals-group-chips';

describe('Deals workspace chips (TZ-SALES-329)', () => {
  it('keeps the three lifecycle surfaces in the dark TOC', () => {
    expect(DEALS_TOC_CHIPS.map((chip) => [chip.id, chip.route])).toEqual([
      ['proposals', '/proposals/create'],
      ['contracts', '/contracts'],
      ['orders', '/orders'],
    ]);
  });

  it('limits yellow subchips to proposal actions', () => {
    expect(KP_SECTION_CHIPS.map((chip) => [chip.id, chip.label, chip.route])).toEqual([
      ['create', 'Создать КП', '/proposals/create'],
      ['all', 'Все КП', '/proposals'],
    ]);
    expect(KP_SECTION_CHIPS.every((chip) => chip.pageKey === 'proposals')).toBe(true);
  });
});
