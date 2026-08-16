# COUPLING-MAP — общие поля между экранами

> Для **агентов и PO**. Не UI для сотрудников.
> `DOMAIN-MAP` = домен → модуль → страница. Эта карта = **одно поле → все экраны и смысл значения**.
> Правило: код + эта строка = один TZ. Спорят doc и код → чинить карту в той же TZ.
> Лимит: ≤160 строк.

## 0. Зачем

Страницы уже описаны (`docs/pages/*.page.md`). Дыра не в «нет страницы», а в том, что
агент меняет статус на одном экране и не смотрит, как тот же `Order.status` фильтрует соседний.

Доказанный кейс 2026-08-16: Комбайн → колонка «Черновики» (`draft`), цех «Все активные»
раньше показывал заказ, потому что ACTIVE включал `draft`. Сейчас код = канон §2
(TZ-PRODUCTION-337: ACTIVE = confirmed / in_production / ready).

## 1. Как агенту пользоваться (30 сек)

1. TZ трогает статус / фильтр «активные» / канбан / freeze / FK — `Ctrl+F` поле здесь.
2. Пройди **все** экраны в строке, не только свой.
3. Integrity slot: «Coupling map» не N/A, если общее поле менялось.
4. Новое общее поле → строка в §3 или §4 в **той же** TZ.

## 2. Order.status (канон смысла)

Одно поле, семь значений. **Не** путать с `OrderItem.status` и `items.readyForWork`.

Write: `PATCH /api/orders/:id {status}` только `draft|confirmed|in_production|ready`.
Отгрузка = `POST /orders/:id/ship`. Отмена = `POST /orders/:id/cancel`.

| Значение | RU | Комбайн `/design/combine` | Цех `/production` «Все активные» | `/orders` | Форма |
|----------|----|----------------------|-----------------------------------|-----------|-------|
| `draft` | Черновик | колонка Черновики | **нет** — не работа цеха | виден | состав можно |
| `confirmed` | Подтверждён | колонка Подтверждены | да (план) | виден | состав можно |
| `in_production` | В производстве | колонка В производстве | да | виден | состав freeze; план ок |
| `ready` | Готов | колонка Готовы | да | виден | состав freeze; план ок |
| `shipped` | Отгружен | колонка Отгружены (**не PATCH**) | нет* | виден | hard freeze |
| `delivered` | Доставлен | та же колонка (показ) | нет* | виден | hard freeze |
| `cancelled` | Отменён | колонки нет | нет* | виден | hard freeze |

\* Выбранный / `?orderId=` заказ остаётся в rail даже вне «активных» (`filterOrdersForRail`).

**Код = канон (TZ-PRODUCTION-337):** `frontend/src/app/pages/production/gantt-bar.model.ts`
`ACTIVE_COMMERCIAL_ORDER_STATUSES` = `confirmed` / `in_production` / `ready` (без `draft`).

Лейбл «В работе» на Комбайне — это **`OrderItem.status=in_production`**, не статус заказа.

## 3. Другие горячие поля

| Поле | Пишут | Читают / фильтруют | Ловушка |
|------|-------|-------------------|--------|
| `OrderItem.status` | Комбайн, `PATCH .../items/:i/status` | карточка Комбайна «X из Y» | `pending→in_production→ready→shipped`. **Не** `readyForWork`. |
| `items.readyForWork` | карточка `/orders/:id` | список `/orders` «X из Y», hub expand | гейт «можно начинать». **Не** item.status. |
| `Reservation.orderId` | `order.service` reserve | `GET /reservations?orderId=` | **строка = `Order.number`**, не ObjectId. |
| `SupplyTask.orderId` | снабжение | `/supply?orderId=`, hub | ObjectId заказа. |
| `Quotation.status` | КП | `/proposals*` | своя шкала. **Не** `Order.status`. |
| `Order.quotationId` / stub | convert, `POST .../stub-proposal` | карточка заказа | stub: `isStub` + `sourceOrderId`. |
| composition / BOM | каталог | дерево заказа, Гант модули | live каталог; не прайс КП. |
| остаток qty | movements | склад | SoT = `StorageItem`. **Не** `Material.stockQty`. |

## 4. Экран → поля (индекс)

| Экран | Route | Общие поля |
|-------|-------|------------|
| Комбайн | `/design/combine` (канбан; `/dashboard` — «Обзор» stats, NAV-303) | `Order.status`, `OrderItem.status` |
| Заказы | `/orders`, `/orders/:id` | `Order.status`, `readyForWork`, supply, reservations |
| Цех | `/production` | `Order.status` (фильтр), `plannedDate`, estimate |
| Снабжение | `/supply` | `SupplyTask.orderId` |
| КП | `/proposals*` | `Quotation.status`; convert → Order |
| Склад | `/storage-items` | `Reservation.orderId` = number |

## 5. Когда добавлять строку

Триггер: новый фильтр «активные», колонка канбана, freeze, FK, «X из Y», новый экран того же поля.
Не сюда: CSS, chrome-rail, пагинация без смены смысла поля.

Связанные: [`DOMAIN-MAP.md`](./DOMAIN-MAP.md) · [`DOCS-INTEGRITY.md`](./DOCS-INTEGRITY.md) · page.md секция Couplings.
