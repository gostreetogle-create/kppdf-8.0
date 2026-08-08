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
  'kppdf_list_modules',
  'kppdf_list_storage_items',
  'kppdf_list_warehouses',
] as const;

/** TZD-19 — graph (BOM / where_used) read tools + integrity suite. */
export const GRAPH_TOOL_NAMES = [
  'kppdf_get_product_composition',
  'kppdf_get_product_where_used',
  'kppdf_get_material_where_used',
  'kppdf_get_module_composition',
  'kppdf_get_module_where_used',
  'kppdf_run_integrity_suite',
] as const;

// ── TZD-19 integrity suite (deps-injected for tests; read-only) ──────────────

export interface GraphSampleProvider {
  listProducts(limit: number): Promise<Array<{ _id?: string }>>;
  listMaterials(limit: number): Promise<Array<{ _id?: string }>>;
  listModules(limit: number): Promise<Array<{ _id?: string }>>;
  getProductComposition(id: string): Promise<unknown>;
  getProductWhereUsed(id: string): Promise<unknown>;
  getMaterialWhereUsed(id: string): Promise<unknown>;
  getModuleComposition(id: string): Promise<unknown>;
  getModuleWhereUsed(id: string): Promise<unknown>;
}

export interface IntegrityCheck {
  name: string;
  ok: boolean;
  detail?: string;
}

export interface IntegritySuiteResult {
  ok: boolean;
  checks: IntegrityCheck[];
  warnings: string[];
}

export interface GraphNode {
  _id?: string;
  id?: string;
}

function nodeId(node: GraphNode | undefined): string | undefined {
  return node?._id ?? node?.id;
}

