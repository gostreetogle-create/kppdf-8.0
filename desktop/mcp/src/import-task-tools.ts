/**
 * Import Task MCP tools (TZD-22).
 *
 * Assembly point: file rows → ImportTask (ready_for_ai).
 * Does NOT write SoT and does NOT create mutation-journal proposals.
 * Matching / HITL plan / propose-from-plan → TZD-23.
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  backendGetJson,
  backendPatchJson,
  backendPostJson,
} from './backend.js';
import type { McpRuntimeConfig } from './config.js';
import { toolFail, toolOk } from './tool-result.js';

export const IMPORT_TASK_TOOL_NAMES = [
  'kppdf_import_task_list',
  'kppdf_import_task_get',
  'kppdf_import_task_create',
  'kppdf_import_task_set_status',
] as const;

const STATUS_ENUM = z.enum([
  'draft',
  'ready_for_ai',
  'analyzing',
  'awaiting_user',
  'applying',
  'done',
  'cancelled',
  'failed',
]);

const FILE_TYPE_ENUM = z.enum(['xlsx', 'xls', 'csv', 'tsv', 'txt', 'other']);

const rowSchema = z.object({
  rowIndex: z.number().int().min(0),
  raw: z.record(z.string(), z.union([z.string(), z.number(), z.null()])),
  name: z.string().optional(),
  unit: z.string().optional(),
  article: z.string().optional(),
  sku: z.string().optional(),
  notes: z.string().optional(),
});

export function registerImportTaskTools(
  server: McpServer,
  cfg: McpRuntimeConfig,
): void {
  server.registerTool(
    'kppdf_import_task_list',
    {
      title: 'List import tasks',
      description:
        'Lists ImportTask containers (AI assembly point). Returns summary/rowCount ' +
        'without full rows. Does not write SoT or create proposals. Matching → TZD-23.',
      inputSchema: {
        status: STATUS_ENUM.optional().describe('Filter by status'),
        limit: z.number().int().min(1).max(100).optional(),
        page: z.number().int().min(1).optional(),
      },
    },
    async (args) => {
      try {
        const q = new URLSearchParams();
        if (args.status) q.set('status', args.status);
        if (args.limit) q.set('limit', String(args.limit));
        if (args.page) q.set('page', String(args.page));
        const qs = q.toString();
        const path = `/api/import-tasks${qs ? `?${qs}` : ''}`;
        const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
        return toolOk({ ok: true, ...((result as object) ?? {}) });
      } catch (err) {
        return toolFail('kppdf_import_task_list', err);
      }
    },
  );

  server.registerTool(
    'kppdf_import_task_get',
    {
      title: 'Get import task',
      description:
        'Fetches one ImportTask including full rows. Read-only vs SoT. ' +
        'Agent may then call list_materials / validate; auto-propose is TZD-23.',
      inputSchema: {
        id: z.string().min(1).describe('Import task id'),
      },
    },
    async ({ id }) => {
      try {
        const result = await backendGetJson(
          cfg.apiBaseUrl,
          cfg.apiKey,
          `/api/import-tasks/${encodeURIComponent(id)}`,
        );
        return toolOk({ ok: true, task: result });
      } catch (err) {
        return toolFail('kppdf_import_task_get', err);
      }
    },
  );

  server.registerTool(
    'kppdf_import_task_create',
    {
      title: 'Create import task',
      description:
        'Creates ImportTask with status ready_for_ai from source + rows (1..500). ' +
        'Does NOT create mutation-journal proposals and does NOT write materials. ' +
        'Matching / plan / propose → TZD-23.',
      inputSchema: {
        fileName: z.string().min(1),
        fileType: FILE_TYPE_ENUM,
        rows: z.array(rowSchema).min(1).max(500),
        summary: z.string().optional(),
        contentHash: z.string().optional(),
        inboxPath: z.string().optional(),
      },
    },
    async (args) => {
      try {
        const result = await backendPostJson(
          cfg.apiBaseUrl,
          cfg.apiKey,
          '/api/import-tasks',
          {
            source: {
              fileName: args.fileName,
              fileType: args.fileType,
              ...(args.contentHash ? { contentHash: args.contentHash } : {}),
              ...(args.inboxPath ? { inboxPath: args.inboxPath } : {}),
            },
            rows: args.rows,
            ...(args.summary ? { summary: args.summary } : {}),
          },
        );
        return toolOk({ ok: true, task: result });
      } catch (err) {
        return toolFail('kppdf_import_task_create', err);
      }
    },
  );

  server.registerTool(
    'kppdf_import_task_set_status',
    {
      title: 'Set import task status',
      description:
        'PATCH ImportTask status (whitelist). No matching / no auto-propose. ' +
        'Use ready_for_ai↔cancelled, failed, or analyzing/awaiting_user/applying/done for HITL flow (TZD-23).',
      inputSchema: {
        id: z.string().min(1),
        status: STATUS_ENUM,
        errorMessage: z.string().optional(),
      },
    },
    async ({ id, status, errorMessage }) => {
      try {
        const result = await backendPatchJson(
          cfg.apiBaseUrl,
          cfg.apiKey,
          `/api/import-tasks/${encodeURIComponent(id)}/status`,
          {
            status,
            ...(errorMessage !== undefined ? { errorMessage } : {}),
          },
        );
        return toolOk({ ok: true, task: result });
      } catch (err) {
        return toolFail('kppdf_import_task_set_status', err);
      }
    },
  );
}
