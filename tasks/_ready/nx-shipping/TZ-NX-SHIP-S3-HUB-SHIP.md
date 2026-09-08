# TZ-NX-SHIP-S3-HUB-SHIP: Hub «Отгружено» without document

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** S0–S2 DONE  
**LAYER:** 3 · **SIZE:** L  
**PAGES:** `/orders`  
**PAGE_DOCS:** `docs/pages/orders.page.md` ; `docs/pages/shipping.page.md` ; `docs/pages/manager-desk.page.md` (note only)

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/orders/order-hub-tray.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/orders/**/ship-confirm*` (create) ;  
`frontend-nx/apps/kppdf-web/src/app/pages/orders/order-hub-tray.component.spec.ts` ;  
`docs/pages/orders.page.md` ; `docs/agent-checklists/WAVE-NX-SHIPPING.md` ; `docs/agent-checklists/_NOW.md`

IMPLICIT CONFLICT: nx build kppdf-web

### Preflight Check Output
- **Context read:** PO-CANON ship-without-doc; legacy ShipConfirmDialog / desk-ship-button; S2 READ block
- **Key Constraints:** confirm dialog; whole-order ship; reload tray after success; cancel-shipment stays on `/shipping` (not hub) this wave
- **Planned Deliverable:** «Отгружено» CTA + dialog → POST ship
- **Validation Path:** tray specs; nx build; WAVE DONE

---

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Ship confirm dialog (NX)
- Port minimal confirm: warehouse select (optional if BE allows omit) + recipient/notes fields as legacy desk needs; RU; destructive-safe confirm.
- `data-test="desk-ship-button"` or `order-ship-button` — pick one and document; prefer `order-ship-button` on hub (not desk).

### ШАГ 2 — Wire tray
- Button visible when ship is allowed (order not already fully shipped / cancelled — mirror legacy gate).
- On confirm → `PiOrdersService.ship(orderId, body)` → reload shipments summary (S2).
- Toast/error via existing patterns; no silent fail.

### ШАГ 3 — Closeout
- Specs: button present; ship called; summary updates.
- WAVE-NX-SHIPPING → DONE; `_NOW` Claude IDLE; DOMAIN-MAP/PAGE-TZ-INDEX if needed.
- Executor report (auto) with all SHAs.

## НЕ ИЗМЕНЯТЬ
`/desk` route; hub cancel-shipment (registry only); BE ship graph; stock OUT except via existing dispatch on `/shipping`.

## КРИТЕРИИ ПРИЁМКИ
1. Operator can ship whole order from hub without leaving `/orders`.
2. After ship, summary shows shipment; link to registry works.
3. No cancel button in hub this wave.
4. Specs + `nx build kppdf-web` PASS; WAVE checklist all DONE.
