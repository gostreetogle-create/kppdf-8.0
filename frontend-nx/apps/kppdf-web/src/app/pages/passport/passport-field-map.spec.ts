import { PASSPORT_FIELD_MAP_KEYS, PRODUCT_PASSPORT_FIELD_MAP } from './passport-field-map';

describe('passport-field-map (TZ-NX-PASSPORT-DISCOVERY-IMPLEMENTATION)', () => {
  it('covers all pasports sheet columns from Pasports.xlsx', () => {
    const pasportsLabels = [
      'Паспорт№',
      'Дата',
      'Гарантийный Талон',
      'Номер Изделия',
      'Фото',
      'Категория',
      'наименование',
      'Артикул',
      'Высота',
      'Длинна',
      'Ширина',
      'Вес',
      'описание',
      'Объект',
      'Поставщик',
    ];
    for (const label of pasportsLabels) {
      expect(PRODUCT_PASSPORT_FIELD_MAP.some((f) => f.label === label)).toBe(true);
    }
  });

  it('documents snapshot-only blockers for fields absent on live Product', () => {
    const snapshotOnly = PRODUCT_PASSPORT_FIELD_MAP.filter((f) => f.source === 'snapshot-only');
    expect(snapshotOnly.map((f) => f.key)).toEqual(
      expect.arrayContaining(['passportNumber', 'passportDate', 'warrantyCode', 'productNumber', 'supplier']),
    );
    for (const field of snapshotOnly) {
      expect(field.blockerNote).toBeTruthy();
    }
  });

  it('has unique keys', () => {
    expect(PASSPORT_FIELD_MAP_KEYS.size).toBe(PRODUCT_PASSPORT_FIELD_MAP.length);
  });
});
