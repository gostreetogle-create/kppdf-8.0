import type { RawRow } from '../importers';
import {
  classifyHeaders,
  reshapeRows,
  updateMapping,
  type MappingResult,
  type ValidatedImportRow,
} from './import-mapping';
import {
  IMPORT_TARGETS,
  IMPORT_TARGET_ORDER,
  importTarget,
  fieldLabel,
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

/**
 * Ключ дедупликации строки по таблице (канон WAVE-DESKTOP-EXCEL-FORMS):
 * material/module — артикул, product — SKU, counterparty — ИНН.
 */
export const DEDUPE_KEYS: Record<ImportTargetKey, string> = {
  material: 'article',
  product: 'sku',
  module: 'article',
  counterparty: 'inn',
};

function textValue(row: RawRow, key: string): string {
  const value = row[key];
  return value === undefined || value === null ? '' : String(value).trim();
}

function numberValue(row: RawRow, key: string): number | undefined {
  const value = row[key];
  if (value === undefined || value === null || String(value).trim() === '') return undefined;
  const n = Number(String(value).replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Валидация строк для конкретной таблицы (TZD-50):
 *
 * - missing обязательных полей → `invalid`;
 * - material: кол-во должно быть числом > 0;
 * - product без SKU → `needs_review` (создание по имени без дедупа запрещено);
 * - повтор dedupe-ключа в файле → `duplicate`;
 * - совпадение dedupe-ключа с каталогом → `ok_update`;
 * - иначе → `ok_new`.
 *
 * На отправку (send) уходят только `ok_new` и `ok_update` — остальные
 * остаются в отчёте отклонений.
 */
export function validateTableRows(
  rows: RawRow[],
  targetKey: ImportTargetKey,
  existingKeys: ReadonlySet<string> = new Set(),
): ValidatedImportRow[] {
  const target = importTarget(targetKey);
  const dedupeKey = DEDUPE_KEYS[targetKey];
  const seen = new Map<string, number[]>();
  rows.forEach((row, index) => {
    const key = textValue(row, dedupeKey);
    if (!key) return;
    const indexes = seen.get(key) ?? [];
    indexes.push(index);
    seen.set(key, indexes);
  });

  return rows.map((values, rowIndex) => {
    const missing = target.requiredFields.filter((key) => !textValue(values, key));
    if (missing.length > 0) {
      return { rowIndex, values, status: 'invalid', message: `Пусто: ${missing.join(', ')}` };
    }
    if (targetKey === 'material') {
      const rawQty = values.qty;
      const hasQty = rawQty !== undefined && rawQty !== null && String(rawQty).trim() !== '';
      if (hasQty) {
        const quantity = numberValue(values, 'qty');
        if (quantity === undefined || quantity <= 0) {
          return { rowIndex, values, status: 'invalid', message: 'Количество должно быть числом больше нуля' };
        }
      }
    }
    if (targetKey === 'product' && !textValue(values, 'sku')) {
      return {
        rowIndex,
        values,
        status: 'needs_review',
        message: 'Пустой артикул (SKU) — без него нельзя проверить дубликат, создание по имени невозможно',
      };
    }
    const key = textValue(values, dedupeKey);
    if (key && (seen.get(key)?.length ?? 0) > 1) {
      return { rowIndex, values, status: 'duplicate', message: `Дубликат в файле: ${fieldLabel(targetKey, dedupeKey)} «${key}»` };
    }
    if (key && existingKeys.has(key)) {
      return { rowIndex, values, status: 'ok_update', message: 'Совпадение с каталогом — готово к обновлению' };
    }
    return { rowIndex, values, status: 'ok_new', message: 'Новая строка готова' };
  });
}
