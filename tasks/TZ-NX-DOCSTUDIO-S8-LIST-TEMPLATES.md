# TZ-NX-DOCSTUDIO-S8-LIST-TEMPLATES: список — из шаблона и дублирование

**РОЛЬ АГЕНТА:** Executor  
**LAYER:** frontend-nx  
**IMPLICIT CONFLICT:** `nx build kppdf-web`  
**CONFLICT KEYS:** `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-list.page.ts`  
**PAGES:** document-studio  
**PAGE_DOCS:** `docs/pages/document-studio.page.md` §5  
**ЗАВИСИМОСТИ:** API `from-template`, `duplicate` на backend DONE

## ИСХОДНОЕ СОСТОЯНИЕ

`/studio` — только «Создать документ» (пустой A4). Legacy list: + Новый, Из шаблона, Дублировать.

`PiStudioDocumentsService.duplicate` exists; `from-template` — проверить endpoint в data-access.

## ЧТО ДЕЛАТЬ

1. Toolbar списка: **Создать** · **Из шаблона** · (row action) **Дублировать**.
2. «Из шаблона»: диалог выбора `document_templates` (или doc types + templates list) → `POST from-template` → navigate `/studio/:id`.
3. Дублировать: row menu или icon → `duplicate(id)` → navigate.
4. `data-test` на кнопки; spec smoke.

## НЕ ИЗМЕНЯТЬ

- Editor page logic
- Save-as-template (уже в editor)

## КРИТЕРИИ ПРИЁМКИ

1. Live: новый документ из шаблона открывается с блоками шаблона.
2. Duplicate создаёт копию с новым id.
3. `nx build kppdf-web` exit 0.

## Финализация

Archive → `tasks/_archive/2026-08/TZ-NX-DOCSTUDIO-S8-LIST-TEMPLATES.done.md`
