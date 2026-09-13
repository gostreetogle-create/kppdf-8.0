import type { GroupChip } from '@kppdf/features';

/**
 * Admin Group Chip TOC - Устройства | Роли | Наши организации.
 *
 * TZ-AUTH-308: users chip removed; Devices is the only people-access UI path.
 * TZ-AUTH-304: `devices` повторно использует pageKey `admin-users`.
 * Роли - owner-only (pageKey `admin-roles`).
 * TZ-NX-DOCSTUDIO-ISSUER-SELECT: «Наши организации» — было мёртвым пунктом в
 * `nav-categories.ts` (`NAV_CATEGORIES.items` там рендерится только как
 * `entryPath` для шапки; отдельные `items[]` нигде не выводятся как
 * кликабельные ссылки — этот TOC-ряд, а не тот массив, и есть реальная
 * видимая навигация раздела «Админ»). Ведёт прямо на живой под-маршрут
 * реестра (`registries.routes.ts`'s `UrlMatcher` уже его обслуживает).
 */
export const ADMIN_TOC_CHIPS: readonly GroupChip[] = [
  {
    id: 'devices',
    label: 'Устройства',
    route: '/admin/devices',
    pageKey: 'admin-users',
  },
  { id: 'roles', label: 'Роли', route: '/admin/roles', pageKey: 'admin-roles' },
  {
    id: 'organizations',
    label: 'Наши организации',
    route: '/registries/organizations',
    pageKey: 'organizations',
  },
];

export const ADMIN_ENTITY_SECTION_CHIPS: readonly GroupChip[] = [];
