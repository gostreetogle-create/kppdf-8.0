/**
 * Inbox MCP tools (TZD-15 + TZD-17 audit).
 *
 * kppdf_inbox_list           — files in inbox dir (env KPPDF_INBOX_DIR).
 * kppdf_inbox_propose_file   — parse file → propose material.create per row
 *                              (default mode=propose). mode=validate ≡ audit (0 proposals).
 * kppdf_inbox_audit_file     — parse + validate each row; NEVER posts proposals.
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { backendGetJson, backendPostJson } from './backend.js';
import type { McpRuntimeConfig } from './config.js';
import {
  classifyColumns,
  inboxDirFromEnv,
  listInboxFiles,
  mapRowToMaterial,
  parseInboxBytes,
  readInboxFile,
  type ColumnClassifyResult,
  type MaterialRow,
  type RawRow,
} from './inbox.js';
import { TOOL_OUTPUT_SCHEMA, toolFail, toolOk } from './tool-result.js';
import {
  createBackendValidateDeps,
  validateMaterial,
  type ValidateMaterialDeps,
  type ValidateMaterialResult,
} from './validate-material.js';

export const INBOX_TOOL_NAMES = [
  'kppdf_inbox_list',
  'kppdf_inbox_propose_file',
  'kppdf_inbox_audit_file',
  'kppdf_inbox_classify_columns',
] as const;

export interface ColumnClassifyToolResult extends ColumnClassifyResult {
  source: string;
  sampleRows: RawRow[];
}

/**
 * TZD-26: headers + sample → ready/unfit classification. Pure — no journal, no SoT.
 * Exported for unit tests.
 */
export function classifyColumnSet(
  headers: string[],
  sampleRows: RawRow[],
): ColumnClassifyToolResult {
  const classified = classifyColumns(headers);
  return {
    source: 'inline',
    sampleRows,
    ...classified,
  };
}

/** Читает каталог inbox из env (KPPDF_INBOX_DIR, задаёт десктоп). */
function requireInboxDir(): string | null {
  const dir = inboxDirFromEnv();
  if (!dir) {
    return null;
  }
  return dir;
}

export interface InboxAuditRow {
  rowIndex: number;
  status: 'ok' | 'error' | 'skipped';
  material?: MaterialRow;
  reason?: string;
  validation?: ValidateMaterialResult;
}

export interface InboxAuditReport {
  fileName: string;
  totalRows: number;
  mappable: number;
  skipped: number;
  errors: number;
  warnings: number;
  rows: InboxAuditRow[];
  note: string;
}

/**
 * Parse inbox rows and validate each mappable material — no journal POST.
 * Exported for unit tests with injected deps.
 */
export async function auditInboxRows(
  fileName: string,
  rows: RawRow[],
  deps: ValidateMaterialDeps,
): Promise<InboxAuditReport> {
  const reportRows: InboxAuditRow[] = [];
  let mappable = 0;
  let skipped = 0;
  let errors = 0;
  let warnings = 0;

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i];
    const material = mapRowToMaterial(raw);
    if (!material) {
      skipped += 1;
      reportRows.push({
        rowIndex: i,
        status: 'skipped',
        reason: 'нет колонки с наименованием',
      });
      continue;
    }
    mappable += 1;
    const validation = await validateMaterial(material, deps);
    if (validation.errors.length > 0) {
      errors += 1;
      reportRows.push({
        rowIndex: i,
        status: 'error',
        material,
        validation,
      });
    } else {
      warnings += validation.warnings.length;
      reportRows.push({
        rowIndex: i,
        status: 'ok',
        material,
        validation,
      });
    }
  }

  return {
    fileName,
    totalRows: rows.length,
    mappable,
    skipped,
    errors,
    warnings,
    rows: reportRows,
    note: 'Audit only — 0 proposals, no SoT write.',
  };
}

