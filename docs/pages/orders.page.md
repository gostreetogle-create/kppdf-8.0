# Страница: Заказы (OrdersPage)

**Краткое описание:** Реестр заказов покупателей с клиентской пагинацией, поиском, сортировкой по lifecycle статуса. Бизнес-действия (документ из заказа).

## Route

```
/orders — «KPPDF — Заказы»
```

## Query params

Нет — всё состояние через сигналы.

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/orders` | Список (flat array) |
| DELETE | `/api/orders/:id` | Удаление (soft delete) |

Ответ GET: `Order[]` (flat array, НЕ пагинированный envelope)

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `OrderFormDialogComponent` | create / edit | `null` / `Order` |
| `AlertDialogComponent` | confirm delete | `{ title, description, confirmLabel, variant }` |

## Services

| Сервис | Методы |
|--------|--------|
| `OrdersService` | `list()`, `findById(id)`, `create(payload)`, `update(id, payload)`, `remove(id)` |
| `CounterpartyService` | `list(params)` — для lookup контрагентов |

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `pageSig` | `Signal<number>` | Текущая страница (1-indexed, client-side) |
| `sortKeySig` | `Signal<'number'\|'date'\|'total'\|'status'\|null>` | Ключ сортировки |
| `sortDirSig` | `Signal<'asc'\|'desc'>` | Направление сортировки |
| `search` | `SearchState` | Debounced поиск (300ms) |
| `listRes` | `HttpResource<Order[]>` | GET /api/orders |

## Computed chain

```
listRes → data → filteredRows → sortedRows → paginatedRows
```

| Computed | Трансформация |
|----------|--------------|
| `data` | `listRes.value() ?? []` |
| `filteredRows` | Client-side фильтр по `number`, `deliveryAddress`, `notes`, названиям контрагента/ИНН |
| `sortedRows` | Custom accessor: status (lifecycle), date (chrono), total (numeric), number (locale) |
| `paginatedRows` | `sortedRows.slice(start, start + PAGE_SIZE)` |
| `total` | `sortedRows().length` |

## Column definitions (7 колонок)

`number` (sticky, sortable) → `date` (sortable, empty-cell) → `counterpartyId` (cellTemplate, lookup) → `status` (sortable, lifecycle labels) → `priority` (labels) → `items` (count) → `total` (sortable, numeric, formatPrice)

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-104.3 | Миграция на pi-table (batch-1) |
| TZ-104.4.2 | Typed TemplateRef + lockstep sort signals |

## Особенности

- **Client-side pagination** — backend возвращает flat array (TODO: server-side pagination)
- **Client-side sort** — custom accessors per key (status lifecycle, date chronological, total numeric)
- **Status lifecycle:** draft→confirmed→in_production→ready→shipped→delivered→cancelled
- **Lockstep sort signals** — seeded to `date`/`desc` (новые заказы первыми)
- **Counterparty lookup** — одна lookup table (Counterparty), ID extractor handles populated/unpopulated
- **Document action:** `onCreateDocument()` → `/doc-constructor/builder?source=order&sourceId=:id`

---

_Создано: 2026-07-19._
