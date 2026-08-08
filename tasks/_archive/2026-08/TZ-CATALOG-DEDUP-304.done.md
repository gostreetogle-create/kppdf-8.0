# TZ-CATALOG-DEDUP-304 — detail edit openers

**Outcome:** DONE
**Date:** 2026-08-08
**Source:** `tasks/_backlog/TZ-CATALOG-DEDUP-304-detail-edit-opener.md`
**Dependency:** DEDUP-301 synchronized on main before implementation.

## Delivered

- Product detail now opens the existing `ProductFormDialogComponent` with the loaded product.
- Material detail now opens the existing `MaterialFormDialogComponent` with the loaded material.
- Successful dialog close reloads the corresponding detail resource; material also refreshes where-used data.
- No duplicate fields, composition UI, API, or new form was added.

## НЕ

- new form
- composition
- backend/API/schema changes
- deploy

## Verification

- Acceptance criteria: PASS
- Frontend typecheck: PASS
- Targeted Jest: PASS (material-detail, 1 suite / 6 tests)
- Scoped ESLint: PASS
- `git diff --check`: PASS
- Review: PASS; no critical issues

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T10:45:00Z
closed_by: agent-acfffc1331
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: PASS
  - checklist: ADDED
  - progress.md: UPDATED
  - status synchronization: PASS
known_limitations:
  - detail opener smoke is covered by compile/typecheck; existing material-detail spec does not mock dialog interactions
  - deploy: NO
