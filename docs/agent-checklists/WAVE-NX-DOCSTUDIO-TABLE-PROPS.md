# WAVE-NX-DOCSTUDIO-TABLE-PROPS — таблица в студии: панель / колонки / qty / фото

**Audit:** `docs/audits/2026-09-11-docstudio-table-props-po.md`  
**PO:** фото пустые; нет количества; нет порядка колонок; узкие строки; где виды.  
**НЕ:** wipe; ломать A4 reflow канон; второй photo pipeline.

| # | SIZE | TZ | Суть | Status |
|---|------|-----|------|--------|
| 01 | S | `tasks/TZ-NX-DOCSTUDIO-PROPS-PANEL-WIDTH.md` | `--kp-panel-w` ≈ 820px (×2.4); rows editor без H-scroll на типичных 5–6 кол | DONE |
| 02 | M | `tasks/TZ-NX-DOCSTUDIO-TABLE-COL-STRUCTURE.md` | Unlock reorder + palette add «Количество»/стандартные поля при выбранном виде; порядок на блоке | DONE |
| 03 | M | `tasks/TZ-NX-DOCSTUDIO-TABLE-LINE-QTY.md` | Редактируемое кол-во в строках (manual + catalog hydrate); не хардкод 1 навсегда | DONE |
| 04 | L | `tasks/TZ-NX-DOCSTUDIO-TABLE-PHOTO-SMOKE.md` | Smoke: alias keys → img или «Нет фото»; catalog photo URL path; fix blank cells; hint если у сущности нет фото | DONE |
| 05 | S | `tasks/TZ-NX-DOCSTUDIO-TABLE-KINDS-DISCOVER.md` | CTA «Реестры → Виды таблиц»; copy; optional seed «Продукты» PO-canon columns | DONE |

**PROMPT:** `tasks/_archive/2026-09/prompts-spent/PROMPT-CLAUDE-DOCSTUDIO-TABLE-PROPS.md`  
**Очередь:** после DROP-REFERENCE + REGISTRY-CATEGORIES (STREAM-QUEUE #3).

**WAVE COMPLETE (2026-09-11).** Все 5 задач DONE. SHA: 01 `0df45baf` · 02 `24e2ae14` · 03 `d042de05` · 04 `7d904839` · 05 `ee243aca`. Итог: панель свойств таблицы 340→820px (scoped); reorder/add колонок разлочен независимо от вида/источника; qty для catalog-строк редактируема и переживает refresh (block-level override, не Product); фото — file-exists проверка на диске (не только DB-ссылка); discoverability реестра видов + канонический «Продукты» очищен от дублей и получил колонку «Количество» (реальная миграция, прогнана против dev-БД).
