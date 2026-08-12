import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { IMPORT_TODO_TOOL_NAMES } from './import-todo-tools.js';

describe('import-todo tools (TZD-29)', () => {
  it('registers canonical list name and deprecated alias', () => {
    assert.deepEqual([...IMPORT_TODO_TOOL_NAMES], [
      'kppdf_import_todo_create',
      'kppdf_list_import_todos',
      'kppdf_import_todo_list',
      'kppdf_import_todo_set_status',
    ]);
  });

  it('create/list/set_status call REST paths (mock fetch)', async () => {
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
      if (method === 'POST' && url.includes('/api/import-todos')) {
        return new Response(
          JSON.stringify({
            id: '507f1f77bcf86cd799439801',
            status: 'open',
            title: (body as any)?.title ?? '',
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } },
        );
      }
      if (method === 'PATCH' && url.includes('/api/import-todos/')) {
        return new Response(
          JSON.stringify({
            id: '507f1f77bcf86cd799439801',
            status: (body as any)?.status ?? 'done',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }
      if (method === 'GET' && url.includes('/api/import-todos')) {
        return new Response(
          JSON.stringify({
            items: [
              {
                id: '507f1f77bcf86cd799439801',
                title: 'Доделать шаблон Акт',
                status: 'open',
              },
            ],
            total: 1,
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

      const created = (await backendPostJson(base, key, '/api/import-todos', {
        title: 'Доделать шаблон Акт',
        href: '/doc-constructor/templates/x',
        templateId: '507f1f77bcf86cd799439900',
      })) as { status: string };
      assert.equal(created.status, 'open');

      const listed = (await backendGetJson(
        base,
        key,
        '/api/import-todos?status=open',
      )) as { items: Array<{ status: string }> };
      assert.equal(listed.items[0].status, 'open');

      const patched = (await backendPatchJson(
        base,
        key,
        '/api/import-todos/507f1f77bcf86cd799439801',
        { status: 'done' },
      )) as { status: string };
      assert.equal(patched.status, 'done');

      assert.ok(calls.some((c) => c.method === 'POST' && c.url.includes('/api/import-todos')));
      assert.ok(calls.some((c) => c.method === 'GET' && c.url.includes('/api/import-todos?')));
      assert.ok(
        calls.some((c) => c.method === 'PATCH' && c.url.includes('/api/import-todos/')),
      );
    } finally {
      globalThis.fetch = original;
    }
  });
});
