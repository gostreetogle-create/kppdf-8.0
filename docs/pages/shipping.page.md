# Страница: Отгрузка (`ShippingPage`) — реестр

**Краткое описание:** живой реестр отгрузок (`Shipment`): таблица, фильтры по статусу и заказу,
создание отгрузки из заказа (whole/partial), отправка со склада (dispatch), документы
и **отмена ошибочной отгрузки** до dispatch.
**Статус: READY-продукт (TZ-SUPPLY-312, TZ-DESK-426, TZ-SHIP-433).**

## Route

```
/shipping — «KPPDF — Отгрузка»
```

Group Chip: `LOGISTICS_SECTION_CHIPS` (`PiGroupWorkspace`, activeId `shipping`).

## Данные и API

- `GET /shipments` (`orderId`, `status`, `date`) — реестр отгрузок.
- `POST /orders/:id/ship` — создание отгрузки из заказа (whole-order или partial по `items`),
  статус `scheduled`; whole-order переводит заказ в `shipped`.
- `POST /shipments/:id/dispatch` — списание со склада (stock movement `out`), статус `in_transit`,
  проставляет `dispatchedAt`.
- `PATCH /shipments/:id` — получатель/адрес/склад/водитель/примечание; статус по переходам
  (`scheduled→cancelled`, `in_transit→delivered`).
- `POST /shipments/:id/add-doc` — документ (ТТН/УПД/счёт/другое).
- **`POST /shipments/:id/cancel-shipment`** (TZ-SHIP-433) — отмена `draft`/`scheduled` **без**
  `dispatchedAt`. Если это единственная активная отгрузка и заказ был `shipped` → заказ снова
  `ready`, линии `boardLane→to_ship` / `status→ready`. После dispatch — 400 RU
  «Отгрузка уже отправлена со склада — отмена через склад/админа» (phase 2).

## UI

- Tools-строка: «← На стол» (при `from=desk`), фильтр-чип заказа со сбросом, селекты
  «Статус»/«Заказ», счётчик отгрузок, «Обновить», «+ Отгрузка».
- Таблица: Номер / Заказ / Дата / Позиции / Статус / Действия.
- Действия строки:
  - `draft`/`scheduled` — «Отправить» (dispatch) и **«Отменить отгрузку»** (confirm dialog,
    `data-test="shipping-cancel-{id}"`; после успеха reload + toast);
  - `in_transit` — «Доставлена»;
  - не `cancelled`/`delivered` — «Изменить» (форма редактирования), «Документ» (форма добавления).
- Форма создания: выбор заказа → позиции с количествами (partial) → `ship()`.

## Hub expand

From `/orders` tray — блок «Отгрузка» (`order-shipping-block`): номер отгрузки, признак
«Документ не оформлен», ссылка «Открыть раздел „Отгрузка“» (hub-режим). Desk-режим — кнопка
«Отгружено» (DESK-430) и «Отменить отгрузку» (TZ-SHIP-433) прямо в tray.

## TZ reference

| TZ | Что сделано |
|----|-------------|
| TZ-SUPPLY-312 | Живой реестр + dispatch (замена stub) |
| TZ-DESK-426 | Фильтр `orderId` + `from=desk` (чип «Отгрузка») |
| TZ-SHIP-433 | Отмена ошибочной отгрузки (cancel-shipment), tray «Отменить отгрузку», page.md — реестр |

## Особенности

- Списание остатков — только при `dispatch`; до него отмена не двигает склад.
- Отменённые отгрузки остаются в реестре (не hard delete) и не считаются активными в tray.
