/**
 * Production MCP read tools (TZD-45) — work-types, production orders, work orders.
 *
 * Только read: маппинг на существующие Nest routes. Write-heavy / Гант /
 * себестоимость — successor после ручного smoke PO. Не invent endpoints.
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { backendGetJson } from './backend.js';
import type { McpRuntimeConfig } from './config.js';
import { TOOL_OUTPUT_SCHEMA, toolFail, toolOk } from './tool-result.js';

export const PRODUCTION_TOOL_NAMES = [
  'kppdf_list_work_types',
  'kppdf_list_production_orders',
  'kppdf_get_production_order',
  'kppdf_list_work_orders',
  'kppdf_get_work_order',
] as const;

const idInput = {
  id: z.string().min(1).describe('ObjectId сущности (например id production order)'),
};

export function registerProductionTools(
  server: McpServer,
  cfg: McpRuntimeConfig,
): void {
  server.registerTool(
    'kppdf_list_work_types',
    {
      outputSchema: TOOL_OUTPUT_SCHEMA,
      title: 'List work types',
      description: 'GET /api/work-types — виды работ производства. Read-only (TZD-45).',
    },
    async () => {
      try {
        const path = '/api/work-types';
        const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
        return toolOk({ ok: true, path, result });
      } catch (err) {
        return toolFail('kppdf_list_work_types', err);
      }
    },
  );

  server.registerTool(
    'kppdf_list_production_orders',
    {
      outputSchema: TOOL_OUTPUT_SCHEMA,
      title: 'List production orders',
      description:
        'GET /api/production-orders — производственные заказы (без фильтров). Read-only (TZD-45).',
    },
    async () => {
      try {
        const path = '/api/production-orders';
        const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
        return toolOk({ ok: true, path, result });
      } catch (err) {
        return toolFail('kppdf_list_production_orders', err);
      }
    },
  );

  server.registerTool(
    'kppdf_get_production_order',
    {
      outputSchema: TOOL_OUTPUT_SCHEMA,
      title: 'Get production order',
      description: 'GET /api/production-orders/:id — один производственный заказ. Read-only (TZD-45).',
      inputSchema: idInput,
    },
    async ({ id }) => {
      try {
        const path = `/api/production-orders/${encodeURIComponent(id)}`;
        const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
        return toolOk({ ok: true, path, result });
      } catch (err) {
        return toolFail('kppdf_get_production_order', err);
      }
    },
  );

  server.registerTool(
    'kppdf_list_work_orders',
    {
      outputSchema: TOOL_OUTPUT_SCHEMA,
      title: 'List work orders',
      description: 'GET /api/work-orders — наряды на работы (без фильтров). Read-only (TZD-45).',
    },
    async () => {
      try {
        const path = '/api/work-orders';
        const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
        return toolOk({ ok: true, path, result });
      } catch (err) {
        return toolFail('kppdf_list_work_orders', err);
      }
    },
  );

  server.registerTool(
    'kppdf_get_work_order',
    {
      outputSchema: TOOL_OUTPUT_SCHEMA,
      title: 'Get work order',
      description: 'GET /api/work-orders/:id — один наряд на работы. Read-only (TZD-45).',
      inputSchema: idInput,
    },
    async ({ id }) => {
      try {
        const path = `/api/work-orders/${encodeURIComponent(id)}`;
        const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
        return toolOk({ ok: true, path, result });
      } catch (err) {
        return toolFail('kppdf_get_work_order', err);
      }
    },
  );
}
