# PROMPT — Claude HUB-01: `/counterparties`

Скопируй целиком, если гоняешь **одну** стадию. Для всей волны — `PROMPT-CLAUDE-HUB-CONTINUOUS.md`.

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?».

CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZ-NX-HUB-01-counterparties.md + checklist по docs/agent-checklists/_TEMPLATE.md
3) Status CLAIMED; Claim slot: agent_id=claude + claimed_at ISO + workspace
4) _active-map + чужие _active → конфликт = STOP
5) Team Room claim best-effort

Canon: docs/audits/2026-09-10-nx-hub-table-parity-canon.md
TZ: tasks/_ready/nx-hub/counterparties/TZ-NX-HUB-01-counterparties.md
WAVE: docs/agent-checklists/WAVE-NX-HUB-TABLE-PARITY.md row 01
Чеклист: docs/agent-checklists/HUB-TABLE-CONTINUOUS-CHECKLIST.md → IN_WORK → DONE+SHA

Эталон: /registries + app-pi-row-actions; hub precedent OrderHubTray.
Сделать: denser table + ▸ expand hub (Реквизиты/Объекты/Заказы/КП/Договоры) + icon edit/delete.
FE list params: PiOrdersService + PiQuotationsService counterpartyId (BE уже есть).
НЕ: FullEditor; BE schema; ObjectId в UI; fake copy; /production; DocStudio; чужой WIP.

Gates last: nx build kppdf-web. Archive → commit → push → чеклист/WAVE.
```
