/**
 * TZD-32 — MCP material propose fields.
 *
 * Zod-схема инструмента зеркалит backend ProposeMaterialCreateDto whitelist:
 * pricePerUnit / materialKind / description / dimensions опциональны,
 * без них payload как раньше. Проверяем парсинг и тело POST через mock fetch.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildMaterialCreateProposal,
  buildProductCreateProposal,
  batchItemSchema,
  materialCreateInput,
  buildCompositionLineProposal,
  confirmProposal,
  proposeMaterialCreate,
  proposeProductCreate,
  productCreateSchema,
  WRITE_TOOL_NAMES,
} from './write-tools.js';
import type { McpRuntimeConfig } from './config.js';

describe('material propose fields (TZD-32)', () => {
  it('zod accepts extended fields', () => {
    const parsed = materialCreateInput.parse({
      name: 'Стекло 4мм',
      unit: 'м2',
      pricePerUnit: 420,
      materialKind: 'purchased',
      description: 'Полированное',
      dimensions: [{ type: 'thickness', value: 4, isImmutable: true }],
    });
    assert.equal(parsed.pricePerUnit, 420);
    assert.equal(parsed.materialKind, 'purchased');
    assert.deepEqual(parsed.dimensions, [
      { type: 'thickness', value: 4, isImmutable: true },
    ]);
  });

  it('zod rejects unknown materialKind / negative price / bad dimension', () => {
    assert.throws(() =>
      materialCreateInput.parse({ name: 'X', materialKind: 'bogus' }),
    );
    assert.throws(() =>
      materialCreateInput.parse({ name: 'X', pricePerUnit: -1 }),
    );
    assert.throws(() =>
      materialCreateInput.parse({ name: 'X', dimensions: [{ type: 'bogus', value: 1 }] }),
    );
  });

  it('payload builder mirrors DTO whitelist (extended)', () => {
    const body = buildMaterialCreateProposal(
      materialCreateInput.parse({
        name: 'Стекло 4мм',
        unit: 'м2',
        pricePerUnit: 420,
        materialKind: 'purchased',
        description: 'Полированное',
        dimensions: [{ type: 'width', value: 1200 }],
      }),
    );
    assert.deepEqual(body, {
      kind: 'material.create',
      toolName: 'kppdf_propose_material_create',
      create: {
        name: 'Стекло 4мм',
        unit: 'м2',
        article: undefined,
        sku: undefined,
        categoryId: undefined,
        pricePerUnit: 420,
        materialKind: 'purchased',
        description: 'Полированное',
        dimensions: [{ type: 'width', value: 1200 }],
      },
    });
  });

  it('regression: without new fields payload is unchanged (default unit шт)', () => {
    const body = buildMaterialCreateProposal(
      materialCreateInput.parse({ name: 'Oak' }),
    );
    assert.deepEqual(body.create, {
      name: 'Oak',
      unit: 'шт',
      article: undefined,
      sku: undefined,
      categoryId: undefined,
    });
    assert.ok(!('pricePerUnit' in body.create));
    assert.ok(!('materialKind' in body.create));
    assert.ok(!('dimensions' in body.create));
  });

  it('batch item schema mirrors the same whitelist', () => {
    const item = batchItemSchema.parse({
      name: 'Винт М4',
      pricePerUnit: 2.5,
      materialKind: 'fastener',
      dimensions: [{ type: 'length', value: 40 }],
    });
    assert.equal(item.pricePerUnit, 2.5);
    assert.equal(item.materialKind, 'fastener');
    assert.throws(() =>
      batchItemSchema.parse({ name: 'X', materialKind: 'nope' }),
    );
  });
});

describe('product propose category/status contract (TZD-43)', () => {
  it('includes categoryId and status when provided', () => {
    const body = buildProductCreateProposal(
      productCreateSchema.parse({
        name: 'ШЛ-300',
        kind: 'good',
        categoryId: '507f1f77bcf86cd799439011',
        status: 'active',
      }),
    );

    assert.deepEqual(body.productCreate, {
      name: 'ШЛ-300',
      kind: 'good',
      unit: 'шт',
      sku: undefined,
      notes: undefined,
      categoryId: '507f1f77bcf86cd799439011',
      status: 'active',
    });
  });

  it('keeps the legacy payload valid without categoryId/status', () => {
    const body = buildProductCreateProposal(
      productCreateSchema.parse({ name: 'Oak', kind: 'good' }),
    );

    assert.equal(body.productCreate.categoryId, undefined);
    assert.equal(body.productCreate.status, undefined);
    assert.equal(body.productCreate.unit, 'шт');
  });

  it('rejects malformed category ids and unknown statuses', () => {
    assert.throws(() =>
      productCreateSchema.parse({ name: 'X', kind: 'good', categoryId: 'not-an-id' }),
    );
    assert.throws(() =>
      productCreateSchema.parse({ name: 'X', kind: 'good', status: 'published' }),
    );
  });
});

describe('mutation journal propose→confirm chain (TZD-42)', () => {
  it('uses the returned proposalId for material and product confirmations', async () => {
    const cfg: McpRuntimeConfig = {
      apiBaseUrl: 'http://backend.test',
      apiKey: 'pairing-key',
      host: '127.0.0.1',
      port: 9743,
      allowLan: false,
    };
    const originalFetch = globalThis.fetch;
    const confirmed: string[] = [];
    let nextId = 0;

    globalThis.fetch = (async (input, init) => {
      const url = String(input);
      const body = init?.body ? JSON.parse(String(init.body)) : undefined;
      if (url.endsWith('/api/mutation-journal/proposals')) {
        const proposalId = `507f1f77bcf86cd799439${String(nextId++).padStart(3, '0')}`;
        assert.equal(body.toolName.includes('propose_'), true);
        return new Response(JSON.stringify({ _id: proposalId, status: 'proposed' }), {
          status: 201,
          headers: { 'content-type': 'application/json' },
        });
      }
      const match = url.match(/\/proposals\/([^/]+)\/confirm$/);
      assert.ok(match, `unexpected URL: ${url}`);
      const proposalId = decodeURIComponent(match[1]);
      confirmed.push(proposalId);
      return new Response(JSON.stringify({ _id: proposalId, status: 'applied' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }) as typeof fetch;

    try {
      const material = await proposeMaterialCreate(cfg, { name: 'Oak' });
      const product = await proposeProductCreate(
        cfg,
        { name: 'Window', kind: 'good' },
      );
      assert.ok('structuredContent' in material);
      assert.ok('structuredContent' in product);
      const materialId = material.structuredContent.proposalId;
      const productId = product.structuredContent.proposalId;
      assert.equal(typeof materialId, 'string');
      assert.equal(typeof productId, 'string');

      await confirmProposal(cfg, materialId as string);
      await confirmProposal(cfg, productId as string);
      assert.deepEqual(confirmed, [materialId, productId]);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('missing proposal failure echoes the received id and recovery hint', async () => {
    const cfg: McpRuntimeConfig = {
      apiBaseUrl: 'http://backend.test',
      apiKey: 'pairing-key',
      host: '127.0.0.1',
      port: 9743,
      allowLan: false,
    };
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ message: 'Proposal missing not found' }), {
        status: 404,
        headers: { 'content-type': 'application/json' },
      })) as typeof fetch;

    try {
      const response = await confirmProposal(cfg, 'wrong-proposal-id');
      assert.ok('isError' in response);
      assert.equal(response.isError, true);
      const text = response.content[0].text;
      assert.match(text, /wrong-proposal-id/);
      assert.match(text, /proposalId/);
      assert.match(text, /kppdf_propose_\*/);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe('composition HITL tools (TZD-38)', () => {
  it('registers module and composition draft/confirm tools', () => {
    assert.ok(WRITE_TOOL_NAMES.includes('kppdf_propose_module_create'));
    assert.ok(WRITE_TOOL_NAMES.includes('kppdf_confirm_module_create'));
    assert.ok(WRITE_TOOL_NAMES.includes('kppdf_propose_composition_line'));
    assert.ok(WRITE_TOOL_NAMES.includes('kppdf_confirm_composition_line'));
  });

  it('builds a composition draft and rejects product child on module', () => {
    assert.deepEqual(buildCompositionLineProposal({
      parentType: 'product',
      parentId: 'p1',
      lineType: 'module',
      refId: 'm1',
      quantity: 2,
      unit: 'шт',
    }), {
      kind: 'composition.add',
      parentType: 'product',
      parentId: 'p1',
      lineType: 'module',
      refId: 'm1',
      quantity: 2,
      unit: 'шт',
    });
    assert.throws(() => buildCompositionLineProposal({
      parentType: 'module',
      parentId: 'm1',
      lineType: 'product',
      refId: 'p1',
      quantity: 1,
    }));
  });
});
