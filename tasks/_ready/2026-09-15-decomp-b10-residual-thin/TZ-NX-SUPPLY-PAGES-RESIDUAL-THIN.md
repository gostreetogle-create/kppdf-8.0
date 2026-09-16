═══════════════════════════════════════════════════════════════
TZ-NX-SUPPLY-PAGES-RESIDUAL-THIN
═══════════════════════════════════════════════════════════════
SIZE S · LAYER 3 · PACK B10
ЗАВИСИМОСТИ: TZ-NX-STUDIO-EDITOR-PAGE-THIN archived
CONFLICT KEYS: frontend-nx/apps/kppdf-web/src/app/pages/supply/supply.page.ts ; frontend-nx/apps/kppdf-web/src/app/pages/supply-requests/supply-requests.page.ts ; frontend-nx/libs/features/src/lib/supply/**
IMPLICIT: nx build kppdf-web

ЧТО: SupplyFacade already exists — extract remaining inline template chunks to dumb UI under `@kppdf/features/supply` if still fat; same for supply-requests page. No status/transition changes.

AC: supply* specs green; nx build last 0.
Successor: TZ-NX-PRODUCTION-COCKPIT-RESIDUAL-THIN
