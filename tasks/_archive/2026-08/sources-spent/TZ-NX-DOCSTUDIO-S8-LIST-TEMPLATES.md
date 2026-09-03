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

`PiStudioDocumentsService.createFromTemplate` — **DONE** в data-access.  
`PiTableTemplatesService` — это **виды таблиц** (`/table-templates`), **не** document templates.

## Блокер (resume 2026-09-01)

1. **Port** `PiDocumentTemplatesService` + types в `frontend-nx/libs/data-access/src/lib/doc-studio/`  
   — образец: `frontend/src/app/shared/services/pi-document-templates.service.ts` (минимум: `list()` → `GET /document-templates`).
2. Export в `doc-studio/index.ts`.
3. `studio-list.page.ts`: убрать `PiTableTemplatesService`; диалог выбора шаблона → `createFromTemplate(templateId, { name? })` → navigate `/studio/:id`.
4. `duplicate()` — уже через `service.duplicate` (OK).

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
