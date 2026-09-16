═══════════════════════════════════════════════════════════════
TZ-NX-PRODUCTION-COCKPIT-FACADE: Cockpit write/UI facade (keep ReadFacade)
═══════════════════════════════════════════════════════════════

РОЛЬ: Frontend Architect
ЗАВИСИМОСТИ: TZ-NX-GANTT-BARS-UTIL-UI archived
**SIZE:** L · **PACK:** DECOMP-B1 · LAYER: 3
PAGES: /production

CONFLICT KEYS: frontend-nx/apps/kppdf-web/src/app/pages/production/production-cockpit.page.ts ; frontend-nx/apps/kppdf-web/src/app/pages/production/production-cockpit.facade.ts ; frontend-nx/apps/kppdf-web/src/app/pages/production/production-cockpit.context.ts

IMPLICIT CONFLICT: nx build kppdf-web

## ИСХОДНОЕ
`production-cockpit.page.ts` ~910 LOC owns selection/expand, optimistic writes, shell tools, flyouts. Already uses `ProductionReadFacade` + `ProductionCockpitContext` + child `GanttBars` / `OrdersRail`.

## ЧТО ДЕЛАТЬ
1. CREATE `production-cockpit.facade.ts` — move write handlers, optimistic apply/restore, expand/selection signals, left-tool flyout state, refresh orchestration **as-is**.
2. Page: `providers: [ProductionCockpitFacade]` (+ keep ReadFacade route/providers as today), thin template, ShellToolRail wiring stays on page calling facade.
3. **Do not** merge into `ProductionReadFacade` (read-only contract).
4. Context: keep or thin — if context only mirrors facade signals, prefer facade as SoT (minimal change; no drive-by rewrite).

## НЕ
Change GanttBars public I/O; change estimate/worker PATCH semantics; backend.

## AC
1. Page thin; cockpit facade owns write queue/optimistic paths that lived on page.
2. Specs: `production-cockpit.page.spec.ts`, `production-cockpit.page.write.spec.ts`, `production-read.facade.spec.ts`, gantt* still green
3. nx build last 0

Successor: `TZ-NX-PRODUCTION-TO-FEATURES`
