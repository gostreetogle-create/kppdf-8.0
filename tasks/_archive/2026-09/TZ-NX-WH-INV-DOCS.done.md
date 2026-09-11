# TZ-NX-WH-INV-DOCS: канон заноса остатков (qty only)

**РОЛЬ АГЕНТА:** Executor (docs) — claude  
**ЗАВИСИМОСТИ:** нет  
**LAYER:** 4 · **SIZE:** S  
**PAGES:** `/storage-items` ; `/stock-movements` ; `/warehouses`  
**PAGE_DOCS:** `storage-items.page.md` ; `stock-movements.page.md` ; `warehouses.page.md`

**CONFLICT KEYS:**  
`docs/audits/2026-09-11-warehouse-inventory-import-readiness.md` (closeout note) ;  
`docs/pages/storage-items.page.md` ;  
`docs/pages/stock-movements.page.md` ;  
`docs/CONTEXT.md` (1 строка inventory qty) ;  
`docs/agent-checklists/WAVE-NX-WAREHOUSE-INVENTORY-IMPORT.md` ;  
`docs/agent-checklists/_NOW.md`

### Preflight Check Output
- **Context read:** audit 2026-09-11; PO «только qty»; WAVE inventory import
- **Key Constraints:** no product code; opening balance = StockMovement IN (не `*.stockQty`)
- **Planned Deliverable:** page notes + матрица сущностей в audit closeout
- **Validation Path:** docs only; FIC G N/A

## ЧТО ДЕЛАТЬ

1. В page.md склада: opening/inventory = только `qty` + ledger IN/adjust; Excel pack = будущий WAVE 02–03.
2. Матрица: метиз→Material fastener; ГП→Product; модуль не на складе.
3. Явный запрет писать `Material.stockQty` / `Product.stockQty`.
4. WAVE row 01 DONE.

## НЕ

- BE/FE/Desktop code
- weight→qty

## AC

1. Docs отражают qty-only + entity matrix.
2. Нет product diff.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-11
closed_by: Claude
verification:
  - acceptance criteria: PASS
  - typecheck: N/A (docs-only)
  - tests: N/A (docs-only)
  - lint: N/A (docs-only)
  - checklist: ADDED (docs/agent-checklists/TZ-NX-WH-INV-DOCS.md)
  - progress.md: N/A (redirect file — see docs/agent-checklists/_NOW.md)
  - status synchronization: PASS
