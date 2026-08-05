═══════════════════════════════════════════════════════════════
TZ-CATALOG-314: Archive / soft-delete / auth consistency — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-06
closed_by: Cursor closeout after Buffy READY FOR REVIEW (PO deploy path)
acceptance_status: PASS
verification:
  - backend tsc: PASS
  - focused Jest: PASS (5 suites / 46 tests — catalog-314.archive + product-module/material/work-type/product-module-photo services)
  - scoped ESLint: PASS
  - scoped git diff --check: PASS
legacy_preserved:
  - ProductModulePhoto dual-write (TZ-CATALOG-313)
  - ProductPassport / InventorFile untouched
  - opaque HTML/design/build snapshots not parsed (archive non-destructive)
checklist: docs/agent-checklists/TZ-CATALOG-314.md
lock: .mimocode/locks/TZ-CATALOG-314-archive.lock
source_was: tasks/_backlog/catalog/TZ-CATALOG-314.md (pointer) + tasks/_active/TZ-CATALOG-314.md
handoff: docs/agent-handoff-2026-08-06-TZ-CATALOG-314.md

---

## Summary

ProductModule hard-delete → soft archive (`deletedAt`); Product/Material/WorkType/Category
active-read filters; structured ref guards → 409; org-scope on owned Product/Material/Category
(+ composition/tree); ProductModule/WorkType remain shared; archived modules block legacy photo writes.
