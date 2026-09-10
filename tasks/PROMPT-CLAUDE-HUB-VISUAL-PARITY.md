# PROMPT — Claude: HUB visual parity (глаз + fix)

Скопируй **целиком**. Лучше `D:\kppdf-8.0\.claude\run-continuous.cmd`.

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?». AFK PO.

[КОНТЕКСТ]
Workspace: D:\kppdf-8.0
Цель PO: сам открой UI и убедись, что таблицы/раскрытия выглядят и ведут себя ОДИНАКОВО по ритму с /registries (плотность, ▸, иконки, expand-панель). Не верь только прошлому Executor report — проверь глазами/браузером.
Canon: docs/audits/2026-09-10-nx-hub-table-parity-canon.md (H1–H6)
TZ: tasks/_ready/nx-hub/visual-parity/TZ-NX-HUB-05-VISUAL-PARITY.md
ЖИВОЙ ЧЕКЛИСТ: docs/agent-checklists/HUB-VISUAL-PARITY-CHECKLIST.md
UI: http://localhost:4201/  (мертв → node start.mjs --nx --no-browser → health)

[ЗАДАЧА И ШАГИ]
0) CLAIM: tasks/_active/TZ-NX-HUB-05-VISUAL-PARITY.md + checklist _TEMPLATE; agent_id=claude; чужой _active kppdf-web → STOP. Чеклист step 0 → IN_WORK→DONE.
1) Открой /registries — раскрой категорию с таблицей. Запомни эталон: chevron, hairline, pi-icon-btn, плотность, вид expand.
2–5) По очереди /counterparties → /orders → /supply → /warehouses:
   - клик по строке: expand открывается/закрывается; ▸ виден;
   - действия строки = иконки (не широкие «Изменить/Удалить/Карточка»);
   - внутри expand: блоки/категории читаемы, как «меню» в одном стиле с другими page expand (inset, labels), не белый хаос;
   - нет сырых ObjectId; delete с confirm где destructive.
   FAIL → FIX сразу на этой странице (минимальный diff к эталону registries/лучшему HUB sibling).
   После каждой страницы обнови HUB-VISUAL-PARITY-CHECKLIST.md.
6) Напиши docs/audits/2026-09-10-nx-hub-visual-parity.md — матрица H1–H6 + verdict + что чинил.
7) focused tests затронутых страниц → nx build kppdf-web LAST → archive → commit → push → checklist COMPLETE → _NOW Claude IDLE → Executor report.

Browser: Playwright/webapp-testing или эквивалент; в audit укажи способ. Скрин в docs/audits/evidence/ опционально но желательно при FAIL→FIX.

[ОГРАНИЧЕНИЯ]
НЕ: /production; DocStudio; BE schema; wipe/deploy; другие routes; invent новый дизайн-язык; «продолжать?».

[ФОРМАТ]
<thinking> план сверки vs H1–H6 </thinking> → работа → финальный отчёт: PASS/FAIL per route + SHA.
```
