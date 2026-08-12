/**
 * TZD-45 — production read tools (work-types / production orders / work orders).
 * Read-only маппинг на существующие Nest routes; write — successor.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { McpRuntimeConfig } from './config.js';
import { PRODUCTION_TOOL_NAMES, registerProductionTools } from './production-tools.js';

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

describe('production tools (TZD-45)', () => {
  it('registers five read tool names', () => {
    assert.deepEqual([...PRODUCTION_TOOL_NAMES], [
      'kppdf_list_work_types',
      'kppdf_list_production_orders',
      'kppdf_get_production_order',
      'kppdf_list_work_orders',
      'kppdf_get_work_order',
    ]);
  });

  it('registers every tool on the server', () => {
    const server = fakeServer();
    registerProductionTools(
      // registerTool signature only used; the rest is read-only handlers
      server as never,
      cfg,
    );
    assert.deepEqual(server.tools, [...PRODUCTION_TOOL_NAMES]);
  });
});
