# Страница: Заказы (OrdersPage) + карточка заказа

**Краткое описание:** Реестр заказов покупателей с клиентской пагинацией, поиском, сортировкой по lifecycle статуса. Карточка заказа показывает live BOM через тот же `app-composition-tree` (без прайса КП). Create/edit требуют заказчика + объект (`siteId`); линии могут иметь ответственного и дату отгрузки.

## Routes

```
/orders       — «KPPDF — Заказы» (список)
/orders/:id   — «KPPDF — Заказ» (карточка + состав) · TZ-ORDERS-302/303
```

## Query params

- `q` — deep-link поиска по номеру заказа (используется из production cockpit).

## Order lifecycle hub expand (HUB-302 + HUB-303)

Read-only expand на списке `/orders`:

| Блок | HTTP | Содержание |
|------|------|------------|
| Сделка | 0 | заказчик · объект · КП · договор; ссылки `/proposals`, `/contracts` |
| Состав | 0 | линии; ссылка `/orders/:id` |
| **Снабжение (HUB-303)** | 1 | lazy `GET /api/supply-tasks?orderId=<Order._id>` → счётчики draft/confirmed/ordered/received + total; empty «Нет задач снабжения»; error inline; link `/supply?orderId=` |
| **Производство (HUB-303)** | 0 | «Оценка в цехе» + `/production?orderId=` |
| **Документы (HUB-303)** | 0 | `/doc-constructor/templates?source=order&sourceId=` |

- Stale: ответ supply игнорируется если `expandedId` уже другой.
- Write из expand запрещён. Budget ≤4 HTTP (supply = 1 в этой волне).
- HUB-304: Готовность / Склад / Отгрузка.

## Workspace chrome

`PiGroupWorkspaceComponent` показывает общий тёмный TOC **КП | Договоры | Заказы** с активным **Заказы**. Жёлтый ряд пуст: заказы не рекламируют CTA создания КП.


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
| POST | `/api/orders/:id/stub-proposal` | Черновик КП для прямого заказа; идемпотентно (TZ-ORDERS-306) |
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
| `OrdersService` | `list()`, `findById(id)`, `create(payload)`, `update(id, payload)`, `setLineReady(...)`, `createStubProposal(id)`, `remove(id)` |
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

## КП-заглушка для прямого заказа (TZ-ORDERS-306)

Прямой заказ создаётся без КП, поэтому у него нет `quotationId` — и всё, что просит ссылку
на КП, для такого заказа недостижимо. На карточке заказа появился факт **«КП»**:

- нет КП → «Нет — прямой заказ» + действие **«Создать черновик КП»**;
- есть КП → «№QTN-…» (+ «черновик-заглушка», если `isStub`) и ссылка на КП, без кнопки.

`POST /orders/:id/stub-proposal`:

- **идемпотентен** — если КП уже есть (настоящее или заглушка), возвращает его с
  `created: false` и ничего не создаёт; два клика ≠ два КП;
- статус КП = `draft`, `isStub: true`, `sourceOrderId` = заказ; статус `converted` не
  используется, потому что конвертации не было и цены никто не считал;
- связь двусторонняя: `Order.quotationId` ↔ `Quotation.sourceOrderId`;
- организация («кто выставляет») берётся из JWT → `isOurCompany` → единственная организация
  (та же логика, что `GET /organizations/current`, TZ-PARTY-301); если не настроено — 404 с
  просьбой отметить «нашу фирму», а не молчаливый выбор случайной;
- отказ с понятным текстом: заказ отменён или в заказе нет позиций (пустое КП бесполезно).

## Форма заказа (TZ-ORDERS-303)

- Обязательны: **Заказчик** (`counterpartyId`) + **Объект** (`siteId`; sites грузятся при смене заказчика).
- **Быстрый заказчик:** имя + телефон + адрес → `POST /counterparties/quick` → подставить `counterpartyId`+`siteId`.
- На линии: опционально **Ответственный** (`ownerUserId`) и **Отгрузка** (`plannedShipDate`).
- `unitPrice` пока остаётся в форме (не strip в этом TZ).

## Computed chain (список)

```
listRes → data → filteredRows → sortedRows → paginatedRows
```

## Column definitions

**Текущий UI (до HUB-302):**  
`number` → `date` → `counterpartyId` → `status` → `priority` → `items` → `total`

**Целевой контракт TZ-ORDERS-HUB-301+ (реализует HUB-302):**  
`Номер · Дата · Заказчик · Объект · Статус · Приоритет · Позиций · КП · Готовность`  
- колонка **Сумма (`total`) удаляется** (заказ цеха ≠ прайс КП);  
- **Готовность** = `X из Y` по `items[].readyForWork` only;  
- дата отгрузки — не колонка списка.

## Order lifecycle hub (TZ-ORDERS-HUB-301+)

Канон: [`docs/audits/2026-08-15-order-lifecycle-hub.md`](../audits/2026-08-15-order-lifecycle-hub.md).

- Expand на списке (паттерн products / UX-319): read-only блоки Сделка · Состав (линии) · Готовность · Снабжение · Производство · Склад · Отгрузка (stub) · Документы.
- Data **Variant A**: lazy; ≤4 HTTP reads; склад = `GET /api/reservations?orderId=<Order.number>`; снабжение = `GET /api/supply-tasks?orderId=<Order._id>`.
- Документы: `/doc-constructor/templates?source=order&sourceId=` (не builder без id).
- Производство (HUB-303): `/production?orderId=<id>` — route contract в TZ-301.
- КП-ссылки: только `/proposals` (не `/commercial/proposals`).
- Write в панели запрещён.

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-104.3 | Миграция на pi-table (batch-1) |
| TZ-104.4.2 | Typed TemplateRef + lockstep sort signals |
| TZ-ORDERS-301 | Strip commerce → order lines |
| TZ-ORDERS-302 | Detail + live composition-tree |
| TZ-ORDERS-303 | siteId + quick-create + line owner/shipDate |
| TZ-ORDERS-306 | КП-заглушка из прямого заказа (`POST /orders/:id/stub-proposal`) |
| **TZ-ORDERS-HUB-301** | Контракт хаба (колонки/expand/sources) — READY |
| **TZ-ORDERS-HUB-302** | Колонки + read-only expand «Сделка/Состав» — DONE |
| **TZ-ORDERS-HUB-303** | Expand Снабжение/Производство/Документы + `/supply?orderId=` + `/production?orderId=` — DONE |
| **TZ-ORDERS-HUB-304** | Готовность + Склад + shipping stub — next |

## Особенности

- **Client-side pagination** — backend возвращает flat array
- **Status lifecycle:** draft→confirmed→in_production→ready→shipped→delivered→cancelled
- **Document action (факт кода):** → `/doc-constructor/templates?source=order&sourceId=:id` (page.md ранее ошибочно указывал builder без id)
- **known_limitation (302):** правка каталога после заказа меняет то, что видит цех на detail — осознанно (D1); заморозка BOM = later SPEC

---

_Обновлено: 2026-08-15 (TZ-ORDERS-HUB-302)._
