# Страница: Движения на складе (StockMovementsPage)

**Краткое описание:** Журнал приходов, расходов и перемещений. Фильтр по типу движения и по складу (как на Остатках).

## Route

```
/stock-movements — «KPPDF — Движения на складе»
/stock-movements?type=in&warehouseId=<id> — комбинированный фильтр
```

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/stock-movements` | Список с опциональными `?type=` и `?warehouseId=` |
| GET | `/api/warehouses` | Список складов (для фильтра) |

Ответ: `{ items: StockMovement[], total: number, page: number, limit: number }`

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `selectedType` | `Signal<string>` | Фильтр по типу (in/out/adjust/transfer) из `?type=` |
| `selectedWarehouse` | `Signal<string>` | **TZ-WAREHOUSE-UX-301** — фильтр по складу из `?warehouseId=` |
| `warehousesRes` | `HttpResource<Warehouse[]>` | GET /api/warehouses |
| `useWarehouseSelect` | `computed` | `warehouses().length > WAREHOUSE_CHIP_MAX (8)` → select вместо chips |
| `warehouseChips` | `computed<QueryGroupChip[]>` | `buildMovementWarehouseFilterChips(warehouses, selectedType)` — сохраняют `type` в query |
| `listRes` | `HttpResource<StockMovementsListResponse>` | GET /api/stock-movements |
| `listParams` | `computed` | `{ type?, warehouseId? }` |

## Column definitions (6 колонок)

`date` (sortable, format: DD.MM.YYYY) → `type` (sortable, label: Приход/Расход/Корр./Перемещ.) → `product` (accessor: product.name) → `warehouse` (accessor: warehouse.name) → `qty` (numeric, right) → `documentRef`

## Особенности

- **Filter by type** — chips в section-ряду (Все/Приход/Расход/Корр./Перемещ.)
- **Filter by warehouse** — **TZ-WAREHOUSE-UX-301**: chips ≤ 8 складов (в tools, с query-параметрами `warehouseId` + сохранённым `type`) или `<select>` > 8 (паттерн Остатков)
- **Server-side filtering** — `type` + `warehouseId` query params → backend фильтрует (BE `?warehouseId=` существовал)
- **Inline error toast** — `effect()` для ошибок
- **Date format** — `toLocaleDateString('ru-RU')`
- **Type labels** — MovementType → readable Russian labels
- Chips рендерятся самой страницей (не group-workspace) — чтобы пробрасывать `queryParams`

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-115 | silent-http error toast + httpResource migration |
| **TZ-WAREHOUSE-UX-301** | **Фильтр склада (chips ≤8 / select >8) + сохранение type; page doc** |
| **TZ-UX-342** | Removed dead `[total]`/`[pageSize]` (no fake pager without pageChange) |

---

_Создано: 2026-07-19. Обновлено: 2026-08-16 (TZ-UX-342)._
