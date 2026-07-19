# Страница: Материалы (MaterialsPage)

**Краткое описание:** Справочник материалов с серверной пагинацией, поиском, фото, поставщиками, габаритами.

## Route

```
/materials — «KPPDF — Материалы»
```

## Query params

Нет — всё состояние через сигналы.

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/materials` | Список (page/limit/search) |
| DELETE | `/api/materials/:id` | Удаление (soft delete) |

Ответ GET: `{ items: Material[], total: number, page: number, limit: number }`

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `MaterialFormDialogComponent` | create / edit | `null` / `Material` |
| `AlertDialogComponent` | confirm delete | `{ title, description, confirmLabel, variant }` |

## Services

| Сервис | Методы |
|--------|--------|
| `MaterialsService` | `list(params)`, `findById(id)`, `create(payload)`, `update(id, payload)`, `remove(id)` |
| `OrganizationsService` | `list(params)` — для lookup поставщиков |
| `PhotosService` | `list()` — для lookup фото |

## Lookup tables

| Lookup | Источник | Ключ |
|--------|----------|------|
| `suppliersLookup` | `orgs.list({ limit: 200 })` | `Organization._id` |
| `photosLookup` | `photos.list()` | `Photo._id` |

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `pageSig` | `Signal<number>` | Текущая страница (1-indexed) |
| `search` | `SearchState` | Debounced поиск (300ms) |
| `listRes` | `HttpResource<MaterialsListResponse>` | GET /api/materials |

## Computed

| Computed | Трансформация |
|----------|--------------|
| `listParams` | `{ page, limit: 50, search? }` |
| `data` | `listRes.value()?.items ?? []` |
| `total` | `listRes.value()?.total ?? 0` |
| `loading` | `listRes.isLoading()` |
| `error` | `extractErrorMessage(listRes.error())` |
| `debouncedSearch` | публичный (для теста) |

## Cell templates (pi-table)

| Имя | Колонка | Назначение |
|-----|---------|-----------|
| `photoTpl` | `mainPhotoId` | `<img>` или `<pi-empty-tile>` |
| `supplierTpl` | `supplierId` | Название организации (lookup) |
| `dimsTpl` | `dimensions` | `L 3000мм × W 2000мм × T 2мм` |
| `rowActionsTpl` | (actions) | Edit / Delete |

## Column definitions (9 колонок)

`mainPhotoId` (96px, center) → `name` (sticky, sortable) → `article` (sortable) → `sku` (sortable) → `unit` (sortable) → `supplierId` (cellTemplate) → `dimensions` (cellTemplate) → `pricePerUnit` (sortable, numeric, right) → `stockQty` (sortable, numeric, right)

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-104.3 | Миграция на pi-table + lookup tables |
| TZ-104.4.2 | Typed TemplateRef (устранён `any`) |
| TZ-117 | httpResource миграция + unit test precedent |

## Особенности

- **Server-side pagination** — backend возвращает `{ items, total, page, limit }`
- **Client-side sort** — pi-table сортирует page slice (нет sortBy на backend)
- **Two lookup tables** — suppliers (Organizations) + photos (Photos)
- **Фото:** `mainPhotoOf(row)` — проверяет string | populated object
- **Габариты:** `dimensionsSummary(row)` — `L 3000мм × W 2000мм × T 2мм`
- **Refresh on dialog close:** 3 стрима: `suppliersLookup.load()` + `photosLookup.load()` + `listRes.reload()`
- **Unit test exists:** `materials.page.spec.ts` — тестирует httpResource auto-refire

---

_Создано: 2026-07-19. Последнее обновление: 2026-07-19._
