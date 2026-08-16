import { DEALS_TOC_CHIPS, KP_SECTION_CHIPS } from './deals-group-chips';

describe('Deals workspace chips (TZ-SALES-329 / TZ-NAV-303)', () => {
  it('keeps the lifecycle surfaces in the dark TOC (Комбайн moved to Проект)', () => {
    expect(DEALS_TOC_CHIPS.map((chip) => [chip.id, chip.route])).toEqual([
      ['proposals', '/proposals/create'],
      ['contracts', '/contracts'],
      ['orders', '/orders'],
    ]);
  });

  it('no Комбайн chip in Deals TOC — it lives at /design/combine under Проект', () => {
    expect(DEALS_TOC_CHIPS.some((chip) => chip.label === 'Комбайн')).toBe(false);
    expect(DEALS_TOC_CHIPS.some((chip) => chip.route === '/dashboard')).toBe(false);
  });

  it('limits yellow subchips to proposal actions', () => {
    expect(KP_SECTION_CHIPS.map((chip) => [chip.id, chip.label, chip.route])).toEqual([
      ['create', 'Создать КП', '/proposals/create'],
      ['all', 'Все КП', '/proposals'],
    ]);
    expect(KP_SECTION_CHIPS.every((chip) => chip.pageKey === 'proposals')).toBe(true);
  });
});
