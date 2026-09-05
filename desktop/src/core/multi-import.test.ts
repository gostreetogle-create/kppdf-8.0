import assert from 'node:assert/strict';
import test from 'node:test';
import { fieldLabel, IMPORT_TARGETS } from './import-targets';
import {
  analyzeTables,
  applyTableMapping,
  reshapeForTable,
  validateTableRows,
  workerDedupeKeyOf,
} from './multi-import';

test('every target has columns with Russian labels and unique keys', () => {
  for (const key of Object.keys(IMPORT_TARGETS) as (keyof typeof IMPORT_TARGETS)[]) {
    const target = IMPORT_TARGETS[key];
    assert.ok(target.label.length > 0, `${key} label`);
    assert.ok(target.columns.length >= 3, `${key} columns`);
    const keys = target.columns.map((c) => c.key);
    assert.equal(new Set(keys).size, keys.length, `${key} duplicate keys`);
    for (const column of target.columns) {
      assert.ok(column.label.length > 0, `${key}.${column.key} label`);
      assert.ok(column.aliases.length >= 1, `${key}.${column.key} aliases`);
    }
    assert.equal(fieldLabel(key, keys[0]), target.columns[0].label);
  }
});

const CAD_HEADERS = ['Позиция', 'Обозначение', 'Длина', 'Ширина', 'Толщина', 'Масса', 'Сортамент, ГОСТ', 'Материал', 'Вид изделия', 'К-во'];

test('CAD specification file suggests material, product and module tables', () => {
  const suggestions = analyzeTables(CAD_HEADERS);
  const keys = suggestions.map((s) => s.targetKey);
  assert.ok(keys.includes('material'), `expected material in ${keys.join(',')}`);
  assert.ok(keys.includes('product'), `expected product in ${keys.join(',')}`);
  assert.ok(keys.includes('module'), `expected module in ${keys.join(',')}`);
  // Контрагентов в спецификации нет — таблица не предлагается.
  assert.ok(!keys.includes('counterparty'), `unexpected counterparty in ${keys.join(',')}`);
});

test('counterparty headers suggest the counterparty table', () => {
  const headers = ['Контрагент', 'ИНН', 'КПП', 'Банк', 'БИК', 'Расчётный счёт', 'Директор'];
  const suggestions = analyzeTables(headers);
  assert.deepEqual(suggestions.map((s) => s.targetKey), ['counterparty']);
  const counterparty = suggestions[0];
  const mapping = Object.fromEntries(counterparty.mapping.rows.map((r) => [r.header, r.canonical]));
  assert.equal(mapping['Контрагент'], 'name');
  assert.equal(mapping['ИНН'], 'inn');
  assert.equal(mapping['Расчётный счёт'], 'bankAccount');
  assert.equal(mapping['БИК'], 'bankBik');
});

test('profile with multiple tables applies per-table mapping', () => {
  const headers = ['Контрагент', 'ИНН', 'Наименование', 'Артикул'];
  const product = applyTableMapping(headers, 'product', {
    Наименование: 'name',
    Артикул: 'sku',
  });
  const productMap = Object.fromEntries(product.rows.map((r) => [r.header, r.canonical]));
  assert.equal(productMap['Наименование'], 'name');
  assert.equal(productMap['Артикул'], 'sku');

  const counterparty = applyTableMapping(headers, 'counterparty', {
    Контрагент: 'name',
    ИНН: 'inn',
  });
  assert.equal(Object.fromEntries(counterparty.rows.map((r) => [r.header, r.canonical]))['ИНН'], 'inn');
});

test('partial AI map does not reset untouched headers (TZD-48)', () => {
  const headers = ['Наименование', 'Артикул', 'Цена', 'Описание'];
  // Пустая карта AI: эвристики классификатора сохраняются целиком.
  const base = applyTableMapping(headers, 'product', {});
  const baseMap = Object.fromEntries(base.rows.map((r) => [r.header, r.canonical]));
  assert.equal(baseMap['Наименование'], 'name');
  assert.equal(baseMap['Артикул'], 'sku');
  assert.equal(baseMap['Описание'], 'description');

  // Частичная карта: меняет только свой заголовок, остальные эвристики целы.
  const partial = applyTableMapping(headers, 'product', { 'Цена': 'listPrice' });
  const partialMap = Object.fromEntries(partial.rows.map((r) => [r.header, r.canonical]));
  assert.equal(partialMap['Цена'], 'listPrice');
  assert.equal(partialMap['Наименование'], 'name'); // не обнулён частичной картой
  assert.equal(partialMap['Артикул'], 'sku');
  assert.equal(partialMap['Описание'], 'description');
});

