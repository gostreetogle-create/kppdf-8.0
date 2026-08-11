import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DOC_TOOL_NAMES } from './doc-tools.js';

describe('doc tools (TZD-28)', () => {
  it('registers canonical kppdf_list_* names + deprecated aliases (TZD-41)', () => {
    assert.deepEqual([...DOC_TOOL_NAMES], [
      'kppdf_list_doc_types',
      'kppdf_doc_types_list',
      'kppdf_list_doc_template_categories',
      'kppdf_doc_template_categories_list',
      'kppdf_list_doc_templates',
      'kppdf_doc_templates_list',
      'kppdf_doc_template_create_draft',
    ]);
  });

  it('list tools hit GET paths; create_draft posts draft-only flags (mock fetch)', async () => {
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

      if (method === 'POST' && url.includes('/api/document-templates')) {
        const b = body as { name?: string; isActive?: boolean; isDefault?: boolean; notes?: string };
        return new Response(
          JSON.stringify({
            _id: '507f1f77bcf86cd799439601',
            name: b?.name ?? 'draft',
            isActive: b?.isActive ?? false,
            isDefault: b?.isDefault ?? false,
            notes: b?.notes ?? '',
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } },
        );
      }
      const payload =
        url.includes('/api/doc-types') || url.includes('/api/document-template-categories')
          ? { items: [{ _id: 'x', name: 'X' }] }
          : { items: [{ _id: '507f1f77bcf86cd799439600', name: 'A4 письмо' }] };
      return new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }) as typeof fetch;

    try {
      const { backendGetJson, backendPostJson } = await import('./backend.js');
      const base = 'http://127.0.0.1:3000';
      const key = 'test-jwt';

      const types = (await backendGetJson(base, key, '/api/doc-types')) as { items: unknown[] };
      assert.equal(types.items.length, 1);

      const cats = (await backendGetJson(
        base,
        key,
        '/api/document-template-categories',
      )) as { items: unknown[] };
      assert.equal(cats.items.length, 1);

      const templates = (await backendGetJson(
        base,
        key,
        '/api/document-templates',
      )) as { items: Array<{ _id: string }> };
      assert.equal(templates.items[0]._id, '507f1f77bcf86cd799439600');

      const draft = (await backendPostJson(base, key, '/api/document-templates', {
        name: 'Акт приёмки (draft)',
        docTypeId: '507f1f77bcf86cd799439700',
        organizationId: '507f1f77bcf86cd799439022',
        isActive: false,
        isDefault: false,
        notes: '[AI-DRAFT] создан агентом при импорте — доделать в /doc-constructor',
      })) as { isActive: boolean; isDefault: boolean; notes: string };

      assert.equal(draft.isActive, false);
      assert.equal(draft.isDefault, false);
      assert.match(draft.notes, /\[AI-DRAFT\]/);

      assert.ok(calls.some((c) => c.method === 'GET' && c.url.includes('/api/doc-types')));
      assert.ok(
        calls.some((c) =>
          c.method === 'GET' && c.url.includes('/api/document-template-categories'),
        ),
      );
      assert.ok(calls.some((c) => c.method === 'GET' && c.url.includes('/api/document-templates')));
      // draft tool никогда не вызывает set-default
      assert.ok(!calls.some((c) => c.url.includes('set-default')));
      assert.ok(calls.some((c) => c.method === 'POST' && c.url.includes('/api/document-templates')));
    } finally {
      globalThis.fetch = original;
    }
  });
});
