# COUPLING-MAP — общие поля между экранами

> Для **агентов и PO**. Не UI для сотрудников.
> `DOMAIN-MAP` = домен → модуль → страница. Эта карта = **одно поле → все экраны и смысл значения**.
> Правило: код + эта строка = один TZ. Спорят doc и код → чинить карту в той же TZ.
> Лимит: ≤160 строк. Обновлено: TZ-SHIP-433 (undo отгрузки).

## 0. Зачем

Страницы уже описаны (`docs/pages/*.page.md`). Дыра не в «нет страницы», а в том, что
агент меняет статус на одном экране и не смотрит соседние читатели того же поля.

## 1. Как агенту пользоваться (30 сек)

1. TZ трогает статус / фильтр «активные» / канбан / freeze / FK — `Ctrl+F` поле здесь.
2. Пройди **все** экраны в строке, не только свой.
3. Integrity slot: «Coupling map» не N/A, если общее поле менялось.
4. Новое общее поле → строка в §3 или §4 в **той же** TZ.

## 2. Order.status (канон смысла)

Семь значений. **Не** путать с `OrderItem.status`, `boardLane`, `readyForWork`.

Write: `PATCH /api/orders/:id {status}` только `draft|confirmed|in_production|ready`.
Отгрузка = `POST /orders/:id/ship`. Отмена = `POST /orders/:id/cancel`.
**Комбайн (WAVE Combine):** `Order.status` на доске **не** колонка — это **rollup** из `OrderItem.boardLane` (сервер, TZ-COMBINE-403). `shipped` rollup **никогда** не пишет — только POST ship.

| Значение | RU | Как появляется (rollup / write) | Цех ACTIVE | `/orders` | Форма |
|----------|----|---------------------------------|------------|-----------|-------|
| `draft` | Черновик | все линии в `prep` | **нет** | виден | состав можно |
| `confirmed` | Подтверждён | первая линия ушла из `prep` (монотонно) | да | виден | состав можно |
| `in_production` | В производстве | есть линия в `shop` | да | виден | freeze состава |
| `ready` | Готов | все линии в `to_ship` | да | виден | freeze |
| `shipped` | Отгружен | **только** POST ship (все линии готовы) | нет* | виден | hard freeze |
| `delivered` | Доставлен | показ | нет* | виден | hard freeze |
| `cancelled` | Отменён | POST cancel | нет* | виден | hard freeze |

\* `?orderId=` rail exception — `filterOrdersForRail`.

**Undo (TZ-SHIP-433):** отмена отгрузки = `POST /shipments/:id/cancel-shipment` — только из `draft`/`scheduled` и без `dispatchedAt`. Если это единственная активная отгрузка и заказ был `shipped` → `order.status → ready`, линии `boardLane → to_ship` / `status → ready` (обратный ход §2b). После dispatch (stock movement `out`) — 400 RU, откат через склад/админа (phase 2).

**Цех ACTIVE (TZ-PRODUCTION-337):** `confirmed` / `in_production` / `ready` (без `draft`).

## 2b. OrderItem.boardLane (колонки Комбайна)

SoT колонки `/design/combine`. Create/delete досок **нет**.

| boardLane | Колонка RU | Helper (1 строка) | → `OrderItem.status` |
|-----------|------------|-------------------|----------------------|
| `prep` | Комплектация | Состав, модули, материалы — готовность к чертежу | `pending` |
| `design` | Проектирование | Чертежи, виды работ, сроки | `pending` |
| `shop` | В цехе | План на Ганте | `in_production` |
| `to_ship` | К отгрузке | Готово к документам | `ready` |
| `shipped` | Отгружены | Только через отгрузку заказа | `shipped` |

