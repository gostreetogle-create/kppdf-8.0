# TZ-SALES-373: Шрифт таблицы КП на бланке А4

РОЛЬ АГЕНТА: Full-stack UI (Create КП + quotation sheetLayout + table preview HTML)

ЗАВИСИМОСТИ: SALES-370/371/372 DONE; UX-318 DONE; DOC-TABLES-309/310 DONE (другие keys)

LAYER: 3

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md

CONFLICT KEYS: frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.ts ; frontend/src/app/pages/commercial/proposals/proposal-create-table-editor.component.ts ; frontend/src/app/pages/commercial/proposals/proposal-create.page.ts ; frontend/src/app/shared/services/pi-proposals.service.ts ; frontend/src/app/shared/services/pi-document-templates.service.ts ; backend/src/modules/quotation/quotation.schema.ts ; backend/src/modules/quotation/dto/create-quotation.dto.ts ; backend/src/modules/quotation/quotation.service.ts ; backend/src/modules/document-template/dto/build-document.dto.ts ; backend/src/modules/table-template/table-template.service.ts ; docs/pages/proposals-create.page.md ; docs/pages/PAGE-TZ-INDEX.md

Проверено:
- `QuotationSheetLayout` / `ProposalSheetLayout` / `BuildSheetLayoutDto` — rows/photo/showPhoto, **без** fontSize
- UI «Вид листа»: `proposal-create-inspector` L226–288
- Тулбар редактора: Рамка / Шапка / Колонки (`proposal-create-table-editor`)
- HTML бланка: `table-template.service.ts` `preview()` — `th`/`td` без `font-size`; `sheetLayout` уже уходит 5-м аргументом как `TablePhotoOptions`
- Эталон UI шрифта: `text-block-editor` select 6…32 (для КП таблицы — более узкий разумный диапазон)
- Документы → шаблоны таблиц **не** трогать (PO уже путал экраны)

Loose wording PO «шрифт таблица КП» → `sheetLayout.tableFontSize` (px), UI Create КП.

## ИСХОДНОЕ СОСТОЯНИЕ

1. Длинный текст на А4 «простынёй» — PO хочет уменьшить шрифт таблицы на бланке.
2. Шрифт есть в текстовых блоках Документов; в Create КП / sheetLayout — нет.
3. Нужное место: **не** `/doc-constructor/tables`, а Create КП.

## ЧТО ДЕЛАТЬ

### ШАГ 1. Модель `sheetLayout.tableFontSize`

1. Добавить optional/default число **`tableFontSize`** (px) в:
   - `QuotationSheetLayout` (+ schema bounds)
   - `QuotationSheetLayoutDto`
   - `quotation.service` `mapSheetLayout`
   - `BuildSheetLayoutDto`
   - FE: `ProposalSheetLayout` / `ProposalSheetLayoutState` / `DEFAULT_KP_SHEET_LAYOUT`
   - `BuildSheetLayout` в `pi-document-templates.service.ts`
2. Default для старых КП без поля: **12**.
3. Допустимый диапазон UI+валидации: **8…20** (шаг 1). Вне диапазона — clamp в mapSheetLayout.

### ШАГ 2. HTML бланка / preview / PDF path

1. Расширить `TablePhotoOptions` (или явный alias) полем `tableFontSize?: number`.
2. В `table-template.service` `preview()`: на `<table>` (или каждый `th`/`td`) применить `font-size:{N}px` из options (default 12).
3. Убедиться, что Create КП `build` уже передаёт `sheetLayout` в preview (5-й arg) — поле должно доехать без ломания photoScale/crop.
4. Focused unit/spec: смена `tableFontSize` меняет inline style в HTML preview (хотя бы один assert).

### ШАГ 3. UI — Paper & Ink, два связанных места (один state)

**A. Параметры → «Вид листа»** (inspector)

- Контрол **«Шрифт таблицы»** рядом со строк/фото.
- `app-pi-overflow-select` (не native `<select>`), пункты 8…20, значение из `sheetLayout().tableFontSize`, `data-test="kp-sheet-table-font"`.
- RU label, без «px» в каждом option или с «12» как сейчас в текстовых блоках — как принято в Paper & Ink рядом (предпочтительно просто число, unit в label «Шрифт таблицы, pt/px» → пиши **«Шрифт таблицы»** + числа).

**B. Редактор таблицы → тулбар**

- Компактный контрол **«Шрифт»** рядом с «Рамка» / «Шапка» (та же зона chrome).
- Тот же overflow-select / тот же binding на `sheetLayout.tableFontSize` через input+output или callback с page (не дублировать второй store).
- `data-test="kp-table-editor-font"`.

Оба места пишут в **один** `sheetLayout` → autosave / build preview как остальные поля листа.

### ШАГ 4. Живой редактор (лёгкий WYSIWYG)

На таблице в `proposal-create-table-editor` применить CSS `font-size` от текущего `tableFontSize` (через input), чтобы менеджер видел эффект до печати. Не ломать плотность rowPresentation.

### ШАГ 5. Docs

1. `proposals-create.page.md` — note SALES-373.
2. `PAGE-TZ-INDEX.md` — `/proposals/create`.

## ИЗМЕНЯТЬ

- Перечисленные CONFLICT KEYS + узкие specs (quotation mapSheetLayout / table preview / inspector / editor / page build wiring)
- checklist / progress / archive по `GEMINI.md`

## НЕ ИЗМЕНЯТЬ

- `/doc-constructor/tables` dialog / TableColumn.fontSize
- Текстовые блоки Документов (уже есть шрифт)
- Per-column font (только глобальный шрифт таблицы КП)
- Deploy / wipe
- Чужой WIP

## КРИТЕРИИ ПРИЁМКИ

1. В Create КП → Параметры → Вид листа есть «Шрифт таблицы» (8…20).
2. В Редакторе таблицы тулбар есть «Шрифт», синхрон с Вид листа.
3. Смена шрифта сохраняется в `quotation.sheetLayout.tableFontSize` (F5 / reopen draft).
4. A4 preview / build HTML таблицы отражает `font-size` (меньше шрифт → плотнее на листе).
5. Старые КП без поля → 12, без поломки photo/rows.
6. Gates:

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
cd frontend && pnpm test -- proposal-create
cd backend && pnpm test -- table-template.service
```

(Если узкий spec-файл точнее — допустимо; полный ng build не обязателен.)

## known_limitation

- Нет per-column / per-cell font.
- Не лечит «простыню» одностраничным чудом: при огромных описаниях всё ещё multi-page; шрифт + density + скрыть описание — вместе.

## Финализация

checklist `docs/agent-checklists/TZ-SALES-373.md` → gates →
`## Executor report (auto)` → archive после Cursor/PO PASS.
Deploy НЕ.
