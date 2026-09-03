# Страница: Заказы (OrdersPage) + карточка заказа

**Краткое описание:** Реестр заказов покупателей с клиентской пагинацией, поиском, сортировкой по lifecycle статуса. Карточка заказа показывает live BOM через тот же `app-composition-tree` (без прайса КП). Create/edit требуют заказчика + объект (`siteId`); линии могут иметь ответственного и дату отгрузки.

## Routes

```
/orders       — «KPPDF — Заказы» (список)
/orders/:id   — «KPPDF — Заказ» (карточка + состав) · TZ-ORDERS-302/303
```

## Query params

- `q` — deep-link поиска по номеру заказа (используется из production cockpit).

## Order lifecycle hub expand (HUB-302 + HUB-303 + HUB-304)

Read-only expand на списке `/orders`:

| Блок                       | HTTP | Содержание                                                                                                                                                               |
| -------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Состав заказа**          | 1/line | группа «Заказ»; accordion **свёрнут по умолчанию** (UX-445I); **`app-composition-tree`** forest (`GET /products/:id/tree`) — корни тоже свёрнуты до клика; карандаш → каталог; link «Открыть карточку заказа» → `/orders/:id`; без дубля заказчик/КП/объект |
| **Снабжение (HUB-303)**    | 1    | lazy `GET /api/supply-tasks?orderId=<Order._id>` → счётчики draft/confirmed/ordered/received + total; empty «Нет задач снабжения»; error inline; link `/supply?orderId=` |
| **Производство (HUB-303)** | 0    | «Оценка в цехе» + `/production?orderId=` (hub). **DESK-416:** tray `mode="desk"` → `from=desk` («На стол»); hub без `from`. `data-test="order-production-link"` не менять.                                                                                                                                 |
| **Документы (HUB-303)**    | 0    | `/doc-constructor/templates?source=order&sourceId=`                                                                                                                      |
| **Готовность (HUB-304)**   | 0    | `X из Y` + линии ready/не ready; link «Открыть заказ» → `/orders/:id`; **нет** toggle ready в панели. Формула списка = `count(items.readyForWork===true)` — **не** `OrderItem.status` (тот считает «X из Y» на Комбайне `/design/combine`, TZ-SWEEP-401). Поля не сливать. |
| **Склад (HUB-304)**        | 1    | lazy `GET /api/reservations?orderId=<Order.number>` (**номер**, не `_id`, не `reservationIds[]`) → active/total; empty «Нет броней»; error inline; link `/storage-items` |
| **Отгрузка (HUB-304)**     | 0    | stub copy + link `/shipping`; **не** `GET /shipments`                                                                                                                    |

- Stale: ответы supply/reservations игнорируются если `expandedId` уже другой.
- Write **заказа** из expand запрещён (линии/ready/заказчик). Карандаш состава пишет в **каталог** (live BOM), не в snapshot `Order.items`.
- Budget: supply=1 + reservations=1 + composition tree per line when accordion open.
- Service: `ReservationsService` (`pi-reservations.service.ts`) — read-only `list(orderNumber?)`.

## Couplings

Канон: [`docs/COUPLING-MAP.md`](../COUPLING-MAP.md).

| Поле | Этот экран | Другие экраны | Смысл |
|------|------------|---------------|-------|
| `Order.status` | список / форма freeze | Комбайн колонки; цех «Все активные» | `draft` ≠ работа цеха. Цех active = confirmed/in_production/ready (TZ-PRODUCTION-337). |
| `Order.isPaid` / `Order.paidAt` | список / карточка заказа | менеджерская отметка оплаты | Факт оплаты хранится на Заказе, КП не требуется; `isPaid=false` очищает `paidAt`; отметка оплаты не меняет lifecycle status. |
| `items.readyForWork` | список «X из Y», hub Готовность | не Комбайн | **Не** `OrderItem.status`. |

### Визуальная иерархия expand

Панель раскрытия разделена на четыре смысловые группы, чтобы не смешивать разные контуры жизненного цикла:

1. **Заказ** — компактный раскрывающийся «Состав заказа».
2. **Исполнение** — «Снабжение», «Производство» и «Готовность».
3. **Логистика** — «Склад» и «Отгрузка».
4. **Документы** — шаблоны и печатные материалы.

Группы отделены тонкой нейтральной линией, компактным заголовком и очень светлым бумажным фоном поверх мягкой жёлтой подложки панели. Внутри используется единая вертикальная ритмика: заголовок, данные, затем действие; ячейки выровнены по верхнему краю. Внутри группы сохраняются существующие read-only блоки и deep-links; декоративные разделители не являются интерактивными и не меняют write-path.

