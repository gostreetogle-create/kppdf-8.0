# TZ-QA-445E.done — Gantt chrome «Сегодня» never silent no-op

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-27T18:30:00Z
closed_by: freebuff-2
TZ: TZ-QA-445E
WAVE: qa-2026-08-27-live-bugs

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`frontend` tsc app)
  - tests: PASS (2 suites / 90 tests — cockpit + gantt-bars)
  - lint: PASS (1 pre-existing OnInit page warning)
  - checklist: UPDATED
  - status synchronization: PASS

## Outcome

Chrome calendar tool (`id: today`, Lucide `CalendarDays`) already called `onToday` → range pad + `scrollRequest('today')`. On empty short default range (today−2…today+14) the timeline often fits the viewport, so `scrollLeft` clamps to 0 — PO saw a silent no-op.

**Fix:** `scrollToToday()` still recenters the red marker when possible, and always applies a brief `.gantt-today-pulse` on `[data-test="gantt-today-marker"]` so every click has visible feedback. Tool stays enabled (not disabled).

## Verification

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`: PASS
- `pnpm test -- --testPathPattern="pages/production/(production-cockpit.page|blocks/gantt-bars.component)"`: PASS — 2 suites / 90 tests
- eslint owned files: PASS (pre-existing OnInit warning on page)
- bans: PASS — no product-detail / material-detail / status-banner (444C); no deploy

## Files

- `frontend/src/app/pages/production/blocks/gantt-bars.component.ts`
- `frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts`
- `frontend/src/app/pages/production/production-cockpit.page.spec.ts`
- `docs/pages/production-cockpit.page.md`
- `docs/agent-checklists/TZ-QA-445E.md`
- `docs/agent-checklists/_NOW.md`

## Lock

`.mimocode/locks/TZ-QA-445E-gantt-calendar-button.lock`

## Deploy

NO
