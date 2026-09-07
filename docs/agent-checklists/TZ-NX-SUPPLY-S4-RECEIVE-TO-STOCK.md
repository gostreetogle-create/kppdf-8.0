# TZ-NX-SUPPLY-S4-RECEIVE-TO-STOCK checklist

> Status: **DONE**
> Marker: removed (`tasks/_active/TZ-NX-SUPPLY-S4-RECEIVE-TO-STOCK.md` deleted at closeout)
> Wave: `WAVE-NX-SUPPLY-OPS` (4/7)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-07T22:15:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this executor)

## Preflight

- [x] Deps confirmed DONE: TZ-SUPPLY-BE-INVOICE-DELIVERY, TZ-NX-WAREHOUSE-DEFAULT, S3 journal
- [x] `StockMovementService.create()` read — sole write-path, transactional, XOR productId/materialId, `qty` min 0.0001
- [x] `WarehouseService.findDefault()` read (from TZ2/7)
- [x] `SupplyRequestController`/`Service` read; confirmed no existing FE caller for the old `/received` route (safe rename to `/receive`)
- [x] `tasks/_active/` checked — no competing claim

## Acceptance

- [x] Confirm создаёт IN + received; повтор → 409 (documented, no reverse-path)
- [x] Default warehouse подставляется (server-side fallback + FE prefill, either works — FE always sends the selected id)
- [x] gates; archive

## Integrity slot (before READY / archive)

- [x] Type: other (new BE action route on existing entity + existing-page UI; no new permission — reused `admin`/`manager` roles already on other SupplyRequest actions)
- [x] FIC §A–E: N/A — no new permission/module/MCP
- [x] page.md: `docs/pages/supply.page.md` — new §NX TZ-NX-SUPPLY-S4-RECEIVE-TO-STOCK section; fixed the now-stale `SupplyRequestService.markReceived` known-limitation line
- [x] DOMAIN-MAP: N/A — existing entities (SupplyRequest, StockMovement, Warehouse), no new module/route contour
- [x] Coupling map: N/A — StockMovement write goes through the existing single write-path (`StockMovementService`), no direct StorageItem mutation added
- [x] No unrelated dirty WIP staged

## Build integrity

- [x] `cd frontend-nx && pnpm exec nx build kppdf-web` — green (last gate); `supply-requests-page` chunk grew with the receive dialog

## Gates (fact)

- PASS: `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit`
- PASS: `cd backend && pnpm test -- supply-request` — 22/22 (5 new for receive())
- PASS: `cd backend && pnpm test` (full) — 130 suites / 1257 tests
- PASS: `cd backend && pnpm exec eslint` changed files — 0 issues
- PASS: `cd frontend-nx && nx test kppdf-web` (full) — 97 suites / 632 passed / 7 skipped / 0 failed
- PASS: `cd frontend-nx && nx test data-access` — 24 suites / 120 passed
- PASS: `nx lint kppdf-web` changed files — 0 new issues
- PASS: `pnpm architecture:check` — 1465 files, baseline 17, 2 resolved
- PASS: `cd frontend-nx && pnpm exec nx build kppdf-web` (last)

## Executor report

- BE: `SupplyRequest.receivedQty` field added; `ReceiveSupplyRequestDto` (`warehouseId?`, `receivedQty`); `SupplyRequestService.receive()` — 409 on repeat receive, 400 on no-material or no-warehouse-and-no-default, else calls `StockMovementService.create({type:'in', materialId, warehouseId, qty, orderId?, documentRef})` then sets `status='received'` + `receivedQty`. `SupplyRequestModule` now imports `WarehouseModule` + `StockMovementModule` (no circular dependency — neither imports back). Controller route renamed `/received` (old status-only `markReceived`, no FE caller) → `/receive` (new, body-taking).
- FE: `supply-request-receive-dialog.component.ts` (warehouse select prefilled to `Warehouse.isDefault`, qty prefilled to planned `qty`) wired into `supply-requests.page.ts` as a «Получено» button, shown only for receivable status + linked `materialId`. `PiSupplyRequestsService.receive()` + `ReceiveSupplyRequestPayload`/`receivedQty` added to data-access.
- Deviation from TZ draft: PAGES/CONFLICT KEYS named `/supply`, but S3 (this wave, done earlier) already made `/supply-requests` the SoT for `SupplyRequest` — placed the confirm dialog there instead, noted in the claim file.
- conflict disclosure: unrelated dirty WIP in the tree (docker-compose.yml, start.mjs, build-info.ts, data/, reports/, other nx-supply TZ files for later waves) — none staged.
- known limitation: none new for this TZ's scope; `SupplyTask.markReceived` (the *other* supply entity, `/supply`) still doesn't post to stock — pre-existing, documented, out of this TZ's scope.

## Closeout

- [x] archive + DONE lock + remove `_active` marker
- closed_at: 2026-09-07T23:00:00+03:00
