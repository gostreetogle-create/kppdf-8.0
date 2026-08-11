/**
 * Data hygiene MCP tools (TZD-44).
 *
 * SoT на проде засмущён тестовым мусором (fbdb / fhfbgf / 6565 / Тест ·…).
 * Инструменты:
 *  - `kppdf_find_duplicates` — read-only поиск групп дублей (name/sku/inn);
 *  - `kppdf_cleanup_test_data` — ГЕЙТИНГ: обязателен `userOk:true` + хотя бы
 *    один фильтр (namePrefix | nameRegex | ids[]); `dryRun:true` — список
 *    кандидатов и 0 мутаций. Мягкое удаление через СУЩЕСТВУЮЩИЕ DELETE
 *    эндпоинты (backend soft-delete: deletedAt). Пустой cleanup = toolFail.
 *
 * Опасные ops: канон docs/ops/DANGEROUS-OPS.md — никакого hard delete / wipe.
 * На проде cleanup запускать только после явного PO «да, чисти Тест*».
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { backendDeleteJson, backendGetJson } from './backend.js';
import type { McpRuntimeConfig } from './config.js';
import { toolFail, toolOkStructured } from './tool-result.js';

export const HYGIENE_TOOL_NAMES = [
  'kppdf_find_duplicates',
  'kppdf_cleanup_test_data',
] as const;

export type HygieneEntity = 'material' | 'product' | 'module' | 'counterparty';
export type HygieneCriterion = 'name' | 'sku' | 'inn';

const ENTITY_ENUM = z.enum(['material', 'product', 'module', 'counterparty']);
const CRITERION_ENUM = z.enum(['name', 'sku', 'inn']);

export const DEFAULT_CRITERIA: Record<HygieneEntity, HygieneCriterion[]> = {
  material: ['name', 'sku'],
  product: ['name', 'sku'],
  module: ['name'],
  counterparty: ['name', 'inn'],
};

const LIST_BASE: Record<HygieneEntity, string> = {
  material: '/api/materials',
  product: '/api/products',
  module: '/api/modules',
  counterparty: '/api/counterparties',
};

export interface HygieneItem {
  id: string;
  name?: string;
  sku?: string;
  inn?: string;
  raw: Record<string, unknown>;
}

/** Нормализация имени для сравнения: trim, lowercase, схлопывание пробелов. */
export function normName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function toHygieneItem(raw: unknown): HygieneItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  // мягко удалённые (deletedAt) не участвуют в дублях/очистке
  if (r.deletedAt) return null;
  const id = typeof r._id === 'string' ? r._id : typeof r.id === 'string' ? r.id : undefined;
  if (!id) return null;
  return {
    id,
    name: typeof r.name === 'string' ? r.name : undefined,
    sku: typeof r.sku === 'string' ? r.sku : undefined,
    inn: typeof r.inn === 'string' ? r.inn : undefined,
    raw: r,
  };
}

export interface DuplicateGroup {
  entity: string;
  criterion: HygieneCriterion;
  key: string;
  count: number;
  ids: string[];
  items: Array<{ id: string; name?: string; sku?: string; inn?: string }>;
}

function criterionKey(item: HygieneItem, criterion: HygieneCriterion): string {
  const value = item[criterion] ?? '';
  return criterion === 'name' ? normName(value) : value.trim().toLowerCase();
}

/** Чистая функция: группы дублей по критериям (count ≥ 2). */
export function findDuplicateGroups(
  items: HygieneItem[],
  entity: HygieneEntity,
  criteria: HygieneCriterion[],
): DuplicateGroup[] {
  const groups: DuplicateGroup[] = [];
  for (const criterion of criteria) {
    const byKey = new Map<string, HygieneItem[]>();
    for (const item of items) {
      const key = criterionKey(item, criterion);
      if (!key) continue;
      const arr = byKey.get(key) ?? [];
      arr.push(item);
      byKey.set(key, arr);
    }
    for (const [key, arr] of byKey) {
      if (arr.length < 2) continue;
      groups.push({
        entity,
        criterion,
        key,
        count: arr.length,
        ids: arr.map((i) => i.id),
        items: arr.map(({ id, name, sku, inn }) => ({ id, name, sku, inn })),
      });
    }
  }
  groups.sort((a, b) => b.count - a.count);
  return groups;
}

