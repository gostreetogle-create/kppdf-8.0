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

/**
 * TZ-NX-DOCSTUDIO-TABLE-LINE-QTY — rows resolved from a live source
 * (catalog/quotation/order), cached on the block after `putDataSet`
 * (`studio-editor.page.ts` `applyLiveRowsFromDataSet`). Separate from
 * `studioTableRows` (manual-only, `tableTemplateSampleRows`).
 */
export function studioLiveTableRows(block: { settings?: Record<string, unknown> }): string[][] {
  const rows = block.settings?.['liveRows'];
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => (Array.isArray(row) ? row.map((c) => String(c ?? '')) : []));
}

/**
 * TZ-NX-DOCSTUDIO-STALE-LIVEROWS-HEAL — a table block's `settings.liveRows`
 * is a client-cached snapshot from a past live fetch; if the column
 * structure changed since (add/remove/reorder — including while the block
 * had NO `dataSource` at all, e.g. switched back to manual), some cached
 * rows no longer have one cell per current column. Canvas
 * (`studio-blocks-canvas.component.ts`'s `tableRows()`) reads `liveRows`
 * unconditionally whenever it's a non-empty array — regardless of
 * `dataSource` — so a stale snapshot renders misaligned either way. Detects
 * that mismatch so callers can heal it once on document load, not only
 * when the operator happens to re-edit the column structure (S47's
 * `rehydrateLiveRowsAfterColumnChange` only fires on that edit event).
 *
 * Compares against the RAW `settings.tableTemplateColumns` array, not
 * `studioTableColumns()`'s `STUDIO_DEFAULT_TABLE_COLUMNS` fallback: every
 * real app-created table block sets this explicitly (`createTableBlock()`,
 * `buildTableSettingsFromTemplate()`), so an absent key means "nothing to
 * safely compare against" rather than "assume the 3-column default" —
 * avoids a false-positive mismatch against a default column count no real
 * persisted block actually has.
 */
export function studioLiveRowsMismatchColumns(block: { settings?: Record<string, unknown> }): boolean {
  const liveRows = studioLiveTableRows(block);
  if (liveRows.length === 0) return false;
  const rawColumns = block.settings?.['tableTemplateColumns'];
  if (!Array.isArray(rawColumns)) return false;
  return liveRows.some((row) => row.length !== rawColumns.length);
}

/** Per-row qty overrides for a live-sourced table, keyed by row index (TZ-NX-DOCSTUDIO-TABLE-LINE-QTY). */
export function studioTableQtyOverrides(block: { settings?: Record<string, unknown> }): Record<number, number> {
  const raw = block.settings?.['tableQtyOverrides'];
  if (!raw || typeof raw !== 'object') return {};
  const result: Record<number, number> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const idx = Number(key);
    const qty = Number(value);
    if (Number.isInteger(idx) && idx >= 0 && Number.isFinite(qty) && qty >= 0) {
      result[idx] = qty;
    }
  }
  return result;
}

/** Merges a new qty at `rowIndex` into the existing override map (immutable). */
export function withStudioTableQtyOverride(
  existing: Record<number, number>,
  rowIndex: number,
  qty: number,
): Record<number, number> {
  return { ...existing, [rowIndex]: Math.max(0, qty) };
}

export type StudioTableRowSource =
  | 'manual'
  | 'quotation-items'
  | 'order-items'
  | 'catalog-products'
  | 'catalog-modules'
  | 'catalog-parts'
  | 'catalog-materials';

export function studioTableRowSource(block: { settings?: Record<string, unknown> }): StudioTableRowSource {
  const source = (block.settings?.['dataSource'] as { type?: unknown } | undefined)?.type
    ?? block.settings?.['tableDataSource'];
  return typeof source === 'string' && source !== 'manual' ? (source as StudioTableRowSource) : 'manual';
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

/** TZ-NX-DOCSTUDIO-S48 — parity with backend `COLUMN_ALIASES.photo` (studio-data-resolver.ts). */
const PHOTO_COLUMN_KEY_ALIASES = ['photo', 'image', 'рисунок', 'photourl', 'photoid', 'photo_id', 'photoids', 'photo_ids', 'фото'];

export function isStudioPhotoColumnKey(key: string): boolean {
  return PHOTO_COLUMN_KEY_ALIASES.includes(key.trim().toLowerCase());
}

/**
 * TZ-NX-DOCSTUDIO-TABLE-COL-STRUCTURE — parity with backend `COLUMN_ALIASES`
 * (studio-data-resolver.ts), used only to detect whether a standard field is
 * already present (under any alias) before offering to quick-add it again.
 */
const STUDIO_STANDARD_COLUMN_ALIASES: Record<string, readonly string[]> = {
  qty: ['qty', 'quantity', 'count', 'кол-во', 'количество'],
  price: ['price', 'unitprice', 'unit_price', 'цена'],
  unit: ['unit', 'ед', 'ед.изм'],
  sku: ['sku', 'productsku', 'артикул', 'article'],
  photo: PHOTO_COLUMN_KEY_ALIASES,
  description: ['description', 'desc', 'описание'],
};

/** TZ-NX-DOCSTUDIO-TABLE-LINE-QTY — parity with backend `COLUMN_ALIASES.qty`. */
export function isStudioQtyColumnKey(key: string): boolean {
  return STUDIO_STANDARD_COLUMN_ALIASES['qty']!.includes(key.trim().toLowerCase());
}

export interface StudioStandardColumnField {
  readonly key: keyof typeof STUDIO_STANDARD_COLUMN_ALIASES;
  readonly label: string;
  readonly type: StudioTableColumn['type'];
  readonly align: StudioTableColumn['align'];
}

/** Minimum «Количество» plus the other typical catalog-row fields (TZ-NX-DOCSTUDIO-TABLE-COL-STRUCTURE). */
export const STUDIO_STANDARD_COLUMN_FIELDS: readonly StudioStandardColumnField[] = [
  { key: 'qty', label: 'Количество', type: 'number', align: 'right' },
  { key: 'sku', label: 'Артикул', type: 'text', align: 'left' },
  { key: 'photo', label: 'Фото', type: 'text', align: 'left' },
  { key: 'unit', label: 'Ед.', type: 'text', align: 'left' },
  { key: 'description', label: 'Описание', type: 'text', align: 'left' },
  { key: 'price', label: 'Цена', type: 'currency', align: 'right' },
] as const;

export function missingStandardColumnFields(block: {
  settings?: Record<string, unknown>;
}): readonly StudioStandardColumnField[] {
  const existingKeys = studioTableColumns(block).map((col) => col.key.trim().toLowerCase());
  return STUDIO_STANDARD_COLUMN_FIELDS.filter((field) => {
    const aliases = STUDIO_STANDARD_COLUMN_ALIASES[field.key];
    return !existingKeys.some((key) => aliases.includes(key));
  });
}

export function createStandardStudioTableColumn(field: StudioStandardColumnField): StudioTableColumn {
  return { key: field.key, label: field.label, type: field.type, width: 20, align: field.align };
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
