# Audit: Order.status — Комбайн vs цех

**Дата:** 2026-08-16  
**Источник:** PO: перенёс заказ в «Черновики» на Комбайне, в цехе заказ остался как живая работа.  
**Канон:** [`docs/COUPLING-MAP.md`](../COUPLING-MAP.md)  
**Фикс кода:** `TZ-PRODUCTION-337`

## Вердикт

Связь **не сломана на записи**: Комбайн делает `PATCH /api/orders/:id {status:'draft'}` (`dashboard.page.ts` `dropOrder`).  
Связь **сломана на чтении**: цех «Все активные» = `ACTIVE_COMMERCIAL_ORDER_STATUSES`, и туда входит `draft`.

Это не «нет карты сайта». Карты страниц (`DOMAIN-MAP`, page.md, FIC) есть. Нет **карты смысла общего поля**.

## Evidence (read-only)

| Место | Факт |
|-------|------|
| `dashboard.page.ts` ~L200–206 | колонка «Черновики» = `['draft']` |
| `dashboard.page.ts` ~L262–296 | дроп в операционную колонку → `OrdersService.update({status})` |
| `gantt-bar.model.ts` L14–19 | ACTIVE = `draft, confirmed, in_production, ready` |
| `gantt-bar.model.ts` L847–851 | `activeOnly` режет rail **и** Гант через `filterOrdersForRail` |
| `production-cockpit.context.ts` | `activeOnly` default `true` |
| `gantt-bar.model.spec.ts` L230–243 | тест **закрепляет** баг: при activeOnly виден именно `draft` |

## Канон после фикса

`draft` = черновик сделки, не работа цеха.  
Цех «Все активные» = `confirmed | in_production | ready`.

## Метод «раз и навсегда»

Не Graphify / не новая сущность в БД / не экран для сотрудников.  
Один файл [`COUPLING-MAP.md`](../COUPLING-MAP.md) + строка в Integrity slot.  
Новый фильтр статуса без правки карты = не DONE.
