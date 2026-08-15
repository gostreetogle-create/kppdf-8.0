# TZ-PRODUCTION-332.done — Day-scale header date + weekday (ПН…ВС)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-15
closed_by: cursor-grok-4.6-executor
TZ: TZ-PRODUCTION-332
WAVE: WAVE-PRODUCTION-COCKPIT-POLISH successor (day weekday ticks)
DEP: TZ-PRODUCTION-330, TZ-PRODUCTION-331

verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (FE gantt-bars 36)
  - lint: PASS (owned files)
  - checklist: ADDED
  - progress.md: UPDATED
  - status synchronization: PASS

## Outcome

- Day zoom ticks are two lines: `DD.MM` + RU weekday abbr ПН ВТ СР ЧТ ПТ СБ ВС (UTC `getUTCDay`).
- Scale header and sticky «Заказ» label header share `h-10`.
- Month zoom ticks remain RU month names only (330 regression).

## Verification

- `frontend` `tsc -p tsconfig.app.json --noEmit`: PASS
- `frontend` `jest --testPathPattern=gantt-bars.component.spec`: PASS — 36 tests
- eslint owned gantt-bars files: PASS
- deploy: NOT RUN (PO: no deploy)

## Files

- `frontend/src/app/pages/production/blocks/gantt-bars.component.ts`
- `frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts`
- `docs/pages/production-cockpit.page.md`
- `docs/pages/PAGE-TZ-INDEX.md`

## Lock

`.mimocode/locks/TZ-PRODUCTION-332-gantt-day-weekday-ticks.lock`
