import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { IMPORT_TASK_TOOL_NAMES } from './import-task-tools.js';

describe('import-task tools (TZD-22)', () => {
  it('registers four tool names', () => {
    assert.deepEqual([...IMPORT_TASK_TOOL_NAMES], [
      'kppdf_import_task_list',
      'kppdf_import_task_get',
      'kppdf_import_task_create',
      'kppdf_import_task_set_status',
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

      assert.ok(calls.some((c) => c.method === 'POST' && c.url.includes('/api/import-tasks')));
      assert.ok(calls.some((c) => c.method === 'GET' && c.url.includes('/api/import-tasks?')));
      assert.ok(calls.some((c) => c.method === 'PATCH' && c.url.includes('/status')));
    } finally {
      globalThis.fetch = original;
    }
  });
});
