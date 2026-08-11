/**
 * TZD-32 — MCP material propose fields.
 *
 * Zod-схема инструмента зеркалит backend ProposeMaterialCreateDto whitelist:
 * pricePerUnit / materialKind / description / dimensions опциональны,
 * без них payload как раньше. Проверяем парсинг и тело POST через mock fetch.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { McpRuntimeConfig } from './config.js';
import { createKppdfMcpServer } from './tools.js';
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

describe('TZD-41 envelope through registered tool handlers (mock fetch)', () => {
  const cfg: McpRuntimeConfig = {
    apiBaseUrl: 'http://127.0.0.1:3000',
    apiKey: 'test-pairing-key',
    host: '127.0.0.1',
    port: 9743,
    allowLan: false,
  };

  function installFetch(
    handler: (url: string, method: string, body: unknown) => unknown,
  ): () => void {
    const original = globalThis.fetch;
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = (init?.method ?? 'GET').toUpperCase();
      const body = init?.body ? (JSON.parse(String(init.body)) as unknown) : undefined;
      return new Response(JSON.stringify(handler(url, method, body)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as typeof fetch;
    return () => {
      globalThis.fetch = original;
    };
  }

  async function runTool(name: string, args: unknown): Promise<Record<string, unknown>> {
    const server = createKppdfMcpServer(cfg);
    const tools = (
      server as unknown as { _registeredTools: Record<string, { handler: (a: unknown) => Promise<unknown> }> }
    )._registeredTools;
    const tool = tools[name];
    assert.ok(tool, `tool ${name} not registered`);
    const out = (await tool.handler(args)) as {
      structuredContent?: Record<string, unknown>;
    };
    assert.ok(out.structuredContent, `${name} должен отдавать structuredContent (outputSchema)`);
    return out.structuredContent;
  }

  it('propose_material_create → top-level proposalId (аудит-баг §5.2)', async () => {
    const restore = installFetch((url, method) => {
      assert.equal(method, 'POST');
      assert.match(url, /\/api\/mutation-journal\/proposals$/);
      return { proposalId: 'prop-abc-123', kind: 'material.create', create: { name: 'X' } };
    });
    try {
      const out = await runTool('kppdf_propose_material_create', { name: 'Сталь 09Г2С' });
      assert.equal(out.ok, true);
      assert.equal(out.proposalId, 'prop-abc-123');
      assert.ok(out.result);
    } finally {
      restore();
    }
  });

  it('propose_product_create → top-level proposalId even when backend nests nothing (regression §5.2)', async () => {
    const restore = installFetch((_url, _method) => ({
      proposalId: 'prop-prod-1',
      kind: 'product.create',
    }));
    try {
      const out = await runTool('kppdf_propose_product_create', {
        name: 'Турник',
        kind: 'good',
      });
      assert.equal(out.proposalId, 'prop-prod-1');
    } finally {
      restore();
    }
  });

  it('confirm_proposal → structured envelope with result', async () => {
    const restore = installFetch((_url, _method) => ({ _id: 'mutation-1' }));
    try {
      const out = await runTool('kppdf_confirm_proposal', { proposalId: 'prop-abc-123' });
      assert.equal(out.ok, true);
      assert.equal(out.id, 'mutation-1');
      assert.ok(out.result);
    } finally {
      restore();
    }
  });

  it('counterparty_create → top-level id normalized from _id (аудит-баг §5.2)', async () => {
    const restore = installFetch((_url, _method) => ({
      _id: '507f1f77bcf86cd799439601',
      name: 'ООО Тест',
    }));
    try {
      const out = await runTool('kppdf_counterparty_create', {
        name: 'ООО Тест',
        inn: '7701234567',
        roles: ['customer'],
      });
      assert.equal(out.id, '507f1f77bcf86cd799439601');
    } finally {
      restore();
    }
  });
});

describe('TZD-42 propose→confirm chain + fail echo (mock fetch)', () => {
  const cfg: McpRuntimeConfig = {
    apiBaseUrl: 'http://127.0.0.1:3000',
    apiKey: 'test-pairing-key',
    host: '127.0.0.1',
    port: 9743,
    allowLan: false,
  };

  function installFetch(
    handler: (url: string, method: string, body: unknown) => unknown,
  ): () => void {
    const original = globalThis.fetch;
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = (init?.method ?? 'GET').toUpperCase();
      const body = init?.body ? (JSON.parse(String(init.body)) as unknown) : undefined;
      return new Response(JSON.stringify(handler(url, method, body)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as typeof fetch;
    return () => {
      globalThis.fetch = original;
    };
  }

  async function runTool(
    name: string,
    args: unknown,
  ): Promise<{ structuredContent?: Record<string, unknown>; isError?: boolean; content: Array<{ text: string }> }> {
    const server = createKppdfMcpServer(cfg);
    const tools = (
      server as unknown as { _registeredTools: Record<string, { handler: (a: unknown) => Promise<unknown> }> }
    )._registeredTools;
    const tool = tools[name];
    assert.ok(tool, `tool ${name} not registered`);
    return (await tool.handler(args)) as {
      structuredContent?: Record<string, unknown>;
      isError?: boolean;
      content: Array<{ text: string }>;
    };
  }

  it('propose → top-level proposalId → confirm с тем же id (полный цикл, 0 угадываний)', async () => {
    const urls: string[] = [];
    const restore = installFetch((url, method, _body) => {
      urls.push(`${method} ${url}`);
      if (url.includes('/confirm')) {
        return { _id: 'mutation-9', status: 'applied' };
      }
      return { proposalId: 'prop-chain-42', kind: 'material.create', create: { name: 'Швеллер 120×5' } };
    });
    try {
      const propose = await runTool('kppdf_propose_material_create', { name: 'Швеллер 120×5' });
      assert.equal(propose.structuredContent?.proposalId, 'prop-chain-42');

      const confirm = await runTool('kppdf_confirm_proposal', {
        proposalId: propose.structuredContent?.proposalId,
      });
      assert.equal(confirm.isError, undefined);
      assert.equal(confirm.structuredContent?.id, 'mutation-9');
      assert.ok(
        urls.some((u) => u.includes('/api/mutation-journal/proposals/prop-chain-42/confirm')),
        `confirm должен звать ровно proposalId из propose: ${urls.join('; ')}`,
      );
    } finally {
      restore();
    }
  });

  it('confirm fail эхо-тит полученный proposalId в тексте ошибки (TZD-42)', async () => {
    const restore = installFetch(() => {
      throw new Error('Not Found');
    });
    try {
      const out = await runTool('kppdf_confirm_proposal', { proposalId: 'bad-id-xyz' });
      assert.equal(out.isError, true);
      const text = out.content[0].text;
      assert.match(text, /proposalId=bad-id-xyz/);
    } finally {
      restore();
    }
  });
});
