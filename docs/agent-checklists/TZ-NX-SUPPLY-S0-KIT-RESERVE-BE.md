# TZ-NX-SUPPLY-S0-KIT-RESERVE-BE checklist

> Status: **DONE**
> Marker: none in `tasks/_active/` — see process note below.
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-05T19:15:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI configured in this session)

**Process note:** `_NOW.md` / `PARALLEL-SLOTS-WAREHOUSE-SUPPLY.md` already showed Claude as the sole owner of Slot B (backend order/reservation/storage-item/supply) with `tasks/_active/` empty and Freebuff confined to `frontend-nx/**` (Slot A). Implementation started directly from that state without also mirroring the TZ into `tasks/_active/<TASK-ID>.md`. No conflicting claim existed at any point (verified `tasks/_active/` empty before, during, and at archive) and CONFLICT KEYS were respected exactly, so this is a paperwork gap, not a coordination miss — flagged here rather than silently skipped.

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md`, `PARALLEL-SLOTS-WAREHOUSE-SUPPLY.md`, `WAVE-NX-SUPPLY.md`, `tasks/_active/` (empty) — Freebuff scoped to `frontend-nx/**` only, no BE conflict
- [x] TZ прочитан; deps (Z-001 SessionRunner, TZ-INVENTORY-301 park spirit) прочитаны

### Preflight Check Output
- **Context read:** `tasks/_ready/nx-supply/TZ-NX-SUPPLY-S0-KIT-RESERVE-BE.md`, `tasks/_park/TZ-INVENTORY-301-availability-check-on-order.md`, `backend/src/modules/reservation/{reservation.schema,reservation.service}.ts`, `backend/src/modules/storage-item/storage-item.schema.ts`, `backend/src/modules/supply/{supply-request.schema,supply-request.service}.ts`, `backend/src/modules/order/{order.schema,order.controller,order.service,order.module}.ts`, `backend/src/modules/cost-calculation/cost-calculation.service.ts` (existing composition walker — reused precedence, not reimplemented as cost math), `backend/src/modules/catalog/composition-line.service.ts`, `backend/src/common/db/session-runner.ts`, `backend/src/modules/product/product.schema.ts`, `backend/src/modules/material/material.schema.ts`
- **Key Constraints:** reuse existing dual-read composition (no second BOM model); atomic via `SessionRunner`; soft shortage (no hard-stop); no OUT stock movement in this TZ; frontend-nx untouched (Freebuff owns warehouse UI + `app.routes.ts`)
- **Planned Deliverable:** `GET/POST /orders/:id/items/:itemIndex/kit-availability|kit-reserve` backed by a new `KitReserveService`; `Reservation` extended with `materialId`/`orderItemIndex` alongside existing `productId`
- **Validation Path:** backend tsc + full `pnpm test` + `pnpm lint` + `pnpm architecture:check`

**Проверено:** FE hub (не в этом TZ) не пишет reserve; заказ без состава (материалов) даёт явный 400, не тихий пустой результат; частичный резерв short-линии не создаётся молча.

---

## Design decisions (TZ wording was underspecified — recorded for S1/S2)

1. **Reservation now supports `materialId` as an alternative to `productId`** (mirrors the existing `StorageItem` discriminator pattern exactly) — kit-reserve holds *materials*, not finished products; the pre-existing `Order.reserveStock`/`productId` path is untouched and regression-tested.
2. **Short-line behavior:** literal reading of "reserve ok + create SupplyRequest per short material" — a short line gets **zero** reservation (not a silent partial), and a `SupplyRequest` is created for exactly the shortfall (`needQty - availableQty`). This is the least ambiguous reading of "не частичный silently" and keeps `Reservation.qty` always meaning "fully covered."
3. **known_limitation (disclosed, not silently cut):** one `StorageItem` row per material is picked for a given kit-reserve (the row with the most available stock) — no split-reservation across multiple warehouses/zones for a single material in one call. Matches PO-CANON "Склад — один"; revisit only if multi-warehouse split kitting becomes a real request.
4. **Composition walk deliberately diverges from `CostCalculationService.walkModule` in one place:** it also recurses into nested `lineType=product` composition lines (cost preview intentionally does not, since it only needs `child.costPrice`). Physical kitting needs the real materials of a nested product, not its price. Same dual-read precedence (`composition` → legacy `productModuleIds`/`materials[]`), same cycle guards.
5. `Reservation.orderItemIndex` (optional) added now — no consumer yet, but it's the natural key S1/S2 (order-hub confirm) will need to correlate a reservation back to one order line without re-deriving it.

## Acceptance (из TZ)

- [x] Availability endpoint: lines `{materialId, needQty, availableQty, warehouseId, status}` + `summary.canReserveAll`; 400 RU when the product has no composition snapshot at all
- [x] Confirm reserve: atomic (`SessionRunner`) — ok-lines get a real `Reservation` (materialId + warehouseId + qty), short-lines get a `SupplyRequest` for the shortfall, never a silent partial; returns `{ reserved, supplyRequestIds, warnings }`
- [x] No OUT stock movement written by this TZ (fulfill/consume stays a successor)
- [x] Atomic: a mid-loop failure rejects the whole `confirmReserve` call (order not saved, no dangling reservations) — verified at the unit level trusting `SessionRunner`'s real transaction (same testing convention as `OrderService.reserveStock`/`ship`)

## Integrity slot

- [x] Тип изменения: module (backend schema extension + two new endpoints on an existing controller)
- [x] FIC: no new page/route/permission/MCP — existing `Roles('admin','manager')` reused, matching `reserve-stock`/`ship`; N/A §A/§B/§E
- [x] page.md: N/A — backend-only, no NX page exists yet (S1 adds `/supply`)
- [x] DOMAIN-MAP: N/A — no module/route/page contour changed this TZ (S1 will add the `/supply` line)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; `frontend-nx/**` and `app.routes.ts` never opened (Freebuff's W1/W2 warehouse work, confirmed still dirty/untouched by me in git status)
- [x] COUPLING-MAP: N/A — `Reservation`/`SupplyRequest` are not a cross-page shared status/FK field in the COUPLING-MAP sense (no UI consumes this yet)
- [x] Канон: `docs/DOCS-INTEGRITY.md` соблюдён

## Gates (факт)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → PASS
- `cd backend && pnpm test` → PASS: 128 suites, 1215 tests (10 new in `kit-reserve.service.spec.ts`, 8 new in `reservation.service.spec.ts`, 2 updated in `supply-request.service.spec.ts` for the new array-based `model.create` call, 1 fixture update in `order.controller.spec.ts` for the new `KitReserveService` constructor arg)
- `cd backend && pnpm lint` → 0 errors (198 pre-existing `any` warnings elsewhere, none in touched files)
- `pnpm architecture:check` → PASS (1441 files; baseline 17, 2 resolved)

## Executor report

**New:** `backend/src/modules/order/kit-reserve.service.ts` (+ spec) — `KitReserveService`:
- `getAvailability(orderId, orderItemIndex, organizationId?)` — walks the order item's product composition (dual-read, materials + nested modules + nested products) into a `Map<materialId, needQty>`, cross-references `StorageItem` for the best available row per material, returns per-line status + summary.
- `confirmReserve(...)` — same walk inside `SessionRunner.run`; ok-lines → `ReservationService.create` (materialId-based, session-scoped); short-lines → `SupplyRequestService.create` for the shortfall; persists `order.reservationIds`.

**Extended for the materialId path (mirrors the existing productId path, regression-tested):**
- `reservation.schema.ts` / `dto/create-reservation.dto.ts`: `productId` now optional, added `materialId?` + `orderItemIndex?`.
- `reservation.service.ts`: `create`/`release`/`fulfill` generalized to filter by whichever ref (`materialId ?? productId`) is set; de-duplicated the `create` external/internal-session branches and the `fulfill`/`runFulfillOnSession` branches into one shared path each (net simplification, not just addition).
- `supply-request.service.ts`: `create()` now accepts an optional `ClientSession` (array-based `model.create` + session-aware material lookup) so it can participate in the same transaction as the reservation writes.
- `order.module.ts` / `order.controller.ts`: wired `KitReserveService` + two new endpoints (`GET/POST /orders/:id/items/:itemIndex/kit-availability|kit-reserve`), `Roles('admin','manager')` matching `reserve-stock`/`ship`.

**Conflict disclosure:** touched exactly `backend/src/modules/{order,reservation,storage-item(read-only import),stock-movement(schema already supported materialId, no change),supply}/**` per CONFLICT KEYS, plus `Material`/`Product`/`ProductModule` read-only model imports (already wired into `order.module.ts` for an unrelated existing feature, or added read-only here). **Zero** `frontend-nx/**` files opened or touched — Freebuff's warehouse UI (W1/W2) and `app.routes.ts` are untouched.

**Known limits:** see Design decisions §3 above (single-row-per-material reservation, no cross-warehouse split). Fulfill/OUT movement for material reservations is generalized code-wise (for consistency with `release()`) but not exercised by any caller yet — that's the declared successor scope.

## Review handoff

- [x] TZ has no review-inbox wave requirement — archive directly after gates

## Closeout

- [x] archive + progress + `_active` confirmed empty
- Status = DONE
- closed_at: 2026-09-05T19:45:00Z

## Stop (per PROMPT-CLAUDE-NX-SUPPLY.md)

S0 is DONE. **Not** starting S1/S2 — W1 (Freebuff warehouse shell) is not yet DONE (currently W2 in progress per `_NOW.md`). Per PARALLEL-SLOTS and the prompt's own queue: S1 needs `app.routes.ts`, which Freebuff owns until W1 archives. Stopping here and reporting idle.
