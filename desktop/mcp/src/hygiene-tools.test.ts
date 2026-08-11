/**
 * TZD-44 — data hygiene tools.
 *
 * find_duplicates — read-only группы дублей; cleanup_test_data — гейтинг
 * (userOk:true + фильтр; dryRun → 0 мутаций; мягкий soft-delete через
 * существующие DELETE эндпоинты).
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { McpRuntimeConfig } from './config.js';
import { createKppdfMcpServer } from './tools.js';
import {
  findDuplicateGroups,
  selectCleanupCandidates,
  toHygieneItem,
  type HygieneItem,
} from './hygiene-tools.js';

const cfg: McpRuntimeConfig = {
  apiBaseUrl: 'http://127.0.0.1:3000',
  apiKey: 'test-pairing-key',
  host: '127.0.0.1',
  port: 9743,
  allowLan: false,
};

function items(rows: Array<{ _id: string; name: string; sku?: string; inn?: string }>): HygieneItem[] {
  return rows
    .map((r) => toHygieneItem({ deletedAt: null, ...r }))
    .filter((x): x is HygieneItem => x !== null);
}

describe('findDuplicateGroups (TZD-44)', () => {
  it('находит группу с двумя одинаковыми именами (нормализация пробелов/регистра)', () => {
    const fixture = items([
      { _id: 'a1', name: 'Тест Материал' },
      { _id: 'a2', name: '  тест  материал ' },
      { _id: 'a3', name: 'Другой материал' },
    ]);
    const groups = findDuplicateGroups(fixture, 'material', ['name', 'sku']);
    const nameGroup = groups.find((g) => g.criterion === 'name');
    assert.ok(nameGroup, 'должна быть name-группа');
    assert.equal(nameGroup.count, 2);
    assert.deepEqual(new Set(nameGroup.ids), new Set(['a1', 'a2']));
  });

  it('находит sku-дубли и inn-дубли (counterparty)', () => {
    const fixture = items([
      { _id: 'c1', name: 'ООО А', inn: '7701234567' },
      { _id: 'c2', name: 'ООО А-дубль', inn: '7701234567' },
    ]);
    const groups = findDuplicateGroups(fixture, 'counterparty', ['name', 'inn']);
    assert.ok(groups.some((g) => g.criterion === 'inn' && g.count === 2));
  });

  it('не считает одиночные записи дублями и игнорирует soft-deleted', () => {
    const fixture = items([{ _id: 'x1', name: 'Уникальный' }]);
    assert.deepEqual(findDuplicateGroups(fixture, 'product', ['name']), []);
    const deleted = toHygieneItem({ _id: 'd1', name: 'X', deletedAt: '2026-01-01' });
    assert.equal(deleted, null);
  });
});

describe('selectCleanupCandidates (TZD-44)', () => {
  const fixture = items([
    { _id: 't1', name: 'Тест Материал', sku: 'TEST-1' },
    { _id: 't2', name: 'Тест Материал 2' },
    { _id: 'r1', name: 'Реальный материал' },
    { _id: 'g1', name: 'fbdb' },
  ]);

  it('namePrefix выбирает только по префиксу (case-insensitive)', () => {
    const { candidates } = selectCleanupCandidates(fixture, { namePrefix: 'тест' }, 200);
    assert.deepEqual(new Set(candidates.map((c) => c.id)), new Set(['t1', 't2']));
  });

  it('nameRegex выбирает по регулярке', () => {
    const { candidates } = selectCleanupCandidates(fixture, { nameRegex: '^fbdb$' }, 200);
    assert.deepEqual(candidates.map((c) => c.id), ['g1']);
  });

  it('ids выбирает только указанные', () => {
    const { candidates } = selectCleanupCandidates(fixture, { ids: ['r1'] }, 200);
    assert.deepEqual(candidates.map((c) => c.id), ['r1']);
  });

  it('max обрезает кандидатов и помечает truncated', () => {
    const { candidates, truncated } = selectCleanupCandidates(fixture, { namePrefix: 'т' }, 1);
    assert.equal(candidates.length, 1);
    assert.equal(truncated, true);
  });
});

describe('cleanup_test_data gates (TZD-44, mock fetch)', () => {
  function installFetch(
    handler: (url: string, method: string) => unknown,
  ): () => void {
    const original = globalThis.fetch;
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = (init?.method ?? 'GET').toUpperCase();
      return new Response(JSON.stringify(handler(url, method)), {
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
  ): Promise<{
    structuredContent?: Record<string, unknown>;
    isError?: boolean;
    content: Array<{ text: string }>;
  }> {
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

  const listPayload = {
    items: [
      { _id: 't1', name: 'Тест Материал' },
      { _id: 't2', name: 'Тест Материал 2' },
      { _id: 'r1', name: 'Реальный материал' },
    ],
    total: 3,
    page: 1,
    limit: 100,
  };

  it('без userOk → toolFail и 0 DELETE', async () => {
    let deletes = 0;
    const restore = installFetch((url, method) => {
      if (method === 'DELETE') deletes += 1;
      return listPayload;
    });
    try {
      const out = await runTool('kppdf_cleanup_test_data', {
        entity: 'material',
        namePrefix: 'Тест',
      });
      assert.equal(out.isError, true);
      assert.match(out.content[0].text, /userOk:true is required/);
      assert.equal(deletes, 0);
    } finally {
      restore();
    }
  });

  it('без фильтра → toolFail и 0 DELETE', async () => {
    let deletes = 0;
    const restore = installFetch((_url, method) => {
      if (method === 'DELETE') deletes += 1;
      return listPayload;
    });
    try {
      const out = await runTool('kppdf_cleanup_test_data', {
        entity: 'material',
        userOk: true,
      });
      assert.equal(out.isError, true);
      assert.match(out.content[0].text, /at least one filter/);
      assert.equal(deletes, 0);
    } finally {
      restore();
    }
  });

  it('dryRun → список кандидатов, 0 DELETE', async () => {
    let deletes = 0;
    const restore = installFetch((_url, method) => {
      if (method === 'DELETE') deletes += 1;
      return listPayload;
    });
    try {
      const out = await runTool('kppdf_cleanup_test_data', {
        entity: 'material',
        userOk: true,
        dryRun: true,
        namePrefix: 'Тест',
      });
      assert.equal(out.isError, undefined);
      const sc = out.structuredContent!;
      assert.equal(sc.dryRun, true);
      assert.equal(sc.candidateCount, 2);
      assert.equal(deletes, 0);
    } finally {
      restore();
    }
  });

  it('userOk + namePrefix → soft-delete каждого кандидата через DELETE', async () => {
    const deletedIds: string[] = [];
    const restore = installFetch((url, method) => {
      if (method === 'DELETE') deletedIds.push(url);
      return listPayload;
    });
    try {
      const out = await runTool('kppdf_cleanup_test_data', {
        entity: 'material',
        userOk: true,
        namePrefix: 'Тест',
      });
      assert.equal(out.isError, undefined);
      const sc = out.structuredContent!;
      assert.equal(sc.deletedCount, 2);
      assert.equal(sc.failedCount, 0);
      assert.deepEqual(new Set(deletedIds), new Set([
        'http://127.0.0.1:3000/api/materials/t1',
        'http://127.0.0.1:3000/api/materials/t2',
      ]));
    } finally {
      restore();
    }
  });

  it('userOk + ids → soft-delete только указанных (ТестФорма кейс)', async () => {
    const deletedIds: string[] = [];
    const restore = installFetch((url, method) => {
      if (method === 'DELETE') deletedIds.push(url);
      return listPayload;
    });
    try {
      const out = await runTool('kppdf_cleanup_test_data', {
        entity: 'counterparty',
        userOk: true,
        ids: ['r1'],
      });
      assert.equal(out.isError, undefined);
      assert.equal(out.structuredContent!.deletedCount, 1);
      assert.deepEqual(deletedIds, ['http://127.0.0.1:3000/api/counterparties/r1']);
    } finally {
      restore();
    }
  });

  it('find_duplicates через handler: группы по имени на фикстуре', async () => {
    const restore = installFetch(() => ({
      items: [
        { _id: 'd1', name: 'fbdb' },
        { _id: 'd2', name: 'fbdb' },
        { _id: 'd3', name: 'нормальный материал' },
      ],
      total: 3,
      page: 1,
      limit: 100,
    }));
    try {
      const out = await runTool('kppdf_find_duplicates', { entity: 'material' });
      assert.equal(out.isError, undefined);
      const sc = out.structuredContent!;
      assert.equal(sc.scanned, 3);
      const groups = sc.groups as Array<{ criterion: string; count: number; ids: string[] }>;
      const nameGroup = groups.find((g) => g.criterion === 'name');
      assert.ok(nameGroup);
      assert.equal(nameGroup.count, 2);
      assert.deepEqual(new Set(nameGroup.ids), new Set(['d1', 'd2']));
    } finally {
      restore();
    }
  });
});