**PO visual lock (2026-08-15):** этот внешний вид принят как базовый. Последующие TZ не должны возвращать плоскую насыщенно-жёлтую сетку, усиливать рамки или менять группировку без отдельного визуального PASS.

## Workspace chrome

`PiGroupWorkspaceComponent` показывает общий тёмный TOC **КП | Договоры | Заказы** с активным **Заказы**. Жёлтый ряд пуст: заказы не рекламируют CTA создания КП.

## API endpoints

| Метод      | Endpoint                           | Назначение                                                   |
| ---------- | ---------------------------------- | ------------------------------------------------------------ |
| GET        | `/api/orders`                      | Список (flat array)                                          |
| GET        | `/api/orders/:id`                  | Карточка (populate counterparty/site/items.ownerUserId)      |
| POST/PATCH | `/api/orders`                      | Create/update — `counterpartyId` + `siteId` обязательны; payment `isPaid`/`paidAt` живёт на Order |
| GET        | `/api/sites?counterpartyId=`       | Объекты заказчика                                            |
| POST       | `/api/sites/ensure-default`        | Если объектов нет — «Объект по умолчанию» (как convert)      |
| POST       | `/api/counterparties/quick`        | Quick-create: name+phone+address → counterparty+site         |
| GET        | `/api/users?limit=100`             | Список пользователей для «Ответственный» на линии            |
| GET        | `/api/products/:id/tree?maxDepth=` | Live BOM линии (каталог)                                     |
| POST       | `/api/orders/:id/stub-proposal`    | Черновик КП для прямого заказа; идемпотентно (TZ-ORDERS-306) |
| DELETE     | `/api/orders/:id`                  | Soft delete — заказ исчезает из списка (`deletedAt` + `isActive: false`) |

Ответ GET list: `Order[]` (flat array, НЕ пагинированный envelope)

## Dialogs

| Компонент                  | Режим          | Данные                                                                                  |
| -------------------------- | -------------- | --------------------------------------------------------------------------------------- |
| `OrderFormDialogComponent` | create / edit  | `null` / `Order` — Заказчик, Объект, Быстрый заказчик, позиции с Ответственный/Отгрузка |
| `AlertDialogComponent`     | confirm delete | `{ title, description, confirmLabel, variant }`                                         |

## Services

| Сервис                  | Методы                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `OrdersService`         | `list()`, `findById(id)`, `create(payload)`, `update(id, payload)`, `setLineReady(...)`, `createStubProposal(id)`, `remove(id)` |
| `CounterpartyService`   | `list(params)`, `quickCreateParty({name, phone?, address})`                                                                     |
| `SiteService`           | `listByCounterparty(id)`, `ensureDefaultForCounterparty(id)`, CRUD                            |
| `ProductModulesService` | `getProductTree(id, maxDepth)` — live children на карточке                                                                      |

## State (signals) — список

| Сигнал       | Тип                                                 | Назначение                                |
| ------------ | --------------------------------------------------- | ----------------------------------------- |
| `pageSig`    | `Signal<number>`                                    | Текущая страница (1-indexed, client-side) |
| `sortKeySig` | `Signal<'number'\|'date'\|'total'\|'status'\|null>` | Ключ сортировки                           |
| `sortDirSig` | `Signal<'asc'\|'desc'>`                             | Направление сортировки                    |
| `search`     | `SearchState`                                       | Debounced поиск (300ms)                   |
| `listRes`    | `HttpResource<Order[]>`                             | GET /api/orders                           |

## Карточка `/orders/:id` (TZ-ORDERS-302 + 303 + 337)

- Chrome: «Заказ №…» (`PiPageChrome` + H1). FactStack title **«Заказ»** (не «Паспорт заказа»).
- Lifecycle под заголовком: `app-pi-status-banner` — warning для черновика, destructive для отменённого, info для подтверждённого/производства/готовности; для отгруженного и доставленного заказов полоса скрыта.
- StatusBanner — постоянный акцент страницы (`role="status"`), не замена ErrorBanner для ошибок загрузки и не Toast для краткой обратной связи.
- Meta под заголовком: **Заказчик** (name) + **Объект** (site name/address), если populate есть.
- Блок «Позиции»: простые строки — имя изделия · Ответственный · Отгрузка (без цен).
- Корни дерева = линии заказа (`productId`, qty, snapshot name); expand = live composition каталога.
- Карандаш на каждой строке → Product/Module/Material Form dialog (как BOM om-edit). Клик по строке — только select/expand (TZ-QA-445F); редактирование **только** через карандаш.
- Hint под «Состав»: «Кликни строку — выбрать и раскрыть · карандаш — изменить в каталоге».
- Empty: «В заказе нет изделий»; 404 каталога — warn на узле, без падения.
- **Не** показывать unitPrice / прайс КП в дереве (rails D4).
- Компонент: `order-detail.page.ts` + reuse `app-composition-tree` (не форк). Helper: `order-composition-forest.ts`.

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

