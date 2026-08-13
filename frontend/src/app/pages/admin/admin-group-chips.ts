import type { GroupChip } from '../../shared/page/pi-group-workspace.component';

/**
 * Admin Group Chip TOC — Устройства | Пользователи | Роли.
 *
 * TZ-AUTH-304: `devices` повторно использует pageKey `admin-users` — страница
 * устройств входит в тот же admin page-ACL (backend PAGE_KEY не меняется).
 * Роли — owner-only (pageKey `admin-roles`, вырезается для non-owner в 306).
 */
export const ADMIN_TOC_CHIPS: readonly GroupChip[] = [
  {
    id: 'devices',
    label: 'Устройства',
    route: '/admin/devices',
    pageKey: 'admin-users',
  },
  {
    id: 'users',
    label: 'Пользователи',
    route: '/admin/users',
    pageKey: 'admin-users',
  },
  { id: 'roles', label: 'Роли', route: '/admin/roles', pageKey: 'admin-roles' },
];

export const ADMIN_ENTITY_SECTION_CHIPS: readonly GroupChip[] = [];
