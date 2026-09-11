# TZ-NX-DOCSTUDIO-TABLE-COL-STRUCTURE: порядок + добавить «Количество»

**РОЛЬ АГЕНТА:** Executor (frontend-nx + studio BE hydrate если нужно) — claude  
**ЗАВИСИМОСТИ:** `TZ-NX-DOCSTUDIO-PROPS-PANEL-WIDTH` DONE  
**LAYER:** 3 · **SIZE:** M  
**PAGES:** `/studio/:id`  
**PAGE_DOCS:** `document-studio.page.md`

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-properties.component.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-properties.component.spec.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-table-defaults.ts` ;  
`frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor-column-rehydrate.spec.ts` (если order) ;  
`docs/pages/document-studio.page.md` ;  
`docs/agent-checklists/WAVE-NX-DOCSTUDIO-TABLE-PROPS.md` ;  
`docs/agent-checklists/_NOW.md`

IMPLICIT CONFLICT: nx build kppdf-web

### Domain
- Сейчас `columnsEditable()` = false при `tableTemplateId` → нет ↑↓ и нельзя добавить колонку.
- Чекбоксы только hide/show колонок вида.
- Нужно: **порядок** на экземпляре таблицы + **добавить** стандартные поля (минимум `qty` / «Количество»), не требуя править шаблон в реестре каждый раз.

## ЧТО ДЕЛАТЬ

1. Разрешить reorder колонок (существующий `moveColumn`) при выбранном виде: порядок хранится на **блоке** (override), не обязательно PATCH template.
2. UI «Добавить колонку» / palette: минимум **Количество** (`qty`), плюс типовые если отсутствуют (sku, photo, unit, description, price) — ключи = `COLUMN_ALIASES` / `studio-table-defaults`.
3. После add/reorder — rehydrate `liveRows` / manual cells в правильном порядке (не orphan values).
4. Hide-checkboxes остаются.
5. Specs + WAVE row 02.

## НЕ

- Per-row qty editing UX polish (TZ-03); photo smoke (TZ-04)

## AC

1. При виде «Продукты» можно сдвинуть «Фото» влево/вправо — canvas совпадает.
2. Можно добавить «Количество», если его не было в виде — колонка появляется.
3. Gates PASS.

---

**ARCHIVE_MARKER:** DONE 2026-09-11T19:35:00Z — SHA `24e2ae14` (main, pushed)
