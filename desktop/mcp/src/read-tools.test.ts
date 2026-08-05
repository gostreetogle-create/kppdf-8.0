import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { withQuery } from './query.js';
import { slimProduct, slimProductList, toolFail, toolOk } from './tool-result.js';
import { READ_TOOL_NAMES } from './read-tools.js';
import { WRITE_TOOL_NAMES } from './write-tools.js';

describe('withQuery', () => {
  it('omits empty values and encodes params', () => {
    assert.equal(withQuery('/api/materials', { page: 1, limit: 20, search: 'oak' }), '/api/materials?page=1&limit=20&search=oak');
    assert.equal(withQuery('/api/warehouses', {}), '/api/warehouses');
    assert.equal(withQuery('/api/storage-items', { warehouseId: undefined, materialId: '' }), '/api/storage-items');
  });
});

describe('tool helpers', () => {
  it('toolOk / toolFail shapes', () => {
    const ok = toolOk({ a: 1 });
    assert.equal(ok.content[0].type, 'text');
    assert.match(ok.content[0].text, /"a": 1/);
    const fail = toolFail('kppdf_x', new Error('nope'));
    assert.equal(fail.isError, true);
    assert.match(fail.content[0].text, /kppdf_x failed: nope/);
  });

  it('slimProduct keeps minimal fields', () => {
    const slim = slimProduct({
      _id: 'p1',
      name: 'Chair',
      sku: 'C-1',
      status: 'active',
      isActive: true,
      categoryId: 'cat',
      secretInternal: true,
    }) as Record<string, unknown>;
    assert.equal(slim._id, 'p1');
    assert.equal(slim.name, 'Chair');
    assert.equal(slim.secretInternal, undefined);
  });

  it('slimProductList maps envelope items', () => {
    const out = slimProductList({
      items: [{ _id: 'a', name: 'A', extra: 1 }],
      total: 1,
    }) as { items: Record<string, unknown>[]; total: number };
    assert.equal(out.total, 1);
    assert.equal(out.items[0].name, 'A');
    assert.equal(out.items[0].extra, undefined);
  });
});

describe('read tool registry', () => {
  it('exposes ≥5 stable read tool names', () => {
    assert.ok(READ_TOOL_NAMES.length >= 5);
    assert.ok(READ_TOOL_NAMES.includes('kppdf_list_materials'));
    assert.ok(READ_TOOL_NAMES.includes('kppdf_list_warehouses'));
  });
});

describe('write tool registry', () => {
  it('exposes propose/confirm/undo tools', () => {
    assert.ok(WRITE_TOOL_NAMES.includes('kppdf_propose_material_create'));
    assert.ok(WRITE_TOOL_NAMES.includes('kppdf_confirm_proposal'));
    assert.ok(WRITE_TOOL_NAMES.includes('kppdf_undo_mutation'));
  });
});
