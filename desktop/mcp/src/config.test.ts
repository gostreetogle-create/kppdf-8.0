import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { extractBearer, isAuthorized, type McpRuntimeConfig } from './config.js';

describe('MCP auth helpers', () => {
  const cfg: McpRuntimeConfig = {
    apiBaseUrl: 'http://127.0.0.1:3000',
    apiKey: 'secret-token',
    host: '127.0.0.1',
    port: 9743,
    allowLan: false,
  };

  it('extractBearer parses Authorization header', () => {
    assert.equal(extractBearer('Bearer secret-token'), 'secret-token');
    assert.equal(extractBearer('bearer secret-token'), 'secret-token');
    assert.equal(extractBearer(undefined), null);
    assert.equal(extractBearer('Basic x'), null);
  });

  it('isAuthorized fail-closed without matching token', () => {
    assert.equal(isAuthorized(cfg, undefined), false);
    assert.equal(isAuthorized(cfg, 'Bearer wrong'), false);
    assert.equal(isAuthorized(cfg, 'Bearer secret-token'), true);
  });
});
