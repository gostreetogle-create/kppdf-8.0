# TZ-DICT-317 — DONE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-10
closed_by: Buffy / continuous executor
workspace: `D:\kppdf-8.0` (executed in the host-managed Freebuff worktree)

## Scope

Units now support manager mutations alongside admin. The Measurements page pencil opens a compact edit dialog for label, symbol, and category; successful PATCH closes the dialog and reloads the list. System-unit delete remains disabled in the UI and guarded by the existing backend service.

## Acceptance evidence

- `UnitFormDialogComponent` sends PATCH for label/symbol/category and has focused Jest coverage.
- Measurements row actions no longer expose an inert «Не применимо» pencil; edit has RU label and a stable test selector.
- Unit controller metadata allows `admin` and `manager` for POST/PATCH/DELETE while reads continue to allow `user`.
- Error paths continue to use `extractErrorMessage`; invalid form state marks all controls touched.
- Page documentation records add/edit/toggle/delete behavior and role boundaries.

## Gates

- acceptance criteria: PASS by focused frontend/backend tests and build
- frontend typecheck: PASS
- backend typecheck: PASS
- Measurements Jest: PASS (6/6)
- Unit controller RBAC Jest: PASS (2/2)
- frontend development build: PASS
- frontend/backend changed-file ESLint: PASS
- `git diff --check`: PASS
- Prettier: backend has no configured binary; frontend repository CRLF baseline reports differences and staged TS is formatted by the commit hook
- live browser smoke: NOT RUN; backend/data were unavailable in the isolated session
- deploy: NO (`deploy.ps1` not run)

## Files

- `frontend/src/app/pages/dictionaries/measurements-group.page.ts`
- `frontend/src/app/pages/dictionaries/measurements-group.page.spec.ts`
- `frontend/src/app/pages/dictionaries/units.service.ts`
- `backend/src/modules/unit/unit.controller.ts`
- `backend/src/modules/unit/unit.controller.spec.ts`
- `docs/pages/measurements-group.page.md`
- `docs/agent-checklists/TZ-DICT-317.md`
- `docs/agent-checklists/_active-map.md`
- `.mimocode/locks/TZ-DICT-317-units-crud-edit-roles.lock`
