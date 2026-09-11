# WAVE-NX-TEXT-LIBRARY-HIERARCHY — тексты: категория → подкатегория → название

**Canon audit:** `docs/audits/2026-09-11-text-library-category-subcategory-audit.md`  
**PO model:** создать = категория + **подкатегория** + название + тело; вставка = фильтр cat→subcat → список **названий** → тело на лист.  
**Default business (dictation):** подкатегория **обязательна** для нового/сохранённого TextBlock (categoryId = leaf). Depth ≤ 1.  
*(PO не ответил Да/Нет отдельно — зафиксировано по формулировке «выбираю категорию и подкатегорию».)*  
**НЕ в этой волне:** live `BlockSource` (Builder) — PARK; org-scope на TextBlock — PARK; wipe.

| # | SIZE | TZ | Суть | Status |
|---|------|-----|------|--------|
| 01 | L | `tasks/TZ-NX-TEXT-CAT-PARENT.md` | BE `parentId` на TextBlockCategory; depth≤1; list/filter children; TextBlock.categoryId = leaf only; tests | DONE |
| 02 | L | `tasks/TZ-NX-TEXT-CAT-NX-CRUD.md` | NX route `/dictionaries/text-block-categories` (dead nav fix); CRUD categories+subcats; Pi service mutate | DONE |
| 03 | L | `tasks/TZ-NX-TEXT-PICKER-FORM.md` | Form save + studio properties: cat→subcat→names; registry category **name**; slug auto-hide | READY after 02 |

**PROMPT:** `tasks/PROMPT-CLAUDE-TEXT-LIBRARY-HIERARCHY.md`  
**Executor:** `agent_id: claude` continuous 01→02→03.
