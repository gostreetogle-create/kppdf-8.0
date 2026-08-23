# TZ-SALES-377: Continuation pages — фон + таблица (UNPARK 2026-08-19)

> Было PARK до PO PASS на 376. PO 2026-08-19 явно просит доделать страничный режим.

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md

РОЛЬ АГЕНТА: backend document build (+ docs, minimal FE if preview labels needed)
ЗАВИСИМОСТИ: TZ-SALES-376 DONE · TZ-SALES-378 DONE · **TZ-SALES-380 DONE**
LAYER: 3

CONFLICT KEYS:
backend/src/modules/document-template/document-template.service.ts;
backend/src/modules/document-template/document-template.assets.spec.ts;
docs/pages/proposals-create.page.md;
docs/pages/PAGE-TZ-INDEX.md;
docs/audits/2026-08-15-kp-multipage-table-overflow-audit.md

Проверено (`2026-08-15-kp-multipage-table-overflow-audit.md`):
- Split и фон на multipage — 378 DONE
- Стр.2+ **повторяют все блоки** page 0 (логотип, тексты) — PO smell
- Intent: промежуточные страницы = **фон шаблона + таблица позиций**; итог/условия только на последней

## ИСХОДНОЕ СОСТОЯНИЕ

Multipage `renderHtmlPages` клонирует полный набор blocks на каждую страницу.
На стр.2+ визуально «дублируется шапка КП», хотя таблица уже remapped на full height (378).

## ЧТО ДЕЛАТЬ

### 1. Continuation mode в build

В `document-template.service.ts` при `pageIndex > 0` и **не** последняя страница:

- Рендерить: `.doc-bg` + line-items table block(s) только
- **Не** рендерить: decorative text/image/header blocks с `layout.page === 1` (или все non-table
  кроме фона — зафиксировать whitelist в коде + comment)
- На **последней** странице: table remainder + footer totals + `terms` как сейчас

Флаг: implicit (always on для multipage КП) **или** `DocumentTemplate.continuationMode: 'background-table'`
(default true для docType КП). Предпочтение: implicit для line-items split path — меньше UI.

### 2. Фон

- `backgroundImage[defaultBackgroundIndex]` на **каждой** `.doc-page` — без регрессии 378
- Если несколько `backgroundImage[]` — **не** делать per-page picker в этой TZ (successor)

### 3. Tests

- 30 строк, 4/6 split: page 1 has header blocks; page 2 HTML **нет** duplicate header text block
  (assert by block id / class / snapshot substring)
- Last page: totals + terms present
- Single-page КП без регрессии

### 4. Docs

- `proposals-create.page.md` §377
- Audit amendment: continuation strip done

## НЕ ИЗМЕНЯТЬ

- Multi-template «бланк стр.1 / бланк стр.2» — never в этой TZ
- Builder multi-page canvas
- Frontend table editor / sheetLayout UI (380)
- Deploy scripts

## КРИТЕРИИ ПРИЁМКИ

1. Create КП 25+ позиций: стр.2+ без декоративных блоков стр.1; фон виден; таблица на весь лист.
2. Последняя страница: итоги и условия на месте.
3. PDF/печать используют тот же HTML (browser print + server PDF).
4. Gates:
   ```text
   cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
   cd backend && pnpm test -- document-template
   ```

## known_limitation

- Per-page разные фоны (`backgroundImage[1]` для стр.2) — successor (KP3 `kpPage2` gap в field-map)
- Builder не показывает preview стр.2+ — только Create КП / PDF

Финализация: `tasks/_archive/2026-08/TZ-SALES-377.done.md` + lock.
