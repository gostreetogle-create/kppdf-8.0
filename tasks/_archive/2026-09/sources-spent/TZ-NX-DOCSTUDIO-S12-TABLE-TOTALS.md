# TZ-NX-DOCSTUDIO-S12-TABLE-TOTALS: сумма/НДС на сервере D3-lite

**РОЛЬ АГЕНТА:** Executor (backend)  
**LAYER:** 3  
**PAGES:** document-studio  
**PAGE_DOCS:** `docs/architecture/nx-doc-studio.md` D3  
**ЗАВИСИМОСТИ:** S9B catalog resolver DONE  
**CONFLICT KEYS:** `studio-data-resolver.ts`; `renderStudioTableHtml`; column type sum

## ИСХОДНОЕ

Table render ignores `ColumnType` sum; totals only client-side in KP workspace. Catalog/ERP rows in preview — no footer row.

## ЧТО ДЕЛАТЬ

1. If table columns include `type: 'sum'` or key alias `sum/total` — append footer row with numeric sum of resolved rows (catalog + quotation + order).
2. Respect disabled rows if present in dataSet metadata.
3. Spec: 3 rows qty×price → footer sum correct.
4. HTML escape footer like body cells.

## known_limitation

VAT/NDS breakdown — отдельная TZ; здесь только row sum footer.

## КРИТЕРИИ ПРИЁМКИ

1. Preview table with sum column → footer total matches.
2. `pnpm test -- studio-data-resolver` exit 0.
3. `nx build kppdf-web` exit 0 last.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S12-TABLE-TOTALS.done.md`
