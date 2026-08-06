import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  INBOX_EXTENSIONS,
  mapRowToMaterial,
  parseInboxBytes,
  readInboxFile,
} from './inbox.js';

describe('inbox mapRowToMaterial', () => {
  it('maps RU and EN column aliases', () => {
    assert.deepEqual(
      mapRowToMaterial({ 'Наименование': 'Стекло 4мм', 'Ед. изм.': 'м2', 'Артикул': 'G4', 'SKU': 'sk-1' }),
      { name: 'Стекло 4мм', unit: 'м2', article: 'G4', sku: 'sk-1' },
    );
    assert.deepEqual(
      mapRowToMaterial({ name: 'Oak', unit: 'шт', article: 'O-1' }),
      { name: 'Oak', unit: 'шт', article: 'O-1' },
    );
  });

  it('returns null when no name column', () => {
    assert.equal(mapRowToMaterial({ foo: 'x', bar: 'y' }), null);
    assert.equal(mapRowToMaterial({}), null);
  });

  it('treats txt single-column as name (текст alias)', () => {
    assert.deepEqual(mapRowToMaterial({ текст: 'Стекло 4мм' }), { name: 'Стекло 4мм' });
  });
});

describe('inbox parseInboxBytes', () => {
  it('parses txt lines (skips empty)', async () => {
    const rows = await parseInboxBytes('materials.txt', new TextEncoder().encode('Стекло 4мм\n\nДВП 3мм\n'));
    assert.deepEqual(rows, [{ текст: 'Стекло 4мм' }, { текст: 'ДВП 3мм' }]);
  });

  it('parses csv with header', async () => {
    const csv = 'name,unit,article\nСтекло 4мм,м2,G4\nДВП 3мм,шт,D3\n';
    const rows = await parseInboxBytes('materials.csv', new TextEncoder().encode(csv));
    assert.equal(rows.length, 2);
    assert.deepEqual(rows[0], { name: 'Стекло 4мм', unit: 'м2', article: 'G4' });
  });

  it('rejects unknown extension', async () => {
    await assert.rejects(
      parseInboxBytes('x.pdf', new TextEncoder().encode('x')),
      /не распознан/,
    );
  });

  it('rejects empty txt', async () => {
    await assert.rejects(parseInboxBytes('empty.txt', new TextEncoder().encode('  \n\n')), /пустой/);
  });
});

describe('inbox constants + path safety', () => {
  it('declares the supported extensions', () => {
    assert.deepEqual([...INBOX_EXTENSIONS], ['.xlsx', '.xls', '.csv', '.tsv', '.txt']);
  });

  it('readInboxFile refuses path traversal', async () => {
    await assert.rejects(readInboxFile('/tmp', '../etc/passwd'), /без пути/);
    await assert.rejects(readInboxFile('/tmp', 'a/b.txt'), /без пути/);
  });
});
