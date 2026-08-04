═══════════════════════════════════════════════════════════════
TZ-CATALOG-304: Legacy migration → composition — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-04
closed_by: Basher (core) + Cursor Architect closeout PASS
acceptance_status: PASS
verification:
  - backend tsc: PASS
  - unit migrate + product-module: 8/8 PASS
  - e2e focused 5 suites: 25/25 PASS
protected_files:
  - backend/src/database/migrations/2026-08-04-TZ-CATALOG-304-composition-migrate.ts
  - backend/src/modules/product/product.service.ts
  - backend/src/modules/product-module/product-module.service.ts
  - backend/src/modules/cost-calculation/cost-calculation.service.ts
  - backend/src/modules/cost-calculation/cost-calculation.module.ts
  - backend/test/e2e/products-attach-modules.e2e-spec.ts
  - backend/test/e2e/product-modules.e2e-spec.ts
  - backend/test/e2e/cost-calculation.e2e-spec.ts
checklist: docs/agent-checklists/TZ-CATALOG-304.md
lock: .mimocode/locks/TZ-CATALOG-304-composition-migrate.lock

---

## Summary

Legacy → composition migration (skip-if-nonempty, idempotent); runtime write lock;
cost dual-read; e2e on composition API. Next backend stream: TZ-CATALOG-305.
