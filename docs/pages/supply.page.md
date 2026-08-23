# Страница: Снабжение / Закупки (SupplyPage)

**Краткое описание:** Два режима на одном URL: **«Быстрый заказ»** (mock-блокнот снабженца, default) и **«Реестр»** (live SupplyTask 301/302). Row A — logistics chips (Закупки/Отгрузка); Row B — view chips + toolbar.

## Routes

```
/supply — «KPPDF — Снабжение / Закупки» → Быстрый заказ (default)
/supply?view=quick — явный быстрый заказ
/supply?view=registry — реестр SupplyTask (таблица)
/supply?view=quick&orderId= — быстрый заказ с контекстом заказа (из стола)
```

## Query params

| Параметр | Тип | Назначение |
|----------|-----|-----------|
| `view` | `quick` \| `registry` | Режим страницы; **отсутствие = quick** |
| `orderId` | `string` (Order._id) | Quick: prefill при «+ Создать»; Registry: **HUB-303** фильтр `GET /api/supply-tasks?orderId=` + chip сброса |

Query `orderId` **сохраняется** при переключении Быстрый заказ ↔ Реестр.

## API endpoints (только «Реестр»)

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/supply-tasks?orderId=&status=` | Список (≤500, новые сверху) |
| POST | `/api/supply-tasks` | Создать (draft); нужен title или materialId/moduleId |
| PATCH | `/api/supply-tasks/:id` | qty / notes / title |
| POST | `/api/supply-tasks/:id/confirm` | D18: status→confirmed + confirmedBy/At из JWT |
| POST | `/api/supply-tasks/:id/ordered` | confirmed → ordered |
| POST | `/api/supply-tasks/:id/received` | ordered → received |
| DELETE | `/api/supply-tasks/:id` | soft delete |

**Быстрый заказ (304):** без API — in-memory mock, F5 сбрасывает.

## UI

### Быстрый заказ (`view=quick` или default)

- Expand-in-row плитки (▸/▾), одна развёрнутая
- Toolbar: поиск, фильтр статус/приоритет, «N заявок», «+ Создать»
- 4 блока полей + collapsible «Ещё»; inline «+ Новый» поставщик / «+ Новая» категория
- Фото — stub placeholder
- Seed: 5 строк из design canon §11

### Реестр (`view=registry`)

- Таблица: позиция, заказ (ссылка на `/orders/:id`), qty, статус, дата confirm, действия
- «+ Задача» — inline form (заказ + название + qty) + explode из состава
- Chip при `?orderId=`: «Фильтр: заказ {номер|id}» + «Сбросить»
- Empty: «Нет задач снабжения. Создайте первую — «+ Задача».»

### Входы

| Откуда | Куда |
|--------|------|
| Desk chip «Снабжение» | `/supply?view=quick` (без expand); с expand — `/supply?view=quick&orderId=&from=desk` (**426**, фильтр + «На стол») |
| Desk tray «Открыть снабжение» | flyout `panel=supply` на столе (425), без смены path |
| Chip «Реестр» на странице | `/supply?view=registry` |

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-SUPPLY-301 | Live registry + confirm/ordered/received |
| TZ-SUPPLY-302 | BOM explode → draft tasks |
| **TZ-ORDERS-HUB-303** | Query `orderId` filter + deep-link from orders expand |
| **TZ-UX-342** | Removed dead `[total]` on pi-table (no fake pager without slice) |
| **TZ-SUPPLY-304** | Быстрый заказ mock UI + view chips + desk navigate |

## Канон

- D9: отдельный пункт меню Снабжение
- D18: confirm audit fields
- Design canon: `docs/audits/2026-08-19-supply-quick-order-design-canon.md`

## Known limits

- **Быстрый заказ:** mock in-memory; нет sync с SupplyTask; справочники hardcoded до SUPPLY-305
- **Быстрый заказ:** F5 теряет правки; фото upload — stub
- Автосоздание из состава заказа — только в реестре (SUPPLY-302)
- Data bind API → `TZ-SUPPLY-305`
