import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CANONICAL_COLUMNS,
  canonicalLabel,
  classifyHeaders,
  updateMapping,
} from './import-mapping';

test('every canonical column has a Russian label and a readable option', () => {
  for (const column of CANONICAL_COLUMNS) {
    const label = canonicalLabel(column);
    assert.ok(label.includes('(') && label.includes(')'), `label lacks parens: ${label}`);
    assert.ok(label.includes(column), `label lacks english key: ${label}`);
  }
  assert.equal(canonicalLabel('article'), 'Артикул (article)');
  assert.equal(canonicalLabel('name'), 'Наименование (name)');
  assert.equal(canonicalLabel('qty'), 'Кол-во (qty)');
});

test('CAD/PDM headers classify: Обозначение→article, К-во→qty, Материал→name', () => {
  const headers = ['Позиция', 'Обозначение', 'Длина', 'Ширина', 'Толщина', 'Масса', 'Сортамент, ГОСТ', 'Материал', 'Вид изделия', 'К-во'];
  const result = classifyHeaders(headers);
  const mapping = Object.fromEntries(result.rows.map((row) => [row.header, row.canonical]));
  assert.equal(mapping['Обозначение'], 'article');
  assert.equal(mapping['К-во'], 'qty');
  assert.equal(mapping['Материал'], 'name');
  // «Позиция» / «Вид изделия» — колонки иерархии, в плоском маппинге не участвуют.
  assert.equal(mapping['Позиция'], null);
  assert.equal(mapping['Вид изделия'], null);
  assert.equal(mapping['Длина'], null);
});

test('duplicate canonical assignments surface as conflicts after manual edit', () => {
  let result = classifyHeaders(['Материал', 'Наименование']);
  // Обе колонки — кандидаты на name: конфликт, авто-маппинга нет.
  assert.ok(result.conflicts.includes('Материал'));
  assert.ok(result.conflicts.includes('Наименование'));
  // Явный выбор: одна → name, вторая → ignore — конфликт снят.
  result = updateMapping(result, 'Материал', 'name');
  result = updateMapping(result, 'Наименование', null);
  assert.equal(result.rows.find((row) => row.header === 'Материал')?.state, 'ready');
  assert.equal(result.rows.find((row) => row.header === 'Наименование')?.state, 'ignored');
  assert.deepEqual(result.conflicts, []);
});
