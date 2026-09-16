═══════════════════════════════════════════════════════════════
TZ-NX-PRODUCTION-TO-FEATURES: Move production facades/UI/util → features
═══════════════════════════════════════════════════════════════

РОЛЬ: Frontend Architect
ЗАВИСИМОСТИ: TZ-NX-PRODUCTION-COCKPIT-FACADE archived
**SIZE:** S · **PACK:** DECOMP-B1 · LAYER: 3
PAGES: /production

CONFLICT KEYS: frontend-nx/libs/features/src/lib/production/** ; frontend-nx/tsconfig.base.json ; frontend-nx/apps/kppdf-web/src/app/pages/production/**

IMPLICIT CONFLICT: nx build kppdf-web

## ЧТО ДЕЛАТЬ
1. Scaffold `libs/features/src/lib/production/` + path `@kppdf/features/production`.
2. Move: `gantt-bars.facade`, `production-cockpit.facade`, `production-read.facade`, `gantt-bar.model`, `gantt-bars` UI, `orders-rail`, `production-scale-controls`, related specs.
3. Page stays in app; imports from `@kppdf/features/production`; ShellToolRail only in app page.
4. No app imports inside features lib.

## AC
- Specs green (production + gantt patterns)
- `rg apps/kppdf-web libs/features/src/lib/production` → 0
- nx build last 0

Successor: Stream B `TZ-NX-ORDER-HUB-FACADE`
