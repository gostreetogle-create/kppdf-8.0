# PROMPT — Claude UX 08b: fake `pi-button-*` → `<app-pi-button>` (cross-cut)

Скопируй целиком. **До** #09 storage-items. Решение PO/Cursor: отдельный sweep, не инкремент.

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?».

WAVE: docs/agent-checklists/WAVE-NX-UX-PAGE-SWEEP.md (строка 08b)
Факт: docs/audits/2026-09-09-nx-ux-warehouses-audit.md §cross-cutting
Эталон фикса: warehouses.page.ts после 71b57377
Канон кнопки: <app-pi-button variant="default|secondary|outline|ghost|destructive">
Живой CSS: .pi-outline-btn — НЕ удалять, не путать с мёртвым pi-button-*.

═══ ОЧЕРЕДЬ ═══
1) tasks/_ready/nx-ux/pi-button-sweep/TZ-NX-UX-08b-PI-BUTTON-SWEEP.md
   Inventory → заменить все fake class="pi-button*" на pages → specs → gates.
   Напиши docs/audits/2026-09-09-nx-ux-pi-button-sweep.md.

Цикл: Claim → code → nx test kppdf-web → nx build kppdf-web → archive → push.
После: WAVE 08b DONE, _NOW Claude IDLE; Executor report SHA + rg count=0.

НЕ: /production; BE; invent features; трогать .pi-outline-btn; #09 без PO.
Не спрашивай «продолжать?».
```
