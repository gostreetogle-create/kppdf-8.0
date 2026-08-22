import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeChatCompletionsUrl } from './chat-url';

test('normalizeChatCompletionsUrl добавляет /v1/chat/completions, когда baseUrl без /v1', () => {
  assert.equal(
    normalizeChatCompletionsUrl('https://api.tokenrouter.com'),
    'https://api.tokenrouter.com/v1/chat/completions',
  );
});

test('normalizeChatCompletionsUrl не дублирует /v1, когда baseUrl уже с /v1', () => {
  assert.equal(
    normalizeChatCompletionsUrl('https://api.tokenrouter.com/v1'),
    'https://api.tokenrouter.com/v1/chat/completions',
  );
});

test('normalizeChatCompletionsUrl оставляет как есть, если уже полный путь', () => {
  assert.equal(
    normalizeChatCompletionsUrl('https://api.tokenrouter.com/v1/chat/completions'),
    'https://api.tokenrouter.com/v1/chat/completions',
  );
});

test('normalizeChatCompletionsUrl никогда не строит двойной /v1/v1/', () => {
  const cases = [
    'https://api.tokenrouter.com',
    'https://api.tokenrouter.com/',
    'https://api.tokenrouter.com/v1',
    'https://api.tokenrouter.com/v1/',
    'https://api.tokenrouter.com/v1/chat/completions',
    'http://localhost:11434',
  ];
  for (const baseUrl of cases) {
    const url = normalizeChatCompletionsUrl(baseUrl);
    assert.equal(url.includes('/v1/v1/'), false, `unexpected double /v1 for ${baseUrl} -> ${url}`);
  }
});

test('normalizeChatCompletionsUrl обрезает хвостовые слэши', () => {
  assert.equal(
    normalizeChatCompletionsUrl('https://api.tokenrouter.com/v1/'),
    'https://api.tokenrouter.com/v1/chat/completions',
  );
  assert.equal(
    normalizeChatCompletionsUrl('http://localhost:11434/'),
    'http://localhost:11434/v1/chat/completions',
  );
});
