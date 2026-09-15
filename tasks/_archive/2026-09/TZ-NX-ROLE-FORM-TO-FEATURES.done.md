# TZ-NX-ROLE-FORM-TO-FEATURES

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS (specs green, tsc, build)
  - typecheck: PASS (kppdf-web + features, clean on first run)
  - architecture check: PASS (1521 files; baseline 17; 2 resolved since baseline)
  - tests: PASS (features 25/25 suites 251/251; kppdf-web role|admin pattern 106/106 suites, 741/748, 7 skipped, 0 failed)
  - nx build kppdf-web: PASS (last gate, exit 0, bundle unchanged 503.38 kB; confirmed lazy-only route)
  - checklist: docs/agent-checklists/TZ-NX-ROLE-FORM-TO-FEATURES.md
  - commit: 0e21bfa1
  - status synchronization: PASS (tracker updated)

## Root cause

The TZ asked to move `RoleFormFacade` (+ the dialog UI, if no illegal app
dependency) into `libs/features/src/lib/admin-roles/`.

## Fix

Checked every relative import first. Both files' shared dependency,
`permission-labels.ru.ts` (240 LOC pure RU label data, zero Angular/DI),
also feeds `admin-roles.page.ts` (unrelated exports) — but being pure
static data rather than a real interactive component, duplicating it
carries the same low drift risk as the smaller utilities already
duplicated across this program (`on-dialog-close-once.ts`,
`ORDER_STATUS_LABELS`). Moved both the facade and the dialog UI in full,
satisfying the TZ's stated preference with no scope deviation.

## Files changed

- `role-form.facade.ts` → `libs/features/src/lib/admin-roles/role-form.facade.ts`
- `role-form-dialog.component.ts` → `libs/features/src/lib/admin-roles/ui/role-form-dialog.component.ts`
- New: `libs/features/src/lib/admin-roles/ui/permission-labels.ru.ts` (duplicate)
- New barrels: `admin-roles/index.ts`, `admin-roles/ui/index.ts`
- `frontend-nx/tsconfig.base.json` (new `@kppdf/features/admin-roles` path)
- `admin-roles.page.ts` (+ spec) — import paths
- `docs/agent-checklists/TZ-NX-ROLE-FORM-TO-FEATURES.md` (new)

## Role-form half of B4 — COMPLETE (R1-R2)

| TZ | Commit |
|----|--------|
| TZ-NX-ROLE-FORM-FACADE | a2859085 |
| TZ-NX-ROLE-FORM-TO-FEATURES | 0e21bfa1 |

## Successor

`TZ-NX-REGISTRY-FORMS-FACADE` (F1) — the registry fat forms half of B4.
