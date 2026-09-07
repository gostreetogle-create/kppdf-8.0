# TZ-NX-WAREHOUSE-DEFAULT checklist

> Status: **DONE**
> Marker: removed (`tasks/_active/TZ-NX-WAREHOUSE-DEFAULT.md` deleted at closeout)
> Wave: `WAVE-NX-SUPPLY-OPS` (2/7)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-07T20:45:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this executor)

## Preflight

- [x] `tasks/_active/` empty — no competing claim
- [x] TZ read; `warehouse.schema/dto/service/controller.ts` read (no existing service spec — created one)
- [x] FE surface read: `warehouses.page.ts`, `warehouse-form-dialog.component.ts`, `pi-warehouses.service.ts` (+ their specs)
- [x] Confirmed `Warehouse` has no `organizationId` scope → default is global, no per-org uniqueness needed

## Acceptance

- [x] Один default; findDefault работает
- [x] gates BE (+ nx build) green; archive

## Integrity slot (before READY / archive)

- [x] Type: other (new field + minimal existing-page UI; no new route/permission/module/MCP)
- [x] FIC §A–E: N/A — no route/permission/module/MCP change; reused existing PATCH endpoint (no new backend route)
- [x] page.md: `docs/pages/warehouses.page.md` — one-line TZ reference row
- [x] DOMAIN-MAP: N/A — no module/route contour changed
- [x] Coupling map: N/A — new flag on existing entity, service-enforced single-default invariant, no FK
- [x] No unrelated dirty WIP staged

## Build integrity

- [x] `cd frontend-nx && pnpm exec nx build kppdf-web` — green (last gate)

## Gates (fact)

- PASS: `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit`
- PASS: `cd backend && pnpm test -- warehouse` — 6/6 (new spec file, module had none before)
- PASS: `cd frontend-nx && nx test kppdf-web` (full project) — 95 suites / 618 passed / 7 skipped / 0 failed
- PASS: `nx lint kppdf-web` changed files — 0 new issues (pre-existing unrelated debt only)
- PASS: `pnpm architecture:check` — 1464 files, baseline 17, 2 resolved
- PASS: `cd frontend-nx && pnpm exec nx build kppdf-web` (last)

## Executor report

- Added `isDefault` to `Warehouse` schema (default false) + DTO; `WarehouseService.setDefault(id)` atomically unsets all others then sets the target (single private `clearOtherDefaults` helper shared by `create`/`update`/`setDefault`); `findDefault()` for S4. No new backend route — `isDefault` travels through the existing generic `PATCH /warehouses/:id` (via `UpdateWarehouseDto`, already `PartialType` of create).
- FE: form dialog gained an `isDefault` checkbox (payload always includes it, like `isActive`); list shows a `★ по умолчанию` badge on the default row and a quick "Сделать по умолчанию" action on the others (`PiWarehousesService.setDefault()` → partial PATCH `{isDefault: true}`, no new endpoint).
- Created `warehouse.service.spec.ts` (didn't exist before this TZ).
- conflict disclosure: unrelated dirty WIP in the tree (docker-compose.yml, start.mjs, build-info.ts, data/, reports/, other nx-supply TZ files for later waves) — none staged.
- known limitation: none for this TZ's scope.

## Closeout

- [x] archive + DONE lock + remove `_active` marker
- closed_at: 2026-09-07T21:00:00+03:00
