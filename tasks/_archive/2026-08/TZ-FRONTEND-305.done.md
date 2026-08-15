# TZ-FRONTEND-305.done — dashboard dialog boundary

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T01:32:00+03:00
closed_by: Buffy
implementation_commit: pending
TZ: TZ-FRONTEND-305
SCORE: 100/100 scoped acceptance

## Outcome

- Removed DashboardPage page-to-page imports for Order/Product dialogs.
- Added `DashboardDialogService` as the single coordinator for existing lazy dialog loading/open/close callbacks.
- Preserved exact dialog payloads: `Order` object and `{ id: productId }`, width `lg`, reload after close.
- Kanban status PATCH, ship/cancel flow, item status and readiness logic were not changed.
- No backend/API/permission/route/data/deploy changes.

## Verification

- Dashboard page Jest: 5/5 PASS.
- Coordinator characterization Jest: 2/2 PASS.
- Combined dashboard gate: 2 suites / 7 tests PASS.
- Frontend `tsc -p tsconfig.app.json --noEmit`: PASS.
- Changed-file ESLint: PASS.
- Changed-file Prettier: PASS.
- `pnpm architecture:check`: PASS — 948 files; baseline 6; no new violations.
- `git diff --check`: pending final staged verification.
- Browser smoke: NOT RUN; deploy intentionally deferred until tomorrow.
- Bans: PASS — no deploy, wipe, data staging or production operation.

## Integrity / separation

- No page docs or PAGE-TZ-INDEX changes: no route/user-visible contract changed.
- Untouched: `docs/PO-DIARY.md`, `data/*`, architect-owned dashboard/audit docs and PARK files.

## Files

- `frontend/src/app/pages/dashboard/dashboard.page.ts`
- `frontend/src/app/shared/services/dashboard-dialog.service.ts`
- `frontend/src/app/shared/services/dashboard-dialog.service.spec.ts`
- `docs/agent-checklists/TZ-FRONTEND-305.md`
- `docs/agent-checklists/_NOW.md`
- `STATUS.md`
- `progress.md`
- `tasks/_archive/2026-08/TZ-FRONTEND-305.done.md`
- `.mimocode/locks/TZ-FRONTEND-305-dashboard-dialog-boundary.lock`

## Next

All executable non-deploy work selected for today is closed. Stop before deploy; tomorrow requires explicit PO command «деплой» followed by browser/auth smoke.
