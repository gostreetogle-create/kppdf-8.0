═══════════════════════════════════════════════════════════════
TZ-CATALOG-302: Composition API Product + Module — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-04
closed_by: backend executor + Cursor Architect PASS (re-ran e2e 6/6)
acceptance_status: PASS
verification:
  - composition-line unit: 4/4 PASS
  - catalog-composition e2e: 6/6 PASS (dedup 2+3→5)
  - backend tsc: PASS (executor report)
protected_files:
  - backend/src/modules/catalog/composition-line.*
  - backend/src/modules/product/**
  - backend/src/modules/product-module/**
  - backend/test/e2e/catalog-composition.e2e-spec.ts
checklist: docs/agent-checklists/TZ-CATALOG-302.md
lock: .mimocode/locks/TZ-CATALOG-302-composition-api.lock

---

## Summary

`composition[]` CRUD на Product и Module; Product rejects `raw` material;
dedup (lineType,refId) quantity++; dual-read legacy без записи.
Bugfix: plain objects before `$set` / upsert (Mongoose subdoc mix).
