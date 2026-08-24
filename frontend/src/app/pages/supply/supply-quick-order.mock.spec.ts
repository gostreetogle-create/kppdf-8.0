import { categoryPickerLabel } from './supply-quick-order.mock';

describe('categoryPickerLabel (CATALOG-376/377)', () => {
  it('shows RU name when fullPath is legacy slug', () => {
    expect(categoryPickerLabel({ name: 'Металлы', fullPath: 'metals' })).toBe('Металлы');
    expect(categoryPickerLabel({ name: 'Комплектующие', fullPath: 'components' })).toBe(
      'Комплектующие',
    );
  });

  it('shows hierarchical name path when fullPath has display segments', () => {
    expect(categoryPickerLabel({ name: 'Лист', fullPath: 'Металлы/Лист' })).toBe('Металлы › Лист');
  });

  it('falls back to name when fullPath missing', () => {
    expect(categoryPickerLabel({ name: 'Прочее' })).toBe('Прочее');
  });
});
