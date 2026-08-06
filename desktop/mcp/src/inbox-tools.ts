/**
 * Inbox MCP tools (TZD-15).
 *
 * kppdf_inbox_list           — files in inbox dir (env KPPDF_INBOX_DIR).
 * kppdf_inbox_propose_file   — parse file → propose material.create per row
 *                              (proposal only, НЕ запись в SoT; подтверждать
 *                              через kppdf_confirm_proposal).
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { backendPostJson } from './backend.js';
import type { McpRuntimeConfig } from './config.js';
import {
  inboxDirFromEnv,
  listInboxFiles,
  mapRowToMaterial,
  parseInboxBytes,
  readInboxFile,
} from './inbox.js';
import { toolFail, toolOk } from './tool-result.js';

export const INBOX_TOOL_NAMES = [
  'kppdf_inbox_list',
  'kppdf_inbox_propose_file',
] as const;

/** Читает каталог inbox из env (KPPDF_INBOX_DIR, задаёт десктоп). */
function requireInboxDir(): string | null {
  const dir = inboxDirFromEnv();
  if (!dir) {
    return null;
  }
  return dir;
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
    'kppdf_inbox_propose_file',
    {
      title: 'Propose file rows as material.create',
      description:
        'Parses an inbox file (xlsx/csv/tsv/txt), maps rows to material columns ' +
        '(наименование/ед/артикул/sku/категория), creates a material.create PROPOSAL per row ' +
        'via mutation journal. Does NOT write to SoT — confirm with kppdf_confirm_proposal.',
      inputSchema: {
        fileName: z.string().min(1).describe('File name in the inbox dir'),
      },
    },
    async ({ fileName }) => {
      try {
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
          dir,
          fileName,
          totals: { rows: rows.length, proposed: proposed.length, skipped: skipped.length, failed: failed.length },
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
