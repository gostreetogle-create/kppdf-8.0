# TZ-PRODUCTION-336.done — Gantt skip orders without modules

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16
closed_by: cursor-grok-4.6 (TZ-PRODUCTION-336 frontend executor)
TZ: TZ-PRODUCTION-336
WAVE: WAVE-PRODUCTION-COCKPIT-POLISH successor (eligibility)
DEP: TZ-PRODUCTION-335
Cursor_verdict: PASS

verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (gantt-bar.model + production-read.facade + production-cockpit.page + orders-rail — 56)
  - lint: PASS (owned files; pre-existing OnInit warning on page)
  - checklist: ADDED
  - progress.md: UPDATED
  - status synchronization: PASS
  - deploy: NOT RUN

## Outcome

- `orderHasGanttEstimate` = `buildGanttBars` yields ≥1 work-bar (direct module + work type). Deep product→product BOM remains known_limitation.
- `loadBarsForOrders` skips ineligible orders: no bars, no persistent `gantt-warnings` «нет прямых модулей» / «без изделия».
- Rail keeps those orders with marker «нет плана» (title «Нет модулей для Ганта»).
- Select / `?orderId=` of an ineligible order: RU `toast.warning` + HUB-303-style hint on deep-link; Gantt stays on eligible «все активные». Selection in rail is allowed so the manager can open meta and fix composition.

## Verification

- `frontend` `tsc -p tsconfig.app.json --noEmit`: PASS
- `frontend` jest `--testPathPattern="production-read.facade|production-cockpit.page|gantt-bar.model|orders-rail"`: PASS — 4 suites / 56 tests
- eslint owned files: PASS (1 pre-existing OnInit warning)
- deploy: NOT RUN (PO: no deploy)

## Files

- `frontend/src/app/pages/production/gantt-bar.model.ts`
- `frontend/src/app/pages/production/gantt-bar.model.spec.ts`
- `frontend/src/app/pages/production/production-read.facade.ts`
- `frontend/src/app/pages/production/production-read.facade.spec.ts`
- `frontend/src/app/pages/production/production-cockpit.page.ts`
- `frontend/src/app/pages/production/production-cockpit.page.spec.ts`
- `frontend/src/app/pages/production/blocks/orders-rail.component.ts`
- `frontend/src/app/pages/production/blocks/orders-rail.component.spec.ts`
- `docs/pages/production-cockpit.page.md`
- `docs/pages/PAGE-TZ-INDEX.md` (working tree; mixed peer lines not in this landing if skipped)
- `docs/agent-checklists/TZ-PRODUCTION-336.md`

## Lock

`.mimocode/locks/TZ-PRODUCTION-336-gantt-skip-orders-without-modules.lock`

## known_limitation

- Nested products without direct module lines stay off the Gantt until a deep-BOM TZ.
- Auto-status `in_production` on «закинуть» is out of scope.
