# TZ-NX-DOCSTUDIO-S12-PAGE-BACKGROUND: фон документа в rail «Страницы»

**РОЛЬ АГЕНТА:** Executor (frontend-nx)  
**LAYER:** 3  
**PAGES:** document-studio  
**ЗАВИСИМОСТИ:** S11 DONE (`dcdc74f4`)  
**CONFLICT KEYS:** `studio-editor.page.ts`; pages rail UI; `PiStudioDocumentsService` PATCH

## ИСХОДНОЕ

Schema/DTO уже: `backgroundImage[]`, `defaultBackgroundIndex`, `backgroundOpacity`. S11 добавил page numbering toggle. UI выбора фона нет.

## ЧТО ДЕЛАТЬ

1. В rail «Страницы»: список `backgroundImage[]` (thumbnail или URL), radio/select `defaultBackgroundIndex`, opacity slider если уже в PATCH.
2. Upload — только если есть готовый endpoint в data-access; иначе select из существующих URLs документа/шаблона.
3. Preview smoke: смена фона видна в Preview mode.
4. Passport image layer (S7) — не ломать.

## КРИТЕРИИ ПРИЁМКИ

1. Выбор фона сохраняется (revision gate) и виден в preview.
2. `nx build kppdf-web` exit 0 last.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S12-PAGE-BACKGROUND.done.md`
