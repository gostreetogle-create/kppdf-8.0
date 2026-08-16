import assert from 'node:assert/strict';
import test from 'node:test';
import * as XLSX from 'xlsx';
import { parseExcelWorkbook } from '../importers/excel';
import {
  FORM_APP,
  FORM_DATA_SHEET,
  FORM_CATEGORIES,
  FORM_SHEET_NAME,
  FORM_TEMPLATE_VERSION,
  buildFormWorkbook,
  formFileName,
  formTemplateFor,
  formTemplates,
  formTemplatesByCategory,
  identityMappingForForm,
  readFormFingerprint,
  serializeFormWorkbook,
} from './excel-form-template';

test('V1 allowlist: catalog → material/product/module, counterparties → counterparty only', () => {
  assert.deepEqual(
    formTemplatesByCategory('catalog').map((t) => t.targetKey),
    ['material', 'product', 'module'],
  );
  assert.deepEqual(
    formTemplatesByCategory('counterparties').map((t) => t.targetKey),
    ['counterparty'],
  );
  // В V1 нет справочников (warehouse/workType/color/category — TZD-51).
  assert.equal(formTemplateFor('warehouse' as never), undefined);
  assert.equal(formTemplates().length, 4);
  assert.ok(FORM_CATEGORIES.some((c) => c.key === 'catalog'));
  assert.ok(FORM_CATEGORIES.some((c) => c.key === 'counterparties'));
});

test('form file name uses latin target key (stable for V1)', () => {
  assert.equal(formFileName('material'), 'kppdf-material-form.xlsx');
  assert.equal(formFileName('counterparty'), 'kppdf-counterparty-form.xlsx');
});

test('header row: required columns get « *», data row 2 is an empty skeleton', () => {
  const wb = buildFormWorkbook('material');
  const data = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[FORM_DATA_SHEET], {
    header: 1,
    raw: true,
    defval: null,
  });
  const header = (data[0] ?? []) as unknown[];
  assert.ok(header.includes('Артикул *'), 'required article must carry « *»');
  assert.ok(header.includes('Наименование *'), 'required name must carry « *»');
  assert.ok(!header.includes('Артикул'), 'bare «Артикул» must not appear');
  assert.ok(header.includes('Ед. изм.'), 'optional column keeps its label');
  assert.ok(header.includes('Примечание'), 'optional column keeps its label');
  const skeleton = data[1] as unknown[];
  assert.ok(skeleton, 'row 2 must exist as an input skeleton');
  assert.ok(skeleton.every((cell) => cell === '' || cell === null), 'row 2 must be empty');
});

test('generate → parse round-trip preserves targetKey and columnKeys order', async () => {
  for (const targetKey of ['material', 'product', 'module', 'counterparty'] as const) {
    const wb = buildFormWorkbook(targetKey);
    // Импорт требует данных: заполняем строку-скелет тестовыми значениями.
    const template = formTemplateFor(targetKey)!;
    XLSX.utils.sheet_add_aoa(
      wb.Sheets[FORM_DATA_SHEET],
      [template.columns.map((_, index) => `test-${index}`)],
      { origin: 'A2' },
    );
    const bytes = new Uint8Array(XLSX.write(wb, { type: 'array', bookType: 'xlsx' }));
    const preview = await parseExcelWorkbook({ name: formFileName(targetKey), data: bytes });
    const fp = preview.fingerprint;
    assert.ok(fp, `fingerprint expected for ${targetKey}`);
    assert.equal(fp!.targetKey, targetKey);
    assert.equal(fp!.templateVersion, FORM_TEMPLATE_VERSION);
    assert.equal(fp!.app, FORM_APP);
    assert.deepEqual(fp!.columnKeys, template.columns.map((c) => c.key));
    // Скрытый лист-паспорт не попадает в превью и выбор листа.
    assert.ok(!preview.sheets.some((s) => s.name === FORM_SHEET_NAME));
    assert.ok(preview.sheets.some((s) => s.name === FORM_DATA_SHEET));
  }
});

