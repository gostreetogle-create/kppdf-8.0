/**
 * TZ-256 §ШАГ 1 — Capabilities metadata.
 *
 * Frontend mirror of the canonical `PERMISSIONS` catalog in
 * `backend/src/common/seed/permissions.constants.ts`. Kept as a const
 * tuple so the union type `PermissionKey` derives from it (no second
 * copy of the section list).
 *
 * If the backend catalog grows or renames keys, this file MUST be
 * updated in lockstep — the audit script in `TZ-258` will surface
 * drift between the two.
 *
 * Format: `<section>:<action>` where action ∈ { read, write, admin }.
 */
export const PERMISSIONS_CATALOG = [
  // Identity
  { key: 'user:read', section: 'user', action: 'read' },
  { key: 'user:write', section: 'user', action: 'write' },
  { key: 'user:admin', section: 'user', action: 'admin' },
  { key: 'role:read', section: 'role', action: 'read' },
  { key: 'role:write', section: 'role', action: 'write' },
  { key: 'role:admin', section: 'role', action: 'admin' },

  // Catalog
  { key: 'product:read', section: 'product', action: 'read' },
  { key: 'product:write', section: 'product', action: 'write' },
  { key: 'product:admin', section: 'product', action: 'admin' },
  { key: 'category:read', section: 'category', action: 'read' },
  { key: 'category:write', section: 'category', action: 'write' },
  { key: 'material:read', section: 'material', action: 'read' },
  { key: 'material:write', section: 'material', action: 'write' },

  // Production
  { key: 'production:read', section: 'production', action: 'read' },
  { key: 'production:write', section: 'production', action: 'write' },
  { key: 'production:admin', section: 'production', action: 'admin' },

  // Warehouse
  { key: 'warehouse:read', section: 'warehouse', action: 'read' },
  { key: 'warehouse:write', section: 'warehouse', action: 'write' },

  // Procurement
  { key: 'procurement:read', section: 'procurement', action: 'read' },
  { key: 'procurement:write', section: 'procurement', action: 'write' },

  // Sales
  { key: 'sales:read', section: 'sales', action: 'read' },
  { key: 'sales:write', section: 'sales', action: 'write' },
  { key: 'sales:admin', section: 'sales', action: 'admin' },

  // Documents / Templates
  { key: 'document:read', section: 'document', action: 'read' },
  { key: 'document:write', section: 'document', action: 'write' },

  // Finance
  { key: 'finance:read', section: 'finance', action: 'read' },
  { key: 'finance:write', section: 'finance', action: 'write' },

  // System
  { key: 'system:read', section: 'system', action: 'read' },
  { key: 'system:write', section: 'system', action: 'write' },
] as const;

export type PermissionKey = (typeof PERMISSIONS_CATALOG)[number]['key'];
export type PermissionSection = (typeof PERMISSIONS_CATALOG)[number]['section'];
export type PermissionAction = (typeof PERMISSIONS_CATALOG)[number]['action'];

/**
 * Wildcard used in `permissions` arrays. Mirrors
 * `backend/src/common/contracts/rbac-contract.ts:PERMISSION_WILDCARD`.
 */
export const PERMISSION_WILDCARD = '*' as const;

/**
 * Convenience: full set of canonical keys. Useful for admin-bypass detection
 * (`effectivePermissions` returns the full set when role === 'admin').
 */
export const ALL_PERMISSION_KEYS: ReadonlySet<string> = new Set(
  PERMISSIONS_CATALOG.map((p) => p.key),
);
