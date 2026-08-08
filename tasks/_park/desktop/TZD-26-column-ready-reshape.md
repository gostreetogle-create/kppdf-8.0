═══════════════════════════════════════════════════════════════
TZD-26: Inbox columns — ready / unfit + AI reshape (PARK)
═══════════════════════════════════════════════════════════════

STATUS: PARK · DEPENDS ON: **TZD-23 DONE**
LAYER: 2
AUDIT: docs/audits/2026-08-08-desktop-bulk-import-vision-audit.md

РОЛЬ: Desktop/MCP (+ тонкий BE только если нужен row meta на ImportTask).

Проверено: desktop/src/core/inbox.ts aliases; domain-tools validate; ImportTaskRow
в import-task.schema.ts (name/unit/article/… без columnMap).

---

## Цель PO

После разбора файла: колонки/поля, которые ложатся на схему → **ready**;
остальное → **unfit** (задача ИИ: деформировать данные **без смены смысла**
под поля kppdf) → re-audit → дальше TZD-23 matching.

---

## ЧТО ДЕЛАТЬ (развернуть при unpark)

1. Классификатор колонок: header → canonical field | unknown | conflict.
2. MCP `kppdf_inbox_classify_columns` (или расширение audit): вернуть
   `{ ready: [...], unfit: [...], sampleRows }`.
3. MCP `kppdf_import_task_reshape` / протокол: агент пишет reshaped rows в
   ImportTask (новый endpoint patch rows **только** из awaiting reshape /
   analyzing) + audit log «что изменили».
4. AC: unfit колонка «Наименование товара» → name; «ед» → unit; мусорная
   колонка остаётся в raw, не ломает validate.
5. НЕ: invent EAV fields; НЕ silent SoT; НЕ orders/КП.

CONFLICT KEYS (ожид.):
desktop/src/core/inbox.ts; desktop/mcp/src/inbox-tools.ts;
desktop/mcp/src/domain-tools.ts; backend/src/modules/import-task/** (если patch rows);
desktop/docs/MCP.md;

Gates: desktop/mcp test + backend import-task tests if touched.
