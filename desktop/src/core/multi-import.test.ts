import assert from 'node:assert/strict';
import test from 'node:test';
import { fieldLabel, IMPORT_TARGETS } from './import-targets';
import {
  analyzeTables,
  applyTableMapping,
  reshapeForTable,
  validateTableRows,
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
