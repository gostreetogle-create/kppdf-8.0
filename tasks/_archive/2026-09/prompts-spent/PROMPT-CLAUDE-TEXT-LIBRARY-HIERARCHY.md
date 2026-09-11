# PROMPT — Claude: text library hierarchy (cat → subcat → name)

Скопируй целиком. Лучше `D:\kppdf-8.0\.claude\run-continuous.cmd`.

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?». AFK PO.

[КОНТЕКСТ]
Workspace: D:\kppdf-8.0
Hygiene 01–04 DONE. NEXT wave: библиотека текстов.
Audit: docs/audits/2026-09-11-text-library-category-subcategory-audit.md
WAVE: docs/agent-checklists/WAVE-NX-TEXT-LIBRARY-HIERARCHY.md
Model: Category → Subcategory → Name → body. Subcategory REQUIRED (leaf categoryId). Depth≤1. Snapshot insert (not live BlockSource).

[ЗАДАЧА]
01) CLAIM tasks/TZ-NX-TEXT-CAT-PARENT.md — BE parentId + leaf-only TextBlock.categoryId
02) CLAIM tasks/TZ-NX-TEXT-CAT-NX-CRUD.md — NX /dictionaries/text-block-categories (fix dead nav) + CRUD
03) CLAIM tasks/TZ-NX-TEXT-PICKER-FORM.md — form + studio picker cascade + registry names
Each: gates → archive → commit → push. After 03: WAVE COMPLETE, _NOW IDLE, Executor report SHA 01–03.

[ОГРАНИЧЕНИЯ]
НЕ: live BlockSource; org-scope TextBlock; wipe; deploy; A4; legacy frontend rewrite; «продолжать?».

[ФОРМАТ]
<thinking>…</thinking> → работа. Финал: 3 SHA + note как создать текст cat/subcat/name.
```
