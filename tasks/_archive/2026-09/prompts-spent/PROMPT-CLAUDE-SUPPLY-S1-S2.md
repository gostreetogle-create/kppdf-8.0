# PROMPT — Claude NX Supply S1→S2 (после WAVE warehouse DONE)

Скопируй целиком. `agent_id: claude`.

```
Ты executor kppdf-8.0 (agent_id: claude). Контракт: GEMINI.md + CLAUDE.md + docs/how-to-connect-ai.md.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?».

WAVE: docs/agent-checklists/WAVE-NX-SUPPLY.md
Slots: docs/agent-checklists/PARALLEL-SLOTS-WAREHOUSE-SUPPLY.md
S0 DONE: 285a4c2d (kit-reserve BE). Warehouse WAVE W1–W4 DONE — _active пуст; kppdf-web свободен.

Очередь:
1) tasks/_ready/nx-supply/TZ-NX-SUPPLY-S1-PAGE.md
2) tasks/_ready/nx-supply/TZ-NX-SUPPLY-S2-HUB-CONFIRM.md

S1 канон:
- Route /supply + nav «Снабжение» (не внутри склада).
- Живой реестр SupplyRequest/SupplyTask — БЕЗ mock quick-order SoT.
- List + status transitions + ?orderId=; data-access clients.
- Received→stock: wire если BE уже пишет StockMovement; иначе known_limitation в page.md.
- НЕ трогай warehouse/** balances/movements; НЕ Purchase* UI; НЕ desktop.

S2: hub confirm = preview + S0 kit-reserve API (soft shortage → SupplyRequest). OUT списание — не этот scope.

Цикл: claim + checklist → code → gates (focused + nx build kppdf-web last) → archive 2026-09 → next.
После S2: STOP + отчёт Cursor. Не начинай TZD-71 pairing.

Старт: git status → claim S1.
```
