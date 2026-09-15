═══════════════════════════════════════════════════════════════
TZ-NX-ADMIN-ROLES-PAGE-FACADE
═══════════════════════════════════════════════════════════════
SIZE L · LAYER 3 · PACK B8
ЗАВИСИМОСТИ: TZ-NX-DESKTOP-PAIRING-TO-FEATURES archived
CONFLICT KEYS: frontend-nx/apps/kppdf-web/src/app/pages/admin-roles.page.ts ; frontend-nx/apps/kppdf-web/src/app/pages/admin-roles.facade.ts
IMPLICIT: nx build kppdf-web
ЧТО: Extract AdminRolesPageFacade (list load/CRUD open RoleForm already in features); page thin; reuse `@kppdf/features/admin-roles` for dialog.
AC: admin-roles specs green; nx build last 0.
Successor: TZ-NX-ADMIN-ROLES-TO-FEATURES
