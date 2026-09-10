# PROMPT — Claude UX wave 10: `/stock-movements`

Скопируй целиком. **Одна страница.** Сначала аудит, потом фикс.

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?».

WAVE: docs/agent-checklists/WAVE-NX-UX-PAGE-SWEEP.md (только строка 10 / stock-movements)
Canon: docs/audits/2026-09-09-nx-ux-page-sweep-canon.md
Эталон: /registries expand + pi-button; /kit primitives.
Страница: /stock-movements — Movements table

═══ ОЧЕРЕДЬ ═══
0) tasks/_ready/nx-ux/stock-movements/TZ-NX-UX-10-stock-movements-AUDIT.md
   ТОЛЬКО аудит. Код запрещён. Файл docs/audits/2026-09-09-nx-ux-stock-movements-audit.md
   Verdict PASS-EMPTY или PASS-FIX.

1) Если PASS-FIX: tasks/_ready/nx-ux/stock-movements/TZ-NX-UX-10-stock-movements-FIX.md
   Чини P0/P1. Если на ЭТОЙ странице видишь ещё запах — чини сразу и допиши в audit closeout.
   Если PASS-EMPTY — skip FIX, пометь WAVE N/A.

Цикл: Claim → archive → next. После волны: _NOW Claude IDLE; Executor report SHA.
НЕ: другие routes; /production (Гант SKIP); BE rewrite; A4 studio geometry; desk; wipe; deploy; чужой WIP.
Не спрашивай «продолжать?».
```
