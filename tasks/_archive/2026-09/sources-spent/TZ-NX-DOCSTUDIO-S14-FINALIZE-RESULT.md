# TZ-NX-DOCSTUDIO-S14-FINALIZE-RESULT: результат архивации

**РОЛЬ АГЕНТА:** Executor (frontend-nx)  
**LAYER:** 3  
**PAGES:** document-studio  
**ЗАВИСИМОСТИ:** —  
**CONFLICT KEYS:** `studio-editor.page.ts`

## ИСХОДНОЕ

`onFinalize`: `window.confirm` + toast «Документ в архиве». `generatedDocument` из API не показывается оператору.

## ЧТО ДЕЛАТЬ

1. Replace `window.confirm` → `AlertDialogComponent` (destructive).
2. On success: toast/dialog с номером/именем generated document + кнопка «Открыть» если есть route/link в data-access.
3. Status bar: «В архиве · № …» read-only.
4. Editor mode → preview-only или disable edit controls when status≠draft.

## КРИТЕРИИ ПРИЁМКИ

1. Finalize success показывает идентификатор архивного документа.
2. Draft-only actions disabled после finalize.
3. Studio tests + build exit 0.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S14-FINALIZE-RESULT.done.md`
