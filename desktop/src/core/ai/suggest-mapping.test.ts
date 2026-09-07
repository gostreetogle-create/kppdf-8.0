import assert from 'node:assert/strict';
import test from 'node:test';
import { analyzeTables } from '../multi-import';
import { buildInboxMappingSummary, buildMappingPrompt, parseMappingJson, pickBestTableSuggestion } from './suggest-mapping';

test('prompt lists target fields with Russian labels and file headers', () => {
  const { system, user } = buildMappingPrompt(['Контрагент', 'ИНН'], 'counterparty');
  assert.ok(system.includes('JSON'));
  assert.ok(user.includes('Контрагенты'));
  assert.ok(user.includes('inn — «ИНН»'));
  assert.ok(user.includes('1. Контрагент'));
  assert.ok(user.includes('2. ИНН'));
});

test('parses a clean JSON mapping and keeps only valid keys', () => {
  const parsed = parseMappingJson('{"Контрагент": "name", "ИНН": "inn", "Выдумка": "magic"}', 'counterparty');
  assert.equal(parsed['Контрагент'], 'name');
  assert.equal(parsed['ИНН'], 'inn');
  // «magic» нет в таблице — null, а не значение.
  assert.equal(parsed['Выдумка'], null);
});

test('parses JSON wrapped in markdown fences and with surrounding text', () => {
  const raw = 'Вот карта:\n```json\n{"Наименование": "name"}\n```\nКонец.';
  const parsed = parseMappingJson(raw, 'material');
  assert.equal(parsed['Наименование'], 'name');
});

test('returns empty map on garbage or missing JSON', () => {
  assert.deepEqual(parseMappingJson('не JSON', 'material'), {});
  assert.deepEqual(parseMappingJson('[1,2,3]', 'material'), {});
  assert.deepEqual(parseMappingJson('', 'material'), {});
});

test('TZD-78 pickBestTableSuggestion: picks the suggestion with the most ready columns', () => {
  const headers = ['Наименование', 'Артикул', 'Ед. изм.', 'Кол-во'];
  const best = pickBestTableSuggestion(analyzeTables(headers));
  assert.equal(best?.targetKey, 'material');
});

test('TZD-78 pickBestTableSuggestion: empty suggestions → undefined', () => {
  assert.equal(pickBestTableSuggestion([]), undefined);
});

test('TZD-78 buildInboxMappingSummary: names the table and ready/needCheck counts', () => {
  const best = pickBestTableSuggestion(analyzeTables(['Наименование', 'Артикул']));
  const summary = buildInboxMappingSummary('Материалы.xlsx', 10, best);
  assert.match(summary, /«Материалы\.xlsx»/);
  assert.match(summary, /Материалы/);
  assert.match(summary, /Открою в Импорте/);
});

test('TZD-78 buildInboxMappingSummary: no table guess → manual-mapping hint, no fabricated table name', () => {
  const summary = buildInboxMappingSummary('странный.csv', 3, undefined);
  assert.match(summary, /не похожи на известные поля/);
});

test('TZD-78 buildInboxMappingSummary: zero rows → distinct "empty file" message', () => {
  const summary = buildInboxMappingSummary('пусто.csv', 0, undefined);
  assert.match(summary, /строк с данными не нашлось/);
});
