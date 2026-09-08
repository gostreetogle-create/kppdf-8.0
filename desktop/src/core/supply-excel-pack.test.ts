import assert from 'node:assert/strict';
import test from 'node:test';
import ExcelJS from 'exceljs';
import { parseExcelWorkbook } from '../importers/excel';
import {
  SUPPLY_PACK_REQUEST_COLUMNS,
  SUPPLY_PACK_SHEET_MATERIALS,
  SUPPLY_PACK_SHEET_ORDERS,
  SUPPLY_PACK_SHEET_REQUESTS,
  SUPPLY_PACK_SHEET_SUPPLIERS,
  buildSupplyExcelPackWorkbook,
  columnLetter,
  serializeSupplyExcelPack,
  type SupplyPackData,
} from './supply-excel-pack';

const SAMPLE: SupplyPackData = {
  materials: [
    { article: 'ART-1', name: 'Профиль 40x40' },
    { article: 'ART-2', name: 'Заглушка' },
  ],
  suppliers: [{ name: 'ООО Металл' }, { name: 'ООО Крепёж' }],
  orders: [{ number: 'ORD-001' }, { number: 'ORD-002' }],
};

test('columnLetter: base-26 conversion (1→A, 26→Z, 27→AA)', () => {
  assert.equal(columnLetter(1), 'A');
  assert.equal(columnLetter(26), 'Z');
  assert.equal(columnLetter(27), 'AA');
});

test('SUPPLY_PACK_REQUEST_COLUMNS excludes raw ObjectId/status fields, keeps match columns', () => {
  const keys = SUPPLY_PACK_REQUEST_COLUMNS.map((c) => c.key);
  assert.ok(!keys.includes('orderId'));
  assert.ok(!keys.includes('materialId'));
  assert.ok(!keys.includes('supplierId'));
  assert.ok(!keys.includes('status'));
  assert.ok(keys.includes('title'));
  assert.ok(keys.includes('article'));
  assert.ok(keys.includes('supplierName'));
  assert.ok(keys.includes('orderNumber'));
});

test('builds four sheets with «Заявки» first (default active sheet once filled)', () => {
  const workbook = buildSupplyExcelPackWorkbook(SAMPLE);
  assert.deepEqual(workbook.worksheets.map((ws) => ws.name), [
    SUPPLY_PACK_SHEET_REQUESTS,
    SUPPLY_PACK_SHEET_MATERIALS,
    SUPPLY_PACK_SHEET_SUPPLIERS,
    SUPPLY_PACK_SHEET_ORDERS,
  ]);
});

test('«Заявки» header row matches SUPPLY_PACK_REQUEST_COLUMNS labels', () => {
  const workbook = buildSupplyExcelPackWorkbook(SAMPLE);
  const requests = workbook.getWorksheet(SUPPLY_PACK_SHEET_REQUESTS)!;
  const header = (requests.getRow(1).values as unknown[]).slice(1).map(String);
  assert.deepEqual(header, SUPPLY_PACK_REQUEST_COLUMNS.map((c) => c.label));
});

test('reference sheets carry the API snapshot (Материалы has article + name)', () => {
  const workbook = buildSupplyExcelPackWorkbook(SAMPLE);
  const materials = workbook.getWorksheet(SUPPLY_PACK_SHEET_MATERIALS)!;
  assert.deepEqual((materials.getRow(1).values as unknown[]).slice(1), ['Артикул', 'Наименование']);
  assert.deepEqual((materials.getRow(2).values as unknown[]).slice(1), ['ART-1', 'Профиль 40x40']);
  assert.deepEqual((materials.getRow(3).values as unknown[]).slice(1), ['ART-2', 'Заглушка']);

  const suppliers = workbook.getWorksheet(SUPPLY_PACK_SHEET_SUPPLIERS)!;
  assert.deepEqual((suppliers.getRow(2).values as unknown[]).slice(1), ['ООО Металл']);

  const orders = workbook.getWorksheet(SUPPLY_PACK_SHEET_ORDERS)!;
  assert.deepEqual((orders.getRow(2).values as unknown[]).slice(1), ['ORD-001']);
});

// exceljs's in-memory (pre-serialize) DataValidations.find() does an exact-key
// lookup on the same range string passed to .add() — only after a write/reload
// round-trip does exceljs re-key the model per individual cell address (covered
// by the round-trip test below). Look up by the same full range here.
const LAST_ROW = 201; // SUPPLY_PACK_TEMPLATE_ROWS + 1

