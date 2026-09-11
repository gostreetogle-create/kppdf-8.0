import assert from 'node:assert/strict';
import test from 'node:test';
import { buildDatasetLogEntry, formatDatasetLogLine } from './dataset-log';

test('buildDatasetLogEntry pairs raw rows with the confirmed payload and stamps source/ts', () => {
  const entry = buildDatasetLogEntry(
    'material',
    [{ 'Артикул': 'A-1', 'Наименование': 'Болт' }],
    [{ article: 'A-1', name: 'Болт' }],
  );
  assert.equal(entry.schemaId, 'material');
  assert.deepEqual(entry.rawRows, [{ 'Артикул': 'A-1', 'Наименование': 'Болт' }]);
  assert.deepEqual(entry.confirmedPayload, [{ article: 'A-1', name: 'Болт' }]);
  assert.equal(entry.source, 'hitl-confirm');
  assert.ok(!Number.isNaN(Date.parse(entry.ts)));
});

test('buildDatasetLogEntry truncates long string values (size hygiene, not a PII filter)', () => {
  const longValue = 'x'.repeat(1000);
  const entry = buildDatasetLogEntry('material', [{ notes: longValue }], []);
  const rawNotes = entry.rawRows[0]!['notes'] as string;
  assert.ok(rawNotes.length < 1000);
  assert.ok(rawNotes.endsWith('…[truncated]'));
});

test('buildDatasetLogEntry leaves short values and non-string values untouched', () => {
  const entry = buildDatasetLogEntry('material', [{ qty: 5, name: 'ok', active: true, missing: null }], []);
  assert.deepEqual(entry.rawRows[0], { qty: 5, name: 'ok', active: true, missing: null });
});

test('formatDatasetLogLine produces a single valid JSON line, no trailing newline', () => {
  const entry = buildDatasetLogEntry('material', [], []);
  const line = formatDatasetLogLine(entry);
  assert.ok(!line.includes('\n'));
  const parsed = JSON.parse(line) as { schemaId: string; source: string };
  assert.equal(parsed.schemaId, 'material');
  assert.equal(parsed.source, 'hitl-confirm');
});

test('buildDatasetLogEntry handles empty rows/payload without throwing', () => {
  const entry = buildDatasetLogEntry('inventory', [], []);
  assert.deepEqual(entry.rawRows, []);
  assert.deepEqual(entry.confirmedPayload, []);
});
