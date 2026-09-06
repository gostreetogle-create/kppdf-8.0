# TZ-NX-SUPPLY-S2-HUB-CONFIRM: подтверждение материалов в заказе

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — Claude  
**ЗАВИСИМОСТИ:** S0 DONE; S1 DONE; Orders hub tray exists (D2)  
**LAYER:** 3 · **SIZE:** L  
**PAGES:** `/orders` (hub tray)  
**PAGE_DOCS:** `docs/pages/orders.page.md` ; `docs/pages/supply.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/orders/order-hub-tray.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/orders/**` (confirm dialog) ;  
supply data-access client for S0 endpoint ;  
`docs/pages/orders.page.md`

IMPLICIT CONFLICT: nx build kppdf-web

---

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Hub block «Склад / материалы»
- В tray заказа (группа Исполнение/Снабжение): кнопка **«Подтвердить материалы»** (или «В работу — склад»).
- Открывает dialog: preview lines from S0 availability (need / available / short).

### ШАГ 2 — Confirm
- Submit → S0 confirm API.
- UI: успех + список созданных SupplyRequest; short lines выделены.
- Deep-link «Открыть снабжение» → `/supply?orderId=`.

### ШАГ 3 — Copy
- RU: нехватка не блокирует жёстко цех; снабжение получит задачу.
- Не обещать автоматическое списание OUT в этом TZ.

## НЕ ИЗМЕНЯТЬ
Desk dual-write; warehouse movement create; Gantt start auto-call (optional follow-up).

## КРИТЕРИИ ПРИЁМКИ
1. Dialog показывает short vs ok до confirm.
2. После confirm: reserve/supply отражены в ответе API и UI toast/banner.
3. nx build + tray/dialog tests PASS.
