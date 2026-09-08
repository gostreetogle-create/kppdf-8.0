# TZ-NX-SHIP-S0-DATA-ACCESS: PiShipmentsService + Orders.ship

**РОЛЬ АГЕНТА:** Executor (frontend-nx data-access) — claude  
**ЗАВИСИМОСТИ:** нет  
**LAYER:** 3 · **SIZE:** L  
**PAGES:** (none yet)  
**PAGE_DOCS:** `docs/pages/shipping.page.md`

**CONFLICT KEYS:**  
`frontend-nx/libs/data-access/src/lib/sales/pi-orders.service.ts` ;  
`frontend-nx/libs/data-access/src/lib/sales/pi-orders.service.spec.ts` ;  
`frontend-nx/libs/data-access/src/lib/logistics/**` (create) ;  
`frontend-nx/libs/data-access/src/index.ts`

IMPLICIT CONFLICT: nx build kppdf-web

### Preflight Check Output
- **Context read:** legacy `shipments.service.ts`; `orders.service.ts` `ship()`; NX `pi-orders.service.ts` (no ship); audit `2026-09-08-shipping-nx-port-audit.md`
- **Key Constraints:** SilentResult mirror; no BE changes
- **Planned Deliverable:** types + PiShipmentsService + Orders.ship + specs
- **Validation Path:** data-access tests; nx build

**Проверено:** BE endpoints live; NX gap confirmed.

---

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Types + PiShipmentsService
- New `frontend-nx/libs/data-access/src/lib/logistics/` — `shipment.types.ts` + `pi-shipments.service.ts`.
- Mirror legacy 1:1: `list({orderId,status,date})`, `findById`, `update`, `dispatch`, `cancelShipment`, `addDoc`, `remove`.
- Export from `libs/data-access/src/index.ts`.

### ШАГ 2 — PiOrdersService.ship
- Add `ship(id, body: Record<string, unknown> = {})` → `POST /orders/:id/ship` (SilentResult\<Order\>), mirror legacy TZ-SWEEP-401.

### ШАГ 3 — Specs
- Jest: list params, dispatch/cancel/addDoc URLs, ship empty body + optional body.

## НЕ ИЗМЕНЯТЬ
`backend/**`; `apps/kppdf-web/**` (pages/routes — S1); legacy `frontend/**`.

## КРИТЕРИИ ПРИЁМКИ
1. Services call correct URLs; no mock SoT.
2. Focused data-access tests PASS.
3. `cd frontend-nx && pnpm exec nx build kppdf-web` PASS (baseline before claim + last before archive).
