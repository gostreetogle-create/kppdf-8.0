/**
 * Read-only MCP tools — catalog & warehouse GETs (TZD-12).
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { backendGetJson } from './backend.js';
import type { McpRuntimeConfig } from './config.js';
import { withQuery } from './query.js';
import { slimProduct, slimProductList, toolFail, toolOk } from './tool-result.js';

const pageLimitSearch = {
  page: z.number().int().min(1).optional().describe('Page number (default backend)'),
  limit: z.number().int().min(1).max(100).optional().describe('Page size, max 100'),
  search: z.string().optional().describe('Search by name'),
};

export const READ_TOOL_NAMES = [
  'kppdf_list_materials',
  'kppdf_get_material',
  'kppdf_list_products',
  'kppdf_get_product',
  'kppdf_list_storage_items',
  'kppdf_list_warehouses',
] as const;

export function registerReadTools(server: McpServer, cfg: McpRuntimeConfig): void {
  server.registerTool(
    'kppdf_list_materials',
    {
      title: 'List materials',
      description: 'GET /api/materials — paginated materials (org-scoped by JWT). Read-only.',
      inputSchema: pageLimitSearch,
    },
    async ({ page, limit, search }) => {
      try {
        const path = withQuery('/api/materials', { page, limit, search });
        const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
        return toolOk({ ok: true, path, result });
      } catch (err) {
        return toolFail('kppdf_list_materials', err);
      }
    },
  );

  server.registerTool(
    'kppdf_get_material',
    {
      title: 'Get material',
      description: 'GET /api/materials/:id — single material. Read-only.',
      inputSchema: {
        id: z.string().min(1).describe('Material id'),
      },
    },
    async ({ id }) => {
      try {
        const path = `/api/materials/${encodeURIComponent(id)}`;
        const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
        return toolOk({ ok: true, path, result });
      } catch (err) {
        return toolFail('kppdf_get_material', err);
      }
    },
  );

  server.registerTool(
    'kppdf_list_products',
    {
      title: 'List products',
      description: 'GET /api/products — paginated products, minimal fields. Read-only.',
      inputSchema: pageLimitSearch,
    },
    async ({ page, limit, search }) => {
      try {
        const path = withQuery('/api/products', { page, limit, search });
        const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
        return toolOk({ ok: true, path, result: slimProductList(result) });
      } catch (err) {
        return toolFail('kppdf_list_products', err);
      }
    },
  );

  server.registerTool(
    'kppdf_get_product',
    {
      title: 'Get product',
      description: 'GET /api/products/:id — minimal product fields. Read-only.',
      inputSchema: {
        id: z.string().min(1).describe('Product id'),
      },
    },
    async ({ id }) => {
      try {
        const path = `/api/products/${encodeURIComponent(id)}`;
        const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
        return toolOk({ ok: true, path, result: slimProduct(result) });
      } catch (err) {
        return toolFail('kppdf_get_product', err);
      }
    },
  );

  server.registerTool(
    'kppdf_list_storage_items',
    {
      title: 'List storage items',
      description:
        'GET /api/storage-items — stock rows; optional warehouseId filter. Read-only.',
      inputSchema: {
        warehouseId: z.string().optional().describe('Filter by warehouse id'),
        materialId: z.string().optional().describe('Filter by material id'),
        productId: z.string().optional().describe('Filter by product id'),
      },
    },
    async ({ warehouseId, materialId, productId }) => {
      try {
        const path = withQuery('/api/storage-items', {
          warehouseId,
          materialId,
          productId,
        });
        const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
        return toolOk({ ok: true, path, result });
      } catch (err) {
        return toolFail('kppdf_list_storage_items', err);
      }
    },
  );

  server.registerTool(
    'kppdf_list_warehouses',
    {
      title: 'List warehouses',
      description: 'GET /api/warehouses — workshop warehouses. Read-only.',
    },
    async () => {
      try {
        const path = '/api/warehouses';
        const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
        return toolOk({ ok: true, path, result });
      } catch (err) {
        return toolFail('kppdf_list_warehouses', err);
      }
    },
  );
}
