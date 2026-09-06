# TZ-NX-WAREHOUSE-W3-MOVEMENTS: журнал приход/расход

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — Freebuff  
**ЗАВИСИМОСТИ:** W2 DONE  
**LAYER:** 3 · **SIZE:** L  
**PAGES:** `/stock-movements`  
**PAGE_DOCS:** `docs/pages/stock-movements.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/warehouse/**` (movements) ;  
`frontend-nx/libs/data-access` stock-movement client ;  
`docs/pages/stock-movements.page.md`

IMPLICIT CONFLICT: nx build kppdf-web

---

## ЧТО ДЕЛАТЬ

### ШАГ 1 — List
- Журнал движений: date, type, material/product, warehouse, qty, documentRef/orderId if any.
- Filters: type in|out|adjust (transfer filter optional read-only if API returns; **не** create transfer).

### ШАГ 2 — Create
- **+ Приход** / **+ Расход**: material XOR product, warehouse, qty, optional note/orderId.
- Reuse BE `POST /stock-movements` (Z-001 atomic).

### ШАГ 3 — Tests + page.md NX note

## НЕ ИЗМЕНЯТЬ
Transfer create dialog; warehouse types; supply receive auto-wire (SUPPLY wave); shipping.

## КРИТЕРИИ ПРИЁМКИ
1. Create in/out обновляет остатки (integration через API mock или e2e note).
2. Нет UI «создать transfer».
3. `nx build kppdf-web` PASS.
