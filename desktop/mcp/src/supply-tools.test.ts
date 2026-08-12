/**
 * TZD-45 — supply read tools (supply tasks / purchase requests / purchase orders).
 * Read-only маппинг на существующие Nest routes; write — successor.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { McpRuntimeConfig } from './config.js';
import { registerSupplyTools, SUPPLY_TOOL_NAMES } from './supply-tools.js';

const cfg: McpRuntimeConfig = {
  apiBaseUrl: 'http://127.0.0.1:3000',
  apiKey: 'test-pairing-key',
  host: '127.0.0.1',
  port: 9743,
  allowLan: false,
};

function fakeServer(): {
  tools: string[];
  registerTool: (name: string) => void;
} {
  const tools: string[] = [];
  return {
    tools,
    registerTool(name: string) {
      tools.push(name);
    },
  };
}

describe('supply tools (TZD-45)', () => {
  it('registers five read tool names', () => {
    assert.deepEqual([...SUPPLY_TOOL_NAMES], [
      'kppdf_list_supply_tasks',
      'kppdf_list_purchase_requests',
      'kppdf_get_purchase_request',
      'kppdf_list_purchase_orders',
      'kppdf_get_purchase_order',
    ]);
  });

  it('registers every tool on the server', () => {
    const server = fakeServer();
    registerSupplyTools(server as never, cfg);
    assert.deepEqual(server.tools, [...SUPPLY_TOOL_NAMES]);
  });
});