Write lane: `PATCH /orders/:id/lines/:lineId/lane` (TZ-COMBINE-403). **Не** писать `shipped` через PATCH.
Карточки = изделия (`lineId` + бейдж № заказа). Материалы — никогда не карточки.
Модули на доске — `Order.moduleLanes` (TZ-COMBINE-406): разреженные `[{ lineId, moduleId, lane }]`. Полоса линии = **min** по её moduleLanes (если есть записи), иначе `boardLane`; rollup `Order.status` считает по этой эффективной полосе. Write: `PATCH /orders/:id/lines/:lineId/modules/:moduleId/lane` (shipped через PATCH запрещён).
Отгрузка **целым** заказом: дроп в «Отгружены» только если все линии `to_ship` → POST ship.
Первый переход в `shop` → freeze состава заказа (модалка).
Вход линии/модуля в `shop` — только при workType + days (override заказа или каталог `WorkType.days`), иначе 400 RU (TZ-COMBINE-408).

## 3. Другие горячие поля

| Поле | Пишут | Читают | Ловушка |
|------|-------|--------|---------|
| `OrderItem.status` | дериват `boardLane` (403); legacy `PATCH .../items/:i/status` | «X из Y» | Не перегружать prep/design. Не `readyForWork`. |
| `OrderItem.lineId` | create/backfill (402) | lane API | Стабильный ключ; delete линии только в `prep` |
| `items.readyForWork` | `/orders/:id` | список «X из Y» hub | Не колонка Комбайна |
| `Order.isPaid` / `Order.paidAt` | `/orders`, `/orders/:id` | менеджерский payment toggle и список | Факт оплаты принадлежит заказу, `paidAt` — момент оплаты; КП не требуется; оплата не меняет `Order.status`; false очищает timestamp |
| `Reservation.orderId` | reserve | reservations | **строка = `Order.number`** |
| `SupplyTask.orderId` | снабжение | `/supply` | ObjectId |
| `Shipment.status` | `ship()` → `scheduled`; `dispatch()` → `in_transit`; `delivered`; **`cancelShipment()` → `cancelled`** (433) | `/shipping`, desk tray | Отмена только до dispatch; отменённые в tray не считаются активной отгрузкой |
| `DeskNote.anchorOrderId` | `/desk` блокнот (408) | `/desk` блокнот | ObjectId → Order; anchorLineId — строка (productId/lineId), anchorModuleId — ObjectId → ProductModule; hard delete |
| composition / BOM | каталог | Гант | live каталог |
| `DocumentTemplate.categoryId` | `/doc-constructor/templates` create + duplicate; `/doc-constructor/builder/:id` inspector | templates registry, setup dialog, builder inspector | Active assignable scope = system ∪ current organization from `list({ activeOnly: true })`; duplicate keeps source category; create and inspector may write the selected category id |
| `Contract.contractStatus` + attachment refs | Contract create/update; `PUT /contracts/:id/attachment`; `DELETE /contracts/:id/attachment` | `/contracts` legacy registry/API; future NX Contract UI | `none` = no file, `file_attached` = `Photo` id + `/uploads/contracts/...`, `generated` = future/file-optional. Never substitute lifecycle `Contract.status`; attachment state does not gate Order production. |
| остаток qty | movements | склад | SoT = `StorageItem` |

## 4. Экран → поля

| Экран | Route | Поля |
|-------|-------|------|
| Комбайн | `/design/combine` | `boardLane`, `lineId`, rollup `Order.status` |
| Стол менеджера | `/desk` | `Order.status` (CTA рейла **и** tray «Подтвердить»: только PATCH `draft→confirmed`); не `boardLane`; `DeskNote.anchorOrderId` (блокнот); DESK-430: «Отгружено» в tray — только POST `/orders/:id/ship` (whole-order, без `items`), метаданные из `Shipment` без обязательного `docs`; TZ-SHIP-433: «Отменить отгрузку» в tray — тот же `POST /shipments/:id/cancel-shipment`, остаёмся на `/desk` |
| Заказы | `/orders` | `Order.status`, `readyForWork` |
| Цех | `/production` | `Order.status` ACTIVE, estimate |
| Снабжение / КП / Склад | … | без изменений §3 |

## 5. Когда добавлять строку

Новый фильтр «активные», колонка канбана, freeze, FK, «X из Y».
Не сюда: CSS, chrome-rail, пагинация.

Связанные: [`DOMAIN-MAP.md`](./DOMAIN-MAP.md) · [`design-combine.page.md`](./pages/design-combine.page.md)
