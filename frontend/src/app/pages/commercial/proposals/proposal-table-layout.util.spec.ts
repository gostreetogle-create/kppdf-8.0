import {
  isPhotoColumnKey,
  normalizeTableLayoutColumnKey,
  normalizeTableLayoutColumns,
} from './proposal-table-layout.util';

describe('proposal-table-layout.util', () => {
  it('treats catalog photoIds as canonical photo key', () => {
    expect(normalizeTableLayoutColumnKey('photoIds')).toBe('photo');
    expect(isPhotoColumnKey('photoIds')).toBe(true);
  });

  it('dedupes photoIds + injected photo into one column', () => {
    const layout = normalizeTableLayoutColumns([
      { key: 'sku', label: 'Артикул', visible: true },
      { key: 'photoIds', label: 'Фото', visible: true },
      { key: 'photo', label: 'Фото', visible: true },
      { key: 'name', label: 'Наименование', visible: true },
    ]);

    expect(layout.filter((column) => isPhotoColumnKey(column.key))).toHaveLength(1);
    expect(layout[1]).toEqual({ key: 'photo', label: 'Фото', visible: true });
  });
});
