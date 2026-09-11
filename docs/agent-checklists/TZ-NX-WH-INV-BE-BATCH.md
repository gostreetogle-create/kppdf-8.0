# TZ-NX-WH-INV-BE-BATCH checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-09/TZ-NX-WH-INV-BE-BATCH.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-11T08:48:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто (01 DONE/archived), нет чужого CLAIM
- [x] TZ прочитан; `stock-movement.service.ts` (`create`/`applyIn`/`resolveTarget`/`targetFilter` — Z-001 transaction graph), `stock-movement.schema.ts`, `stock-movement.controller.ts`, `material.schema.ts` (`article`/`sku`), `product.schema.ts` (`sku`), `warehouse.schema.ts` (`isDefault`), `warehouse.service.ts` (confirmed the reverse-direction pattern: it already `@InjectModel`s StockMovement/StorageItem directly — mirrored here for Material/Product/Warehouse), `reservation.service.spec.ts` (session/transaction mock pattern reused for the new spec, no prior `stock-movement.service.spec.ts` existed at all)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-WH-INV-BE-BATCH.md` на месте

## Acceptance

- [x] Batch of 2 known materials → 2 IN + StorageItem qty updated — unit test
- [x] Unknown article → row error at index, others succeed (partial + errors[], documented) — unit test
- [x] Gates backend PASS

## Integrity slot (до READY / archive)

- [x] Тип изменения: module (new endpoint on existing controller/service)
- [x] FIC: C — new route documented in `stock-movements.page.md`
- [x] page.md обновлён: `stock-movements.page.md` §«Batch inventory IN»
- [x] DOMAIN-MAP/SECTION-READINESS: N/A — no new module/route/page contour, extension of existing StockMovement write path
- [x] Чужой WIP не в коммите; conflict keys соблюдены (touched `material.schema.ts`/`product.schema.ts`/`warehouse.schema.ts` only as read-only schema imports for `MongooseModule.forFeature`, not their services/controllers/DTOs — no behavior change to those modules at all)
- [x] Coupling map: N/A
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → **PASS** exit 0
- `cd backend && pnpm test -- stock-movement` → **PASS** 14/14 new tests (no prior spec existed for this service at all)
- `cd backend && pnpm test` (full) → **PASS** 131 suites / 1291 passed, no regressions
- `cd backend && pnpm lint` → **PASS** 0 errors / 198 pre-existing warnings (unchanged baseline)
- `pnpm architecture:check` → **PASS** (1476 files; baseline 17; resolved since baseline: 2)

## Executor report

- `POST /api/stock-movements/batch-in` (`StockMovementController.batchIn` → `StockMovementService.batchInventoryIn`): accepts `{ rows: [{ materialId | productId | article | sku, warehouseId? | warehouseName?, qty, documentRef? }], documentRef? }`.
- **Resolution** (`resolveInventoryTarget`): explicit `materialId`/`productId` wins (rejects if both given); otherwise `article` against `Material.article`, then `sku` against `Material.sku` then `Product.sku` (Material wins a sku tie — documented in page.md). **Warehouse** (`resolveInventoryWarehouse`): `warehouseId` → `warehouseName` (case-insensitive exact match, regex-escaped) → the single `isDefault: true` warehouse.
- **Write path**: every row that resolves is written through the SAME `this.create({ type: 'in', ... })` this class already exposes — one real Z-001 transaction per row (own `session.withTransaction`), not a new write-path and not a bulk single-transaction batch. This is a deliberate choice matching the TZ's own "partial + errors[]" policy: a bad row can't roll back the good ones around it.
- `StockMovementModule`: added `Material`/`Product`/`Warehouse` schema registrations (`MongooseModule.forFeature`) purely for read-only resolution lookups — mirrors the exact pattern `WarehouseModule` already uses in the opposite direction (it already injects `StockMovement`/`StorageItem` models directly). No new cross-module service dependency, no circular-import risk — schema registration only.
- New `stock-movement.service.spec.ts` (this service had **zero** prior test coverage) — 14 tests covering both ACs plus: sku Material-over-Product precedence, sku Product fallback, warehouse-by-name case-insensitivity, default-warehouse fallback, ambiguous materialId+productId rejection, missing-nomenclature rejection, unknown-warehouse-name row error, and a "never writes `*.stockQty`" structural guard (only `StockMovement.create` + `StorageItem` reads/writes are ever touched).
- `docs/pages/stock-movements.page.md`: new §«Batch inventory IN» — request/response shape, resolution order, partial-success policy, and the AC scenarios.
- No BE-side org-scoping added: neither `StockMovement`, `StorageItem`, `Material`(article/sku lookup here), `Product`, nor `Warehouse` schemas carry `organizationId` on this write path in the existing code (confirmed by reading all five schemas before writing), and the existing `POST /stock-movements` controller route already doesn't thread `req.user.organizationId` through either — this endpoint matches that exact existing convention rather than inventing new scoping.

## Closeout (после PASS)

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-11T09:05:00Z
