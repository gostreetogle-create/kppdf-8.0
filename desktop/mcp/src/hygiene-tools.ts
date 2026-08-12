/**
 * MCP data hygiene tools (TZD-44).
 *
 * Duplicate search is read-only. Cleanup is deliberately narrow: an explicit
 * filter plus userOk=true is required, and existing REST DELETE handlers are
 * used so the backend keeps its soft-delete/reference guards.
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  backendDeleteJson,
  backendGetJson,
} from './backend.js';
import type { McpRuntimeConfig } from './config.js';
import { TOOL_OUTPUT_SCHEMA, toolFail, toolOk } from './tool-result.js';
import { withQuery } from './query.js';

export const HYGIENE_TOOL_NAMES = [
  'kppdf_find_duplicates',
  'kppdf_cleanup_test_data',
] as const;

const ENTITY_ENUM = z.enum(['material', 'product', 'module', 'counterparty']);
const CRITERION_ENUM = z.enum(['name', 'sku', 'inn']);
const MONGO_ID = /^[a-f0-9]{24}$/i;

type HygieneEntity = z.infer<typeof ENTITY_ENUM>;
type DuplicateCriterion = z.infer<typeof CRITERION_ENUM>;
type HygieneItem = Record<string, unknown>;

const LIST_PATH: Record<HygieneEntity, string> = {
  material: '/api/materials',
  product: '/api/products',
  module: '/api/modules',
  counterparty: '/api/counterparties',
};

const DELETE_PATH: Partial<Record<HygieneEntity, string>> = {
  material: '/api/materials',
  product: '/api/products',
  counterparty: '/api/counterparties',
};

export const findDuplicatesInput = z.object({
  entity: ENTITY_ENUM,
  criterion: CRITERION_ENUM.optional().describe('Optional one-field search; default checks all relevant fields'),
});

export const cleanupTestDataInput = z.object({
  entity: z.enum(['material', 'product', 'counterparty']),
  userOk: z.boolean().describe('Explicit human approval is required'),
  dryRun: z.boolean().optional().default(false),
  namePrefix: z.string().min(1).optional(),
  nameRegex: z.string().min(1).optional(),
  ids: z.array(z.string().regex(MONGO_ID)).min(1).max(100).optional(),
}).superRefine((value, ctx) => {
  const filters = [value.namePrefix, value.nameRegex, value.ids].filter(Boolean);
  if (filters.length !== 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Exactly one cleanup filter is required: namePrefix, nameRegex, or ids',
      path: ['namePrefix'],
    });
  }
  if (value.nameRegex) {
    try {
      new RegExp(value.nameRegex);
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'nameRegex must be a valid regular expression',
        path: ['nameRegex'],
      });
    }
  }
});

function itemsFromPayload(payload: unknown): HygieneItem[] {
  if (Array.isArray(payload)) return payload.filter(isRecord);
  if (isRecord(payload) && Array.isArray(payload.items)) {
    return payload.items.filter(isRecord);
  }
  return isRecord(payload) ? [payload] : [];
}

function isRecord(value: unknown): value is HygieneItem {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeDuplicateName(value: unknown): string {
  return text(value).replace(/\s+/g, ' ').toLocaleLowerCase();
}

function itemId(item: HygieneItem): string | undefined {
  const value = item._id ?? item.id;
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function itemName(item: HygieneItem): string {
  return text(item.name) || text(item.title);
}

function itemSku(item: HygieneItem): string {
  return text(item.sku) || text(item.article);
}

function valueFor(item: HygieneItem, criterion: DuplicateCriterion): string {
  if (criterion === 'name') return normalizeDuplicateName(itemName(item));
  if (criterion === 'inn') return text(item.inn).toLocaleLowerCase();
  return text(itemSku(item)).toLocaleLowerCase();
}

function defaultCriteria(entity: HygieneEntity): DuplicateCriterion[] {
  return entity === 'counterparty' ? ['name', 'inn'] : ['name', 'sku'];
}

export function findDuplicateGroups(
  entity: HygieneEntity,
  items: HygieneItem[],
  criterion?: DuplicateCriterion,
) {
  const criteria = criterion ? [criterion] : defaultCriteria(entity);
  if (criterion === 'inn' && entity !== 'counterparty') {
    throw new Error('criterion=inn is only valid for counterparty');
  }
  const groups: Array<{
    criterion: DuplicateCriterion;
    value: string;
    ids: string[];
    items: Array<Record<string, unknown>>;
  }> = [];

  for (const field of criteria) {
    const byValue = new Map<string, HygieneItem[]>();
    for (const item of items) {
      const value = valueFor(item, field);
      if (!value) continue;
      const group = byValue.get(value) ?? [];
      group.push(item);
      byValue.set(value, group);
    }
    for (const [value, duplicates] of byValue) {
      const ids = duplicates.map(itemId).filter((id): id is string => Boolean(id));
      if (ids.length < 2) continue;
      groups.push({
        criterion: field,
        value,
        ids,
        items: duplicates.map(slimItem),
      });
    }
  }
  return groups;
}

function slimItem(item: HygieneItem): Record<string, unknown> {
  return {
    id: itemId(item) ?? null,
    name: itemName(item) || null,
    sku: itemSku(item) || null,
    inn: text(item.inn) || null,
    status: item.status ?? null,
    isActive: item.isActive ?? null,
  };
}

async function listEntity(
  cfg: McpRuntimeConfig,
  entity: HygieneEntity,
): Promise<HygieneItem[]> {
  const payload = await backendGetJson(
    cfg.apiBaseUrl,
    cfg.apiKey,
    withQuery(LIST_PATH[entity], { page: 1, limit: 100 }),
  );
  return itemsFromPayload(payload);
}

export async function findDuplicates(
  cfg: McpRuntimeConfig,
  args: z.infer<typeof findDuplicatesInput>,
) {
  try {
    const items = await listEntity(cfg, args.entity);
    const groups = findDuplicateGroups(args.entity, items, args.criterion);
    return toolOk({
      ok: true,
      entity: args.entity,
      scanned: items.length,
      groups,
      note: 'Read-only — no proposals, patches, deletes, or other SoT writes.',
    });
  } catch (err) {
    return toolFail('kppdf_find_duplicates', err);
  }
}

async function cleanupCandidates(
  cfg: McpRuntimeConfig,
  args: z.infer<typeof cleanupTestDataInput>,
): Promise<HygieneItem[]> {
  if (args.ids) {
    const result: HygieneItem[] = [];
    for (const id of args.ids) {
      const payload = await backendGetJson(
        cfg.apiBaseUrl,
        cfg.apiKey,
        `${LIST_PATH[args.entity]}/${encodeURIComponent(id)}`,
      );
      result.push(...itemsFromPayload(payload));
    }
    return result;
  }

  const items = await listEntity(cfg, args.entity);
  const regex = args.nameRegex ? new RegExp(args.nameRegex) : undefined;
  return items.filter((item) => {
    const name = itemName(item);
    if (args.namePrefix) return name.startsWith(args.namePrefix);
    return Boolean(regex?.test(name));
  });
}

export async function cleanupTestData(
  cfg: McpRuntimeConfig,
  args: z.infer<typeof cleanupTestDataInput>,
) {
  if (args.userOk !== true) {
    return toolFail(
      'kppdf_cleanup_test_data',
      new Error('userOk=true is required; no candidate lookup or mutation was performed'),
    );
  }

  try {
    const candidates = await cleanupCandidates(cfg, args);
    const candidateViews = candidates.map(slimItem);
    if (args.dryRun) {
      return toolOk({
        ok: true,
        dryRun: true,
        entity: args.entity,
        candidates: candidateViews,
        mutated: 0,
      });
    }

    const basePath = DELETE_PATH[args.entity];
    if (!basePath) throw new Error(`Cleanup is not supported for ${args.entity}`);
    const removedIds: string[] = [];
    const failed: Array<{ id: string; error: string }> = [];
    for (const candidate of candidates) {
      const id = itemId(candidate);
      if (!id) {
        failed.push({ id: '<missing>', error: 'Candidate has no id' });
        continue;
      }
      try {
        await backendDeleteJson(
          cfg.apiBaseUrl,
          cfg.apiKey,
          `${basePath}/${encodeURIComponent(id)}`,
        );
        removedIds.push(id);
      } catch (err) {
        failed.push({ id, error: err instanceof Error ? err.message : String(err) });
      }
    }
    return toolOk({
      ok: failed.length === 0,
      dryRun: false,
      entity: args.entity,
      candidates: candidateViews,
      removedIds,
      failed,
      note: 'Existing backend DELETE handlers perform soft-delete/reference checks; no hard delete was issued.',
    });
  } catch (err) {
    return toolFail('kppdf_cleanup_test_data', err);
  }
}

export function registerHygieneTools(server: McpServer, cfg: McpRuntimeConfig): void {
  server.registerTool(
    'kppdf_find_duplicates',
    {
      outputSchema: TOOL_OUTPUT_SCHEMA,
      title: 'Find catalog duplicates',
      description:
        'TZD-44 read-only scan for normalized duplicate names, SKU/article, or counterparty INN. No writes.',
      inputSchema: findDuplicatesInput,
    },
    async (args) => findDuplicates(cfg, args),
  );

  server.registerTool(
    'kppdf_cleanup_test_data',
    {
      outputSchema: TOOL_OUTPUT_SCHEMA,
      title: 'Cleanup filtered test data (gated)',
      description:
        'TZD-44: soft-delete only with exactly one explicit namePrefix/nameRegex/ids filter and userOk=true. dryRun lists candidates with zero mutations. Never use for a tenant wipe.',
      inputSchema: cleanupTestDataInput,
    },
    async (args) => cleanupTestData(cfg, args),
  );
}
