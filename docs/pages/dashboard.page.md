# Страница: Комбайн заказов (DashboardPage)

**Краткое описание:** Домашняя Канбан-доска заказов. Не путать со складским дашбордом `/inventory`.

## Routes

```
/            — redirect → /dashboard
/dashboard   — «KPPDF — Дашборд» (UI-лейбл страницы: «Комбайн заказов»)
```

`pageKey`: `orders` (тот же грант, что список заказов).

## Канон статусов (TZ-SWEEP-401)

**Заказ (`Order.status`)** — колонки доски:

| Колонка | status | Как попасть |
|---------|--------|-------------|
| Черновики | `draft` | create / PATCH status |
| Подтверждены | `confirmed` | PATCH status (коммерческий). Складской резерв — отдельно `POST /orders/:id/reserve-stock` |
| В производстве | `in_production` | PATCH status |
| Готовы | `ready` | PATCH status |
| Отгружены | `shipped` (+ `delivered` только показ) | **только** `POST /orders/:id/ship` (создаёт `Shipment`). Не PATCH |

Отмена — `POST /orders/:id/cancel` (снимает резервы). На доске колонки «Отменён» нет.

**Изделие (`OrderItem.status`)** — селект в раскрытой карточке: `pending` → `in_production` → `ready` → `shipped`.
Не путать с `readyForWork` (гейт «можно начинать», ORDERS-304, живёт на `/orders`).

Карточка «X из Y» = число линий с `status ∈ {ready, shipped}`; нет поля → `pending`.

## API

| Метод | Endpoint | Когда |
|-------|----------|--------|
| GET | `/api/orders` | список доски |
| PATCH | `/api/orders/:id` `{status}` | только операционные переходы (не ship/cancel) |
| POST | `/api/orders/:id/ship` | дроп в «Отгружены» после confirm |
| PATCH | `/api/orders/:id/items/:lineIndex/status` | селект изделия |

## Навигация

- **Бренд в шапке** «KPPDF · 8.0» — кнопка домой (`routerLink="/"`, aria «Комбайн заказов — главная») → сюда. Оформление: soft-gold chip (**TZ-UX-331**), не plain text.
- Login / `/` → сюда же.
- Сделки TOC: chip **Комбайн** (`/dashboard`). Не подписывать «Дашборд» — это `/inventory`.
- Топ «Сделки» entry = Создать КП (`/proposals/create`), не Комбайн.

## Редактирование изделия с доски (TZ-UX-332)

Карандаш изделия вызывает `DashboardDialogService.openProductEdit(productId)` → `GET /api/products/:id` → `ProductFormDialogComponent` с полным `Product` (`_id`). Не передавать `{ id }` без карточки: Save бил в `PATCH /products/undefined`.

## Связанные TZ

DASHBOARD-400 (доска) · **SWEEP-401** (write-path + freeze + nav + optimistic revert)
