# TZ-PRODUCTION-326.done — Gantt write-path sync

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-15
closed_by: Buffy
TZ: TZ-PRODUCTION-326
WAVE: WAVE-PRODUCTION-COCKPIT-HARDEN
DEP: TZ-PRODUCTION-325

## Outcome

- Summary plannedDate drag and order-meta Save now use `canEditOrder` (admin|manager).
- Child estimate-days resize, child start-offset drag, and catalog WorkType.days remain gated by `production:write`.
- Successful plannedDate writes reload orders and rebuild Gantt bars/summary via `reloadOrdersKeepingSelection()`.
- Meta UI makes the commit boundary explicit: «После сохранения Гант обновится».
- Existing backend ISO path verified read-only: `PATCH /orders/:id` is role-protected; `UpdateOrderDto` inherits `@IsDateString()`; service persists `new Date(dto.plannedDate)`. No BE endpoint added.
- Existing cascade behavior and estimate-only boundary remain intact.

## Verification

- acceptance criteria: PASS
- frontend typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`)
- targeted tests: PASS (`pnpm exec jest src/app/pages/production/blocks/gantt-bars.component.spec.ts src/app/pages/production/production-cockpit.page.spec.ts --runInBand`, 46/46)
- frontend lint: PASS with 18 existing architecture warnings (`pnpm lint`)
- targeted formatting: PASS (`pnpm exec prettier --check ...`)
- BE verify: PASS by source inspection; no API request or new endpoint.
- browser smoke: NOT RUN — no live browser server available; Angular Jest covers role gate, PATCH payload, and reload path.
- docs/checklists/status: PASS
- bans: PASS — no fact production, wipe, deploy, or staged data.

## Files

- `frontend/src/app/pages/production/blocks/gantt-bars.component.ts`
- `frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts`
- `frontend/src/app/pages/production/production-cockpit.page.ts`
- `frontend/src/app/pages/production/production-cockpit.page.spec.ts`
- `docs/pages/production-cockpit.page.md`
- `docs/pages/PAGE-TZ-INDEX.md`
- `docs/agent-checklists/TZ-PRODUCTION-326.md`
- `docs/agent-checklists/WAVE-PRODUCTION-COCKPIT-HARDEN.md`
- `docs/agent-checklists/_NOW.md`
- `progress.md`
- `STATUS.md`

## Lock

`.mimocode/locks/TZ-PRODUCTION-326-gantt-write-sync.lock`
