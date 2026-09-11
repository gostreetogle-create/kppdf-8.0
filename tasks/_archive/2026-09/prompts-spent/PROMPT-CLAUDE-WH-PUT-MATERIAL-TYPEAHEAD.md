# PROMPT — Claude: put-on-stock material typeahead + create «+»

Скопируй целиком.

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?». AFK PO.

[КОНТЕКСТ]
Workspace: D:\kppdf-8.0
WH-GROUP-CHIPS DONE (5c59dde6). PO скрин «Поставить на склад»: Material = native select без поиска.
Нужно: (1) поиск по вводу имени/артикула; (2) красивый «+» icon-btn рядом → MaterialFormDialog create → auto-select.
Gold: supply-request-form-dialog material search+create; registry-create-button (pi-icon-btn + Plus + accent).

[ЗАДАЧА]
CLAIM tasks/TZ-NX-WH-PUT-MATERIAL-TYPEAHEAD.md
Правь storage-put-on-stock-dialog (+ spec). Не трогай BE/Desktop.
Gates → archive → commit → push → _NOW IDLE → Executor report SHA + visual note.

[ОГРАНИЧЕНИЯ]
НЕ: invent зелёный вне токенов (используй registry accent Plus); wipe; «продолжать?».

[ФОРМАТ]
<thinking>…</thinking> → работа. Финал: SHA.
```
