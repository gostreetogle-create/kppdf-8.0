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
| GET | `/api/materials` | Список (page/limit/search/categoryId) |
| DELETE | `/api/materials/:id` | Удаление (soft delete) |
| POST | `/api/materials/:id/duplicate` | **TZ-MATERIALS-310** — серверный клон (без фото) |

Ответ GET: `{ items: Material[], total: number, page: number, limit: number }`

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `MaterialFormDialogComponent` | create / edit | `null` / `Material` |
| `AlertDialogComponent` | confirm delete | `{ title, description, confirmLabel, variant }` |

## Services

| Сервис | Методы |
|--------|--------|
| `MaterialsService` | `list(params)`, `findById(id)`, `create(payload)`, `update(id, payload)`, `remove(id)`, **`duplicate(id)`** (TZ-MATERIALS-310) |
| `OrganizationsService` | `list(params)` — для lookup поставщиков |
| `PhotosService` | `list()` — для lookup фото |
| `CategoriesService` | `list('material')` — активные категории и префиксы внутреннего кода |

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
| `rowActionsTpl` | (actions) | Copy / Edit / Delete (TZ-MATERIALS-310 добавил copy slot) |

## Идентификация: «Артикул» vs «Внутренний код материала»

- **Артикул** (`article`) — пользовательский/внешний код (поставщик, каталог клиента). Необязателен, может повторяться.
- **Внутренний код материала** (`sku`) — уникальный системный идентификатор для поиска (`$or: [name, article, sku]`) и связей.
  Уникальность гарантируется сервером: Mongo `unique: true, sparse: true` + E11000 → HTTP 409 (не 500).
  Пользователь может ввести его вручную; если поле пустое и выбрана активная категория типа `material` с префиксом,
  сервер создаёт код через атомарный counter в формате `PREFIX-YYYY-NNN`. Локальной генерации на клиенте нет.
  Категория передаётся как `categoryId`, а при редактировании populated-ссылка нормализуется в ID без потери значения.
  Активная категория с другим типом, отключённая категория или категория без префикса отклоняются до создания материала.

## Column definitions (8 колонок)

`mainPhotoId` (96px, center) → `name` (sticky, sortable) → `article` (sortable) → `sku` (sortable) → `unit` (sortable) → `supplierId` (cellTemplate) → `dimensions` (cellTemplate) → `pricePerUnit` (sortable, numeric, right)

> **Остаток (TZ-MATERIALS-304):** колонка `stockQty` убрана из списка материалов — остаток
> управляется только в разделе «Склад» (`StorageItem.quantity`, приходы/расходы). `Material.stockQty`
> остаётся в schema/DTO как legacy (backward compatibility), но не отображается и не вводится.
> Связь материал→склад отсутствует (`StorageItem.productId` → продукт; см. TZ-MATERIALS-308).

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-104.3 | Миграция на pi-table + lookup tables |
| TZ-104.4.2 | Typed TemplateRef (устранён `any`) |
| TZ-117 | httpResource миграция + unit test precedent |
| TZ-MATERIALS-303 | Понятный код/идентификация (article vs sku) |
| TZ-MATERIALS-307 | Серверная генерация SKU через CounterService |
| TZ-MATERIALS-310 | **Кнопка «Копировать»** (server-side clone, без фото) |

## Кнопка «Копировать» — TZ-MATERIALS-310

`POST /api/materials/:id/duplicate` создаёт server-side clone с тем же контрактом, что
`DocumentTemplate.duplicate` и `ProductService.clone`:

| Поле | Поведение |
|------|-----------|
| `name` | `${source.name} (копия)`, truncate до 256 символов, если переполнение |
| `sku` | перегенерируется через `CounterService.next('Material', category.skuPrefix)` если у категории есть `skuPrefix`; **не копируется** с исходника (защита от коллизий) |
| `article` | копируется as-is (пользовательский код, может повторяться) |
| `unit`, `description`, `pricePerUnit`, `supplierId`, `notes`, `dimensions` | копируются verbatim |
| `photoIds`, `mainPhotoId` | **НЕ копируются** — пользователь заново выбирает фото в открывшемся edit-dialog (избегаем orphan-ссылок и mixed-upload конфликтов по контракту TZ-MATERIALS-306) |
| `createdAt`/`updatedAt`/`organizationId`/`isSystem`/`deletedAt` | не копируются — clone получает свежие значения на момент create |

UX flow: подтверждение в `AlertDialogComponent` (variant `form`) → на confirm → POST → на success
открывается `MaterialFormDialogComponent` уже с клоном + toast «Создана копия: …».

Audit: `@AuditAction({ action: 'duplicate', entityType: 'Material', idParam: 'id' })`
регистрирует sourceId в audit log.

## Особенности

- **Server-side pagination** — backend возвращает `{ items, total, page, limit }`
- **Client-side sort** — pi-table сортирует page slice (нет sortBy на backend)
- **Three lookup tables** — suppliers (Organizations), categories (Categories, type `material`) + photos (Photos)
- **Фото:** `mainPhotoOf(row)` — проверяет string | populated object
- **Габариты:** `dimensionsSummary(row)` — `L 3000мм × W 2000мм × T 2мм`
- **Refresh on dialog close:** 3 стрима: `suppliersLookup.load()` + `photosLookup.load()` + `listRes.reload()`
- **Copy row action** — slot order в `PiRowActionsComponent`: Copy → Document → Edit → Delete
  (TZ-MATERIALS-310 ввёл copy slot как левый-most, потому что это наименее-mutative действие)
- **Unit test exists:** `materials.page.spec.ts` — тестирует httpResource auto-refire

---

_Создано: 2026-07-19. Последнее обновление: 2026-08-02 (TZ-MATERIALS-307 → TZ-MATERIALS-310 — Copy action)._
