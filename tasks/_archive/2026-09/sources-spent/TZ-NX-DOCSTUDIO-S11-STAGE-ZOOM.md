# TZ-NX-DOCSTUDIO-S11-STAGE-ZOOM: Fit / 100% toolbar

**РОЛЬ АГЕНТА:** Executor (frontend-nx)  
**LAYER:** 3  
**PAGES:** document-studio  
**PAGE_DOCS:** `docs/pages/document-studio.page.md` §1.4  
**ЗАВИСИМОСТИ:** S11-SELECT optional parallel; не блокирует  
**CONFLICT KEYS:** `studio-workspace-shell.component.*`; `studio-editor.page.ts`; `studio-geometry.ts`

## ИСХОДНОЕ

`studio-workspace-shell.component.html:80-86` — Fit/100% disabled. `studioSheetRect()` уже считает fit-by-stage — используется для размера листа.

## ЧТО ДЕЛАТЬ

1. **Fit** — пересчитать sheet size от viewport (ResizeObserver), default zoom=fit.
2. **100%** — zoom scale 1.0 от «логического» A4 px (не ломать overlay law: масштаб через transform на `.kp-ws-sheet`, не менять layout панелей).
3. Показать активное состояние кнопки; page label оставить.
4. `data-test` на Fit/100%.

## НЕ ИЗМЕНЯТЬ

- Overlay panel width law (`kp-workspace-geometry.md`)
- Passport background layer

## КРИТЕРИИ ПРИЁМКИ

1. Fit включается, лист целиком виден в viewport.
2. 100% увеличивает лист предсказуемо; панели не сужают лист.
3. `nx build kppdf-web` exit 0 last.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S11-STAGE-ZOOM.done.md`
