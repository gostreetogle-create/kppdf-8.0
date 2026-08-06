/**
 * Inbox-папка агента (TZD-15).
 *
 * Поток: drop файл → scan → audit (parse) → propose (только proposal,
 * НЕ запись в SoT) → confirm/cancel (TZD-13 journal path) → файл в
 * processed/ или failed/ + лог. Silent SoT write запрещён: все записи
 * идут через /api/mutation-journal/proposals (propose → confirm).
 *
 * Файловая работа — через Tauri plugin-fs (app-side); MCP-сторона
 * (desktop/mcp/src/inbox.ts) использует Node fs + тот же маппинг колонок.
 */

import { appDataDir, join } from '@tauri-apps/api/path';
import {
  exists,
  mkdir,
  readDir,
  readFile,
  rename,
  stat,
  writeTextFile,
} from '@tauri-apps/plugin-fs';
import type { AppConfig } from './config';
import type { ApiClientOptions } from './api';
import { apiPost } from './api';
import { importerFor, type RawRow } from '../importers';

/** Расширения, которые inbox распознаёт как файлы для агента. */
export const INBOX_EXTENSIONS = ['.xlsx', '.xls', '.csv', '.tsv', '.txt'] as const;

/** Каталог inbox по умолчанию: app-data/inbox. */
export async function defaultInboxDir(): Promise<string> {
  return await join(await appDataDir(), 'inbox');
}

/** Итоговый каталог inbox с учётом пользовательского выбора из конфига. */
export async function resolveInboxDir(cfg: Pick<AppConfig, 'inbox'>): Promise<string> {
  if (cfg.inbox.dir) return cfg.inbox.dir;
  return defaultInboxDir();
}

/** Файл, обнаруженный в inbox. */
export interface InboxFile {
  name: string;
  /** Размер в байтах. */
  size: number;
  /** mtime ISO (из plugin-fs stat). */
  modifiedAt: string;
}

/** Результат аудита файла: распарсенные строки + ошибки. */
export interface InboxAudit {
  fileName: string;
  rows: RawRow[];
  /** Кол-во строк без «наименования» — не пойдут в proposal. */
  skippedRows: number;
  /** Сколько строк прошли маппинг в material (имеют наименование). */
  mappableRows: number;
  error?: string;
}

/** Material-строка после маппинга колонок (тот же контракт, что MCP). */
export interface MaterialRow {
  name: string;
  unit?: string;
  article?: string;
  sku?: string;
  categoryId?: string;
}

/** Колонки-алиасы для маппинга (RU + EN, регистронезависимо). */
const NAME_COLUMNS = ['name', 'наименование', 'название', 'материал', 'наименование материала', 'текст'];
const UNIT_COLUMNS = ['unit', 'ед', 'ед.', 'единица', 'ед. изм.', 'ед.изм', 'единицы'];
const ARTICLE_COLUMNS = ['article', 'артикул'];
const SKU_COLUMNS = ['sku', 'код', 'код товара', 'штрихкод'];
const CATEGORY_COLUMNS = ['categoryId', 'категория', 'category'];

function firstValue(row: RawRow, aliases: readonly string[]): string | undefined {
  for (const alias of aliases) {
    const raw = row[alias] ?? row[alias.toLowerCase()];
    if (raw !== undefined && raw !== null && String(raw).trim()) {
      return String(raw).trim();
    }
  }
  // Регистронезависимый поиск по ключам (кириллица может отличаться в регистре).
  for (const [key, value] of Object.entries(row)) {
    const k = key.trim().toLowerCase();
    if (aliases.some((a) => a.toLowerCase() === k)) {
      const s = value === undefined || value === null ? '' : String(value).trim();
      if (s) return s;
    }
  }
  return undefined;
}

/** Маппинг RawRow → MaterialRow. Без наименования возвращает null (skip). */
export function mapRowToMaterial(row: RawRow): MaterialRow | null {
  const name = firstValue(row, NAME_COLUMNS);
  if (!name) return null;
  const row_: MaterialRow = { name };
  const unit = firstValue(row, UNIT_COLUMNS);
  if (unit) row_.unit = unit;
  const article = firstValue(row, ARTICLE_COLUMNS);
  if (article) row_.article = article;
  const sku = firstValue(row, SKU_COLUMNS);
  if (sku) row_.sku = sku;
  const categoryId = firstValue(row, CATEGORY_COLUMNS);
  if (categoryId) row_.categoryId = categoryId;
  return row_;
}

/** Создаёт каталоги inbox, inbox/processed, inbox/failed. */
export async function ensureInboxLayout(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
  await mkdir(await join(dir, 'processed'), { recursive: true });
  await mkdir(await join(dir, 'failed'), { recursive: true });
}

/**
 * Сканирует inbox: файлы с поддерживаемыми расширениями + размер + mtime.
 * Подкаталоги (processed/failed) не включаются.
 */
