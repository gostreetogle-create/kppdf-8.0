═══════════════════════════════════════════════════════════════
TZ-NX-PRODUCTION-COCKPIT-RESIDUAL-THIN
═══════════════════════════════════════════════════════════════
SIZE S · LAYER 3 · PACK B10
ЗАВИСИМОСТИ: TZ-NX-SUPPLY-PAGES-RESIDUAL-THIN archived
CONFLICT KEYS: frontend-nx/apps/kppdf-web/src/app/pages/production/production-cockpit.page.ts ; frontend-nx/libs/features/src/lib/production/**
IMPLICIT: nx build kppdf-web

ЧТО: Cockpit already has read+write facades — thin residual page template/chrome only; ShellToolRail stays in app. No gantt write semantics change.

AC: production-cockpit* + gantt* specs green; nx build last 0; STOP — decomp residual wave complete.

PARK: forms/foundations showcase · Deploy/Wipe/SSH
