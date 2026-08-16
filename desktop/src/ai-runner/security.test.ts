import assert from 'node:assert/strict';
import test from 'node:test';
import { isAllowedModelUrl } from './security';

test('allows HTTPS huggingface.co and subdomains', () => {
  assert.equal(isAllowedModelUrl('https://huggingface.co/bartowski/Qwen2.5-3B-Instruct-GGUF/resolve/main/Qwen2.5-3B-Instruct-Q4_K_M.gguf'), true);
  assert.equal(isAllowedModelUrl('https://cdn-lfs.huggingface.co/repos/5b/9a/abc'), true);
});

test('rejects non-HTTPS, foreign hosts, and garbage', () => {
  assert.equal(isAllowedModelUrl('http://huggingface.co/foo.gguf'), false);
  assert.equal(isAllowedModelUrl('https://evil.example.com/foo.gguf'), false);
  assert.equal(isAllowedModelUrl('https://huggingface.co.evil.com/foo.gguf'), false);
  assert.equal(isAllowedModelUrl('file:///C:/Windows/notepad.exe'), false);
  assert.equal(isAllowedModelUrl('not a url'), false);
});
