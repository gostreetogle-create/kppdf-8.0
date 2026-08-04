═══════════════════════════════════════════════════════════════
TZ-CATALOG-303: Graph guards — cycle + depth≤8 — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-04
closed_by: backend executor + Cursor Architect PASS (re-ran unit 7/7 + e2e 15/15)
acceptance_status: PASS
verification:
  - catalog-graph unit: 7/7 PASS
  - e2e catalog-composition + product-modules + products-attach-modules: 15/15 PASS
  - backend tsc: PASS
protected_files:
  - backend/src/modules/catalog-graph/**
  - backend/src/modules/product/product.service.ts
  - backend/src/modules/product/product.controller.ts
  - backend/src/modules/product/product.module.ts
  - backend/src/modules/product-module/product-module.service.ts
  - backend/src/modules/product-module/product-module.controller.ts
  - backend/src/modules/product-module/product-module.module.ts
checklist: docs/agent-checklists/TZ-CATALOG-303.md
lock: .mimocode/locks/TZ-CATALOG-303-graph-guards.lock

---

## Summary

CatalogGraphService: assertNoCycleAndDepth + getTree; guards on composition
POST/PATCH and legacy attachModule; tree endpoints maxDepth=8.
