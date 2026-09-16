═══════════════════════════════════════════════════════════════
TZ-NX-DESKTOP-PAIRING-TO-FEATURES
═══════════════════════════════════════════════════════════════
SIZE S · LAYER 3 · PACK B8
ЗАВИСИМОСТИ: TZ-NX-DESKTOP-PAIRING-FACADE archived
CONFLICT KEYS: frontend-nx/libs/features/src/lib/desktop/** ; frontend-nx/tsconfig.base.json ; frontend-nx/apps/kppdf-web/src/app/pages/desktop/**
IMPLICIT: nx build kppdf-web
ЧТО: `@kppdf/features/desktop` — facade+dialog+specs; app imports from features.
AC: specs + nx build last 0.
Successor: TZ-NX-ADMIN-ROLES-PAGE-FACADE
