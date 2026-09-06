# PROMPT — Claude RESUME S2 closeout (loop crash)

Скопируй целиком.

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + CLAUDE.md + docs/how-to-connect-ai.md.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?».

═══ ФАКТ ═══
S1 DONE: 9680c441. Не трогай S1.
S2 реализация + gates в checklist уже [x], но сессия умерла ДО commit/push (код всё ещё uncommitted; _active ещё висит).
Claim: tasks/_active/TZ-NX-SUPPLY-S2-HUB-CONFIRM.md
Checklist: docs/agent-checklists/TZ-NX-SUPPLY-S2-HUB-CONFIRM.md (commit SHA: pending)
Archive stub может уже лежать — доведи SHA/lock/active removal.

WIP (НЕ переписывай продукт):
- order-hub-tray.component.ts(+.spec)
- kit-reserve-confirm-dialog.component.ts(+.spec)
- pi-orders.service.ts(+.spec) / order.types.ts
- docs/pages/orders.page.md, supply.page.md, WAVE-NX-SUPPLY.md

═══ СДЕЛАТЬ ТОЛЬКО CLOSEOUT ═══
1) git status — только S2 paths.
2) Быстрый confirm: focused S2 jest + nx build kppdf-web.
3) Stage S2 → commit → push.
4) Archive done + lock + удали _active; проставь SHA в checklist.
5) STOP + отчёт Cursor (SHA). Не TZD-71 / warehouse / desktop.
```
