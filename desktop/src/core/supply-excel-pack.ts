/**
 * TZ-DESKTOP-SUPPLY-EXCEL-B — multi-sheet шаблон снабжения (Excel-путь B).
 *
 * Один .xlsx: лист «Заявки» (пусто, для заполнения) + три справочных листа
 * (Материалы/Поставщики/Заказы) со снимком текущих данных из API. На «Заявки»
 * колонки «Артикул» / «Поставщик» / «№ заказа» несут нативную Excel
 * data validation (выпадающий список) со ссылкой на соответствующий
 * справочный лист — выбор гарантирует совпадение при импорте (те же
 * match-правила, что и путь A: `multi-import.ts` `validateSupplyRows`).
 *
 * `xlsx` (SheetJS Community) не пишет data validation — это Pro-фича.
 * Генератор поэтому использует `exceljs` (пишет и читает `<dataValidations>`
 * по спецификации OOXML); импорт назад по-прежнему идёт через существующий
 * `xlsx`-парсер (`importers/excel.ts`), который уже умеет multi-sheet preview
 * и выбор активного листа — межбиблиотечная совместимость проверена round-trip
 * тестом (exceljs write → xlsx read).
 */

import ExcelJS from 'exceljs';
import { IMPORT_TARGETS, type ImportTargetColumn } from './import-targets';

export const SUPPLY_PACK_SHEET_REQUESTS = 'Заявки';
export const SUPPLY_PACK_SHEET_MATERIALS = 'Материалы';
export const SUPPLY_PACK_SHEET_SUPPLIERS = 'Поставщики';
export const SUPPLY_PACK_SHEET_ORDERS = 'Заказы';

/** Пустых строк для заполнения на листе «Заявки» — с запасом на одну сессию ввода. */
export const SUPPLY_PACK_TEMPLATE_ROWS = 200;

export interface SupplyPackMaterial {
  readonly article: string;
  readonly name: string;
}

export interface SupplyPackSupplier {
  readonly name: string;
}

export interface SupplyPackOrder {
  readonly number: string;
}

export interface SupplyPackData {
  readonly materials: readonly SupplyPackMaterial[];
  readonly suppliers: readonly SupplyPackSupplier[];
  readonly orders: readonly SupplyPackOrder[];
}

/**
 * Колонки «Заявки»: те же канонические поля `supplyRequest` (единый источник
 * подписей/алиасов с путём A), кроме сырых ObjectId-полей (заполняются
 * матчингом при импорте, не руками) и `status` (по умолчанию на сервере).
 */
const EXCLUDED_REQUEST_COLUMN_KEYS: ReadonlySet<string> = new Set([
  'orderId',
  'materialId',
  'supplierId',
  'status',
]);

export const SUPPLY_PACK_REQUEST_COLUMNS: readonly ImportTargetColumn[] =
  IMPORT_TARGETS.supplyRequest.columns.filter((column) => !EXCLUDED_REQUEST_COLUMN_KEYS.has(column.key));

/** 1-based индекс колонки «Заявки» по ключу (для data validation и ширины). */
function requestColumnIndex(key: string): number {
  const index = SUPPLY_PACK_REQUEST_COLUMNS.findIndex((column) => column.key === key);
  if (index === -1) {
    throw new Error(`Колонка «${key}» не найдена среди колонок листа «Заявки» (проверь EXCLUDED_REQUEST_COLUMN_KEYS).`);
  }
  return index + 1;
}

/** Базовая конвертация 1-based индекса колонки в букву Excel (1→A, 27→AA). */
export function columnLetter(index: number): string {
  let n = index;
  let letters = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    letters = String.fromCharCode(65 + rem) + letters;
    n = Math.floor((n - 1) / 26);
  }
  return letters;
}

function uniqueNonEmpty(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
  }
  return result;
}

/** Диапазон data validation: минимум одна строка данных, даже если справочник пуст. */
function referenceRange(sheetName: string, count: number): string {
  const lastRow = Math.max(2, count + 1);
  return `${sheetName}!$A$2:$A$${lastRow}`;
}

function buildReferenceSheet(
  workbook: ExcelJS.Workbook,
  name: string,
  columns: readonly string[],
  rows: readonly (readonly string[])[],
): void {
  const sheet = workbook.addWorksheet(name);
  sheet.addRow([...columns]);
  for (const row of rows) sheet.addRow([...row]);
  sheet.columns = columns.map((label) => ({ width: Math.min(40, Math.max(14, label.length + 4)) }));
}

/** Собрать книгу пути B: «Заявки» (пусто, с dropdown) + три справочных листа. */
export function buildSupplyExcelPackWorkbook(data: SupplyPackData): ExcelJS.Workbook {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'kppdf-desktop';
  workbook.created = new Date();

  const articles = uniqueNonEmpty(data.materials.map((m) => m.article));
  const supplierNames = uniqueNonEmpty(data.suppliers.map((s) => s.name));
  const orderNumbers = uniqueNonEmpty(data.orders.map((o) => o.number));

  // «Заявки» первым листом — это активный лист по умолчанию (importers/excel.ts
  // выбирает первый непустой лист; пока шаблон не заполнен, «Заявки» пуст, и это
  // ожидаемо — импортировать пока нечего).
  const requests = workbook.addWorksheet(SUPPLY_PACK_SHEET_REQUESTS);
  requests.addRow(SUPPLY_PACK_REQUEST_COLUMNS.map((column) => column.label));
  requests.columns = SUPPLY_PACK_REQUEST_COLUMNS.map((column) => ({
    width: Math.min(32, Math.max(10, column.label.length + 4)),
  }));

  buildReferenceSheet(
    workbook,
    SUPPLY_PACK_SHEET_MATERIALS,
    ['Артикул', 'Наименование'],
    data.materials.map((m) => [m.article, m.name]),
  );
  buildReferenceSheet(workbook, SUPPLY_PACK_SHEET_SUPPLIERS, ['Наименование'], data.suppliers.map((s) => [s.name]));
  buildReferenceSheet(workbook, SUPPLY_PACK_SHEET_ORDERS, ['Номер'], data.orders.map((o) => [o.number]));

  const lastRow = SUPPLY_PACK_TEMPLATE_ROWS + 1;
  const dropdowns: readonly [key: string, sheet: string, count: number][] = [
    ['article', SUPPLY_PACK_SHEET_MATERIALS, articles.length],
    ['supplierName', SUPPLY_PACK_SHEET_SUPPLIERS, supplierNames.length],
    ['orderNumber', SUPPLY_PACK_SHEET_ORDERS, orderNumbers.length],
  ];
  for (const [key, sheetName, count] of dropdowns) {
    const col = columnLetter(requestColumnIndex(key));
    requests.dataValidations.add(`${col}2:${col}${lastRow}`, {
      type: 'list',
      allowBlank: true,
      formulae: [referenceRange(sheetName, count)],
      showErrorMessage: true,
      errorStyle: 'warning',
      errorTitle: 'Не из списка',
      error: 'Значения нет в справочнике — можно оставить, но проверьте совпадение при импорте.',
    });
  }

  return workbook;
}

/** Сериализовать книгу пути B в байты .xlsx для сохранения на диск. */
export async function serializeSupplyExcelPack(data: SupplyPackData): Promise<Uint8Array> {
  const workbook = buildSupplyExcelPackWorkbook(data);
  const buffer = await workbook.xlsx.writeBuffer();
  return new Uint8Array(buffer);
}
