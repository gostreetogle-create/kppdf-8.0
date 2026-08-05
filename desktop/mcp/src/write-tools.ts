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
] as const;

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
