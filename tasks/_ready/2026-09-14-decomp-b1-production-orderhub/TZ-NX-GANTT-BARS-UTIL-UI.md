═══════════════════════════════════════════════════════════════
TZ-NX-GANTT-BARS-UTIL-UI: util + first dumb slices (in-place / features prep)
═══════════════════════════════════════════════════════════════

РОЛЬ: Frontend Architect
ЗАВИСИМОСТИ: TZ-NX-GANTT-BARS-FACADE archived
**SIZE:** S · **PACK:** DECOMP-B1 · LAYER: 3
PAGES: /production

CONFLICT KEYS: frontend-nx/apps/kppdf-web/src/app/pages/production/gantt-bar.model.ts ; frontend-nx/apps/kppdf-web/src/app/pages/production/blocks/gantt-bars.component.ts ; frontend-nx/apps/kppdf-web/src/app/pages/production/blocks/gantt-bars.facade.ts ; frontend-nx/apps/kppdf-web/src/app/pages/production/blocks/production-scale-controls.component.ts

IMPLICIT CONFLICT: nx build kppdf-web

## ЧТО ДЕЛАТЬ
1. Ensure pure helpers stay in `gantt-bar.model.ts` (already util) — only move if still duplicated inside facade/component.
2. Optional thin presentational extracts **without** behavior change (only if reduces gantt-bars template clearly): e.g. unassigned banner, scale controls already separate — do not force micro-split of bars layer yet (PARK deep bar-layer split).
3. Update imports; keep selectors/`data-test`.

## НЕ
Rewrite drag math; move to libs/features yet (that's A4); change cockpit.

## AC
- Specs: gantt* + production-cockpit* green
- nx build last 0
- Document in checklist what stayed PARK for deep UI split

Successor: `TZ-NX-PRODUCTION-COCKPIT-FACADE`
