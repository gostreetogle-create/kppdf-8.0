# TZ-NX-DOCSTUDIO-S8-TABLE-ERP-BIND: таблица ← строки КП/заказа

**РОЛЬ АГЕНТА:** Executor  
**LAYER:** frontend-nx + data-access  
**IMPLICIT CONFLICT:** `nx build kppdf-web`  
**CONFLICT KEYS:** `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-properties.component.ts`; `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts`; `frontend-nx/libs/data-access/src/lib/doc-studio/pi-studio-documents.service.ts`  
**PAGES:** document-studio  
**PAGE_DOCS:** `docs/pages/document-studio.page.md` §2.3  
**ЗАВИСИМОСТИ:** `TZ-NX-DOCSTUDIO-S8-TEXT-SUBSTITUTION` (context уже выбирается); backend `StudioDataResolverService` DONE

## ИСХОДНОЕ СОСТОЯНИЕ

Legacy: `document-studio-editor.facade.ts` `upsertErpDataSet(block, 'quotation-items'|'order-items')` + UI в `studio-panel-table.component.ts`.

NX: `putDataSet` в `PiStudioDocumentsService` **отсутствует или не wired**; grep `quotation-items` в frontend-nx = 0.

Backend резолвер готов: при dataSet + context.quotationId/orderId строки live в preview.

## ЧТО ДЕЛАТЬ

1. Data-access: `putDataSet(documentId, key, { expectedRevision, dataSet: { source: { type }, rows } })` если нет — добавить по API backend.
2. В **Свойства таблицы** (или мини-секция «Источник строк»): radio/select **Вручную | Из КП | Из заказа**.
3. При выборе ERP: `putDataSet` с key `table-${blockId}`, source type, rows `[]`; toast; refresh preview если активен.
4. Hint: «Выберите КП в панели Данные» если context пуст.
5. Портировать UX-hint из legacy panel (source badge).
6. Unit test: смена source вызывает putDataSet с правильным type.

## НЕ ИЗМЕНЯТЬ

- `StudioDataResolverService` backend logic
- Ручное редактирование ячеек на canvas (merge override сохраняется)

## КРИТЕРИИ ПРИЁМКИ

1. Таблица + context.quotationId + source `quotation-items` → Preview показывает позиции КП.
2. Переключение на «Вручную» → manual rows с листа.
3. `nx test kppdf-web --testPathPattern=studio-table` + `nx build kppdf-web` exit 0.

## Финализация

Archive → `tasks/_archive/2026-08/TZ-NX-DOCSTUDIO-S8-TABLE-ERP-BIND.done.md`
