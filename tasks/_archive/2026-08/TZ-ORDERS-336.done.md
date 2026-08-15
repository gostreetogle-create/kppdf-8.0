# TZ-ORDERS-336.done — Order form productId + default Site + freeze UX

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-15
closed_by: cursor-grok-4.6-executor
TZ: TZ-ORDERS-336
DEP: none

verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (FE order-form-dialog 9; BE site.service 4)
  - lint: PASS (owned files)
  - checklist: ADDED
  - progress.md: UPDATED
  - status synchronization: PASS

## Outcome

- `onProductPick` sets `productId` (+ dirty/touched); RU under picker and on submit «Выберите изделие в каждой позиции».
- Empty Site list after Counterparty → `POST /api/sites/ensure-default` (BE `ensureDefaultForCounterparty`, same as convert) and auto-select.
- Edit `in_production`/`ready`: composition UI disabled; PATCH only `plannedDate`+`priority`. `shipped`/`delivered`/`cancelled`: read-only + RU. BE 400 mapped to clear RU.
- Header `plannedDate` is `type="date"`; new line `plannedShipDate` defaults to header date or today.

## Verification

- `frontend` `tsc -p tsconfig.app.json --noEmit`: PASS
- `backend` `tsc -p tsconfig.build.json --noEmit`: PASS
- `frontend` jest order-form-dialog.component.spec: PASS — 9 tests
- `backend` jest site.service.spec: PASS — 4 tests
- eslint owned files: PASS
- deploy: NOT RUN (PO: no deploy)

## Files

- `frontend/src/app/pages/orders/order-form-dialog.component.ts`
- `frontend/src/app/pages/orders/order-form-dialog.component.spec.ts`
- `frontend/src/app/shared/services/pi-site.service.ts`
- `backend/src/modules/site/site.controller.ts`
- `backend/src/modules/site/dto/create-site.dto.ts`
- `docs/pages/orders.page.md`
- `docs/pages/PAGE-TZ-INDEX.md`

## Lock

`.mimocode/locks/TZ-ORDERS-336-order-form-save-site-freeze.lock`
