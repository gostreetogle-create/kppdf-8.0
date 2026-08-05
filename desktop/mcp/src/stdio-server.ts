/**
 * Stdio MCP host — for process-spawned clients (optional; TZD-11).
 * Env: KPPDF_API_BASE_URL, KPPDF_API_KEY
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { assertAuthConfigured, loadRuntimeConfig } from './config.js';
import { createKppdfMcpServer } from './tools.js';

async function main(): Promise<void> {
  const cfg = loadRuntimeConfig();
  assertAuthConfigured(cfg);
  const server = createKppdfMcpServer(cfg);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('[kppdf-mcp-stdio] fatal', err);
  process.exit(1);
});
