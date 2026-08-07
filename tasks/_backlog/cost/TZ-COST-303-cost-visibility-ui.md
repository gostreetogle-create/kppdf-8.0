═══════════════════════════════════════════════════════════════
TZ-COST-303: Видимость себестоимости в UI каталога / BOM
═══════════════════════════════════════════════════════════════

> PARK until TZ-COST-302 DONE · LAYER 3
>
> Показать менеджеру rollup без лезть в API: списки + inspector состава.

STATUS: READY after 302

РОЛЬ АГЕНТА: Frontend

ЗАВИСИМОСТИ: TZ-COST-302 DONE

LAYER: 3

CONFLICT KEYS:
frontend/src/app/pages/modules/modules.page.ts;
frontend/src/app/pages/products/products.page.ts;
frontend/src/app/pages/products/product-detail.page.ts;
frontend/src/app/pages/products/product-bom-panel.component.ts;
docs/pages/product-detail.page.md;
docs/agent-checklists/TZ-COST-303.md;
progress.md

ЧТО ДЕЛАТЬ:
1. Modules list: колонка «Себест.» из cost-preview (lazy/batch — не N+1 без меры;
   допустим on-demand при открытии списка с debounce или поле cached later).
   P0 pragmatic: показывать на **detail** уже из 302; в list — если preview
   дешёвый batch endpoint появился в 302, иначе list = «см. карточку».
2. Product list/detail: `costPrice` рядом с `listPrice` (RU: Себест. / Прайс).
3. BOM inspector: вклад строки (материал: price×qty; модуль: preview×qty) —
   read-only hint.

НЕ: редактировать цену модуля вручную; не путать с RAL/kind colors (331).

AC: tsc FE; ручной сценарий в checklist; Cursor PASS.
