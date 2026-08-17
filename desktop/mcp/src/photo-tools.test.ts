/**
 * TZD-47 — HITL photo upload: propose inspects local file (0 fetch);
 * confirm without userOk does 0 fetch; confirm with userOk posts multipart
 * then optional product bind.
 */

import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import type { McpRuntimeConfig } from './config.js';
import {
  confirmPhotoUpload,
  PHOTO_UPLOAD_MAX_BYTES,
  proposePhotoUpload,
} from './photo-tools.js';

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

const PHOTO_ID = '507f1f77bcf86cd799439011';
const PRODUCT_ID = '507f1f77bcf86cd799439012';
const COUNTERPARTY_ID = '507f1f77bcf86cd799439013';

const cfg: McpRuntimeConfig = {
  apiBaseUrl: 'http://backend.test',
  apiKey: 'pairing-key',
  host: '127.0.0.1',
  port: 9743,
  allowLan: false,
};

let tmpDir = '';
let pngPath = '';
let txtPath = '';
let bigPath = '';

before(async () => {
  tmpDir = await mkdtemp(path.join(os.tmpdir(), 'tzd-47-'));
  pngPath = path.join(tmpDir, 'smoke.png');
  txtPath = path.join(tmpDir, 'notes.txt');
  bigPath = path.join(tmpDir, 'huge.png');
  await writeFile(pngPath, PNG_1X1);
  await writeFile(txtPath, 'not an image');
  await writeFile(bigPath, Buffer.alloc(PHOTO_UPLOAD_MAX_BYTES + 1, 0x41));
});

after(async () => {
  if (tmpDir) await rm(tmpDir, { recursive: true, force: true });
});

describe('MCP photo upload (TZD-47)', () => {
  it('propose inspects file and does not call backend', async () => {
    const originalFetch = globalThis.fetch;
    let calls = 0;
    globalThis.fetch = (async () => {
      calls += 1;
      return new Response('{}', { status: 200 });
    }) as typeof fetch;

    try {
      const response = await proposePhotoUpload({
        filePath: pngPath,
        productId: PRODUCT_ID,
      });
      assert.equal('isError' in response, false);
      const text = response.content[0].text;
      assert.match(text, /draft:photo\.upload:smoke\.png/);
      assert.match(text, /image\/png/);
      assert.equal(calls, 0);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('propose missing file → RU error, 0 fetch', async () => {
    const originalFetch = globalThis.fetch;
    let calls = 0;
    globalThis.fetch = (async () => {
      calls += 1;
      return new Response('{}', { status: 200 });
    }) as typeof fetch;

    try {
      const response = await proposePhotoUpload({
        filePath: path.join(tmpDir, 'missing.png'),
      });
      assert.ok('isError' in response);
      assert.equal(response.isError, true);
      assert.match(response.content[0].text, /Файл не найден/);
      assert.equal(calls, 0);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('propose non-image → RU error', async () => {
    const response = await proposePhotoUpload({ filePath: txtPath });
    assert.ok('isError' in response);
    assert.equal(response.isError, true);
    assert.match(response.content[0].text, /не картинка/);
  });

  it('propose oversize → RU error', async () => {
    const response = await proposePhotoUpload({ filePath: bigPath });
    assert.ok('isError' in response);
    assert.equal(response.isError, true);
    assert.match(response.content[0].text, /больше 10 МБ/);
  });

  it('confirm without userOk → 0 fetch', async () => {
    const originalFetch = globalThis.fetch;
    let calls = 0;
    globalThis.fetch = (async () => {
      calls += 1;
      return new Response('{}', { status: 200 });
    }) as typeof fetch;

    try {
      const response = await confirmPhotoUpload(cfg, {
        filePath: pngPath,
        userOk: false,
      });
      assert.ok('isError' in response);
      assert.equal(response.isError, true);
      assert.match(response.content[0].text, /userOk:true обязателен/);
      assert.equal(calls, 0);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('confirm userOk uploads multipart then binds Product.photoIds', async () => {
    const originalFetch = globalThis.fetch;
    const calls: Array<{ url: string; method: string; isForm: boolean; json?: unknown }> = [];
    globalThis.fetch = (async (input, init) => {
      const url = String(input);
      const body = init?.body;
      const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
      let json: unknown;
      if (!isForm && typeof body === 'string') {
        json = JSON.parse(body);
      }
      calls.push({
        url,
        method: String(init?.method ?? 'GET'),
        isForm,
        json,
      });
      if (url.endsWith('/api/photos/upload')) {
        return new Response(
          JSON.stringify({
            _id: PHOTO_ID,
            storageUrl: '/uploads/smoke.png',
            mimeType: 'image/png',
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        );
      }
      if (url.includes(`/api/products/${PRODUCT_ID}/photos`)) {
        return new Response(
          JSON.stringify({ _id: PRODUCT_ID, photoIds: [PHOTO_ID] }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        );
      }
      return new Response('unexpected', { status: 500 });
    }) as typeof fetch;

    try {
      const response = await confirmPhotoUpload(cfg, {
        filePath: pngPath,
        productId: PRODUCT_ID,
        userOk: true,
      });
      assert.ok(!('isError' in response));
      const payload = JSON.parse(response.content[0].text) as {
        id?: string;
        boundProduct?: boolean;
        productPhotoIds?: string[];
      };
      assert.equal(payload.id, PHOTO_ID);
      assert.equal(payload.boundProduct, true);
      assert.deepEqual(payload.productPhotoIds, [PHOTO_ID]);
      assert.equal(calls.length, 2);
      assert.equal(calls[0].url, 'http://backend.test/api/photos/upload');
      assert.equal(calls[0].method, 'POST');
      assert.equal(calls[0].isForm, true);
      assert.equal(calls[1].url, `http://backend.test/api/products/${PRODUCT_ID}/photos`);
      assert.deepEqual(calls[1].json, { photoId: PHOTO_ID });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('confirm with counterpartyId uploads Photo and skips CP bind', async () => {
    const originalFetch = globalThis.fetch;
    const urls: string[] = [];
    globalThis.fetch = (async (input) => {
      urls.push(String(input));
      return new Response(
        JSON.stringify({ _id: PHOTO_ID, storageUrl: '/uploads/smoke.png' }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    }) as typeof fetch;

    try {
      const response = await confirmPhotoUpload(cfg, {
        filePath: pngPath,
        counterpartyId: COUNTERPARTY_ID,
        userOk: true,
      });
      assert.ok(!('isError' in response));
      assert.match(response.content[0].text, /Привязка к контрагенту пока не поддерживается/);
      assert.equal(urls.length, 1);
      assert.match(urls[0], /\/api\/photos\/upload$/);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
