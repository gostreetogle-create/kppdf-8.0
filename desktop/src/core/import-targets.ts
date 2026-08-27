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

export type ImportTargetKey =
  | 'material'
  | 'product'
  | 'module'
  | 'counterparty'
  | 'warehouse'
  | 'workType'
  | 'colorReference'
  | 'category'
  | 'supplyRequest'
  | 'supplyTask';

/** TZD-51 — справочники (пишутся сразу после confirm, без журнала предложений). */
export const REFERENCE_TARGET_KEYS: readonly ImportTargetKey[] = [
  'warehouse',
  'workType',
  'colorReference',
  'category',
];

export function isReferenceTargetKey(key: ImportTargetKey): boolean {
  return (REFERENCE_TARGET_KEYS as readonly string[]).includes(key);
}

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
  warehouse: {
    key: 'warehouse',
    label: 'Склады',
    requiredFields: ['name'],
    columns: [
      { key: 'name', label: 'Наименование', aliases: ['name', 'наименование', 'название', 'склад', 'название склада', 'наименование склада'] },
      { key: 'type', label: 'Тип', aliases: ['type', 'тип', 'тип склада'] },
      { key: 'address', label: 'Адрес', aliases: ['address', 'адрес', 'адрес склада'] },
      { key: 'description', label: 'Описание', aliases: ['description', 'описание', 'примечание', 'комментарий'] },
    ],
  },
  workType: {
    key: 'workType',
    label: 'Виды работ',
    requiredFields: ['name', 'hourlyRate'],
    columns: [
      { key: 'name', label: 'Наименование', aliases: ['name', 'наименование', 'название', 'вид работ', 'вид работы', 'работа'] },
      { key: 'hourlyRate', label: 'Ставка ₽/час', aliases: ['hourlyrate', 'ставка', 'ставка ₽/час', 'ставка руб/час', 'ставка в час', 'расценка', 'цена часа', 'руб/час'] },
      { key: 'section', label: 'Участок', aliases: ['section', 'участок', 'отдел', 'цех'] },
      { key: 'description', label: 'Описание', aliases: ['description', 'описание'] },
      { key: 'days', label: 'Дни (Gantt)', aliases: ['days', 'дни', 'дней', 'дни (gantt)', 'длительность'] },
    ],
  },
  colorReference: {
    key: 'colorReference',
    label: 'Цвета (RAL)',
    requiredFields: ['name'],
    columns: [
      { key: 'name', label: 'Наименование', aliases: ['name', 'наименование', 'название', 'цвет', 'ral', 'цвет ral', 'наименование цвета'] },
      { key: 'hex', label: 'Hex (#RRGGBB)', aliases: ['hex', 'hex код', 'цвет hex', 'hexcolor', 'шестнадцатеричный', '#rrggbb'] },
      { key: 'description', label: 'Описание', aliases: ['description', 'описание', 'примечание'] },
    ],
  },
  category: {
    key: 'category',
    label: 'Категории',
    requiredFields: ['name', 'type', 'slug', 'skuPrefix'],
    columns: [
      { key: 'name', label: 'Наименование', aliases: ['name', 'наименование', 'название', 'категория', 'название категории'] },
      { key: 'type', label: 'Тип', aliases: ['type', 'тип', 'тип категории'] },
      { key: 'slug', label: 'Slug', aliases: ['slug', 'слаг', 'slug категории', 'код категории'] },
      { key: 'skuPrefix', label: 'Префикс SKU', aliases: ['skuprefix', 'префикс sku', 'префикс', 'sku префикс', 'префикс артикула'] },
      { key: 'description', label: 'Описание', aliases: ['description', 'описание', 'примечание'] },
    ],
  },
  /** TZ-QA-445G — быстрый заказ (SupplyRequest), без обязательного orderId. */
  supplyRequest: {
    key: 'supplyRequest',
    label: 'Быстрый заказ',
    requiredFields: ['title'],
    columns: [
      { key: 'title', label: 'Наименование', aliases: ['title', 'наименование', 'название', 'позиция', 'что заказать'] },
      { key: 'article', label: 'Артикул', aliases: ['article', 'артикул', 'обозначение', 'код'] },
      { key: 'qty', label: 'Кол-во', aliases: ['qty', 'quantity', 'количество', 'кол-во', 'кол', 'к-во'] },
      { key: 'unit', label: 'Ед. изм.', aliases: ['unit', 'ед', 'ед.', 'единица', 'ед. изм.', 'ед.изм'] },
      { key: 'priority', label: 'Приоритет', aliases: ['priority', 'приоритет', 'срочность'] },
      { key: 'status', label: 'Статус', aliases: ['status', 'статус'] },
      { key: 'notes', label: 'Примечание', aliases: ['notes', 'примечание', 'комментарий', 'заметки'] },
      { key: 'priceHint', label: 'Цена (ориентир)', aliases: ['pricehint', 'цена', 'цена ориентир', 'ориентир цены'] },
      { key: 'neededBy', label: 'Нужно к', aliases: ['neededby', 'нужно к', 'срок', 'дата'] },
      { key: 'requestedBy', label: 'Кто просил', aliases: ['requestedby', 'кто просил', 'участок', 'отдел'] },
      { key: 'responsible', label: 'Ответственный', aliases: ['responsible', 'ответственный', 'снабженец'] },
      { key: 'productUrl', label: 'Ссылка', aliases: ['producturl', 'ссылка', 'url', 'url товара'] },
      { key: 'color', label: 'Цвет', aliases: ['color', 'цвет'] },
      { key: 'orderId', label: 'ID заказа', aliases: ['orderid', 'id заказа', 'заказ'] },
      { key: 'materialId', label: 'ID материала', aliases: ['materialid', 'id материала'] },
      { key: 'supplierId', label: 'ID поставщика', aliases: ['supplierid', 'id поставщика', 'поставщик'] },
    ],
  },
  /** TZ-QA-445G — реестр SupplyTask (нужен ID заказа). */
  supplyTask: {
    key: 'supplyTask',
    label: 'Задачи снабжения',
    requiredFields: ['orderId', 'qty'],
    columns: [
      { key: 'orderId', label: 'ID заказа', aliases: ['orderid', 'id заказа', 'заказ'] },
      { key: 'title', label: 'Наименование', aliases: ['title', 'наименование', 'название', 'позиция'] },
      { key: 'qty', label: 'Кол-во', aliases: ['qty', 'quantity', 'количество', 'кол-во', 'кол', 'к-во'] },
      { key: 'notes', label: 'Примечание', aliases: ['notes', 'примечание', 'комментарий'] },
      { key: 'materialId', label: 'ID материала', aliases: ['materialid', 'id материала'] },
      { key: 'moduleId', label: 'ID модуля', aliases: ['moduleid', 'id модуля'] },
      { key: 'orderLineId', label: 'ID линии заказа', aliases: ['orderlineid', 'линия заказа', 'order line'] },
    ],
  },
} as const satisfies Record<ImportTargetKey, ImportTarget>;

export type ImportTargetTable = (typeof IMPORT_TARGETS)[ImportTargetKey];

/** Порядок таблиц для UI (сначала самые частые). */
export const IMPORT_TARGET_ORDER: ImportTargetKey[] = [
  'material',
  'product',
  'module',
  'counterparty',
  'warehouse',
  'workType',
  'colorReference',
  'category',
  'supplyRequest',
  'supplyTask',
];

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
