/**
 * Каталог импорт-таблиц: целевые сущности, в которые мини-агент может
 * сопоставлять колонки Excel. Для каждой таблицы — канонические поля
 * с русскими подписями (как на сайте) и алиасами заголовков Excel.
 *
 * Это «библиотека таблиц» агента — источник истины для автоподбора
 * (аналог реестра `GET /api/registry/data-sources` для импорта).
 */

export interface ImportTargetColumn {
  /** Канонический ключ поля (как в API/DTO). */
  key: string;
  /** Русская подпись, как на сайте. */
  label: string;
  /** Алиасы заголовков Excel (без учёта регистра/пробелов). */
  aliases: readonly string[];
}

export interface ImportTarget {
  key: ImportTargetKey;
  /** Русское имя таблицы (множественное, для UI). */
  label: string;
  columns: readonly ImportTargetColumn[];
  /** Поля, без которых строка не валидна. */
  requiredFields: readonly string[];
}

export type ImportTargetKey = 'material' | 'product' | 'module' | 'counterparty';

export const IMPORT_TARGETS = {
  material: {
    key: 'material',
    label: 'Материалы',
    requiredFields: ['article', 'name'],
    columns: [
      { key: 'article', label: 'Артикул', aliases: ['article', 'артикул', 'обозначение', 'код изделия', 'код'] },
      { key: 'name', label: 'Наименование', aliases: ['name', 'наименование', 'название', 'материал', 'описание', 'текст'] },
      { key: 'unit', label: 'Ед. изм.', aliases: ['unit', 'ед', 'ед.', 'единица', 'ед. изм.', 'ед.изм', 'единицы'] },
      { key: 'qty', label: 'Кол-во', aliases: ['qty', 'quantity', 'количество', 'кол-во', 'кол', 'к-во'] },
      { key: 'sku', label: 'Код (SKU)', aliases: ['sku', 'штрихкод', 'код товара'] },
      { key: 'notes', label: 'Примечание', aliases: ['notes', 'примечание', 'примечания', 'комментарий', 'комментарии', 'заметки'] },
      { key: 'categoryId', label: 'Категория', aliases: ['categoryid', 'категория', 'category', 'тип элемента', 'тип'] },
    ],
  },
  product: {
    key: 'product',
    label: 'Изделия',
    requiredFields: ['name'],
    columns: [
      { key: 'name', label: 'Наименование', aliases: ['name', 'наименование', 'название'] },
      { key: 'sku', label: 'Артикул (SKU)', aliases: ['sku', 'артикул', 'обозначение', 'код изделия', 'код'] },
      { key: 'kind', label: 'Вид', aliases: ['kind', 'вид', 'тип', 'тип элемента', 'категория', 'вид изделия'] },
      { key: 'unit', label: 'Единица измерения', aliases: ['unit', 'ед', 'ед.', 'единица', 'ед. изм.', 'ед.изм'] },
      { key: 'description', label: 'Описание', aliases: ['description', 'описание'] },
      { key: 'notes', label: 'Примечания', aliases: ['notes', 'примечание', 'примечания', 'комментарий', 'комментарии'] },
      { key: 'listPrice', label: 'Прайсовая цена', aliases: ['listprice', 'цена', 'цена продажи', 'прайс'] },
      { key: 'costPrice', label: 'Себестоимость', aliases: ['costprice', 'себестоимость', 'закупочная цена'] },
      { key: 'stockQty', label: 'Остаток на складе', aliases: ['stockqty', 'остаток', 'остаток на складе', 'количество', 'кол-во', 'кол', 'к-во'] },
      { key: 'ralCode', label: 'Код RAL', aliases: ['ral', 'ralcode', 'код ral'] },
      { key: 'dimensions.length', label: 'Длина', aliases: ['длина', 'length'] },
      { key: 'dimensions.width', label: 'Ширина', aliases: ['ширина', 'width'] },
      { key: 'dimensions.height', label: 'Высота', aliases: ['высота', 'толщина', 'height'] },
      { key: 'weightKg', label: 'Масса, кг', aliases: ['масса', 'вес', 'weight', 'mass', 'кг'] },
    ],
  },
  module: {
    key: 'module',
    label: 'Модули',
    requiredFields: ['article'],
    columns: [
      { key: 'article', label: 'Артикул', aliases: ['article', 'артикул', 'обозначение', 'код изделия', 'код'] },
      { key: 'name', label: 'Наименование', aliases: ['name', 'наименование', 'название', 'сортамент'] },
      { key: 'unit', label: 'Единица измерения', aliases: ['unit', 'ед', 'ед.', 'единица', 'ед. изм.', 'ед.изм'] },
      { key: 'notes', label: 'Примечание', aliases: ['notes', 'примечание', 'примечания', 'комментарий'] },
      { key: 'dimensions.length', label: 'Длина', aliases: ['длина', 'length'] },
      { key: 'dimensions.width', label: 'Ширина', aliases: ['ширина', 'width'] },
      { key: 'dimensions.height', label: 'Высота', aliases: ['высота', 'толщина', 'height'] },
      { key: 'weightKg', label: 'Масса, кг', aliases: ['масса', 'вес', 'weight', 'mass', 'кг'] },
    ],
  },
  counterparty: {
    key: 'counterparty',
    label: 'Контрагенты',
    requiredFields: ['name', 'inn'],
    columns: [
      { key: 'name', label: 'Наименование', aliases: ['name', 'наименование', 'контрагент', 'клиент', 'компания', 'организация', 'название'] },
      { key: 'shortName', label: 'Краткое наименование', aliases: ['shortname', 'краткое наименование', 'сокращённое наименование'] },
      { key: 'inn', label: 'ИНН', aliases: ['inn', 'инн', 'иин'] },
      { key: 'kpp', label: 'КПП', aliases: ['kpp', 'кпп'] },
      { key: 'ogrn', label: 'ОГРН', aliases: ['ogrn', 'огрн'] },
      { key: 'legalForm', label: 'Орг.-правовая форма', aliases: ['legalform', 'форма', 'организационно-правовая форма', 'опф'] },
      { key: 'bankName', label: 'Банк', aliases: ['bankname', 'банк', 'наименование банка'] },
      { key: 'bankBik', label: 'БИК', aliases: ['bankbik', 'бик'] },
      { key: 'bankAccount', label: 'Расчётный счёт', aliases: ['bankaccount', 'расчётный счёт', 'расчетный счет', 'р/с'] },
      { key: 'bankCorrAccount', label: 'Корр. счёт', aliases: ['bankcorraccount', 'корр. счёт', 'корсчет', 'к/с'] },
      { key: 'directorName', label: 'Директор', aliases: ['directorname', 'директор', 'руководитель'] },
    ],
  },
} as const satisfies Record<ImportTargetKey, ImportTarget>;

export type ImportTargetTable = (typeof IMPORT_TARGETS)[ImportTargetKey];

/** Порядок таблиц для UI (сначала самые частые). */
export const IMPORT_TARGET_ORDER: ImportTargetKey[] = ['material', 'product', 'module', 'counterparty'];

export function importTarget(key: ImportTargetKey): ImportTargetTable {
  return IMPORT_TARGETS[key];
}

/** True, если строка — известная целевая таблица (guard для профилей с БЭ). */
export function isImportTargetKey(key: string): key is ImportTargetKey {
  return key in IMPORT_TARGETS;
}

/** Русская подпись поля таблицы (или сам ключ, если поля нет). */
export function fieldLabel(targetKey: ImportTargetKey, fieldKey: string): string {
  const column = IMPORT_TARGETS[targetKey].columns.find((c) => c.key === fieldKey);
  return column?.label ?? fieldKey;
}
