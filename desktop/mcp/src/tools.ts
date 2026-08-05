/**
 * Register MCP tools shared by HTTP and stdio hosts.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { backendGetJson, BackendError } from './backend.js';
import type { McpRuntimeConfig } from './config.js';

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
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  ok: true,
                  path,
                  apiBaseUrl: cfg.apiBaseUrl,
                  result: payload,
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          isError: true,
          content: [{ type: 'text' as const, text: `kppdf_ping failed: ${message}` }],
        };
      }
    },
  );

  return server;
}
