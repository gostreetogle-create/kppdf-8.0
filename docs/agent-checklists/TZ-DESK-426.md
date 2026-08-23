# TZ-DESK-426 — workflow chips: deep-link с orderId

**agent_id:** freebuff-desk-wave
**claimed_at:** 2026-08-23T11:45:35+0300
**workspace:** D:\kppdf-8.0
**team_room_claim:** unavailable
**Status:** CLAIMED / IN PROGRESS

## Conflict keys

- `frontend/src/app/pages/desk/desk-workflow-chips.ts`
- `frontend/src/app/pages/desk/manager-desk.page.ts`
- `frontend/src/app/pages/commercial/proposals/proposal-create.page.ts`
- `frontend/src/app/pages/supply/supply.page.ts`
- `frontend/src/app/pages/shipping/shipping.page.ts`

## AC

1. Expand → chip Снабжение → URL `orderId=<id>&from=desk`, supply показывает фильтр заказа.
2. «На стол» на supply возвращает `/desk?orderId=<id>` с expand.
3. Chip Отгрузка с expand → shipping отфильтрован/banner по заказу.
4. Expand + chip «КП» → `/proposals/create?source=order&sourceId=…` + форма с клиентом/позициями заказа.
5. Frontend gates PASS (tsc, test desk+supply+proposal-create, lint).

## Plan

1. `desk-workflow-chips.ts` — фабрика `deskWorkflowChips(orderId)` по контрактам chips.
2. `manager-desk.page.ts` — `workflowChips()` computed через фабрику.
3. `proposal-create.page.ts` — чтение `source=order&sourceId` → загрузка Order → prefill (counterparty + items).
4. `supply.page.ts` — фильтр заказа в quick view + «На стол» при `from=desk`.
5. `shipping.page.ts` — orderId query + banner + «На стол».
6. Тесты, gates, archive, commit.

## Results

- (заполнить)
