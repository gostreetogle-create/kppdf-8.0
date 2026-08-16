# TZ-PRODUCTION-344.done — Gantt «По рабочим»: Module+context + ▸

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T21:15:49+03:00
closed_by: local-executor-composer (kppdf-executor-loop)
TZ: TZ-PRODUCTION-344
WAVE: WAVE-GANTT-IA-PRODUCT-MODULE
DEP: TZ-PRODUCTION-342 DONE
Cursor_verdict: N/A (TZ does not require review gate)

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`)
  - tests: PASS (`pnpm exec jest --testPathPattern="gantt-bar.model.spec|gantt-bars.component.spec|production-cockpit.page.spec"` — 3 suites / 100 tests)
  - checklist: DONE
  - progress.md: UPDATED
  - status synchronization: PASS
  - deploy: NOT RUN

## Outcome

- `buildWorkerTreeBars(work, expandedWorkerIds, expandedWorkerModuleIds)`:
  collapsed → worker summaries only;
  expand worker → **module** rows with label `заказ · изделие · модуль`;
  expand module → work types (read-only cascade).
- Expand keys: worker label / `worker-module:{label}:{orderId}:{item}:{moduleId}`.
- UI: ▸ on worker + module (default collapsed, consistent with orders); group frames when worker expanded.
- Read-only write rules GANTT-401 preserved (no drag/resize in worker mode).
- Order lens from 342 unchanged.

## known_limitation

- Multi-person comma `workerLabel` still one group (401).
- RU toggle polish = 343; product-without-modules = 345.

## Critical files

- `frontend/src/app/pages/production/gantt-bar.model.ts`
- `frontend/src/app/pages/production/gantt-bar.model.spec.ts`
- `frontend/src/app/pages/production/blocks/gantt-bars.component.ts`
- `frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts`
- `frontend/src/app/pages/production/production-cockpit.context.ts`
- `frontend/src/app/pages/production/production-cockpit.page.ts`
- `docs/pages/production-cockpit.page.md`
