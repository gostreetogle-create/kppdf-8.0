import type { RawRow } from '../importers';
import { IMPORT_TARGETS, type ImportTargetColumn } from './import-targets';

export const MATERIAL_COLUMNS: readonly ImportTargetColumn[] = IMPORT_TARGETS.material.columns;

/** Легаси-экспорт: канонические ключи материальной таблицы. */
export const CANONICAL_COLUMNS: readonly string[] = MATERIAL_COLUMNS.map((column) => column.key);
export type CanonicalColumn = (typeof CANONICAL_COLUMNS)[number];
export type MappingState = 'ready' | 'unfit' | 'conflict' | 'ignored';

/** Русские подписи материальной таблицы (легаси для существующих экранов). */
export const CANONICAL_LABELS: Record<CanonicalColumn, string> = Object.fromEntries(
  MATERIAL_COLUMNS.map((column) => [column.key, column.label]),
) as Record<CanonicalColumn, string>;

/** Подпись опции в выпадающем списке: «Наименование (name)». */
export function canonicalLabel(canonical: CanonicalColumn): string {
  return `${CANONICAL_LABELS[canonical]} (${canonical})`;
}

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function candidatesForHeader(header: string, columns: readonly ImportTargetColumn[]): string[] {
  const normalized = normalize(header);
  if (!normalized) return [];
  return columns
    .filter((column) =>
      column.aliases.some((alias) => {
        const candidate = normalize(alias);
        return (
          candidate === normalized ||
          (candidate.length > 1 &&
            (normalized.includes(candidate) || candidate.includes(normalized)))
        );
      }),
    )
    .map((column) => column.key);
}

export interface MappingRow {
  header: string;
  canonical: string | null;
  candidates: string[];
  state: MappingState;
}

export interface MappingResult {
  rows: MappingRow[];
  mapping: Record<string, string | null>;
  ready: string[];
  unfit: string[];
  conflicts: string[];
}

/** Classify headers against a target table; duplicate assignments become conflicts. */
export function classifyHeaders(
  headers: readonly string[],
  columns: readonly ImportTargetColumn[] = MATERIAL_COLUMNS,
): MappingResult {
  const initial = headers.map((header): MappingRow => {
    const candidates = candidatesForHeader(header, columns);
    return {
      header,
      candidates,
      canonical: candidates.length === 1 ? candidates[0] : null,
      state: candidates.length === 1 ? 'ready' : candidates.length > 1 ? 'conflict' : 'unfit',
    };
  });
  const assigned = new Map<string, MappingRow[]>();
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
  const mapping: Record<string, string | null> = {};
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
export function updateMapping(
  result: MappingResult,
  header: string,
  canonical: string | null,
): MappingResult {
  const rows = result.rows.map((row) =>
    row.header === header
      ? {
          ...row,
          canonical,
          candidates: canonical ? [canonical] : row.candidates,
          state: canonical ? ('ready' as const) : ('ignored' as const),
        }
      : { ...row },
  );
  const assigned = new Map<string, MappingRow[]>();
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

export function reshapeRows(rows: RawRow[], mapping: Record<string, string | null>): RawRow[] {
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

/** Validate canonical rows against a target table before any proposal. */
export function validateMappedRows(
  rows: RawRow[],
  requiredFields: readonly string[] = IMPORT_TARGETS.material.requiredFields,
  existingArticles: ReadonlySet<string> = new Set(),
): ValidatedImportRow[] {
  const seen = new Map<string, number[]>();
  rows.forEach((row, index) => {
    const article = textValue(row, 'article');
    if (!article) return;
    const indexes = seen.get(article) ?? [];
    indexes.push(index);
    seen.set(article, indexes);
  });

  return rows.map((values, rowIndex) => {
    const missing = requiredFields.filter((key) => !textValue(values, key));
    if (missing.length > 0) {
      return { rowIndex, values, status: 'error', message: `Пусто: ${missing.join(', ')}` };
    }
    const quantity = values.qty === undefined || values.qty === null || values.qty === ''
      ? undefined
      : Number(values.qty);
    if (quantity !== undefined && (!Number.isFinite(quantity) || quantity <= 0)) {
      return { rowIndex, values, status: 'error', message: 'Количество должно быть больше нуля' };
    }
    if ((seen.get(textValue(values, 'article'))?.length ?? 0) > 1) {
      return { rowIndex, values, status: 'conflict', message: 'Дубликат артикула в файле' };
    }
    const article = textValue(values, 'article');
    if (article && existingArticles.has(article)) {
      return { rowIndex, values, status: 'ok_update', message: 'Совпадение с каталогом — готово к обновлению' };
    }
    return { rowIndex, values, status: 'ok_new', message: 'Новая строка готова' };
  });
}
