import type { TableTemplate } from '@kppdf/data-access';
import {
  buildTableSettingsFromTemplate,
  createStandardStudioTableColumn,
  healStudioTableColumns,
  isKnownStudioColumnKey,
  isStudioQtyColumnKey,
  missingStandardColumnFields,
  remapRowsForColumnChange,
  filterHiddenColumnKeysForColumns,
  studioLiveTableRows,
  studioTableEmptyStateLabel,
  studioTableHiddenColumnKeys,
  studioTableQtyOverrides,
  studioTablePhotoDisplay,
  studioTableRowSource,
  studioTableTemplateId,
  studioTableTransparentBackground,
  studioVisibleTableColumns,
  studioVisibleTableRows,
  templateSampleRowsToMatrix,
  withStudioTableQtyOverride,
  type StudioTableColumn,
} from './studio-table-defaults';

describe('studio-table-defaults', () => {
  const template: TableTemplate = {
    _id: 't1',
    name: 'Спецификация',
    sortOrder: 1,
    isActive: true,
    columns: [
      { key: 'sku', label: 'Артикул', type: 'text', width: 30, align: 'left' },
      { key: 'qty', label: 'Кол-во', type: 'number', width: 20, align: 'right' },
    ],
    sampleRows: [['A-1', 3], { sku: 'B-2', qty: 5 }],
  };

  it('buildTableSettingsFromTemplate maps columns and rows', () => {
    const settings = buildTableSettingsFromTemplate(template);
    expect(settings['tableTemplateId']).toBe('t1');
    expect(settings['tableTemplateSampleRows']).toEqual([
      ['A-1', '3'],
      ['B-2', '5'],
    ]);
  });

  it('templateSampleRowsToMatrix supports array and record rows', () => {
    expect(templateSampleRowsToMatrix(template.columns, template.sampleRows)).toEqual([
      ['A-1', '3'],
      ['B-2', '5'],
    ]);
  });

  it('filters hidden columns and disabled rows for preview', () => {
    const block = {
      settings: {
        tableTemplateColumns: template.columns,
        tableTemplateSampleRows: [
          ['one', '1'],
          ['two', '2'],
        ],
        tableHiddenColumnKeys: ['qty'],
        tableDisabledRowIndices: [1],
      },
    };
    expect(studioVisibleTableColumns(block).map((c) => c.key)).toEqual(['sku']);
    expect(studioVisibleTableRows(block)).toEqual([['one']]);
  });

  it('reads template id and hidden keys from settings', () => {
    const block = { settings: { tableTemplateId: 'abc', tableHiddenColumnKeys: ['x'] } };
    expect(studioTableTemplateId(block)).toBe('abc');
    expect(studioTableHiddenColumnKeys(block)).toEqual(['x']);
  });

  it('remapRowsForColumnChange preserves cells by column key', () => {
    const prev = [
      { key: 'a', label: 'A', type: 'text' as const, width: 10, align: 'left' as const },
      { key: 'b', label: 'B', type: 'text' as const, width: 10, align: 'left' as const },
    ];
    const next = [prev[1], prev[0]];
    expect(remapRowsForColumnChange(prev, next, [['1', '2']])).toEqual([['2', '1']]);
  });

  it('filterHiddenColumnKeysForColumns drops stale keys', () => {
    const cols = [{ key: 'a', label: 'A', type: 'text' as const, width: 10, align: 'left' as const }];
    expect(filterHiddenColumnKeysForColumns(['a', 'gone'], cols)).toEqual(['a']);
  });

  it('tableTransparentBackground defaults to false', () => {
    expect(studioTableTransparentBackground({})).toBe(false);
    expect(studioTableTransparentBackground({ settings: {} })).toBe(false);
    expect(
      studioTableTransparentBackground({ settings: { tableTransparentBackground: true } }),
    ).toBe(true);
  });

  it('TZ-NX-PO-SWEEP-05: studioTablePhotoDisplay defaults to 28px + defer-to-frame fit', () => {
    expect(studioTablePhotoDisplay({})).toEqual({ fit: null, maxHeightPx: 28 });
    expect(studioTablePhotoDisplay({ settings: {} })).toEqual({ fit: null, maxHeightPx: 28 });
  });

  it('TZ-NX-PO-SWEEP-05: studioTablePhotoDisplay reads a valid override and rejects out-of-range/garbage values', () => {
    expect(
      studioTablePhotoDisplay({ settings: { tablePhotoDisplay: { fit: 'cover', maxHeightPx: 48 } } }),
    ).toEqual({ fit: 'cover', maxHeightPx: 48 });
    expect(
      studioTablePhotoDisplay({ settings: { tablePhotoDisplay: { fit: 'nope', maxHeightPx: 500 } } }),
    ).toEqual({ fit: null, maxHeightPx: 28 });
  });

  it('studioTableRowSource defaults to manual and reads dataSource/tableDataSource', () => {
    expect(studioTableRowSource({})).toBe('manual');
    expect(studioTableRowSource({ settings: {} })).toBe('manual');
    expect(studioTableRowSource({ settings: { tableDataSource: 'manual' } })).toBe('manual');
    expect(studioTableRowSource({ settings: { tableDataSource: 'quotation-items' } })).toBe(
      'quotation-items',
    );
    expect(
      studioTableRowSource({ settings: { dataSource: { type: 'catalog-products' } } }),
    ).toBe('catalog-products');
  });

  describe('studioTableEmptyStateLabel (TZ-NX-DOCSTUDIO-TABLE-UNWIRED-EMPTY-STATE)', () => {
    it('no dataSource (manual/unwired): points at Properties / Insert', () => {
      expect(studioTableEmptyStateLabel({})).toContain('Нет источника строк');
      expect(studioTableEmptyStateLabel({ settings: { dataSource: { type: 'manual' } } })).toContain(
        'Нет источника строк',
      );
    });

    it('wired live source (catalog/quotation/order): points at Выбрано/КП/заказ, not Свойства', () => {
      for (const source of ['catalog-products', 'catalog-modules', 'catalog-parts', 'catalog-materials', 'quotation-items', 'order-items']) {
        const label = studioTableEmptyStateLabel({ settings: { dataSource: { type: source } } });
        expect(label).toContain('Нет строк из источника');
        expect(label).not.toContain('Свойствах');
      }
    });
  });

  describe('missingStandardColumnFields (TZ-NX-DOCSTUDIO-TABLE-COL-STRUCTURE)', () => {
    it('offers all 7 standard fields for a table with only name/price (TZ-NX-DOCSTUDIO-TABLE-PRICE-SUM adds sum)', () => {
      const block = {
        settings: {
          tableTemplateColumns: [
            { key: 'name', label: 'Наименование', type: 'text' as const, width: 60, align: 'left' as const },
            { key: 'price', label: 'Цена', type: 'currency' as const, width: 20, align: 'right' as const },
          ],
        },
      };
      const missing = missingStandardColumnFields(block).map((f) => f.key);
      expect(missing).toEqual(['qty', 'sku', 'photo', 'unit', 'description', 'sum']);
    });

    it('recognizes an existing column under any alias, not just the canonical key', () => {
      const block = {
        settings: {
          tableTemplateColumns: [
            { key: 'quantity', label: 'Кол-во', type: 'number' as const, width: 20, align: 'right' as const },
            { key: 'article', label: 'Артикул', type: 'text' as const, width: 20, align: 'left' as const },
          ],
        },
      };
      const missing = missingStandardColumnFields(block).map((f) => f.key);
      expect(missing).not.toContain('qty');
      expect(missing).not.toContain('sku');
      expect(missing).toContain('photo');
    });

    it('returns nothing missing once all 7 are present', () => {
      const block = {
        settings: {
          tableTemplateColumns: ['qty', 'sku', 'photo', 'unit', 'description', 'price', 'sum'].map((key) => ({
            key,
            label: key,
            type: 'text' as const,
            width: 20,
            align: 'left' as const,
          })),
        },
      };
      expect(missingStandardColumnFields(block)).toEqual([]);
    });

    it('recognizes an existing sum column under any alias (total/amount/сумма), not just "sum"', () => {
      const block = {
        settings: {
          tableTemplateColumns: [
            { key: 'name', label: 'Наименование', type: 'text' as const, width: 40, align: 'left' as const },
            { key: 'total', label: 'Итого', type: 'currency' as const, width: 20, align: 'right' as const },
          ],
        },
      };
      expect(missingStandardColumnFields(block).map((f) => f.key)).not.toContain('sum');
    });

    it('recognizes a price column under the new catalog field-name aliases (listPrice/basePrice/pricePerUnit)', () => {
      for (const key of ['listPrice', 'list_price', 'basePrice', 'base_price', 'pricePerUnit', 'price_per_unit']) {
        const block = { settings: { tableTemplateColumns: [{ key, label: 'X', type: 'currency' as const, width: 20, align: 'right' as const }] } };
        expect(missingStandardColumnFields(block).map((f) => f.key)).not.toContain('price');
      }
    });
  });

  it('createStandardStudioTableColumn builds a column at the canonical key with a default width', () => {
    const col = createStandardStudioTableColumn({ key: 'qty', label: 'Количество', type: 'number', align: 'right' });
    expect(col).toEqual({ key: 'qty', label: 'Количество', type: 'number', width: 20, align: 'right' });
  });

  describe('live rows + qty overrides (TZ-NX-DOCSTUDIO-TABLE-LINE-QTY)', () => {
    it('isStudioQtyColumnKey recognizes all backend-parity aliases', () => {
      expect(isStudioQtyColumnKey('qty')).toBe(true);
      expect(isStudioQtyColumnKey('Количество')).toBe(true);
      expect(isStudioQtyColumnKey('quantity')).toBe(true);
      expect(isStudioQtyColumnKey('price')).toBe(false);
    });

    it('studioLiveTableRows reads settings.liveRows, defaulting to empty', () => {
      expect(studioLiveTableRows({})).toEqual([]);
      expect(studioLiveTableRows({ settings: {} })).toEqual([]);
      expect(
        studioLiveTableRows({ settings: { liveRows: [['Стол', '1', '1200'], null] } }),
      ).toEqual([['Стол', '1', '1200'], []]);
    });

    it('studioTableQtyOverrides parses a stored map, dropping invalid entries', () => {
      expect(studioTableQtyOverrides({})).toEqual({});
      expect(
        studioTableQtyOverrides({ settings: { tableQtyOverrides: { 0: 3, 2: -1, garbage: 'x', 1: 5 } } }),
      ).toEqual({ 0: 3, 1: 5 });
    });

    it('withStudioTableQtyOverride merges immutably and clamps negatives to 0', () => {
      const base = { 0: 3 };
      const next = withStudioTableQtyOverride(base, 1, 7);
      expect(next).toEqual({ 0: 3, 1: 7 });
      expect(base).toEqual({ 0: 3 });
      expect(withStudioTableQtyOverride(base, 0, -4)).toEqual({ 0: 0 });
    });
  });

  describe('isKnownStudioColumnKey (TZ-NX-DOCSTUDIO-TABLE-PRICE-SUM)', () => {
    it('recognizes every standard alias group, including name and sum', () => {
      expect(isKnownStudioColumnKey('name')).toBe(true);
      expect(isKnownStudioColumnKey('productName')).toBe(true);
      expect(isKnownStudioColumnKey('qty')).toBe(true);
      expect(isKnownStudioColumnKey('price')).toBe(true);
      expect(isKnownStudioColumnKey('listPrice')).toBe(true);
      expect(isKnownStudioColumnKey('sum')).toBe(true);
      expect(isKnownStudioColumnKey('total')).toBe(true);
      expect(isKnownStudioColumnKey('unit')).toBe(true);
      expect(isKnownStudioColumnKey('sku')).toBe(true);
      expect(isKnownStudioColumnKey('photo')).toBe(true);
      expect(isKnownStudioColumnKey('description')).toBe(true);
    });

    it('is false for a custom/unrecognized key (manual + Колонка)', () => {
      expect(isKnownStudioColumnKey('col3')).toBe(false);
      expect(isKnownStudioColumnKey('custom-field')).toBe(false);
    });
  });

  describe('healStudioTableColumns (TZ-NX-DOCSTUDIO-TABLE-PRICE-SUM)', () => {
    const col = (key: string, label: string, type: StudioTableColumn['type'] = 'text'): StudioTableColumn => ({
      key,
      label,
      type,
      width: 20,
      align: 'left',
    });

    it('fixes the reported bug: two columns both labeled «Цена» -> price stays, sum column becomes «Сумма»', () => {
      const healed = healStudioTableColumns([col('price', 'Цена', 'currency'), col('sum', 'Цена', 'currency')]);
      expect(healed.map((c) => c.label)).toEqual(['Цена', 'Сумма']);
    });

    it('heals a blank label on a recognized price/sum key', () => {
      const healed = healStudioTableColumns([col('unitPrice', ''), col('total', '')]);
      expect(healed.map((c) => c.label)).toEqual(['Цена', 'Сумма']);
    });

    it('leaves a deliberate custom label on a recognized key untouched', () => {
      const healed = healStudioTableColumns([col('sum', 'Итого по разделу', 'currency')]);
      expect(healed[0]!.label).toBe('Итого по разделу');
    });

    it('leaves an unrecognized/custom key fully untouched (label and type)', () => {
      const custom = col('col3', 'Цена', 'number');
      const healed = healStudioTableColumns([custom]);
      expect(healed[0]).toBe(custom);
    });

    it('canonicalizes type for known keys: qty->number, price/sum->currency, the rest->text', () => {
      const healed = healStudioTableColumns([
        col('qty', 'Количество', 'text'),
        col('price', 'Цена', 'text'),
        col('sum', 'Сумма', 'text'),
        col('sku', 'Артикул', 'number'),
      ]);
      expect(healed.map((c) => c.type)).toEqual(['number', 'currency', 'currency', 'text']);
    });

    it('returns the same object reference when nothing needs healing (no needless churn)', () => {
      const untouched = col('name', 'Наименование', 'text');
      const healed = healStudioTableColumns([untouched]);
      expect(healed[0]).toBe(untouched);
    });
  });
});
