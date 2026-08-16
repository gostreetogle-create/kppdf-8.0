import assert from 'node:assert/strict';
import test from 'node:test';
import * as XLSX from 'xlsx';
import { excelImporter, parseExcelWorkbook } from './excel';
import type { ImportSource } from './index';

function workbookBytes(...sheets: Array<{ name: string; matrix: unknown[][] }>): Uint8Array {
  const wb = XLSX.utils.book_new();
  for (const sheet of sheets) {
    const ws = XLSX.utils.aoa_to_sheet(sheet.matrix);
    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  }
  const data = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return new Uint8Array(data);
}

function source(name: string, matrix: unknown[][]): ImportSource {
  return { name, data: workbookBytes({ name: 'Лист1', matrix }) };
}

test('skips document title row and uses the real header row', async () => {
  const preview = await parseExcelWorkbook(
    source('spec.xlsx', [
      ['ПРЕДВАРИТЕЛЬНЫЙ ПРОСМОТР ДОКУМЕНТА', 'Таблица спецификаций'],
      ['', 'Позиция', 'Обозначение', 'Длина', 'Ширина', 'Толщина', 'Масса', 'Сортамент, ГОСТ', 'Материал', 'Вид изделия', 'К-во'],
      ['', '1', '0000.0001.0000', 627, 109, 80, 3.13, '', '', 'Модуль', 20],
      ['', '1.1', '0000.0001.0001', 550, 57, 57, 2.524, 'Труба', 'Ст3', 'Деталь', 1],
    ]),
  );
  const rows = preview.sheets[0].rows;
  assert.equal(rows.length, 2);
  const headers = Object.keys(rows[0]);
  assert.equal(headers[0], 'Позиция');
  assert.equal(headers[1], 'Обозначение');
  assert.ok(headers.includes('К-во'));
  assert.ok(headers.includes('Сортамент, ГОСТ'));
  assert.ok(!headers.some((header) => header.includes('ПРЕДВАРИТЕЛЬНЫЙ')));
  assert.equal(rows[0]['Позиция'], '1');
  assert.equal(rows[0]['Обозначение'], '0000.0001.0000');
});

test('file without a title row still uses the first row as headers', async () => {
  const preview = await parseExcelWorkbook(
    source('simple.xlsx', [
      ['Артикул', 'Наименование', 'Кол-во'],
      ['A-1', 'Болт', 10],
      ['A-2', 'Гайка', 20],
    ]),
  );
  const rows = preview.sheets[0].rows;
  assert.equal(rows.length, 2);
  assert.equal(rows[0]['Артикул'], 'A-1');
  assert.equal(rows[0]['Наименование'], 'Болт');
});

test('empty header cells get a friendly Колонка N fallback', async () => {
  const preview = await parseExcelWorkbook(
    source('gaps.xlsx', [
      ['Артикул', '', 'Наименование'],
      ['A-1', 'x', 'Болт'],
    ]),
  );
  const headers = Object.keys(preview.sheets[0].rows[0]);
  assert.ok(headers.includes('Колонка 2'), `expected Колонка 2 in ${headers.join(', ')}`);
});

test('importer picks the sheet with data, not the first one (TZD-48)', async () => {
  // Первый лист пуст/шапка, данные — на втором.
  const wb = workbookBytes(
    { name: 'Пустой', matrix: [['Примечания', '']] },
    { name: 'Данные', matrix: [['Артикул', 'Наименование'], ['A-1', 'Болт']] },
  );
  const rows = await excelImporter.parse({ name: 'multi.xlsx', data: wb });
  assert.equal(rows.length, 1);
  assert.equal(rows[0]['Артикул'], 'A-1');
  assert.equal(rows[0]['Наименование'], 'Болт');
});

test('importer throws a clear error when no sheet has data (TZD-48)', async () => {
  const wb = workbookBytes({ name: 'Лист1', matrix: [['Заголовок', '']] });
  await assert.rejects(
    () => excelImporter.parse({ name: 'empty.xlsx', data: wb }),
    /пустой|нет данных/i,
  );
});
