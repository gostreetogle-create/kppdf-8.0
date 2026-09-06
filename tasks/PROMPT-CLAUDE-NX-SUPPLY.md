# PROMPT-CLAUDE — NX Supply + kit reserve

Скопируй целиком. `agent_id: claude`.

Читай: `GEMINI.md`, `docs/how-to-connect-ai.md`, `docs/agent-checklists/WAVE-NX-SUPPLY.md`, audit, `PARALLEL-SLOTS-WAREHOUSE-SUPPLY.md`, `docs/agents/CLAUDE-UNATTENDED.md`.

## UNATTENDED
PO AFK. Не спрашивай «продолжать?». Accept/bypass permissions. После каждого TZ — следующий. Stop только на conflict/red build/wipe.

## Очередь
1. **Сейчас (∥ Freebuff warehouse UI):** `tasks/_ready/nx-supply/TZ-NX-SUPPLY-S0-KIT-RESERVE-BE.md` — **только backend**.
2. **После W1 archive (Freebuff):** `TZ-NX-SUPPLY-S1-PAGE.md`
3. Затем: `TZ-NX-SUPPLY-S2-HUB-CONFIRM.md`

Если W1 ещё не DONE — после S0 **остановись и жди** (не правь app.routes / warehouse pages).

## Канон
- Soft shortage → SupplyRequest; reserve atomic (Z-001 session).
- Нет mock quick supply. Нет Purchase* UI. Нет hard-stop цеха.
- Confirm в hub = preview + S0 API; OUT списание — не этот scope.

## Цикл
Claim → gates → archive → next. Update WAVE + `_NOW` when done.

## Stop
Пересечение с Freebuff на `app.routes` до W1 DONE; wipe; deploy без PO.
