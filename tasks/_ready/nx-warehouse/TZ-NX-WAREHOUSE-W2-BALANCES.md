# TZ-NX-WAREHOUSE-W2-BALANCES: остатки (StorageItem)

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — Freebuff  
**ЗАВИСИМОСТИ:** W1 DONE  
**LAYER:** 3 · **SIZE:** L  
**PAGES:** `/storage-items`  
**PAGE_DOCS:** `docs/pages/storage-items.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/warehouse/**` (balances) ;  
`frontend-nx/libs/data-access` storage-item client ;  
`docs/pages/storage-items.page.md`

IMPLICIT CONFLICT: nx build kppdf-web

---

### Preflight Check Output
- **Context read:** audit; legacy StorageItemsPage + put/adjust dialogs; BE storage-item API
- **Key Constraints:** SoT = StorageItem; put-on-stock + adjust; `?materialId=` from materials
- **Planned Deliverable:** full balances page replacing W1 stub
- **Validation Path:** jest + nx build; materials deep-link smoke note

---

## ЧТО ДЕЛАТЬ

### ШАГ 1 — API client
- List StorageItems (filter warehouseId, materialId, low stock); put-on-stock; adjust.

### ШАГ 2 — UI
- Table/list: материал|изделие, склад, qty, reserved, min, zone (read-only if present).
- Actions: **Поставить на склад**, **Корректировка** (± qty + reason).
- Filter by warehouse (chip/select named sections); filter «мало остатков» (qty ≤ min).
- Query `?materialId=` prefilter (materials port deep-link).
- Empty states RU.

### ШАГ 3 — Tests
- Adjust negative reduces display qty (mock API).
- materialId query applied.

## НЕ ИЗМЕНЯТЬ
StockMovement create UI (W3); Reservation write; BE ledger logic; inventory dashboard page.

## КРИТЕРИИ ПРИЁМКИ
1. Put + adjust работают против live API shapes.
2. Low-stock filter + materialId query.
3. Gates: focused tests + `nx build kppdf-web`.
