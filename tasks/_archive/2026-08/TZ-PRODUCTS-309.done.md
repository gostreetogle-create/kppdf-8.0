# TZ-PRODUCTS-309 — composition in Product FullEditor

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T19:49:36Z
closed_by: agent-3e757640b7
protected_files:
  - frontend/src/app/pages/products/product-form-dialog.component.ts
  - frontend/src/app/pages/products/product-form-dialog.component.spec.ts
  - frontend/src/app/pages/products/product-bom-panel.component.ts
  - docs/pages/products.page.md
  - docs/agent-checklists/TZ-PRODUCTS-309.md
affected_areas:
  - Product FullEditor edit/create composition entry point
  - shared ProductBomPanel embedding contract
verification:
  - acceptance criteria: PASS
  - frontend typecheck: PASS
  - focused Jest: PASS (32/32 form + BOM)
  - Angular development build: PASS
  - targeted ESLint: PASS
  - Prettier check for changed form files: PASS
  - git diff --check: PASS
  - progress.md: UPDATED
  - STATUS.md: UPDATED
  - checklist: DONE
  - lock file: CREATED
  - verify-status.sh: pre-existing FAIL ×72 legacy kit-era entries, outside this TZ
notes:
  - Edit mode uses the existing ProductBomPanel and its composition endpoints; no second write-path was introduced.
  - Create mode has no panel because the product id does not exist until the passport is saved.
  - No backend, Product schema, ModuleMaterials, QuickCreate, or deploy changes.
