import type { GroupChip } from '../../shared/page/pi-group-workspace.component';

/** Admin Group Chip TOC - Users | Roles (commit on main; do not leave as local WIP). */
export const ADMIN_TOC_CHIPS: readonly GroupChip[] = [
  {
    id: 'users',
    label: '\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0438',
    route: '/admin/users',
  },
  { id: 'roles', label: '\u0420\u043e\u043b\u0438', route: '/admin/roles' },
];

export const ADMIN_ENTITY_SECTION_CHIPS: readonly GroupChip[] = [];
