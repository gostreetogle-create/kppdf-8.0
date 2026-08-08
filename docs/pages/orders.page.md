# Страница: Заказы (OrdersPage) + карточка заказа

**Краткое описание:** Реестр заказов покупателей с клиентской пагинацией, поиском, сортировкой по lifecycle статуса. Карточка заказа показывает live BOM через тот же `app-composition-tree` (без прайса КП).

## Routes

```
/orders       — «KPPDF — Заказы» (список)
/orders/:id   — «KPPDF — Заказ» (карточка + состав) · TZ-ORDERS-302
```

## Query params

Нет — всё состояние через сигналы.

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/orders` | Список (flat array) |
| GET | `/api/orders/:id` | Карточка заказа |
| GET | `/api/products/:id/tree?maxDepth=` | Live BOM линии (каталог) |
| DELETE | `/api/orders/:id` | Удаление (soft delete) |

Ответ GET list: `Order[]` (flat array, НЕ пагинированный envelope)

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `OrderFormDialogComponent` | create / edit | `null` / `Order` |
| `AlertDialogComponent` | confirm delete | `{ title, description, confirmLabel, variant }` |

## Services

| Сервис | Методы |
|--------|--------|
| `OrdersService` | `list()`, `findById(id)`, `create(payload)`, `update(id, payload)`, `remove(id)` |
| `CounterpartyService` | `list(params)` — для lookup контрагентов |
| `ProductModulesService` | `getProductTree(id, maxDepth)` — live children на карточке |

## State (signals) — список

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `pageSig` | `Signal<number>` | Текущая страница (1-indexed, client-side) |
| `sortKeySig` | `Signal<'number'\|'date'\|'total'\|'status'\|null>` | Ключ сортировки |
| `sortDirSig` | `Signal<'asc'\|'desc'>` | Направление сортировки |
| `search` | `SearchState` | Debounced поиск (300ms) |
| `listRes` | `HttpResource<Order[]>` | GET /api/orders |

## Карточка `/orders/:id` (TZ-ORDERS-302)

- Chrome: «Заказ №…» (`PiPageChrome` + H1).
- Корни дерева = линии заказа (`productId`, qty, snapshot name); expand = live composition каталога.
- Empty: «В заказе нет изделий»; 404 каталога — warn на узле, без падения.
- **Не** показывать unitPrice / прайс КП в дереве (rails D4).
- Компонент: `order-detail.page.ts` + reuse `app-composition-tree` (не форк).

## Computed chain (список)

```
listRes → data → filteredRows → sortedRows → paginatedRows
```

## Column definitions (7 колонок)

`number` (sticky, link → `/orders/:id`) → `date` → `counterpartyId` → `status` → `priority` → `items` → `total`

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-104.3 | Миграция на pi-table (batch-1) |
| TZ-104.4.2 | Typed TemplateRef + lockstep sort signals |
| TZ-ORDERS-301 | Strip commerce → order lines |
| TZ-ORDERS-302 | Detail + live composition-tree |

## Особенности

- **Client-side pagination** — backend возвращает flat array
- **Status lifecycle:** draft→confirmed→in_production→ready→shipped→delivered→cancelled
- **Document action:** `onCreateDocument()` → `/doc-constructor/builder?source=order&sourceId=:id`
- **known_limitation (302):** правка каталога после заказа меняет то, что видит цех на detail — осознанно (D1); заморозка BOM = later SPEC

---

_Обновлено: 2026-08-08 (TZ-ORDERS-302)._
