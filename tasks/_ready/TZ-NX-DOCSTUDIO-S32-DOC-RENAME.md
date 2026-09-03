# TZ-NX-DOCSTUDIO-S32-DOC-RENAME: переименование с ribbon

**РОЛЬ АГЕНТА:** Executor (frontend-nx)  
**LAYER:** 3  
**PAGES:** document-studio  
**PAGE_DOCS:** `docs/pages/document-studio.page.md` §1.2  
**ЗАВИСИМОСТИ:** S31  
**CONFLICT KEYS:** `frontend-nx/.../studio-editor.page.ts`  
**IMPLICIT CONFLICT:** `nx build kppdf-web`

## ИСХОДНОЕ

`doc.name` только display (`ribbon-label` / badge). PATCH name через `documents.update` доступен для других полей.

## ЧТО ДЕЛАТЬ

1. Клик по имени или кнопка «Переименовать» → dialog/inline.  
2. PATCH `{ name, expectedRevision }` → update signal.  
3. Пустое имя → toast error, не слать.  
4. 409 → conflict().

## КРИТЕРИИ ПРИЁМКИ

1. Новое имя на ribbon и в `/studio` списке после reopen.  
2. `nx build kppdf-web` PASS.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S32-DOC-RENAME.done.md`
