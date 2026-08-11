/**
 * Import Task MCP tools (TZD-22 + TZD-23).
 *
 * Assembly point: file rows → ImportTask (ready_for_ai).
 * Does NOT write SoT. TZD-23 adds the HITL brain: set_report writes the
 * matching plan (0 journal) and apply_plan converts new/update rows to
 * mutation-journal proposals ONLY after userOk (human said ok).
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  backendGetJson,
  backendPatchJson,
  backendPostJson,
} from './backend.js';
import type { McpRuntimeConfig } from './config.js';
import {
  createEnvelope,
  readEnvelopeSchema,
  toolFail,
  toolOkStructured,
} from './tool-result.js';

export const IMPORT_TASK_TOOL_NAMES = [
  'kppdf_list_import_tasks',
  'kppdf_import_task_list',
  'kppdf_import_task_get',
  'kppdf_import_task_create',
  'kppdf_import_task_set_status',
  'kppdf_import_task_set_report',
  'kppdf_import_task_apply_plan',
  'kppdf_import_task_reshape',
] as const;

// ── TZD-23 apply_plan core (deps-injected for tests) ─────────────────────────

export interface AiPlanRow {
  rowIndex: number;
  decision: 'new' | 'skip' | 'update' | 'doubt';
  /** TZD-27: entity for the row — default material. */
  entity?: 'material' | 'product';
  materialId?: string;
  reason?: string;
  proposed?: {
    name?: string;
    unit?: string;
    article?: string;
    sku?: string;
    notes?: string;
    /** TZD-27: required for product.new rows. */
    kind?: 'good' | 'service' | 'work';
  };
}

export interface ApplyPlanDeps {
  getTask(id: string): Promise<{
    status?: string;
    aiReport?: { rows?: AiPlanRow[] } | null;
  }>;
  /** Batch propose (TZD-18) — backend all-or-nothing per chunk. */
  proposeBatch(
    chunk: BatchProposalItem[],
  ): Promise<{ proposalIds: string[]; errors?: Array<{ index: number; error: string }> }>;
  setProposals(taskId: string, proposalIds: string[]): Promise<unknown>;
}

export type BatchProposalKind =
  | 'material.create'
  | 'material.update'
  | 'product.create'
  | 'product.update';

export interface BatchProposalItem {
  rowIndex: number;
  kind: BatchProposalKind;
  create?: {
    name: string;
    unit?: string;
    article?: string;
    sku?: string;
    notes?: string;
  };
  productCreate?: {
    name: string;
    kind: 'good' | 'service' | 'work';
    unit?: string;
    sku?: string;
    notes?: string;
  };
  update?: { id: string; patch: Record<string, unknown> };
}

export interface ApplyPlanResult {
  ok: boolean;
  proposed: number;
  skipped: number;
  doubts: number;
  proposalIds?: string[];
  batchCalls?: number;
  note?: string;
  task?: unknown;
}

/** TZD-18: apply_plan бьёт план на чанки по 100 для propose-batch. */
export const APPLY_PLAN_CHUNK_SIZE = 100;

function pickPatch(src?: AiPlanRow['proposed']): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!src) return out;
  for (const k of ['name', 'unit', 'article', 'sku', 'notes'] as const) {
    const v = src[k];
    if (v !== undefined && v !== null && String(v).trim() !== '') out[k] = v;
  }
  return out;
}

/**
 * TZD-23 + TZD-18 HITL apply: only awaiting_user + userOk:true may propose.
 * new→create-item, update→update-item, skip/doubt→none. Items бьются на
 * чанки по APPLY_PLAN_CHUNK_SIZE и отправляются через propose-batch.
 */
