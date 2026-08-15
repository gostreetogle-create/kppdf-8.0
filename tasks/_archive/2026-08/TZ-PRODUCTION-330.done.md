# TZ-PRODUCTION-330.done — Месяц zoom + Сегодня always scrolls

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-15
closed_by: Buffy
TZ: TZ-PRODUCTION-330
WAVE: WAVE-PRODUCTION-COCKPIT-POLISH
DEP: TZ-PRODUCTION-329 (`ee0b0c78`)

verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (6 suites / 73 tests)
  - lint: PASS (1 pre-existing OnInit page warning)
  - checklist: ADDED
  - progress.md: UPDATED
  - status synchronization: PASS

## Outcome

- Zoom UX «Неделя» replaced with «Месяц»; `GanttZoom = 'day' | 'month'`.
- Month ticks are RU month names (`август`, `сентябрь`); no `н.32`.
- Fit-density for month matches former week (`max(12, floor(width/dayCount))`); **Вместить сроки** switches to month.
- **Сегодня** always recenters the today marker; chrome title/aria «Прокрутить к сегодня»; nonce increments on every click.

## Verification

- `frontend` `tsc -p tsconfig.app.json --noEmit`: PASS
- `pnpm test -- --testPathPattern=pages/production`: PASS — 6 suites / 73 tests
- eslint owned files: PASS (1 existing architecture warning)
- targeted Prettier: PASS
- browser smoke: NOT RUN — no live browser/API server
- bans: PASS — no BE, deploy, wipe, or data/paspots

## Files

- `frontend/src/app/pages/production/blocks/gantt-bars.component.ts`
- `frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts`
- `frontend/src/app/pages/production/blocks/production-scale-controls.component.ts`
- `frontend/src/app/pages/production/blocks/production-scale-controls.component.spec.ts`
- `frontend/src/app/pages/production/production-cockpit.page.ts`
- `frontend/src/app/pages/production/production-cockpit.page.spec.ts`
- `frontend/src/app/pages/production/production-cockpit.context.ts`
- `docs/pages/production-cockpit.page.md`
- `docs/ux/production-gantt-studio-spec.md`

## Lock

`.mimocode/locks/TZ-PRODUCTION-330-gantt-month-today.lock`

## Wave

WAVE-PRODUCTION-COCKPIT-POLISH DONE. Ready to propose deploy; do not deploy automatically.
