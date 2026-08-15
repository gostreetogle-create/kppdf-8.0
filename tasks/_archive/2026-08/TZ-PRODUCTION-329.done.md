# TZ-PRODUCTION-329.done — Filters + Counterparty select → Gantt

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-15
closed_by: Buffy
TZ: TZ-PRODUCTION-329
WAVE: WAVE-PRODUCTION-COCKPIT-POLISH
DEP: TZ-PRODUCTION-328

verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (6 suites / 71 tests)
  - lint: PASS (1 pre-existing OnInit page warning)
  - checklist: ADDED
  - progress.md: UPDATED
  - status synchronization: PASS

## Outcome

- Orders flyout is orders-only: search by number, no «Заказы | Заказчики» tabs, no counterparties list.
- Filters flyout has Counterparty `<select>` (Все заказчики / each populated Counterparty / Без заказчика). Selecting a customer immediately filters the Orders list and Gantt via shared `filterOrdersForRail`.
- «Сброс фильтров» uses `pi-btn-ink` when dirty (counterparty / priority / dates / activeOnly≠true; default activeOnly=true). Chrome «Фильтры» stays active while dirty.
- Counterparty = Counterparty entity, not Organization. `railMode` removed.

## Verification

- `frontend` `tsc -p tsconfig.app.json --noEmit`: PASS
- `pnpm test -- --testPathPattern=pages/production`: PASS — 6 suites / 71 tests
- eslint owned production files: PASS (1 existing architecture warning on page OnInit)
- targeted Prettier: PASS
- browser smoke: NOT RUN — no live browser/API server
- bans: PASS — no BE, month zoom, deploy, wipe, or data/paspots

## Files

- `frontend/src/app/pages/production/blocks/orders-rail.component.ts`
- `frontend/src/app/pages/production/blocks/orders-rail.component.spec.ts`
- `frontend/src/app/pages/production/production-cockpit.page.ts`
- `frontend/src/app/pages/production/production-cockpit.page.spec.ts`
- `frontend/src/app/pages/production/production-cockpit.context.ts`
- `docs/pages/production-cockpit.page.md`
- `docs/ux/production-gantt-studio-spec.md`
- `docs/pages/PAGE-TZ-INDEX.md`

## Lock

`.mimocode/locks/TZ-PRODUCTION-329-filters-counterparty.lock`

## Next

TZ-PRODUCTION-330 — Месяц + Сегодня scroll. No deploy.
