# TZ-SALES-374: Редактор таблицы КП — иконки chrome, два шрифта, drawer-actions, рамка строки

РОЛЬ АГЕНТА: Frontend (+ thin sheetLayout BE)

ЗАВИСИМОСТИ: SALES-370/373 DONE; UX-319 DONE (эталон рамки expand)

LAYER: 3

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md

CONFLICT KEYS: frontend/src/app/pages/commercial/proposals/proposal-create-table-editor.component.ts ; frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.ts ; frontend/src/app/pages/commercial/proposals/proposal-create.page.ts ; frontend/src/app/shared/services/pi-proposals.service.ts ; frontend/src/app/shared/services/pi-document-templates.service.ts ; backend/src/modules/quotation/quotation.schema.ts ; backend/src/modules/quotation/dto/create-quotation.dto.ts ; backend/src/modules/quotation/quotation.service.ts ; backend/src/modules/document-template/dto/build-document.dto.ts ; backend/src/modules/table-template/table-template.service.ts ; docs/pages/proposals-create.page.md ; docs/pages/PAGE-TZ-INDEX.md

Проверено: скрины PO; `proposal-create-table-editor` L119–158 (Рамка/Шапка/Шрифт текстом), L616–707 (4 кнопки в жёлобе), L711+ drawer; `sheetLayout.tableFontSize` (373); UX-319 frame pattern на `pi-table`.
Чеклист PO: `docs/agent-checklists/PO-KP-TABLE-EDITOR-CHROME-2026-08-15.md`.

## ИСХОДНОЕ СОСТОЯНИЕ

1. Тулбар: текстовые «Рамка: … / Шапка: …» — PO хочет иконки.
2. Один `tableFontSize` — нельзя отдельно шапку и тело.
3. В каждой строке 4 иконки справа — тесно; действия строки должны жить в drawer.
4. Раскрытый drawer без общей рамки с data-row (в отличие от products UX-319).

## ЧТО ДЕЛАТЬ

### ШАГ 1. Chrome тулбар → иконки

1. **Рамка**: icon-button (цикл thin→normal→thick), `title`/`aria-label` = «Рамка: Тонкая|Обычная|Жирная»; сохранить `data-test="kp-table-editor-border"`.
2. **Шапка**: icon-button Bold (toggle normal/bold), label в aria; `data-test="kp-table-editor-header"`.
3. Lucide из уже используемых в проекте; Paper & Ink, active state читаем light/dark.
4. Опционально: убрать слово «пресет» из «Открыть пресет в Документах» → «Открыть шаблон в Документах» (та же кнопка Ещё).

### ШАГ 2. Два размера шрифта

1. `sheetLayout.tableFontSize` — **тело** таблицы (как сейчас, default 12, 8…20).
2. Новый `sheetLayout.tableHeaderFontSize` — **шапка** (default **12**, clamp 8…20); старые КП без поля → 12.
3. UI тулбар: два компактных overflow-select — «Шапка» / «Текст» (или иконка Heading + Type) с aria; `data-test="kp-table-editor-font-header"` / `kp-table-editor-font` (body).
4. Параметры → Вид листа: два поля «Шрифт шапки» / «Шрифт таблицы» (sync с тулбаром).
5. `table-template.service` preview: `th { font-size: headerPx }`, `td`/table body `font-size: bodyPx` (не один на весь table, если ломает th — задать явно на th и td).
6. Live editor: header cells / body cells отражают размеры.

### ШАГ 3. Жёлоб строки → только стрелка

1. В `editor__col-act` оставить **только** кнопку раскрытия drawer (chevron).
2. Карандаш, ⋯-меню, корзину перенести в drawer:
   - секция **«Действия»** (или «Строка / изделие»);
   - кнопки/ссылки с теми же `data-test` где возможно (`kp-table-editor-edit-N`, `row-actions`, `remove`) **или** новые `kp-row-drawer-*` + обновить specs.
3. Пункты меню с ясными RU:
   - «Дублировать строку КП» (только в этом КП);
   - «Создать копию в каталоге» (новый Product; было «Создать копию изделия»);
   - «Открыть карточку изделия»;
   - «Убрать из КП» (destructive).
4. Поведение emit/handlers не менять по смыслу — только место в UI.

### ШАГ 4. Рамка раскрытой строки (как products)

1. Когда `openRowIndex() === index`: класс на data-`<tr>` + drawer-`<tr>` (напр. `editor__row--open` / `editor__row-drawer--open`).
2. Ink-рамка ~1.5–2px вокруг пары; соседние строки `opacity` ~0.5.
3. Не трогать `pi-table` kit (это локальный editor table).

### ШАГ 5. Docs + gates

1. `proposals-create.page.md` + `PAGE-TZ-INDEX` — note 374.
2. Specs: row gutter только chevron; drawer содержит actions; header/body font in preview HTML.

## НЕ ИЗМЕНЯТЬ

- `/doc-constructor/tables`
- Per-column font
- Смысл duplicate-kp / create-product-copy / catalog edit API
- Deploy

## КРИТЕРИИ ПРИЁМКИ

1. Тулбар: Рамка/Шапка — иконки с понятным aria/title состояния.
2. Можно задать разный размер шрифта шапки и тела; оба на бланке preview.
3. В строке справа только стрелка; остальные действия в открытой панели.
4. «Создать копию в каталоге» подписано ясно.
5. Раскрытая строка+панель в рамке; соседи приглушены.
6. Gates:

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
cd frontend && pnpm test -- proposal-create
cd backend && pnpm test -- table-template.service
```

## known_limitation

- Иконки плотности/акцента внутри drawer можно оставить текстовыми seg-кнопками в этой TZ (не блокер).
- Ещё-меню «шаблон в Документах» — только rename copy.

## Финализация

checklist `docs/agent-checklists/TZ-SALES-374.md` → READY FOR REVIEW → archive после Cursor PASS.
Deploy НЕ.
