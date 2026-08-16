import assert from 'node:assert/strict';
import test from 'node:test';
import { buildMappingPrompt, parseMappingJson } from './suggest-mapping';

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
