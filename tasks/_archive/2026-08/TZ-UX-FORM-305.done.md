# TZ-UX-FORM-305 — Dialog sections sweep

═══════════════════════════════════════════════════════════════
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08
closed_by: Buffy / agent-acfffc1331
wave: A
protected_files:
  - frontend/src/app/pages/products/product-form-dialog.component.ts
  - frontend/src/app/pages/modules/module-form-dialog.component.ts
  - frontend/src/app/pages/dictionaries/color-references-form-dialog.component.ts
  - frontend/src/app/pages/dictionaries/category-form-dialog.component.ts
  - frontend/src/app/pages/dictionaries/document-template-category-form-dialog.component.ts
  - frontend/src/app/pages/dictionaries/text-block-category-form-dialog.component.ts
  - frontend/src/app/pages/orders/order-form-dialog.component.ts
  - frontend/src/app/pages/commercial/proposals/proposal-form-dialog.component.ts
  - frontend/src/app/pages/people/people-form-dialog.component.ts
  - frontend/src/app/pages/inventory/warehouse-form-dialog.component.ts
  - frontend/src/app/pages/inventory/stock-movement-form-dialog.component.ts
  - docs/audits/2026-08-08-dialog-layout-canon.md
verification:
  - Wave A acceptance: PASS
  - FormControl names/payload/API behavior: unchanged by visual-only migration
  - tsc: PASS
  - Angular development build: PASS
  - targeted Jest: PASS (5 suites, 58 tests)
  - scoped ESLint: PASS with one pre-existing warning in order-form-dialog raw HttpClient architecture rule
  - scoped Prettier: PASS (final check after formatting)
  - diff check: PASS
  - outliers audit: UPDATED
  - checklist: UPDATED
  - progress.md: UPDATED
  - lock file: CREATED
known_limitations:
  - Wave B is deferred; untouched dialogs are listed in the audit.
  - MaterialFormDialog remains the canonical reference and was not rewritten.
  - New section wrappers do not have dedicated DOM assertions in every legacy spec; Angular build and existing behavior suites provide coverage.
  - Module-materials specialized editor is not part of Wave A.
═══════════════════════════════════════════════════════════════
