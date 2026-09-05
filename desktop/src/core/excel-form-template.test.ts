import assert from 'node:assert/strict';
import test from 'node:test';
import * as XLSX from 'xlsx';
import { parseExcelWorkbook } from '../importers/excel';
import {
  EXPORT_PILOT_TARGET_KEYS,
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
  isExportPilotTargetKey,
  readFormFingerprint,
  serializeFormWorkbook,
} from './excel-form-template';

test('V2+supply allowlist: catalog/counterparties/references/supply (TZ-QA-445G)', () => {
  assert.deepEqual(
    formTemplatesByCategory('catalog').map((t) => t.targetKey),
    ['material', 'product', 'module'],
  );
  assert.deepEqual(
    formTemplatesByCategory('counterparties').map((t) => t.targetKey),
    ['counterparty'],
  );
  assert.deepEqual(
    formTemplatesByCategory('references').map((t) => t.targetKey),
    ['warehouse', 'workType', 'colorReference', 'category'],
  );
  assert.deepEqual(
    formTemplatesByCategory('supply').map((t) => t.targetKey),
    ['supplyRequest', 'supplyTask'],
  );
  assert.equal(formTemplates().length, 10);
  assert.ok(formTemplateFor('warehouse'));
  assert.ok(formTemplateFor('category'));
  assert.ok(formTemplateFor('supplyRequest'));
  assert.ok(formTemplateFor('supplyTask'));
  assert.ok(FORM_CATEGORIES.some((c) => c.key === 'catalog'));
  assert.ok(FORM_CATEGORIES.some((c) => c.key === 'counterparties'));
  assert.ok(FORM_CATEGORIES.some((c) => c.key === 'references'));
  assert.ok(FORM_CATEGORIES.some((c) => c.key === 'supply'));
  assert.equal(FORM_CATEGORIES.find((c) => c.key === 'supply')?.labelRu, 'Снабжение');
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

test('TZD-51 identity mapping: заголовки справочников с « *» → ключи', () => {
  const warehouse = identityMappingForForm(['Наименование *', 'Тип', 'Адрес'], 'warehouse');
  const wMap = Object.fromEntries(warehouse.rows.map((r) => [r.header, r.canonical]));
  assert.equal(wMap['Наименование *'], 'name');
  assert.equal(wMap['Тип'], 'type');
  assert.equal(wMap['Адрес'], 'address');

  const category = identityMappingForForm(
    ['Наименование *', 'Тип *', 'Slug *', 'Префикс SKU *'],
    'category',
  );
  const cMap = Object.fromEntries(category.rows.map((r) => [r.header, r.canonical]));
  assert.equal(cMap['Наименование *'], 'name');
  assert.equal(cMap['Тип *'], 'type');
  assert.equal(cMap['Slug *'], 'slug');
  assert.equal(cMap['Префикс SKU *'], 'skuPrefix');
});

test('TZD-51 round-trip: warehouse + category сохраняют targetKey и порядок колонок', async () => {
  for (const targetKey of ['warehouse', 'category'] as const) {
    const wb = buildFormWorkbook(targetKey);
    const template = formTemplateFor(targetKey)!;
    XLSX.utils.sheet_add_aoa(
      wb.Sheets[FORM_DATA_SHEET],
      [template.columns.map((_, index) => `test-${index}`)],
      { origin: 'A2' },
    );
    const bytes = new Uint8Array(XLSX.write(wb, { type: 'array', bookType: 'xlsx' }));
    const preview = await parseExcelWorkbook({ name: formFileName(targetKey), data: bytes });
    assert.ok(preview.fingerprint, `fingerprint expected for ${targetKey}`);
    assert.equal(preview.fingerprint!.targetKey, targetKey);
    assert.deepEqual(preview.fingerprint!.columnKeys, template.columns.map((c) => c.key));
    assert.ok(!preview.sheets.some((s) => s.name === FORM_SHEET_NAME));
  }
});

test('TZ-QA-445G round-trip: supplyRequest + supplyTask fingerprint', async () => {
  for (const targetKey of ['supplyRequest', 'supplyTask'] as const) {
    const wb = buildFormWorkbook(targetKey);
    const template = formTemplateFor(targetKey)!;
    XLSX.utils.sheet_add_aoa(
      wb.Sheets[FORM_DATA_SHEET],
      [template.columns.map((_, index) => `test-${index}`)],
      { origin: 'A2' },
    );
    const bytes = new Uint8Array(XLSX.write(wb, { type: 'array', bookType: 'xlsx' }));
    const preview = await parseExcelWorkbook({ name: formFileName(targetKey), data: bytes });
    assert.ok(preview.fingerprint, `fingerprint expected for ${targetKey}`);
    assert.equal(preview.fingerprint!.targetKey, targetKey);
    assert.deepEqual(preview.fingerprint!.columnKeys, template.columns.map((c) => c.key));
    assert.ok(preview.sheets.some((s) => s.name === FORM_DATA_SHEET));
  }
});

test('TZ-QA-445G identity mapping: снабжение labels → keys', () => {
  const request = identityMappingForForm(
    ['Наименование *', 'Артикул', 'Кол-во', 'Приоритет'],
    'supplyRequest',
  );
  const rMap = Object.fromEntries(request.rows.map((r) => [r.header, r.canonical]));
  assert.equal(rMap['Наименование *'], 'title');
  assert.equal(rMap['Артикул'], 'article');
  assert.equal(rMap['Кол-во'], 'qty');
  assert.equal(rMap['Приоритет'], 'priority');

  const task = identityMappingForForm(['ID заказа *', 'Наименование', 'Кол-во *'], 'supplyTask');
  const tMap = Object.fromEntries(task.rows.map((r) => [r.header, r.canonical]));
  assert.equal(tMap['ID заказа *'], 'orderId');
  assert.equal(tMap['Наименование'], 'title');
  assert.equal(tMap['Кол-во *'], 'qty');
});

test('unknown targetKey in fingerprint → safe ignore (null)', () => {
  const wb = buildFormWorkbook('material');
  wb.Sheets[FORM_SHEET_NAME] = XLSX.utils.aoa_to_sheet([
    ['templateVersion', FORM_TEMPLATE_VERSION],
    ['targetKey', 'order'], // заказы вне allowlist волны
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

// TZD-68: export mode — «Скачать с данными» fills the Данные sheet from API rows.
test('export pilot allowlist: only material + workType for now', () => {
  assert.deepEqual([...EXPORT_PILOT_TARGET_KEYS], ['material', 'workType']);
  assert.ok(isExportPilotTargetKey('material'));
  assert.ok(isExportPilotTargetKey('workType'));
  assert.ok(!isExportPilotTargetKey('product'));
});

test('export mode: template behavior (mode omitted) is unchanged — empty skeleton row 2', () => {
  const wb = buildFormWorkbook('material');
  const data = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[FORM_DATA_SHEET], {
    header: 1,
    raw: true,
    defval: null,
  });
  assert.equal(data.length, 2);
  assert.ok((data[1] as unknown[]).every((cell) => cell === '' || cell === null));
  const fp = readFormFingerprint(wb);
  assert.equal(fp?.mode, 'template');
});

test('export mode: data rows come from API rows, mapped by column key', () => {
  const apiRows = [
    { article: 'A-1', name: 'Лист 2мм', unit: 'шт', notes: 'оцинк.' },
    { article: 'A-2', name: 'Уголок 25', unit: 'м' },
  ];
  const wb = buildFormWorkbook('material', { mode: 'export', rows: apiRows });
  const data = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[FORM_DATA_SHEET], {
    header: 1,
    raw: true,
    defval: null,
  });
  // header + 2 data rows, no empty skeleton row appended.
  assert.equal(data.length, 3);
  const template = formTemplateFor('material')!;
  const articleIdx = template.columns.findIndex((c) => c.key === 'article');
  const nameIdx = template.columns.findIndex((c) => c.key === 'name');
  const notesIdx = template.columns.findIndex((c) => c.key === 'notes');
  assert.equal((data[1] as unknown[])[articleIdx], 'A-1');
  assert.equal((data[1] as unknown[])[nameIdx], 'Лист 2мм');
  assert.equal((data[2] as unknown[])[articleIdx], 'A-2');
  // Missing field on the second row → blank cell, not "undefined".
  assert.equal((data[2] as unknown[])[notesIdx], '');
});

test('export mode: empty API result still produces a valid header-only sheet', () => {
  const wb = buildFormWorkbook('workType', { mode: 'export', rows: [] });
  const data = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[FORM_DATA_SHEET], {
    header: 1,
    raw: true,
    defval: null,
  });
  assert.equal(data.length, 1);
  const fp = readFormFingerprint(wb);
  assert.equal(fp?.mode, 'export');
  assert.equal(fp?.targetKey, 'workType');
});

test('export mode: rejects a target key outside the pilot allowlist', () => {
  assert.throws(() => buildFormWorkbook('product', { mode: 'export', rows: [] }), /pilot/i);
});

test('export mode: file name carries -export suffix; template stays -form', () => {
  assert.equal(formFileName('material'), 'kppdf-material-form.xlsx');
  assert.equal(formFileName('material', 'template'), 'kppdf-material-form.xlsx');
  assert.equal(formFileName('material', 'export'), 'kppdf-material-export.xlsx');
});

test('export mode: round-trip through the real Excel parser (fingerprint + data)', async () => {
  const apiRows = [{ name: 'Сварка', hourlyRate: 900, section: 'Цех 1', days: 2 }];
  const bytes = serializeFormWorkbook('workType', { mode: 'export', rows: apiRows });
  const preview = await parseExcelWorkbook({ name: formFileName('workType', 'export'), data: bytes });
  assert.equal(preview.fingerprint?.targetKey, 'workType');
  assert.equal(preview.fingerprint?.mode, 'export');
  const dataSheet = preview.sheets.find((s) => s.name === FORM_DATA_SHEET);
  assert.equal(dataSheet!.rows.length, 1);
  assert.equal(dataSheet!.rows[0]['Наименование *'], 'Сварка');
  assert.equal(dataSheet!.rows[0]['Ставка ₽/час *'], 900);
});

test('renamed header (user edited the form) breaks identity map — unfit stays', () => {
  const headers = ['Артикул *', 'Мое новое имя', 'Ед. изм.'];
  const result = identityMappingForForm(headers, 'material');
  const row = result.rows.find((r) => r.header === 'Мое новое имя');
  assert.equal(row?.state, 'unfit');
  assert.equal(row?.canonical, null);
});
