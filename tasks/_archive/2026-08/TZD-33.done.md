# TZD-33 — Commercial MCP HITL — DONE

- closed_at: `2026-08-10T21:40:00Z`
- agent: `buffy`
- workspace: `D:\kppdf-8.0`
- status: DONE
- wave: WAVE-MCP-GAP-2026-08-10 #3
- scope: commercial read + draft write MCP tools (КП/заказ/клиент) with userOk-gated mutations.

## Acceptance evidence

- tools/list содержит все имена ШАГ 1: 9 read + 4 draft write + 4 gated (17) — registry `toolCount` 51 → 68 (live /healthz).
- `kppdf_quotation_create_draft` / `kppdf_order_create_draft` всегда шлют `status: 'draft'` (payload builders; input status не принимается — accepted/converted создать нельзя).
- `kppdf_order_ship` / convert / `set_status` без `userOk:true` → toolFail, 0 POST (gate проверяется до backend-запроса).
- `kppdf_counterparty_create` + `kppdf_site_create` работают (payload builder + whitelist тесты; мок fetch в стиле doc-tools).
- Поля сверены с реальными DTO: `QuotationItemDto`, `OrderItemDto` (unitPrice optional — TZ-ORDERS-301), `CreateCounterpartyDto` (inn/roles required), `CreateSiteDto`, ship `{recipient, address, warehouseId, driverInfo}`.
- MCP.md раздел «Tools — commercial (TZD-33)» + Commercial HITL protocol.

## Gates

- desktop/mcp `pnpm test`: 86/86 PASS (7 новых commercial tests)
- desktop/mcp `pnpm exec tsc --noEmit`: PASS
- Live smoke: `GET /healthz` → `toolCount: 68`, startup log `tools 68 registered`
- Deploy: NO

## Files

- `desktop/mcp/src/commercial-tools.ts` — new (reads, draft builders, gated mutations, `COMMERCIAL_TOOL_NAMES`, `userOkGate`).
- `desktop/mcp/src/commercial-tools.test.ts` — new (7 tests: names, draft status, whitelist, gate).
- `desktop/mcp/src/tools.ts` — register + registry.
- `desktop/docs/MCP.md` — Commercial HITL section.
- checklist `docs/agent-checklists/TZD-33.md`; marker `tasks/_active/TZD-33.md` removed; lock `.mimocode/locks/TZD-33-commercial-mcp-hitl.lock`.

## known_limitation

- Нет journal undo для КП/заказа — менеджер правит в вебе.
- Composition BOM write — TZD-35; Stock write — TZD-34.
- Full quotation designSnapshot/HTML — не MCP; студия в вебе.

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
