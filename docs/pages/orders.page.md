# Страница: Заказы (OrdersPage) + карточка заказа

**Краткое описание:** Реестр заказов покупателей с клиентской пагинацией, поиском, сортировкой по lifecycle статуса. Карточка заказа показывает live BOM через тот же `app-composition-tree` (без прайса КП). Create/edit требуют заказчика + объект (`siteId`); линии могут иметь ответственного и дату отгрузки.

## Routes

```
/orders       — «KPPDF — Заказы» (список)
/orders/:id   — «KPPDF — Заказ» (карточка + состав) · TZ-ORDERS-302/303
```

## Query params

Нет — всё состояние через сигналы.

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/orders` | Список (flat array) |
| GET | `/api/orders/:id` | Карточка (populate counterparty/site/items.ownerUserId) |
| POST/PATCH | `/api/orders` | Create/update — `counterpartyId` + `siteId` обязательны |
| GET | `/api/sites?counterpartyId=` | Объекты заказчика |
| POST | `/api/counterparties/quick` | Quick-create: name+phone+address → counterparty+site |
| GET | `/api/users?limit=100` | Список пользователей для «Ответственный» на линии |
| GET | `/api/products/:id/tree?maxDepth=` | Live BOM линии (каталог) |
| DELETE | `/api/orders/:id` | Удаление (soft delete) |

Ответ GET list: `Order[]` (flat array, НЕ пагинированный envelope)

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `OrderFormDialogComponent` | create / edit | `null` / `Order` — Заказчик, Объект, Быстрый заказчик, позиции с Ответственный/Отгрузка |
| `AlertDialogComponent` | confirm delete | `{ title, description, confirmLabel, variant }` |

## Services

| Сервис | Методы |
|--------|--------|
| `OrdersService` | `list()`, `findById(id)`, `create(payload)`, `update(id, payload)`, `remove(id)` |
| `CounterpartyService` | `list(params)`, `quickCreateParty({name, phone?, address})` |
| `SiteService` | `listByCounterparty(id)`, CRUD |
| `ProductModulesService` | `getProductTree(id, maxDepth)` — live children на карточке |

## State (signals) — список

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `pageSig` | `Signal<number>` | Текущая страница (1-indexed, client-side) |
| `sortKeySig` | `Signal<'number'\|'date'\|'total'\|'status'\|null>` | Ключ сортировки |
| `sortDirSig` | `Signal<'asc'\|'desc'>` | Направление сортировки |
| `search` | `SearchState` | Debounced поиск (300ms) |
| `listRes` | `HttpResource<Order[]>` | GET /api/orders |

## Карточка `/orders/:id` (TZ-ORDERS-302 + 303)

- Chrome: «Заказ №…» (`PiPageChrome` + H1).
- Meta под заголовком: **Заказчик** (name) + **Объект** (site name/address), если populate есть.
- Блок «Позиции»: простые строки — имя изделия · Ответственный · Отгрузка (без цен).
- Корни дерева = линии заказа (`productId`, qty, snapshot name); expand = live composition каталога.
- Empty: «В заказе нет изделий»; 404 каталога — warn на узле, без падения.
- **Не** показывать unitPrice / прайс КП в дереве (rails D4).
- Компонент: `order-detail.page.ts` + reuse `app-composition-tree` (не форк).

## Форма заказа (TZ-ORDERS-303)

- Обязательны: **Заказчик** (`counterpartyId`) + **Объект** (`siteId`; sites грузятся при смене заказчика).
- **Быстрый заказчик:** имя + телефон + адрес → `POST /counterparties/quick` → подставить `counterpartyId`+`siteId`.
- На линии: опционально **Ответственный** (`ownerUserId`) и **Отгрузка** (`plannedShipDate`).
- `unitPrice` пока остаётся в форме (не strip в этом TZ).

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
| TZ-ORDERS-303 | siteId + quick-create + line owner/shipDate |

## Особенности

- **Client-side pagination** — backend возвращает flat array
- **Status lifecycle:** draft→confirmed→in_production→ready→shipped→delivered→cancelled
- **Document action:** `onCreateDocument()` → `/doc-constructor/builder?source=order&sourceId=:id`
- **known_limitation (302):** правка каталога после заказа меняет то, что видит цех на detail — осознанно (D1); заморозка BOM = later SPEC

---

_Обновлено: 2026-08-08 (TZ-ORDERS-303)._
