# TZD-34 — Stock movement MCP — DONE

- closed_at: `2026-08-10T22:10:00Z`
- agent: `buffy`
- workspace: `D:\kppdf-8.0`
- status: DONE
- wave: WAVE-MCP-GAP-2026-08-10 #4 (последняя TZ волны)

## Acceptance evidence

- tools/list содержит оба новых tool: `kppdf_list_stock_movements` + `kppdf_stock_movement_create` (registry toolCount 68 → 70, live /healthz).
- Unit: missing both materialId/productId → fail; both present → fail; transfer без toWarehouseId → fail (валидация до POST, 0 запросов).
- `buildStockMovementBody()` — whitelist из `CreateStockMovementDto`: type/warehouseId/qty (>0.0001)/toWarehouseId/zoneName/toZoneName/cost/documentRef/orderId.
- MCP.md: «склад через stock-movements, не storage-items POST» (раздел «Tools — stock movements (TZD-34)»).
- Description tool: пишет SoT сразу (нет journal) — для demo/ops ок; не silent wipe.

## Gates

- desktop/mcp `pnpm test`: 91/91 PASS (5 новых stock tests)
- desktop/mcp `pnpm exec tsc --noEmit`: PASS
- Live smoke: `GET /healthz` → `toolCount: 70`, startup log `tools 70 registered`
- Deploy: NO

## Files

- `desktop/mcp/src/stock-tools.ts` — new (list + create + validate + body builder + `STOCK_TOOL_NAMES`).
- `desktop/mcp/src/stock-tools.test.ts` — new (5 tests).
- `desktop/mcp/src/tools.ts` — register + registry.
- `desktop/docs/MCP.md` — stock section.
- checklist `docs/agent-checklists/TZD-34.md`; marker `tasks/_active/TZD-34.md` removed; lock `.mimocode/locks/TZD-34-stock-movement-mcp.lock`.

## known_limitation

- Journal/undo для stock — нет.
- POST storage-items 404 — не чинится BE в этом TZ (отдельный inventory TZ при нужде).
- Composition propose — TZD-35 (park).

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-10
closed_by: buffy
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: N/A (desktop/mcp без lint-скрипта)
  - checklist: ADDED
  - progress.md: UPDATED
  - status synchronization: PASS
