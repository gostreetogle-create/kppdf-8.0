# Страница: Обзор — домашняя статистика (`DashboardStatsPage`)

**Краткое описание:** первая страница сайта — **сводка (home stats)**, НЕ канбан.
Виджеты обзора (**TZ-DASHBOARD-401**): KPI заказов + pulse склада. Канбан — только
на `/design/combine`.

## Routes

```
/            — redirect → /dashboard
/dashboard   — «KPPDF — Обзор» (UI-лейбл: «Обзор»)
```

`pageKey`: `orders` (как было у Комбайна — без новой pageKey на backend; грант не менялся).

## UI (TZ-DASHBOARD-401)

- `PiPageChrome`: заголовок «Обзор» + описание (сводка; канбан в Проекте).
- **Заказы** (`data-test="overview-orders-section"`): счётчики Новые / В работе /
  Готовы / Просрочены — те же формулы, что на Канбане (`dashboard.page.ts`), из
  `GET /orders`. Ссылки: «Все заказы» → `/orders`, «Комбайн заказов» → `/design/combine`.
- **Склад** (`data-test="overview-warehouse-section"`): pulse из aggregate
  `GET /inventory` (склады / позиции / мало остатков / движения 30д) — **без**
  unbounded N×list. Ссылки на `/storage-items`, `/stock-movements`, `/warehouses`.
- Состояния RU: loading (`overview-loading`), error (`overview-error`), empty
  (`overview-empty`) когда нет заказов и складской активности.
- Разделы (`data-test="overview-sections"`): Заказы, Комбайн, КП, Остатки, Движения,
  Сводка склада. На home **нет** канбана.
- КП open-count не считаем (нет aggregate API) → при необходимости
  **TZ-DASHBOARD-402**.

## Комбайн заказов

Канбан (DashboardPage) переехал под **Проект** — `/design/combine`
(см. [`design-combine.page.md`](./design-combine.page.md)). Здесь его нет.

## Couplings (канон)

Канон: [`docs/COUPLING-MAP.md`](../COUPLING-MAP.md).

| Поле | Этот экран | Другие экраны | Смысл |
|------|------------|---------------|-------|
| `Order.status` | счётчики Обзора (read-only) | Канбан `/design/combine`; цех «Все активные»; `/orders`; форма freeze | `draft` = Черновики, **не** работа цеха. Цех active = confirmed/in_production/ready (**TZ-PRODUCTION-337**). |

## API

| Метод | Endpoint | Когда |
|-------|----------|--------|
| GET | `/api/orders` | KPI заказов Обзора (read-only) |
| GET | `/api/inventory` | aggregate pulse склада (read-only) |

## Навигация

- **Бренд в шапке** «KPPDF · 8.0» — кнопка домой (`routerLink="/"`, aria «Обзор — главная»)
  → сюда. Оформление: soft-gold chip (**TZ-UX-331**), не plain text. Не «Комбайн» (**TZ-NAV-303**).
- Login / `/` → сюда же.
- Комбайн заказов — раздел **Проект** → `/design/combine` (не Сделки).

## Связанные TZ

**TZ-NAV-303** (stub + перенос Комбайна в Проект) · DASHBOARD-400 (канбан) ·
**TZ-SWEEP-401** (write-path канбана, живёт на `/design/combine`) ·
**TZ-DASHBOARD-401** (виджеты обзора — DONE) · опц. successor **TZ-DASHBOARD-402** (КП aggregate)
