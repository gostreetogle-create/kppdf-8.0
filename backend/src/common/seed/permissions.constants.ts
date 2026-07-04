/**
 * Canonical permission keys for the entire app. Used to seed the
 * `permissions` collection on first start and to validate role updates.
 *
 * Format: `<section>:<action>` where action ∈ { read, write, admin }.
 */
export const PERMISSIONS = [
  // Identity
  { key: 'user:read', section: 'user', action: 'read', description: 'View users' },
  { key: 'user:write', section: 'user', action: 'write', description: 'Create/edit users' },
  { key: 'user:admin', section: 'user', action: 'admin', description: 'Delete users / change roles' },
  { key: 'role:read', section: 'role', action: 'read', description: 'View roles' },
  { key: 'role:write', section: 'role', action: 'write', description: 'Create/edit roles' },
  { key: 'role:admin', section: 'role', action: 'admin', description: 'Delete roles' },

  // Catalog
  { key: 'product:read', section: 'product', action: 'read', description: 'View products' },
  { key: 'product:write', section: 'product', action: 'write', description: 'Create/edit products' },
  { key: 'product:admin', section: 'product', action: 'admin', description: 'Delete products' },
  { key: 'category:read', section: 'category', action: 'read', description: 'View categories' },
  { key: 'category:write', section: 'category', action: 'write', description: 'Manage categories' },
  { key: 'material:read', section: 'material', action: 'read', description: 'View materials' },
  { key: 'material:write', section: 'material', action: 'write', description: 'Manage materials' },

  // Production
  { key: 'production:read', section: 'production', action: 'read', description: 'View production orders' },
  { key: 'production:write', section: 'production', action: 'write', description: 'Create/edit production orders' },
  { key: 'production:admin', section: 'production', action: 'admin', description: 'Close orders / manage workers' },

  // Warehouse
  { key: 'warehouse:read', section: 'warehouse', action: 'read', description: 'View stock' },
  { key: 'warehouse:write', section: 'warehouse', action: 'write', description: 'Move stock / reservations' },

  // Procurement
  { key: 'procurement:read', section: 'procurement', action: 'read', description: 'View PRs/POs/invoices' },
  { key: 'procurement:write', section: 'procurement', action: 'write', description: 'Create/edit PRs/POs' },

  // Sales
  { key: 'sales:read', section: 'sales', action: 'read', description: 'View quotations/contracts/orders' },
  { key: 'sales:write', section: 'sales', action: 'write', description: 'Create/edit sales' },
  { key: 'sales:admin', section: 'sales', action: 'admin', description: 'Confirm orders, manage shipments' },

  // Documents / Templates
  { key: 'document:read', section: 'document', action: 'read', description: 'View documents' },
  { key: 'document:write', section: 'document', action: 'write', description: 'Create document templates' },

  // Finance
  { key: 'finance:read', section: 'finance', action: 'read', description: 'View reconciliation / reports' },
  { key: 'finance:write', section: 'finance', action: 'write', description: 'Create reconciliation acts' },

  // System
  { key: 'system:read', section: 'system', action: 'read', description: 'View system settings' },
  { key: 'system:write', section: 'system', action: 'write', description: 'Edit system settings / flags' },
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number]['key'];