function unwrapItems(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    const items = (raw as { items?: unknown }).items;
    if (Array.isArray(items)) return items;
  }
  return [];
}

/** Выкачивает все активные items сущности (page/limit=100; module — массив). */
export async function fetchAllItems(
  cfg: McpRuntimeConfig,
  entity: HygieneEntity,
  getJson: typeof backendGetJson = backendGetJson,
): Promise<HygieneItem[]> {
  const base = LIST_BASE[entity];
  const out: HygieneItem[] = [];
  if (entity === 'module') {
    const raw = await getJson(cfg.apiBaseUrl, cfg.apiKey, base);
    for (const item of unwrapItems(raw)) {
      const hi = toHygieneItem(item);
      if (hi) out.push(hi);
    }
    return out;
  }
  let page = 1;
  for (;;) {
    const raw = (await getJson(
      cfg.apiBaseUrl,
      cfg.apiKey,
      `${base}?page=${page}&limit=100`,
    )) as { items?: unknown; total?: number } | null;
    const items = unwrapItems(raw);
    const total = typeof raw?.total === 'number' ? raw.total : out.length + items.length;
    for (const item of items) {
      const hi = toHygieneItem(item);
      if (hi) out.push(hi);
    }
    if (items.length === 0 || out.length >= total || page >= 50) break;
    page += 1;
  }
  return out;
}

export interface CleanupCandidate {
  id: string;
  name?: string;
  sku?: string;
  inn?: string;
}

export interface CleanupFilter {
  namePrefix?: string;
  nameRegex?: string;
  ids?: string[];
}

/** Чистая функция: кандидаты по фильтру (namePrefix | nameRegex | ids). */
export function selectCleanupCandidates(
  items: HygieneItem[],
  filter: CleanupFilter,
  max: number,
): { candidates: CleanupCandidate[]; truncated: boolean } {
  const prefix = filter.namePrefix?.trim().toLowerCase();
  let regex: RegExp | null = null;
  if (filter.nameRegex) {
    try {
      regex = new RegExp(filter.nameRegex, 'i');
    } catch {
      regex = null;
    }
  }
  const idSet = new Set(filter.ids ?? []);
  const matches: HygieneItem[] = [];
  for (const item of items) {
    const name = item.name ?? '';
    const hit =
      (prefix !== undefined && name.toLowerCase().startsWith(prefix)) ||
      (regex !== null && regex.test(name)) ||
      idSet.has(item.id);
    if (hit) matches.push(item);
  }
  const truncated = matches.length > max;
  const candidates = matches.slice(0, max).map(({ id, name, sku, inn }) => ({ id, name, sku, inn }));
  return { candidates, truncated };
}

const DELETE_BASE: Record<HygieneEntity, string> = {
  material: '/api/materials',
  product: '/api/products',
  module: '/api/modules',
  counterparty: '/api/counterparties',
};

