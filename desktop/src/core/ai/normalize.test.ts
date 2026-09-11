import assert from 'node:assert/strict';
import test from 'node:test';
import { buildEntitySchemaJson, buildNormalizeRetryMessage, parseNormalizeResponse } from './normalize';

test('buildEntitySchemaJson marks requiredFields from IMPORT_TARGETS', () => {
  const schema = JSON.parse(buildEntitySchemaJson('material')) as Array<{ key: string; label: string; required: boolean }>;
  const article = schema.find((f) => f.key === 'article');
  const notes = schema.find((f) => f.key === 'notes');
  assert.equal(article?.required, true);
  assert.equal(notes?.required, false);
});

test('parseNormalizeResponse: happy path parses rows + meta', () => {
  const text = JSON.stringify({
    rows: [{ article: 'A-1', name: 'Болт М6' }],
    _questions: ['Единица измерения не указана'],
    _errors: [],
    _skipped: [],
  });
  const result = parseNormalizeResponse(text, 'material');
  assert.equal(result.ok, true);
  assert.deepEqual(result.rows, [{ article: 'A-1', name: 'Болт М6' }]);
  assert.deepEqual(result.questions, ['Единица измерения не указана']);
  assert.deepEqual(result.inventedFields, []);
});

test('parseNormalizeResponse: strips fields not in schema into inventedFields, not into rows', () => {
  const text = JSON.stringify({ rows: [{ article: 'A-1', madeUpField: 'oops' }] });
  const result = parseNormalizeResponse(text, 'material');
  assert.equal(result.ok, true);
  assert.deepEqual(result.rows, [{ article: 'A-1' }]);
  assert.deepEqual(result.inventedFields, ['madeUpField']);
});

test('parseNormalizeResponse: unwraps markdown code fences around the JSON', () => {
  const text = 'Вот результат:\n```json\n{"rows":[{"name":"Стол"}]}\n```\nГотово.';
  const result = parseNormalizeResponse(text, 'product');
  assert.equal(result.ok, true);
  assert.deepEqual(result.rows, [{ name: 'Стол' }]);
});

test('parseNormalizeResponse: ok=false on garbage text', () => {
  assert.equal(parseNormalizeResponse('не JSON совсем', 'material').ok, false);
  assert.equal(parseNormalizeResponse('', 'material').ok, false);
});

test('parseNormalizeResponse: ok=false when rows is missing or not an array', () => {
  assert.equal(parseNormalizeResponse('{"_questions":["a"]}', 'material').ok, false);
  assert.equal(parseNormalizeResponse('{"rows":"not-an-array"}', 'material').ok, false);
});

test('parseNormalizeResponse: ok=false for an unknown schemaId', () => {
  assert.equal(parseNormalizeResponse('{"rows":[]}', 'not-a-real-schema').ok, false);
});

test('parseNormalizeResponse: non-string entries in _questions/_errors/_skipped are dropped, not thrown', () => {
  const text = JSON.stringify({ rows: [], _questions: ['ok', 5, null], _errors: [{ oops: true }], _skipped: [] });
  const result = parseNormalizeResponse(text, 'material');
  assert.deepEqual(result.questions, ['ok']);
  assert.deepEqual(result.errors, []);
});

test('buildNormalizeRetryMessage asks for strict JSON without a markdown wrapper', () => {
  const msg = buildNormalizeRetryMessage();
  assert.equal(msg.role, 'user');
  assert.ok(msg.content.includes('JSON'));
});
