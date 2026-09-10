# HUB TABLE CONTINUOUS — живой чеклист

> Claude обновляет **после каждой** стадии (до claim следующей).  
> Cursor/PO: если сессия оборвалась — смотреть сюда.  
> Промпт: `tasks/PROMPT-CLAUDE-HUB-CONTINUOUS.md`

updated_at: 2026-09-10T15:55:00+03:00  
agent_id: claude  
status: **IN_WORK**  
prompt: `tasks/PROMPT-CLAUDE-HUB-CONTINUOUS.md`

## Правило отметки

- `DONE` + full/short SHA + ISO время  
- `IN_WORK` — только одна текущая  
- `BLOCKED` + причина → STOP + Executor report  
- `SKIP` только по PO

## Очередь

| # | Stage | Path | Status | SHA | stopped_at |
|---|-------|------|--------|-----|------------|
| 01 | counterparties hub+icons | `tasks/_ready/nx-hub/counterparties/TZ-NX-HUB-01-counterparties.md` | DONE | `aa58e7fd` | 2026-09-10T15:55:00+03:00 |
| 02 | orders affordance+icons | `tasks/_ready/nx-hub/orders/TZ-NX-HUB-02-orders.md` | DONE | `d26cce66` | 2026-09-10T16:10:00+03:00 |
| 03 | supply dense+compact | `tasks/_ready/nx-hub/supply/TZ-NX-HUB-03-supply.md` | DONE | _pending-commit_ | 2026-09-10T16:35:00+03:00 |
| 04 | warehouses expand+icons | `tasks/_ready/nx-hub/warehouses/TZ-NX-HUB-04-warehouses.md` | PENDING | — | — |

## Resume

1. Открой этот файл.  
2. Первая `PENDING` / `IN_WORK`.  
3. Продолжи с неё; `DONE` не переделывай.

## Финал

Все 01–04 DONE → `status: COMPLETE` · `_NOW` Claude IDLE · WAVE sync · Executor report #→SHA.
