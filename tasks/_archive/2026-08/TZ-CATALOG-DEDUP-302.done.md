# TZ-CATALOG-DEDUP-302 — retire ModuleMaterials dialog

**Outcome:** DONE
**Date:** 2026-08-08
**Source:** `tasks/_backlog/TZ-CATALOG-DEDUP-302-retire-module-materials-dialog.md`

## Delivered

- Removed the `Быстрое редактирование` ModuleMaterials opener from module detail.
- Removed the now-orphaned `ModuleMaterialsFormDialogComponent` and its spec.
- Kept module composition on the existing `ProductBomPanel` + picker path.
- Updated the data-entry dedupe audit and successor queue.

## НЕ

- `ProductBomPanel` on module detail
- `ModuleFormDialog` passport
- backend/API/schema changes
- deploy

## Verification

- Acceptance criteria: PASS
- Frontend typecheck: PASS
- Targeted Jest: PASS (module-detail + product-bom-panel, 2 suites / 8 tests)
- Scoped ESLint: PASS
- `git diff --check`: PASS
- Review: PASS; no critical issues

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T09:55:00Z
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
  - orphan shared CompositionEditor remains for successor TZ-CATALOG-DEDUP-303
  - deploy: NO