async function smoke(
  deps: GraphSampleProvider,
  name: string,
  fn: () => Promise<unknown>,
): Promise<IntegrityCheck> {
  try {
    const data = await fn();
    return { name, ok: true, detail: 'ok' };
  } catch (err) {
    return {
      name,
      ok: false,
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * TZD-19 — read-only smoke: composition/where_used на sample ids из list.
 * НЕ пишет SoT, НЕ сбрасывает ничего (не sandbox_reset).
 */
export async function runIntegritySuite(
  deps: GraphSampleProvider,
  opts: { sample?: number } = {},
): Promise<IntegritySuiteResult> {
  const sample = Math.min(10, Math.max(1, opts.sample ?? 3));
  const warnings: string[] = [];
  const checks: IntegrityCheck[] = [];

  const [products, materials, modules] = await Promise.all([
    deps.listProducts(sample),
    deps.listMaterials(sample),
    deps.listModules(sample),
  ]);

  const productIds = products.map(nodeId).filter(Boolean) as string[];
  const materialIds = materials.map(nodeId).filter(Boolean) as string[];
  const moduleIds = modules.map(nodeId).filter(Boolean) as string[];

  if (!productIds.length) warnings.push('No products to smoke — graph check for products skipped');
  if (!materialIds.length) warnings.push('No materials to smoke — graph check for materials skipped');
  if (!moduleIds.length) warnings.push('No modules to smoke — graph check for modules skipped');

  for (const id of productIds) {
    checks.push(await smoke(deps, `product.composition:${id}`, () => deps.getProductComposition(id)));
    checks.push(await smoke(deps, `product.where_used:${id}`, () => deps.getProductWhereUsed(id)));
  }
  for (const id of materialIds) {
    checks.push(await smoke(deps, `material.where_used:${id}`, () => deps.getMaterialWhereUsed(id)));
  }
  for (const id of moduleIds) {
    checks.push(await smoke(deps, `module.composition:${id}`, () => deps.getModuleComposition(id)));
    checks.push(await smoke(deps, `module.where_used:${id}`, () => deps.getModuleWhereUsed(id)));
  }

  const failed = checks.filter((c) => !c.ok);
  if (failed.length > 0) {
    warnings.push(`${failed.length} graph check(s) failed — где именно: ${failed.map((f) => f.name).join(', ')}`);
  }

  return {
    ok: failed.length === 0,
    checks,
    warnings,
  };
}

function unwrapItems(raw: unknown): GraphNode[] {
  if (Array.isArray(raw)) return raw as GraphNode[];
  if (raw && typeof raw === 'object') {
    const env = raw as { items?: unknown };
    if (Array.isArray(env.items)) return env.items as GraphNode[];
  }
  return [];
}

export function createGraphBackendDeps(cfg: McpRuntimeConfig): GraphSampleProvider {
  return {
    listProducts: async (limit) =>
      unwrapItems(
        await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, `/api/products?limit=${limit}`),
      ),
    listMaterials: async (limit) =>
      unwrapItems(
        await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, `/api/materials?limit=${limit}`),
      ),
    listModules: async (limit) =>
      unwrapItems(
        await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, `/api/modules?limit=${limit}`),
      ),
    getProductComposition: async (id) =>
      backendGetJson(cfg.apiBaseUrl, cfg.apiKey, `/api/products/${encodeURIComponent(id)}/composition`),
    getProductWhereUsed: async (id) =>
      backendGetJson(cfg.apiBaseUrl, cfg.apiKey, `/api/products/${encodeURIComponent(id)}/where-used`),
    getMaterialWhereUsed: async (id) =>
      backendGetJson(cfg.apiBaseUrl, cfg.apiKey, `/api/materials/${encodeURIComponent(id)}/where-used`),
    getModuleComposition: async (id) =>
      backendGetJson(cfg.apiBaseUrl, cfg.apiKey, `/api/modules/${encodeURIComponent(id)}/composition`),
    getModuleWhereUsed: async (id) =>
      backendGetJson(cfg.apiBaseUrl, cfg.apiKey, `/api/modules/${encodeURIComponent(id)}/where-used`),
  };
}

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
    'kppdf_list_modules',
    {
      title: 'List modules',
      description: 'GET /api/modules — paginated modules (slim). Read-only. Supporting tool for graph (TZD-19).',
      inputSchema: pageLimitSearch,
    },
    async ({ page, limit, search }) => {
      try {
        const path = withQuery('/api/modules', { page, limit, search });
        const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
        return toolOk({ ok: true, path, result });
      } catch (err) {
        return toolFail('kppdf_list_modules', err);
      }
    },
  );

  server.registerTool(
    'kppdf_get_product_composition',
    {
      title: 'Get product composition (BOM)',
      description:
        'TZD-19: GET /api/products/:id/composition — product BOM tree. ' +
        'Read-only. Check BEFORE product.update proposals to avoid breaking the catalog.',
      inputSchema: {
        id: z.string().min(1).describe('Product id'),
      },
    },
    async ({ id }) => {
      try {
        const path = `/api/products/${encodeURIComponent(id)}/composition`;
        const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
        return toolOk({ ok: true, path, result });
      } catch (err) {
        return toolFail('kppdf_get_product_composition', err);
      }
    },
  );

  server.registerTool(
    'kppdf_get_product_where_used',
    {
      title: 'Get product where-used',
      description:
        'TZD-19: GET /api/products/:id/where-used — which parents include this product. Read-only.',
      inputSchema: {
        id: z.string().min(1).describe('Product id'),
      },
    },
    async ({ id }) => {
      try {
        const path = `/api/products/${encodeURIComponent(id)}/where-used`;
        const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
        return toolOk({ ok: true, path, result });
      } catch (err) {
        return toolFail('kppdf_get_product_where_used', err);
      }
    },
  );

  server.registerTool(
    'kppdf_get_material_where_used',
    {
      title: 'Get material where-used',
      description:
        'TZD-19: GET /api/materials/:id/where-used — modules/products that use this material. ' +
        'Read-only. Check BEFORE mass material.update proposals.',
      inputSchema: {
        id: z.string().min(1).describe('Material id'),
      },
    },
    async ({ id }) => {
      try {
        const path = `/api/materials/${encodeURIComponent(id)}/where-used`;
        const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
        return toolOk({ ok: true, path, result });
      } catch (err) {
        return toolFail('kppdf_get_material_where_used', err);
      }
    },
  );

  server.registerTool(
    'kppdf_get_module_composition',
    {
      title: 'Get module composition (BOM)',
      description:
        'TZD-19: GET /api/modules/:id/composition — module BOM (materials + child modules). Read-only.',
      inputSchema: {
        id: z.string().min(1).describe('Module id'),
      },
    },
    async ({ id }) => {
      try {
        const path = `/api/modules/${encodeURIComponent(id)}/composition`;
        const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
        return toolOk({ ok: true, path, result });
      } catch (err) {
        return toolFail('kppdf_get_module_composition', err);
      }
    },
  );

  server.registerTool(
    'kppdf_get_module_where_used',
    {
      title: 'Get module where-used',
      description:
        'TZD-19: GET /api/modules/:id/where-used — parents that include this module. Read-only.',
      inputSchema: {
        id: z.string().min(1).describe('Module id'),
      },
    },
    async ({ id }) => {
      try {
        const path = `/api/modules/${encodeURIComponent(id)}/where-used`;
        const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
        return toolOk({ ok: true, path, result });
      } catch (err) {
        return toolFail('kppdf_get_module_where_used', err);
      }
    },
  );

  server.registerTool(
    'kppdf_run_integrity_suite',
    {
      title: 'Run graph integrity suite (read-only)',
      description:
        'TZD-19: smoke composition/where_used on sample ids from products/materials/modules. ' +
        'Returns { ok, checks[], warnings[] }. NEVER writes SoT and never resets anything.',
      inputSchema: {
        sample: z
          .number()
          .int()
          .min(1)
          .max(10)
          .optional()
          .describe('How many ids per entity to smoke (default 3)'),
      },
    },
    async ({ sample }) => {
      try {
        const result = await runIntegritySuite(createGraphBackendDeps(cfg), { sample });
        return toolOk(result);
      } catch (err) {
        return toolFail('kppdf_run_integrity_suite', err);
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
