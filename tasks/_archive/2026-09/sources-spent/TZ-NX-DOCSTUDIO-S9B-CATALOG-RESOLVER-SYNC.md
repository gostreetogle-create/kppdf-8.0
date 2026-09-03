# TZ-NX-DOCSTUDIO-S9B-CATALOG-RESOLVER-SYNC: витрина → таблица + resolver

**РОЛЬ АГЕНТА:** Executor (full-stack)  
**LAYER:** 3–4  
**PAGES:** document-studio  
**PAGE_DOCS:** `docs/pages/document-studio.page.md` §3  
**ЗАВИСИМОСТИ:** S9A DONE; vitrina UI exists (`studio-showcase-panel`, commit `48b0d894`)  
**CONFLICT KEYS:** `backend/src/modules/studio-document/studio-data-resolver.ts`; `studio-data-resolver.spec.ts`; `studio-editor.page.ts`; `studio-showcase-panel*`; `registry.service.ts`

## Domain preflight

Проверено: `studio-data-resolver.ts` — только `manual|quotation-items|order-items` (стр. 10–13, 317–353). UI уже пишет `context.catalogSelections` и dropdown catalog-* в table properties, но **Preview не получает строки**. PO: toggle витрины = сразу строки в таблице matching source.

## ИСХОДНОЕ

- `studio-showcase-panel.component.ts` — 4 вкладки, PATCH catalogSelections ✓
- `onCatalogSelectionChange` — только context, **нет sync table rows**
- Resolver tests — 7 tests, zero catalog coverage

## ЧТО ДЕЛАТЬ

### Backend

1. Extend `DataSetSourceType`: `catalog-products|catalog-modules|catalog-parts|catalog-materials`.
2. `fetchLiveRows`: query Product / ProductModule / Material (part filter) by ids from `context.catalogSelections.*`; map to table row shape (name, sku/article, unit, qty=1, price if any).
3. Org validation on ids.
4. Specs: each type + empty selection → zero rows (4 new tests minimum).

### Frontend

1. On vitrina toggle: после PATCH context — для каждой table block с matching `source.type` → `putDataSet` rows from client-side resolver preview **или** refetch preview; revision 409 safe.
2. Uncheck vitrina item → remove row from matching catalog tables + Preview.
3. Manual-source tables не трогать.
4. «Данные» → chips каталога (N изделий…) + remove chip unselects vitrina.

### Registry (optional if quick)

- `GET /registry/data-sources` — descriptor `product-module` if missing.

## НЕ ИЗМЕНЯТЬ

- Anchor roles UI beyond catalog chips (S9A)
- Auto-generate documents (S10)

## КРИТЕРИИ ПРИЁМКИ

1. 3 изделия checked → table source=Изделия → 3 строки Preview без extra click.
2. Uncheck → строка исчезла.
3. Две таблицы (products + materials) — вкладка Материалы не трогает products table.
4. `cd backend && pnpm test -- studio-data-resolver` exit 0 (≥4 catalog tests).
5. `cd frontend-nx && pnpm exec nx build kppdf-web` exit 0 **последним**.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S9B-CATALOG-RESOLVER-SYNC.done.md`