test('reshape and validate rows per table', () => {
  const rows = [
    { 'Контрагент': 'ООО Ромашка', 'ИНН': '7707083893', 'Наименование': 'Стол', 'Артикул': 'ST-1' },
  ];
  const counterparty = applyTableMapping(['Контрагент', 'ИНН', 'Наименование', 'Артикул'], 'counterparty', {
    Контрагент: 'name',
    ИНН: 'inn',
  });
  const reshaped = reshapeForTable(rows, counterparty);
  assert.deepEqual(reshaped[0], { name: 'ООО Ромашка', inn: '7707083893' });
  const validated = validateTableRows(reshaped, 'counterparty');
  assert.equal(validated[0].status, 'ok_new');
  // Контрагент без имени — ошибка (name обязателен).
  const bad = validateTableRows([{ inn: '7707083893' }], 'counterparty');
  assert.equal(bad[0].status, 'invalid');
});

test('module target requires article for validity', () => {
  const ok = validateTableRows([{ article: 'M-1', name: 'Каркас' }], 'module');
  assert.equal(ok[0].status, 'ok_new');
  const bad = validateTableRows([{ name: 'Без артикула' }], 'module');
  assert.equal(bad[0].status, 'invalid');
  assert.ok(bad[0].message.includes('article'));
});

test('counterparty without INN is not ok_new (TZD-48)', () => {
  const ok = validateTableRows([{ name: 'ООО Ромашка', inn: '7707083893' }], 'counterparty');
  assert.equal(ok[0].status, 'ok_new');
  const bad = validateTableRows([{ name: 'Без ИНН' }], 'counterparty');
  assert.equal(bad[0].status, 'invalid');
  assert.ok(bad[0].message.includes('inn'));
});

test('TZD-51 warehouse: 1 новая + 1 дубль имени (trim+lower) → дубль в отчёте', () => {
  const rows = [
    { name: 'Склад сборки' },
    { name: 'СКЛАД СБОРКИ' },
    { name: 'Основной склад' },
  ];
  // Каталог уже содержит «основной склад» → третья строка дубль по каталогу.
  const validated = validateTableRows(rows, 'warehouse', new Set(['основной склад']));
  assert.equal(validated[0].status, 'duplicate'); // «Склад сборки» × «СКЛАД СБОРКИ» — дубль в файле
  assert.equal(validated[1].status, 'duplicate');
  assert.equal(validated[2].status, 'duplicate'); // совпадение с каталогом — не писать
});

test('TZD-51 warehouse: новая строка проходит, каталог-дубль не пишется', () => {
  const validated = validateTableRows(
    [{ name: 'Склад сборки' }],
    'warehouse',
    new Set(['основной склад']),
  );
  assert.equal(validated[0].status, 'ok_new');
  const dup = validateTableRows([{ name: 'Основной склад' }], 'warehouse', new Set(['основной склад']));
  assert.equal(dup[0].status, 'duplicate');
});

test('TZD-51 workType: без ставки → invalid; с ставкой → ok_new', () => {
  const bad = validateTableRows([{ name: 'Сварка' }], 'workType');
  assert.equal(bad[0].status, 'invalid');
  assert.ok(bad[0].message.includes('hourlyRate'));
  const ok = validateTableRows([{ name: 'Сварка', hourlyRate: 2500 }], 'workType');
  assert.equal(ok[0].status, 'ok_new');
  const negative = validateTableRows([{ name: 'Сварка', hourlyRate: -1 }], 'workType');
  assert.equal(negative[0].status, 'invalid');
});

test('TZD-69 worker: пустая фамилия/имя → invalid', () => {
  const noFirst = validateTableRows([{ lastName: 'Иванов' }], 'worker');
  assert.equal(noFirst[0].status, 'invalid');
  assert.ok(noFirst[0].message.includes('firstName'));
  const ok = validateTableRows([{ lastName: 'Иванов', firstName: 'Иван' }], 'worker');
  assert.equal(ok[0].status, 'ok_new');
});

test('TZD-69 worker: битый email → invalid; дубль email в файле → duplicate', () => {
  const badEmail = validateTableRows(
    [{ lastName: 'Иванов', firstName: 'Иван', email: 'not-an-email' }],
    'worker',
  );
  assert.equal(badEmail[0].status, 'invalid');
  assert.ok(badEmail[0].message.includes('Email'));

  // Same normalized email key on both rows → both flagged duplicate-in-file
  // (matches every other target's in-file dedupe convention in this module).
  const dupe = validateTableRows(
    [
      { lastName: 'Иванов', firstName: 'Иван', email: 'IVAN@example.com' },
      { lastName: 'Петров', firstName: 'Пётр', email: 'ivan@example.com' },
    ],
    'worker',
  );
  assert.equal(dupe[0].status, 'duplicate');
  assert.equal(dupe[1].status, 'duplicate');
});

test('TZD-69 worker: дубль каталога по имени (без email) — casefold lastName|firstName|patronymic', () => {
  const existing = new Set([workerDedupeKeyOf({ lastName: 'Сидоров', firstName: 'Пётр' })]);
  const result = validateTableRows(
    [{ lastName: ' Сидоров ', firstName: 'ПЁТР' }],
    'worker',
    existing,
  );
  assert.equal(result[0].status, 'duplicate');
  assert.equal(result[0].message, 'Дубликат: уже есть в справочнике');
});

