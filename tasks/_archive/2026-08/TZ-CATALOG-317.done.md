═══════════════════════════════════════════════════════════════
TZ-CATALOG-317: FE composition client + cutover — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-04
closed_by: buffy/freebuff-fe + Cursor Architect PASS
acceptance_status: PASS
verification:
  - frontend tsc: PASS (Cursor)
  - targeted jest (service + product-form + products/modules pages): 63/63 PASS (Cursor)
  - executor full jest: 1023/1023 PASS
  - rg attach* in pages products+modules: CLEAN
protected_files:
  - frontend/src/app/shared/services/pi-product-modules.service.ts
  - frontend/src/app/shared/services/pi-product-modules.service.spec.ts
  - frontend/src/app/pages/products/**
  - frontend/src/app/pages/modules/**
  - docs/pages/products.page.md
  - docs/pages/modules.page.md
checklist: docs/agent-checklists/TZ-CATALOG-317.md
lock: .mimocode/locks/TZ-CATALOG-317-fe-composition-cutover.lock
source: tasks/_backlog/catalog/TZ-CATALOG-317.md

---

## Summary

FE пишет состав через /composition; attach stubs throw; dual-read
composition-first на lists/detail/dialogs. GATE перед 304 снят.
