/**
 * Inbox helpers for MCP host (TZD-15).
 *
 * Работают в процессе MCP (Node, без Tauri): каталог берётся из env
 * KPPDF_INBOX_DIR (десктоп передаёт его при спавне host). Парсинг
 * повторяет контракт desktop/src/importers (xlsx/papaparse/текст),
 * маппинг колонок — зеркало desktop/src/core/inbox.ts (два пакета
 * живут независимо: mcp не импортирует Tauri-код).
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { basename, join } from 'node:path';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

/** Сырая строка: ключ — имя колонки, значение — ячейка. */
export interface RawRow {
  [column: string]: unknown;
}

/** Расширения, которые inbox распознаёт как файлы для агента. */
export const INBOX_EXTENSIONS = ['.xlsx', '.xls', '.csv', '.tsv', '.txt'] as const;

/** Каталог inbox для MCP host (env от десктопа). */
export function inboxDirFromEnv(env: NodeJS.ProcessEnv = process.env): string {
  return (env.KPPDF_INBOX_DIR ?? '').trim();
}

export interface InboxFileInfo {
  name: string;
  size: number;
  modifiedAt: string;
}

/** Список файлов в каталоге inbox (без подкаталогов processed/failed). */
export async function listInboxFiles(dir: string): Promise<InboxFileInfo[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const out: InboxFileInfo[] = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const dot = entry.name.lastIndexOf('.');
    if (dot === -1) continue;
    const ext = entry.name.slice(dot).toLowerCase();
    if (!(INBOX_EXTENSIONS as readonly string[]).includes(ext)) continue;
    try {
      const s = await stat(join(dir, entry.name));
      out.push({ name: entry.name, size: s.size, modifiedAt: s.mtime.toISOString() });
    } catch {
      // файл мог исчезнуть между readdir и stat
    }
  }
  out.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
  return out;
}

function decodeText(data: Uint8Array): string {
  return new TextDecoder('utf-8').decode(data).replace(/^\uFEFF/, '');
}

/** Парсит байты файла по расширению → RawRow[] (контракт desktop importers). */
export async function parseInboxBytes(
  fileName: string,
  data: Uint8Array,
): Promise<RawRow[]> {
  const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
  if (ext === '.txt') {
    const rows: RawRow[] = [];
    for (const line of decodeText(data).split(/\r?\n/)) {
      const text = line.trim();
      if (text) rows.push({ текст: text });
    }
    if (rows.length === 0) throw new Error(`«${fileName}» пустой — нет данных.`);
    return rows;
  }
  if (ext === '.csv' || ext === '.tsv') {
    const text = decodeText(data);
    const result = Papa.parse<RawRow>(text, {
      header: true,
      delimiter: '',
      skipEmptyLines: 'greedy',
    });
    if (result.errors.length > 0) {
      const first = result.errors[0];
      const rowLabel = first.row !== undefined ? ` (строка ${first.row + 1})` : '';
      throw new Error(`Ошибка разбора CSV в «${fileName}»: ${first.message}${rowLabel}.`);
    }
    return result.data;
  }
  if (ext === '.xlsx' || ext === '.xls') {
    let workbook: XLSX.WorkBook;
    try {
      workbook = XLSX.read(data, { type: 'array', cellDates: true });
    } catch {
      throw new Error(`«${fileName}» не является Excel-книгой или файл повреждён.`);
    }
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) throw new Error(`В «${fileName}» нет ни одного листа.`);
    const sheet = workbook.Sheets[sheetName];
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      raw: true,
      defval: null,
    });
    const headerIdx = matrix.findIndex((r) => r.some((c) => c !== null && c !== undefined && c !== ''));
    if (headerIdx === -1) throw new Error(`«${fileName}» пустой — нет данных.`);
    const header = matrix[headerIdx];
    const rows: RawRow[] = [];
    for (let r = headerIdx + 1; r < matrix.length; r++) {
      const row = matrix[r];
      if (!row.some((c) => c !== null && c !== undefined && c !== '')) continue;
      const record: RawRow = {};
      for (let c = 0; c < header.length; c++) {
        const h = String(header[c] ?? '').trim() || `колонка_${c + 1}`;
        const v = row[c];
        record[h] = v instanceof Date ? v : (v ?? null);
      }
      rows.push(record);
    }
    return rows;
  }
  throw new Error(`«${fileName}» не распознан — поддерживаются: ${INBOX_EXTENSIONS.join(', ')}.`);
}

/** Колонки-алиасы для маппинга (RU + EN, регистронезависимо). */
const NAME_COLUMNS = ['name', 'наименование', 'название', 'материал', 'наименование материала', 'текст'];
const UNIT_COLUMNS = ['unit', 'ед', 'ед.', 'единица', 'ед. изм.', 'ед.изм', 'единицы'];
const ARTICLE_COLUMNS = ['article', 'артикул'];
const SKU_COLUMNS = ['sku', 'код', 'код товара', 'штрихкод'];
const CATEGORY_COLUMNS = ['categoryId', 'категория', 'category'];
const NOTES_COLUMNS = ['notes', 'примечание', 'примечания', 'комментарий', 'комментарии', 'заметки'];