export async function scanInbox(dir: string): Promise<InboxFile[]> {
  const entries = await readDir(dir);
  const files: InboxFile[] = [];
  for (const entry of entries) {
    if (!entry.isFile) continue;
    const dot = entry.name.lastIndexOf('.');
    if (dot === -1) continue;
    const ext = entry.name.slice(dot).toLowerCase();
    if (!(INBOX_EXTENSIONS as readonly string[]).includes(ext)) continue;
    // processed/failed живут подкаталогами — они не файлы, уже отфильтрованы.
    try {
      const info = await stat(await join(dir, entry.name));
      files.push({
        name: entry.name,
        size: info.size,
        modifiedAt: info.mtime ? info.mtime.toISOString() : '',
      });
    } catch {
      // Файл мог исчезнуть между readDir и stat — пропускаем.
    }
  }
  files.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
  return files;
}

/** Читает файл из inbox и парсит через существующие импортёры. */
export async function auditInboxFile(dir: string, fileName: string): Promise<InboxAudit> {
  const importer = importerFor(fileName);
  if (!importer) {
    return {
      fileName,
      rows: [],
      skippedRows: 0,
      mappableRows: 0,
      error: `«${fileName}» не распознан — поддерживаются: ${INBOX_EXTENSIONS.join(', ')}.`,
    };
  }
  try {
    const data = await readFile(await join(dir, fileName));
    const rows = await importer.parse({ name: fileName, data });
    const mappableRows = rows.filter((r) => mapRowToMaterial(r) !== null).length;
    return { fileName, rows, skippedRows: rows.length - mappableRows, mappableRows };
  } catch (err) {
    return {
      fileName,
      rows: [],
      skippedRows: 0,
      mappableRows: 0,
      error: err instanceof Error ? err.message : 'Не удалось прочитать файл.',
    };
  }
}

/** Результат propose-батча: сколько предложено / пропущено + id proposal. */
export interface ProposeBatchResult {
  proposed: number;
  skipped: number;
  /** proposalId для строк, что ушли в proposal (по порядку строк). */
  proposalIds: string[];
  failed: Array<{ rowName: string; error: string }>;
}

/**
 * Предлагает material.create для каждой строки (НЕ пишет в SoT).
 * Подтверждение — отдельный шаг (confirmProposals).
 */
export async function proposeMaterialRows(
  api: ApiClientOptions,
  rows: RawRow[],
): Promise<ProposeBatchResult> {
  const result: ProposeBatchResult = { proposed: 0, skipped: 0, proposalIds: [], failed: [] };
  for (const row of rows) {
    const material = mapRowToMaterial(row);
    if (!material) {
      result.skipped += 1;
      continue;
    }
    try {
      const resp = (await apiPost(
        api,
        '/api/mutation-journal/proposals',
        {
          kind: 'material.create',
          toolName: 'kppdf_inbox_propose_file',
          create: material,
        },
      )) as { proposalId?: string };
      result.proposed += 1;
      if (resp.proposalId) result.proposalIds.push(resp.proposalId);
    } catch (err) {
      result.failed.push({
        rowName: material.name,
        error: err instanceof Error ? err.message : 'Ошибка сервера',
      });
    }
  }
  return result;
}

/** Подтверждает proposals по id (единственная точка записи в SoT). */
export async function confirmProposals(
  api: ApiClientOptions,
  proposalIds: string[],
): Promise<{ applied: number; failed: Array<{ id: string; error: string }> }> {
  const failed: Array<{ id: string; error: string }> = [];
  let applied = 0;
  for (const id of proposalIds) {
    try {
      await apiPost(api, `/api/mutation-journal/proposals/${encodeURIComponent(id)}/confirm`, {});
      applied += 1;
    } catch (err) {
      failed.push({ id, error: err instanceof Error ? err.message : 'Ошибка сервера' });
    }
  }
  return { applied, failed };
}

/** Отменяет proposals (SoT не меняется; файл можно пере-предложить). */
export async function cancelProposals(
  api: ApiClientOptions,
  proposalIds: string[],
): Promise<{ cancelled: number }> {
  let cancelled = 0;
  for (const id of proposalIds) {
    try {
      await apiPost(api, `/api/mutation-journal/proposals/${encodeURIComponent(id)}/cancel`, {});
      cancelled += 1;
    } catch {
      // отмена идемпотентна; пропускаем уже не-proposed
    }
  }
  return { cancelled };
}

/**
 * Перемещает файл в processed/ или failed/. При коллизии имени добавляет
 * префикс-таймстамп (rename не перезаписывает существующий файл).
 */
export async function moveInboxFile(
  dir: string,
  fileName: string,
  outcome: 'processed' | 'failed',
): Promise<string> {
  const targetDir = await join(dir, outcome);
  let target = await join(targetDir, fileName);
  if (await exists(target)) {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    target = await join(targetDir, `${stamp}-${fileName}`);
  }
  await rename(await join(dir, fileName), target);
  return target;
}

/** Путь к файлу лога inbox. */
async function inboxLogPath(dir: string): Promise<string> {
  return await join(dir, 'inbox.log');
}

/** Дописывает строку в inbox.log (создаёт при отсутствии). */
export async function appendInboxLog(dir: string, line: string): Promise<void> {
  const path = await inboxLogPath(dir);
  let existing = '';
  try {
    const { readTextFile } = await import('@tauri-apps/plugin-fs');
    existing = (await readTextFile(path)) || '';
  } catch {
    // файла ещё нет — начинаем с пустого
  }
  const stamp = new Date().toISOString();
  await writeTextFile(
    path,
    `${existing}${existing && !existing.endsWith('\n') ? '\n' : ''}[${stamp}] ${line}\n`,
  );
}

