# TZ-NX-DOCSTUDIO-S9C-BINDINGS-FINISH: dblclick edit + token picker

**РОЛЬ АГЕНТА:** Executor (frontend-nx)  
**LAYER:** 3  
**PAGES:** document-studio  
**ЗАВИСИМОСТИ:** S9A DONE (anchor groups in picker)  
**CONFLICT KEYS:** `studio-blocks-canvas*`; `studio-text-properties*`; `studio-data-field-picker*`; `studio-editor.page.ts`

## Domain preflight

Проверено: commit `d981c08b` — dblclick только вызывает `openLayerProperties`, **нет** focus rich-text. Archive S9-C закрыт раньше AC.

## ИСХОДНОЕ

- `studio-blocks-canvas` → `textDoubleClick` → `openLayerProperties` (properties panel opens).
- `studio-text-properties` — rich editor есть, autofocus on dblclick **нет**.
- `studio-data-field-picker-dialog` — нет секций anchorKey.

## ЧТО ДЕЛАТЬ

1. Dblclick text (unlocked, editor): open Properties + **focus/caret** в rich-text (`requestAnimationFrame` / `@ViewChild` focus).
2. Single click — select only (regression test).
3. Token picker: группы «Якорь: Клиент / Плательщик» → `{{anchor.client.field}}`; hint «подставится из: …» если anchor заполнен.
4. Escape — blur editor, selection сохраняется.
5. Spec smoke: dblclick opens properties + focus signal/test hook.

## НЕ ИЗМЕНЯТЬ

- Backend substitution (S9A/S9B)

## КРИТЕРИИ ПРИЁМКИ

1. Dblclick → properties open + caret in editor (manual smoke OK).
2. Single click не открывает edit mode.
3. Picker показывает anchor groups после S9A.
4. `cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=studio` exit 0.
5. `cd frontend-nx && pnpm exec nx build kppdf-web` exit 0 **последним**.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S9C-BINDINGS-FINISH.done.md`
