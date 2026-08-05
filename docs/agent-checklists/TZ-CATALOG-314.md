# TZ-CATALOG-314 checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-CATALOG-314.md`
> Commit/push: pending PO instruction; no commit or push performed

## Claim slot

- agent_id: Buffy / openai/gpt-5.6-luna
- claimed_at: 2026-08-05T21:20:55Z
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable (no team-room command in this session)

## Preflight

- [x] Canonical workspace is `D:\kppdf-8.0`; `git pull --ff-only` completed.
- [x] Read `_active-map.md` and current active markers; no competing 314 claim found.
- [x] Read `tasks/_backlog/catalog/TZ-CATALOG-314.md` and project executor rules.
- [x] Claim slot filled before product-code changes.
- [x] `tasks/_active/TZ-CATALOG-314.md` created.

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
- `docs/agent-checklists/TZ-CATALOG-314.md`
- `docs/agent-checklists/_active-map.md`
- `tasks/_active/TZ-CATALOG-314.md`

## Acceptance

- [x] ProductModule DELETE no longer hard-deletes; it archives with `deletedAt`, and default reads exclude archived records.
- [x] Structured historical/BOM/catalog references block archive with HTTP 409 before the archive update. Opaque HTML/design/build snapshots are preserved and not parsed because all catalog deletes are non-destructive archives.
- [x] Product/Material/Category CRUD and Product composition/tree routes receive authenticated organization scope; ProductModule and WorkType remain explicitly shared because their schemas have no organization ownership field.
- [x] ProductModulePhoto and the 313 dual-write bridge remain non-destructive; ProductPassport/InventorFile remain untouched.
- [x] Focused tests cover archive behavior, reference guards, schema markers, role metadata, and controller org forwarding.

## Plan

1. Add minimum archive fields/filtering and structured historical-reference checks.
2. Audit roles and pass authenticated organization context to owned catalog operations.
3. Preserve ProductModulePhoto legacy bridge and add focused regression tests.
4. Run backend tsc, focused Jest, scoped ESLint, diff checks, and review.

## Gates (fact)

- [x] `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` — PASS.
- [x] Focused Jest: 6 suites / 49 tests — PASS.
- [x] Scoped ESLint for 314 backend sources/tests — PASS.
- [x] Scoped `git diff --check` — PASS.
- [x] Review completed; no remaining blocker after closing Product composition org-scope and archived ProductModulePhoto write gaps.

## Executor report

- Product, Material, WorkType, Category, and ProductModule now use nullable `deletedAt` archive markers and active-read filters.
- ProductModule hard delete was replaced by non-destructive archive; structured refs in BOM/product composition/cost/order/quotation/purchase/work history block archive.
- Explicit mutation roles remain on catalog endpoints; owned records receive organization scope, and shared ProductModule/WorkType behavior is documented.
- Legacy ProductModulePhoto, ProductPassport, InventorFile, and TZ-CATALOG-313 dual-write behavior remain preserved.
- Forbidden pre-existing dirty files were not staged or changed intentionally.

## Review handoff

- [x] READY FOR REVIEW after green gates.
- [ ] Archive/lock only after PO/Cursor PASS.

## Closeout

- [ ] archive + `ARCHIVE_MARKER` + lock + progress
- [ ] Status = DONE
- [ ] remove `tasks/_active/TZ-CATALOG-314.md`
