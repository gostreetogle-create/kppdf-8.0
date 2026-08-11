/**
 * Shared MCP tool result helpers (EN messages, consistent with TZD-11 ping).
 *
 * TZD-41 response envelope canon:
 *   success        → { ok: true, result, id?, proposalId? }
 *   propose tools  → top-level `proposalId` ALWAYS (result = full journal response)
 *   SoT-create     → top-level `id` ALWAYS (normalized from backend `_id`)
 *
 * Tools that declare `outputSchema` MUST return `structuredContent` (SDK
 * validates it); text stays for text-only clients. toolFail (isError) is
 * exempt from output validation by the SDK.
 */

import { z } from 'zod';

export interface ToolOkResult {
  content: Array<{ type: 'text'; text: string }>;
  structuredContent?: Record<string, unknown>;
  // SDK CallToolResult carries an index signature — keep structural compatibility
  [key: string]: unknown;
}

export function toolOk(payload: unknown): ToolOkResult {
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(payload, null, 2),
      },
    ],
  };
}

/**
 * Success with structuredContent — required when a tool declares outputSchema
 * (SDK validates structuredContent against it). Text kept for text clients.
 */
export function toolOkStructured(payload: object): ToolOkResult {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload as Record<string, unknown>,
  };
}

export function toolFail(toolName: string, err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  return {
    isError: true as const,
    content: [{ type: 'text' as const, text: `${toolName} failed: ${message}` }],
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function idOf(value: unknown): string | undefined {
  const rec = asRecord(value);
  if (!rec) return undefined;
  const direct = rec._id ?? rec.id;
  return typeof direct === 'string' && direct.length > 0 ? direct : undefined;
}

/**
 * TZD-41: stable entity id from a backend response — `_id` ?? `id`, including
 * one-level entity wrappers (result/task/todo/module/category/mutation/…).
 */
export function extractEntityId(raw: unknown): string | undefined {
  const rec = asRecord(raw);
  if (!rec) return undefined;
  const direct = idOf(rec);
  if (direct) return direct;
  for (const key of [
    'result',
    'data',
    'task',
    'todo',
    'module',
    'category',
    'mutation',
    'proposal',
    'composition',
    'draft',
  ] as const) {
    const nested = rec[key];
    if (nested && typeof nested === 'object') {
      const nid = idOf(nested);
      if (nid) return nid;
    }
  }
  return undefined;
}

/**
 * TZD-41: proposalId from a propose response — top-level `proposalId`, then
 * `result.*` / `proposal.*` (journal responses may expose `_id`/`id`).
 */
export function extractProposalId(raw: unknown): string | undefined {
  const rec = asRecord(raw);
  if (!rec) return undefined;
  for (const key of ['proposalId', '_id', 'id'] as const) {
    const v = rec[key];
    if (typeof v === 'string' && v.length > 0) return v;
  }
  for (const key of ['result', 'proposal'] as const) {
    const nested = asRecord(rec[key]);
    if (!nested) continue;
    for (const k2 of ['proposalId', '_id', 'id'] as const) {
      const v = nested[k2];
      if (typeof v === 'string' && v.length > 0) return v;
    }
  }
  return undefined;
}

/** TZD-41: propose success — top-level proposalId + full journal result. */
export function proposeEnvelope(journalResult: unknown): Record<string, unknown> {
  const proposalId = extractProposalId(journalResult);
  return {
    ok: true,
    result: journalResult,
    ...(proposalId ? { proposalId } : {}),
    // backward-compat one release (TZD-41): old clients read proposal.proposalId
    proposal: journalResult,
  };
}

/** TZD-41: SoT-create success — top-level id normalized from _id. */
export function createEnvelope(entityResult: unknown): Record<string, unknown> {
  const id = extractEntityId(entityResult);
  return {
    ok: true,
    result: entityResult,
    ...(id ? { id } : {}),
  };
}

/** TZD-41: confirm/cancel/undo — top-level id + proposalId when present. */
export function mutationEnvelope(result: unknown): Record<string, unknown> {
  const id = extractEntityId(result);
  const proposalId = extractProposalId(result);
  return {
    ok: true,
    result,
    ...(id ? { id } : {}),
    ...(proposalId ? { proposalId } : {}),
  };
}

// ── outputSchema (zod → JSON Schema via MCP SDK; TZD-41) ────────────────────

/** propose tools: agent sees top-level proposalId before the call. */
export const proposeEnvelopeSchema = {
  ok: z.literal(true),
  result: z.unknown(),
  proposalId: z.string().optional(),
  proposal: z.unknown(),
};

/** SoT-create tools: agent sees top-level id before the call. */
export const createEnvelopeSchema = {
  ok: z.literal(true),
  result: z.unknown(),
  id: z.string().optional(),
};

/** confirm/cancel/undo tools. */
export const mutationEnvelopeSchema = {
  ok: z.literal(true),
  result: z.unknown(),
  id: z.string().optional(),
  proposalId: z.string().optional(),
};

/** read tools ({ ok, path, result }) and gated commercial mutations. */
export const readEnvelopeSchema = {
  ok: z.literal(true),
  path: z.string(),
  result: z.unknown(),
};

/** batch propose/confirm/cancel (TZD-18): top-level summary keys stay. */
export const batchEnvelopeSchema = {
  ok: z.literal(true),
  result: z.unknown(),
  proposalIds: z.array(z.string()).optional(),
  applied: z.number().optional(),
  cancelled: z.number().optional(),
  failed: z.array(z.unknown()).optional(),
  errors: z.array(z.object({ index: z.number(), error: z.string() })).optional(),
};

/** local draft builders (propose_module_create / propose_composition_line). */
export const draftEnvelopeSchema = {
  ok: z.literal(true),
  proposal: z.unknown(),
  note: z.string(),
};

/** list_mutations / plain { ok, result } tools. */
export const plainOkSchema = {
  ok: z.literal(true),
  result: z.unknown(),
};

/** Minimal product fields for list/get (TZD-12). */
export function slimProduct(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw;
  const p = raw as Record<string, unknown>;
  return {
    _id: p._id,
    name: p.name,
    sku: p.sku,
    status: p.status,
    isActive: p.isActive,
    categoryId: p.categoryId,
    updatedAt: p.updatedAt,
  };
}

export function slimProductList(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object') return payload;
  const env = payload as Record<string, unknown>;
  if (Array.isArray(env.items)) {
    return {
      ...env,
      items: env.items.map(slimProduct),
    };
  }
  if (Array.isArray(payload)) {
    return (payload as unknown[]).map(slimProduct);
  }
  return slimProduct(payload);
}
