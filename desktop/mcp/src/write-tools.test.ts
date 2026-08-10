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
  batchItemSchema,
  materialCreateInput,
  buildCompositionLineProposal,
  WRITE_TOOL_NAMES,
} from './write-tools.js';

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
