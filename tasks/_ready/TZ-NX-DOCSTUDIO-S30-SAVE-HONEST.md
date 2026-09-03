# TZ-NX-DOCSTUDIO-S30-SAVE-HONEST: «Сохранить» пишет на сервер

**РОЛЬ АГЕНТА:** Executor (frontend-nx)  
**LAYER:** 3  
**PAGES:** document-studio  
**PAGE_DOCS:** `docs/pages/document-studio.page.md` §1.2  
**ЗАВИСИМОСТИ:** S29  
**CONFLICT KEYS:** `frontend-nx/.../studio-editor.page.ts`  
**IMPLICIT CONFLICT:** `nx build kppdf-web`

## ИСХОДНОЕ

```ts
saveDocument(): void { this.toast.success('Сохранено'); }
```

Реальные записи: debounce layouts (`flushLayouts`), context PATCH, blocks API, `syncQuotation`.

## ЧТО ДЕЛАТЬ

1. `saveDocument` async: `await flushLayouts()` → если `isKpDoc() && quotationId` → `syncQuotation` → toast success **только** если всё ok.  
2. Ошибка/409 → conflict/error toast, **без** success.  
3. `saving` signal: disable `data-test="studio-save"` на время.  
4. Не дублировать save-as template.

## КРИТЕРИИ ПРИЁМКИ

1. Network: Save при dirty layout → layouts API.  
2. КП: Save → sync quotation вызывается.  
3. Нет ложного «Сохранено» при ошибке.  
4. `nx build kppdf-web` PASS.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S30-SAVE-HONEST.done.md`
