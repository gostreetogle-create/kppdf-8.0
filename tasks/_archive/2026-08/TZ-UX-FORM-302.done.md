# TZ-UX-FORM-302 — Form sections canon → QuickCreate

═══════════════════════════════════════════════════════════════
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08
closed_by: Buffy / agent-acfffc1331
protected_files:
  - frontend/src/app/shared/ui/form-section/form-section.component.ts
  - frontend/src/app/shared/ui/form-section/index.ts
  - frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.ts
  - frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.spec.ts
  - frontend/src/app/pages/materials/material-form-dialog.component.ts
  - frontend/src/app/pages/materials/material-form-dialog.component.spec.ts
  - docs/pages/ui-form-sections-canon.md
  - docs/DIALOG-COOKBOOK.md
verification:
  - acceptance criteria: PASS
  - tsc: PASS
  - targeted Jest: PASS (2 suites, 49 tests)
  - Angular development build: PASS
  - scoped ESLint: PASS
  - diff check: PASS
  - checklist: UPDATED
  - progress.md: UPDATED
  - lock file: CREATED
notes:
  - Material and QuickCreate use shared app-pi-form-section.
  - QuickCreate keeps FORM-301 12-column capacity classes and omits empty groups.
  - Photo/BOM/backend/profile/nav/sweep scope was not changed.
═══════════════════════════════════════════════════════════════
