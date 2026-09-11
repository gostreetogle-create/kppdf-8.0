# TZ-NX-WH-INV-BE-BATCH: batch StockMovement IN (qty only)

**РОЛЬ АГЕНТА:** Executor (backend) — claude  
**ЗАВИСИМОСТИ:** `TZ-NX-WH-INV-DOCS` DONE  
**LAYER:** 2 · **SIZE:** L  
**PAGES:** `/stock-movements` (API consumer)  
**PAGE_DOCS:** `stock-movements.page.md`

**CONFLICT KEYS:**  
`backend/src/modules/stock-movement/**` ;  
`backend/src/modules/storage-item/**` (только если нужен helper) ;  
`backend/src/modules/mutation-journal/**` (если journal kind) ;  
`docs/pages/stock-movements.page.md` ;  
`docs/agent-checklists/WAVE-NX-WAREHOUSE-INVENTORY-IMPORT.md` ;  
`docs/agent-checklists/_NOW.md`

### Preflight Check Output
- **Context read:** audit; `StockMovementService.create` Z-001; PO qty-only
- **Key Constraints:** один write-path = existing create IN; batch = N× create in txn или явный batch endpoint; match Material|Product by article/sku; warehouse by id/name/default
- **Planned Deliverable:** API batch inventory IN + unit tests; reject unknown rows
- **Validation Path:** backend tsc/test; FIC C if new route

## ЧТО ДЕЛАТЬ

1. Endpoint (или service method + controller): принять список строк `{ article|sku|materialId|productId, warehouseId|warehouseName, qty, documentRef? }`.
2. Resolve номенклатуру XOR material/product; unknown → 400/422 с индексом строки (не silent skip без отчёта).
3. Для каждой валидной: `StockMovementService.create({ type: 'in', qty, … })` — не писать quantity в обход ledger.
4. Ответ: created count + errors[].
5. Units + page.md note; WAVE row 02.

## НЕ

- kg conversion; Desktop UI; NX paste UI; wipe; deprecated stockQty

## AC

1. Batch of 2 known materials → 2 IN + StorageItem qty updated.
2. Unknown article → row error, others may succeed (или all-or-nothing — выбрать **partial + errors[]**, задокументировать).
3. Gates backend PASS.

## Gates

```text
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
cd backend && pnpm test -- stock-movement
cd backend && pnpm lint
```

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-11
closed_by: Claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: PASS
  - checklist: ADDED (docs/agent-checklists/TZ-NX-WH-INV-BE-BATCH.md)
  - progress.md: N/A (redirect file — see docs/agent-checklists/_NOW.md)
  - status synchronization: PASS
