# TZ-UX-FORM-306 — Module QuickCreate L BOM

**Outcome:** DONE
**Date:** 2026-08-08
**Source:** `tasks/_backlog/TZ-UX-FORM-306-module-quickcreate-L-bom.md`

## Delivered

- Module QuickCreate L now stays in the same dialog after successful create.
- The existing `ProductBomPanel` is shown with `rootKind="module"` and the new module id.
- BOM remains optional; `Готово` closes the dialog and returns the created module.
- Product L behavior remains on the same shared panel path.
- Updated the QuickCreate and passport/dedupe audits.

## НЕ

- `product-form-dialog`
- `ModuleMaterials`
- backend schema/API
- deploy

## Verification

- Acceptance criteria: PASS
- Frontend typecheck: PASS
- Targeted Jest: PASS (QuickCreate + ProductBomPanel, 2 suites / 19 tests)
- Scoped ESLint: PASS
- `git diff --check`: PASS
- Review: PASS; no critical issues

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T10:20:00Z
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
  - module QuickCreate does not provide photo controls; photo scope remains product L only
  - deploy: NO