async function runAuditFile(
  cfg: McpRuntimeConfig,
  fileName: string,
): Promise<InboxAuditReport> {
  const dir = requireInboxDir();
  if (!dir) {
    throw new Error('KPPDF_INBOX_DIR not set — desktop did not configure inbox for MCP.');
  }
  const data = await readInboxFile(dir, fileName);
  const rows = await parseInboxBytes(fileName, data);
  const deps = createBackendValidateDeps(cfg.apiBaseUrl, cfg.apiKey, backendGetJson);
  return auditInboxRows(fileName, rows, deps);
}

async function classifyInboxFile(
  cfg: McpRuntimeConfig,
  fileName: string,
  sampleLimit: number,
): Promise<ColumnClassifyToolResult> {
  const dir = requireInboxDir();
  if (!dir) {
    throw new Error('KPPDF_INBOX_DIR not set — desktop did not configure inbox for MCP.');
  }
  const data = await readInboxFile(dir, fileName);
  const rows = await parseInboxBytes(fileName, data);
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  const classified = classifyColumns(headers);
  return {
    source: `inbox:${fileName}`,
    sampleRows: rows.slice(0, sampleLimit),
    ...classified,
  };
}

export function registerInboxTools(server: McpServer, cfg: McpRuntimeConfig): void {
  server.registerTool(
    'kppdf_inbox_list',
    {
      outputSchema: TOOL_OUTPUT_SCHEMA,
      title: 'List inbox files',
      description:
        'Lists files in the desktop inbox dir (KPPDF_INBOX_DIR). Excludes processed/failed subfolders.',
    },
    async () => {
      try {
        const dir = requireInboxDir();
        if (!dir) {
          return toolOk({
            ok: false,
            reason: 'KPPDF_INBOX_DIR not set — desktop did not configure inbox for MCP.',
            files: [],
          });
        }
        const files = await listInboxFiles(dir);
        return toolOk({ ok: true, dir, files });
      } catch (err) {
        return toolFail('kppdf_inbox_list', err);
      }
    },
  );

  server.registerTool(
    'kppdf_inbox_classify_columns',
    {
      outputSchema: TOOL_OUTPUT_SCHEMA,
      title: 'Classify inbox columns ready/unfit',
      description:
        'TZD-26: classifies column headers against the material canon ' +
        '(name/unit/article/sku/notes/categoryId). Returns ready (exactly one ' +
        'canonical), unfit (unknown/conflict), mapping and sample rows. ' +
        'Read-only — 0 proposals, 0 SoT. Pass fileName (inbox file) OR headers+sample.',
      inputSchema: {
        fileName: z
          .string()
          .optional()
          .describe('Inbox file name — parse and classify its first-row headers'),
        headers: z
          .array(z.string())
          .optional()
          .describe('Explicit header list (when fileName not available)'),
        sample: z
          .array(z.record(z.string(), z.unknown()))
          .optional()
          .describe('Sample raw rows to return alongside the classification'),
        sampleLimit: z
          .number()
          .int()
          .min(1)
          .max(20)
          .optional()
          .describe('How many sample rows to return (default 5)'),
      },
    },
    async ({ fileName, headers, sample, sampleLimit }) => {
      try {
        const limit = sampleLimit ?? 5;
        let result: ColumnClassifyToolResult;
        if (fileName) {
          result = await classifyInboxFile(cfg, fileName, limit);
        } else if (headers?.length) {
          result = classifyColumnSet(headers, sample ?? []);
        } else {
          return toolOk({
            ok: false,
            reason: 'Provide fileName OR headers (with optional sample) to classify columns.',
          });
        }
        return toolOk({
          ok: true,
          note: 'Classify only — no proposal, no SoT write. Reshape → kppdf_import_task_reshape.',
          ...result,
        });
      } catch (err) {
        return toolFail('kppdf_inbox_classify_columns', err);
      }
    },
  );

  server.registerTool(
    'kppdf_inbox_audit_file',
    {
      outputSchema: TOOL_OUTPUT_SCHEMA,
      title: 'Audit inbox file (validate only)',
      description:
        'Parses an inbox file and dry-runs material validation per mappable row. ' +
        'Returns per-row errors/warnings. Does NOT create proposals and does NOT write SoT. ' +
        'Prefer this before kppdf_inbox_propose_file.',
      inputSchema: {
        fileName: z.string().min(1).describe('File name in the inbox dir (basename only)'),
      },
    },
    async ({ fileName }) => {
      try {
        const report = await runAuditFile(cfg, fileName);
        return toolOk({ ok: true, ...report });
      } catch (err) {
        return toolFail('kppdf_inbox_audit_file', err);
      }
    },
  );

  server.registerTool(
    'kppdf_inbox_propose_file',
    {
      outputSchema: TOOL_OUTPUT_SCHEMA,
      title: 'Propose or validate file rows as material.create',
      description:
        'Parses an inbox file (xlsx/csv/tsv/txt), maps rows to material columns. ' +
        'Default mode=propose: creates material.create PROPOSAL per row (no SoT). ' +
        'mode=validate: same as kppdf_inbox_audit_file — 0 proposals. ' +
        'Confirm proposals with kppdf_confirm_proposal.',
      inputSchema: {
        fileName: z.string().min(1).describe('File name in the inbox dir'),
        mode: z
          .enum(['propose', 'validate'])
          .optional()
          .describe('propose (default) | validate (audit only, 0 proposals)'),
        limit: z
          .number()
          .int()
          .min(1)
          .max(10000)
          .optional()
          .describe('TZD-18: max rows to process from the file (default all)'),
        offset: z
          .number()
          .int()
          .min(0)
          .optional()
          .describe('TZD-18: skip first N rows (0-based)'),
      },
    },
    async ({ fileName, mode, limit, offset }) => {
      try {
        const resolvedMode = mode ?? 'propose';
        if (resolvedMode === 'validate') {
          const report = await runAuditFile(cfg, fileName);
          return toolOk({
            ok: true,
            mode: 'validate',
            ...report,
          });
        }

        const dir = requireInboxDir();
        if (!dir) {
          return toolFail(
            'kppdf_inbox_propose_file',
            new Error('KPPDF_INBOX_DIR not set — desktop did not configure inbox for MCP.'),
          );
        }
        const data = await readInboxFile(dir, fileName);
        const parsed = await parseInboxBytes(fileName, data);
        const start = Math.max(0, offset ?? 0);
        const rows = limit !== undefined ? parsed.slice(start, start + limit) : parsed.slice(start);

        const proposed: Array<{ name: string; proposalId?: string }> = [];
        const skipped: Array<{ row: string; reason: string }> = [];
        const failed: Array<{ row: string; error: string }> = [];

        for (const raw of rows) {
          const material = mapRowToMaterial(raw);
          if (!material) {
            skipped.push({
              row: JSON.stringify(raw).slice(0, 120),
              reason: 'нет колонки с наименованием',
            });
            continue;
          }
          try {
            const resp = (await backendPostJson(
              cfg.apiBaseUrl,
              cfg.apiKey,
              '/api/mutation-journal/proposals',
              {
                kind: 'material.create',
                toolName: 'kppdf_inbox_propose_file',
                create: material,
              },
            )) as { proposalId?: string };
            proposed.push({ name: material.name, proposalId: resp.proposalId });
          } catch (err) {
            failed.push({
              row: material.name,
              error: err instanceof Error ? err.message : String(err),
            });
          }
        }

        return toolOk({
          ok: true,
          mode: 'propose',
          dir,
          fileName,
          totals: {
            rows: rows.length,
            proposed: proposed.length,
            skipped: skipped.length,
            failed: failed.length,
          },
          proposed,
          skipped,
          failed,
          note: 'Proposals only — no SoT write. Confirm with kppdf_confirm_proposal.',
        });
      } catch (err) {
        return toolFail('kppdf_inbox_propose_file', err);
      }
    },
  );
}
