# PROMPT — Claude: shell idle rails + hub expand cards

Скопируй целиком. Лучше `D:\kppdf-8.0\.claude\run-continuous.cmd`.

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?». AFK PO.

[КОНТЕКСТ]
Workspace: D:\kppdf-8.0
PO скрины: (1) /counterparties — gold expand карточками; мёртвые L/R rails зачёркнуты.
(2) /supply — expand «просто тексты» — FAIL, надо как у заказчиков.
WAVE: docs/agent-checklists/WAVE-NX-SHELL-HUB-POLISH.md
Чеклист: docs/agent-checklists/SHELL-HUB-POLISH-CHECKLIST.md
Причина rails: ShellToolRailService DEFAULT disabled placeholders («скоро») на каждой странице без setTools.

[ЗАДАЧА]
Строго по очереди:

01) CLAIM tasks/_ready/nx-shell-hub/TZ-NX-SHELL-01-IDLE-RAILS.md
    - Убрать DEFAULT placeholder tools; clear → [].
    - Aside L/R только если tools.length > 0; иначе full-width main.
    - ←→ перенести в header (один SoT); не дублировать в пустых rails.
    - Регрессия: production + studio setTools → rails живые.
    - page-chrome.md sync. Gates → archive → commit → push → checklist 01 DONE.

02) CLAIM tasks/_ready/nx-shell-hub/TZ-NX-HUB-06-EXPAND-CARDS.md
    - Gold markup: counterparty-hub-tray section.hairline.rounded-sm.bg-paper + h3.
    - /supply expand → категорийные карточки (Позиция / Связь с заказом / Состав / Сроки и заметки).
    - /warehouses expand → карточки О складе / Остатки.
    - /orders hub — verify only; минимальный align если нужно.
    - Audit docs/audits/2026-09-10-nx-hub-expand-cards.md.
    - Gates → archive → commit → push → checklist COMPLETE → _NOW IDLE → Executor report.

[ОГРАНИЧЕНИЯ]
НЕ: /production redesign; DocStudio A4; BE schema; wipe/deploy; вернуть placeholders «скоро»; «продолжать?».

[ФОРМАТ]
<thinking>…</thinking> → работа. Финал: SHA 01 + SHA 02.
```
