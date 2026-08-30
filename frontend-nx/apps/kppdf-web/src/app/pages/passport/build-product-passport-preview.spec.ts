import type { CompositionTreeNode, ProductDetail } from '@kppdf/data-access';
import { buildCompositionSummary, buildProductPassportPreview } from './build-product-passport-preview';
import { PASSPORT_FIELD_MAP_KEYS, PASSPORT_NOT_SPECIFIED, PRODUCT_PASSPORT_FIELD_MAP } from './passport-field-map';

const PRODUCT: ProductDetail = {
  _id: 'p1',
  name: 'Скамья парковая',
  sku: 'BENCH-1',
  kind: 'good',
  unit: 'pcs',
  weightKg: 81.7,
  ralCode: 'ral-7016',
  purpose: 'организации зон отдыха',
  installation: 'на открытом воздухе',
  dimensions: { height: 865, length: 1498, width: 590, unit: 'мм' },
  categoryId: { _id: 'c1', name: 'Благоустройство' },
  photoIds: ['ph1'],
};

const TREE: CompositionTreeNode = {
  _id: 'p1',
  name: 'Скамья',
  kind: 'product',
  quantity: 1,
  children: [
    {
      _id: 'm1',
      name: 'Каркас',
      kind: 'module',
      lineType: 'module',
      quantity: 1,
      unit: 'шт',
      children: [
        {
          _id: 'mat1',
          name: 'Лист 3 мм',
          kind: 'material',
          lineType: 'material',
          materialKind: 'raw',
          quantity: 2,
          unit: 'шт',
          children: [],
        },
      ],
    },
    {
      _id: 'mat2',
      name: 'Доска 40×40',
      kind: 'material',
      lineType: 'material',
      materialKind: 'raw',
      quantity: 4,
      unit: 'шт',
      children: [],
    },
  ],
};

describe('buildProductPassportPreview (TZ-NX-PASSPORT-DISCOVERY-IMPLEMENTATION)', () => {
  it('maps live product fields from XLSX field map', () => {
    const preview = buildProductPassportPreview({
      product: PRODUCT,
      tree: TREE,
      unitLabel: 'Штука',
    });
    const byKey = Object.fromEntries(preview.fields.map((f) => [f.key, f]));
    expect(byKey['name']?.value).toBe('Скамья парковая');
    expect(byKey['sku']?.value).toBe('BENCH-1');
    expect(byKey['category']?.value).toBe('Благоустройство');
    expect(byKey['height']?.value).toBe('865 мм');
    expect(byKey['length']?.value).toBe('1498 мм');
    expect(byKey['width']?.value).toBe('590 мм');
    expect(byKey['weightKg']?.value).toBe('81.7 кг');
    expect(byKey['purpose']?.value).toBe('организации зон отдыха');
    expect(byKey['color']?.value).toBe('ral-7016');
    expect(byKey['unit']?.value).toBe('Штука (pcs)');
  });

  it('uses «Не указано» for empty live fields', () => {
    const preview = buildProductPassportPreview({
      product: { _id: 'x', name: '', sku: 'S', kind: 'good', unit: 'pcs' },
      tree: null,
    });
    expect(preview.fields.find((f) => f.key === 'description')?.value).toBe(PASSPORT_NOT_SPECIFIED);
    expect(preview.fields.find((f) => f.key === 'height')?.value).toBe(PASSPORT_NOT_SPECIFIED);
  });

  it('marks snapshot-only XLSX fields as «Не указано» with snapshot flag', () => {
    const preview = buildProductPassportPreview({ product: PRODUCT, tree: TREE });
    const passportNo = preview.fields.find((f) => f.key === 'passportNumber');
    expect(passportNo?.value).toBe(PASSPORT_NOT_SPECIFIED);
    expect(passportNo?.snapshotOnly).toBe(true);
    expect(preview.fields.find((f) => f.key === 'supplier')?.snapshotOnly).toBe(true);
  });

  it('derives manufacturedFrom from composition material names', () => {
    const preview = buildProductPassportPreview({ product: PRODUCT, tree: TREE });
    expect(preview.fields.find((f) => f.key === 'manufacturedFrom')?.value).toContain('Лист 3 мм');
    expect(preview.fields.find((f) => f.key === 'manufacturedFrom')?.value).toContain('Доска 40×40');
  });

  it('builds composition summary for top-level children', () => {
    const rows = buildCompositionSummary(TREE);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ position: 1, name: 'Каркас', material: 'Модуль', quantity: '1 шт' });
    expect(rows[1]).toMatchObject({ position: 2, name: 'Доска 40×40', material: 'Сырьё' });
    expect(rows[0]?.designation).toBe(PASSPORT_NOT_SPECIFIED);
  });

  it('does not invent fields outside PRODUCT_PASSPORT_FIELD_MAP', () => {
    const preview = buildProductPassportPreview({ product: PRODUCT, tree: TREE });
    for (const field of preview.fields) {
      expect(PASSPORT_FIELD_MAP_KEYS.has(field.key)).toBe(true);
    }
    expect(preview.fields).toHaveLength(PRODUCT_PASSPORT_FIELD_MAP.length);
  });

  it('declares live-catalog mode separate from immutable snapshot', () => {
    const preview = buildProductPassportPreview({ product: PRODUCT, tree: TREE });
    expect(preview.mode).toBe('live-catalog');
    expect(preview.snapshotNotice).toContain('ProductPassport');
  });
});
