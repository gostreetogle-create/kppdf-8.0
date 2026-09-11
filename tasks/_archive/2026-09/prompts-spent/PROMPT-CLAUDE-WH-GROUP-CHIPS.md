# PROMPT — Claude: warehouse TOC chips (Остатки · Склады · Движения)

Скопируй целиком.

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?». AFK PO.

[КОНТЕКСТ]
Workspace: D:\kppdf-8.0
PO: клик «Склад» сейчас → склады → кнопка/expand к остаткам. Нужны нормальные чипы как у Сделок/Админ: Остатки | Склады | Движения; вход сразу на Остатки; на остатках select склада оставить.
Canon: docs/pages/page-chrome.md (Склад = group-workspace) — сейчас НЕ сделано (только eyebrow).
Gold: deals-group-chips.ts + admin-roles PiGroupWorkspace.

[ЗАДАЧА]
CLAIM tasks/TZ-NX-WH-GROUP-CHIPS.md
1) warehouse-group-chips.ts — порядок Остатки → Склады → Движения
2) Wrap warehouses / storage-items / stock-movements в app-pi-group-workspace
3) nav entryPath → /storage-items
4) Не ломать ?warehouseId= deep-link и select фильтра
Gates → archive → commit → push → _NOW IDLE → Executor report + SHA + visual note.

[ОГРАНИЧЕНИЯ]
НЕ: BE ledger; Desktop inventory; redesign таблиц; «продолжать?».

[ФОРМАТ]
<thinking>…</thinking> → работа. Финал: SHA.
```