// ── TZD-26: ready/unfit column classification (material Wave-1 canon) ────────

/** Канонические колонки материала (Wave-1) и их алиасы (RU+EN). */
export const CANONICAL_COLUMN_ALIASES: Record<string, readonly string[]> = {
  name: NAME_COLUMNS,
  unit: UNIT_COLUMNS,
  article: ARTICLE_COLUMNS,
  sku: SKU_COLUMNS,
  notes: NOTES_COLUMNS,
  categoryId: CATEGORY_COLUMNS,
};

export const CANONICAL_COLUMNS = Object.keys(CANONICAL_COLUMN_ALIASES) as Array<
  keyof typeof CANONICAL_COLUMN_ALIASES
>;

export interface ColumnClassifyResult {
  /** Header names that map to exactly one canonical column. */
  ready: string[];
  /** Header names with no mapping (unknown) or ambiguous (conflict). */
  unfit: string[];
  /** header → canonical | null (null = unknown/conflict). */
  mapping: Record<string, string | null>;
  /** header → candidate canonicals when ambiguous (subset of unfit). */
  conflicts: Record<string, string[]>;
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Классифицирует заголовки колонок против канона материала:
 * exact-match → canonical; иначе substring (alias ⊂ header или header ⊂ alias);
 * ≥2 разных канонов → conflict (unfit). Read-only — 0 proposals, 0 SoT.
 */
export function classifyColumns(headers: readonly string[]): ColumnClassifyResult {
  const ready: string[] = [];
  const unfit: string[] = [];
  const mapping: Record<string, string | null> = {};
  const conflicts: Record<string, string[]> = {};

  for (const header of headers) {
    const h = normalizeHeader(header);
    if (!h) {
      unfit.push(header);
      mapping[header] = null;
      continue;
    }
    const matched: string[] = [];
    for (const canonical of CANONICAL_COLUMNS) {
      const aliases = CANONICAL_COLUMN_ALIASES[canonical];
      const exact = aliases.some((a) => normalizeHeader(a) === h);
      const sub = aliases.some((a) => {
        const al = normalizeHeader(a);
        return al.length > 1 && (h.includes(al) || al.includes(h));
      });
      if (exact || sub) matched.push(canonical);
    }
    const uniq = [...new Set(matched)];
    if (uniq.length === 1) {
      mapping[header] = uniq[0];
      ready.push(header);
    } else {
      mapping[header] = null;
      unfit.push(header);
      if (uniq.length > 1) conflicts[header] = uniq;
    }
  }

  return { ready, unfit, mapping, conflicts };
}

/**
 * Применяет header→canonical map к сырой строке (AI reshape):
 * колонки с mapping=null (или отсутствующие в map) отбрасываются; при дубле
 * канона первая колонка побеждает. Смысл данных сохраняется — только имя колонки.
 */
export function reshapeRowByMap(
  row: RawRow,
  mapping: Record<string, string | null>,
): RawRow {
  const out: RawRow = {};
  for (const [header, value] of Object.entries(row)) {
    const canonical = mapping[header] ?? null;
    if (!canonical) continue;
    if (out[canonical] === undefined) {
      out[canonical] = value;
    }
  }
  return out;
}

function firstValue(row: RawRow, aliases: readonly string[]): string | undefined {
  for (const alias of aliases) {
    const raw = row[alias] ?? row[alias.toLowerCase()];
    if (raw !== undefined && raw !== null && String(raw).trim()) return String(raw).trim();
  }
  for (const [key, value] of Object.entries(row)) {
    if (aliases.some((a) => a.toLowerCase() === key.trim().toLowerCase())) {
      const s = value === undefined || value === null ? '' : String(value).trim();
      if (s) return s;
    }
  }
  return undefined;
}

export interface MaterialRow {
  name: string;
  unit?: string;
  article?: string;
  sku?: string;
  categoryId?: string;
}

/** Маппинг RawRow → MaterialRow. Без наименования возвращает null (skip). */
export function mapRowToMaterial(row: RawRow): MaterialRow | null {
  const name = firstValue(row, NAME_COLUMNS);
  if (!name) return null;
  const out: MaterialRow = { name };
  const unit = firstValue(row, UNIT_COLUMNS);
  if (unit) out.unit = unit;
  const article = firstValue(row, ARTICLE_COLUMNS);
  if (article) out.article = article;
  const sku = firstValue(row, SKU_COLUMNS);
  if (sku) out.sku = sku;
  const categoryId = firstValue(row, CATEGORY_COLUMNS);
  if (categoryId) out.categoryId = categoryId;
  return out;
}

/** Читает файл из inbox и возвращает базовое имя (защита от path-traversal). */
export async function readInboxFile(dir: string, fileName: string): Promise<Uint8Array> {
  const base = basename(fileName);
  if (!base || base !== fileName) {
    throw new Error('fileName должен быть именем файла без пути.');
  }
  return new Uint8Array(await readFile(join(dir, base)));
}

export { basename };
