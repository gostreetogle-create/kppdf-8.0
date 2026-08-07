/**
 * Domain discovery + dry-run tools (TZD-17).
 * Read-only / validate-only — never creates proposals or SoT writes.
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { backendGetJson } from './backend.js';
import type { McpRuntimeConfig } from './config.js';
import {
  DOMAIN_SCHEMA_VERSION,
  getMaterialDomainSchema,
} from './domain-schema.js';
import { withQuery } from './query.js';
import { toolFail, toolOk } from './tool-result.js';
import {
  createBackendValidateDeps,
  slimCategory,
  validateMaterial,
  type CategorySnapshot,
} from './validate-material.js';

export const DOMAIN_TOOL_NAMES = [
  'kppdf_get_domain_schema',
  'kppdf_list_categories',
  'kppdf_validate_material',
] as const;

function paginateCategories(
  items: CategorySnapshot[],
  page: number,
  limit: number,
): { items: CategorySnapshot[]; total: number; page: number; limit: number } {
  const total = items.length;
  const start = (page - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    total,
    page,
    limit,
  };
}

export function registerDomainTools(server: McpServer, cfg: McpRuntimeConfig): void {
  server.registerTool(
    'kppdf_get_domain_schema',
    {
      title: 'Get material domain schema',
      description:
        'Returns static KPPDF material domain rules for agents: required fields (name), ' +
        'MATERIAL_KINDS, recommended units, category/skuPrefix rules. Version tzd-17. ' +
        'Read-only — no SoT write, no proposal. Call before propose/validate.',
      inputSchema: {
        entity: z
          .enum(['material'])
          .optional()
          .describe('Entity schema (only material in TZD-17)'),
      },
    },
    async ({ entity }) => {
      try {
        const resolved = entity ?? 'material';
        if (resolved !== 'material') {
          return toolFail(
            'kppdf_get_domain_schema',
            new Error(`Unsupported entity «${resolved}» — only material in tzd-17.`),
          );
        }
        const schema = getMaterialDomainSchema();
        return toolOk({
          ok: true,
          version: DOMAIN_SCHEMA_VERSION,
          entity: resolved,
          schema,
        });
      } catch (err) {
        return toolFail('kppdf_get_domain_schema', err);
      }
    },
  );

  server.registerTool(
    'kppdf_list_categories',
    {
      title: 'List material categories',
      description:
        'GET /api/categories?type=material — id, name, type, isActive, skuPrefix (null if empty). ' +
        'Use before propose create to pick categoryId / check skuPrefix for auto-SKU. Read-only.',
      inputSchema: {
        page: z.number().int().min(1).optional().describe('Page (client-side; default 1)'),
        limit: z.number().int().min(1).max(100).optional().describe('Page size, max 100'),
        search: z.string().optional().describe('Filter by name substring'),
      },
    },
    async ({ page, limit, search }) => {
      try {
        const path = withQuery('/api/categories', { type: 'material' });
        const raw = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
        const list = Array.isArray(raw) ? raw : [];
        let items: CategorySnapshot[] = [];
        for (const row of list) {
          const slim = slimCategory(row);
          if (slim) items.push(slim);
        }
        // Defense: client-side type filter if API ignored query
        items = items.filter((c) => c.type === 'material');
        if (search?.trim()) {
          const q = search.trim().toLowerCase();
          items = items.filter((c) => c.name.toLowerCase().includes(q));
        }
        const p = page ?? 1;
        const l = limit ?? 50;
        const pageResult = paginateCategories(items, p, l);
        return toolOk({
          ok: true,
          path,
          ...pageResult,
        });
      } catch (err) {
        return toolFail('kppdf_list_categories', err);
      }
    },
  );

  server.registerTool(
    'kppdf_validate_material',
    {
      title: 'Validate material (dry-run)',
      description:
        'Dry-run checks for material.create: empty name, inactive/wrong-type category, ' +
        'missing skuPrefix for auto-SKU, invalid materialKind, possible duplicates. ' +
        'Does NOT create a proposal and does NOT write SoT. Use before propose or inbox audit.',
      inputSchema: {
        name: z.string().optional().describe('Material name (required for ok:true)'),
        unit: z.string().optional().describe('Unit; empty → default шт (info)'),
        article: z.string().optional(),
        sku: z.string().optional(),
        categoryId: z.string().optional(),
        materialKind: z.string().optional().describe('One of MATERIAL_KINDS'),
      },
    },
    async (args) => {
      try {
        const deps = createBackendValidateDeps(
          cfg.apiBaseUrl,
          cfg.apiKey,
          backendGetJson,
        );
        const result = await validateMaterial(args, deps);
        return toolOk({
          ...result,
          note: 'Validate only — no proposal, no SoT write.',
        });
      } catch (err) {
        return toolFail('kppdf_validate_material', err);
      }
    },
  );
}
