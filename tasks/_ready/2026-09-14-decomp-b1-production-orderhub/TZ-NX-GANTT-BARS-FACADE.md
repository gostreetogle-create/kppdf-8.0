═══════════════════════════════════════════════════════════════
TZ-NX-GANTT-BARS-FACADE: Extract GanttBarsFacade in-place
═══════════════════════════════════════════════════════════════

РОЛЬ: Frontend Architect (mechanical extract)
ЗАВИСИМОСТИ: Нет (B1 Stream A start). STOP если Studio editor-decomp или другой kppdf-web TZ active.
**SIZE:** L · **PACK:** DECOMP-B1 · LAYER: 3
PAGES: /production (cockpit)
PAGE_DOCS: (production / gantt page docs if any — N/A ok with note)

CONFLICT KEYS: frontend-nx/apps/kppdf-web/src/app/pages/production/blocks/gantt-bars.component.ts ; frontend-nx/apps/kppdf-web/src/app/pages/production/blocks/gantt-bars.facade.ts

IMPLICIT CONFLICT: nx build kppdf-web

## BUILD INTEGRITY
Baseline + last: `cd frontend-nx && pnpm exec nx build kppdf-web`
Gates: tsc; `nx test kppdf-web --testPathPattern=gantt`; `nx test kppdf-web --testPathPattern=production-cockpit`

## ИСХОДНОЕ
`gantt-bars.component.ts` ~2539 LOC: inline template + row/tree computed + drag/resize sessions + work-detail. HTTP через outputs к cockpit. `ProductionReadFacade` — отдельный read model, **не** трогать в этом TZ.

## ЧТО ДЕЛАТЬ
1. CREATE `blocks/gantt-bars.facade.ts` — Signals + interaction sessions + row model helpers currently in component class (move as-is).
2. Component: `providers: [GanttBarsFacade]`, thin template wiring, re-export signal refs if specs cast component.
3. Keep `@Input`/`@Output` public contract of `GanttBarsComponent` stable for cockpit.
4. No geometry algorithm rewrites.

## НЕ ИЗМЕНЯТЬ
cockpit page logic; `production-read.facade.ts`; `gantt-bar.model.ts` (Phase A2); orders-rail; backend.

## AC
1. Facade exists; component has no private drag/session fields that belong in facade.
2. Instance-scoped providers.
3. Specs green: `gantt-bars.component.spec.ts`, `gantt-bar.model.spec.ts`, `gantt-workers-view.spec.ts`, `production-cockpit.page.spec.ts`, `production-cockpit.page.write.spec.ts`
4. nx build last exit 0.

Successor: `TZ-NX-GANTT-BARS-UTIL-UI`
