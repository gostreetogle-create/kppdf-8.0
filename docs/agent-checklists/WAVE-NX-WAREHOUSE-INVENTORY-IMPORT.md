# WAVE-NX-WAREHOUSE-INVENTORY-IMPORT — занос остатков (только qty)

**Canon audit:** `docs/audits/2026-09-11-warehouse-inventory-import-readiness.md`  
**PO (2026-09-11):** без кг→шт; Excel и UI — **только количество**.  
**НЕ:** weight conversion; live BlockSource; wipe; писать deprecated `*.stockQty`.

| # | SIZE | TZ | Суть | Status |
|---|------|-----|------|--------|
| 01 | S | `tasks/TZ-NX-WH-INV-DOCS.md` | Docs: матрица метиз/ГП + канон opening = StockMovement IN; page notes | DONE |
| 02 | L | `tasks/TZ-NX-WH-INV-BE-BATCH.md` | BE batch IN: match article/sku → Material\|Product + warehouse; qty only; reject miss | DONE |
| 03 | L | `tasks/TZ-NX-WH-INV-DESKTOP-EXCEL.md` | Desktop Excel pack «Инвентаризация» (как Supply B): validate → HITL → batch API | READY after 02 |

**PROMPT:** `tasks/PROMPT-CLAUDE-WAREHOUSE-INVENTORY-IMPORT.md` — **не выдавать в чат**, пока text-library continuous не DONE (слот Claude).

**Entity routing (напоминание):** метиз/деталь = Material; ГП = Product; модуль не складируется.
