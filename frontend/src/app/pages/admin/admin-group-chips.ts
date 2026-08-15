import type { GroupChip } from '../../shared/page/pi-group-workspace.component';

/**
 * Admin Group Chip TOC - Устройства | Роли.
 *
 * TZ-AUTH-308: users chip removed; Devices is the only people-access UI path.
 * TZ-AUTH-304: `devices` повторно использует pageKey `admin-users`.
 * Роли - owner-only (pageKey `admin-roles`).
 */
export const ADMIN_TOC_CHIPS: readonly GroupChip[] = [
  {
    id: 'devices',
    label: 'Устройства',
    route: '/admin/devices',
    pageKey: 'admin-users',
  },
  { id: 'roles', label: 'Роли', route: '/admin/roles', pageKey: 'admin-roles' },
];

export const ADMIN_ENTITY_SECTION_CHIPS: readonly GroupChip[] = [];
