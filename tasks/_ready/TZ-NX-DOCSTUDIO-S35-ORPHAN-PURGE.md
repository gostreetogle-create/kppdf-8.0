# TZ-NX-DOCSTUDIO-S35-ORPHAN-PURGE: мёртвый код студии

**РОЛЬ АГЕНТА:** Executor (frontend-nx)  
**LAYER:** 3  
**PAGES:** document-studio  
**PAGE_DOCS:** n/a (hygiene)  
**ЗАВИСИМОСТИ:** S34  
**CONFLICT KEYS:** `studio-shell.page.ts`; `studio-table-editor.component.ts`; `studio-editor.page.ts` (dead imports); `studio-workspace-chrome.ts` если мёртвые rail items  
**IMPLICIT CONFLICT:** `nx build kppdf-web`

## ИСХОДНОЕ

- `studio-shell.page.ts` — stub, не в routes.  
- `studio-table-editor.component.ts` — не импортирован.  
- Dead lucide imports в editor (LayoutGrid и т.п. — проверить).  
- Dual rail: `STUDIO_RAIL_ITEMS` vs `railItems=[]` — упростить комментарием или удалить мёртвое.

## ЧТО ДЕЛАТЬ

1. Удалить orphan files **или** пометить `@deprecated` + убрать из barrel, если сомнение — delete если zero refs (Grep).  
2. Убрать unused imports editor.  
3. Build green.

## НЕ ИЗМЕНЯТЬ

- Поведение живых панелей  
- BE

## КРИТЕРИИ ПРИЁМКИ

1. Grep: нет dangling imports на удалённое.  
2. `nx build kppdf-web` PASS.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S35-ORPHAN-PURGE.done.md`
