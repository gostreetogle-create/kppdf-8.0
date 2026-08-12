import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { McpRuntimeConfig } from './config.js';
import {
  cleanupTestData,
  cleanupTestDataInput,
  findDuplicateGroups,
} from './hygiene-tools.js';

const cfg: McpRuntimeConfig = {
  apiBaseUrl: 'http://backend.test',
  apiKey: 'pairing-key',
  host: '127.0.0.1',
  port: 9743,
  allowLan: false,
};

const fixture = [
  { _id: '507f1f77bcf86cd799439011', name: '  Тест · Форма  ', sku: 'TF-1', inn: '7700000001' },
  { _id: '507f1f77bcf86cd799439012', name: 'Тест · Форма', sku: 'TF-2', inn: '7700000002' },
  { _id: '507f1f77bcf86cd799439013', name: 'Уникальный', sku: 'TF-1', inn: '7700000003' },
];

describe('MCP hygiene (TZD-44)', () => {
  it('findDuplicateGroups finds normalized name and SKU groups', () => {
    const groups = findDuplicateGroups('product', fixture);

    assert.deepEqual(
      groups.map((group) => [group.criterion, group.value, group.ids]),
      [
        ['name', 'тест · форма', ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']],
        ['sku', 'tf-1', ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439013']],
      ],
    );
  });

  it('cleanup rejects an empty ids filter before any backend call', () => {
    const parsed = cleanupTestDataInput.safeParse({
      entity: 'product',
      userOk: true,
      ids: [],
    });
    assert.equal(parsed.success, false);
  });

  it('cleanup without userOk performs zero backend calls', async () => {
    const originalFetch = globalThis.fetch;
    let calls = 0;
    globalThis.fetch = (async () => {
      calls += 1;
      return new Response('{}', { status: 200 });
    }) as typeof fetch;

    try {
      const response = await cleanupTestData(cfg, {
        entity: 'counterparty',
        userOk: false,
        dryRun: false,
        namePrefix: 'Тест',
      });
      assert.ok('isError' in response);
      assert.equal(response.isError, true);
      assert.match(response.content[0].text, /userOk=true/);
      assert.equal(calls, 0);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('dryRun lists prefix candidates without mutation', async () => {
    const originalFetch = globalThis.fetch;
    const methods: string[] = [];
    globalThis.fetch = (async (_input, init) => {
      methods.push(init?.method ?? 'GET');
      return new Response(JSON.stringify({ items: fixture }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }) as typeof fetch;

    try {
      const response = await cleanupTestData(cfg, {
        entity: 'product',
        userOk: true,
        dryRun: true,
        namePrefix: 'Тест',
      });
      assert.ok('structuredContent' in response);
      const result = response.structuredContent.result as Record<string, unknown>;
      assert.equal(result.mutated, 0);
      assert.equal((result.candidates as unknown[]).length, 2);
      assert.deepEqual(methods, ['GET']);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('approved prefix cleanup calls existing DELETE soft-delete endpoint', async () => {
    const originalFetch = globalThis.fetch;
    const requests: Array<{ method: string; url: string }> = [];
    globalThis.fetch = (async (input, init) => {
      requests.push({ method: init?.method ?? 'GET', url: String(input) });
      if ((init?.method ?? 'GET') === 'GET') {
        return new Response(JSON.stringify({ items: fixture }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      }
      return new Response(null, { status: 204 });
    }) as typeof fetch;

    try {
      const response = await cleanupTestData(cfg, {
        entity: 'counterparty',
        userOk: true,
        dryRun: false,
        namePrefix: 'Тест',
      });
      assert.ok('structuredContent' in response);
      const result = response.structuredContent.result as Record<string, unknown>;
      assert.deepEqual(result.removedIds, [
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439012',
      ]);
      assert.deepEqual(requests.map((request) => request.method), ['GET', 'DELETE', 'DELETE']);
      assert.ok(requests.every((request) => !request.url.includes('hard')));
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
