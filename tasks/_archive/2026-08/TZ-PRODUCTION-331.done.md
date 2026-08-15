# TZ-PRODUCTION-331.done — Plan fields on ready + heal missing siteId

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-15
closed_by: cursor-grok-4.6-executor
TZ: TZ-PRODUCTION-331
WAVE: WAVE-PRODUCTION-COCKPIT-POLISH successor (siteId + ready plan)
DEP: TZ-PRODUCTION-330

verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (BE order.service 34; FE production 6 suites / 74)
  - lint: PASS (1 pre-existing OnInit page warning)
  - checklist: ADDED
  - progress.md: UPDATED
  - status synchronization: PASS

## Outcome

- `OrderService.update` allows only `{plannedDate, priority, materialsSource}` on `in_production`/`ready`.
- Composition (`notes`, items, counterparty, …) still 400 on those statuses.
- `shipped`/`delivered`/`cancelled` still block plan fields (materialsSource exception kept).
- Before save on `update` / `patchEstimateDays` / `patchEstimateStart`: missing `siteId` is healed from the first Site of the order's Counterparty; none → RU 400.
- Demo seed always writes `siteId` and heals existing DEMO-LOCAL orders.

## Verification

- `backend` `tsc -p tsconfig.build.json --noEmit`: PASS
- `backend` `jest --testPathPattern=order.service.spec`: PASS — 34 tests
- `frontend` `tsc -p tsconfig.app.json --noEmit`: PASS
- `frontend` `pnpm test -- --testPathPattern=pages/production`: PASS — 6 suites / 74 tests
- eslint owned files: PASS (1 existing OnInit warning)
- deploy: NOT RUN (PO: no deploy)

## Files

- `backend/src/modules/order/order.service.ts`
- `backend/src/modules/order/order.service.spec.ts`
- `backend/src/common/seed/local-demo.seed.ts`
- `frontend/src/app/pages/production/production-cockpit.page.ts`
- `frontend/src/app/pages/production/gantt-bar.model.ts`
- `frontend/src/app/pages/production/gantt-bar.model.spec.ts`
- `docs/pages/production-cockpit.page.md`
- `docs/pages/PAGE-TZ-INDEX.md`

## Lock

`.mimocode/locks/TZ-PRODUCTION-331-order-plan-fields-ready.lock`
