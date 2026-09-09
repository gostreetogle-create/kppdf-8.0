# UX SWEEP CONTINUOUS — живой чеклист стадий

> Claude **обязан** обновлять этот файл после **каждой** стадии (до claim следующей).  
> Cursor/PO смотрят сюда, если сессия оборвалась.  
> Промпт: `tasks/PROMPT-CLAUDE-UX-CONTINUOUS-REMAINING.md`

updated_at: 2026-09-09T18:40:00Z  
agent_id: claude  
status: **RUNNING** — фаза 0 (08b) закрыта, continuous с 09  
prompt: `tasks/PROMPT-CLAUDE-UX-CONTINUOUS-REMAINING.md` (фаза 1)

## Правило отметки

После стадии выставить одну строку:
- `DONE` + SHA (audit/fix) + ISO время
- `SKIP` + причина
- `IN_WORK` — только текущая (одна)
- `BLOCKED` + причина → **STOP** continuous, Executor report

## Очередь

| # | Stage | Path / TZ | Status | SHA | stopped_at |
|---|-------|-----------|--------|-----|------------|
| 08b | pi-button sweep | `tasks/_ready/nx-ux/pi-button-sweep/TZ-NX-UX-08b-PI-BUTTON-SWEEP.md` | **DONE** | `f491c5d8` | 2026-09-09T18:40:00Z |
| 09 | storage-items AUDIT→FIX | `tasks/_ready/nx-ux/storage-items/` | IN_WORK | — | — |
| 10 | stock-movements AUDIT→FIX | `tasks/_ready/nx-ux/stock-movements/` | PENDING | — | — |
| 11 | production | — | **SKIP** Гант | — | PO lock |
| 12 | proposals AUDIT→FIX | `tasks/_ready/nx-ux/proposals/` | PENDING | — | — |
| 13 | counterparties AUDIT→FIX | `tasks/_ready/nx-ux/counterparties/` | PENDING | — | — |
| 14 | contracts AUDIT→FIX | `tasks/_ready/nx-ux/contracts/` | PENDING | — | — |
| 15 | studio-list AUDIT→FIX | `tasks/_ready/nx-ux/studio-list/` | PENDING | — | — |
| 16 | admin-devices AUDIT→FIX | `tasks/_ready/nx-ux/admin-devices/` | PENDING | — | — |
| 17 | admin-roles AUDIT→FIX | `tasks/_ready/nx-ux/admin-roles/` | PENDING | — | — |

## Resume

Если `status` выше = IN_WORK / сессия умерла:
1. Открой этот файл.
2. Найди первую `PENDING` / `IN_WORK`.
3. Продолжи **с неё** (не переделывай DONE).

## Финал

Когда 08b+09–10+12–17 все DONE/SKIP → `status: COMPLETE` · `_NOW` Claude IDLE · WAVE rows sync · Executor report со всеми SHA.
