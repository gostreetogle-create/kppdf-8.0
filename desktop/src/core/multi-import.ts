import type { RawRow } from '../importers';
import {
  classifyHeaders,
  reshapeRows,
  updateMapping,
  validateMappedRows,
  type MappingResult,
  type ValidatedImportRow,
} from './import-mapping';
import {
  IMPORT_TARGETS,
  IMPORT_TARGET_ORDER,
  importTarget,
  type ImportTargetKey,
} from './import-targets';

export interface TableSuggestion {
  targetKey: ImportTargetKey;
  /** Сколько колонок распознано уверенно. */
  readyCount: number;
  /** Сколько колонок всего подошло (ready + требуется проверки). */
  totalMatched: number;
  mapping: MappingResult;
}

/**
 * Мини-агент: для каждого целевой таблицы классифицируем колонки файла и
 * предлагаем таблицы, куда данные «ложатся» (есть хотя бы одна уверенно
 * распознанная колонка). Человек подтверждает/убирает блоки.
 */
export function analyzeTables(headers: readonly string[]): TableSuggestion[] {
  return IMPORT_TARGET_ORDER.map((targetKey) => {
    const mapping = classifyHeaders(headers, IMPORT_TARGETS[targetKey].columns);
    return {
      targetKey,
      readyCount: mapping.ready.length,
      totalMatched: mapping.rows.filter((row) => row.state !== 'unfit').length,
      mapping,
    };
  }).filter((suggestion) => suggestion.readyCount >= 1);
}

/**
 * Применить карту одной таблицы профиля к колонкам файла.
 * Ключи, которых нет в целевой таблице (например «article» для product),
 * игнорируются — карта всегда остаётся валидной для таблицы.
 */
export function applyTableMapping(
  headers: readonly string[],
  targetKey: ImportTargetKey,
  sourceMap: Record<string, string | null>,
): MappingResult {
  const validKeys = new Set<string>(IMPORT_TARGETS[targetKey].columns.map((column) => column.key));
  let result = classifyHeaders(headers, IMPORT_TARGETS[targetKey].columns);
  // Частичный merge: меняем ТОЛЬКО заголовки, присутствующие в sourceMap.
  // Отсутствующие ключи (в т.ч. пустой {} от AI) не трогают эвристики классификатора.
  for (const [header, key] of Object.entries(sourceMap)) {
    if (!headers.includes(header)) continue;
    result = updateMapping(result, header, key && validKeys.has(key) ? key : null);
  }
  return result;
}

/** Перестроить строки файла по карте таблицы. */
export function reshapeForTable(rows: RawRow[], mapping: MappingResult): RawRow[] {
  return reshapeRows(rows, mapping.mapping);
}

/** Валидация строк для конкретной таблицы (по обязательным полям таблицы). */
export function validateTableRows(rows: RawRow[], targetKey: ImportTargetKey): ValidatedImportRow[] {
  return validateMappedRows(rows, importTarget(targetKey).requiredFields);
}
