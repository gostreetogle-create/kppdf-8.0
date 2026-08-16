# Страница: Комбайн заказов (`DashboardPage`) — канбан, раздел Проект

**Краткое описание:** Канбан-доска заказов (комбайн) живёт в **Проектировании** —
`/design/combine` (TZ-NAV-303). Не путать со складским дашбордом `/inventory`
и с домашней статистикой `/dashboard` (Обзор).

## Routes

```
/design/combine — «KPPDF — Комбайн заказов» (UI-лейбл: «Комбайн заказов»)
/               — redirect → /dashboard (домашняя статистика «Обзор»)
```

`pageKey`: `orders` (тот же грант, что список заказов).

Компонент: тот же `DashboardPage` (`frontend/src/app/pages/dashboard/dashboard.page.ts`),
лениво загружается по новому route (TZ-NAV-303: lazy same component). Write-path
**TZ-SWEEP-401 не переписывался**.

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

## Couplings

Канон: [`docs/COUPLING-MAP.md`](../COUPLING-MAP.md).

| Поле | Этот экран | Другие экраны | Смысл |
|------|------------|---------------|-------|
| `Order.status` | колонки канбана; PATCH draft…ready; ship/cancel — POST | цех «Все активные»; `/orders`; форма freeze | `draft` = Черновики, **не** работа цеха. Цех active = confirmed/in_production/ready (**TZ-PRODUCTION-337**). |
| `OrderItem.status` | селект в карточке; лейбл «В работе» = `in_production` | не путать с цехом | **Не** `Order.status`. **Не** `readyForWork`. |

## API

| Метод | Endpoint | Когда |
|-------|----------|--------|
| GET | `/api/orders` | список доски |
| PATCH | `/api/orders/:id` `{status}` | только операционные переходы (не ship/cancel) |
| POST | `/api/orders/:id/ship` | дроп в «Отгружены» после confirm |
| PATCH | `/api/orders/:id/items/:lineIndex/status` | селект изделия |

## Навигация

- Пункт **Проект** (Проектирование): items «Очередь» (`/design`) + «Комбайн»
  (`/design/combine`); entryPath = `/design` (Очередь). (TZ-NAV-303)
- Group Chip `DESIGN_SECTION_CHIPS`: «Очередь» + «Комбайн».
- Из Сделок Комбайн **убран** (TZ-NAV-303): deals `activeAliases` и `DEALS_TOC_CHIPS`
  больше не содержат `/dashboard`/«Комбайн».
- Крошки страницы: «Проектирование → /design» + «Комбайн».

## Редактирование изделия с доски (TZ-UX-332)

Карандаш изделия вызывает `DashboardDialogService.openProductEdit(productId)` → `GET /api/products/:id` → `ProductFormDialogComponent` с полным `Product` (`_id`). Не передавать `{ id }` без карточки: Save бил в `PATCH /products/undefined`.

## Связанные TZ

DASHBOARD-400 (доска) · **SWEEP-401** (write-path + freeze + nav + optimistic revert) ·
**TZ-NAV-303** (перенос в Проект) · **TZ-DASHBOARD-401** (домашние виджеты — не здесь)
