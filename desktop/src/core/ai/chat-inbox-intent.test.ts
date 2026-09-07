import assert from 'node:assert/strict';
import test from 'node:test';
import { matchInboxIntent } from './chat-inbox-intent';

const FILES = ['Материалы_2026.xlsx', 'поставщики.csv'];

test('TZD-78 matchInboxIntent: recognizes an exact file name with an intent word', () => {
  assert.equal(matchInboxIntent('Разбери файл Материалы_2026.xlsx', FILES), 'Материалы_2026.xlsx');
  assert.equal(matchInboxIntent('импортируй поставщики.csv пожалуйста', FILES), 'поставщики.csv');
});

test('TZD-78 matchInboxIntent: is case-insensitive and matches by stem without extension', () => {
  assert.equal(matchInboxIntent('открой МАТЕРИАЛЫ_2026', FILES), 'Материалы_2026.xlsx');
});

test('TZD-78 matchInboxIntent: exact filename wins even when a stem of another file also matches', () => {
  const files = ['Отчёт.xlsx', 'Отчёт финальный.xlsx'];
  assert.equal(matchInboxIntent('проверь Отчёт.xlsx', files), 'Отчёт.xlsx');
});

test('TZD-78 matchInboxIntent: no intent word → no match even if the file name appears', () => {
  assert.equal(matchInboxIntent('Материалы_2026.xlsx — красивое название', FILES), null);
});

test('TZD-78 matchInboxIntent: intent word without a recognizable file name → no match', () => {
  assert.equal(matchInboxIntent('разбери что там у нас с заказами', FILES), null);
});

test('TZD-78 matchInboxIntent: empty inbox or empty message → no match', () => {
  assert.equal(matchInboxIntent('разбери файл X', []), null);
  assert.equal(matchInboxIntent('   ', FILES), null);
});
