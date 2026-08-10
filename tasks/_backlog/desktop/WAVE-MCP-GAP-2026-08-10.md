# WAVE: MCP gaps after sport demo (READY)

> Аудит: `docs/audits/2026-08-10-mcp-sport-demo-audit.md`  
> Статус: **READY** — выполнять **serial** 31→32→33→34  
> Промпт: `tasks/_backlog/desktop/PROMPT-MCP-GAP-WAVE.md`  
> TZD-35 (composition propose) — **CLOSED / UNPARKED by TZD-38** on 2026-08-10; the Excel wave owns the explicit composition HITL path.

## Порядок

| # | TZ | Файл | DEPENDS |
|---|-----|------|---------|
| 1 | TZD-31 | `tasks/TZD-31-mcp-runtime-sync.md` | — |
| 2 | TZD-32 | `tasks/TZD-32-material-propose-fields.md` | 31 |
| 3 | TZD-33 | `tasks/TZD-33-commercial-mcp-hitl.md` | 31+32 |
| 4 | TZD-34 | `tasks/TZD-34-stock-movement-mcp.md` | 31+33 |
| — | TZD-35 | CLOSED by TZD-38 — composition propose/confirm | after 34 + Excel wave |

## Правила

- Один агент; **не** параллелить (общий `desktop/mcp/src/tools.ts`).
- Mid-queue **без** «поехали».
- Commit+push на каждом DONE.
- Deploy **NO** (только «готово предложить деплой» после #4).
- Не брать WAVE-DICT-DEMO / KP-COMPLETE в этой сессии.
- Не коммитить `desktop/mcp-runtime/**`.

## Acceptance волны

- Live `healthz.toolCount` = source registry; categories/product propose видны в tools/list.
- Материал propose с ценой → SoT.
- MCP: draft КП/заказ + gated ship/convert; stock-movement create.
- Archive 31–34 + locks; `_active/` пуст.
