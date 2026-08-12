/**
 * Shared MCP tool result helpers.
 *
 * Successful responses use one machine-readable envelope while keeping legacy
 * fields in the JSON text for one compatibility wave (TZD-41).
 */

import { z } from 'zod';

/** Raw Zod shape accepted by McpServer.registerTool({ outputSchema }). */
export const TOOL_OUTPUT_SCHEMA = {
  ok: z.boolean(),
  result: z.unknown(),
  id: z.string().optional(),
  proposalId: z.string().optional(),
};

export interface ToolSuccessEnvelope {
  ok: boolean;
  result: unknown;
  id?: string;
  proposalId?: string;
  [key: string]: unknown;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function directString(record: Record<string, unknown> | null, keys: readonly string[]): string | undefined {
  if (!record) return undefined;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return undefined;
}

function firstIdentifier(value: unknown, keys: readonly string[]): string | undefined {
  const record = asRecord(value);
  const direct = directString(record, keys);
  if (direct) return direct;
  if (!record) return undefined;
  for (const nested of ['result', 'proposal', 'mutation', 'task', 'todo', 'category', 'composition', 'module', 'site', 'draft', 'data', 'entity']) {
    const found = firstIdentifier(record[nested], keys);
    if (found) return found;
  }
  if (keys.includes('proposalId') && Array.isArray(record.proposalIds)) {
    const first = record.proposalIds.find((item): item is string => typeof item === 'string' && item.length > 0);
    if (first) return first;
  }
  const arrays = ['proposed'];
  for (const key of arrays) {
    const valueAtKey = record[key];
    if (Array.isArray(valueAtKey)) {
      for (const item of valueAtKey) {
        const found = firstIdentifier(item, keys);
        if (found) return found;
      }
    }
  }
  return undefined;
}

function normalizeEntityId(value: unknown): unknown {
  const record = asRecord(value);
  if (!record || record.id !== undefined || typeof record._id !== 'string') return value;
  return { ...record, id: record._id };
}

/**
 * Converts legacy payloads into `{ ok, result, id?, proposalId? }` while
 * retaining their old named fields for one release so existing clients survive.
 */
export function normalizeToolSuccess(payload: unknown): ToolSuccessEnvelope {
  const input = asRecord(payload) ?? { value: payload };
  const result =
    input.result ??
    input.proposal ??
    input.mutation ??
    input.task ??
    input.todo ??
    input.category ??
    input.composition ??
    input.module ??
    input.site ??
    (asRecord(input.draft) ? input.draft : undefined) ??
    input;
  const proposalId =
    directString(input, ['proposalId']) ??
    firstIdentifier(input, ['proposalId']) ??
    firstIdentifier(input.proposal, ['proposalId', 'id', '_id']) ??
    firstIdentifier(input.result, ['proposalId']);
  const id =
    directString(input, ['id', 'textBlockId']) ??
    firstIdentifier(result, ['id', '_id', 'textBlockId']);

  return {
    ...input,
    ok: input.ok === false ? false : true,
    result: normalizeEntityId(result),
    ...(id ? { id } : {}),
    ...(proposalId ? { proposalId } : {}),
  };
}

export function toolOk(payload: unknown) {
  const structuredContent = normalizeToolSuccess(payload);
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(structuredContent, null, 2),
      },
    ],
    structuredContent,
  };
}

export function toolFail(toolName: string, err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  return {
    isError: true as const,
    content: [{ type: 'text' as const, text: `${toolName} failed: ${message}` }],
  };
}

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
