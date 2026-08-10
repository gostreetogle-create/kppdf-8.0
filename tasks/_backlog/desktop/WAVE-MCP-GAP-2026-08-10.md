# WAVE: MCP gaps after sport demo seed (2026-08-10)

> Источник: `docs/audits/2026-08-10-mcp-sport-demo-audit.md`  
> Статус: backlog (не в `_active`). Старт только по команде PO.

## Контекст

На тестовом стенде заполнен спортивный демо-контур. Живой Desktop MCP на `:9743` отдал только material/read subset; коммерческий поток агент закрыл через REST. Нужно догнать рантайм и добавить tools под КП→заказ→склад.

## Порядок

| # | TZ | Суть | CONFLICT KEYS (черновик) |
|---|-----|------|---------------------------|
| 1 | **TZD-31** | Runtime sync: Desktop MCP = актуальный `desktop/mcp` (tools/list = docs) | `desktop/src/core/mcpHost.ts`, packaging/start path, `desktop/docs/MCP.md` |
| 2 | **TZD-32** | Material propose: price/kind/description/dimensions | `desktop/mcp/src/write-tools.ts`, mutation-journal material.create payload |
| 3 | **TZD-33** | Commercial HITL: quotations/orders/counterparties read + draft write | `desktop/mcp/src/*` NEW commercial-tools, MCP.md |
| 4 | **TZD-34** | Stock movement write tool | `desktop/mcp` + stock-movement API |
| 5 | **TZD-35** | Composition line propose (module/product) | composition POST wrappers, journal kinds? |

## Non-goals этой волны

- Авто-публикация КП / silent ship без confirm.
- Gantt / production write.
- Запись pairing key в git.

## Acceptance волны

- Cursor `tools/list` ≥ tools из MCP.md §TZD-17…30.
- Агент может без raw REST: создать материал с ценой → изделие (passport) → черновик КП → черновик заказа → stock in.
- Audit §4 закрыт или явно park с причиной.
