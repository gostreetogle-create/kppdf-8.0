/**
 * Shared MCP tool result helpers (EN messages, consistent with TZD-11 ping).
 */

export function toolOk(payload: unknown) {
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(payload, null, 2),
      },
    ],
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
