# TZ-NX-SHIP-S4-HUB-CANCEL: отмена отгрузки из hub до dispatch

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** WAVE-NX-SHIPPING S0–S3 DONE  
**LAYER:** 3 · **SIZE:** S  
**PAGES:** `/orders`  
**PAGE_DOCS:** `docs/pages/orders.page.md` ; `docs/pages/shipping.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/orders/order-hub-tray.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/orders/order-hub-tray.component.spec.ts` ;  
`docs/pages/orders.page.md` ;  
`docs/agent-checklists/WAVE-NX-SHIPPING.md`

IMPLICIT CONFLICT: nx build kppdf-web

### Preflight Check Output
- **Context read:** PO-CANON Undo; TZ-SHIP-433; S3 hub ship; registry cancel already on `/shipping`
- **Key Constraints:** cancel only `draft`/`scheduled` without `dispatchedAt`; confirm dialog; after dispatch → no button + RU from BE
- **Planned Deliverable:** hub «Отменить отгрузку» → `PiShipmentsService.cancelShipment`
- **Validation Path:** tray specs; nx build

---

## ЧТО ДЕЛАТЬ

1. When tray shows active cancellable shipment — button `data-test="order-cancel-shipment-button"`.
2. Confirm → `cancelShipment(id)` → reload summary (S2).
3. Specs: visible only when allowed; POST cancel; hidden after dispatch.
4. Docs + WAVE note S4 DONE (optional row on WAVE checklist).

## НЕ ИЗМЕНЯТЬ
`/desk`; stock OUT path; BE cancel semantics; registry cancel (already S1).

## КРИТЕРИИ ПРИЁМКИ
1. Operator undoes mistaken ship from hub before dispatch without opening `/shipping`.
2. After dispatch — no cancel in hub.
3. Specs + `nx build kppdf-web` PASS.
