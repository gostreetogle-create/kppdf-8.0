═══════════════════════════════════════════════════════════════
TZ-NX-REGISTRY-DETAIL-TO-FEATURES
═══════════════════════════════════════════════════════════════
SIZE S · LAYER 3 · PACK B8
ЗАВИСИМОСТИ: TZ-NX-REGISTRY-DETAIL-PANEL-FACADE archived
CONFLICT KEYS: frontend-nx/libs/features/src/lib/registries-shell/** ; frontend-nx/tsconfig.base.json ; frontend-nx/apps/kppdf-web/src/app/pages/registries/registry-detail-panel*
IMPLICIT: nx build kppdf-web
ЧТО: Move facade+panel (+spec) → `@kppdf/features/registries-shell`; thin re-export or direct import from registries-page. No apps/ imports from features.
AC: specs + nx build last 0.
Successor: TZ-NX-DESKTOP-PAIRING-FACADE
