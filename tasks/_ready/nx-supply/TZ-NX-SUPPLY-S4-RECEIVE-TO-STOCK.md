═══════════════════════════════════════════════════════════════
TZ-NX-SUPPLY-S4-RECEIVE-TO-STOCK: «Получено» → confirm + склад IN
═══════════════════════════════════════════════════════════════

SIZE: L
РОЛЬ АГЕНТА: Executor BE+NX (agent_id: claude)
ЗАВИСИМОСТИ: TZ-SUPPLY-BE-INVOICE-DELIVERY; TZ-NX-WAREHOUSE-DEFAULT; S3 journal UX желателен
LAYER: 2–3
PAGES: `/supply` (receive action)
PAGE_DOCS: docs/pages/supply.page.md; docs/pages/warehouse.page.md

CONFLICT KEYS: backend/src/modules/supply/** ; backend/src/modules/stock-movement/** (IN create path); backend/src/modules/storage-item/** (если остаток обновляется через movements); frontend-nx/.../pages/supply/** (confirm dialog)

IMPLICIT CONFLICT: nx build kppdf-web

---

### Preflight
- **Context read:** audit §1 — сегодня received только статус; PO: confirm + warehouse (default + смена); receivedQty
- **Key Constraints:** HITL confirm; один write-path склада (StockMovement IN); идемпотентность повторного receive
- **Deliverable:** API receive + UI confirm; движение IN; status received
- **Validation:** BE tests receive; FE dialog; nx build

## ЧТО ДЕЛАТЬ
1. BE `POST .../supply-requests/:id/receive` body: `{ warehouseId?, receivedQty }` — default warehouse если omit; роль/permission supply (reuse existing supply access).
2. Создать StockMovement IN linked materialId + qty; обновить status→received; запрет double-receive без reverse path (или explicit 409).
3. FE: кнопка «Получено» → dialog (склад select prefilled default, qty) → confirm.
4. Не трогать paid.

## НЕ
Полки/ячейки; silent auto-IN; Purchase*; dropDatabase.

## AC
- [ ] Confirm создаёт IN + received; повтор → ошибка/noop задокументирован
- [ ] Default warehouse подставляется
- [ ] gates; archive

CLAIM: agent_id claude.
