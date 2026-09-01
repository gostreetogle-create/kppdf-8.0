import { defineRegistry, type RegistryDefinition, type RegistryRow } from '../model/registry.types';

export interface FormulaRegistryRow extends RegistryRow {
  readonly id: string;
  readonly label: string;
  readonly token: string;
  readonly description: string;
}

const FORMULA_ROWS: readonly FormulaRegistryRow[] = [
  { id: 'column-sum', label: 'Сумма столбца', token: '{{table.subtotal}}', description: 'Итог по колонке суммы первой таблицы' },
  { id: 'percent-of-subtotal', label: '% от суммы', token: '{{table.subtotal}}', description: 'Процент от subtotal — rate задаётся при вставке' },
  { id: 'vat', label: 'НДС', token: '{{table.vat}}', description: 'НДС по ставке организации (реестр «Ставки НДС»)' },
  { id: 'grand-with-vat', label: 'Итого с НДС', token: '{{table.grand}}', description: 'Subtotal + НДС' },
];

export function createFormulasRegistry(): RegistryDefinition<RegistryRow> {
  return defineRegistry({
    key: 'formulas',
    title: 'Формулы',
    category: 'Документы',
    description: 'Первая версия формул для текстовых блоков студии.',
    source: 'demo',
    rowId: (row) => String((row as FormulaRegistryRow).id),
    defaultPageSize: 25,
    emptyMessage: 'Формулы не найдены.',
    columns: [
      { key: 'label', header: 'Формула', sortable: false, format: (row) => row.label },
      { key: 'token', header: 'Токен', sortable: false, format: (row) => row.token },
      { key: 'description', header: 'Назначение', sortable: false, format: (row) => row.description },
    ],
    filters: [],
    paginationMode: 'client',
    dataSource: {
      async query() {
        return { rows: [...FORMULA_ROWS], total: FORMULA_ROWS.length };
      },
    },
  }) as RegistryDefinition<RegistryRow>;
}
