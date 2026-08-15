# TZ-ORDERS-HUB-303: Снабжение + production?orderId= + документы

РОЛЬ АГЕНТА: Frontend UI Engineer

ЗАВИСИМОСТИ: TZ-ORDERS-HUB-302 DONE (expand shell на /orders)

LAYER: 3

PAGES: /orders ; /supply ; /production ; /doc-constructor/templates
PAGE_DOCS: orders.page.md ; supply.page.md ; production-cockpit.page.md

CONFLICT KEYS: frontend/src/app/pages/orders/orders.page.ts ; frontend/src/app/pages/orders/orders.page.spec.ts ; frontend/src/app/pages/supply/supply.page.ts ; frontend/src/app/pages/supply/supply.page.spec.ts ; frontend/src/app/pages/production/production-cockpit.page.ts ; frontend/src/app/pages/production/production-cockpit.context.ts ; frontend/src/app/pages/production/production-cockpit.page.spec.ts ; docs/pages/orders.page.md ; docs/pages/supply.page.md ; docs/pages/production-cockpit.page.md ; docs/pages/PAGE-TZ-INDEX.md ; docs/agent-checklists/TZ-ORDERS-HUB-303.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Проверено: HUB-301 contract; `PiSupplyTaskService` / `GET /api/supply-tasks?orderId=`;
`supply.page.ts` — status filter есть, **query `orderId` не читается**;
`ProductionCockpitContext.selectedOrderId` — только UI rail; **нет ActivatedRoute orderId**;
документы заказа → `/doc-constructor/templates?source=order&sourceId=`.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

### ШАГ 1. Блок «Снабжение» в expand (lazy, 1 read)

При expand: `GET /api/supply-tasks?orderId=<Order._id>` (через существующий service).

UI: счётчики `draft` / `confirmed` / `ordered` / `received` (+ total).  
Empty: «Нет задач снабжения». Error: inline в блоке.  
Link: `/supply?orderId=<Order._id>`.

Cache/stale: игнорировать ответ если `expandedId` уже другой.

### ШАГ 2. Supply page: filter by query

В `supply.page.ts`:

1. Читать `ActivatedRoute` `queryParamMap.orderId`.
2. При наличии — фильтровать через API `?orderId=` (service уже умеет) или client filter.
3. Chip/hint «Фильтр: заказ …» + сброс.
4. Spec: `?orderId=` → только задачи этого заказа.

### ШАГ 3. `/production?orderId=` route contract

| Вход | Поведение |
|------|-----------|
| `?orderId=<id>` | После загрузки orders → `ctx.selectOrder(id)` |
| unknown/deleted | Не крашить; fallback без выбора; optional RU hint |
| без param | как сейчас |
| ручной select в rail | URL не обязан обновлять |

### ШАГ 4. Блоки «Производство» + «Документы» (0 HTTP)

- Производство: «Оценка в цехе» + `/production?orderId=<id>`.
- Документы: `/doc-constructor/templates?source=order&sourceId=<id>`.

### ШАГ 5. Budget

≤4 HTTP / expand. Supply = 1; не плодить GETs.

Gates:

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest --config jest.config.js --runInBand --testPathPattern='orders.page|supply.page|production-cockpit'
```

Создать focused specs если нет.

НЕ ИЗМЕНЯТЬ: BE; ActualCost; shipping; reservations (304); write в expand.

═══════════════════════════════════════════════════════════════
ФИНАЛИЗАЦИЯ
═══════════════════════════════════════════════════════════════

CLAIM → archive `TZ-ORDERS-HUB-303.done.md` + Executor report (auto).
