# Executor handoff — 2026-08-06 — TZ-CATALOG-314

> **Канон точки остановки Buffy по 314.**  
> План всего завтрашнего дня (314 closeout → 320):  
> `tasks/_backlog/catalog/TZ-DAY-2026-08-07-catalog-314-closeout-then-320.md`  
> Этот файл = детальный resume **только части A (314)**. Не дублировать второй claim.

## Resume point

Continue in canonical repository **`D:\kppdf-8.0`**, branch `main`.

- Current HEAD: **`a0d54f5`** — `docs(catalog): tomorrow DAY-07 — close 314 then run 320`
- `git pull --ff-only` was already completed earlier in this work.
- Local tree is intentionally dirty from multiple unrelated streams. **Do not clean, reset, stash, or broad-stage it.**
- Current repository has approximately 84 status lines, 70 tracked diff paths, and 13 untracked paths. Treat all non-314 changes as чужой dirty.

## TZ-CATALOG-313 — already closed

313 is **DONE / archived**, not a task to restart.

- Commit/hash in history: `cde79fc` (`feat(catalog): unify typed attachments and module photo refs (TZ-CATALOG-313)`).
- Archive: `tasks/_archive/2026-08/TZ-CATALOG-313.done.md` with `ARCHIVE_MARKER`.
- Checklist: `docs/agent-checklists/TZ-CATALOG-313.md` = DONE.
- Active marker `tasks/_active/TZ-CATALOG-313.md` is absent.
- Lock: `.mimocode/locks/TZ-CATALOG-313-attachments.lock`.
- Legacy that must remain: ProductModulePhoto routes/collection, URL-only photos, ProductPassport, InventorFile, and non-destructive Photo dual-write.

Do not recommit or modify 313 closeout unless a concrete defect is found and PO asks for it.

## TZ-CATALOG-314 — current status

314 is implemented and **READY FOR REVIEW**, but **not closed**.

- Living claim / conflict keys: `tasks/_active/TZ-CATALOG-314.md` (READY FOR REVIEW).
- Backlog stub is a **pointer only**: `tasks/_backlog/catalog/TZ-CATALOG-314.md` → active + this handoff + DAY-07 (не второй source of truth).
- Checklist: `docs/agent-checklists/TZ-CATALOG-314.md` says READY FOR REVIEW and records gates.
- Active map: `docs/agent-checklists/_active-map.md` says READY FOR REVIEW.
- Progress: `progress.md` has a new 314 READY FOR REVIEW entry at the top.
- Archive: `tasks/_archive/2026-08/TZ-CATALOG-314.done.md` does **not** exist yet.
- Lock: `.mimocode/locks/TZ-CATALOG-314-archive.lock` does **not** exist yet.
- No 314 commit/push was performed.

## 314 implementation already on disk (uncommitted)

Expected 314 conflict-key code files currently dirty:

- `backend/src/modules/category/category.controller.ts`
- `backend/src/modules/category/category.schema.ts`
- `backend/src/modules/category/category.service.ts`
- `backend/src/modules/material/material.controller.ts`
- `backend/src/modules/material/material.schema.ts`
- `backend/src/modules/material/material.service.ts`
- `backend/src/modules/product-module-photo/product-module-photo.service.ts`
- `backend/src/modules/product-module/product-module.controller.ts`
- `backend/src/modules/product-module/product-module.schema.ts`
- `backend/src/modules/product-module/product-module.service.ts`
- `backend/src/modules/product/product.controller.ts`
- `backend/src/modules/product/product.schema.ts`
- `backend/src/modules/product/product.service.ts`
- `backend/src/modules/work-type/work-type.controller.ts`
- `backend/src/modules/work-type/work-type.schema.ts`
- `backend/src/modules/work-type/work-type.service.ts`
- `backend/src/modules/catalog/catalog-314.archive.spec.ts` (untracked focused tests)

## What the implementation does

- Adds nullable `deletedAt` archive markers and active-read filtering to Product, ProductModule, Material, WorkType, and Category.
- Replaces ProductModule hard delete with non-destructive archive.
- Blocks archive on structured references in relevant order/quotation/BOM/cost/purchase/work/catalog collections with conflict errors.
- Passes authenticated `organizationId` through Product, Material, Category CRUD and Product composition/tree operations.
- Keeps ProductModule and WorkType explicitly shared because their schemas have no organization ownership field.
- Keeps explicit admin/manager (admin for Category) mutation role metadata.
- Prevents legacy ProductModulePhoto upsert/update/setMain from acting on archived modules while preserving the 313 dual-write bridge.
- Does not migrate or remove ProductPassport / InventorFile and does not parse opaque design/build/HTML snapshots; archive is non-destructive.

## Gates already recorded

Last full scoped run was green:

- Backend tsc: PASS — `pnpm exec tsc -p tsconfig.build.json --noEmit`
- Focused Jest: PASS — 6 suites / 49 tests (the latest added controller-org forwarding tests make the archive spec 8 tests; rerun before commit to confirm exact total)
- Scoped ESLint: PASS
- Scoped `git diff --check`: PASS
- Review completed; previous blockers closed: Product composition org-scope gap and archived ProductModulePhoto write gap.

Before commit, rerun the gates from the current disk state, especially after the final ProductModulePhoto guard edit.

## Tomorrow's exact sequence

1. Read this handoff, `tasks/_active/TZ-CATALOG-314.md`, checklist, and `git status`.
2. Do **not** touch forbidden dirty paths.
3. Rerun backend tsc, the 6 focused Jest suites, scoped ESLint, and scoped diff-check.
4. If all green and PO/Cursor has accepted READY FOR REVIEW: create `tasks/_archive/2026-08/TZ-CATALOG-314.done.md` with `ARCHIVE_MARKER`, `outcome: DONE`, gates, and legacy disclosure.
5. Update checklist to DONE, create `.mimocode/locks/TZ-CATALOG-314-archive.lock`, update active-map and append progress closeout entry, then remove `tasks/_active/TZ-CATALOG-314.md`.
6. Verify allowlist with `git status` and `git diff --cached --name-only`.
7. Only after explicit PO authorization / current instruction, commit and push **314 only**. If PO has not said commit/push, stop at READY FOR REVIEW.
8. After 314 is on origin: open DAY-07 **Часть B** → claim/execute `TZ-CATALOG-320` (не 311).

## Hard scope prohibitions

Never stage or modify:

- `desktop/` or MCP
- any `TZD-*` work
- frontend/UI-kit removal or frontend changes
- `start.mjs` / `start.cmd`
- warehouse/inventory work
- `tasks/Данные/`
- `deploy/**/__pycache__/`
- unrelated `README.md`, Docker, permissions, auth, or other dirty files

When staging 314, use an explicit path allowlist. Never run `git add .`.
