# TZ-CATALOG-372: Модули — grid + filters-rail как у Продукции

РОЛЬ АГЕНТА: Frontend UI Engineer

ЗАВИСИМОСТИ: Нет (параллельно с TZ-CATALOG-373; эталон = products)

LAYER: 3

PAGES: /modules
PAGE_DOCS: modules.page.md

CONFLICT KEYS: frontend/src/app/pages/modules/modules.page.ts ; frontend/src/app/pages/modules/modules.page.spec.ts ; frontend/src/app/shared/services/pi-product-modules.service.ts ; docs/pages/modules.page.md ; docs/pages/PAGE-TZ-INDEX.md ; docs/agent-checklists/TZ-CATALOG-372.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Проверено: `modules.page.ts` (pi-table, client page/sort — **без** фото/grid/rail);
`products.page.ts` (полный chrome витрины); `docs/audits/2026-08-15-catalog-list-vitrine-parity.md`.

1. Модули ~25% паритета с products: нет фото, reload, view toggle, filters-rail, showcase grid.
2. `ProductModule` без `mainPhotoId`/`photoIds` в FE типе (schema mirror gap).
3. Server envelope `/modules` — successor; client-side pagination сохранить.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

### ШАГ 1. Toolbar + view mode

1. Select «Состав» (Все / С материалами / Пустые), client-side dual-read composition/materials.
2. Ghost «Обновить», toggle list/grid (`view-list-button` / `view-grid-button`), счётчик.
3. `pi-modules-view-mode` localStorage (try/catch, products pattern).

### ШАГ 2. List + filters rail

1. Колонка «Фото» первая (PhotosService lookup + empty-tile).
2. Имя-ссылка `/modules/:id` + kind-marker; row-click сохранён.
3. Filters rail overlay 1:1 products: Состав · Сортировка (name/article) · Сбросить · Закрыть.

### ШАГ 3. Grid vitrine

1. `app-pi-showcase-card size="md"`, grid 1/2/3, pager при `total > PAGE_SIZE`.
2. Hint «Себест. см. карточку» — без N× cost-preview.

### ШАГ 4. Типы + тесты + docs

1. `ProductModule`: optional `mainPhotoId` / `photoIds`.
2. Specs 17: toggle, rail, localStorage, composition filter, links.
3. `modules.page.md`, checklist, PAGE-TZ-INDEX DONE flip в closeout.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. `/modules` list↔grid + filters-rail + фото + имя-ссылка как products.
2. Grid → `/modules/:id`; view mode переживает F5.
3. Фильтр «Состав» client-side; empty state RU.
4. Gates: FE tsc + `jest --testPathPattern=modules.page` (17/17).
5. Archive после Cursor PASS + commit/push.

known_limitation: server envelope `/modules`; expandable состав — successor.
