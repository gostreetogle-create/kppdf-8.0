# TZ-NX-DOCSTUDIO-S8-PAGES-PANEL: страницы — фон, поля, перенос строк

**РОЛЬ АГЕНТА:** Executor  
**LAYER:** frontend-nx + backend (D2/D5 если нужны поля)  
**IMPLICIT CONFLICT:** `nx build kppdf-web`  
**CONFLICT KEYS:** `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts`; `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-workspace-chrome.ts`  
**PAGES:** document-studio  
**PAGE_DOCS:** `docs/architecture/nx-doc-studio.md` §5 rail «Страницы»  
**ЗАВИСИМОСТИ:** S2 shell; backend D2/D5 — отдельные backend sub-steps внутри TZ если schema gap

## ИСХОДНОЕ СОСТОЯНИЕ

Ribbon: +Страница, ориентация. Нет: фон по странице, page margins, rowsFirstPage/rowsNextPage UI. Plan S5 не landed в NX rail.

## ЧТО ДЕЛАТЬ

1. Добавить rail **Страницы** (или секцию в существующей панели): список страниц, фон (upload/select), нумерация toggle.
2. PATCH `manualPageCount`, `backgroundImage[]`, `defaultBackgroundIndex`, `pageNumbering`.
3. Если backend D5 не в schema — backend micro-TZ first или read-only hint «перенос строк — в шаблоне».
4. Не ломать геометрию листа (overlay law).

## НЕ ИЗМЕНЯТЬ

- Canvas compositing law
- Passport overlay (S7-6)

## КРИТЕРИИ ПРИЁМКИ

1. ≥2 страницы с разным фоном видны в preview.
2. Ориентация + page count без regression.
3. `nx build kppdf-web` exit 0.

## known_limitation

Полные `pageMargins` и sheetLayout могут потребовать отдельный backend TZ (D2/D5) — зафиксировать в .done.md что вошло.

## Финализация

Archive → `tasks/_archive/2026-08/TZ-NX-DOCSTUDIO-S8-PAGES-PANEL.done.md`
