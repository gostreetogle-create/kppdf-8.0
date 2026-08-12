/**
 * Supply MCP read tools (TZD-45) — supply tasks, purchase requests, purchase orders.
 *
 * Только read: маппинг на существующие Nest routes. Тендеры / write-heavy HITL —
 * successor после ручного smoke PO. Не invent endpoints.
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { backendGetJson } from './backend.js';
import type { McpRuntimeConfig } from './config.js';
import { withQuery } from './query.js';
import { TOOL_OUTPUT_SCHEMA, toolFail, toolOk } from './tool-result.js';

export const SUPPLY_TOOL_NAMES = [
  'kppdf_list_supply_tasks',
  'kppdf_list_purchase_requests',
  'kppdf_get_purchase_request',
  'kppdf_list_purchase_orders',
  'kppdf_get_purchase_order',
] as const;

const idInput = {
  id: z.string().min(1).describe('ObjectId сущности (например id заявки на закупку)'),
};

export function registerSupplyTools(
  server: McpServer,
  cfg: McpRuntimeConfig,
): void {
  server.registerTool(
    'kppdf_list_supply_tasks',
    {
      outputSchema: TOOL_OUTPUT_SCHEMA,
      title: 'List supply tasks',
      description:
        'GET /api/supply-tasks — задачи снабжения; optional orderId/status. Read-only (TZD-45).',
      inputSchema: {
        orderId: z.string().optional().describe('Filter by order id'),
        status: z.string().optional().describe('Filter by status'),
      },
    },
    async ({ orderId, status }) => {
      try {
        const path = withQuery('/api/supply-tasks', { orderId, status });
        const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
        return toolOk({ ok: true, path, result });
      } catch (err) {
        return toolFail('kppdf_list_supply_tasks', err);
      }
    },
  );

  server.registerTool(
    'kppdf_list_purchase_requests',
    {
      outputSchema: TOOL_OUTPUT_SCHEMA,
      title: 'List purchase requests',
      description:
        'GET /api/purchase-requests — заявки на закупку; optional status. Read-only (TZD-45).',
      inputSchema: {
        status: z.string().optional().describe('Filter by status'),
      },
    },
    async ({ status }) => {
      try {
        const path = withQuery('/api/purchase-requests', { status });
        const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
        return toolOk({ ok: true, path, result });
      } catch (err) {
        return toolFail('kppdf_list_purchase_requests', err);
      }
    },
  );

  server.registerTool(
    'kppdf_get_purchase_request',
    {
      outputSchema: TOOL_OUTPUT_SCHEMA,
      title: 'Get purchase request',
      description: 'GET /api/purchase-requests/:id — одна заявка на закупку. Read-only (TZD-45).',
      inputSchema: idInput,
    },
    async ({ id }) => {
      try {
        const path = `/api/purchase-requests/${encodeURIComponent(id)}`;
        const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
        return toolOk({ ok: true, path, result });
      } catch (err) {
        return toolFail('kppdf_get_purchase_request', err);
      }
    },
  );

  server.registerTool(
    'kppdf_list_purchase_orders',
    {
      outputSchema: TOOL_OUTPUT_SCHEMA,
      title: 'List purchase orders',
      description:
        'GET /api/purchase-orders — заказы поставщику; optional supplierId/status. Read-only (TZD-45).',
      inputSchema: {
        supplierId: z.string().optional().describe('Filter by supplier id'),
        status: z.string().optional().describe('Filter by status'),
      },
    },
    async ({ supplierId, status }) => {
      try {
        const path = withQuery('/api/purchase-orders', { supplierId, status });
        const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
        return toolOk({ ok: true, path, result });
      } catch (err) {
        return toolFail('kppdf_list_purchase_orders', err);
      }
    },
  );

  server.registerTool(
    'kppdf_get_purchase_order',
    {
      outputSchema: TOOL_OUTPUT_SCHEMA,
      title: 'Get purchase order',
      description: 'GET /api/purchase-orders/:id — один заказ поставщику. Read-only (TZD-45).',
      inputSchema: idInput,
    },
    async ({ id }) => {
      try {
        const path = `/api/purchase-orders/${encodeURIComponent(id)}`;
        const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
        return toolOk({ ok: true, path, result });
      } catch (err) {
        return toolFail('kppdf_get_purchase_order', err);
      }
    },
  );
}
