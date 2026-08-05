import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Decode \\uXXXX sequences in a plain ASCII template string. */
function decode(s) {
  return s.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function toEscapedSource(s) {
  return [...s]
    .map((c) => {
      const cp = c.codePointAt(0);
      return cp > 127 ? '\\u' + cp.toString(16).padStart(4, '0') : c;
    })
    .join('');
}

function escObj(obj) {
  const lines = Object.entries(obj).map(
    ([k, v]) => `  '${k}': '${toEscapedSource(v)}',`,
  );
  return '{\n' + lines.join('\n') + '\n}';
}

// All RU text stored as \\u escapes in THIS file (ASCII-only source).
const PERM_LABELS = {
  'user:read': decode('\\u0421\\u043c\\u043e\\u0442\\u0440\\u0435\\u0442\\u044c \\u0441\\u043f\\u0438\\u0441\\u043e\\u043a \\u043f\\u043e\\u043b\\u044c\\u0437\\u043e\\u0432\\u0430\\u0442\\u0435\\u043b\\u0435\\u0439'),
  'user:write': decode('\\u0421\\u043e\\u0437\\u0434\\u0430\\u0432\\u0430\\u0442\\u044c \\u0438 \\u043f\\u0440\\u0430\\u0432\\u0438\\u0442\\u044c \\u043f\\u043e\\u043b\\u044c\\u0437\\u043e\\u0432\\u0430\\u0442\\u0435\\u043b\\u0435\\u0439'),
  'user:admin': decode('\\u0423\\u0434\\u0430\\u043b\\u044f\\u0442\\u044c \\u043f\\u043e\\u043b\\u044c\\u0437\\u043e\\u0432\\u0430\\u0442\\u0435\\u043b\\u0435\\u0439 \\u0438 \\u043c\\u0435\\u043d\\u044f\\u0442\\u044c \\u0440\\u043e\\u043b\\u0438'),
  'role:read': decode('\\u0421\\u043c\\u043e\\u0442\\u0440\\u0435\\u0442\\u044c \\u0441\\u043f\\u0438\\u0441\\u043e\\u043a \\u0440\\u043e\\u043b\\u0435\\u0439'),
  'role:write': decode('\\u0421\\u043e\\u0437\\u0434\\u0430\\u0432\\u0430\\u0442\\u044c \\u0438 \\u043f\\u0440\\u0430\\u0432\\u0438\\u0442\\u044c \\u0440\\u043e\\u043b\\u0438'),
  'role:admin': decode('\\u0423\\u0434\\u0430\\u043b\\u044f\\u0442\\u044c \\u0440\\u043e\\u043b\\u0438'),
  'product:read': decode('\\u0421\\u043c\\u043e\\u0442\\u0440\\u0435\\u0442\\u044c \\u043f\\u0440\\u043e\\u0434\\u0443\\u043a\\u0446\\u0438\\u044e'),
  'product:write': decode('\\u0421\\u043e\\u0437\\u0434\\u0430\\u0432\\u0430\\u0442\\u044c \\u0438 \\u043f\\u0440\\u0430\\u0432\\u0438\\u0442\\u044c \\u043f\\u0440\\u043e\\u0434\\u0443\\u043a\\u0446\\u0438\\u044e'),
  'product:admin': decode('\\u0423\\u0434\\u0430\\u043b\\u044f\\u0442\\u044c \\u043f\\u0440\\u043e\\u0434\\u0443\\u043a\\u0446\\u0438\\u044e'),
  'category:read': decode('\\u0421\\u043c\\u043e\\u0442\\u0440\\u0435\\u0442\\u044c \\u043a\\u0430\\u0442\\u0435\\u0433\\u043e\\u0440\\u0438\\u0438'),
  'category:write': decode('\\u0423\\u043f\\u0440\\u0430\\u0432\\u043b\\u044f\\u0442\\u044c \\u043a\\u0430\\u0442\\u0435\\u0433\\u043e\\u0440\\u0438\\u044f\\u043c\\u0438'),
  'material:read': decode('\\u0421\\u043c\\u043e\\u0442\\u0440\\u0435\\u0442\\u044c \\u043c\\u0430\\u0442\\u0435\\u0440\\u0438\\u0430\\u043b\\u044b'),
  'material:write': decode('\\u0423\\u043f\\u0440\\u0430\\u0432\\u043b\\u044f\\u0442\\u044c \\u043c\\u0430\\u0442\\u0435\\u0440\\u0438\\u0430\\u043b\\u0430\\u043c\\u0438'),
  'production:read': decode('\\u0421\\u043c\\u043e\\u0442\\u0440\\u0435\\u0442\\u044c \\u043f\\u0440\\u043e\\u0438\\u0437\\u0432\\u043e\\u0434\\u0441\\u0442\\u0432\\u0435\\u043d\\u043d\\u044b\\u0435 \\u0437\\u0430\\u043a\\u0430\\u0437\\u044b'),
  'production:write': decode('\\u0421\\u043e\\u0437\\u0434\\u0430\\u0432\\u0430\\u0442\\u044c \\u0438 \\u043f\\u0440\\u0430\\u0432\\u0438\\u0442\\u044c \\u043f\\u0440\\u043e\\u0438\\u0437\\u0432\\u043e\\u0434\\u0441\\u0442\\u0432\\u0435\\u043d\\u043d\\u044b\\u0435 \\u0437\\u0430\\u043a\\u0430\\u0437\\u044b'),
  'production:admin': decode('\\u0417\\u0430\\u043a\\u0440\\u044b\\u0432\\u0430\\u0442\\u044c \\u0437\\u0430\\u043a\\u0430\\u0437\\u044b \\u0438 \\u0443\\u043f\\u0440\\u0430\\u0432\\u043b\\u044f\\u0442\\u044c \\u0438\\u0441\\u043f\\u043e\\u043b\\u043d\\u0438\\u0442\\u0435\\u043b\\u044f\\u043c\\u0438'),
  'warehouse:read': decode('\\u0421\\u043c\\u043e\\u0442\\u0440\\u0435\\u0442\\u044c \\u043e\\u0441\\u0442\\u0430\\u0442\\u043a\\u0438 \\u0438 \\u0441\\u043a\\u043b\\u0430\\u0434\\u044b'),
  'warehouse:write': decode('\\u0414\\u0432\\u0438\\u0436\\u0435\\u043d\\u0438\\u044f \\u0441\\u043a\\u043b\\u0430\\u0434\\u0430 \\u0438 \\u0440\\u0435\\u0437\\u0435\\u0440\\u0432\\u044b'),
  'procurement:read': decode('\\u0421\\u043c\\u043e\\u0442\\u0440\\u0435\\u0442\\u044c \\u0437\\u0430\\u043a\\u0443\\u043f\\u043a\\u0438 \\u0438 \\u0441\\u0447\\u0435\\u0442\\u0430'),
  'procurement:write': decode('\\u0421\\u043e\\u0437\\u0434\\u0430\\u0432\\u0430\\u0442\\u044c \\u0438 \\u043f\\u0440\\u0430\\u0432\\u0438\\u0442\\u044c \\u0437\\u0430\\u043a\\u0443\\u043f\\u043a\\u0438'),
  'sales:read': decode('\\u0421\\u043c\\u043e\\u0442\\u0440\\u0435\\u0442\\u044c \\u041a\\u041f, \\u0434\\u043e\\u0433\\u043e\\u0432\\u043e\\u0440\\u044b \\u0438 \\u0437\\u0430\\u043a\\u0430\\u0437\\u044b'),
  'sales:write': decode('\\u0421\\u043e\\u0437\\u0434\\u0430\\u0432\\u0430\\u0442\\u044c \\u0438 \\u043f\\u0440\\u0430\\u0432\\u0438\\u0442\\u044c \\u043f\\u0440\\u043e\\u0434\\u0430\\u0436\\u0438'),
  'sales:admin': decode('\\u041f\\u043e\\u0434\\u0442\\u0432\\u0435\\u0440\\u0436\\u0434\\u0430\\u0442\\u044c \\u0437\\u0430\\u043a\\u0430\\u0437\\u044b \\u0438 \\u043e\\u0442\\u0433\\u0440\\u0443\\u0437\\u043a\\u0438'),
  'document:read': decode('\\u0421\\u043c\\u043e\\u0442\\u0440\\u0435\\u0442\\u044c \\u0434\\u043e\\u043a\\u0443\\u043c\\u0435\\u043d\\u0442\\u044b \\u0438 \\u0448\\u0430\\u0431\\u043b\\u043e\\u043d\\u044b'),
  'document:write': decode('\\u0421\\u043e\\u0437\\u0434\\u0430\\u0432\\u0430\\u0442\\u044c \\u0448\\u0430\\u0431\\u043b\\u043e\\u043d\\u044b \\u0438 \\u0434\\u043e\\u043a\\u0443\\u043c\\u0435\\u043d\\u0442\\u044b'),
  'finance:read': decode('\\u0421\\u043c\\u043e\\u0442\\u0440\\u0435\\u0442\\u044c \\u0441\\u0432\\u0435\\u0440\\u043a\\u0438 \\u0438 \\u043e\\u0442\\u0447\\u0451\\u0442\\u044b'),
  'finance:write': decode('\\u0421\\u043e\\u0437\\u0434\\u0430\\u0432\\u0430\\u0442\\u044c \\u0430\\u043a\\u0442\\u044b \\u0441\\u0432\\u0435\\u0440\\u043a\\u0438'),
  'system:read': decode('\\u0421\\u043c\\u043e\\u0442\\u0440\\u0435\\u0442\\u044c \\u0441\\u0438\\u0441\\u0442\\u0435\\u043c\\u043d\\u044b\\u0435 \\u043d\\u0430\\u0441\\u0442\\u0440\\u043e\\u0439\\u043a\\u0438'),
  'system:write': decode('\\u041c\\u0435\\u043d\\u044f\\u0442\\u044c \\u0441\\u0438\\u0441\\u0442\\u0435\\u043c\\u043d\\u044b\\u0435 \\u043d\\u0430\\u0441\\u0442\\u0440\\u043e\\u0439\\u043a\\u0438 \\u0438 \\u0444\\u043b\\u0430\\u0433\\u0438'),
};

const GROUP_TITLES = {
  admin: decode('\\u0410\\u0434\\u043c\\u0438\\u043d\\u0438\\u0441\\u0442\\u0440\\u0438\\u0440\\u043e\\u0432\\u0430\\u043d\\u0438\\u0435'),
  catalog: decode('\\u041a\\u0430\\u0442\\u0430\\u043b\\u043e\\u0433'),
  warehouse: decode('\\u0421\\u043a\\u043b\\u0430\\u0434'),
  sales: decode('\\u041f\\u0440\\u043e\\u0434\\u0430\\u0436\\u0438 \\u0438 \\u0441\\u0434\\u0435\\u043b\\u043a\\u0438'),
  production: decode('\\u041f\\u0440\\u043e\\u0438\\u0437\\u0432\\u043e\\u0434\\u0441\\u0442\\u0432\\u043e'),
  procurement: decode('\\u0417\\u0430\\u043a\\u0443\\u043f\\u043a\\u0438'),
  document: decode('\\u0414\\u043e\\u043a\\u0443\\u043c\\u0435\\u043d\\u0442\\u044b'),
  finance: decode('\\u0424\\u0438\\u043d\\u0430\\u043d\\u0441\\u044b'),
  system: decode('\\u0421\\u0438\\u0441\\u0442\\u0435\\u043c\\u0430'),
};

const ACTION_RU = {
  read: decode('\\u041f\\u0440\\u043e\\u0441\\u043c\\u043e\\u0442\\u0440'),
  write: decode('\\u0418\\u0437\\u043c\\u0435\\u043d\\u0435\\u043d\\u0438\\u0435'),
  admin: decode('\\u041f\\u043e\\u043b\\u043d\\u044b\\u0439 \\u0434\\u043e\\u0441\\u0442\\u0443\\u043f'),
};

const copy = {
  permissionsHeading: decode('\\u041f\\u0440\\u0430\\u0432\\u0430 \\u0434\\u043e\\u0441\\u0442\\u0443\\u043f\\u0430'),
  logicHint: decode(
    '\\u0413\\u0430\\u043b\\u043e\\u0447\\u043a\\u0438 \\u2014 \\u0447\\u0442\\u043e \\u0440\\u043e\\u043b\\u044c \\u043c\\u043e\\u0436\\u0435\\u0442 \\u0434\\u0435\\u043b\\u0430\\u0442\\u044c \\u0432 \\u0440\\u0430\\u0437\\u0434\\u0435\\u043b\\u0430\\u0445 ERP (\\u0441\\u043c\\u043e\\u0442\\u0440\\u0435\\u0442\\u044c / \\u043c\\u0435\\u043d\\u044f\\u0442\\u044c / \\u043f\\u043e\\u043b\\u043d\\u044b\\u0439 \\u0434\\u043e\\u0441\\u0442\\u0443\\u043f). \\u042d\\u0442\\u043e \\u043d\\u0435 \\u0441\\u043f\\u0438\\u0441\\u043e\\u043a \\u043f\\u0443\\u043d\\u043a\\u0442\\u043e\\u0432 \\u043c\\u0435\\u043d\\u044e; \\u0432\\u0438\\u0434\\u0438\\u043c\\u043e\\u0441\\u0442\\u044c \\u044d\\u043a\\u0440\\u0430\\u043d\\u043e\\u0432 \\u043d\\u0430\\u0441\\u0442\\u0440\\u0430\\u0438\\u0432\\u0430\\u0435\\u0442\\u0441\\u044f \\u043e\\u0442\\u0434\\u0435\\u043b\\u044c\\u043d\\u043e.',
  ),
  selectAll: decode('\\u0432\\u044b\\u0431\\u0440\\u0430\\u0442\\u044c \\u0432\\u0441\\u0435'),
  clearAll: decode('\\u0441\\u043d\\u044f\\u0442\\u044c \\u0432\\u0441\\u0435'),
};

const labelsTs = `/** RU labels for admin role permission matrix (\\\\u-escaped, encoding-safe). */
export const PERMISSION_LABEL_RU: Record<string, string> = ${escObj(PERM_LABELS)};

export const PERMISSION_GROUP_TITLE_RU: Record<string, string> = ${escObj(GROUP_TITLES)};

export const PERMISSION_ACTION_RU: Record<string, string> = ${escObj(ACTION_RU)};

export const ROLE_FORM_COPY = {
  permissionsHeading: '${toEscapedSource(copy.permissionsHeading)}',
  logicHint: '${toEscapedSource(copy.logicHint)}',
  selectAll: '${toEscapedSource(copy.selectAll)}',
  clearAll: '${toEscapedSource(copy.clearAll)}',
} as const;

export function permissionLabelRu(key: string, fallback?: string): string {
  return PERMISSION_LABEL_RU[key] ?? fallback ?? key;
}
`;

fs.writeFileSync(
  path.join(root, 'frontend/src/app/pages/admin/permission-labels.ru.ts'),
  labelsTs,
  'utf8',
);

const be = `/**
 * Canonical permission keys for the entire app. Used to seed the
 * \`permissions\` collection on first start and to validate role updates.
 *
 * Format: \`<section>:<action>\` where action is read|write|admin.
 * Human RU labels for admin UI: frontend/.../permission-labels.ru.ts
 */
export const PERMISSIONS = [
  { key: 'user:read', section: 'user', action: 'read', description: 'View users' },
  { key: 'user:write', section: 'user', action: 'write', description: 'Create/edit users' },
  { key: 'user:admin', section: 'user', action: 'admin', description: 'Delete users / change roles' },
  { key: 'role:read', section: 'role', action: 'read', description: 'View roles' },
  { key: 'role:write', section: 'role', action: 'write', description: 'Create/edit roles' },
  { key: 'role:admin', section: 'role', action: 'admin', description: 'Delete roles' },
  { key: 'product:read', section: 'product', action: 'read', description: 'View products' },
  { key: 'product:write', section: 'product', action: 'write', description: 'Create/edit products' },
  { key: 'product:admin', section: 'product', action: 'admin', description: 'Delete products' },
  { key: 'category:read', section: 'category', action: 'read', description: 'View categories' },
  { key: 'category:write', section: 'category', action: 'write', description: 'Manage categories' },
  { key: 'material:read', section: 'material', action: 'read', description: 'View materials' },
  { key: 'material:write', section: 'material', action: 'write', description: 'Manage materials' },
  { key: 'production:read', section: 'production', action: 'read', description: 'View production orders' },
  { key: 'production:write', section: 'production', action: 'write', description: 'Create/edit production orders' },
  { key: 'production:admin', section: 'production', action: 'admin', description: 'Close orders / manage workers' },
  { key: 'warehouse:read', section: 'warehouse', action: 'read', description: 'View stock' },
  { key: 'warehouse:write', section: 'warehouse', action: 'write', description: 'Move stock / reservations' },
  { key: 'procurement:read', section: 'procurement', action: 'read', description: 'View PRs/POs/invoices' },
  { key: 'procurement:write', section: 'procurement', action: 'write', description: 'Create/edit PRs/POs' },
  { key: 'sales:read', section: 'sales', action: 'read', description: 'View quotations/contracts/orders' },
  { key: 'sales:write', section: 'sales', action: 'write', description: 'Create/edit sales' },
  { key: 'sales:admin', section: 'sales', action: 'admin', description: 'Confirm orders, manage shipments' },
  { key: 'document:read', section: 'document', action: 'read', description: 'View documents' },
  { key: 'document:write', section: 'document', action: 'write', description: 'Create document templates' },
  { key: 'finance:read', section: 'finance', action: 'read', description: 'View reconciliation / reports' },
  { key: 'finance:write', section: 'finance', action: 'write', description: 'Create reconciliation acts' },
  { key: 'system:read', section: 'system', action: 'read', description: 'View system settings' },
  { key: 'system:write', section: 'system', action: 'write', description: 'Edit system settings / flags' },
] as const;

export const PAGE_KEYS = [
  'products', 'modules', 'materials', 'work-types',
  'organizations', 'proposals', 'contracts', 'orders',
  'dictionaries', 'categories', 'doc-template-categories', 'color-references',
  'doc-templates', 'doc-texts', 'doc-tables', 'doc-documents',
  'inventory', 'storage-items', 'stock-movements',
  'people',
  'admin-users', 'admin-roles',
] as const;

export type PageKey = (typeof PAGE_KEYS)[number];
export type PermissionKey = (typeof PERMISSIONS)[number]['key'];
`;

fs.writeFileSync(path.join(root, 'backend/src/common/seed/permissions.constants.ts'), be, 'utf8');
console.log('generated permission-labels.ru.ts + restored permissions.constants.ts');
