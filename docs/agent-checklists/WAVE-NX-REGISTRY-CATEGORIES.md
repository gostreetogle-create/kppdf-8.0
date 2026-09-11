# WAVE-NX-REGISTRY-CATEGORIES — секции реестров + категории каталога

**Audit:** `docs/audits/2026-09-11-registry-sections-and-catalog-categories.md`  
**PO:** units не в Каталоге; категории деталей/модулей/изделий через реестр + обязательный select.  
**Reuse:** `Category` + `/api/categories`; расширить `type` на `module`; Module.`categoryId`.  
**НЕ:** новый Category-collection; ломать materialKind; wipe.

| # | SIZE | TZ | Суть | Status |
|---|------|-----|------|--------|
| 01 | S | `tasks/TZ-NX-REG-UNITS-TO-REFERENCES.md` | `units.category` → `Справочники`; audit note секций | DONE |
| 02 | L | `tasks/TZ-NX-REG-CATEGORIES-CRUD.md` | BE `type: module`; NX registry «Категории» (type filter + CRUD); data-access | DONE |
| 03 | L | `tasks/TZ-NX-REG-CATEGORY-WIRE-DETAILS.md` | Детали (+ материалы raw optional): select Category type=material **required** на create детали | READY after 02 |
| 04 | L | `tasks/TZ-NX-REG-CATEGORY-WIRE-PRODUCTS.md` | Изделия: select type=product **required** | READY after 02 |
| 05 | L | `tasks/TZ-NX-REG-CATEGORY-WIRE-MODULES.md` | Module.categoryId BE + form select type=module **required** | READY after 02 |

**PROMPT (после PUT-typeahead / когда слот свободен):** `tasks/PROMPT-CLAUDE-REGISTRY-CATEGORIES.md`

**Default business:** category **обязательна** при create детали/модуля/изделия; raw Material — select **есть**, required **нет** (PO 2026-09-11).  
**Связь:** top-nav «Справ.» убирается отдельно — `WAVE-NX-DROP-REFERENCE-NAV` (не путать с группой «Справочники» внутри `/registries` для units+Category).
