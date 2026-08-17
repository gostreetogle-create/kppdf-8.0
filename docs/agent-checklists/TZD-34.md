# TZD-34 checklist

> Status: **DONE** (archive TZD-34.done.md; stale CLAIM cleared 2026-08-17)
> Marker: `tasks/_active/TZD-34.md` (создан при CLAIM)
> Commit/push: yes after DONE

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: `buffy`
- claimed_at: `2026-08-10T21:50:00Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: `unavailable`

## Preflight

- [x] TZD-33 DONE in archive
- [x] Прочитал `tasks/TZD-34-stock-movement-mcp.md` + audit note storage-items 404
- [x] Claim + `_active/TZD-34.md`

## Acceptance

- [x] kppdf_list_stock_movements + kppdf_stock_movement_create
- [x] exactly one of materialId|productId; transfer needs toWarehouseId
- [x] MCP.md stock via movements
- [x] desktop/mcp test+tsc PASS

## Integrity slot

- [x] Тип: MCP
- [x] N/A pages
- [x] Conflict keys only

## Gates (факт)

- desktop/mcp `pnpm test`: 91/91 PASS (5 новых stock tests)
- desktop/mcp `pnpm exec tsc --noEmit`: PASS
- Live smoke: `GET /healthz` → `toolCount: 70` (68 + 2), startup log `tools 70 registered`
- Deploy: NO

## Executor report (auto)

- NEW `desktop/mcp/src/stock-tools.ts`: `kppdf_list_stock_movements` (GET /api/stock-movements, фильтры warehouseId/materialId/productId/type) + `kppdf_stock_movement_create` (POST /api/stock-movements, SoT сразу, без journal).
- `validateStockMovement()` до POST: ровно один из materialId|productId; transfer требует toWarehouseId → toolFail, 0 запросов.
- `buildStockMovementBody()` — whitelist из CreateStockMovementDto (type/warehouseId/qty/toWarehouseId/zoneName/toZoneName/cost/documentRef/orderId).
- Register в tools.ts + `STOCK_TOOL_NAMES` в реестре (toolCount 68 → 70).
- MCP.md раздел «Tools — stock movements (TZD-34)»: склад через stock-movements, не storage-items POST.
- commercial-tools.ts не трогали (только register в tools.ts); deploy NO.
- Commit: `fc0eca4bc170d8f053aeeba297cf59dd47e88300`

## Closeout

- [x] archive + lock + progress; commit+push; deploy NO
- [x] WAVE-MCP-GAP #1–#4 DONE → checkpoint idle / propose deploy
- closed_at: `2026-08-10T22:10:00Z`
