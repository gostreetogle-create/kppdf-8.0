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
  inboxDirFromEnv,
  listInboxFiles,
  mapRowToMaterial,
  parseInboxBytes,
  readInboxFile,
  type MaterialRow,
  type RawRow,
} from './inbox.js';
import { toolFail, toolOk } from './tool-result.js';
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
] as const;

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

export function registerInboxTools(server: McpServer, cfg: McpRuntimeConfig): void {
  server.registerTool(
    'kppdf_inbox_list',
    {
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
    'kppdf_inbox_audit_file',
    {
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
      },
    },
    async ({ fileName, mode }) => {
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
        const rows = await parseInboxBytes(fileName, data);

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