## Форма заказа (TZ-ORDERS-303 + TZ-ORDERS-336)

- Обязательны: **Заказчик** (`counterpartyId`) + **Объект** (`siteId`; sites грузятся при смене заказчика).
- Если у заказчика нет объектов — `POST /api/sites/ensure-default` создаёт «Объект по умолчанию» и подставляет `siteId` (тот же helper, что КП→заказ).
- **Быстрый заказчик:** имя + телефон + адрес → `POST /counterparties/quick` → подставить `counterpartyId`+`siteId`.
- На линии: изделие (`productId` обязателен; picker пишет id, не только имя); опционально **Ответственный** и **Отгрузка** (`plannedShipDate`, дефолт = дата заказа или сегодня).
- Шапка **Планируемая дата** — `type="date"` (не required).
- Freeze: `in_production`/`ready` — состав/заказчик/объект/статус read-only; Save шлёт только `plannedDate`+`priority`+`number`. `shipped`/`delivered`/`cancelled` — только просмотр.
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

- Expand на списке (паттерн products / UX-319): «Состав заказа» = тот же `app-composition-tree` (live `getProductTree`) · Готовность · Снабжение · Производство · Склад · Отгрузка (stub) · Документы. Коммерческие сведения уже видны в строке заказа и не дублируются отдельным блоком «Сделка».
- Data **Variant A**: lazy; ≤4 HTTP reads; склад = `GET /api/reservations?orderId=<Order.number>`; снабжение = `GET /api/supply-tasks?orderId=<Order._id>`.
- Документы: `/doc-constructor/templates?source=order&sourceId=` (не builder без id).
- Производство (HUB-303): `/production?orderId=<id>` — route contract в TZ-301.
- КП-ссылки: только `/proposals` (не `/commercial/proposals`).
- Write **полей заказа** в панели запрещён; правка состава = каталог (337).

## TZ reference

| TZ                    | Что сделано                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------- |
| TZ-104.3              | Миграция на pi-table (batch-1)                                                               |
| TZ-104.4.2            | Typed TemplateRef + lockstep sort signals                                                    |
| TZ-ORDERS-301         | Strip commerce → order lines                                                                 |
| TZ-ORDERS-302         | Detail + live composition-tree                                                               |
| TZ-ORDERS-303         | siteId + quick-create + line owner/shipDate                                                  |
| **TZ-ORDERS-336**     | productId на Save; ensure-default Site; freeze UX; date input + ship default                 |
| **TZ-ORDERS-337**     | Карандаш состава + list expand = composition-tree; «Паспорт»→«Заказ»                         |
| TZ-ORDERS-306         | КП-заглушка из прямого заказа (`POST /orders/:id/stub-proposal`)                             |
| **TZ-ORDERS-HUB-301** | Контракт хаба (колонки/expand/sources) — READY                                               |
| **TZ-ORDERS-HUB-302** | Колонки + expand «Состав заказа» (accordion; без «Сделка») — DONE                            |
| **TZ-ORDERS-HUB-303** | Expand Снабжение/Производство/Документы + `/supply?orderId=` + `/production?orderId=` — DONE |
| **TZ-ORDERS-HUB-304** | Готовность + Склад + shipping stub — DONE                                                    |
| **TZ-DESK-428** | Shared tray: spacing `p-4`/`gap-5`/`pb-4` + disclosure chevron (rotate) / hover / бейдж «раскрыть-свернуть» — parity с `/desk` |
| **TZ-UX-444A** | Shared `PiStatusBanner` + lifecycle adoption на `/orders/:id`: draft/cancelled обязательны; shipped/delivered скрыты |

## Особенности

- **Client-side pagination** — backend возвращает flat array
- **Status lifecycle:** draft→confirmed→in_production→ready→shipped→delivered→cancelled
- **Document action (факт кода):** → `/doc-constructor/templates?source=order&sourceId=:id` (page.md ранее ошибочно указывал builder без id)
- **known_limitation (302):** правка каталога после заказа меняет то, что видит цех на detail — осознанно (D1); заморозка BOM = later SPEC

---

_Обновлено: 2026-08-26 (TZ-UX-444A)._
