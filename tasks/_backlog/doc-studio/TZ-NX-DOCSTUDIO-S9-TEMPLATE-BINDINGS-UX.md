# TZ-NX-DOCSTUDIO-S9-TEMPLATE-BINDINGS-UX: привязки + dblclick текст

**РОЛЬ АГЕНТА:** Executor (frontend-nx)  
**LAYER:** 3  
**PAGES:** document-studio  
**ЗАВИСИМОСТИ:** S9-A (anchor picker groups)  
**CONFLICT KEYS:** `studio-blocks-canvas*`; `studio-properties-panel*`; `studio-data-field-picker*`

## ИСХОДНОЕ

- Токены вставляются через picker без привязки к anchorKey groups (S9-A adds).
- Dblclick на текстовом блоке **не реализован** (только click select).
- Таблица: inline edit on select — OK.

## ЧТО ДЕЛАТЬ

1. **Dblclick** на text block (не locked, editor mode): `openLayerProperties(id)` + focus rich-text в properties panel.
2. **Picker ERP:** секции по anchorKey + singleton sources; preview hint «подставится из: Клиент (Иванов…)».
3. **Table properties:** dropdown «Источник строк» — sync с S9-B options when available.
4. **Empty token state:** badge «нет данных» в Preview ghost optional (nice) или status-bar hint.
5. Kit/passport note for dblclick pattern.

## КРИТЕРИИ ПРИЁМКИ

1. Dblclick text → properties open + caret in editor.
2. Single click still select-only (no accidental edit).
3. Escape closes inline focus without losing selection.
4. `nx build kppdf-web` + focused spec.

## НЕ ИЗМЕНЯТЬ

- Backend substitution logic
