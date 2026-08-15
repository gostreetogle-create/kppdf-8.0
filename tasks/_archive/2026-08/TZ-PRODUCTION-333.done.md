# TZ-PRODUCTION-333.done — Optimistic Gantt drag (no full reload flicker)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-15
closed_by: cursor-grok-4.6-executor
TZ: TZ-PRODUCTION-333
WAVE: WAVE-PRODUCTION-COCKPIT-POLISH successor (optimistic drag)
DEP: TZ-PRODUCTION-331, TZ-PRODUCTION-332

verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (FE gantt-bar.model + production-cockpit.page)
  - lint: PASS (owned files; pre-existing OnInit warning)
  - checklist: ADDED
  - progress.md: UPDATED
  - status synchronization: PASS

## Outcome

- Three Gantt drag write paths (`onEstimateDaysCommit`, `onPlannedDateMoveCommit`, `onStartOffsetCommit`) apply optimistic local `orders`+`bars`, fire silent PATCH, and do not `reloadOrdersKeepingSelection()` on success.
- No success toast on these paths. PATCH fail → snapshot revert + error toast.
- Per-orderId inFlight set blocks overlapping commits. Meta save / catalog WorkType.days keep toast+reload.
- Pure helpers in `gantt-bar.model.ts`; summary span rebuilt from children.

## Verification

- `frontend` `tsc -p tsconfig.app.json --noEmit`: PASS
- `frontend` `jest --testPathPattern=gantt-bar.model.spec|production-cockpit.page.spec`: PASS — 38 tests
- eslint owned files: PASS (1 pre-existing OnInit warning)
- deploy: NOT RUN (PO: no deploy)

## Files

- `frontend/src/app/pages/production/gantt-bar.model.ts`
- `frontend/src/app/pages/production/gantt-bar.model.spec.ts`
- `frontend/src/app/pages/production/production-cockpit.page.ts`
- `frontend/src/app/pages/production/production-cockpit.page.spec.ts`
- `docs/pages/production-cockpit.page.md`
- `docs/pages/PAGE-TZ-INDEX.md`

## Lock

`.mimocode/locks/TZ-PRODUCTION-333-gantt-optimistic-drag.lock`
