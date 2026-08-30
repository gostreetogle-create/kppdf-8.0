# TZ-NX-F3-data-access — DONE

- agent_id: freebuff-nx-f3
- workspace: D:\kppdf-8.0
- completed_at: 2026-08-29T10:56:00+03:00

## Scope

- Admin UI remains in `frontend-nx/apps/kppdf-web/src/app/pages/`.
- `libs/features` exports only `PiGroupWorkspaceComponent`, `GroupChip`, and the scaffold marker.
- Removed admin dialog/page helper files from `libs/features`.
- Added app-local `on-dialog-close-once.ts`.
- Removed unused `auth.service.stub.ts`.
- Legacy `frontend/**` was not modified by F3 closeout.

## Gates

- Backend auth/permissions/jwt tests: PASS — 3 suites, 40 tests.
- `pnpm exec nx build kppdf-web --skip-nx-cache`: PASS.
- `pnpm exec nx run-many -t lint --all`: PASS, 0 errors; existing UI warnings remain.
- `libs/features/src`: no imports of `@kppdf/ui/*`, `@kppdf/features`, or `@kppdf/util-http`.

## Integrity

- No commit or push performed.
- Existing unrelated worktree changes were preserved.
- Active F3 claim is cleared after archive.
