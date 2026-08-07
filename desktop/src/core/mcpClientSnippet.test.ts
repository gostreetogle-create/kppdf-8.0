import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildMcpClientSnippet } from './mcpClientSnippet.ts';

describe('buildMcpClientSnippet', () => {
  const apiKey = 'test-jwt-abc123';
  const port = 9743;

  it('full mode: valid mcp.json with url, Bearer, /mcp path', () => {
    const text = buildMcpClientSnippet({ port, apiKey, mode: 'full' });
    const parsed = JSON.parse(text) as {
      mcpServers: { kppdf: { url: string; headers: { Authorization: string } } };
    };
    assert.equal(parsed.mcpServers.kppdf.url, 'http://127.0.0.1:9743/mcp');
    assert.equal(parsed.mcpServers.kppdf.headers.Authorization, `Bearer ${apiKey}`);
    assert.match(parsed.mcpServers.kppdf.url, /\/mcp$/);
  });

  it('fragment mode: key entry without mcpServers wrapper', () => {
    const text = buildMcpClientSnippet({ port, apiKey, mode: 'fragment' });
    assert.equal(text.includes('"mcpServers"'), false);
    assert.match(text, /^"kppdf":\s*\{/);
    assert.equal(text.trimEnd().endsWith(','), false);
    const objectPart = text.replace(/^"kppdf":\s*/, '');
    const entry = JSON.parse(objectPart) as {
      url: string;
      headers: { Authorization: string };
    };
    assert.equal(entry.url, 'http://127.0.0.1:9743/mcp');
    assert.equal(entry.headers.Authorization, `Bearer ${apiKey}`);
  });

  it('substitutes custom port and serverKey', () => {
    const text = buildMcpClientSnippet({
      port: 9810,
      apiKey: 'tok',
      serverKey: 'kppdf-local',
      mode: 'full',
    });
    const parsed = JSON.parse(text) as {
      mcpServers: Record<string, { url: string }>;
    };
    assert.equal(parsed.mcpServers['kppdf-local'].url, 'http://127.0.0.1:9810/mcp');
  });

  it('headers stay ASCII (no Cyrillic)', () => {
    const text = buildMcpClientSnippet({ port, apiKey, mode: 'full' });
    const authLine = text.split('\n').find((l) => l.includes('Authorization'));
    assert.ok(authLine);
    assert.equal(/[а-яА-ЯёЁ]/.test(authLine!), false);
  });
});
