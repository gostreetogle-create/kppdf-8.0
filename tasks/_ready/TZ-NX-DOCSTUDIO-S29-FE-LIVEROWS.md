# TZ-NX-DOCSTUDIO-S29-FE-LIVEROWS: canvas берёт hydrated rows

**РОЛЬ АГЕНТА:** Executor (frontend-nx)  
**LAYER:** 3  
**PAGES:** document-studio  
**PAGE_DOCS:** `docs/pages/document-studio.page.md` §2.3  
**ЗАВИСИМОСТИ:** S28  
**CONFLICT KEYS:** `frontend-nx/.../studio-editor.page.ts`; `studio-blocks-canvas.component.ts` (только если settings.liveRows)  
**IMPLICIT CONFLICT:** `nx build kppdf-web`

## ИСХОДНОЕ

1. `onCatalogSelectionChange` вызывает `applyLiveRowsFromDataSet` на response — после S28 rows должны появиться.  
2. `onTableSourceChange` применяет **локальный** `{ rows: [] }`, игнорирует response.  
3. При открытии документа `catalogSelections` восстанавливаются, `liveRows` на блоках — нет.

## ЧТО ДЕЛАТЬ

1. `onTableSourceChange`: после успешного `putDataSet` брать rows из **response** dataSet (как catalog path).  
2. После load document+blocks: для каждой table с ERP/catalog source — либо putDataSet refresh, либо apply из `doc.dataSets` если rows уже hydrated на GET (если GET не гидратит — один putDataSet refresh на load).  
3. Убедиться canvas читает `settings.liveRows` (уже) и обновляет signal blocks.  
4. Минимальный spec/editor test если есть harness; иначе AC глазом.

## НЕ ИЗМЕНЯТЬ

- Preview UI (S31)  
- Save button (S30)

## КРИТЕРИИ ПРИЁМКИ

1. Выбрал 2 изделия в витрине → на таблице в **Редакторе** 2 строки без Preview.  
2. Сменил источник таблицы на «Из КП» при выбранном КП → строки с response.  
3. F5 / reopen → строки снова на месте (или авто-refresh без ручного re-select).  
4. `nx build kppdf-web` PASS.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S29-FE-LIVEROWS.done.md`
