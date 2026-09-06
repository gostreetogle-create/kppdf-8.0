# TZ-NX-SUPPLY-S1-PAGE: NX `/supply` реестр (без mock)

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — Claude  
**ЗАВИСИМОСТИ:** W1 SHELL DONE (nav/routes owner); S0 желательно DONE  
**LAYER:** 3 · **SIZE:** L  
**PAGES:** `/supply`  
**PAGE_DOCS:** `docs/pages/supply.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/app.routes.ts` (add `/supply` only) ;  
chrome nav «Снабжение» ;  
`frontend-nx/apps/kppdf-web/src/app/pages/supply/**` ;  
`frontend-nx/libs/data-access` supply clients ;  
`docs/pages/supply.page.md`

IMPLICIT CONFLICT: nx build kppdf-web

---

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Route + nav
- `/supply` under logistics/supply group (не внутри «Склад» обязателен — как legacy: отдельный пункт **Снабжение**).
- **Один** режим: реестр SupplyRequest и/или SupplyTask (канон BE). **Запрет:** mock quick-order как default SoT.

### ШАГ 2 — List + transitions
- Table: title/material, order link, qty, status, actions confirm/ordered/received per existing API.
- Filter `?orderId=`; create task/request; explode from order composition if BE already supports (reuse legacy service shapes).

### ШАГ 3 — Received → stock
- If BE already posts StockMovement on received — wire UI only.
- If not — known_limitation + TODO note in page.md (не invent second ledger write in FE).

## НЕ ИЗМЕНЯТЬ
Warehouse balances/movements pages; Purchase* UI; tender.

## КРИТЕРИИ ПРИЁМКИ
1. Нет in-memory mock seed как продуктовый путь.
2. orderId filter + status transitions.
3. nx build PASS + tests.
