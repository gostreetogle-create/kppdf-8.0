# TZ-UX-FORM-304 — QuickCreate L composition

═══════════════════════════════════════════════════════════════
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08
closed_by: Buffy / agent-acfffc1331
protected_files:
  - frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.ts
  - frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.spec.ts
  - frontend/src/app/pages/products/product-bom-panel.component.ts (reuse-only; unchanged)
  - frontend/src/app/shared/ui/dialog/pi-dialog.component.ts (maxWidth contract; unchanged)
  - docs/agent-checklists/TZ-UX-FORM-304.md
verification:
  - acceptance criteria: PASS
  - product L create remains open on live created product id: PASS
  - reused ProductBomPanel renders and retains catalog actions: PASS
  - optional empty BOM and «Готово» close flow: PASS
  - composition dialog max-width: PASS (min(1100px, 100vw - 2rem))
  - tsc: PASS
  - Angular development build: PASS
  - targeted Jest: PASS (2 suites, 18 tests)
  - scoped ESLint: PASS
  - scoped Prettier: PASS
  - diff check: PASS
  - checklist: UPDATED
  - progress.md: UPDATED
  - lock file: CREATED
known_limitations:
  - Module L remains product-only and closes after create; ProductBomPanel supports module roots, but extending QuickCreate module flow was not required by the product-only acceptance path and would expand this TZ.
  - The panel is reused directly from the product page; no second composition tree or picker was introduced.
═══════════════════════════════════════════════════════════════
