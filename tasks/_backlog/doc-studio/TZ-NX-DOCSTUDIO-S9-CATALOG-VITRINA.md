# TZ-NX-DOCSTUDIO-S9-CATALOG-VITRINA: витрина каталога → таблица

**РОЛЬ АГЕНТА:** Executor (full-stack)  
**LAYER:** 3–4  
**PAGES:** document-studio  
**PAGE_DOCS:** `docs/pages/document-studio.page.md` §3  
**ЗАВИСИМОСТИ:** S8-1 DONE; S9-A DONE (context.catalogSelections schema + summary chips)  
**CONFLICT KEYS:** `frontend-nx/.../studio-showcase*`; `studio-editor.page.ts`; `studio-data-resolver.ts`; `studio-data-resolver.spec.ts`; `registry.service.ts`; `docs/architecture/document-studio-data-anchors.md`

## Domain preflight

Проверено: Product (`photoIds`), ProductModule (`pi-modules.service`), Material (`materialKind`: part vs raw/purchased/…); CONTEXT.md — Counterparty≠Organization; PO: выбор витрины **сразу в таблицу**.

## ИСХОДНОЕ

- Нет rail «Витрина»; `DataSetSourceType` только manual | quotation-items | order-items.
- Registry DATA_SOURCES: product, material — без module.

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Backend context + resolver

1. `StudioDocument.context.catalogSelections` — `{ products, modules, parts, materials: string[] }`.
2. PATCH merge + org validation (ids belong to org).
3. Extend `DataSetSourceType`: `catalog-products` | `catalog-modules` | `catalog-parts` | `catalog-materials`.
4. `resolveDataSets`: для каждого type — query Mongo (Product / ProductModule / Material с фильтром kind), map to table row shape (name, article/sku, unit, qty default 1, price if есть).
5. Specs: каждый source + empty selection → zero rows.

### ШАГ 2 — Registry

1. `GET /registry/data-sources` — добавить `product-module` descriptor (fields from schema).
2. Material fields уже есть; document part vs material в UI, не в registry key.

### ШАГ 3 — UI rail «Витрина»

1. Icon-rail left: `LayoutGrid` / «Витрина» flyout ~360px.
2. **4 вкладки:** Изделия | Модули | Детали | Материалы.
3. Карточка: фото (или placeholder), название, артикул; checkbox multi-select; поиск; lazy scroll / page.
4. On toggle select:
   - PATCH `catalogSelections.*`
   - **Sync tables:** все table blocks с dataSet source matching category → rebuild rows from resolver preview client-side OR refetch preview (prefer: update dataSet rows via existing putDataSet + revision).
5. PO rule: **без** промежуточного «добавить в таблицу» — toggle = строка в таблице.

### ШАГ 4 — Table properties

1. Dropdown «Источник строк»: Вручную | КП | Заказ | Изделия | Модули | Детали | Материалы.
2. Bind → dataSet source.type + block settings.

### ШАГ 5 — «Выбрано» chips (Данные)

1. Секция каталога: N изделий, N модулей…; chip remove → unselect vitrina + remove table rows.

### ШАГ 6 — Docs

1. `document-studio.page.md` §2–§3, `document-studio-data-anchors.md` catalog rows table.

## НЕ ИЗМЕНЯТЬ

- Anchor roles UI (S9-A)
- Legacy `/doc-constructor/builder`
- Автогенерация документов (S10)

## Сбои (AC)

1. Снял галочку изделия → строка исчезла из таблицы catalog-products и из Preview.
2. Две таблицы (изделия + материалы) — витрина «Материалы» не трогает таблицу изделий.
3. Таблица manual — витрина не перезаписывает rows.
4. 409 revision — selections не теряются.
5. Деталь (part) не попадает во вкладку «Материалы» и наоборот.

## КРИТЕРИИ ПРИЁМКИ

1. Выбрал 3 изделия → таблица source=Изделия → 3 строки Preview без extra click.
2. Вкладки 4 категории работают с реальными API lists.
3. Backend resolver tests PASS (4 types).
4. `cd backend && pnpm test -- studio-data-resolver` exit 0.
5. `cd frontend-nx && pnpm exec nx build kppdf-web` exit 0 last.

## Финализация

Archive → `tasks/_archive/2026-08/TZ-NX-DOCSTUDIO-S9-CATALOG-VITRINA.done.md`
