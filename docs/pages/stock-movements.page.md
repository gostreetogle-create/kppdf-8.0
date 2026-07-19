# Страница: Движения на складе (StockMovementsPage)

**Краткое описание:** Журнал приходов, расходов и перемещений. Фильтр по типу движения.

## Route

```
/stock-movements — «KPPDF — Движения на складе»
```

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/stock-movements` | Список с опциональным `?type=` |

Ответ: `{ items: StockMovement[], total: number, page: number, limit: number }`

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `selectedType` | `Signal<string>` | Фильтр по типу (in/out/adjust/transfer) |
| `listRes` | `HttpResource<StockMovementsListResponse>` | GET /api/stock-movements |
| `listParams` | `computed` | `{ type? }` из `selectedType` |

## Column definitions (6 колонок)

`date` (sortable, format: DD.MM.YYYY) → `type` (sortable, label: Приход/Расход/Корр./Перемещ.) → `product` (accessor: product.name) → `warehouse` (accessor: warehouse.name) → `qty` (numeric, right) → `documentRef`

## Особенности

- **Filter by type** — `<select>` dropdown (all/in/out/adjust/transfer)
- **Server-side filtering** — `type` query param
- **Inline error toast** — `effect()` для ошибок
- **Date format** — `toLocaleDateString('ru-RU')`
- **Type labels** — MovementType → readable Russian labels

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-115 | silent-http error toast + httpResource migration |

---

_Создано: 2026-07-19._
