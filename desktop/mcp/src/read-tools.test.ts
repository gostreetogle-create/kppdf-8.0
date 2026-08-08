import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { withQuery } from './query.js';
import { slimProduct, slimProductList, toolFail, toolOk } from './tool-result.js';
import {
  GRAPH_TOOL_NAMES,
  READ_TOOL_NAMES,
  runIntegritySuite,
  type GraphSampleProvider,
} from './read-tools.js';
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

describe('graph tools (TZD-19)', () => {
  it('registers 5 graph tools + integrity suite', () => {
    assert.deepEqual([...GRAPH_TOOL_NAMES], [
      'kppdf_get_product_composition',
      'kppdf_get_product_where_used',
      'kppdf_get_material_where_used',
      'kppdf_get_module_composition',
      'kppdf_get_module_where_used',
      'kppdf_run_integrity_suite',
    ]);
    assert.ok(READ_TOOL_NAMES.includes('kppdf_list_modules'));
  });

  function deps(overrides: Partial<GraphSampleProvider> = {}): GraphSampleProvider {
    return {
      listProducts: async () => [{ _id: 'p1' }],
      listMaterials: async () => [{ _id: 'm1' }],
      listModules: async () => [{ _id: 'mod1' }],
      getProductComposition: async () => ({ ok: true }),
      getProductWhereUsed: async () => ({ ok: true }),
      getMaterialWhereUsed: async () => ({ ok: true }),
      getModuleComposition: async () => ({ ok: true }),
      getModuleWhereUsed: async () => ({ ok: true }),
      ...overrides,
    };
  }

  it('smoke on sample ids returns ok + checks; no write calls', async () => {
    const result = await runIntegritySuite(deps(), { sample: 2 });
    assert.equal(result.ok, true);
    // product × 2 + material × 1 + module × 2
    assert.equal(result.checks.length, 5);
    assert.ok(result.checks.every((c) => c.ok));
    assert.deepEqual(result.warnings, []);
  });

  it('failed endpoint → check ok:false + warning; suite ok:false', async () => {
    const result = await runIntegritySuite(
      deps({
        getMaterialWhereUsed: async () => {
          throw new Error('boom');
        },
      }),
    );
    assert.equal(result.ok, false);
    const failed = result.checks.find((c) => c.name === 'material.where_used:m1');
    assert.ok(failed);
    assert.equal(failed.ok, false);
    assert.match(failed.detail ?? '', /boom/);
    assert.ok(result.warnings.some((w) => w.includes('failed')));
  });

  it('empty catalogs → warnings, ok stays true', async () => {
    const result = await runIntegritySuite(
      deps({
        listProducts: async () => [],
        listMaterials: async () => [],
        listModules: async () => [],
      }),
    );
    assert.equal(result.ok, true);
    assert.equal(result.checks.length, 0);
    assert.equal(result.warnings.length, 3);
  });
});

describe('write tool registry', () => {
  it('exposes propose/confirm/undo tools', () => {
    assert.ok(WRITE_TOOL_NAMES.includes('kppdf_propose_material_create'));
    assert.ok(WRITE_TOOL_NAMES.includes('kppdf_confirm_proposal'));
    assert.ok(WRITE_TOOL_NAMES.includes('kppdf_undo_mutation'));
  });

  it('exposes batch tools (TZD-18)', () => {
    assert.ok(WRITE_TOOL_NAMES.includes('kppdf_propose_material_batch'));
    assert.ok(WRITE_TOOL_NAMES.includes('kppdf_confirm_batch'));
    assert.ok(WRITE_TOOL_NAMES.includes('kppdf_cancel_batch'));
  });
});
