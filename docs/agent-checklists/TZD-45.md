# TZD-45 checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-08/TZD-45.done.md`
> Source: `tasks/_backlog/desktop/TZD-45-mcp-production-supply-read.md`

## Claim slot

- agent_id: Buffy (фоновый desktop исполнитель)
- claimed_at: 2026-08-12
- workspace: D:\kppdf-8.0 (ветка main)
- team_room_claim: unavailable — backlog TZD не зарегистрирован в Team Room (как TZD-14/40)

## Preflight

- [x] grep живых Nest controllers (production/work/supply/purchase) — инвентарь ниже
- [x] `tasks/_active/` пуст; desktop/mcp CONFLICT KEYS свободны
- [x] TZ-45 прочитан; TZD-41 envelope + stock-tools pattern изучены

## Inventory: Nest path → MCP tool (ШАГ 1)

| Nest route | Method | MCP tool |
|------------|--------|----------|
| /api/work-types | GET | kppdf_list_work_types |
| /api/production-orders | GET | kppdf_list_production_orders |
| /api/production-orders/:id | GET | kppdf_get_production_order |
| /api/work-orders | GET | kppdf_list_work_orders |
| /api/work-orders/:id | GET | kppdf_get_work_order |
| /api/supply-tasks | GET | kppdf_list_supply_tasks |
| /api/purchase-requests | GET | kppdf_list_purchase_requests |
| /api/purchase-requests/:id | GET | kppdf_get_purchase_request |
| /api/purchase-orders | GET | kppdf_list_purchase_orders |
| /api/purchase-orders/:id | GET | kppdf_get_purchase_order |

Пишущие routes (POST/PATCH/DELETE) осознанно **не** маппим — TZ read-first.

## Acceptance (TZ)

- [x] Таблица «Nest path → MCP tool» в checklist — выше
- [x] ≥4 новых read tools — добавлено **10** (5 production + 5 supply)
- [x] healthz toolCount увеличен соответственно: 83 → **93**
- [x] `cd desktop/mcp && pnpm test && pnpm exec tsc --noEmit` PASS
- [x] Deploy НЕ

## Gates (факт)

- [x] desktop/mcp `tsc --noEmit` — PASS
- [x] desktop/mcp tests — 114/114 PASS (было 110; +4 новых теста)

## Executor report

- `production-tools.ts` (5 read tools) + `supply-tools.ts` (5 read tools), регистрация
  в `tools.ts`, реестр toolCount 83 → 93, `MCP.md` раздел production/supply.
- Не трогал: frontend production cockpit, wipe, commercial draft tools, `proposal-create*`, `quotation*`.
