# TZ-NX-DOCSTUDIO-S28-PUT-DATASET-HYDRATE: hydrate rows в putDataSet

**РОЛЬ АГЕНТА:** Executor (backend)  
**LAYER:** 4  
**PAGES:** document-studio  
**PAGE_DOCS:** `docs/pages/document-studio.page.md` §2.3  
**ЗАВИСИМОСТИ:** S27 archived (UI может слать пустые rows)  
**CONFLICT KEYS:** `backend/src/modules/studio-document/studio-document.service.ts`; `studio-data-resolver.ts`; `studio-document.service.spec.ts`; `studio-data-resolver.spec.ts`  
**IMPLICIT CONFLICT:** none for nx app (BE only) — всё равно не параллелить с FE studio без нужды

## ИСХОДНОЕ

`putDataSet` upsert'ит `dto.dataSet` as-is. FE шлёт `rows: []`. Preview/PDF гидратят через resolver отдельно. Canvas `liveRows` остаётся пустым.

## ЧТО ДЕЛАТЬ

1. После upsert, если `source.type` ∈ `quotation-items|order-items|catalog-products|catalog-modules|catalog-parts|catalog-materials`:  
   - загрузить блоки документа / найти table block по key `table-<blockId>`;  
   - `resolveDataSets(doc, blocks, true)`;  
   - в **возвращаемый** document проставить resolved `rows` для этого dataSet entry (live-read; не bake snapshot как finalize).  
2. Empty selection → `rows: []`.  
3. Specs: 2 product ids → 2 rows; empty → 0; org-scope как в resolver.  
4. Не менять finalize/PDF контракт.

## КРИТЕРИИ ПРИЁМКИ

1. API putDataSet response содержит непустые rows при непустом catalogSelections + catalog source.  
2. `cd backend && pnpm test -- studio-data-resolver` и/или studio-document putDataSet specs PASS.  
3. `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` PASS.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S28-PUT-DATASET-HYDRATE.done.md`
