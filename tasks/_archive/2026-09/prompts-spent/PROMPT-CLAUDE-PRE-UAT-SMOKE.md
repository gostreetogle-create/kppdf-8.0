# PROMPT — Claude: Pre-UAT smoke (before PO clicks)

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?». AFK PO устал кликать — твоя работа снять рутину.

[КОНТЕКСТ]
Workspace: D:\kppdf-8.0
WAVE: docs/agent-checklists/WAVE-NX-PRE-UAT-SMOKE.md
TZ: tasks/TZ-NX-PRE-UAT-SMOKE-2026-09-12.md
Свежие DONE волны: DROP-REFERENCE, REGISTRY-CATEGORIES, DOCSTUDIO-TABLE-PROPS, AI-IMPORT-BASELINE.
CDP pattern: scripts/tz-nx-hub-05-visual-parity-smoke.mjs
Цель: audit PASS/FAIL + evidence; починить FAIL; focused tests на дыры. Не полный UX-sweep.

[ЗАДАЧА]
1) CLAIM tasks/TZ-NX-PRE-UAT-SMOKE-2026-09-12.md
2) Поднять/проверить API+NX; прогнать gates (nx test/build, backend tsc+test).
3) Написать и запустить scripts/pre-uat-smoke-2026-09-12.mjs (таблица AC в TZ).
4) FAIL → минимальный fix + тест. SKIP только с причиной (Desktop GUI, Ollama offline OK).
5) docs/audits/2026-09-12-pre-uat-smoke.md + evidence/; WAVE COMPLETE; archive; commit; push.
6) Executor report: SHA; список «PO может не кликать» / «PO смотри только это».

[ОГРАНИЧЕНИЯ]
НЕ: wipe; deploy; Soup train; TZD-76; «продолжать?»; чинить долг без FAIL evidence.

[ФОРМАТ]
<thinking>…</thinking> → работа. Финал = короткий отчёт для усталого PO.
```
