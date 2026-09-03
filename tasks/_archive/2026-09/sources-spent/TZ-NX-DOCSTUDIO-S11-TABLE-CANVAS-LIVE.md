# TZ-NX-DOCSTUDIO-S11-TABLE-CANVAS-LIVE: ERP/catalog rows на листе

**РОЛЬ АГЕНТА:** Executor (frontend-nx)  
**LAYER:** 3  
**PAGES:** document-studio  
**PAGE_DOCS:** `docs/pages/document-studio.page.md` §2.1  
**ЗАВИСИМОСТИ:** S9B resolver DONE  
**CONFLICT KEYS:** `studio-blocks-canvas*`; `studio-table-editor*`; `studio-editor.page.ts`

## ИСХОДНОЕ

Таблица на canvas читает `tableTemplateSampleRows` (manual). ERP/catalog sources резолвятся только в **Preview/PDF** backend-side. Оператор в редакторе не видит строки КП/витрины на листе.

## ЧТО ДЕЛАТЬ

1. Когда block `dataSource.type` ≠ manual: после context/dataSet change — `POST preview` или lightweight rows endpoint → map rows в canvas table display (read-only cells OR synced sample rows).
2. Manual source — unchanged editable behavior.
3. Catalog/quotation/order switch — canvas updates without entering Preview mode.
4. Regression: manual edit still works.

## КРИТЕРИИ ПРИЁМКИ

1. Table source=Изделия + 2 items in vitrina → 2 rows visible on canvas in Editor.
2. Switch to manual → prior ERP rows не block edit.
3. `nx build kppdf-web` exit 0 last.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S11-TABLE-CANVAS-LIVE.done.md`
