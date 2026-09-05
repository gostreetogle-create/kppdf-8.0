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
  isReferenceTargetKey,
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
 * Ключ дедупликации строки по таблице (канон WAVE-DESKTOP-EXCEL-FORMS V1):
 * material/module — артикул, product — SKU, counterparty — ИНН.
 * Справочники (TZD-51) используют `referenceDedupeKeysOf` — их нет здесь.
 */
export const DEDUPE_KEYS: Partial<Record<ImportTargetKey, string>> = {
  material: 'article',
  product: 'sku',
  module: 'article',
  counterparty: 'inn',
};

/**
 * TZD-51 — нормализованные ключи дедупликации справочников. Одна и та же
 * функция работает и для строки Excel, и для записи каталога (обе — плоские
 * `Record<string, unknown>`), поэтому ключи в `existingKeys` и в строке всегда
 * сравнимы.
 *
 * - warehouse / workType: `name` trim + lower;
 * - colorReference: `name:<lower>` и (если задан) `slug:<exact>`;
 * - category: пара `cat:<type>|<slug>` и/или `prefix:<skuPrefix>`.
 */
export function referenceDedupeKeysOf(
  targetKey: ImportTargetKey,
  record: Record<string, unknown>,
): string[] {
  const lower = (value: unknown): string => String(value ?? '').trim().toLowerCase();
  const exact = (value: unknown): string => String(value ?? '').trim();
  const only = (keys: string[]): string[] => keys.filter(Boolean);
  switch (targetKey) {
    case 'warehouse':
    case 'workType':
      return only([lower(record.name)]);
    case 'colorReference':
      return only([
        `name:${lower(record.name)}`,
        record.slug ? `slug:${exact(record.slug)}` : '',
      ]);
    case 'category': {
      const type = lower(record.type);
      const slug = lower(record.slug);
      const prefix = exact(record.skuPrefix);
      const keys: string[] = [];
      if (type && slug) keys.push(`cat:${type}|${slug}`);
      if (prefix) keys.push(`prefix:${prefix}`);
      return keys;
    }
    default:
      return [];
  }
}

/**
 * TZD-69 — dedupe-ключ человека: email (lower) если непуст; иначе
 * lastName|firstName|patronymic casefold. Одна и та же функция для строки
 * файла и записи каталога (обе — плоские `Record<string, unknown>`).
 */
