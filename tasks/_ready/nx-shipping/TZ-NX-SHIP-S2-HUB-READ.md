# TZ-NX-SHIP-S2-HUB-READ: Orders hub Отгрузка READ

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** S0 + S1 DONE  
**LAYER:** 3 · **SIZE:** L  
**PAGES:** `/orders`  
**PAGE_DOCS:** `docs/pages/orders.page.md` ; `docs/pages/shipping.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/orders/order-hub-tray.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/orders/order-hub-tray.component.spec.ts` ;  
`docs/pages/orders.page.md`

IMPLICIT CONFLICT: nx build kppdf-web

### Preflight Check Output
- **Context read:** NX tray shipping stub (~248–262); legacy desk tray shipping block; S1 live `/shipping`
- **Key Constraints:** READ only; no ship button yet (S3); link must work with `?orderId=`
- **Planned Deliverable:** lazy GET shipments + summary + working deep-link
- **Validation Path:** tray specs; nx build

---

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Lazy load
- On expand / when shipping block visible: `PiShipmentsService.list({ orderId })`.
- Show active shipment summary (number · date · status) or «Документ не оформлен» / empty honest copy — mirror legacy hub wording, not fake success.

### ШАГ 2 — Link
- `order-shipping-link` → `/shipping?orderId=<id>` (not bare `/shipping` only).
- Update specs that currently assert stub / no HTTP.

### ШАГ 3 — Docs
- orders.page.md HUB-304: NX READ live; WAVE S2 DONE.

## НЕ ИЗМЕНЯТЬ
Ship / cancel buttons in tray (S3 / later); `/desk`; backend.

## КРИТЕРИИ ПРИЁМКИ
1. Expanding order shows real shipment data or honest empty.
2. Link opens filtered registry.
3. Specs + `nx build kppdf-web` PASS.
