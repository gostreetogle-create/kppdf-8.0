/**
 * Register MCP tools shared by HTTP and stdio hosts.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { backendGetJson, BackendError } from './backend.js';
import type { McpRuntimeConfig } from './config.js';
import { registerDomainTools } from './domain-tools.js';
import { registerInboxTools } from './inbox-tools.js';
import { registerReadTools } from './read-tools.js';
import { registerWriteTools } from './write-tools.js';
import { toolFail, toolOk } from './tool-result.js';

export function createKppdfMcpServer(cfg: McpRuntimeConfig): McpServer {
  const server = new McpServer({
    name: 'kppdf-desktop',
    version: '0.1.0',
  });

  server.registerTool(
    'kppdf_ping',
    {
      title: 'Ping KPPDF backend',
      description:
        'Checks pairing JWT against GET /api/auth/me (fallback /api/health). Read-only.',
    },
    async () => {
      try {
        let payload: unknown;
        let path = '/api/auth/me';
        try {
          payload = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
        } catch (err) {
          if (err instanceof BackendError && (err.status === 404 || err.status === 401)) {
            path = '/api/health';
            payload = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
          } else {
            throw err;
          }
        }
        return toolOk({
          ok: true,
          path,
          apiBaseUrl: cfg.apiBaseUrl,
          result: payload,
        });
      } catch (err) {
        return toolFail('kppdf_ping', err);
      }
    },
  );

  registerReadTools(server, cfg);
  registerWriteTools(server, cfg);
  registerDomainTools(server, cfg);
  registerInboxTools(server, cfg);

  return server;
}
