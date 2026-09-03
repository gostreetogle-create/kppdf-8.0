# TZ-NX-DOCSTUDIO-S12-SHEET-LAYOUT-D5: перенос строк таблицы

**РОЛЬ АГЕНТА:** Executor (backend)  
**LAYER:** 3  
**PAGES:** document-studio  
**PAGE_DOCS:** `docs/architecture/nx-doc-studio.md` D5  
**ЗАВИСИМОСТИ:** S12-PAGE-MARGINS желателен (same pages rail)  
**CONFLICT KEYS:** `studio-document.schema.ts`; `studio-document.service.ts`; `studio-multipage.utils.ts`; pages rail UI

## ИСХОДНОЕ

`defaultSheetLayout` на template; `studio-multipage.utils.ts` uses `DEFAULT_ROWS_FIRST/NEXT` (20/25). `createFromTemplate` не копирует sheetLayout в document.

## ЧТО ДЕЛАТЬ

1. `sheetLayout: { rowsFirstPage, rowsNextPage }` on `StudioDocument`.
2. `createFromTemplate` / `duplicate` — copy from template `defaultSheetLayout`.
3. `planStudioMultipage` reads doc.sheetLayout instead of constants when >0.
4. UI in pages rail: два number inputs + hint RU.
5. Spec: rowsFirstPage=5 → first page table segment max 5 rows.

## КРИТЕРИИ ПРИЁМКИ

1. Template with layout → new doc inherits → multipage preview splits table accordingly.
2. `pnpm test -- studio-multipage` exit 0.
3. `nx build kppdf-web` exit 0 last.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S12-SHEET-LAYOUT-D5.done.md`
