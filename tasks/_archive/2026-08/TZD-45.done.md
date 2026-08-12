═══════════════════════════════════════════════════════════════
TZD-45: MCP производство + закупки — read-first минимум — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-12
closed_by: Buffy (фоновый desktop исполнитель)
acceptance_status: PASS
verification:
  - Таблица «Nest path → MCP tool» в checklist: PASS (10 read routes)
  - ≥4 новых read tools: PASS (10 добавлено — 5 production + 5 supply)
  - healthz toolCount увеличен: PASS (83 → 93)
  - cd desktop/mcp && pnpm test && pnpm exec tsc --noEmit: PASS (114/114, tsc 0 errors)
  - Deploy НЕ: PASS
checklist: docs/agent-checklists/TZD-45.md
lock: (read-only TZ; lock файл не создаётся — .mimocode/locks gitignored)
source: tasks/_backlog/desktop/TZD-45-mcp-production-supply-read.md

## Что сделано

- `desktop/mcp/src/production-tools.ts`: kppdf_list_work_types,
  kppdf_list_production_orders, kppdf_get_production_order, kppdf_list_work_orders,
  kppdf_get_work_order (все GET, read-only).
- `desktop/mcp/src/supply-tools.ts`: kppdf_list_supply_tasks,
  kppdf_list_purchase_requests, kppdf_get_purchase_request, kppdf_list_purchase_orders,
  kppdf_get_purchase_order (все GET, read-only).
- Регистрация в `tools.ts` (реестр + register-вызовы); toolCount 83 → 93.
- `desktop/docs/MCP.md`: разделы production/supply + пример toolCount=93.

## Known limitation / successor

- Только read. Write-heavy HITL (создание заказов/заявок/нарядов), тендеры,
  себестоимость, Гант — successor после ручного smoke PO.
