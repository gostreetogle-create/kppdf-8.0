# TZ-PRODUCTION-325.done — Orders rail / Заказчики

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-15
closed_by: Buffy
TZ: TZ-PRODUCTION-325
WAVE: WAVE-PRODUCTION-COCKPIT-HARDEN
DEP: TZ-PRODUCTION-324

## Outcome

- Removed colored status pips from collapsed and expanded Orders rail; textual status remains.
- Added RU `Заказы` / `Заказчики` mode. Unique populated Counterparty names are listed, missing parties appear as `Без заказчика`.
- Counterparty selection, repeat click, and `Все заказчики` use shared `filterOrdersForRail` so rail and Gantt receive the same filtered orders.
- Search is order number in Заказы mode and counterparty name in Заказчики mode.
- Date filters continue to narrow rail and Gantt reload targets; empty states are clear RU messages.
- No backend endpoint, CRUD, fact production, ProductionOrder/OrderTask, deploy, wipe, or data staging.

## Verification

- acceptance criteria: PASS
- frontend typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`)
- targeted tests: PASS (`pnpm exec jest src/app/pages/production/blocks/orders-rail.component.spec.ts src/app/pages/production/gantt-bar.model.spec.ts src/app/pages/production/production-cockpit.page.spec.ts --runInBand`, 33/33)
- frontend lint: PASS with 18 existing architecture warnings (`pnpm lint`)
- targeted formatting: PASS (`pnpm exec prettier --check ...`)
- browser smoke: NOT RUN — no live browser server available; Angular Jest covers DOM mode switching and cockpit reload targets.
- docs/checklists/status: PASS

## Files

- `frontend/src/app/pages/production/blocks/orders-rail.component.ts`
- `frontend/src/app/pages/production/blocks/orders-rail.component.spec.ts`
- `frontend/src/app/pages/production/gantt-bar.model.ts`
- `frontend/src/app/pages/production/gantt-bar.model.spec.ts`
- `frontend/src/app/pages/production/production-cockpit.context.ts`
- `frontend/src/app/pages/production/production-cockpit.page.ts`
- `frontend/src/app/pages/production/production-cockpit.page.spec.ts`
- `docs/pages/production-cockpit.page.md`
- `docs/pages/PAGE-TZ-INDEX.md`
- `docs/agent-checklists/TZ-PRODUCTION-325.md`
- `docs/agent-checklists/WAVE-PRODUCTION-COCKPIT-HARDEN.md`
- `docs/agent-checklists/_NOW.md`
- `progress.md`
- `STATUS.md`

## Lock

`.mimocode/locks/TZ-PRODUCTION-325-orders-rail-counterparties.lock`
