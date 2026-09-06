# PROMPT-FREEBUFF — NX Warehouse wave

Скопируй целиком. Continuous W1→W4. `agent_id` Freebuff/Buffy.

Читай: `GEMINI.md`, `docs/how-to-connect-ai.md`, `docs/agent-checklists/WAVE-NX-WAREHOUSE.md`, audit `docs/audits/2026-09-05-warehouse-nx-port-audit.md`, slots `PARALLEL-SLOTS-WAREHOUSE-SUPPLY.md`.

## Очередь
1. `tasks/_ready/nx-warehouse/TZ-NX-WAREHOUSE-W1-SHELL.md`
2. `…/TZ-NX-WAREHOUSE-W2-BALANCES.md`
3. `…/TZ-NX-WAREHOUSE-W3-MOVEMENTS.md`
4. `…/TZ-NX-WAREHOUSE-W4-CLOSEOUT.md`

## Канон
- Разделы = именованные Warehouse (Металл, Метизы…). Форма: имя + активен. type=`main`, без зон/типов UI.
- Нет `/inventory` dashboard. Нет transfer create. Ledger уже в BE (Z-001).
- Не трогай `backend/**` app logic; не трогай `/supply` page (Claude).
- Владеешь `app.routes.ts` + nav «Склад» в W1; stubs для storage-items/stock-movements.

## Цикл
Claim → code → gates TZ → archive `tasks/_archive/2026-09/` → next.  
После W4: обновить WAVE status + `_NOW` Freebuff IDLE.

## Stop
Чужой claim; красный baseline build; wipe/deploy; scope вне CONFLICT KEYS.
