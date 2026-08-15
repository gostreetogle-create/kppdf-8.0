# TZ-PRODUCTION-324.done — Gantt zoom fit-width + Сегодня + «Вместить сроки»

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-15
closed_by: Buffy
TZ: TZ-PRODUCTION-324
WAVE: WAVE-PRODUCTION-COCKPIT-HARDEN
DEP: TZ-PRODUCTION-323

## Outcome

- Week mode now measures the Gantt scroll pane with `ResizeObserver` and computes `max(12, floor(timelineWidth / dayCount))`; Day remains 36px/day.
- `Весь горизонт` is now `Вместить сроки`: it fits padded min…max current bars, switches to Неделя density, and scrolls to range start.
- `Сегодня` keeps today in range and scrolls the red marker into the visible timeline with a 16px inset.
- Existing Gantt cascade behavior is unchanged; no bottom card or fact production was added.

## Verification

- acceptance criteria: PASS
- frontend typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`)
- targeted tests: PASS (`pnpm exec jest src/app/pages/production/blocks/gantt-bars.component.spec.ts src/app/pages/production/production-cockpit.page.spec.ts --runInBand`, 43/43)
- frontend lint: PASS with 18 existing architecture warnings (`pnpm lint`)
- targeted formatting: PASS (`pnpm exec prettier --check ...`)
- browser smoke: NOT RUN — no live browser server available in this executor step; Angular Jest covers DOM and command wiring.
- docs/checklists/status: PASS
- bans: PASS — no BE/API, fact production, ProductionOrder/OrderTask, deploy, wipe, or staged data.

## Files

- `frontend/src/app/pages/production/blocks/gantt-bars.component.ts`
- `frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts`
- `frontend/src/app/pages/production/production-cockpit.page.ts`
- `frontend/src/app/pages/production/production-cockpit.page.spec.ts`
- `docs/pages/production-cockpit.page.md`
- `docs/pages/PAGE-TZ-INDEX.md`
- `docs/agent-checklists/TZ-PRODUCTION-324.md`
- `docs/agent-checklists/WAVE-PRODUCTION-COCKPIT-HARDEN.md`
- `docs/agent-checklists/_NOW.md`
- `progress.md`
- `STATUS.md`

## Lock

`.mimocode/locks/TZ-PRODUCTION-324-gantt-zoom-fit.lock`