export function registerHygieneTools(server: McpServer, cfg: McpRuntimeConfig): void {
  server.registerTool(
    'kppdf_find_duplicates',
    {
      title: 'Find duplicate catalog/clients (read-only)',
      description:
        'TZD-44: groups of duplicates by normalized name / sku / inn for ' +
        'material|product|module|counterparty. Read-only — no mutations. ' +
        'Use before kppdf_cleanup_test_data to choose what to clean.',
      inputSchema: {
        entity: ENTITY_ENUM.describe('material|product|module|counterparty'),
        criteria: z
          .array(CRITERION_ENUM)
          .optional()
          .describe('name|sku|inn (default per entity: material/product → name+sku, module → name, counterparty → name+inn)'),
        maxGroups: z.number().int().min(1).max(200).optional().describe('Cap returned groups (default 100)'),
      },
    },
    async (args) => {
      try {
        const entity = args.entity;
        const criteria = args.criteria?.length ? args.criteria : DEFAULT_CRITERIA[entity];
        const items = await fetchAllItems(cfg, entity);
        const groups = findDuplicateGroups(items, entity, criteria);
        const cap = args.maxGroups ?? 100;
        const result = {
          ok: true,
          entity,
          criteria,
          scanned: items.length,
          groups: groups.slice(0, cap),
          groupCount: groups.length,
          note: 'Read-only — no mutations. Use kppdf_cleanup_test_data for soft cleanup.',
        };
        return toolOkStructured(result);
      } catch (err) {
        return toolFail('kppdf_find_duplicates', err);
      }
    },
  );

  server.registerTool(
    'kppdf_cleanup_test_data',
    {
      title: 'Soft-clean test data (GATED: userOk:true + filter)',
      description:
        'TZD-44: мягкое удаление (soft-delete через существующий DELETE endpoint) ' +
        'кандидатов по namePrefix | nameRegex | ids[] для material|product|module|counterparty. ' +
        'ТРЕБУЕТ userOk:true И хотя бы один фильтр (иначе toolFail, 0 мутаций). ' +
        'dryRun:true → список кандидатов, 0 DELETE. Prod: только после явного PO «да, чисти Тест*».',
      inputSchema: {
        entity: ENTITY_ENUM.describe('material|product|module|counterparty'),
        userOk: z.boolean().describe('Must be true — human approved this cleanup'),
        dryRun: z.boolean().optional().describe('List candidates only, 0 mutations (default false)'),
        namePrefix: z.string().min(1).optional().describe('Case-insensitive name prefix, e.g. «Тест»'),
        nameRegex: z.string().min(1).optional().describe('Case-insensitive regex on name'),
        ids: z
          .array(z.string().min(1))
          .min(1)
          .max(100)
          .optional()
          .describe('Exact entity ids (max 100)'),
        max: z.number().int().min(1).max(500).optional().describe('Cap candidates (default 200)'),
      },
    },
    async (args) => {
      if (args.userOk !== true) {
        return toolFail(
          'kppdf_cleanup_test_data',
          new Error('userOk:true is required — this action soft-deletes SoT records; confirm with the user first'),
        );
      }
      const hasFilter = args.namePrefix !== undefined || args.nameRegex !== undefined || args.ids !== undefined;
      if (!hasFilter) {
        return toolFail(
          'kppdf_cleanup_test_data',
          new Error('Provide at least one filter: namePrefix | nameRegex | ids[] (empty cleanup is forbidden)'),
        );
      }
      try {
        const items = await fetchAllItems(cfg, args.entity);
        const max = args.max ?? 200;
        const { candidates, truncated } = selectCleanupCandidates(items, {
          namePrefix: args.namePrefix,
          nameRegex: args.nameRegex,
          ids: args.ids,
        }, max);

        if (args.dryRun === true) {
          return toolOkStructured({
            ok: true,
            dryRun: true,
            entity: args.entity,
            candidateCount: candidates.length,
            truncated,
            candidates,
            note: 'Dry-run — 0 mutations. Call again without dryRun after userOk.',
          });
        }

        const base = DELETE_BASE[args.entity];
        const deleted: CleanupCandidate[] = [];
        const failed: Array<{ id: string; error: string }> = [];
        for (const c of candidates) {
          try {
            await backendDeleteJson(cfg.apiBaseUrl, cfg.apiKey, `${base}/${encodeURIComponent(c.id)}`);
            deleted.push(c);
          } catch (err) {
            failed.push({ id: c.id, error: err instanceof Error ? err.message : String(err) });
          }
        }
        return toolOkStructured({
          ok: true,
          entity: args.entity,
          deletedCount: deleted.length,
          failedCount: failed.length,
          truncated,
          deleted,
          failed,
          note: 'Soft-delete only (deletedAt) via existing REST endpoints.',
        });
      } catch (err) {
        return toolFail('kppdf_cleanup_test_data', err);
      }
    },
  );
}
