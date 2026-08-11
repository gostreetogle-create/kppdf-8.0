import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { McpRuntimeConfig } from './config.js';
import {
  createTextBlockCategory,
  createTextBlockDraft,
  listTextBlockCategories,
  listTextBlocks,
  TEXT_BLOCK_TOOL_NAMES,
} from './text-block-tools.js';

const cfg: McpRuntimeConfig = {
  apiBaseUrl: 'http://127.0.0.1:3000',
  apiKey: 'test-jwt',
  host: '127.0.0.1',
  port: 9743,
  allowLan: false,
};

function installFetch(
  handler: (url: string, method: string, body: Record<string, unknown> | undefined) => Response,
): () => void {
  const original = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const body = init?.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : undefined;
    return handler(String(input), (init?.method ?? 'GET').toUpperCase(), body);
  }) as typeof fetch;
  return () => {
    globalThis.fetch = original;
  };
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('text-block tools (TZD-30)', () => {
  it('registers canonical kppdf_list_* names + deprecated aliases (TZD-41)', () => {
    assert.deepEqual([...TEXT_BLOCK_TOOL_NAMES], [
      'kppdf_list_text_block_categories',
      'kppdf_text_block_categories_list',
      'kppdf_list_text_blocks',
      'kppdf_text_blocks_list',
      'kppdf_text_block_category_create',
      'kppdf_text_block_create_draft',
    ]);
  });

  it('lists active categories and blocks with explicit category filters', async () => {
    const calls: string[] = [];
    const restore = installFetch((url, method) => {
      calls.push(`${method} ${url}`);
      return url.includes('/api/text-block-categories')
        ? json([{ _id: 'cat-1', name: 'Гарантии' }])
        : json([{ _id: 'block-1', name: 'Existing' }]);
    });

    try {
      const categories = (await listTextBlockCategories(cfg)) as Array<{ name: string }>;
      const blocks = (await listTextBlocks(cfg, 'cat-1', false)) as Array<{ name: string }>;
      assert.equal(categories[0].name, 'Гарантии');
      assert.equal(blocks[0].name, 'Existing');
      assert.ok(calls.some((call) => call.includes('/api/text-block-categories?activeOnly=true')));
      assert.ok(calls.some((call) => call.includes('/api/text-blocks?categoryId=cat-1&isActive=false')));
    } finally {
      restore();
    }
  });

  it('creates a category and an inactive AI draft plus manager todo', async () => {
    const calls: Array<{ method: string; url: string; body?: Record<string, unknown> }> = [];
    const restore = installFetch((url, method, body) => {
      calls.push({ method, url, body });
      if (method === 'GET' && url.includes('/api/text-blocks')) return json({ items: [] });
      if (method === 'POST' && url.includes('/api/text-block-categories')) {
        return json({ _id: 'cat-1', name: 'Гарантии', slug: 'garantii' }, 201);
      }
      if (method === 'POST' && url.endsWith('/api/text-blocks')) {
        return json({ _id: 'block-1', name: body?.name, isActive: body?.isActive }, 201);
      }
      if (method === 'POST' && url.includes('/api/import-todos')) {
        return json({ id: 'todo-1', href: body?.href }, 201);
      }
      return json({ ok: true });
    });

    try {
      const category = await createTextBlockCategory(cfg, { name: 'Гарантии', slug: 'garantii' });
      const draft = await createTextBlockDraft(cfg, {
        name: 'Срок изготовления',
        categoryId: 'cat-1',
        content: '<p>Готовый текст из источника агента.</p>',
        tags: ['sales-copy'],
      });
      assert.equal((category as { _id: string })._id, 'cat-1');
      assert.deepEqual(draft, { textBlockId: 'block-1', todoId: 'todo-1' });

      const blockCall = calls.find((call) => call.method === 'POST' && call.url.endsWith('/api/text-blocks'));
      assert.ok(blockCall);
      assert.equal(blockCall.body?.name, 'Черновик ИИ — Срок изготовления');
      assert.equal(blockCall.body?.isActive, false);
      assert.deepEqual(blockCall.body?.tags, ['sales-copy', 'ai-draft']);
      assert.equal('notes' in (blockCall.body ?? {}), false);

      const todoCall = calls.find((call) => call.method === 'POST' && call.url.includes('/api/import-todos'));
      assert.ok(todoCall);
      assert.equal(todoCall.body?.href, '/doc-constructor/texts?editId=block-1');
      assert.match(String(todoCall.body?.body), /включить «Активен»/);
    } finally {
      restore();
    }
  });

  it('returns todoError without hiding a successfully created draft', async () => {
    const restore = installFetch((url, method) => {
      if (method === 'GET' && url.includes('/api/text-blocks')) return json([]);
      if (method === 'POST' && url.endsWith('/api/text-blocks')) {
        return json({ _id: 'block-2' }, 201);
      }
      return json({ message: 'todo service unavailable' }, 503);
    });

    try {
      const result = await createTextBlockDraft(cfg, {
        name: 'Срок оплаты',
        categoryId: 'cat-1',
        content: 'ready',
      });
      assert.equal(result.textBlockId, 'block-2');
      assert.match(result.todoError ?? '', /Backend POST \/api\/import-todos → 503/);
      assert.equal(result.todoId, undefined);
    } finally {
      restore();
    }
  });

  it('does not duplicate a same-name draft in the category', async () => {
    let postCount = 0;
    const restore = installFetch((url, method) => {
      if (method === 'POST') postCount += 1;
      return url.includes('/api/text-blocks')
        ? json({ items: [{ _id: 'old', name: 'Черновик ИИ — Срок изготовления' }] })
        : json({ ok: true });
    });

    try {
      await assert.rejects(
        createTextBlockDraft(cfg, {
          name: 'Срок изготовления',
          categoryId: 'cat-1',
          content: 'ready',
        }),
        /уже существует.*overwrite не выполняется/,
      );
      assert.equal(postCount, 0);
    } finally {
      restore();
    }
  });

  it('turns category slug 409 into a clear no-overwrite error', async () => {
    const restore = installFetch((_url, method) =>
      method === 'POST' ? json({ message: 'duplicate slug' }, 409) : json({}),
    );
    try {
      await assert.rejects(
        createTextBlockCategory(cfg, { name: 'Гарантии', slug: 'garantii' }),
        /409.*overwrite не выполняется/,
      );
    } finally {
      restore();
    }
  });

  it('requires categoryId and content or columns', async () => {
    await assert.rejects(
      createTextBlockDraft(cfg, { name: 'Без полки', categoryId: '', content: 'ready' }),
      /categoryId обязателен/,
    );
    await assert.rejects(
      createTextBlockDraft(cfg, { name: 'Без текста', categoryId: 'cat-1' }),
      /Нужен content или непустой columns/,
    );
  });
});
