import type { TableTemplate } from '@kppdf/data-access';
import {
  buildTableSettingsFromTemplate,
  remapRowsForColumnChange,
  filterHiddenColumnKeysForColumns,
  studioTableHiddenColumnKeys,
  studioTableTemplateId,
  studioTableTransparentBackground,
  studioVisibleTableColumns,
  studioVisibleTableRows,
  templateSampleRowsToMatrix,
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
});
