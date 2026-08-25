# TZ-SHIP-440: склад в отгрузке — select, не ObjectId

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-25T18:51:00+03:00
closed_by: Buffy / Freebuff

## Outcome

`/shipping` now loads warehouses from the existing `WarehousesService` registry. Create uses a native select containing active warehouses; edit keeps the current inactive warehouse as a legacy option when needed. The RU placeholder `Выберите склад…`, manual ObjectId entry, and old `dispatch` placeholder are gone. Empty and failed registry states are explicit, and create/save guards reject missing or unknown warehouse ids before calling existing write paths.

## Changed surface

- `frontend/src/app/pages/shipping/shipping.page.ts`
- `frontend/src/app/pages/shipping/shipping.page.spec.ts`
- `docs/pages/shipping.page.md`
- `docs/agent-checklists/TZ-SHIP-440.md`

## Verification

- acceptance criteria: PASS
- typecheck: PASS (`cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`)
- tests: PASS (`shipping.page.spec`, 12/12)
- lint: PASS (0 errors; 17 pre-existing warnings outside owned files)
- focused ESLint: PASS
- architecture: known external FAIL in `materials/material-form-dialog.component.ts` and `supply/supply-quick-order.component.ts`; no owned file involved
- diff check: PASS for owned paths; unrelated pre-existing whitespace remains in `tasks/QUEUE-LIVE.md`
- checklist: ADDED and Integrity slot completed
- progress.md: UPDATED
- status synchronization: PASS

## Known limits

Live `/shipping` smoke was not run because no development server was started. Dispatch semantics, backend DTOs, and warehouse registry schema were not changed. Create excludes inactive warehouses; edit preserves a current inactive FK as a selectable legacy option. Unrelated UX-440 WIP and dirty audit/queue/data files were not staged.
