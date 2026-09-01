import { resolveTableAggregateTokens, tableAggregateValue } from './studio-table-tokens';

describe('studio-table-tokens (TZ-NX-DOCSTUDIO-S21)', () => {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'sum', label: 'Sum', type: 'sum' },
  ];

  it('computes subtotal, vat and grand', () => {
    const rows = [['A', '100'], ['B', '50']];
    expect(tableAggregateValue(columns, rows, 'subtotal', 20)).toBe(150);
    expect(tableAggregateValue(columns, rows, 'vat', 20)).toBe(30);
    expect(tableAggregateValue(columns, rows, 'grand', 20)).toBe(180);
  });

  it('replaces table aggregate tokens in text content', () => {
    const blocks = [
      { _id: 'block1', type: 'table', settings: { tableTemplateColumns: columns } },
      { _id: 'text1', type: 'text', content: 'Итого: {{table.subtotal}}' },
    ] as never[];
    const dataSets = [{ key: 'table-block1', rows: [['A', '1000']] }];
    const next = resolveTableAggregateTokens(
      'Итого: {{table.subtotal}}',
      blocks,
      dataSets,
      20,
    );
    expect(next).toContain('1');
    expect(next).not.toContain('{{table.subtotal}}');
  });
});
