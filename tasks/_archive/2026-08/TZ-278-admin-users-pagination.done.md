# TZ-278 — Admin users and roles pagination — DONE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-02
closed_by: Buffy
source_task: tasks/TZ-278-admin-users-pagination.md
commit: f8a1b1ff7ed93004d3a17bd01194579e8bd1bb94

## Scope completed

- Backend `GET /api/admin/users` and `GET /api/admin/roles` now return the typed envelope `{ items, total, page, limit }`.
- Safe defaults/clamps cover missing and invalid `page`/`limit`; legacy `offset` compatibility preserves the exact skip behavior.
- Search is applied before pagination and totals match the filtered set; empty pages return valid metadata with `items: []`.
- `/admin/users` and `/admin/roles` use typed list services and server-side page transitions while preserving loading, error, empty, search, sorting, mutation, and dialog behavior.
- Duplicate/stale list responses are guarded by the current request parameters.

## Dependencies and conflict keys

dependencies:
  - TZ-257 (archived prerequisite)
  - TZ-119 (archived prerequisite)
conflict_keys:
  - backend/src/modules/admin/users-admin.controller.ts
  - backend/src/modules/admin/roles-admin.controller.ts
  - frontend/src/app/shared/services/pi-users.service.ts
  - frontend/src/app/shared/services/pi-roles.service.ts
  - frontend/src/app/pages/admin/users-admin.page.ts
  - frontend/src/app/pages/admin/roles-admin.page.ts
  - corresponding TZ-278 specs

## Changed files

- docs/agent-checklists/TZ-278.md
- backend/src/modules/admin/admin-list-query.ts
- backend/src/modules/admin/admin-list-query.spec.ts
- backend/src/modules/admin/users-admin.controller.ts
- backend/src/modules/admin/users-admin.controller.spec.ts
- backend/src/modules/admin/roles-admin.controller.ts
- backend/src/modules/admin/roles-admin.controller.spec.ts
- frontend/src/app/shared/services/pi-users.service.ts
- frontend/src/app/shared/services/pi-users.service.spec.ts
- frontend/src/app/shared/services/pi-roles.service.ts
- frontend/src/app/shared/services/pi-roles.service.spec.ts
- frontend/src/app/pages/admin/users-admin.page.ts
- frontend/src/app/pages/admin/users-admin.page.spec.ts
- frontend/src/app/pages/admin/roles-admin.page.ts
- frontend/src/app/pages/admin/roles-admin.page.spec.ts
- STATUS.md
- progress.md
- tasks/_archive/2026-08/TZ-278-admin-users-pagination.done.md
- .mimocode/locks/TZ-278-admin-users-pagination.lock

## Verification

verification:
  - backend targeted Jest: PASS, 3 suites / 26 tests
  - frontend targeted Jest: PASS, 4 suites / 26 tests
  - backend typecheck: PASS
  - frontend typecheck: PASS
  - frontend development build: PASS
  - targeted lint: PASS with only pre-existing warnings
  - git diff --check: PASS
  - bash OrchestratorKit/verify-status.sh: PASS, exit 0
  - independent code review: no critical or important findings
browser: MANUAL_BROWSER_CHECK_REQUIRED — browser agents failed before navigation because Chrome DevTools page selection received an undefined pageId; no browser success is claimed.
known_limitations:
  - Live authenticated browser verification of `/admin/users` and `/admin/roles` remains outstanding.
  - Full Jest and E2E suites were not run because this task was scoped to targeted pagination regression coverage and the repository contains unrelated active changes.
  - Existing admin lint warnings for raw HttpClient/legacy `any` remain outside the new pagination implementation.
lock_file: .mimocode/locks/TZ-278-admin-users-pagination.lock

## Operational disposition

- TZ-276 remains SUPERSEDED by archived TZ-DOC-268 and was not reopened.
- Materials TZ-MATERIALS-307, TZ-MATERIALS-309, and TZ-MATERIALS-308 remain active and untouched; 308 remains sequenced after 307 because of the shared material service conflict key.
- Z-series and `docs/audits/Z-003-soft-delete-audit.md` remain inactive/audit-only.
- Only the active TZ-278 file is archived; no other task is archived or modified.
