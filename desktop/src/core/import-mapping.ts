import type { RawRow } from '../importers';

export const CANONICAL_COLUMNS = [
  'article',
  'name',
  'unit',
  'qty',
  'sku',
  'notes',
  'categoryId',
] as const;

export type CanonicalColumn = (typeof CANONICAL_COLUMNS)[number];
export type MappingState = 'ready' | 'unfit' | 'conflict' | 'ignored';

const ALIASES: Record<CanonicalColumn, readonly string[]> = {
  article: ['article', 'артикул', 'обозначение', 'код изделия'],
  name: ['name', 'наименование', 'название', 'материал', 'описание', 'текст'],
  unit: ['unit', 'ед', 'ед.', 'единица', 'ед. изм.', 'ед.изм', 'единицы'],
  qty: ['qty', 'quantity', 'количество', 'кол-во', 'кол'],
  sku: ['sku', 'код', 'код товара', 'штрихкод'],
  notes: ['notes', 'примечание', 'примечания', 'комментарий', 'комментарии', 'заметки'],
  categoryId: ['categoryid', 'категория', 'category', 'тип элемента', 'тип'],
};

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function candidatesForHeader(header: string): CanonicalColumn[] {
  const normalized = normalize(header);
  if (!normalized) return [];
  return CANONICAL_COLUMNS.filter((canonical) =>
    ALIASES[canonical].some((alias) => {
      const candidate = normalize(alias);
      return candidate === normalized ||
        (candidate.length > 1 && (normalized.includes(candidate) || candidate.includes(normalized)));
    }),
  );
}

export interface MappingRow {
  header: string;
  canonical: CanonicalColumn | null;
  candidates: CanonicalColumn[];
  state: MappingState;
}

export interface MappingResult {
  rows: MappingRow[];
  mapping: Record<string, CanonicalColumn | null>;
  ready: string[];
  unfit: string[];
  conflicts: string[];
}

/** Classify headers and mark duplicate canonical assignments as conflicts. */
export function classifyHeaders(headers: readonly string[]): MappingResult {
  const initial = headers.map((header): MappingRow => {
    const candidates = candidatesForHeader(header);
    return {
      header,
      candidates,
      canonical: candidates.length === 1 ? candidates[0] : null,
      state: candidates.length === 1 ? 'ready' : candidates.length > 1 ? 'conflict' : 'unfit',
    };
  });
  const assigned = new Map<CanonicalColumn, MappingRow[]>();
  for (const row of initial) {
    if (!row.canonical) continue;
    const list = assigned.get(row.canonical) ?? [];
    list.push(row);
    assigned.set(row.canonical, list);
  }
  for (const rows of assigned.values()) {
    if (rows.length < 2) continue;
    for (const row of rows) {
      row.state = 'conflict';
      row.candidates = [row.canonical!];
      row.canonical = null;
    }
  }
  return makeMappingResult(initial);
}

function makeMappingResult(rows: MappingRow[]): MappingResult {
  const mapping: Record<string, CanonicalColumn | null> = {};
  for (const row of rows) mapping[row.header] = row.canonical;
  return {
    rows,
    mapping,
    ready: rows.filter((row) => row.state === 'ready').map((row) => row.header),
    unfit: rows.filter((row) => row.state !== 'ready').map((row) => row.header),
    conflicts: rows.filter((row) => row.state === 'conflict').map((row) => row.header),
  };
}

/** Apply a user choice for one source header and recalculate duplicate conflicts. */
export function updateMapping(result: MappingResult, header: string, canonical: CanonicalColumn | null): MappingResult {
  const rows = result.rows.map((row) =>
    row.header === header
      ? {
          ...row,
          canonical,
          candidates: canonical ? [canonical] : row.candidates,
          state: canonical ? 'ready' as const : 'ignored' as const,
        }
      : { ...row },
  );
  const assigned = new Map<CanonicalColumn, MappingRow[]>();
  for (const row of rows) {
    if (!row.canonical || row.state === 'ignored') continue;
    const list = assigned.get(row.canonical) ?? [];
    list.push(row);
    assigned.set(row.canonical, list);
  }
  for (const row of rows) {
    if (row.state === 'conflict') row.state = row.canonical ? 'ready' : 'unfit';
  }
  for (const [canonical, assignedRows] of assigned) {
    if (assignedRows.length < 2) continue;
    for (const row of assignedRows) {
      row.state = 'conflict';
      row.candidates = [canonical];
      row.canonical = null;
    }
  }
  return makeMappingResult(rows);
}

export function canConfirmMapping(result: MappingResult): boolean {
  return result.rows.length > 0 && result.rows.every((row) => row.state === 'ready' || row.state === 'ignored');
}

export function reshapeRows(rows: RawRow[], mapping: Record<string, CanonicalColumn | null>): RawRow[] {
  return rows.map((row) => {
    const out: RawRow = {};
    for (const [source, value] of Object.entries(row)) {
      const canonical = mapping[source];
      if (canonical && out[canonical] === undefined) out[canonical] = value;
    }
    return out;
  });
}

export type RowValidationStatus = 'ok_new' | 'ok_update' | 'skip' | 'conflict' | 'error';

export interface ValidatedImportRow {
  rowIndex: number;
  values: RawRow;
  status: RowValidationStatus;
  message: string;
}

function textValue(row: RawRow, key: string): string {
  const value = row[key];
  return value === undefined || value === null ? '' : String(value).trim();
}

/** Validate canonical rows before any proposal; no network or SoT writes. */
export function validateMappedRows(rows: RawRow[], existingArticles: ReadonlySet<string> = new Set()): ValidatedImportRow[] {
  const seen = new Map<string, number[]>();
  rows.forEach((row, index) => {
    const article = textValue(row, 'article');
    if (!article) return;
    const indexes = seen.get(article) ?? [];
    indexes.push(index);
    seen.set(article, indexes);
  });

  return rows.map((values, rowIndex) => {
    const article = textValue(values, 'article');
    const name = textValue(values, 'name');
    const quantity = values.qty === undefined || values.qty === null || values.qty === ''
      ? undefined
      : Number(values.qty);
    if (!article) return { rowIndex, values, status: 'error', message: 'Пустой артикул' };
    if (!name) return { rowIndex, values, status: 'error', message: 'Пустое наименование' };
    if (quantity !== undefined && (!Number.isFinite(quantity) || quantity <= 0)) {
      return { rowIndex, values, status: 'error', message: 'Количество должно быть больше нуля' };
    }
    if ((seen.get(article)?.length ?? 0) > 1) {
      return { rowIndex, values, status: 'conflict', message: 'Дубликат артикула в файле' };
    }
    if (existingArticles.has(article)) {
      return { rowIndex, values, status: 'ok_update', message: 'Совпадение с каталогом — готово к обновлению' };
    }
    return { rowIndex, values, status: 'ok_new', message: 'Новая строка готова' };
  });
}