test('TZD-69 worker: отрицательная ставка → invalid', () => {
  const bad = validateTableRows(
    [{ lastName: 'Иванов', firstName: 'Иван', ratePerHour: -5 }],
    'worker',
  );
  assert.equal(bad[0].status, 'invalid');
  assert.ok(bad[0].message.includes('Ставка'));
});

test('TZD-69 worker: неизвестный вид работ в workTypeNames → invalid с RU message', () => {
  const workTypeNames = new Set(['Сварка', 'Покраска']);
  const bad = validateTableRows(
    [{ lastName: 'Иванов', firstName: 'Иван', workTypeNames: 'Сварка; Сборка' }],
    'worker',
    new Set(),
    workTypeNames,
  );
  assert.equal(bad[0].status, 'invalid');
  assert.ok(bad[0].message.includes('Сборка'));

  const ok = validateTableRows(
    [{ lastName: 'Иванов', firstName: 'Иван', workTypeNames: 'сварка ; Покраска' }],
    'worker',
    new Set(),
    workTypeNames,
  );
  assert.equal(ok[0].status, 'ok_new');
});

test('TZD-51 colorReference: плохой hex → invalid; без slug → ok_new (сервер примет по name)', () => {
  const badHex = validateTableRows([{ name: 'RAL 9003', hex: 'FFF' }], 'colorReference');
  assert.equal(badHex[0].status, 'invalid');
  assert.ok(badHex[0].message.includes('Hex'));
  const ok = validateTableRows([{ name: 'RAL 9003', hex: '#F4F4F4' }], 'colorReference');
  assert.equal(ok[0].status, 'ok_new');
  const noSlug = validateTableRows([{ name: 'RAL 9003' }], 'colorReference');
  assert.equal(noSlug[0].status, 'ok_new');
});

test('TZD-51 category: плохой skuPrefix → invalid; валидная → ok_new; skuPrefix-дубль → duplicate', () => {
  const bad = validateTableRows(
    [{ name: 'Металлопрокат', type: 'material', slug: 'metal', skuPrefix: 'металл' }],
    'category',
  );
  assert.equal(bad[0].status, 'invalid');
  assert.ok(bad[0].message.includes('Префикс SKU'));

  const ok = validateTableRows(
    [{ name: 'Металлопрокат', type: 'material', slug: 'metal', skuPrefix: 'MPT' }],
    'category',
  );
  assert.equal(ok[0].status, 'ok_new');

  const dup = validateTableRows(
    [{ name: 'Другой', type: 'material', slug: 'other', skuPrefix: 'MPT' }],
    'category',
    new Set(['prefix:MPT']),
  );
  assert.equal(dup[0].status, 'duplicate');
});

test('TZD-51 category: плохой slug / тип вне enum → invalid', () => {
  const badSlug = validateTableRows(
    [{ name: 'Металл', type: 'material', slug: 'Bad Slug', skuPrefix: 'M' }],
    'category',
  );
  assert.equal(badSlug[0].status, 'invalid');
  const badType = validateTableRows(
    [{ name: 'Металл', type: 'whatever', slug: 'metal', skuPrefix: 'M' }],
    'category',
  );
  assert.equal(badType[0].status, 'invalid');
});

test('TZ-QA-445G supplyRequest: title → ok_new; bad priority / id → invalid', () => {
  const ok = validateTableRows([{ title: 'Болт М8', qty: 10, priority: 'urgent' }], 'supplyRequest');
  assert.equal(ok[0].status, 'ok_new');
  const noTitle = validateTableRows([{ article: 'A-1' }], 'supplyRequest');
  assert.equal(noTitle[0].status, 'invalid');
  const badPriority = validateTableRows([{ title: 'X', priority: 'asap' }], 'supplyRequest');
  assert.equal(badPriority[0].status, 'invalid');
  const badId = validateTableRows([{ title: 'X', orderId: 'not-an-id' }], 'supplyRequest');
  assert.equal(badId[0].status, 'invalid');
});

test('TZ-QA-445G supplyTask: orderId+qty+title → ok_new; missing identity → invalid', () => {
  const orderId = '507f1f77bcf86cd799439011';
  const ok = validateTableRows([{ orderId, qty: 2, title: 'Шайба' }], 'supplyTask');
  assert.equal(ok[0].status, 'ok_new');
  const noIdentity = validateTableRows([{ orderId, qty: 1 }], 'supplyTask');
  assert.equal(noIdentity[0].status, 'invalid');
  const badOrder = validateTableRows([{ orderId: 'xx', qty: 1, title: 'X' }], 'supplyTask');
  assert.equal(badOrder[0].status, 'invalid');
});
