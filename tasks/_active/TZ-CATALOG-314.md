═══════════════════════════════════════════════════════════════
TZ-CATALOG-314: Archive / soft-delete / auth consistency
═══════════════════════════════════════════════════════════════

> READY FOR REVIEW. Source: `tasks/_backlog/catalog/TZ-CATALOG-314.md`.
> Module hard-delete → soft/archive; запрет удалять узлы в snapshots;
> backend roles/org-scope audit по catalog endpoints.

## Conflict keys

- `backend/src/modules/product-module/product-module.schema.ts`
- `backend/src/modules/product-module/product-module.service.ts`
- `backend/src/modules/product-module/product-module.controller.ts`
- `backend/src/modules/product/product.schema.ts`
- `backend/src/modules/product/product.service.ts`
- `backend/src/modules/product/product.controller.ts`
- `backend/src/modules/material/material.schema.ts`
- `backend/src/modules/material/material.service.ts`
- `backend/src/modules/material/material.controller.ts`
- `backend/src/modules/work-type/work-type.schema.ts`
- `backend/src/modules/work-type/work-type.service.ts`
- `backend/src/modules/work-type/work-type.controller.ts`
- `backend/src/modules/category/category.schema.ts`
- `backend/src/modules/category/category.service.ts`
- `backend/src/modules/category/category.controller.ts`
- `backend/src/modules/product-module-photo/product-module-photo.service.ts`
- `backend/src/modules/catalog/catalog-314.archive.spec.ts`
- checklist/active-map/active marker

## Claim slot

- agent_id: Buffy / openai/gpt-5.6-luna
- claimed_at: 2026-08-05T21:20:55Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room command in this session)

## Scope guard

Do not touch desktop/MCP, TZD-*, frontend/UI-kit removal, start.mjs, warehouse, or `tasks/Данные`. Preserve ProductModulePhoto, ProductPassport, InventorFile, and TZ-CATALOG-313 dual-write behavior.

## Gates

- backend tsc: PASS
- focused Jest: PASS (6 suites / 49 tests)
- scoped ESLint: PASS
- scoped diff check: PASS

## Handoff

READY FOR REVIEW; no archive, lock, commit, or push until PO/Cursor PASS and explicit closeout instruction.

**Stop point (Buffy 2026-08-06 night):** session dead (no free session / Calpost).  
**Tomorrow script (single SoT):** `tasks/_backlog/catalog/TZ-DAY-2026-08-07-catalog-314-closeout-then-320.md`  
→ re-verify gates → scoped commit/push/archive 314 → then TZ-CATALOG-320.
