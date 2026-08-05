# TZ-CATALOG-313 checklist

> Status: **DONE**
> Source: `tasks/_backlog/catalog/TZ-CATALOG-313.md`
> Commit/push: authorized by PO for this closeout.

## Claim slot

- agent_id: Buffy / openai/gpt-5.6-luna
- claimed_at: 2026-08-05T19:40:59Z
- workspace: `D:\\kppdf-8.0`
- team_room_claim: unavailable — Team Room task sync does not include this backlog-only task

## Acceptance

- [x] ProductModule has canonical `photoIds` and `mainPhotoId` references matching Product/Material.
- [x] Legacy `ProductModulePhoto` entity/routes remain present; no rows or legacy module are deleted.
- [x] Legacy photo attach/set-main paths dual-write shared `Photo` references when a `photoId` is available.
- [x] Canonical references are never pulled automatically by legacy row deletion or replacement.
- [x] Typed attachment contract supports Product, ProductModule, and Material with typed document roles.
- [x] Attachment mutations are authenticated, role-scoped, audited, organization-aware, and re-check the current parent.
- [x] Existing ProductPassport and InventorFile collections remain untouched; no new boolean flags introduced.
- [x] Focused tests cover typed attachments, organization boundaries, soft-delete, legacy dual-write, and canonical-reference preservation.

## Gates (fact)

- [x] Backend TypeScript — PASS.
- [x] Focused Jest — PASS, 3 suites / 15 tests.
- [x] Scoped ESLint — PASS, 0 errors.
- [x] Scoped `git diff --check` — PASS; line-ending warnings only.

## Executor report

- Added `backend/src/modules/attachments/**` with typed schema, DTO/query validation, organization-aware service, audited controller, module wiring, and tests.
- Added canonical module photo fields and a non-destructive compatibility bridge without deleting ProductModulePhoto.
- No migration or rewrite of ProductPassport/InventorFile data.
- Foreign dirty paths (desktop/MCP, TZD, UI-kit, start, warehouse, frontend, `tasks/Данные`, and unrelated docs) were not staged.

## Closeout

- [x] Archive: `tasks/_archive/2026-08/TZ-CATALOG-313.done.md`.
- [x] Lock: `.mimocode/locks/TZ-CATALOG-313-attachments.lock`.
- [x] Progress updated.
- [x] Active marker removed.
- closed_at: 2026-08-06T00:00:00Z