export async function applyImportTaskPlan(
  deps: ApplyPlanDeps,
  args: { id: string; userOk: boolean },
): Promise<ApplyPlanResult> {
  if (args.userOk !== true) {
    return {
      ok: false,
      proposed: 0,
      skipped: 0,
      doubts: 0,
      note: 'apply_plan requires userOk=true (human said ok) — no proposals created',
    };
  }

  const task = await deps.getTask(args.id);
  if (task?.status !== 'awaiting_user') {
    return {
      ok: false,
      proposed: 0,
      skipped: 0,
      doubts: 0,
      note: `ImportTask ${args.id} is «${task?.status ?? 'unknown'}» — apply_plan only allowed from awaiting_user`,
    };
  }

  const rows = Array.isArray(task?.aiReport?.rows) ? task.aiReport!.rows! : [];
  const items: BatchProposalItem[] = [];
  let skipped = 0;
  let doubts = 0;

  for (const row of rows) {
    if (row.decision === 'skip') {
      skipped += 1;
      continue;
    }
    if (row.decision === 'doubt') {
      doubts += 1;
      continue;
    }
    if (row.decision === 'new') {
      const src = row.proposed ?? {};
      const name = src.name?.trim();
      if (!name) {
        skipped += 1;
        continue;
      }
      if (row.entity === 'product') {
        if (!src.kind) {
          skipped += 1;
          continue;
        }
        items.push({
          rowIndex: row.rowIndex,
          kind: 'product.create',
          productCreate: {
            name,
            kind: src.kind,
            unit: src.unit?.trim() || 'шт',
            sku: src.sku,
            notes: src.notes,
          },
        });
      } else {
        items.push({
          rowIndex: row.rowIndex,
          kind: 'material.create',
          create: {
            name,
            unit: src.unit?.trim() || 'шт',
            article: src.article,
            sku: src.sku,
            notes: src.notes,
          },
        });
      }
      continue;
    }
    if (row.decision === 'update') {
      if (!row.materialId) {
        skipped += 1;
        continue;
      }
      const patch = pickPatch(row.proposed);
      if (!Object.keys(patch).length) {
        skipped += 1;
        continue;
      }
      items.push({
        rowIndex: row.rowIndex,
        kind: row.entity === 'product' ? 'product.update' : 'material.update',
        update: { id: row.materialId, patch },
      });
    }
  }

  if (!items.length) {
    return {
      ok: true,
      proposed: 0,
      skipped,
      doubts,
      note: 'No proposals to create (all skip/doubt/empty) — status unchanged',
    };
  }

  const proposalIds: string[] = [];
  let batchCalls = 0;
  for (let i = 0; i < items.length; i += APPLY_PLAN_CHUNK_SIZE) {
    const chunk = items.slice(i, i + APPLY_PLAN_CHUNK_SIZE);
    batchCalls += 1;
    const res = await deps.proposeBatch(chunk);
    if (res.errors && res.errors.length > 0) {
      return {
        ok: false,
        proposed: 0,
        skipped,
        doubts,
        batchCalls,
        note: `propose-batch chunk ${batchCalls} failed (${res.errors.length} error(s)) — nothing linked, task stays awaiting_user`,
      };
    }
    for (const p of res.proposalIds ?? []) proposalIds.push(p);
  }

  if (!proposalIds.length) {
    return {
      ok: true,
      proposed: 0,
      skipped,
      doubts,
      note: 'No proposals to create (all skip/doubt/empty) — status unchanged',
    };
  }

  const taskAfter = await deps.setProposals(args.id, proposalIds);
  return {
    ok: true,
    proposed: proposalIds.length,
    skipped,
    doubts,
    proposalIds,
    batchCalls,
    task: taskAfter,
  };
}

