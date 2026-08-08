import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  applyImportTaskPlan,
  IMPORT_TASK_TOOL_NAMES,
  type ApplyPlanDeps,
  type BatchProposalItem,
} from './import-task-tools.js';

describe('import-task tools (TZD-22 + TZD-23)', () => {
  it('registers seven tool names', () => {
    assert.deepEqual([...IMPORT_TASK_TOOL_NAMES], [
      'kppdf_import_task_list',
      'kppdf_import_task_get',
      'kppdf_import_task_create',
      'kppdf_import_task_set_status',
      'kppdf_import_task_set_report',
      'kppdf_import_task_apply_plan',
      'kppdf_import_task_reshape',
    ]);
  });

  it('create/list/get/set_status call REST paths (mock fetch)', async () => {
    const calls: Array<{ method: string; url: string; body?: unknown }> = [];
    const original = globalThis.fetch;
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = (init?.method ?? 'GET').toUpperCase();
      let body: unknown;
      if (init?.body) {
        body = JSON.parse(String(init.body));
      }
      calls.push({ method, url, body });
      if (method === 'POST' && url.includes('/api/import-tasks')) {
        return new Response(
          JSON.stringify({
            id: '507f1f77bcf86cd799439033',
            status: 'ready_for_ai',
            rowCount: 2,
            proposalIds: [],
            rows: (body as any)?.rows ?? [],
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } },
        );
      }
      if (method === 'GET' && /\/api\/import-tasks\/[^/?]+$/.test(url)) {
        return new Response(
          JSON.stringify({
            id: '507f1f77bcf86cd799439033',
            status: 'ready_for_ai',
            rows: [{ rowIndex: 0, raw: { name: 'A' }, name: 'A' }],
            rowCount: 1,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }
      if (method === 'GET' && url.includes('/api/import-tasks')) {
        return new Response(
          JSON.stringify({
            items: [
              {
                id: '507f1f77bcf86cd799439033',
                summary: 't.xlsx · 2 строк',
                rowCount: 2,
                status: 'ready_for_ai',
              },
            ],
            total: 1,
            page: 1,
            limit: 20,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }
      if (method === 'PATCH' && url.includes('/report')) {
        return new Response(
          JSON.stringify({
            id: '507f1f77bcf86cd799439033',
            status: (body as any)?.status ?? 'awaiting_user',
            aiReport: (body as any)?.aiReport ?? null,
            rows: [{ rowIndex: 0, raw: { name: 'A' }, name: 'A' }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }
      if (method === 'PATCH' && url.includes('/rows')) {
        return new Response(
          JSON.stringify({
            id: '507f1f77bcf86cd799439033',
            status: 'ready_for_ai',
            rows: (body as any)?.rows ?? [],
            columnMap: (body as any)?.columnMap ?? null,
            reshapeNote: (body as any)?.reshapeNote ?? null,
            aiReport: null,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }
      if (method === 'PATCH' && url.includes('/status')) {
        return new Response(
          JSON.stringify({
            id: '507f1f77bcf86cd799439033',
            status: (body as any)?.status ?? 'cancelled',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }
      return new Response('not found', { status: 404 });
    }) as typeof fetch;

    try {
      const { backendGetJson, backendPostJson, backendPatchJson } = await import(
        './backend.js'
      );
      const base = 'http://127.0.0.1:3000';
      const key = 'test-jwt';

      const created = (await backendPostJson(base, key, '/api/import-tasks', {
        source: { fileName: 't.xlsx', fileType: 'xlsx' },
        rows: [
          { rowIndex: 0, raw: { name: 'A' }, name: 'A' },
          { rowIndex: 1, raw: { name: 'B' }, name: 'B' },
        ],
      })) as { status: string; proposalIds: string[] };
      assert.equal(created.status, 'ready_for_ai');
      assert.deepEqual(created.proposalIds, []);

      const listed = (await backendGetJson(base, key, '/api/import-tasks?limit=20')) as {
        items: Array<{ rowCount: number }>;
      };
      assert.equal(listed.items[0].rowCount, 2);

      const one = (await backendGetJson(
        base,
        key,
        '/api/import-tasks/507f1f77bcf86cd799439033',
      )) as { rows: unknown[] };
      assert.equal(one.rows.length, 1);

      const patched = (await backendPatchJson(
        base,
        key,
        '/api/import-tasks/507f1f77bcf86cd799439033/status',
        { status: 'cancelled' },
      )) as { status: string };
      assert.equal(patched.status, 'cancelled');

      const report = (await backendPatchJson(
        base,
        key,
        '/api/import-tasks/507f1f77bcf86cd799439033/report',
        {
          summary: '1 new / 1 doubt',
          aiReport: {
            version: 1,
            matchedAt: '2026-08-08T00:00:00Z',
            counts: { new: 1, skip: 0, update: 0, doubt: 1 },
            rows: [
              { rowIndex: 0, decision: 'new', proposed: { name: 'A' } },
              { rowIndex: 1, decision: 'doubt', reason: 'ambiguous' },
            ],
          },
          status: 'awaiting_user',
        },
      )) as { status: string; aiReport: { counts: { new: number } } };
      assert.equal(report.status, 'awaiting_user');
      assert.equal(report.aiReport.counts.new, 1);

      const reshaped = (await backendPatchJson(
        base,
        key,
        '/api/import-tasks/507f1f77bcf86cd799439033/rows',
        {
          rows: [
            { rowIndex: 0, raw: { name: 'X' }, name: 'X', unit: 'м' },
            { rowIndex: 1, raw: { name: 'Y' }, name: 'Y' },
          ],
          columnMap: { 'Наименование': 'name', 'Цена': null },
          reshapeNote: '«Цена» удалена',
        },
      )) as { rows: unknown[]; columnMap: Record<string, string | null>; aiReport: unknown };
      assert.equal(reshaped.rows.length, 2);
      assert.equal(reshaped.columnMap['Цена'], null);
      assert.equal(reshaped.aiReport, null);

      assert.ok(calls.some((c) => c.method === 'POST' && c.url.includes('/api/import-tasks')));
      assert.ok(calls.some((c) => c.method === 'GET' && c.url.includes('/api/import-tasks?')));
      assert.ok(calls.some((c) => c.method === 'PATCH' && c.url.includes('/status')));
      assert.ok(calls.some((c) => c.method === 'PATCH' && c.url.includes('/report')));
      assert.ok(calls.some((c) => c.method === 'PATCH' && c.url.includes('/rows')));
    } finally {
      globalThis.fetch = original;
    }
  });
});

describe('applyImportTaskPlan (TZD-23 HITL gate + TZD-18 chunks)', () => {
  function makeDeps(overrides: Partial<ApplyPlanDeps> = {}): {
    deps: ApplyPlanDeps;
    calls: {
      chunks: BatchProposalItem[][];
      setProposals: unknown[];
      gets: number;
    };
  } {
    const calls = { chunks: [] as BatchProposalItem[][], setProposals: [] as unknown[], gets: 0 };
    let seq = 0;
    const deps: ApplyPlanDeps = {
      getTask: async () => {
        calls.gets += 1;
        return { status: 'awaiting_user', aiReport: { rows: [] } };
      },
      proposeBatch: async (chunk) => {
        calls.chunks.push(chunk);
        return {
          proposalIds: chunk.map((item) => `p-${++seq}`),
          errors: undefined,
        };
      },
      setProposals: async (taskId, ids) => {
        calls.setProposals.push({ taskId, ids });
        return { id: taskId, status: 'applying', proposalIds: ids };
      },
      ...overrides,
    };
    return { deps, calls };
  }

  it('userOk=false → ok:false, 0 proposes, getTask never called', async () => {
    const { deps, calls } = makeDeps();
    const result = await applyImportTaskPlan(deps, {
      id: 't1',
      userOk: false,
    });
    assert.equal(result.ok, false);
    assert.equal(result.proposed, 0);
    assert.equal(calls.gets, 0);
    assert.equal(calls.chunks.length, 0);
    assert.equal(calls.setProposals.length, 0);
    assert.match(result.note ?? '', /userOk=true/);
  });

  it('not awaiting_user → ok:false, 0 proposes', async () => {
    const { deps, calls } = makeDeps({
      getTask: async () => ({ status: 'ready_for_ai', aiReport: null }),
    });
    const result = await applyImportTaskPlan(deps, { id: 't1', userOk: true });
    assert.equal(result.ok, false);
    assert.equal(result.proposed, 0);
    assert.equal(calls.chunks.length, 0);
    assert.match(result.note ?? '', /awaiting_user/);
  });

  it('fixture 2 new + 1 skip + 1 update + 1 doubt → 3 proposes, applying, 1 chunk', async () => {
    const { deps, calls } = makeDeps({
      getTask: async () => ({
        status: 'awaiting_user',
        aiReport: {
          rows: [
            { rowIndex: 0, decision: 'new', proposed: { name: 'Стекло 4мм', unit: 'м2' } },
            { rowIndex: 1, decision: 'new', proposed: { name: 'Труба 40', unit: 'м' } },
            { rowIndex: 2, decision: 'skip', reason: 'duplicate' },
            {
              rowIndex: 3,
              decision: 'update',
              materialId: '507f1f77bcf86cd799439044',
              proposed: { unit: 'кг' },
            },
            { rowIndex: 4, decision: 'doubt', reason: 'ambiguous' },
          ],
        },
      }),
    });

    const result = await applyImportTaskPlan(deps, { id: 't1', userOk: true });

    assert.equal(result.ok, true);
    assert.equal(result.proposed, 3);
    assert.equal(result.skipped, 1);
    assert.equal(result.doubts, 1);
    assert.equal(result.batchCalls, 1);
    assert.deepEqual(result.proposalIds, ['p-1', 'p-2', 'p-3']);
    assert.equal(calls.chunks.length, 1);
    assert.equal(calls.chunks[0].length, 3);
    const updateItem = calls.chunks[0].find((i) => i.kind === 'material.update');
    assert.ok(updateItem);
    assert.deepEqual(updateItem.update, {
      id: '507f1f77bcf86cd799439044',
      patch: { unit: 'кг' },
    });
    assert.deepEqual(calls.setProposals, [
      { taskId: 't1', ids: ['p-1', 'p-2', 'p-3'] },
    ]);
    assert.equal((result.task as { status?: string })?.status, 'applying');
  });

  it('120-row plan → ≤3 batch calls (chunk 100) (TZD-18)', async () => {
    const rows = Array.from({ length: 120 }, (_, i) => ({
      rowIndex: i,
      decision: 'new' as const,
      proposed: { name: `М${i}` },
    }));
    const { deps, calls } = makeDeps({
      getTask: async () => ({ status: 'awaiting_user', aiReport: { rows } }),
    });

    const result = await applyImportTaskPlan(deps, { id: 't1', userOk: true });

    assert.equal(result.ok, true);
    assert.equal(result.proposed, 120);
    assert.equal(calls.chunks.length, 2);
    assert.ok(result.batchCalls !== undefined && result.batchCalls <= 3);
    assert.equal(calls.chunks[0].length, 100);
    assert.equal(calls.chunks[1].length, 20);
    assert.equal((result.proposalIds ?? []).length, 120);
  });

  it('chunk error → ok:false, nothing linked, setProposals NOT called', async () => {
    const rows = Array.from({ length: 105 }, (_, i) => ({
      rowIndex: i,
      decision: 'new' as const,
      proposed: { name: `М${i}` },
    }));
    const { deps, calls } = makeDeps({
      getTask: async () => ({ status: 'awaiting_user', aiReport: { rows } }),
      proposeBatch: async (chunk) => {
        calls.chunks.push(chunk);
        if (calls.chunks.length === 1) {
          return { proposalIds: chunk.map((_, i) => `p-${i}`), errors: undefined };
        }
        return { proposalIds: [], errors: [{ index: 0, error: 'boom' }] };
      },
    });

    const result = await applyImportTaskPlan(deps, { id: 't1', userOk: true });

    assert.equal(result.ok, false);
    assert.equal(result.proposed, 0);
    assert.equal(calls.setProposals.length, 0);
    assert.match(result.note ?? '', /failed/);
  });

  it('doubt-only plan → ok:true, 0 proposes, setProposals NOT called', async () => {
    const { deps, calls } = makeDeps({
      getTask: async () => ({
        status: 'awaiting_user',
        aiReport: {
          rows: [
            { rowIndex: 0, decision: 'doubt', reason: 'ambiguous' },
            { rowIndex: 1, decision: 'doubt', reason: 'ambiguous' },
          ],
        },
      }),
    });

    const result = await applyImportTaskPlan(deps, { id: 't1', userOk: true });

    assert.equal(result.ok, true);
    assert.equal(result.proposed, 0);
    assert.equal(result.doubts, 2);
    assert.equal(calls.chunks.length, 0);
    assert.equal(calls.setProposals.length, 0);
    assert.match(result.note ?? '', /No proposals/);
  });

  it('new row without name / update without materialId → skipped, no crash', async () => {
    const { deps, calls } = makeDeps({
      getTask: async () => ({
        status: 'awaiting_user',
        aiReport: {
          rows: [
            { rowIndex: 0, decision: 'new', proposed: {} },
            { rowIndex: 1, decision: 'update', proposed: { unit: 'м' } },
            { rowIndex: 2, decision: 'new', proposed: { name: 'OK' } },
          ],
        },
      }),
    });

    const result = await applyImportTaskPlan(deps, { id: 't1', userOk: true });

    assert.equal(result.proposed, 1);
    assert.equal(result.skipped, 2);
    assert.deepEqual(result.proposalIds, ['p-1']);
    assert.equal(calls.chunks.length, 1);
    assert.equal(calls.chunks[0].length, 1);
  });
});
