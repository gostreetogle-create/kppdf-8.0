# WAVE-NX-HUB-TABLE-PARITY — плотность таблиц + hub expand

**Canon:** `docs/audits/2026-09-10-nx-hub-table-parity-canon.md`  
**Живой чеклист:** `docs/agent-checklists/HUB-TABLE-CONTINUOUS-CHECKLIST.md`  
**Continuous prompt:** `tasks/PROMPT-CLAUDE-HUB-CONTINUOUS.md`  
**Executor:** `agent_id: claude` · **sequential** (один `kppdf-web` build)  
**SKIP:** `/production` · Документы/DocStudio

updated_at: 2026-09-10T16:55:00+03:00  
status: **COMPLETE**

| # | Route | TZ | PROMPT | Status |
|---|-------|-----|--------|--------|
| 01 | `/counterparties` | `tasks/_ready/nx-hub/counterparties/TZ-NX-HUB-01-counterparties.md` | `tasks/PROMPT-CLAUDE-HUB-01-counterparties.md` | DONE |
| 02 | `/orders` | `tasks/_ready/nx-hub/orders/TZ-NX-HUB-02-orders.md` | `tasks/PROMPT-CLAUDE-HUB-02-orders.md` | DONE |
| 03 | `/supply` | `tasks/_ready/nx-hub/supply/TZ-NX-HUB-03-supply.md` | `tasks/PROMPT-CLAUDE-HUB-03-supply.md` | DONE |
| 04 | `/warehouses` | `tasks/_ready/nx-hub/warehouses/TZ-NX-HUB-04-warehouses.md` | `tasks/PROMPT-CLAUDE-HUB-04-warehouses.md` | DONE |

## Правило

Одна стадия → claim → code → gates (`nx build` last) → archive → commit/push → отметить чеклист → next.  
Не параллелить два page FIX. Не спрашивать «продолжать?».

## Resume

Смотри `HUB-TABLE-CONTINUOUS-CHECKLIST.md` — первая `PENDING` / `IN_WORK`.
