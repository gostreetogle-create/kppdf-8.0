# TZ-UX-319: Рамка вокруг раскрытой строки товара (+ приглушение остальных)

РОЛЬ АГЕНТА: Frontend UI (Paper & Ink)

ЗАВИСИМОСТИ: PRODUCTS expand (304+) DONE; pi-table expandedRow уже есть

LAYER: 2

PAGES: /products
PAGE_DOCS: products.page.md

CONFLICT KEYS: frontend/src/app/shared/ui/pi-table.component.ts ; frontend/src/app/shared/ui/pi-table.component.spec.ts ; frontend/src/app/pages/products/products.page.spec.ts ; docs/pages/products.page.md ; docs/pages/PAGE-TZ-INDEX.md

Проверено: скрин PO 2026-08-15 — красная обводка вокруг data-row + beige expand tray на `/products`.
Код: `pi-table.component.ts` L131–195 — data `<tr>` + соседний `<tr class="pi-table-expanded-row" data-test="expanded-row">`; сейчас без общей рамки / dim siblings.
`products.page.ts` использует `[expandedRow]` / `expandedId`.

Loose wording PO «обвести список с товаром рамкой / серый фон» → kit `pi-table` expanded focus chrome.

## ИСХОДНОЕ СОСТОЯНИЕ

1. Раскрытие состава: строка товара + детальная панель визуально «рвутся» от соседей только фоном `bg-paper-2`.
2. PO хочет: **одна грамотная рамка** вокруг пары (товар + раскрытый состав), как на скрине.
3. Опционально: остальные строки приглушены (серее / ниже opacity), чтобы выбор «выпрыгивал».

## ЧТО ДЕЛАТЬ

### ШАГ 1. Классы на строках (pi-table)

1. На data-`<tr>`, когда `isExpandedRow(row)`: добавить класс `pi-table-row--open` (и `data-test` опционально `table-row-expanded` если удобно для spec).
2. Сохранить `data-test="expanded-row"` на detail-tr.

### ШАГ 2. Рамка Paper & Ink

В `styles` компонента `pi-table` (или существующий style-блок):

1. Общая рамка **ink** (`var(--color-ink)` или hairline-ink проекта), **~1.5–2px**, не «жирный маркер».
2. Верхняя строка (`--open`): border-top + left + right; без нижней границы (или hairline в цвет рамки), чтобы стык с detail был непрерывным.
3. Detail (`pi-table-expanded-row` сразу после `--open`): border-bottom + left + right; фон detail чуть теплее/бумажный (`paper-2` / soft gold-mix — как сейчас tray, не ломать).
4. Light **и** dark читаемы; без glow/purple.
5. Скругление не обязательно (таблица); углы могут быть прямыми.

### ШАГ 3. Приглушение соседей

1. Когда в tbody есть `.pi-table-row--open`: остальные data-rows (не open, не expanded-row) — `opacity` ~0.45–0.55 **или** muted background; pointer/hover не ломать критично.
2. Открытая пара остаётся на полной яркости / чуть сильнее фона.
3. Не затемнять весь viewport/страницу модалкой — только строки таблицы.

### ШАГ 4. Spec + docs

1. `pi-table.component.spec` и/или `products.page.spec`: при expand есть `.pi-table-row--open` + `expanded-row`; при collapse — нет.
2. `products.page.md` + `PAGE-TZ-INDEX` — note UX-319.

## НЕ ИЗМЕНЯТЬ

- Backend / composition API
- Логику `expandedId` / tree preview (только chrome)
- Create КП table editor
- Deploy

## КРИТЕРИИ ПРИЁМКИ

1. `/products`: клик по строке с составом → товар+tray обведены одной читаемой ink-рамкой.
2. Соседние строки визуально приглушены, пока одна раскрыта.
3. Collapse / другая строка — рамка переезжает; не остаётся «двойных» рамок.
4. Gates:

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- pi-table.component.spec
cd frontend && pnpm test -- products.page.spec
```

## known_limitation

- Рамка через два `<tr>` (не один wrapper div) — норма для table; не рефакторить на card-layout.
- Другие страницы с `expandedRow` получат тот же chrome (желательно).

## Финализация

checklist `docs/agent-checklists/TZ-UX-319.md` → READY FOR REVIEW → archive после Cursor PASS.
Deploy НЕ.
