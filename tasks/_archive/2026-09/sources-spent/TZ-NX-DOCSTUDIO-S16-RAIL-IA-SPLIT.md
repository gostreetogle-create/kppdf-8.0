# TZ-NX-DOCSTUDIO-S16-RAIL-IA-SPLIT: лево=данные, право=макет

**РОЛЬ:** Executor (frontend-nx)  
**LAYER:** 3 · **PAGES:** document-studio  
**IMPLICIT CONFLICT:** `nx build kppdf-web`  
**ЗАВИСИМОСТИ:** S15 DONE  
**CONFLICT KEYS:** `studio-editor.page.ts`; `studio-workspace-chrome.ts`; `ShellToolRailService` wiring

## ИСХОДНОЕ

Сейчас left rail: Элементы, Данные, Шаблон, Слои. Right: только Свойства (`studio-editor.page.ts:685-733`).  
PO: **лево = переменные документа**, **право = редактирование шаблона/макета**.

## ЧТО ДЕЛАТЬ

1. **Left rail:** только `data` («Данные»).
2. **Right rail** (сверху вниз): `elements`, `layers`, `pages` (заглушка до S17), `properties`, `template`.
3. Добавить `pages` в `StudioWorkspaceSection` + иконка (FileStack или аналог lucide).
4. `studioPanelSide`: все кроме `data` → `right`; flyout открывается справа.
5. Default active section при открытии документа: `data` (заполнение), не `layers`.
6. `@switch` в editor: case `pages` — временно «Страницы — в S17» или минимальный placeholder с `data-test="studio-pages-panel-stub"`.
7. Обновить `docs/pages/document-studio.page.md` §1.3 целевая IA.

## НЕ МЕНЯТЬ

- Содержимое панелей (кроме переноса switch cases).
- A4 geometry law.
- Ribbon (S17).

## КРИТЕРИИ ПРИЁМКИ

1. Left chrome: одна кнопка «Данные».
2. Right chrome: Элементы, Слои, Страницы, Свойства, Шаблон.
3. Панели открываются с правой стороны для макета.
4. `nx build kppdf-web` exit 0 last.

## Archive

`tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S16-RAIL-IA-SPLIT.done.md`
