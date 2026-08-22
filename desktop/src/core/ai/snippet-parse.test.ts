import assert from 'node:assert/strict';
import test from 'node:test';
import { isEmptySnippetResult, parseApiSnippet } from './snippet-parse';

const TOKENROUTER_PYTHON = `
from openai import OpenAI

client = OpenAI(
    base_url="https://api.tokenrouter.com/v1",
    api_key="sk-test",
)

response = client.chat.completions.create(
    model="qwen/qwen3.8-max-free",
    messages=[{"role": "user", "content": "Hello"}],
)
`;

test('parseApiSnippet разбирает пример TokenRouter (Python SDK)', () => {
  const parsed = parseApiSnippet(TOKENROUTER_PYTHON);
  assert.equal(parsed.baseUrl, 'https://api.tokenrouter.com/v1');
  assert.equal(parsed.apiKey, 'sk-test');
  assert.equal(parsed.model, 'qwen/qwen3.8-max-free');
});

test('parseApiSnippet разбирает JSON-фрагмент', () => {
  const json = `{
    "base_url": "https://api.tokenrouter.com/v1",
    "api_key": "sk-test",
    "model": "qwen/qwen3.8-max-free"
  }`;
  const parsed = parseApiSnippet(json);
  assert.equal(parsed.baseUrl, 'https://api.tokenrouter.com/v1');
  assert.equal(parsed.apiKey, 'sk-test');
  assert.equal(parsed.model, 'qwen/qwen3.8-max-free');
});

test('parseApiSnippet разбирает curl-пример через URL + Bearer + JSON body', () => {
  const curl = [
    'curl https://api.tokenrouter.com/v1/chat/completions \\',
    '  -H "Authorization: Bearer sk-test" \\',
    '  -H "Content-Type: application/json" \\',
    '  -d \'{"model": "qwen/qwen3.8-max-free", "messages": [{"role": "user", "content": "hi"}]}\'',
  ].join('\n');
  const parsed = parseApiSnippet(curl);
  // URL нет как base_url= — берём из самого curl-запроса, отрезав /chat/completions.
  assert.equal(parsed.baseUrl, 'https://api.tokenrouter.com/v1');
  assert.equal(parsed.apiKey, 'sk-test');
  assert.equal(parsed.model, 'qwen/qwen3.8-max-free');
});

test('parseApiSnippet не исполняет код — сработает и на явно вредоносном тексте', () => {
  const hostile = `base_url="https://api.tokenrouter.com/v1"; require('child_process').exec('echo pwned')`;
  const parsed = parseApiSnippet(hostile);
  assert.equal(parsed.baseUrl, 'https://api.tokenrouter.com/v1');
});

test('parseApiSnippet возвращает пусто на нераспознанном тексте', () => {
  const parsed = parseApiSnippet('просто какой-то текст без полей');
  assert.equal(isEmptySnippetResult(parsed), true);
});

test('isEmptySnippetResult false, если найдено хотя бы одно поле', () => {
  assert.equal(isEmptySnippetResult({ model: 'x' }), false);
  assert.equal(isEmptySnippetResult({}), true);
});
