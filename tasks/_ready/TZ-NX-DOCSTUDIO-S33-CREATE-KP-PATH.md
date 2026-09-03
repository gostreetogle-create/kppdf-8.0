# TZ-NX-DOCSTUDIO-S33-CREATE-KP-PATH: «Новое КП»

**РОЛЬ АГЕНТА:** Executor (frontend-nx)  
**LAYER:** 3  
**PAGES:** document-studio, proposals  
**PAGE_DOCS:** `docs/pages/document-studio.page.md`; proposals page кратко  
**ЗАВИСИМОСТИ:** S32  
**CONFLICT KEYS:** `frontend-nx/.../studio-list.page.ts`; `proposals-list.page.ts` (CTA only)  
**IMPLICIT CONFLICT:** `nx build kppdf-web`

## ИСХОДНОЕ

`create()` без `docTypeId`. Quotation link только когда тип КП выбран в панели Шаблон. «Создать в студии» с proposals может вести в пустой doc.

## ЧТО ДЕЛАТЬ

1. Кнопка **«Новое КП»** на `/studio` list → create с `docTypeId` КП (`slug==='proposal'` или name «КП» из `PiDocTypesService`).  
2. `/proposals` «Создать в студии» → тот же путь.  
3. Не менять `ensureLinkedQuotation` контракт (link на первом save/effect).  
4. Обычный «Создать документ» оставить generic.

## КРИТЕРИИ ПРИЁМКИ

1. Новое КП → в Шаблон/Данные тип КП уже выбран; после save появляется статус КП.  
2. `nx build kppdf-web` PASS.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S33-CREATE-KP-PATH.done.md`
