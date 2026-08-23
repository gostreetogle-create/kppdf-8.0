ARCHIVE_MARKER
task_id: TZ-UI-PLUS-602
outcome: DONE
closed_at: 2026-08-23T22:00:00+03:00
agent_id: cursor-executor
spec: tasks/TZ-UI-PLUS-602-product-material-select-plus.md

verification:
  - typecheck: PASS
  - lint: PASS
  - tests: PASS (product-form-dialog, material-form-dialog — 81/81)

## Done

- Product form: green `+` (`prod-category-add`) on category overflow-select row → `CategoryFormDialogComponent` create; on save (type=product) append to list + select.
- Material form: green `+` (`mat-supplier-add`) on supplier row → `OrganizationFullEditorDialogComponent` create; on save (type includes supplier) append + select.
- Empty-supplier hint: primary path is `+`, secondary link to `/organizations` (no dead-end navigate-only).

## Files changed

- `frontend/src/app/pages/products/product-form-dialog.component.ts`
- `frontend/src/app/pages/products/product-form-dialog.component.spec.ts`
- `frontend/src/app/pages/materials/material-form-dialog.component.ts`
- `frontend/src/app/pages/materials/material-form-dialog.component.spec.ts`
