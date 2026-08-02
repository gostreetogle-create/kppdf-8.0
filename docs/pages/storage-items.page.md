# Страница: Остатки на складе (StorageItemsPage)

**Краткое описание:** Текущие остатки по складам. Фильтр по складу и по материалу, pi-table с сортировкой.

## Route

```
/storage-items — «KPPDF — Остатки на складе»
/storage-items?materialId=<id> — фильтр по материалу (переход со страницы материалов, TZ-MATERIALS-308)
```

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/storage-items` | Список с `?warehouseId=`, `?productId=`, `?materialId=`, `?lowStock=` |
| GET | `/api/warehouses` | Список складов (для фильтра) |
| GET | `/api/materials` | Материалы (для подписи фильтра) |

Ответ GET storage-items: `{ items: StorageItem[], total: number }` — **envelope** (TZ-MATERIALS-308 выровнял контракт: ранее был голый массив, из-за чего список не рендерился в PiEntityListComponent).

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `selectedWarehouse` | `Signal<string>` | Фильтр по складу |
| `materialId` | `Signal<string>` | **TZ-MATERIALS-308** — фильтр по материалу из `?materialId=` (read-only) |
| `materialName` | `computed` | Подпись «Материал: …» (lookup по /materials) |
| `listRes` | `HttpResource<StorageItemsListResponse>` | GET /api/storage-items |
| `warehousesRes` | `HttpResource<Warehouse[]>` | GET /api/warehouses |
| `listParams` | `computed` | `{ warehouseId?, materialId? }` |

## Column definitions (6 колонок)

`product` (sortable, accessor: `storageItemName(row)` — продукт ИЛИ материал) → `warehouse` (sortable, accessor: warehouse.name) → `zoneName` → `quantity` (numeric, right) → `reservedQty` (numeric, right) → `minQuantity` (numeric, right)

## Особенности

- **Filter by warehouse** — `<select>` dropdown с warehouse options
- **Материал-фильтр** — `?materialId=` из query (переход со страницы материалов) + подпись; количество меняется только в складе (read-only)
- **Server-side filtering** — `warehouseId` / `materialId` query params → backend фильтрует
- **Inline error toast** — `effect()` показывает toast при ошибке
- **pi-table** — с [initialSortKey]="'product'" [initialSortDir]="'asc'"
- **Accessor pattern** — `storageItemName(row)`: populated `productId`/`materialId` → имя; XOR-позиции

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-115 | silent-http error toast + httpResource migration |
| TZ-117 | httpResource миграция |
| **TZ-MATERIALS-308** | **Материал-позиции**: колонка «Продукт/Материал», фильтр `?materialId=`, envelope-контракт |

---

_Создано: 2026-07-19. Обновлено: 2026-08-02 (TZ-MATERIALS-308)._
