import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveProvider, pingProvider, OLLAMA_DEFAULT } from './providers';
import type { AiProviderConfig } from '../config';

test('resolveProvider: remote config carries baseUrl/apiKey/model, isRemote=true', () => {
  const config: AiProviderConfig = { type: 'remote', baseUrl: 'https://api.example.com', apiKey: 'k', model: 'gpt-4o-mini' };
  const resolved = resolveProvider(config);
  assert.deepEqual(resolved, { baseUrl: 'https://api.example.com', apiKey: 'k', model: 'gpt-4o-mini', isRemote: true });
});

test('resolveProvider: local-ollama config falls back to OLLAMA_DEFAULT for empty baseUrl/model, no apiKey', () => {
  const config: AiProviderConfig = { type: 'local-ollama', baseUrl: '', model: '' };
  const resolved = resolveProvider(config);
  assert.equal(resolved.baseUrl, OLLAMA_DEFAULT.baseUrl);
  assert.equal(resolved.model, OLLAMA_DEFAULT.model);
  assert.equal(resolved.isRemote, false);
  assert.equal(resolved.apiKey, undefined);
});

test('pingProvider: remote is optimistically available without a network call', async () => {
  const originalFetch = globalThis.fetch;
  let called = false;
  // @ts-expect-error test double
  globalThis.fetch = async () => {
    called = true;
    throw new Error('should not be called for remote');
  };
  try {
    const ok = await pingProvider({ type: 'remote', baseUrl: 'https://api.example.com', model: 'gpt-4o-mini' });
    assert.equal(ok, true);
    assert.equal(called, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('pingProvider: local-ollama hits GET {baseUrl}/api/tags and reports true on 200', async () => {
  const originalFetch = globalThis.fetch;
  let requestedUrl = '';
  // @ts-expect-error test double
  globalThis.fetch = async (url: string) => {
    requestedUrl = url;
    return { ok: true } as Response;
  };
  try {
    const ok = await pingProvider({ type: 'local-ollama', baseUrl: 'http://localhost:11434', model: 'qwen2.5:7b' });
    assert.equal(ok, true);
    assert.equal(requestedUrl, 'http://localhost:11434/api/tags');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('pingProvider: local-ollama reports false when the request throws (server not running)', async () => {
  const originalFetch = globalThis.fetch;
  // @ts-expect-error test double
  globalThis.fetch = async () => {
    throw new Error('connection refused');
  };
  try {
    const ok = await pingProvider({ type: 'local-ollama', baseUrl: 'http://localhost:11434', model: 'qwen2.5:7b' });
    assert.equal(ok, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('pingProvider: local-ollama reports false on a non-2xx response, not just on network errors', async () => {
  const originalFetch = globalThis.fetch;
  // @ts-expect-error test double
  globalThis.fetch = async () => ({ ok: false } as Response);
  try {
    const ok = await pingProvider({ type: 'local-ollama', baseUrl: 'http://localhost:11434', model: 'qwen2.5:7b' });
    assert.equal(ok, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('pingProvider: strips a trailing slash from baseUrl before appending /api/tags', async () => {
  const originalFetch = globalThis.fetch;
  let requestedUrl = '';
  // @ts-expect-error test double
  globalThis.fetch = async (url: string) => {
    requestedUrl = url;
    return { ok: true } as Response;
  };
  try {
    await pingProvider({ type: 'local-ollama', baseUrl: 'http://localhost:11434/', model: 'qwen2.5:7b' });
    assert.equal(requestedUrl, 'http://localhost:11434/api/tags');
  } finally {
    globalThis.fetch = originalFetch;
  }
});
