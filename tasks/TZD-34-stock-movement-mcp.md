═══════════════════════════════════════════════════════════════
TZD-34: Stock movement MCP — приход/расход/перевод
═══════════════════════════════════════════════════════════════

STATUS: READY
WAVE: WAVE-MCP-GAP-2026-08-10 #4
DEPENDS ON: TZD-31 DONE; TZD-33 DONE (serial queue; keys почти не пересекаются с 33 кроме tools.ts — после archive 33)
LAYER: 2
CHECKLIST: docs/agent-checklists/TZD-34.md
PAGES: N/A
PAGE_DOCS: N/A

РОЛЬ АГЕНТА: Desktop MCP Engineer

CONFLICT KEYS:
desktop/mcp/src/stock-tools.ts;
desktop/mcp/src/stock-tools.test.ts;
desktop/mcp/src/tools.ts;
desktop/docs/MCP.md;
docs/agent-checklists/TZD-34.md;

Проверено: audit 2026-08-10 — POST `/api/storage-items` → 404 на стенде;
  POST `/api/stock-movements` type=in создаёт остатки; CreateStockMovementDto
  (type in|out|transfer|adjust; materialId|productId; warehouseId; qty);
  MCP сейчас только `kppdf_list_storage_items` / warehouses.

Loose wording: «положить на склад» → **stock-movement `in`**, не POST storage-items.

---

## ИСХОДНОЕ

1. Агент не может наполнить склад через MCP.
2. SoT write path на проде = stock-movements, не storage-items POST.

## ЧТО ДЕЛАТЬ

ШАГ 1: NEW `stock-tools.ts`

1. `kppdf_list_stock_movements` — GET `/api/stock-movements` (page/limit если есть;
   иначе list as API returns).
2. `kppdf_stock_movement_create`:
   - required: `type`, `warehouseId`, `qty`
   - exactly one of `materialId` | `productId` (validate в tool до POST)
   - optional: toWarehouseId, zoneName, toZoneName, cost, documentRef, orderId
   - type `transfer` требует toWarehouseId
3. Description: пишет SoT сразу (нет journal) — для demo/ops ок; не silent
   wipe склада.

ШАГ 2: Register + MCP.md + tests (mocks).

ШАГ 3: Не добавлять DELETE storage; не invent adjust без cost rules beyond DTO.

## НЕ ИЗМЕНЯТЬ

- Inventory FE redesign
- Reserve-stock order flows (уже order tool в 33)
- commercial-tools.ts (после 33 — только register в tools.ts аккуратно)
- deploy

## КРИТЕРИИ ПРИЁМКИ

1. tools/list содержит оба новых tool.
2. Unit: missing both materialId/productId → fail; transfer без toWarehouseId → fail.
3. MCP.md: «склад через stock-movements, не storage-items POST».
4. Gates:
   ```text
   cd desktop/mcp && pnpm test
   cd desktop/mcp && pnpm exec tsc --noEmit
   ```
5. Archive + commit/push; deploy NO.

## known_limitation

- Journal/undo для stock — нет.
- POST storage-items 404 — не чинить BE в этом TZ (отдельный inventory TZ при нужде).
- Composition propose — TZD-35 backlog.

## Domain preflight

- Material/Product stock via movement; Warehouse = workshop warehouse entity.
