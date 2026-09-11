# PROMPT — Claude: registry sections + catalog categories WAVE

> Отдавать **после** DONE `TZ-NX-WH-PUT-MATERIAL-TYPEAHEAD` (сейчас в READY).  
> Или сразу, если PUT уже закрыт / PO явно переключил слот.

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?». AFK PO.

[КОНТЕКСТ]
Workspace: D:\kppdf-8.0
Audit: docs/audits/2026-09-11-registry-sections-and-catalog-categories.md
WAVE: docs/agent-checklists/WAVE-NX-REGISTRY-CATEGORIES.md
Reuse Category API. Units → группа «Справочники» внутри /registries (не top-nav).
Registry «Категории» type Детали|Изделия|Модули. materialKind ≠ Category.
Forms: no ObjectId — required select на детали/модули/изделия; сырьё select optional.

[ЗАДАЧА]
01) CLAIM tasks/TZ-NX-REG-UNITS-TO-REFERENCES.md
02) CLAIM tasks/TZ-NX-REG-CATEGORIES-CRUD.md
03) CLAIM tasks/TZ-NX-REG-CATEGORY-WIRE-DETAILS.md
04) CLAIM tasks/TZ-NX-REG-CATEGORY-WIRE-PRODUCTS.md
05) CLAIM tasks/TZ-NX-REG-CATEGORY-WIRE-MODULES.md
Each: gates → archive → commit → push. After 05: WAVE COMPLETE, _NOW IDLE, Executor report SHA 01–05.

[ОГРАНИЧЕНИЯ]
НЕ: wipe; deploy; TextBlockCategory; ломать materialKind; «продолжать?».

[ФОРМАТ]
<thinking>…</thinking> → работа. Финал: 5 SHA + как создать категорию «Метизы» и деталь под ней.
```
