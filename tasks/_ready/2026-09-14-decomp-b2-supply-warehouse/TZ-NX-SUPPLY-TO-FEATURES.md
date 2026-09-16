═══════════════════════════════════════════════════════════════
TZ-NX-SUPPLY-TO-FEATURES: supply + supply-requests → @kppdf/features/supply
═══════════════════════════════════════════════════════════════

РОЛЬ: Frontend Architect
ЗАВИСИМОСТИ: TZ-NX-SUPPLY-REQUESTS-FACADE archived
**SIZE:** S · **PACK:** DECOMP-B2 · LAYER: 3
PAGES: /supply ; /supply-requests

CONFLICT KEYS: frontend-nx/libs/features/src/lib/supply/** ; frontend-nx/tsconfig.base.json ; frontend-nx/apps/kppdf-web/src/app/pages/supply/** ; frontend-nx/apps/kppdf-web/src/app/pages/supply-requests/**

IMPLICIT CONFLICT: nx build kppdf-web

## ЧТО ДЕЛАТЬ
1. Path `@kppdf/features/supply` — move both facades + dumb UI + dialogs + specs.
2. Pages remain in app as thin glue.
3. No apps/ imports from features.

## AC
- All supply* specs green; nx build last 0

Successor: TZ-NX-WAREHOUSE-PAGES-FACADE