export function workerDedupeKeyOf(record: Record<string, unknown>): string {
  const email = String(record.email ?? '').trim().toLowerCase();
  if (email) return `email:${email}`;
  const parts = ['lastName', 'firstName', 'patronymic'].map((key) =>
    String(record[key] ?? '').trim().toLowerCase(),
  );
  return `name:${parts.join('|')}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** TZD-69 — валидация строк «Люди»: обязательные ФИО, email/ставка формат, известные виды работ, dedupe. */
function validateWorkerRows(
  rows: RawRow[],
  existingKeys: ReadonlySet<string>,
  workTypeNames: ReadonlySet<string>,
): ValidatedImportRow[] {
  const target = importTarget('worker');
  const knownNames = new Set([...workTypeNames].map((name) => name.trim().toLowerCase()));
  const seen = new Map<string, number[]>();
  rows.forEach((row, index) => {
    const key = workerDedupeKeyOf(row);
    const indexes = seen.get(key) ?? [];
    indexes.push(index);
    seen.set(key, indexes);
  });

  return rows.map((values, rowIndex) => {
    const missing = target.requiredFields.filter((key) => !textValue(values, key));
    if (missing.length > 0) {
      return { rowIndex, values, status: 'invalid', message: `Пусто: ${missing.join(', ')}` };
    }
    const email = textValue(values, 'email');
    if (email && !EMAIL_RE.test(email)) {
      return { rowIndex, values, status: 'invalid', message: 'Email: неверный формат' };
    }
    const rawRate = values.ratePerHour;
    const hasRate = rawRate !== undefined && rawRate !== null && String(rawRate).trim() !== '';
    if (hasRate) {
      const rate = numberValue(values, 'ratePerHour');
      if (rate === undefined || rate < 0) {
        return { rowIndex, values, status: 'invalid', message: 'Ставка ₽/час должна быть числом от 0' };
      }
    }
    const namesRaw = textValue(values, 'workTypeNames');
    if (namesRaw) {
      const names = namesRaw.split(';').map((name) => name.trim()).filter(Boolean);
      const unknown = names.filter((name) => !knownNames.has(name.toLowerCase()));
      if (unknown.length > 0) {
        return { rowIndex, values, status: 'invalid', message: `Неизвестный вид работ: ${unknown.join(', ')}` };
      }
    }
    const key = workerDedupeKeyOf(values);
    if ((seen.get(key)?.length ?? 0) > 1) {
      return { rowIndex, values, status: 'duplicate', message: 'Дубликат в файле' };
    }
    if (existingKeys.has(key)) {
      return { rowIndex, values, status: 'duplicate', message: 'Дубликат: уже есть в справочнике' };
    }
    return { rowIndex, values, status: 'ok_new', message: 'Новая строка готова' };
  });
}

/** Enum каталога для типа склада и типа категории (канон Nest DTO). */
const WAREHOUSE_TYPES = new Set(['main', 'branch', 'transit', 'production', 'other']);
const CATEGORY_TYPES = new Set(['material', 'product', 'general']);
const SUPPLY_REQUEST_PRIORITIES = new Set(['urgent', 'normal', 'low']);
const SUPPLY_REQUEST_STATUSES = new Set([
  'in_progress',
  'requested',
  'ordered',
  'received',
  'cancelled',
]);
const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/;

function isObjectId(value: string): boolean {
  return OBJECT_ID_RE.test(value);
}

/** TZD-51 — проверка значений строки справочника; null = ок, иначе RU-причина. */
function referenceFieldError(targetKey: ImportTargetKey, values: RawRow): string | null {
  switch (targetKey) {
    case 'warehouse': {
      const type = textValue(values, 'type').toLowerCase();
      if (type && !WAREHOUSE_TYPES.has(type)) {
        return 'Тип склада: main, branch, transit, production или other';
      }
      return null;
    }
    case 'workType': {
      const raw = values.hourlyRate;
      const has = raw !== undefined && raw !== null && String(raw).trim() !== '';
      if (has) {
        const rate = numberValue(values, 'hourlyRate');
        if (rate === undefined || rate < 0) {
          return 'Ставка ₽/час должна быть числом от 0';
        }
      }
      return null;
    }
    case 'colorReference': {
      const hex = textValue(values, 'hex');
      if (hex && !/^#[0-9A-Fa-f]{6}$/.test(hex)) {
        return 'Hex должен быть в формате #RRGGBB';
      }
      const slug = textValue(values, 'slug');
      if (slug && !/^[a-z0-9-]+$/.test(slug)) {
        return 'Slug: только строчные a-z, 0-9 и дефис';
      }
      return null;
    }
    case 'category': {
      const type = textValue(values, 'type').toLowerCase();
      if (!CATEGORY_TYPES.has(type)) {
        return 'Тип категории: material, product или general';
      }
      const slug = textValue(values, 'slug');
      if (!/^[a-z0-9-]+$/.test(slug)) {
        return 'Slug: только строчные a-z, 0-9 и дефис';
      }
      const prefix = textValue(values, 'skuPrefix');
      if (!/^[A-Z0-9-]+$/.test(prefix)) {
        return 'Префикс SKU: заглавные A-Z, 0-9 и дефис';
      }
      return null;
    }
    default:
      return null;
  }
}

/** TZD-51 — валидация строк справочника (обязательные поля + типы + dedupe). */
function validateReferenceRows(
  rows: RawRow[],
  targetKey: ImportTargetKey,
  existingKeys: ReadonlySet<string>,
): ValidatedImportRow[] {
  const target = importTarget(targetKey);
  const seen = new Map<string, number[]>();
  rows.forEach((row, index) => {
    for (const key of referenceDedupeKeysOf(targetKey, row)) {
      const indexes = seen.get(key) ?? [];
      indexes.push(index);
      seen.set(key, indexes);
    }
  });

  return rows.map((values, rowIndex) => {
    const missing = target.requiredFields.filter((key) => !textValue(values, key));
    if (missing.length > 0) {
      return { rowIndex, values, status: 'invalid', message: `Пусто: ${missing.join(', ')}` };
    }
    const fieldError = referenceFieldError(targetKey, values);
    if (fieldError) {
      return { rowIndex, values, status: 'invalid', message: fieldError };
    }
    const keys = referenceDedupeKeysOf(targetKey, values);
    const inFile = keys.find((key) => (seen.get(key)?.length ?? 0) > 1);
    if (inFile) {
      return { rowIndex, values, status: 'duplicate', message: 'Дубликат в файле' };
    }
    if (keys.some((key) => existingKeys.has(key))) {
      return { rowIndex, values, status: 'duplicate', message: 'Дубликат: уже есть в справочнике' };
    }
    return { rowIndex, values, status: 'ok_new', message: 'Новая строка готова' };
  });
}

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
  workTypeNames: ReadonlySet<string> = new Set(),
): ValidatedImportRow[] {
  if (targetKey === 'worker') {
    return validateWorkerRows(rows, existingKeys, workTypeNames);
  }
  if (isReferenceTargetKey(targetKey)) {
    return validateReferenceRows(rows, targetKey, existingKeys);
  }
  if (targetKey === 'supplyRequest' || targetKey === 'supplyTask') {
    return validateSupplyRows(rows, targetKey);
  }
  const target = importTarget(targetKey);
  const dedupeKey = DEDUPE_KEYS[targetKey] ?? '';
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

/** TZ-QA-445G — валидация строк снабжения (без каталожного dedupe). */
function validateSupplyRows(
  rows: RawRow[],
  targetKey: 'supplyRequest' | 'supplyTask',
): ValidatedImportRow[] {
  const target = importTarget(targetKey);
  return rows.map((values, rowIndex) => {
    const missing = target.requiredFields.filter((key) => !textValue(values, key));
    if (missing.length > 0) {
      return { rowIndex, values, status: 'invalid', message: `Пусто: ${missing.join(', ')}` };
    }

    if (targetKey === 'supplyRequest') {
      const priority = textValue(values, 'priority').toLowerCase();
      if (priority && !SUPPLY_REQUEST_PRIORITIES.has(priority)) {
        return {
          rowIndex,
          values,
          status: 'invalid',
          message: 'Приоритет: urgent, normal или low',
        };
      }
      const status = textValue(values, 'status').toLowerCase();
      if (status && !SUPPLY_REQUEST_STATUSES.has(status)) {
        return {
          rowIndex,
          values,
          status: 'invalid',
          message: 'Статус: in_progress, requested, ordered, received или cancelled',
        };
      }
      const rawQty = values.qty;
      const hasQty = rawQty !== undefined && rawQty !== null && String(rawQty).trim() !== '';
      if (hasQty) {
        const quantity = numberValue(values, 'qty');
        if (quantity === undefined || quantity < 0) {
          return { rowIndex, values, status: 'invalid', message: 'Количество должно быть числом от 0' };
        }
      }
      for (const idKey of ['orderId', 'materialId', 'supplierId'] as const) {
        const id = textValue(values, idKey);
        if (id && !isObjectId(id)) {
          return {
            rowIndex,
            values,
            status: 'invalid',
            message: `${fieldLabel(targetKey, idKey)}: ожидается Mongo ObjectId (24 hex)`,
          };
        }
      }
      return { rowIndex, values, status: 'ok_new', message: 'Новая строка готова' };
    }

    // supplyTask
    const orderId = textValue(values, 'orderId');
    if (!isObjectId(orderId)) {
      return {
        rowIndex,
        values,
        status: 'invalid',
        message: 'ID заказа: ожидается Mongo ObjectId (24 hex)',
      };
    }
    const quantity = numberValue(values, 'qty');
    if (quantity === undefined || quantity < 0) {
      return { rowIndex, values, status: 'invalid', message: 'Количество должно быть числом от 0' };
    }
    const title = textValue(values, 'title');
    const materialId = textValue(values, 'materialId');
    const moduleId = textValue(values, 'moduleId');
    if (!title && !materialId && !moduleId) {
      return {
        rowIndex,
        values,
        status: 'invalid',
        message: 'Укажите наименование или ID материала/модуля',
      };
    }
    for (const idKey of ['materialId', 'moduleId'] as const) {
      const id = textValue(values, idKey);
      if (id && !isObjectId(id)) {
        return {
          rowIndex,
          values,
          status: 'invalid',
          message: `${fieldLabel(targetKey, idKey)}: ожидается Mongo ObjectId (24 hex)`,
        };
      }
    }
    return { rowIndex, values, status: 'ok_new', message: 'Новая строка готова' };
  });
}
