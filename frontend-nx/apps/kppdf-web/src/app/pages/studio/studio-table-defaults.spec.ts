import type { TableTemplate } from '@kppdf/data-access';
import {
  buildTableSettingsFromTemplate,
  createStandardStudioTableColumn,
  isStudioQtyColumnKey,
  missingStandardColumnFields,
  remapRowsForColumnChange,
  filterHiddenColumnKeysForColumns,
  studioLiveTableRows,
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

  describe('missingStandardColumnFields (TZ-NX-DOCSTUDIO-TABLE-COL-STRUCTURE)', () => {
    it('offers all 6 standard fields for a table with only name/price', () => {
      const block = {
        settings: {
          tableTemplateColumns: [
            { key: 'name', label: 'Наименование', type: 'text' as const, width: 60, align: 'left' as const },
            { key: 'price', label: 'Цена', type: 'currency' as const, width: 20, align: 'right' as const },
          ],
        },
      };
      const missing = missingStandardColumnFields(block).map((f) => f.key);
      expect(missing).toEqual(['qty', 'sku', 'photo', 'unit', 'description']);
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

    it('returns nothing missing once all 6 are present', () => {
      const block = {
        settings: {
          tableTemplateColumns: ['qty', 'sku', 'photo', 'unit', 'description', 'price'].map((key) => ({
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
});
