import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const p = path.join(root, 'frontend/src/app/pages/admin/role-form-dialog.component.ts');
let s = fs.readFileSync(p, 'utf8');

if (!s.includes('permission-labels.ru')) {
  s = s.replace(
    /import \{\s*PermissionsCatalogService,[\s\S]*?\} from '\.\.\/\.\.\/shared\/services\/pi-permissions\.service';/,
    `import {
  PermissionsCatalogService,
  type PermissionCatalogEntry,
  type PermissionSection,
} from '../../shared/services/pi-permissions.service';
import {
  PERMISSION_ACTION_RU,
  PERMISSION_GROUP_TITLE_RU,
  ROLE_FORM_COPY,
  permissionLabelRu,
} from './permission-labels.ru';`,
  );
}

s = s.replace(
  /const ACTION_RU: Record<string, string> = \{[\s\S]*?\};/,
  'const ACTION_RU = PERMISSION_ACTION_RU;',
);

s = s.replace(
  /const SECTION_TO_GROUP: Record<string, \{ id: string; title: string \}> = \{[\s\S]*?\};/,
  `const SECTION_TO_GROUP: Record<string, string> = {
  user: 'admin',
  role: 'admin',
  product: 'catalog',
  category: 'catalog',
  material: 'catalog',
  warehouse: 'warehouse',
  sales: 'sales',
  production: 'production',
  procurement: 'procurement',
  document: 'document',
  finance: 'finance',
  system: 'system',
};`,
);

s = s.replace(
  /<span class="field__label">[^<]*<\/span>\s*<p class="role-form__logic-hint">[\s\S]*?<\/p>/,
  `<span class="field__label">{{ copy.permissionsHeading }}</span>
                <p class="role-form__logic-hint">{{ copy.logicHint }}</p>`,
);

s = s.replace(
  /\{\{ groupAllSelected\(g\) \? '[^']*' : '[^']*' \}\}/,
  '{{ groupAllSelected(g) ? copy.clearAll : copy.selectAll }}',
);

s = s.replace(
  /<span class="role-form__perm-title">\{\{ p\.description \}\}<\/span>/,
  '<span class="role-form__perm-title">{{ permissionLabel(p.key) }}</span>',
);

s = s.replace(
  /const meta = SECTION_TO_GROUP\[s\.section\] \?\? \{[\s\S]*?\};/,
  `const groupId = SECTION_TO_GROUP[s.section] ?? s.section;
    const meta = {
      id: groupId,
      title: PERMISSION_GROUP_TITLE_RU[groupId] ?? groupId,
    };`,
);

if (!s.includes('protected readonly copy')) {
  s = s.replace(
    'protected readonly submitting = signal(false);',
    `protected readonly submitting = signal(false);
  protected readonly copy = ROLE_FORM_COPY;

  protected permissionLabel(key: string): string {
    return permissionLabelRu(key);
  }`,
  );
}

fs.writeFileSync(p, s, 'utf8');
console.log('patched ok');
