# PROMPT — Claude: DocStudio table props WAVE (panel / columns / qty / photo)

> Очередь: **после** DONE DROP-REFERENCE-NAV и REGISTRY-CATEGORIES.

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?».

[КОНТЕКСТ]
Workspace: D:\kppdf-8.0
Audit: docs/audits/2026-09-11-docstudio-table-props-po.md
WAVE: docs/agent-checklists/WAVE-NX-DOCSTUDIO-TABLE-PROPS.md
PO: фото пустые; нет Количества; нет порядка колонок при виде; узкая панель строк (×2.5); где виды таблиц = Реестры → Виды таблиц.
Photo binding S48 уже есть — чинить empty/blank + catalog URL. columnsEditable сейчас блокирует reorder при templateId.

[ЗАДАЧА]
01) CLAIM tasks/TZ-NX-DOCSTUDIO-PROPS-PANEL-WIDTH.md
02) CLAIM tasks/TZ-NX-DOCSTUDIO-TABLE-COL-STRUCTURE.md
03) CLAIM tasks/TZ-NX-DOCSTUDIO-TABLE-LINE-QTY.md
04) CLAIM tasks/TZ-NX-DOCSTUDIO-TABLE-PHOTO-SMOKE.md
05) CLAIM tasks/TZ-NX-DOCSTUDIO-TABLE-KINDS-DISCOVER.md
Each: gates → archive → commit → push. After 05: WAVE COMPLETE, _NOW IDLE, Executor report 5 SHA.

[ОГРАНИЧЕНИЯ]
НЕ: wipe; deploy; A4 reflow при open props; второй photo storage; «продолжать?».

[ФОРМАТ]
<thinking>…</thinking> → работа. Финал: 5 SHA + как увидеть фото и qty в таблице КП.
```
