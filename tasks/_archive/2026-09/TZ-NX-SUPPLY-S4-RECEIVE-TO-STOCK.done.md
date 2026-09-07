# TZ-NX-SUPPLY-S4-RECEIVE-TO-STOCK — DONE

- **agent_id:** claude
- **implementation_sha:** pending (filled at closeout)
- **TZ:** tasks/_ready/nx-supply/TZ-NX-SUPPLY-S4-RECEIVE-TO-STOCK.md
- **WAVE:** WAVE-NX-SUPPLY-OPS (4/7)
- **Deps:** TZ-SUPPLY-BE-INVOICE-DELIVERY (`1c4c381a`), TZ-NX-WAREHOUSE-DEFAULT (`08149e8e`), S3 journal (`a11234ee`)

## Что сделано

- **Schema:** `SupplyRequest.receivedQty?: number` (actual, may differ from planned `qty`).
- **DTO:** `ReceiveSupplyRequestDto` (`warehouseId?`, `receivedQty` required, min 0.0001).
- **Service:** `SupplyRequestService.receive(id, dto, organizationId)` — 409 `ConflictException` if already `received`; 400 `BadRequestException` if no `materialId` or (no `warehouseId` and no default warehouse); else `StockMovementService.create({type:'in', materialId, warehouseId, qty: receivedQty, orderId?, documentRef: 'SupplyRequest:<id>'})` then `status='received'` + `receivedQty` saved. Single write-path — no direct `StorageItem` mutation, reuses the same service `/stock-movements` uses.
- **Module:** `SupplyRequestModule` now imports `WarehouseModule` + `StockMovementModule` (both already export their services; no circular import).
- **Controller:** old status-only `POST :id/received` (`markReceived`, no FE caller) replaced by `POST :id/receive` (body-taking, same `admin`/`manager` roles).
- **FE:** `supply-request-receive-dialog.component.ts` — warehouse `<select>` prefilled to `Warehouse.isDefault` (falls back to first warehouse; user can still change it, and must pick one if there's no default), `receivedQty` input prefilled to the planned `qty`. Wired into `/supply-requests` (S3 journal, the SoT for `SupplyRequest` — TZ draft said `/supply`, adapted per the S3 decision made earlier in this wave) as a «Получено» button, shown only when status is receivable (`in_progress`/`requested`/`ordered`) and a `materialId` is linked.
- **Docs:** `docs/pages/supply.page.md` — new §NX TZ-NX-SUPPLY-S4-RECEIVE-TO-STOCK section; fixed the stale known-limitation line that used to also blame `SupplyRequestService.markReceived` (now closed; `SupplyTask`'s equivalent gap remains, out of scope).

## Gates (все зелёные)

```
backend tsc -p tsconfig.build.json --noEmit → 0
backend pnpm test -- supply-request → 22/22 (5 new)
backend pnpm test (full) → 130 suites / 1257 tests PASS
backend pnpm exec eslint (changed files) → 0 issues
frontend-nx nx test kppdf-web (full) → 97 suites / 632 passed / 7 skipped / 0 FAIL
frontend-nx nx test data-access → 24 suites / 120 passed
frontend-nx nx lint kppdf-web (changed files) → 0 new issues
pnpm architecture:check → 1465 files, baseline 17, 2 resolved
frontend-nx nx build kppdf-web → SUCCESS (last gate)
```

## AC чек

1. Confirm создаёт IN + received; повтор → 409 ✔ (spec)
2. Default warehouse подставляется ✔ (FE prefill + BE fallback, spec covers both explicit and default paths)
3. gates; archive ✔

## known_limitation

`SupplyTask.markReceived` (the separate `/supply` entity) still doesn't post to stock — pre-existing backend gap, documented, out of this TZ's scope (only `SupplyRequest` was in scope here).

## НЕ тронуто

Ячейки/полки; Purchase*; `SupplyTask` receive path; dropDatabase.
