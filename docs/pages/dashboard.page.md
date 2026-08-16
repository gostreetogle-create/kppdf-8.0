# Страница: Обзор — домашняя статистика (`DashboardStatsPage`) — stub

**Краткое описание:** первая страница сайта — **сводка (home stats)**, НЕ канбан.
Полные виджеты (заказы по статусам, материалы/склад, сделки) — **TZ-DASHBOARD-401**.
Сейчас — честный stub: минимальные счётчики заказов из уже доступного `GET /orders`
+ быстрые ссылки в разделы.

## Routes

```
/            — redirect → /dashboard
/dashboard   — «KPPDF — Обзор» (UI-лейбл: «Обзор»)
```

`pageKey`: `orders` (как было у Комбайна — без новой pageKey на backend; грант не менялся).

## UI (stub, TZ-NAV-303)

- `PiPageChrome`: заголовок «Обзор» + описание.
- Счётчики заказов (`data-test="overview-order-counters"`): Новые / В работе / Готовы /
  Просрочены — те же формулы, что на Канбане (`dashboard.page.ts`), из `GET /orders`.
- Ссылки в разделы (`data-test="overview-sections"`): Заказы, Комбайн заказов
  (`/design/combine`), КП, Остатки, Движения.
- Полные виджеты = TZ-DASHBOARD-401 — здесь НЕ расползаться в BI.

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
| GET | `/api/orders` | счётчики Обзора (read-only) |

## Навигация

- **Бренд в шапке** «KPPDF · 8.0» — кнопка домой (`routerLink="/"`, aria «Обзор — главная»)
  → сюда. Оформление: soft-gold chip (**TZ-UX-331**), не plain text. Не «Комбайн» (**TZ-NAV-303**).
- Login / `/` → сюда же.
- Комбайн заказов — раздел **Проект** → `/design/combine` (не Сделки).

## Связанные TZ

**TZ-NAV-303** (stub + перенос Комбайна в Проект) · DASHBOARD-400 (канбан) ·
**TZ-SWEEP-401** (write-path канбана, живёт на `/design/combine`) ·
**TZ-DASHBOARD-401** (полные виджеты — следующий шаг)
