/**
 * Write protocol MCP tools — propose / confirm / undo (TZD-13).
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { backendGetJson, backendPostJson } from './backend.js';
import type { McpRuntimeConfig } from './config.js';
import { toolFail, toolOk } from './tool-result.js';

export const WRITE_TOOL_NAMES = [
  'kppdf_propose_material_create',
  'kppdf_propose_material_update',
  'kppdf_confirm_proposal',
  'kppdf_cancel_proposal',
  'kppdf_undo_mutation',
  'kppdf_list_mutations',
  'kppdf_propose_material_batch',
  'kppdf_confirm_batch',
  'kppdf_cancel_batch',
  'kppdf_propose_product_create',
  'kppdf_propose_product_update',
] as const;

const PRODUCT_KINDS_ENUM = z.enum(['good', 'service', 'work']);

const batchItemSchema = z.object({
  name: z.string().min(1).describe('Material name'),
  unit: z.string().optional().describe('Unit (default шт)'),
  article: z.string().optional(),
  sku: z.string().optional(),
  categoryId: z.string().optional(),
});

export function registerWriteTools(server: McpServer, cfg: McpRuntimeConfig): void {
  server.registerTool(
    'kppdf_propose_material_create',
    {
      title: 'Propose material create',
      description:
        'Creates a proposal only (no SoT write). Confirm with kppdf_confirm_proposal.',
      inputSchema: {
        name: z.string().min(1).describe('Material name'),
        unit: z
          .string()
          .optional()
          .describe('Unit of measure (default шт — pieces)'),
        article: z.string().optional(),
        sku: z.string().optional(),
        categoryId: z.string().optional(),
      },
    },
    async (args) => {
      try {
        const result = await backendPostJson(
          cfg.apiBaseUrl,
          cfg.apiKey,
          '/api/mutation-journal/proposals',
          {
            kind: 'material.create',
            toolName: 'kppdf_propose_material_create',
            create: {
              name: args.name,
              unit: args.unit?.trim() || 'шт',
              article: args.article,
              sku: args.sku,
              categoryId: args.categoryId,
            },
          },
        );
        return toolOk({ ok: true, proposal: result });
      } catch (err) {
        return toolFail('kppdf_propose_material_create', err);
      }
    },
  );

  server.registerTool(
    'kppdf_propose_material_update',
    {
      title: 'Propose material update',
      description:
        'Proposes a PATCH; stores before snapshot. Confirm with kppdf_confirm_proposal.',
      inputSchema: {
        id: z.string().min(1).describe('Material id'),
        patch: z.record(z.string(), z.unknown()).describe('Partial material fields'),
      },
    },
    async ({ id, patch }) => {
      try {
        const result = await backendPostJson(
          cfg.apiBaseUrl,
          cfg.apiKey,
          '/api/mutation-journal/proposals',
          {
            kind: 'material.update',
            toolName: 'kppdf_propose_material_update',
            update: { id, patch },
          },
        );
        return toolOk({ ok: true, proposal: result });
      } catch (err) {
        return toolFail('kppdf_propose_material_update', err);
      }
    },
  );

  server.registerTool(
    'kppdf_propose_material_batch',
    {
      title: 'Propose material create (batch)',
      description:
        'TZD-18: creates material.create PROPOSALS for many rows in one backend call ' +
        '(all-or-nothing best-effort — on error created proposals are rolled back). ' +
        'No SoT write until kppdf_confirm_batch. Optional idempotencyKey for safe retries.',
      inputSchema: {
        items: z.array(batchItemSchema).min(1).max(500),
        idempotencyKey: z.string().optional(),
      },
    },
    async ({ items, idempotencyKey }) => {
      try {
        const result = await backendPostJson(
          cfg.apiBaseUrl,
          cfg.apiKey,
          '/api/mutation-journal/propose-batch',
          {
            items: items.map((item) => ({
              kind: 'material.create',
              toolName: 'kppdf_propose_material_batch',
              create: item,
            })),
            ...(idempotencyKey ? { idempotencyKey } : {}),
          },
        );
        return toolOk({ ok: true, ...((result as object) ?? {}) });
      } catch (err) {
        return toolFail('kppdf_propose_material_batch', err);
      }
    },
  );

  server.registerTool(
    'kppdf_confirm_batch',
    {
      title: 'Confirm proposals (batch)',
      description:
        'TZD-18: applies many proposals via the journal (POST confirm-batch). ' +
        'This is the SoT write step — only call after the user approved the plan.',
      inputSchema: {
        ids: z.array(z.string().min(1)).min(1).max(500),
      },
    },
    async ({ ids }) => {
      try {
        const result = await backendPostJson(
          cfg.apiBaseUrl,
          cfg.apiKey,
          '/api/mutation-journal/confirm-batch',
          { ids },
        );
        return toolOk({ ok: true, ...((result as object) ?? {}) });
      } catch (err) {
        return toolFail('kppdf_confirm_batch', err);
      }
    },
  );

  server.registerTool(
    'kppdf_cancel_batch',
    {
      title: 'Cancel proposals (batch)',
      description:
        'TZD-18: cancels many pending proposals in one backend call. No SoT change.',
      inputSchema: {
        ids: z.array(z.string().min(1)).min(1).max(500),
      },
    },
    async ({ ids }) => {
      try {
        const result = await backendPostJson(
          cfg.apiBaseUrl,
          cfg.apiKey,
          '/api/mutation-journal/cancel-batch',
          { ids },
        );
        return toolOk({ ok: true, ...((result as object) ?? {}) });
      } catch (err) {
        return toolFail('kppdf_cancel_batch', err);
      }
    },
  );

  server.registerTool(
    'kppdf_propose_product_create',
    {
      title: 'Propose product create',
      description:
        'TZD-27: creates a product.create PROPOSAL (name + kind required, unit ' +
        'defaults to шт). No SoT write — confirm with kppdf_confirm_proposal. ' +
        'Check kppdf_get_product_where_used / composition before mass updates.',
      inputSchema: {
        name: z.string().min(1).describe('Product name'),
        kind: PRODUCT_KINDS_ENUM.describe('good | service | work'),
        unit: z.string().optional().describe('Unit (default шт)'),
        sku: z.string().optional(),
        notes: z.string().optional(),
      },
    },
    async (args) => {
      try {
        const result = await backendPostJson(
          cfg.apiBaseUrl,
          cfg.apiKey,
          '/api/mutation-journal/proposals',
          {
            kind: 'product.create',
            toolName: 'kppdf_propose_product_create',
            productCreate: {
              name: args.name,
              kind: args.kind,
              unit: args.unit?.trim() || 'шт',
              sku: args.sku,
              notes: args.notes,
            },
          },
        );
        return toolOk({ ok: true, proposal: result });
      } catch (err) {
        return toolFail('kppdf_propose_product_create', err);
      }
    },
  );

  server.registerTool(
    'kppdf_propose_product_update',
    {
      title: 'Propose product update',
      description:
        'TZD-27: proposes a PATCH on a product passport; stores before snapshot. ' +
        'Confirm with kppdf_confirm_proposal. Run kppdf_get_product_composition / ' +
        'kppdf_get_product_where_used first to avoid breaking BOM parents.',
      inputSchema: {
        id: z.string().min(1).describe('Product id'),
        patch: z.record(z.string(), z.unknown()).describe('Partial product passport fields'),
      },
    },
    async ({ id, patch }) => {
      try {
        const result = await backendPostJson(
          cfg.apiBaseUrl,
          cfg.apiKey,
          '/api/mutation-journal/proposals',
          {
            kind: 'product.update',
            toolName: 'kppdf_propose_product_update',
            productUpdate: { id, patch },
          },
        );
        return toolOk({ ok: true, proposal: result });
      } catch (err) {
        return toolFail('kppdf_propose_product_update', err);
      }
    },
  );

  server.registerTool(
    'kppdf_confirm_proposal',
    {
      title: 'Confirm proposal',
      description: 'Applies proposal via Material API and records journal entry.',
      inputSchema: {
        proposalId: z.string().min(1),
      },
    },
    async ({ proposalId }) => {
      try {
        const path = `/api/mutation-journal/proposals/${encodeURIComponent(proposalId)}/confirm`;
        const result = await backendPostJson(cfg.apiBaseUrl, cfg.apiKey, path, {});
        return toolOk({ ok: true, mutation: result });
      } catch (err) {
        return toolFail('kppdf_confirm_proposal', err);
      }
    },
  );

  server.registerTool(
    'kppdf_cancel_proposal',
    {
      title: 'Cancel proposal',
      description: 'Cancels a pending proposal without mutating SoT.',
      inputSchema: {
        proposalId: z.string().min(1),
      },
    },
    async ({ proposalId }) => {
      try {
        const path = `/api/mutation-journal/proposals/${encodeURIComponent(proposalId)}/cancel`;
        const result = await backendPostJson(cfg.apiBaseUrl, cfg.apiKey, path, {});
        return toolOk({ ok: true, proposal: result });
      } catch (err) {
        return toolFail('kppdf_cancel_proposal', err);
      }
    },
  );

  server.registerTool(
    'kppdf_undo_mutation',
    {
      title: 'Undo mutation',
      description:
        'Reverts an applied journal entry (or last applied if mutationId omitted). Ring buffer limited.',
      inputSchema: {
        mutationId: z
          .string()
          .optional()
          .describe('Mutation id; omit to undo last applied'),
      },
    },
    async ({ mutationId }) => {
      try {
        const path = mutationId
          ? `/api/mutation-journal/${encodeURIComponent(mutationId)}/undo`
          : '/api/mutation-journal/undo-last';
        const result = await backendPostJson(cfg.apiBaseUrl, cfg.apiKey, path, {});
        return toolOk({ ok: true, mutation: result });
      } catch (err) {
        return toolFail('kppdf_undo_mutation', err);
      }
    },
  );

  server.registerTool(
    'kppdf_list_mutations',
    {
      title: 'List mutations',
      description: 'Recent applied/undone journal entries (ring).',
      inputSchema: {
        limit: z.number().int().min(1).max(100).optional(),
      },
    },
    async ({ limit }) => {
      try {
        const q = limit ? `?limit=${limit}` : '';
        const result = await backendGetJson(
          cfg.apiBaseUrl,
          cfg.apiKey,
          `/api/mutation-journal${q}`,
        );
        return toolOk({ ok: true, result });
      } catch (err) {
        return toolFail('kppdf_list_mutations', err);
      }
    },
  );
}
