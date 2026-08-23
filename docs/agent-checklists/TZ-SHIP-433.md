# Checklist — TZ-SHIP-433 (реестр отгрузок + отмена ошибочной отгрузки)

**Status:** `CLAIMED / IN PROGRESS`

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-08-23T12:58:40+0300
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Conflict keys (только из TZ)

- `backend/src/modules/shipment/shipment.service.ts` ✅ свободен на старте
- `backend/src/modules/order/order.service.ts` — только чтение (не меняю)
- `frontend/src/app/pages/shipping/shipping.page.ts` ✅ свободен
- `frontend/src/app/shared/orders/order-hub-tray.component.ts` ✅ свободен
- `frontend/src/app/pages/desk/manager-desk.page.ts` ✅ свободен

## Acceptance criteria (из TZ)

1. Desk «Отгружено» → `/shipping` показывает запись. (уже работает, реестр живой)
2. «Отменить отгрузку» на scheduled → order снова `ready`, tray не «Отгружен».
3. После dispatch → cancel disabled + понятное сообщение (400 RU).
4. BE+FE tests; tsc; lint PASS.

## План

1. **BE** — `ShipmentService.cancelShipment(id, org)`:
   - txn (SessionRunner): shipment → guards (status draft/scheduled, нет dispatchedAt) →
     status=cancelled; order → если `order.status==='shipped'` и других активных shipment нет →
     rollback: status=ready, lines boardLane=to_ship, status=ready.
   - Order model в ShipmentService (`@InjectModel(Order.name)`) + регистрация в ShipmentModule.
   - Controller: `POST /shipments/:id/cancel-shipment` (admin/manager, AuditAction).
2. **FE** — `ShipmentsService.cancelShipment(id)`.
3. **FE** — shipping.page: кнопка «Отменить отгрузку» (draft/scheduled) + PiDialogService confirm
   + reload + toast; `data-test="shipping-cancel-{id}"`.
4. **FE** — tray: активная (не cancelled) отгрузка для блока «Отгружен»; кнопка
   «Отменить отгрузку» (если cancellable) → output `cancelShipment`.
5. **FE** — manager-desk: `onCancelShipment` → confirm → API → reload tray + list.
6. **Docs** — COUPLING-MAP (undo-принцип + contract), shipping.page.md (реестр, не stub),
   PO-CANON (уже есть строка undo — проверить).

## Gates

```bash
cd backend  && pnpm exec tsc -p tsconfig.build.json --noEmit && pnpm exec jest shipment --runInBand && pnpm lint
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest --testPathPattern="shipping|order-hub-tray|manager-desk" --runInBand
cd frontend && pnpm lint
git diff --check
```

## Результаты

- BE: TBD
- FE: TBD
- docs: TBD
- SHA: TBD