test('«Заявки» carries list data validation for Артикул/Поставщик/№ заказа pointing at the reference sheets', () => {
  const workbook = buildSupplyExcelPackWorkbook(SAMPLE);
  const requests = workbook.getWorksheet(SUPPLY_PACK_SHEET_REQUESTS)!;
  const articleCol = columnLetter(SUPPLY_PACK_REQUEST_COLUMNS.findIndex((c) => c.key === 'article') + 1);
  const supplierCol = columnLetter(SUPPLY_PACK_REQUEST_COLUMNS.findIndex((c) => c.key === 'supplierName') + 1);
  const orderCol = columnLetter(SUPPLY_PACK_REQUEST_COLUMNS.findIndex((c) => c.key === 'orderNumber') + 1);

  const articleValidation = requests.dataValidations.find(`${articleCol}2:${articleCol}${LAST_ROW}`);
  assert.equal(articleValidation?.type, 'list');
  assert.deepEqual(articleValidation?.formulae, [`${SUPPLY_PACK_SHEET_MATERIALS}!$A$2:$A$3`]);

  const supplierValidation = requests.dataValidations.find(`${supplierCol}2:${supplierCol}${LAST_ROW}`);
  assert.deepEqual(supplierValidation?.formulae, [`${SUPPLY_PACK_SHEET_SUPPLIERS}!$A$2:$A$3`]);

  const orderValidation = requests.dataValidations.find(`${orderCol}2:${orderCol}${LAST_ROW}`);
  assert.deepEqual(orderValidation?.formulae, [`${SUPPLY_PACK_SHEET_ORDERS}!$A$2:$A$3`]);
});

test('empty reference lists still produce a valid (non-zero-height) validation range', () => {
  const empty: SupplyPackData = { materials: [], suppliers: [], orders: [] };
  const workbook = buildSupplyExcelPackWorkbook(empty);
  const requests = workbook.getWorksheet(SUPPLY_PACK_SHEET_REQUESTS)!;
  const articleCol = columnLetter(SUPPLY_PACK_REQUEST_COLUMNS.findIndex((c) => c.key === 'article') + 1);
  const validation = requests.dataValidations.find(`${articleCol}2:${articleCol}${LAST_ROW}`);
  assert.deepEqual(validation?.formulae, [`${SUPPLY_PACK_SHEET_MATERIALS}!$A$2:$A$2`]);
});

test('round-trip through exceljs itself preserves the data validations', async () => {
  const bytes = await serializeSupplyExcelPack(SAMPLE);
  const reloaded = new ExcelJS.Workbook();
  await reloaded.xlsx.load(bytes);
  const requests = reloaded.getWorksheet(SUPPLY_PACK_SHEET_REQUESTS)!;
  const articleCol = columnLetter(SUPPLY_PACK_REQUEST_COLUMNS.findIndex((c) => c.key === 'article') + 1);
  const validation = requests.dataValidations.find(`${articleCol}2`);
  assert.equal(validation?.type, 'list');
});

test('round-trip through the existing xlsx (SheetJS) importer used at runtime for the import side', async () => {
  const bytes = await serializeSupplyExcelPack(SAMPLE);
  const preview = await parseExcelWorkbook({ name: 'kppdf-supply-pack.xlsx', data: bytes });
  const names = preview.sheets.map((s) => s.name);
  assert.deepEqual(names, [
    SUPPLY_PACK_SHEET_REQUESTS,
    SUPPLY_PACK_SHEET_MATERIALS,
    SUPPLY_PACK_SHEET_SUPPLIERS,
    SUPPLY_PACK_SHEET_ORDERS,
  ]);
  // «Заявки» is blank (template, nothing filled yet) — the importer's own
  // heuristic picks the first sheet that actually has rows, which is
  // «Материалы» here; this is expected/correct until the user fills «Заявки».
  const materialsSheet = preview.sheets.find((s) => s.name === SUPPLY_PACK_SHEET_MATERIALS)!;
  assert.deepEqual(materialsSheet.rows, [
    { Артикул: 'ART-1', Наименование: 'Профиль 40x40' },
    { Артикул: 'ART-2', Наименование: 'Заглушка' },
  ]);
});

test('once «Заявки» is filled, the importer picks it as the active sheet by default', async () => {
  const workbook = buildSupplyExcelPackWorkbook(SAMPLE);
  const requests = workbook.getWorksheet(SUPPLY_PACK_SHEET_REQUESTS)!;
  const titleCol = columnLetter(SUPPLY_PACK_REQUEST_COLUMNS.findIndex((c) => c.key === 'title') + 1);
  const articleCol = columnLetter(SUPPLY_PACK_REQUEST_COLUMNS.findIndex((c) => c.key === 'article') + 1);
  requests.getCell(`${titleCol}2`).value = 'Профиль 40x40';
  requests.getCell(`${articleCol}2`).value = 'ART-1';
  const bytes = new Uint8Array(await workbook.xlsx.writeBuffer());

  const preview = await parseExcelWorkbook({ name: 'kppdf-supply-pack.xlsx', data: bytes });
  assert.equal(preview.activeSheet, SUPPLY_PACK_SHEET_REQUESTS);
  const requestsRows = preview.sheets.find((s) => s.name === SUPPLY_PACK_SHEET_REQUESTS)!.rows;
  assert.equal(requestsRows.length, 1);
  assert.equal(requestsRows[0]['Наименование'], 'Профиль 40x40');
  assert.equal(requestsRows[0]['Артикул'], 'ART-1');
});
