# PROMPT — Claude: DROP reference nav + text categories in registries

> После DONE `TZ-NX-WH-PUT-MATERIAL-TYPEAHEAD`.  
> Можно **до** WAVE-NX-REGISTRY-CATEGORIES (разные ключи).

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?».

[КОНТЕКСТ]
Workspace: D:\kppdf-8.0
Audit: docs/audits/2026-09-11-reference-nav-vs-registries.md
WAVE: docs/agent-checklists/WAVE-NX-DROP-REFERENCE-NAV.md
Top-nav «Справ.» = дубль. Тексты уже в реестрах. Категории текстов → Документы. Удалить reference nav.

[ЗАДАЧА]
01) CLAIM tasks/TZ-NX-REG-TEXT-BLOCK-CATEGORIES.md
02) CLAIM tasks/TZ-NX-NAV-DROP-REFERENCE.md
Gates → archive → commit → push each. After 02: WAVE COMPLETE, _NOW IDLE, Executor report 2 SHA.

[ОГРАНИЧЕНИЯ]
НЕ: wipe; deploy; BE TextBlockCategory rewrite; catalog Category (детали); «продолжать?».
НЕ путать TextBlockCategory с Category type=material/product/module.

[ФОРМАТ]
<thinking>…</thinking> → работа. Финал: 2 SHA + путь «Реестры → Категории текстов».
```
