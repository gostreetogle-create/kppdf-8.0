# Страница: Остатки на складе (StorageItemsPage)

**Краткое описание:** Текущие остатки по складам. Фильтр по складу, pi-table с сортировкой.

## Route

```
/storage-items — «KPPDF — Остатки на складе»
```

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/storage-items` | Список с опциональным `?warehouseId=` |
| GET | `/api/warehouses` | Список складов (для фильтра) |

Ответ GET storage-items: `{ items: StorageItem[], total: number, page: number, limit: number }`

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `selectedWarehouse` | `Signal<string>` | Фильтр по складу |
| `listRes` | `HttpResource<StorageItemsListResponse>` | GET /api/storage-items |
| `warehousesRes` | `HttpResource<Warehouse[]>` | GET /api/warehouses |
| `listParams` | `computed` | `{ warehouseId? }` из `selectedWarehouse` |

## Column definitions (6 колонок)

`product` (sortable, accessor: product.name) → `warehouse` (sortable, accessor: warehouse.name) → `zoneName` → `quantity` (numeric, right) → `reservedQty` (numeric, right) → `minQuantity` (numeric, right)

## Особенности

- **Filter by warehouse** — `<select>` dropdown с warehouse options
- **Server-side filtering** — `warehouseId` query param → backend фильтрует
- **Inline error toast** — `effect()` показывает toast при ошибке
- **pi-table** — с [initialSortKey]="'product'" [initialSortDir]="'asc'"
- **Accessor pattern** — populated поля через row.product?.name

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-115 | silent-http error toast + httpResource migration |
| TZ-117 | httpResource миграция |

---

_Создано: 2026-07-19._
