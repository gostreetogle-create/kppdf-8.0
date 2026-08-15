# TZ-ORDERS-HUB-302: Orders list expand + колонки + Сделка/Состав

РОЛЬ АГЕНТА: Frontend UI Engineer

ЗАВИСИМОСТИ: TZ-ORDERS-HUB-301 (контракт READY)

LAYER: 3

PAGES: /orders ; /orders/:id ; /proposals
PAGE_DOCS: orders.page.md

CONFLICT KEYS: frontend/src/app/pages/orders/orders.page.ts ; frontend/src/app/pages/orders/orders.page.spec.ts ; frontend/src/app/pages/orders/order-detail.page.ts ; docs/pages/orders.page.md ; docs/pages/PAGE-TZ-INDEX.md ; docs/agent-checklists/TZ-ORDERS-HUB-302.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Проверено: `tasks/TZ-ORDERS-HUB-301-order-hub-contract.md`;
`docs/audits/2026-08-15-order-lifecycle-hub.md`;
`frontend/src/app/pages/orders/orders.page.ts` (cols incl. total; нет expand);
`products.page.ts` (эталон expandedRow / expandedId / UX-319);
`order-detail.page.ts` — bug `[routerLink]="['/commercial/proposals']"`.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

### ШАГ 1. Колонки списка

Заменить на: **Номер · Дата · Заказчик · Объект · Статус · Приоритет · Позиций · КП · Готовность**.

- Удалить `total` / «Сумма» из `cols`, sort keys, formatPrice usage в списке.
- Объект: имя из populate `siteId` (string | `{_id,name}`).
- КП: label из `quotationId` populate / «Прямой» / «Заглушка» / «—».
- Готовность: `X из Y` = count(`items.readyForWork===true`) / `items.length`; Y=0 → «—».
- Номер: `routerLink` `/orders/:id` + `stopPropagation`.

### ШАГ 2. Expand chrome (паттерн products)

1. `expandedId` signal; `(rowClick)` toggle; `[expandedRow]` / `[expandedRowWhen]` / `[expandedRowLabel]`.
2. Visual: gold-soft tray + left gold border; UX-319 `pi-table-row--open` / sibling dim (kit уже есть).
3. Single expand; page/search/sort → `expandedId=null`.
4. Enter/Space; `aria-expanded`; region «Сводка заказа: {number}».
5. Mobile hint horizontal scroll (как products).
6. Row-actions / links: `stopPropagation` — не toggle.

### ШАГ 3. Блоки в панели (read-only, 0 HTTP)

**Сделка:** заказчик, объект, КП (link `/proposals` или `/proposals/:id` если есть id), договор если есть.  
**Состав:** список линий (имя изделия/qty) + link «Открыть заказ» → `/orders/:id`. **Не** composition-tree.

Запрещено: PATCH/POST/readyForWork/supply/reserve/delete из панели.

### ШАГ 4. Fix КП routes

Все ссылки на КП в orders list panel + **order-detail** → `/proposals` (не `/commercial/proposals`).

### ШАГ 5. Specs + docs

- `orders.page.spec.ts`: columns without total; X/Y; expand/collapse; link no-toggle; keyboard; Сделка/Состав visible; no write calls from expand.
- Update `orders.page.md` + PAGE-TZ-INDEX (302 DONE/READY).
- Checklist + Quality score ≥97.

Gates:

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest --config jest.config.js --runInBand --testPathPattern=orders.page
```

НЕ ИЗМЕНЯТЬ: supply/production/shipping pages; BE; ActualCost; HUB-303/304 scope (блоки снабжение/склад/отгрузка можно заглушить пустым слотом или не рендерить до 303/304).

known_limitation: блоки 303/304 — следующие TZ.

═══════════════════════════════════════════════════════════════
ФИНАЛИЗАЦИЯ
═══════════════════════════════════════════════════════════════

CLAIM → code → gates → READY FOR REVIEW → Cursor PASS → archive `tasks/_archive/2026-08/TZ-ORDERS-HUB-302.done.md` + Executor report (auto) full SHA.
