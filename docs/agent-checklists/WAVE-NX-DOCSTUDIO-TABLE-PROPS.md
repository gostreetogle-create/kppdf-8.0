# WAVE-NX-DOCSTUDIO-TABLE-PROPS — таблица в студии: панель / колонки / qty / фото

**Audit:** `docs/audits/2026-09-11-docstudio-table-props-po.md`  
**PO:** фото пустые; нет количества; нет порядка колонок; узкие строки; где виды.  
**НЕ:** wipe; ломать A4 reflow канон; второй photo pipeline.

| # | SIZE | TZ | Суть | Status |
|---|------|-----|------|--------|
| 01 | S | `tasks/TZ-NX-DOCSTUDIO-PROPS-PANEL-WIDTH.md` | `--kp-panel-w` ≈ 820px (×2.4); rows editor без H-scroll на типичных 5–6 кол | DONE |
| 02 | M | `tasks/TZ-NX-DOCSTUDIO-TABLE-COL-STRUCTURE.md` | Unlock reorder + palette add «Количество»/стандартные поля при выбранном виде; порядок на блоке | READY after 01 |
| 03 | M | `tasks/TZ-NX-DOCSTUDIO-TABLE-LINE-QTY.md` | Редактируемое кол-во в строках (manual + catalog hydrate); не хардкод 1 навсегда | READY after 02 |
| 04 | L | `tasks/TZ-NX-DOCSTUDIO-TABLE-PHOTO-SMOKE.md` | Smoke: alias keys → img или «Нет фото»; catalog photo URL path; fix blank cells; hint если у сущности нет фото | READY after 02 |
| 05 | S | `tasks/TZ-NX-DOCSTUDIO-TABLE-KINDS-DISCOVER.md` | CTA «Реестры → Виды таблиц»; copy; optional seed «Продукты» PO-canon columns | READY after 01 |

**PROMPT:** `tasks/PROMPT-CLAUDE-DOCSTUDIO-TABLE-PROPS.md`  
**Очередь:** после DROP-REFERENCE + REGISTRY-CATEGORIES (STREAM-QUEUE #3).
