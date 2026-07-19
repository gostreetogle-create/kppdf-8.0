# Страница: Продукция (ProductsPage)

**Краткое описание:** Список продукции с серверной пагинацией, поиском и сортировкой. CRUD-операции через диалоги.

## Route

```
/products — «KPPDF — Продукция»
```

## Query params

Нет — всё состояние через сигналы.

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/products` | Список (page/limit/search/sortBy/sortOrder) |
| DELETE | `/api/products/:id` | Удаление (soft delete) |

Ответ GET: `{ items: Product[], total: number, page: number, limit: number }`

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `ProductFormDialogComponent` | create / edit | `null` / `Product` |
| `AlertDialogComponent` | confirm delete | `{ title, description, confirmLabel, variant }` |

## Services

| Сервис | Методы |
|--------|--------|
| `ProductsService` | `list(params)`, `findById(id)`, `create(payload)`, `update(id, payload)`, `remove(id)` |

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `pageSig` | `Signal<number>` | Текущая страница (1-indexed) |
| `sortKeySig` | `Signal<'name'\|'sku'\|'listPrice'\|null>` | Ключ сортировки |
| `sortDirSig` | `Signal<'asc'\|'desc'\|null>` | Направление сортировки |
| `search` | `SearchState` | Debounced поиск (300ms) |
| `listRes` | `HttpResource<ProductsListResponse>` | GET /api/products |

## Computed

| Computed | Трансформация |
|----------|--------------|
| `listParams` | `{ page, limit: 50, search?, sortBy?, sortOrder? }` |
| `data` | `listRes.value()?.items ?? []` |
| `total` | `listRes.value()?.total ?? 0` |
| `loading` | `listRes.isLoading()` |
| `error` | `extractErrorMessage(listRes.error())` |
| `emptyMessage` | conditional: «Ничего не найдено» / «Нет продукции» |

## Cell templates (pi-table)

| Имя | Колонка | Назначение |
|-----|---------|-----------|
| `nameTpl` | `name` | RouterLink → `/products/:id` |
| `rowActionsTpl` | (actions) | Edit / Delete |

## Column definitions (8 колонок)

`name` (sticky, sortable, cellTemplate) → `sku` (sortable) → `kind` → `unit` → `listPrice` (sortable, numeric, right) → `status` (sortable) → `stockQty` (numeric, right)

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-104.3 | Миграция на pi-table + server-side pagination |
| TZ-104.4.2 | Typed TemplateRef (устранён `any`) |

## Особенности

- **Server-side pagination** — backend принимает `page/limit` + возвращает `{ items, total, page, limit }`
- **Server-side sort** — `localSort=false`, pi-table не сортирует page slice
- **Lockstep sort signals** — `sortKeySig` + `sortDirSig` синхронизированы с pi-table internal state
- **Сброс page на search** — `pageSig.set(1)` при изменении поиска
- **Сброс page на sort** — `pageSig.set(1)` при изменении сортировки
- **Format functions:** `formatPrice()` для `listPrice`, `KIND_LABELS`/`STATUS_LABELS` для enum-полей
- **Refresh on dialog close:** `onDialogCloseOnce` → `listRes.reload()`

---

_Создано: 2026-07-19. Последнее обновление: 2026-07-19._
