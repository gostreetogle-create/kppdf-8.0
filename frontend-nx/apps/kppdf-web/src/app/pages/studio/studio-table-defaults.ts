export interface StudioTableColumn {
  readonly key: string;
  readonly label: string;
  readonly type: 'text' | 'number' | 'currency';
  readonly width: number;
  readonly align: 'left' | 'center' | 'right';
}

export const STUDIO_DEFAULT_TABLE_COLUMNS: readonly StudioTableColumn[] = [
  { key: 'name', label: 'Наименование', type: 'text', width: 60, align: 'left' },
  { key: 'qty', label: 'Кол-во', type: 'number', width: 20, align: 'right' },
  { key: 'price', label: 'Цена', type: 'currency', width: 20, align: 'right' },
] as const;

export const STUDIO_DEFAULT_TABLE_ROWS: readonly (readonly string[])[] = [['', '', '']] as const;

export function studioTableColumns(block: { settings?: Record<string, unknown> }): StudioTableColumn[] {
  const cols = block.settings?.['tableTemplateColumns'];
  return Array.isArray(cols) ? (cols as StudioTableColumn[]) : [...STUDIO_DEFAULT_TABLE_COLUMNS];
}

export function studioTableRows(block: { settings?: Record<string, unknown> }): string[][] {
  const rows = block.settings?.['tableTemplateSampleRows'];
  if (!Array.isArray(rows)) return STUDIO_DEFAULT_TABLE_ROWS.map((r) => [...r]);
  return rows.map((row) => (Array.isArray(row) ? row.map((c) => String(c ?? '')) : ['']));
}

export function studioTableRowCount(block: { settings?: Record<string, unknown> }): number {
  return studioTableRows(block).length;
}
