import type { GroupChip } from '../../shared/page/pi-group-workspace.component';

/** Admin Group Chip TOC - Users | Roles */
export const ADMIN_TOC_CHIPS: readonly GroupChip[] = [
  {
    id: 'users',
    label: 'Пользователи',
    route: '/admin/users',
    pageKey: 'admin-users',
  },
  { id: 'roles', label: 'Роли', route: '/admin/roles', pageKey: 'admin-roles' },
];

export const ADMIN_ENTITY_SECTION_CHIPS: readonly GroupChip[] = [];
