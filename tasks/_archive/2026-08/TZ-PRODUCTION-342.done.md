# TZ-PRODUCTION-342.done — Gantt tree Order → Product → Module → WorkType

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T21:10:43Z
closed_by: local-executor-composer (kppdf-executor-loop)
TZ: TZ-PRODUCTION-342
WAVE: WAVE-GANTT-IA-PRODUCT-MODULE
DEP: TZ-PRODUCTION-339/340/341 DONE
Cursor_verdict: N/A (TZ does not require review gate)

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`)
  - tests: PASS (`pnpm exec jest --testPathPattern="gantt-bar.model.spec|gantt-bars.component.spec|production-cockpit.page.spec"` — 3 suites / 97 tests)
  - checklist: DONE
  - progress.md: UPDATED
  - status synchronization: PASS
  - deploy: NOT RUN

## Outcome

- `buildGanttTreeBars(work, expandedOrderIds, expandedProductIds, expandedModuleIds)`:
  collapsed order → order summary only;
  expand order → **product** summaries;
  expand product → **module** summaries;
  expand module → work bars (+ existing work-detail cascade).
- Summary ids: `summary:{orderId}`, `product:{orderId}:{item}`, `module:{orderId}:{item}:{moduleId}`.
- Spans = min…max children (order/product/module); estimate day math / `buildGanttBars` unchanged.
- Context/page: `expandedProductIds` / `expandedModuleIds`; clear on canvas dismiss with orders; collapse parent prunes children.
- gantt-bars: ▸ on order/product/module; labels order number / product(+qty) / module / WT; product/module not resizable/movable; WT drag/resize when module expanded.
- Worker lens path (`buildWorkerTreeBars`) untouched (344).

## known_limitation

- Worker IA = 344; product-without-modules = 345; RU toggle wording = 343.

## Critical files

- `frontend/src/app/pages/production/gantt-bar.model.ts`
- `frontend/src/app/pages/production/gantt-bar.model.spec.ts`
- `frontend/src/app/pages/production/blocks/gantt-bars.component.ts`
- `frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts`
- `frontend/src/app/pages/production/production-cockpit.context.ts`
- `frontend/src/app/pages/production/production-cockpit.page.ts`
- `frontend/src/app/pages/production/production-cockpit.page.spec.ts`
- `docs/pages/production-cockpit.page.md`
- `docs/pages/PAGE-TZ-INDEX.md`

---

# Original TZ

STATUS: DONE  
РОЛЬ АГЕНТА: local executor (GEMINI.md + kppdf-executor-loop)  
ЗАВИСИМОСТИ: TZ-PRODUCTION-339/340/341 DONE  
LAYER: 3  
PAGES: /production  
PAGE_DOCS: production-cockpit.page.md  
CONFLICT KEYS: frontend/src/app/pages/production/gantt-bar.model.ts ; frontend/src/app/pages/production/gantt-bar.model.spec.ts ; frontend/src/app/pages/production/blocks/gantt-bars.component.ts ; frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts ; frontend/src/app/pages/production/production-cockpit.page.ts ; frontend/src/app/pages/production/production-cockpit.context.ts ; frontend/src/app/pages/production/production-cockpit.page.spec.ts
