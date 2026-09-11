# PROMPT — Claude: warehouse inventory import (qty only)

> **Не копировать в Claude, пока text-library wave не COMPLETE.**  
> После DONE text-library — отдать этот блок.

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?». AFK PO.

[КОНТЕКСТ]
Workspace: D:\kppdf-8.0
Audit: docs/audits/2026-09-11-warehouse-inventory-import-readiness.md
WAVE: docs/agent-checklists/WAVE-NX-WAREHOUSE-INVENTORY-IMPORT.md
PO: только qty (без кг→шт). Opening = StockMovement IN. Метиз=Material fastener; ГП=Product.

[ЗАДАЧА]
01) CLAIM tasks/TZ-NX-WH-INV-DOCS.md
02) CLAIM tasks/TZ-NX-WH-INV-BE-BATCH.md
03) CLAIM tasks/TZ-NX-WH-INV-DESKTOP-EXCEL.md
Each: gates → archive → commit → push. After 03: WAVE COMPLETE, _NOW IDLE, Executor report SHA 01–03.

[ОГРАНИЧЕНИЯ]
НЕ: weight conversion; stockQty; wipe; deploy; ломать Supply Excel; «продолжать?».

[ФОРМАТ]
<thinking>…</thinking> → работа. Финал: 3 SHA + как оператор заливает Excel.
```
