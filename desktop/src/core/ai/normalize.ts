/**
 * TZD-AI-IMPORT-GENERAL-BASELINE — AI-нормализация строк импорта.
 *
 * Разбито на две части, специально для тестируемости без сети/модели:
 *  - `buildNormalizePrompt` / `buildEntitySchemaJson` — детерминированная
 *    сборка промпта (general.md + схема из IMPORT_TARGETS).
 *  - `parseNormalizeResponse` — детерминированный разбор + валидация ответа
 *    модели (JSON-парсинг, фильтр «выдуманных» полей, схема required).
 *    Именно эту функцию гоняет eval-harness (`normalize-eval.fixtures.ts`)
 *    на синтетических «ответах модели» — без обращения к реальному Ollama.
 *
 * Сетевой вызов (`chatCompletion`) и retry-логика — в `pipeline.normalizeStep`.
 */

import { IMPORT_TARGETS, isImportTargetKey, type ImportTargetKey } from '../import-targets';
import { buildSystemPrompt } from './prompts';
import type { ChatMessage } from './types';

/** JSON-схема полей целевой таблицы для системного промпта (`{entitySchema}`). */
export function buildEntitySchemaJson(schemaId: ImportTargetKey): string {
  const target = IMPORT_TARGETS[schemaId];
  const requiredFields: readonly string[] = target.requiredFields;
  const fields = target.columns.map((column) => ({
    key: column.key as string,
    label: column.label,
    required: requiredFields.includes(column.key),
  }));
  return JSON.stringify(fields, null, 2);
}

/** Сырые строки как JSON-массив объектов для пользовательского сообщения. */
function buildRawRowsJson(rows: readonly Record<string, unknown>[]): string {
  return JSON.stringify(rows, null, 2);
}

/**
 * Собирает system+user сообщения для нормализации пачки строк одной схемы.
 * `buildSystemPrompt` асинхронна (читает general.md) — поэтому и эта функция.
 */
export async function buildNormalizePrompt(
  rows: readonly Record<string, unknown>[],
  schemaId: ImportTargetKey,
): Promise<{ system: string; user: string }> {
  const system = await buildSystemPrompt(buildEntitySchemaJson(schemaId));
  const user =
    `Строки для нормализации (JSON-массив, ${rows.length} шт.):\n` +
    buildRawRowsJson(rows);
  return { system, user };
}

/** Повторный запрос модели после невалидного JSON — просит вернуть строго JSON, без переспрашивания пользователя. */
export function buildNormalizeRetryMessage(): ChatMessage {
  return {
    role: 'user',
    content:
      'Твой предыдущий ответ не был валидным JSON по описанному формату. ' +
      'Верни СТРОГО один валидный JSON-объект { "rows": [...], "_questions": [...], "_errors": [...], "_skipped": [...] } ' +
      'без markdown-разметки и пояснений вокруг.',
  };
}

export interface ParsedNormalizeResult {
  /** true — ответ был валидным JSON с массивом `rows` (даже если он пуст). */
  ok: boolean;
  /** Строки после фильтрации к ключам схемы (выдуманные поля — в `inventedFields`, не здесь). */
  rows: Record<string, unknown>[];
  questions: string[];
  errors: string[];
  skipped: string[];
  /** Ключи полей, которые модель вернула, но которых нет в схеме — она их не должна была придумывать. */
  inventedFields: string[];
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

/** Снимает markdown-код-фенсы и достаёт первый `{...}` объект — тот же приём, что `parseMappingJson`. */
function extractJsonObject(text: string): unknown {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

/**
 * Разбирает и валидирует ответ модели по формату general.md.
 * Детерминированная, без сети — на ней строится eval-harness.
 */
export function parseNormalizeResponse(
  text: string,
  schemaId: ImportTargetKey,
): ParsedNormalizeResult {
  const empty: ParsedNormalizeResult = {
    ok: false,
    rows: [],
    questions: [],
    errors: [],
    skipped: [],
    inventedFields: [],
  };
  if (!isImportTargetKey(schemaId)) return empty;

  const parsed = extractJsonObject(text);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return empty;
  const obj = parsed as Record<string, unknown>;
  if (!Array.isArray(obj.rows)) return empty;

  const validKeys = new Set<string>(IMPORT_TARGETS[schemaId].columns.map((column) => column.key));
  const inventedFields = new Set<string>();
  const rows: Record<string, unknown>[] = obj.rows.map((row) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return {};
    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row as Record<string, unknown>)) {
      if (validKeys.has(key)) {
        filtered[key] = value;
      } else {
        inventedFields.add(key);
      }
    }
    return filtered;
  });

  return {
    ok: true,
    rows,
    questions: toStringArray(obj._questions),
    errors: toStringArray(obj._errors),
    skipped: toStringArray(obj._skipped),
    inventedFields: [...inventedFields],
  };
}