test('unknown targetKey in fingerprint → safe ignore (null)', () => {
  const wb = buildFormWorkbook('material');
  wb.Sheets[FORM_SHEET_NAME] = XLSX.utils.aoa_to_sheet([
    ['templateVersion', FORM_TEMPLATE_VERSION],
    ['targetKey', 'warehouse'], // справочник вне V1 (TZD-51)
    ['generatedAt', new Date().toISOString()],
    ['columnKeys', '["name"]'],
    ['app', FORM_APP],
  ]);
  assert.equal(readFormFingerprint(wb), null);
});

test('corrupt fingerprint (broken columnKeys JSON) → safe ignore (null)', () => {
  const wb = buildFormWorkbook('material');
  wb.Sheets[FORM_SHEET_NAME] = XLSX.utils.aoa_to_sheet([
    ['templateVersion', FORM_TEMPLATE_VERSION],
    ['targetKey', 'material'],
    ['columnKeys', '{not json'],
  ]);
  assert.equal(readFormFingerprint(wb), null);
});

test('identity mapping strips « *» and maps Russian labels to keys', () => {
  const headers = ['Артикул *', 'Наименование *', 'Ед. изм.', 'Кол-во', 'Примечание', 'Лишняя колонка'];
  const result = identityMappingForForm(headers, 'material');
  const mapping = Object.fromEntries(result.rows.map((r) => [r.header, r.canonical]));
  assert.equal(mapping['Артикул *'], 'article');
  assert.equal(mapping['Наименование *'], 'name');
  assert.equal(mapping['Ед. изм.'], 'unit');
  assert.equal(mapping['Кол-во'], 'qty');
  assert.equal(mapping['Примечание'], 'notes');
  // Чужая/переименованная колонка — unfit (красная): отправка закрыта до fix/ignore.
  assert.equal(result.rows.find((r) => r.header === 'Лишняя колонка')?.state, 'unfit');
  assert.ok(!result.ready.includes('Лишняя колонка'));
});

test('identity mapping covers product and counterparty labels', () => {
  const product = identityMappingForForm(['Наименование *', 'Артикул (SKU) *', 'Прайсовая цена'], 'product');
  const productMap = Object.fromEntries(product.rows.map((r) => [r.header, r.canonical]));
  assert.equal(productMap['Наименование *'], 'name');
  assert.equal(productMap['Артикул (SKU) *'], 'sku');
  assert.equal(productMap['Прайсовая цена'], 'listPrice');

  const counterparty = identityMappingForForm(['Наименование *', 'ИНН *', 'Расчётный счёт'], 'counterparty');
  const cpMap = Object.fromEntries(counterparty.rows.map((r) => [r.header, r.canonical]));
  assert.equal(cpMap['Наименование *'], 'name');
  assert.equal(cpMap['ИНН *'], 'inn');
  assert.equal(cpMap['Расчётный счёт'], 'bankAccount');
});

test('full round-trip: fill a data row into the form and parse it back with fingerprint', async () => {
  const wb = buildFormWorkbook('material');
  XLSX.utils.sheet_add_aoa(wb.Sheets[FORM_DATA_SHEET], [['A-1', 'Болт М8', 'шт', 10]], { origin: 'A2' });
  const bytes = new Uint8Array(XLSX.write(wb, { type: 'array', bookType: 'xlsx' }));
  const preview = await parseExcelWorkbook({ name: formFileName('material'), data: bytes });
  assert.equal(preview.fingerprint?.targetKey, 'material');
  const dataSheet = preview.sheets.find((s) => s.name === FORM_DATA_SHEET);
  assert.ok(dataSheet, 'Данные sheet must be in preview');
  assert.equal(dataSheet!.rows.length, 1);
  assert.equal(dataSheet!.rows[0]['Артикул *'], 'A-1');
  assert.equal(dataSheet!.rows[0]['Наименование *'], 'Болт М8');
  assert.equal(dataSheet!.rows[0]['Кол-во'], 10);
});

test('renamed header (user edited the form) breaks identity map — unfit stays', () => {
  const headers = ['Артикул *', 'Мое новое имя', 'Ед. изм.'];
  const result = identityMappingForForm(headers, 'material');
  const row = result.rows.find((r) => r.header === 'Мое новое имя');
  assert.equal(row?.state, 'unfit');
  assert.equal(row?.canonical, null);
});
