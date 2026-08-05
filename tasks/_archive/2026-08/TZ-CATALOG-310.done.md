═══════════════════════════════════════════════════════════════
TZ-CATALOG-310: Where-used / backlinks API — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-05
closed_by: Buffy / openai-gpt-5.6-luna
acceptance_status: PASS
verification:
  - read-only Product/Module/Material/WorkType where-used routes: PASS
  - paginated page/limit/total/items contract: PASS
  - organization scope for owned Product/Material parents: PASS
  - shared ProductModule/WorkType limitation documented: PASS
  - composition + legacy fallback and orphan tolerance: PASS
  - authenticated roles/current-user context and Swagger docs: PASS
  - backend tsc: PASS
  - focused Jest: 4 suites / 46 tests PASS
  - scoped ESLint: PASS, 0 errors; 6 existing test-mock any warnings
  - conflict-key diff check: PASS
checklist: docs/agent-checklists/TZ-CATALOG-310.md
lock: .mimocode/locks/TZ-CATALOG-310-where-used.lock
source: tasks/_backlog/catalog/TZ-CATALOG-310.md

---

## Summary

Added shared read-only where-used endpoints for Product, Module, Material,
and WorkType with stable pagination, direct-edge orphan tolerance, canonical
composition reads, and legacy module/material fallback. Product and Material
parent queries use the caller organization scope; ProductModule and WorkType
remain explicitly shared because their current schemas have no organizationId.
