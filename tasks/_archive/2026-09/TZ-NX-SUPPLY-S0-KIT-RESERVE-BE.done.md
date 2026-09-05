# TZ-NX-SUPPLY-S0-KIT-RESERVE-BE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: claude

## Verification

- acceptance criteria: PASS — availability endpoint returns per-material need/available/status + summary; confirm-reserve is atomic, reserves ok-lines and creates a `SupplyRequest` for short-lines (never a silent partial); no OUT stock movement written.
- backend typecheck: PASS — `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit`.
- backend tests: PASS — `cd backend && pnpm test` (128 suites / 1215 tests; 18 new tests across `kit-reserve.service.spec.ts` + `reservation.service.spec.ts`, 2 updated in `supply-request.service.spec.ts`, 1 fixture update in `order.controller.spec.ts`).
- lint: PASS — `cd backend && pnpm lint` (0 errors; only pre-existing `any` warnings elsewhere).
- architecture: PASS — `pnpm architecture:check`.

## Delivered

- `KitReserveService` (`backend/src/modules/order/kit-reserve.service.ts`): `getAvailability` + `confirmReserve` for one order line, walking the existing Product/ProductModule composition (dual-read, no second BOM model) into a materialId→qty map (recurses into nested modules and nested products), cross-referencing `StorageItem`.
- Two new endpoints on `OrderController`: `GET/POST /orders/:id/items/:itemIndex/kit-availability|kit-reserve`.
- `Reservation` schema/DTO/service extended to hold `materialId` (alongside the existing `productId`) + `orderItemIndex`, mirroring the `StorageItem` productId/materialId discriminator; `create`/`release`/`fulfill` generalized and de-duplicated; existing productId (finished-good) path regression-tested.
- `SupplyRequestService.create` now accepts an optional `ClientSession` so it can join the same transaction as the reservation writes.

## Scope disclosure

- `frontend-nx/**` and `app.routes.ts` were never opened — Freebuff owns the warehouse UI (W1/W2) per `PARALLEL-SLOTS-WAREHOUSE-SUPPLY.md`.
- S1 (`/supply` NX page) and S2 (order-hub confirm) are explicitly NOT started — per the prompt, they wait for W1 (Freebuff warehouse shell) to be DONE and archived.
- Actual stock consumption (OUT movement on fulfill) for material reservations is generalized code-wise for consistency but has no caller yet in this TZ's scope — declared successor work.
- known_limitation: one StorageItem row per material per kit-reserve call (no cross-warehouse/zone split) — matches the current single-warehouse operating reality (PO-CANON "Склад — один").

## Commit

- see git log
