# Страница: Снабжение / Закупки (SupplyPage)

**Краткое описание:** Реестр задач закупки по заказам. Сначала подтверждение «можно заказывать» (кто/когда), потом отметки Заказано / Получено. P0 — ручное создание; авторазнос из BOM — successor.

## Routes

```
/supply — «KPPDF — Снабжение / Закупки»
```

## Query params

Нет (фильтр статуса в сигнале страницы).

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/supply-tasks?orderId=&status=` | Список (≤500, новые сверху) |
| POST | `/api/supply-tasks` | Создать (draft); нужен title или materialId/moduleId |
| PATCH | `/api/supply-tasks/:id` | qty / notes / title |
| POST | `/api/supply-tasks/:id/confirm` | D18: status→confirmed + confirmedBy/At из JWT |
| POST | `/api/supply-tasks/:id/ordered` | confirmed → ordered |
| POST | `/api/supply-tasks/:id/received` | ordered → received |
| DELETE | `/api/supply-tasks/:id` | soft delete |

## UI

- Таблица: позиция, заказ (ссылка на `/orders/:id`), qty, статус, дата confirm, действия
- «+ Задача» — inline form (заказ + название + qty)
- Empty: «Нет задач снабжения. Создайте первую — «+ Задача».»
- Не stub NAV-301

## Канон

- D9: отдельный пункт меню Снабжение
- D18: confirm audit fields
- D19 soft materials — вне scope этого TZ

## Known limits

- Автосоздание из состава заказа → SUPPLY-302
