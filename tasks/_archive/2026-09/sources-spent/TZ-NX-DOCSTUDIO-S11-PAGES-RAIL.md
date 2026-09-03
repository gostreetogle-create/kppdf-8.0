# TZ-NX-DOCSTUDIO-S11-PAGES-RAIL: фон документа + нумерация

**РОЛЬ АГЕНТА:** Executor (frontend-nx)  
**LAYER:** 3  
**PAGES:** document-studio  
**PAGE_DOCS:** `docs/architecture/nx-doc-studio.md` D2 partial  
**ЗАВИСИМОСТИ:** S8-4 DONE (`11bb0a7e`) — расширение, не rewrite  
**CONFLICT KEYS:** `studio-workspace-chrome.ts`; `studio-editor.page.ts`; ribbon/pages UI new component

## ИСХОДНОЕ

Ribbon: +Страница, orientation. Schema fields exist: `backgroundImage[]`, `defaultBackgroundIndex`, `pageNumbering`, `manualPageCount`. UI для фона/нумерации нет (S8-4 known_limitation).

## ЧТО ДЕЛАТЬ

1. Rail секция **Страницы** (или flyout из ribbon): список страниц 1..N, jump.
2. Document-level: toggle **нумерация страниц** → PATCH `pageNumbering`.
3. Background: выбор из `backgroundImage[]` / upload если API есть; PATCH `defaultBackgroundIndex`.
4. Preview smoke: pageNumbering on → номер в preview HTML.

## known_limitation

Per-page **разный** фон и `pageMargins` — не в scope (D2 full); записать в .done.md.

## КРИТЕРИИ ПРИЁМКИ

1. Toggle нумерации меняет preview.
2. ≥2 страницы — навигация без regression.
3. `nx build kppdf-web` exit 0 last.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S11-PAGES-RAIL.done.md`