export function createApplyPlanBackendDeps(
  cfg: McpRuntimeConfig,
): ApplyPlanDeps {
  return {
    getTask: async (id) =>
      backendGetJson(
        cfg.apiBaseUrl,
        cfg.apiKey,
        `/api/import-tasks/${encodeURIComponent(id)}`,
      ) as Promise<{ status?: string; aiReport?: { rows?: AiPlanRow[] } | null }>,
    proposeBatch: async (chunk) => {
      const items = chunk.map((item) => {
        if (item.kind === 'material.update') {
          return {
            kind: 'material.update' as const,
            toolName: 'kppdf_import_task_apply_plan',
            update: item.update,
          };
        }
        if (item.kind === 'product.create') {
          return {
            kind: 'product.create' as const,
            toolName: 'kppdf_import_task_apply_plan',
            productCreate: item.productCreate,
          };
        }
        if (item.kind === 'product.update') {
          return {
            kind: 'product.update' as const,
            toolName: 'kppdf_import_task_apply_plan',
            productUpdate: item.update,
          };
        }
        return {
          kind: 'material.create' as const,
          toolName: 'kppdf_import_task_apply_plan',
          create: item.create,
        };
      });
      const result = (await backendPostJson(
        cfg.apiBaseUrl,
        cfg.apiKey,
        '/api/mutation-journal/propose-batch',
        { items },
      )) as { proposalIds: string[]; errors?: Array<{ index: number; error: string }> };
      return { proposalIds: result.proposalIds ?? [], errors: result.errors };
    },
    setProposals: async (taskId, proposalIds) =>
      backendPatchJson(
        cfg.apiBaseUrl,
        cfg.apiKey,
        `/api/import-tasks/${encodeURIComponent(taskId)}/proposals`,
        { proposalIds, status: 'applying' },
      ),
  };
}

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
  async function listImportTasks(args: {
    status?: 'draft' | 'ready_for_ai' | 'analyzing' | 'awaiting_user' | 'applying' | 'done' | 'cancelled' | 'failed';
    limit?: number;
    page?: number;
  }) {
    try {
      const q = new URLSearchParams();
      if (args.status) q.set('status', args.status);
      if (args.limit) q.set('limit', String(args.limit));
      if (args.page) q.set('page', String(args.page));
      const qs = q.toString();
      const path = `/api/import-tasks${qs ? `?${qs}` : ''}`;
      const result = await backendGetJson(cfg.apiBaseUrl, cfg.apiKey, path);
      return toolOkStructured({ ok: true, ...((result as object) ?? {}) });
    } catch (err) {
      return toolFail('kppdf_list_import_tasks', err);
    }
  }

  const importTaskListConfig = {
    title: 'List import tasks',
    description:
      'Lists ImportTask containers (AI assembly point). Returns summary/rowCount ' +
      'without full rows. Does not write SoT or create proposals. Matching → TZD-23.',
    inputSchema: {
      status: STATUS_ENUM.optional().describe('Filter by status'),
      limit: z.number().int().min(1).max(100).optional(),
      page: z.number().int().min(1).optional(),
    },
    outputSchema: readEnvelopeSchema,
  };
  server.registerTool('kppdf_list_import_tasks', importTaskListConfig, listImportTasks);
  server.registerTool(
    'kppdf_import_task_list',
    {
      ...importTaskListConfig,
      title: 'List import tasks (deprecated alias — use kppdf_list_import_tasks)',
      description:
        'TZD-41: deprecated alias of kppdf_list_import_tasks (removed after one wave).',
    },
    listImportTasks,
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
        return toolOkStructured({ ...createEnvelope(result), task: result });
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
        rows: z.array(rowSchema).min(1).max(2000),
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
        return toolOkStructured({ ...createEnvelope(result), task: result });
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
        return toolOkStructured({ ...createEnvelope(result), task: result });
      } catch (err) {
        return toolFail('kppdf_import_task_set_status', err);
      }
    },
  );

  server.registerTool(
    'kppdf_import_task_set_report',
    {
      title: 'Set AI matching report (→ awaiting_user)',
      description:
        'TZD-23: persists the AI matching plan (counts + per-row decisions) ' +
        'and moves the task to awaiting_user. Creates ZERO journal proposals — ' +
        'the human must approve before kppdf_import_task_apply_plan.',
      inputSchema: {
        id: z.string().min(1),
        summary: z.string().optional().describe('Short chat summary, e.g. «2 new / 1 skip / 1 update / 1 doubt»'),
        counts: z.object({
          new: z.number().int().min(0),
          skip: z.number().int().min(0),
          update: z.number().int().min(0),
          doubt: z.number().int().min(0),
        }),
        rows: z.array(
          z.object({
            rowIndex: z.number().int().min(0),
            decision: z.enum(['new', 'skip', 'update', 'doubt']),
            entity: z
              .enum(['material', 'product'])
              .optional()
              .describe('TZD-27: row entity (default material)'),
            materialId: z.string().optional().describe('Existing entity id (update / doubt)'),
            reason: z.string().optional(),
            proposed: z
              .object({
                name: z.string().optional(),
                unit: z.string().optional(),
                article: z.string().optional(),
                sku: z.string().optional(),
                notes: z.string().optional(),
                kind: z
                  .enum(['good', 'service', 'work'])
                  .optional()
                  .describe('Required for product.new rows'),
              })
              .optional()
              .describe('Canonical values to propose for new/update rows'),
          }),
        ),
      },
    },
    async ({ id, summary, counts, rows }) => {
      try {
        const result = await backendPatchJson(
          cfg.apiBaseUrl,
          cfg.apiKey,
          `/api/import-tasks/${encodeURIComponent(id)}/report`,
          {
            ...(summary !== undefined ? { summary } : {}),
            aiReport: {
              version: 1,
              matchedAt: new Date().toISOString(),
              counts,
              rows,
            },
            status: 'awaiting_user',
          },
        );
        return toolOkStructured({ ...createEnvelope(result), task: result });
      } catch (err) {
        return toolFail('kppdf_import_task_set_report', err);
      }
    },
  );

  server.registerTool(
    'kppdf_import_task_apply_plan',
    {
      title: 'Apply AI plan → proposes (HITL ok required)',
      description:
        'TZD-23: only when status=awaiting_user AND userOk=true. ' +
        'new→propose_create, update→propose_update, skip/doubt→none. ' +
        'Links proposal ids + moves task to applying. No SoT write until confirm.',
      inputSchema: {
        id: z.string().min(1),
        userOk: z.boolean().describe('Human approval — must be true to create proposals'),
      },
    },
    async ({ id, userOk }) => {
      try {
        const result = await applyImportTaskPlan(
          createApplyPlanBackendDeps(cfg),
          { id, userOk },
        );
        return toolOkStructured(result);
      } catch (err) {
        return toolFail('kppdf_import_task_apply_plan', err);
      }
    },
  );

  server.registerTool(
    'kppdf_import_task_reshape',
    {
      title: 'Reshape import task rows (AI-safe)',
      description:
        'TZD-26: replaces ImportTask rows (+ optional columnMap/reshapeNote) — ' +
        'only while status is draft/ready_for_ai/analyzing/awaiting_user. ' +
        'Resets aiReport, so the agent MUST re-audit / re-match ' +
        '(kppdf_import_task_set_report) before apply_plan. 0 journal writes.',
      inputSchema: {
        id: z.string().min(1),
        rows: z.array(rowSchema).min(1).max(2000).describe('Reshaped rows (same shape as create)'),
        columnMap: z
          .record(z.string(), z.string().nullable())
          .optional()
          .describe('header → canonical (null = dropped column)'),
        reshapeNote: z.string().optional().describe('Why columns were transformed'),
      },
    },
    async ({ id, rows, columnMap, reshapeNote }) => {
      try {
        const result = await backendPatchJson(
          cfg.apiBaseUrl,
          cfg.apiKey,
          `/api/import-tasks/${encodeURIComponent(id)}/rows`,
          {
            rows,
            ...(columnMap !== undefined ? { columnMap } : {}),
            ...(reshapeNote !== undefined ? { reshapeNote } : {}),
          },
        );
        return toolOkStructured({
          ...createEnvelope(result),
          task: result,
          note: 'Rows replaced — re-audit / re-match (set_report) before apply_plan.',
        });
      } catch (err) {
        return toolFail('kppdf_import_task_reshape', err);
      }
    },
  );
}
