═══════════════════════════════════════════════════════════════
TZ-CATALOG-305: Product → Product + unitPriceOverride — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-04
closed_by: Buffy + Cursor Architect PASS
acceptance_status: PASS
verification:
  - backend tsc: PASS
  - focused unit: 38/38 PASS (Cursor)
protected_files:
  - backend/src/modules/catalog/composition-line.schema.ts
  - backend/src/modules/catalog/composition-line.dto.ts
  - backend/src/modules/catalog/composition-line.service.ts
  - backend/src/modules/product/product.service.ts
  - backend/src/modules/product-module/product-module.service.ts
checklist: docs/agent-checklists/TZ-CATALOG-305.md
lock: .mimocode/locks/TZ-CATALOG-305-product-product.lock

---

## Summary

lineType=product + unitPriceOverride; isComplex derived; module 400; cycles via graph.
Catalog Wave 1 backend complete. Next FE: DICT-308 Group Chip Workspace.
