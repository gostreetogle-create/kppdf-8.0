# TZ-SALES-378: Фон на multipage + полная высота таблицы на стр. 2+

РОЛЬ АГЕНТА: Backend document build (+ docs)

ЗАВИСИМОСТИ: TZ-SALES-376 DONE (regression follow-up)

LAYER: 3

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md

CONFLICT KEYS: backend/src/modules/document-template/document-template.service.ts ; backend/src/modules/document-template/document-template.assets.spec.ts ; docs/pages/proposals-create.page.md ; docs/pages/PAGE-TZ-INDEX.md ; docs/audits/2026-08-15-kp-multipage-table-overflow-audit.md

Проверено:
- `renderHtmlPages` берёт только `<body>…</body>` из `renderHtml`, а в outer `<head>` кладёт **только** `.doc-page` size — **без** `.doc-bg` / `.doc-content` / `.block--table` CSS → фон «слетает» на multipage (в т.ч. стр.1)
- `estimateAutoRowCapacity(..., false)` при `rowsNextPage=0` всё ещё `slot = pageH × layout.height` (короткая рамка стр.1) → на стр.2+ те же ~5 строк и пустота
- Table block `layout.y/height` копируется на каждую страницу → визуальный зазор сверху на continuation

Loose wording PO «фон слетает / на следующих страницах по высоте первой / заполнять весь A4» → fix multipage CSS shell + full-page next capacity + remap table layout on pageIndex>0.

## ИСХОДНОЕ СОСТОЯНИЕ

1. Multipage preview: фон обрезан/пропадает (CSS потерян при extract body).
2. Auto next pages = тот же short frame, что page 1.
3. PO: continuation = заполнять **весь лист A4**, не высоту рамки с 1-й страницы.

## ЧТО ДЕЛАТЬ

### ШАГ 1. Multipage CSS shell (фон)

В `renderHtmlPages`:

1. Вынести общие page styles из `renderHtml` в shared helper **или** один раз извлечь `<style>…</style>` из первого `renderHtml` и вставить в outer head вместе с `.doc-page` rules.
2. `.doc-page { position: relative; … }` — containing block для `.doc-bg` и absolute блоков.
3. На каждой `.doc-page` секции фон и таблица снова стилизованы как на single-page.
4. Spec: multipage HTML contains `.doc-bg{position:absolute` (или эквивалент) в **outer** head / доступном iframe head.

### ШАГ 2. Next-page capacity = full sheet

Когда `rowsNextPage === 0` (`isFirstPage === false`):

1. Считать вместимость от **полной** высоты content area (`layoutHeight ≈ 1.0`, или `1 − smallTopMargin` если нужен воздух), **не** от short `targetBlock.layout.height`.
2. Те же font/photo heuristics, что 376.
3. `rowsNextPage > 0` — ручной override без изменений.
4. Spec: short page-1 frame → `firstCapacity < nextCapacity` (auto).

### ШАГ 3. Remap table geometry on continuation pages

Перед `renderHtml` для `pageIndex > 0`:

1. Клонировать line-items table block(s) с `layout.y ≈ 0` (или малый top margin %), `layout.height ≈ 1` (full content), width/x как на стр.1 (обычно full width).
2. Не менять блоки на page 0.
3. Spec: continuation page markup — table `top` near 0%, `height` near 100% (или % из layout-renderer).

### ШАГ 4. Docs

- `proposals-create.page.md` note **378**
- PAGE-TZ-INDEX
- Audit file: short amendment (bg CSS + full next page)

## НЕ ИЗМЕНЯТЬ

- TZ-SALES-377 (strip decorations / continuationMode) — всё ещё PARK
- Builder multi-page canvas / per-page templates
- Frontend product UI (кроме docs), если BE shell достаточен
- AUTH-305, deploy

## КРИТЕРИИ ПРИЁМКИ

1. Multipage build с `backgroundImage`: фон виден на стр.1 и 2+ (не «слетает»).
2. Auto `rowsNext=0`: continuation вмещает **больше** строк, чем short first frame; визуально таблица тянется по листу.
3. Manual rowsFirst/Next > 0 без регрессии.
4. Gates:
   ```text
   cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
   cd backend && pnpm test -- document-template
   ```
5. READY FOR REVIEW → archive после Cursor PASS.

## known_limitation

- Полный «только фон+таблица без логотипов» = SALES-377.
- Density-aware row height всё ещё heuristic.
