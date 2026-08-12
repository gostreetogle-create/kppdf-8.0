/**
 * Register MCP tools shared by HTTP and stdio hosts.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { backendGetJson, BackendError } from './backend.js';
import type { McpRuntimeConfig } from './config.js';
import {
  COMMERCIAL_TOOL_NAMES,
  registerCommercialTools,
} from './commercial-tools.js';
import {
  DOC_TOOL_NAMES,
  registerDocTools,
} from './doc-tools.js';
import {
  DOMAIN_TOOL_NAMES,
  registerDomainTools,
} from './domain-tools.js';
import {
  IMPORT_TASK_TOOL_NAMES,
  registerImportTaskTools,
} from './import-task-tools.js';
import {
  IMPORT_TODO_TOOL_NAMES,
  registerImportTodoTools,
} from './import-todo-tools.js';
import {
  registerTextBlockTools,
  TEXT_BLOCK_TOOL_NAMES,
} from './text-block-tools.js';
import {
  INBOX_TOOL_NAMES,
  registerInboxTools,
} from './inbox-tools.js';
import {
  GRAPH_TOOL_NAMES,
  READ_TOOL_NAMES,
  registerReadTools,
} from './read-tools.js';
import { registerStockTools, STOCK_TOOL_NAMES } from './stock-tools.js';
import { registerWriteTools, WRITE_TOOL_NAMES } from './write-tools.js';
import { TOOL_OUTPUT_SCHEMA, toolFail, toolOk } from './tool-result.js';

/**
 * Полный реестр имён tools: единственный источник для /healthz toolCount,
 * toolsSample и smoke-теста. Собирается из экспортированных в каждом
 * register-файле списков (без ручного дублирования имён в tools.ts).
 */
export function listRegisteredToolNames(): readonly string[] {
  return [
    'kppdf_ping',
    ...READ_TOOL_NAMES,
    ...GRAPH_TOOL_NAMES,
    ...WRITE_TOOL_NAMES,
    ...DOMAIN_TOOL_NAMES,
    ...INBOX_TOOL_NAMES,
    ...IMPORT_TASK_TOOL_NAMES,
    ...IMPORT_TODO_TOOL_NAMES,
    ...TEXT_BLOCK_TOOL_NAMES,
    ...DOC_TOOL_NAMES,
    ...COMMERCIAL_TOOL_NAMES,
    ...STOCK_TOOL_NAMES,
  ];
}

/**
 * Sample имён для /healthz: сначала ключевые инструменты (если реально
 * зарегистрированы в реестре), затем остальные — без дублей, не длиннее limit.
 */
export function toolsSample(
  names: readonly string[],
  limit = 10,
  mustInclude: readonly string[] = [],
): string[] {
  const present = new Set(names);
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (name: string): void => {
    if (seen.has(name)) return;
    seen.add(name);
    out.push(name);
  };
  for (const name of mustInclude) {
    if (present.has(name)) push(name);
  }
  for (const name of names) push(name);
  return out.slice(0, limit);
}

/** Поля /healthz MCP host (TZD-31): единый payload для http-server и теста. */
export interface McpHealthzPayload {
  ok: boolean;
  service: string;
  port: number;
  toolCount: number;
  packageVersion: string;
  hostDir: string;
  toolsSample: string[];
}

export function buildHealthzPayload(opts: {
  port: number;
  packageVersion: string;
  hostDir: string;
}): McpHealthzPayload {
  const names = listRegisteredToolNames();
  return {
    ok: true,
    service: 'kppdf-desktop-mcp',
    port: opts.port,
    toolCount: names.length,
    packageVersion: opts.packageVersion,
    hostDir: opts.hostDir,
    toolsSample: toolsSample(names, 10, [
      'kppdf_list_categories',
      'kppdf_propose_product_create',
    ]),
  };
}

export function createKppdfMcpServer(cfg: McpRuntimeConfig): McpServer {
  const server = new McpServer({
    name: 'kppdf-desktop',
    version: '0.1.0',
  });

  server.registerTool(
    'kppdf_ping',
    {
      outputSchema: TOOL_OUTPUT_SCHEMA,
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
  registerCommercialTools(server, cfg);
  registerStockTools(server, cfg);
  registerInboxTools(server, cfg);
  registerImportTaskTools(server, cfg);
  registerImportTodoTools(server, cfg);
  registerTextBlockTools(server, cfg);
  registerDocTools(server, cfg);

  return server;
}
