# TZ-CATALOG-373: Материалы — grid + filters-rail как у Продукции

РОЛЬ АГЕНТА: Frontend UI Engineer

ЗАВИСИМОСТИ: Нет (можно параллельно с TZ-CATALOG-372; эталон = products)

LAYER: 3

PAGES: /materials
PAGE_DOCS: materials.page.md

CONFLICT KEYS: frontend/src/app/pages/materials/materials.page.ts ; frontend/src/app/pages/materials/materials.page.spec.ts ; frontend/src/app/pages/materials/materials.page-316.spec.ts ; docs/pages/materials.page.md ; docs/pages/PAGE-TZ-INDEX.md ; docs/agent-checklists/TZ-CATALOG-373.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Проверено: `materials.page.ts` (фото, kind filter, reload, server page — **без** grid/rail);
`products.page.ts` (полный chrome витрины); `docs/audits/2026-08-15-catalog-list-vitrine-parity.md`.

1. Материалы уже ближе к эталону, чем модули: есть photo cell, name link, `?materialKind=`, Обновить.
2. Нет: view toggle list↔grid, `PiShowcaseCard` сетка, filters-rail overlay, persistence view mode.
3. Колонки таблицы **не** ужимать «как products» в этом TZ — только chrome + grid. Упрощение колонок = successor если PO попросит.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

### ШАГ 1. Toolbar: view toggle

1. После «Обновить» добавить group list/grid (lucide List / LayoutGrid), `data-test` как у products.
2. `viewMode` signal + `pi-materials-view-mode` localStorage (try/catch).
3. Сохранить существующий kind-filter select в tools (не удалять ради rail).

### ШАГ 2. Filters rail

1. Обернуть таблицу/grid в layout `products-layout` паттерна: aside rail + content.
2. Панель: Тип (`materialKind`, тот же signal что toolbar) · Сортировка (если page уже умеет local/server sort — подключить; иначе name↑↓ client на текущей page slice **запрещён** ломать server sort — только ключи, которые реально уходят в API / уже есть).
3. Если server list сейчас **без** sortBy — rail sort = known_limitation: только «Тип» + «Сбросить», **не** фейковый client-sort page slice. Честно проверить `MaterialsService.list` / params в коде перед wiring.
4. Канон оверлея z-index/backdrop — 1:1 products.

### ШАГ 3. Grid-витрина

1. `viewMode === 'grid'`: сетка + `app-pi-showcase-card size="md"`:
   - media из уже существующего `mainPhotoUrl`;
   - title = name; eyebrow = kind label / article;
   - description = dims summary или supplier;
   - `sc-actions-md`: `formatPrice(pricePerUnit)` + unit.
2. `data-test="materials-grid"`, `showcase-cell-{{id}}`, pager при `total > pageSize` через существующие page signals.
3. List mode: текущий `pi-table` без регресса kind filter / photo / stock link.

### ШАГ 4. Тесты + docs

1. Specs: toggle grid; rail open/close/backdrop; kind filter всё ещё рефирит `?materialKind=` (не сломать TZ-CATALOG-316 suite).
2. `materials.page.md` + `PAGE-TZ-INDEX.md`.
3. Checklist + Executor report (auto).

═══════════════════════════════════════════════════════════════
ФАЙЛЫ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:

- `frontend/src/app/pages/materials/materials.page.ts`
- `frontend/src/app/pages/materials/materials.page.spec.ts` (+ при необходимости точечно 316-suite)
- `docs/pages/materials.page.md`
- `docs/pages/PAGE-TZ-INDEX.md`
- `docs/agent-checklists/TZ-CATALOG-373.md`

НЕ ИЗМЕНЯТЬ:

- `modules.page.ts` (это 372)
- `products.page.ts` (эталон read-only)
- Backend materials API (кроме чтения уже существующих query)
- material-detail / form dialog
- Deploy

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. `/materials` имеет list↔grid + filters-rail с каноном оверлея products.
2. Grid карточки кликабельны на `/materials/:id`; фото/цена/ед. читаемы.
3. Kind filter в toolbar **и** rail пишут в один signal → `?materialKind=` (316 не регрессирует).
4. `pi-materials-view-mode` переживает F5.
5. Gates:
   ```text
   cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
   cd frontend && pnpm exec jest --config jest.config.js --runInBand --testPathPattern=materials.page
   ```
6. Archive после Executor report (auto) + PASS.

known_limitation:

- Сужение колонок таблицы «как у products» — не этот TZ.
- Shared filters-rail component — не обязателен.

═══════════════════════════════════════════════════════════════
ФИНАЛИЗАЦИЯ
═══════════════════════════════════════════════════════════════

Root GEMINI.md. CLAIM до кода. Параллель с 372 OK (разные CONFLICT KEYS).
