import type { TableTemplate, TableTemplateColumn } from '@kppdf/data-access';

export interface StudioTableColumn {
  readonly key: string;
  readonly label: string;
  readonly type: 'text' | 'number' | 'currency' | 'date' | 'bool';
  readonly width: number;
  readonly align: 'left' | 'center' | 'right';
  readonly format?: string;
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

/** Default false — opaque table background on canvas/PDF. */
export function studioTableTransparentBackground(block: {
  settings?: Record<string, unknown>;
}): boolean {
  return block.settings?.['tableTransparentBackground'] === true;
}

export function studioTableTemplateId(block: { settings?: Record<string, unknown> }): string | null {
  const id = block.settings?.['tableTemplateId'];
  return typeof id === 'string' && id.trim() ? id.trim() : null;
}

export function studioTableHiddenColumnKeys(block: { settings?: Record<string, unknown> }): string[] {
  const keys = block.settings?.['tableHiddenColumnKeys'];
  return Array.isArray(keys) ? keys.filter((k): k is string => typeof k === 'string') : [];
}

export function studioTableDisabledRowIndices(block: { settings?: Record<string, unknown> }): number[] {
  const indices = block.settings?.['tableDisabledRowIndices'];
  if (!Array.isArray(indices)) return [];
  return indices.filter((i): i is number => typeof i === 'number' && Number.isInteger(i) && i >= 0);
}

export function studioVisibleTableColumns(block: { settings?: Record<string, unknown> }): StudioTableColumn[] {
  const hidden = new Set(studioTableHiddenColumnKeys(block));
  return studioTableColumns(block).filter((col) => !hidden.has(col.key));
}

/** Column indices in full row array that are visible on canvas/PDF. */
export function studioVisibleColumnIndices(block: { settings?: Record<string, unknown> }): number[] {
  const hidden = new Set(studioTableHiddenColumnKeys(block));
  return studioTableColumns(block)
    .map((col, idx) => (hidden.has(col.key) ? -1 : idx))
    .filter((i) => i >= 0);
}

export function studioVisibleTableRows(block: { settings?: Record<string, unknown> }): string[][] {
  const disabled = new Set(studioTableDisabledRowIndices(block));
  const hiddenKeys = new Set(studioTableHiddenColumnKeys(block));
  const columns = studioTableColumns(block);
  const visibleColIdx = columns.map((col, idx) => (hiddenKeys.has(col.key) ? -1 : idx)).filter((i) => i >= 0);
  return studioTableRows(block)
    .filter((_, rowIdx) => !disabled.has(rowIdx))
    .map((row) => visibleColIdx.map((colIdx) => row[colIdx] ?? ''));
}

export function templateColumnsToStudio(columns: readonly TableTemplateColumn[]): StudioTableColumn[] {
  return columns.map((col) => ({
    key: col.key,
    label: col.label,
    type: col.type,
    width: col.width,
    align: col.align,
    ...(col.format ? { format: col.format } : {}),
  }));
}

export function templateSampleRowsToMatrix(
  columns: readonly TableTemplateColumn[],
  sampleRows: TableTemplate['sampleRows'] | undefined,
): string[][] {
  if (!Array.isArray(sampleRows) || sampleRows.length === 0) {
    return [Array(columns.length).fill('')];
  }
  return sampleRows.map((row) => {
    if (Array.isArray(row)) {
      return columns.map((_, idx) => String(row[idx] ?? ''));
    }
    if (row && typeof row === 'object') {
      const record = row as Record<string, unknown>;
      return columns.map((col) => String(record[col.key] ?? ''));
    }
    return Array(columns.length).fill('');
  });
}

export function matrixToSampleRows(rows: readonly (readonly string[])[]): unknown[][] {
  return rows.map((row) => [...row]);
}

export function buildTableSettingsFromTemplate(template: TableTemplate): Record<string, unknown> {
  const columns = templateColumnsToStudio(template.columns);
  return {
    tableTemplateId: template._id,
    tableTemplateName: template.name,
    tableTemplateColumns: columns,
    tableTemplateSampleRows: templateSampleRowsToMatrix(template.columns, template.sampleRows),
    tableHiddenColumnKeys: [],
    tableDisabledRowIndices: [],
  };
}



export function remapRowsForColumnChange(
  prevColumns: readonly StudioTableColumn[],
  nextColumns: readonly StudioTableColumn[],
  rows: readonly (readonly string[])[],
): string[][] {
  return rows.map((row) =>
    nextColumns.map((col) => {
      const prevIdx = prevColumns.findIndex((c) => c.key === col.key);
      return prevIdx >= 0 ? String(row[prevIdx] ?? '') : '';
    }),
  );
}

export function filterHiddenColumnKeysForColumns(
  hiddenKeys: readonly string[],
  columns: readonly StudioTableColumn[],
): string[] {
  const valid = new Set(columns.map((c) => c.key));
  return hiddenKeys.filter((k) => valid.has(k));
}

export function nextStudioTableColumnKey(columns: readonly StudioTableColumn[]): string {
  const keys = new Set(columns.map((c) => c.key));
  let n = columns.length + 1;
  let key = `col${n}`;
  while (keys.has(key)) {
    n += 1;
    key = `col${n}`;
  }
  return key;
}

export function createStudioTableColumn(columns: readonly StudioTableColumn[]): StudioTableColumn {
  const n = columns.length + 1;
  return {
    key: nextStudioTableColumnKey(columns),
    label: `Колонка ${n}`,
    type: 'text',
    width: 20,
    align: 'left',
  };
}

export function buildTableTemplatePayloadFromBlock(
  block: { settings?: Record<string, unknown>; title?: string },
  name: string,
): {
  name: string;
  sortOrder: number;
  columns: TableTemplateColumn[];
  sampleRows: unknown[][];
} {
  const columns = studioTableColumns(block).map((col) => ({
    key: col.key,
    label: col.label,
    type: col.type as TableTemplateColumn['type'],
    width: col.width,
    align: col.align,
    ...(col.format ? { format: col.format } : {}),
  }));
  const rows = studioTableRows(block);
  const disabled = new Set(studioTableDisabledRowIndices(block));
  const enabledRows = rows.filter((_, idx) => !disabled.has(idx));
  return {
    name: name.trim(),
    sortOrder: 0,
    columns,
    sampleRows: matrixToSampleRows(enabledRows.length > 0 ? enabledRows : rows),
  };
}
