# TZ-DOC-TABLES-306: Chip «Из данных» не уводит в Каталог/Материалы

PAGES: /doc-constructor/tables  
PAGE_DOCS: tables.page.md  
Smell: PO 2026-08-09 — «Из данных» / создание таблицы из данных → Каталог Материалы

РОЛЬ АГЕНТА: frontend  
ЗАВИСИМОСТИ: желательно archive TZ-DOC-TABLES-305 сначала (общий `tables.page.md`); если 305 ещё `_active` — **STOP/DEFERRED** или трогай только workspace+chips без `tables.page.md` и допиши page.md после  
LAYER: 2  
CONFLICT KEYS: frontend/src/app/shared/page/pi-group-workspace.component.ts; frontend/src/app/shared/page/pi-group-workspace.component.spec.ts; frontend/src/app/pages/doc-constructor/documents/documents-group-chips.ts; frontend/src/app/pages/doc-constructor/tables/tables.page.spec.ts; docs/pages/tables.page.md

Проверено: `TABLES_SECTION_CHIPS` routes = `'/doc-constructor/tables?view=all|from-data'` (`documents-group-chips.ts` 27–33); `PiGroupWorkspace` биндит `[routerLink]="chip.route"` **без** `queryParams` (`pi-group-workspace.component.ts` 72–73). Angular `routerLink` **не** парсит `?view=` из строки path → путь не матчится → `**` → `redirectTo: ''` → **`/materials`**. TOC chip `/doc-constructor/tables` без query — ок; CTA «+ Новая таблица» только при `view==='all'`.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

1. PO не может создать таблицу «из данных»: жёлтый chip уводит в Каталог.
2. Корневая причина — query в строке `routerLink`, не «Материалы» как источник в диалоге.
3. Тот же баг на chip «Все таблицы» (`?view=all`).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. **GroupChip** — опционально `queryParams?: Record<string, string>` (или эквивалент).
2. **PiGroupWorkspace** — `[routerLink]` = path **без** `?…`; если есть query — `[queryParams]="chip.queryParams"`.
3. **TABLES_SECTION_CHIPS** — `route: '/doc-constructor/tables'` + `queryParams: { view: 'all' | 'from-data' }`.
4. Jest: chip navigate с query `view=from-data` остаётся на tables (mock Router / RouterTesting); regress TOC без query.
5. `tables.page.md` — одна строка: chips используют path+queryParams (не `?` в route string).
6. Ручной AC: Документы → Таблицы → «Из данных» → URL `…/tables?view=from-data` + диалог from-registry; **не** `/materials`.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- table-template-dialog registry/preset логика (307 зона)
- overflow-select / DOC-TABLES-305 dialog compact (если 305 ещё active — не трогай dialog keys)
- Catalog `/materials` routes; KP Create; deploy

known_limitation: другие chips в проекте с `?` в route string — grep и починить в этой TZ только Documents tables; остальное → note в progress.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Клик «Из данных» → остаёмся в Документах/Таблицах, открывается from-registry dialog.
2. Клик «Все таблицы» → `?view=all`, не materials.
3. FE tsc + focused specs (workspace ± tables.page) PASS.
4. `git diff --check` PASS.

Verification:
```
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest --config jest.config.js --runInBand src/app/shared/page/pi-group-workspace.component.spec.ts src/app/pages/doc-constructor/tables/tables.page.spec.ts
```
