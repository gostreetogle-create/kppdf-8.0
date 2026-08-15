# TZ-PRODUCTION-334.done — Fix workers list 400 (limit 200 > MAX 100)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-15
closed_by: cursor-grok-4.6-executor
TZ: TZ-PRODUCTION-334
WAVE: WAVE-PRODUCTION-COCKPIT-POLISH successor (workers labels 400)
DEP: none

verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (FE production-read.facade.spec)
  - lint: PASS (owned files)
  - checklist: ADDED
  - progress.md: UPDATED
  - status synchronization: PASS

## Outcome

- `ProductionReadFacade.getWorkersByWorkType` calls `workersApi.list({ limit: 100, isActive: true })`.
- BE `FindWorkersDto.limit` `@Max(100)` no longer 400s cockpit load.
- Silent fail on `!res.ok` unchanged (empty map). Pagination not added (shop ~10 users; TZ optional).

## Verification

- `frontend` `tsc -p tsconfig.app.json --noEmit`: PASS
- `frontend` `jest --testPathPattern=production-read.facade.spec`: PASS — 2 tests
- eslint owned files: PASS
- deploy: NOT RUN (PO: no deploy)

## Files

- `frontend/src/app/pages/production/production-read.facade.ts`
- `frontend/src/app/pages/production/production-read.facade.spec.ts`
- `docs/pages/production-cockpit.page.md`
- `docs/pages/PAGE-TZ-INDEX.md`

## Lock

`.mimocode/locks/TZ-PRODUCTION-334-workers-list-limit.lock`
