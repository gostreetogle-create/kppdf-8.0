# Страница: Склад (InventoryDashboardPage)

**Краткое описание:** Дашборд складских операций — сводка (склады, позиции, мало остатков, резервы) + таблица позиций с низким остатком.

## Route

```
/dashboard — «KPPDF — Склад»
```

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/storage-items` | Все остатки |
| GET | `/api/inventory/low-stock` | Позиции с низким остатком |
| GET | `/api/warehouses` | Список складов |

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `allItemsRes` | `HttpResource<StorageItemsListResponse>` | GET /api/storage-items |
| `lowStockRes` | `HttpResource<StorageItemsListResponse>` | GET /api/inventory/low-stock |
| `warehousesRes` | `HttpResource<Warehouse[]>` | GET /api/warehouses |

## Computed

| Computed | Формула |
|----------|---------|
| `totalItems` | `allItems().length` |
| `lowStockCount` | `lowStockItems().length` |
| `totalReserved` | `sum(allItems, item.reservedQty ?? 0)` |
| `warehouses` | `warehousesRes.value() ?? []` |

## Особенности

- **3 параллельных httpResource** — storage-items, low-stock, warehouses
- **4 metric cards** — склады / позиции / мало остатков (red) / резервы
- **Low stock table** — inline `<table>` с продуктом, складом, остатком, минимумом
- **Error handling** — 3 отдельных `errorEffect` для toast, 1 `error` computed для inline
- **No CRUD** — read-only dashboard (нет create/edit/delete)

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-115 | httpResource migration + error effects |

---

_Создано: 2026-07-19._
