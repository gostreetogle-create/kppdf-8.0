═══════════════════════════════════════════════════════════════
TZ-NX-ADMIN-ROLES-TO-FEATURES
═══════════════════════════════════════════════════════════════
SIZE S · LAYER 3 · PACK B8
ЗАВИСИМОСТИ: TZ-NX-ADMIN-ROLES-PAGE-FACADE archived
CONFLICT KEYS: frontend-nx/libs/features/src/lib/admin-roles/** ; frontend-nx/apps/kppdf-web/src/app/pages/admin-roles*
IMPLICIT: nx build kppdf-web
ЧТО: Move page facade (+ page UI if clean) into `@kppdf/features/admin-roles`; thin route page in app. STOP — B8 done.
AC: specs + nx build last 0.
