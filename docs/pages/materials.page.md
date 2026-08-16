# Страница: Материалы (MaterialsPage)

**Краткое описание:** Справочник материалов с серверной пагинацией, поиском, фото, поставщиками, габаритами.

## TZ-CATALOG-332 — визуальный маркер типа

В ссылке названия строки отображается тонкая полоска `material`. Для сырья (`materialKind = raw`) helper использует отдельный hue, остальные материалы используют общий material hue. Это UI-легенда каталога; она не связана с RAL, `ralCode` или физическим цветом.

> **TZ-CATALOG-301 (BE DONE):** на API уже есть `materialKind`, `assortment`,
> `standardRef`, `materialGrade`, `weightKg` (+ filter `?materialKind=`).
> **FE форма/типы этих полей — TZ-CATALOG-316 DONE** (не Wave 2 UI tree).
> Уникальные типы габаритов (один length/width/… на материал) — **MATERIALS-311**.

## Route

```
/materials — «KPPDF — Материалы»
```

## Query params

Нет — всё состояние через сигналы.

## TZ-CATALOG-373 — витрина: list↔grid + filters-rail (канон products)

Паритет chrome с `/products` (эталон `products.page.ts`, TZ-PRODUCTS-305):

- **View toggle** (toolbar, после «Обновить»): кнопки `data-test="view-list-button"` /
  `data-test="view-grid-button"` (`lucide` List / LayoutGrid), `viewMode` signal,
  персистентность в `localStorage['pi-materials-view-mode']` (try/catch, F5 сохраняет вид).
- **Filters rail**: узкая полоска `w-12` + оверлей-панель (`filters-rail-panel`), backdrop
  (`filters-backdrop`, `z-20`) не перекрывает рейл (`z-40`); клик внутри панели не закрывает
  (`pointerdown/click stopPropagation`). 1:1 канон оверлея products.
- **Rail панель**: «Тип» (`rail-kind`, **тот же `kindFilterSig`, что у toolbar-селекта** →
  `?materialKind=`, TZ-CATALOG-316 не регрессирует) + «Сбросить» (`clearFilters`:
  kind=null + поиск='' + page=1).
- **Grid**: `app-pi-showcase-card size="md"`, сетка `1/2/3` (`data-test="materials-grid"`),
  карточки-ссылки на `/materials/:id` (`showcase-cell-{{id}}`); media из `mainPhotoUrl`,
  eyebrow = kind-label (иначе артикул), description = габариты (иначе поставщик),
  footer = `formatPrice(pricePerUnit)` + «за <ед.>» + ед.; pager = `<app-pi-pagination>`
  (`data-test="grid-pager"` wrapper; канон TZ-UX-341 / UX-340).
  при `total > pageSize`.
- **List**: текущий `pi-table` без регресса (kind filter / фото / stock link сохранены).

known_limitation (TZ-CATALOG-373):

- Сортировка в rail **не** добавлена: backend `GET /materials` не принимает
  `sortBy`/`sortOrder` (всегда `sort({name: 1})`, см. `MaterialService.findAll`),
  поэтому client-sort текущей page slice не фейкается. Rail = «Тип» + «Сбросить».
- Сужение колонок таблицы «как у products» — successor (не этот TZ).

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/materials` | Список (page/limit/search/categoryId/**materialKind**) |
| DELETE | `/api/materials/:id` | Удаление (soft delete) |
| POST | `/api/materials/:id/duplicate` | **TZ-MATERIALS-310** — серверный клон (без фото) |

Ответ GET: `{ items: Material[], total: number, page: number, limit: number }`

> **TZ-CATALOG-301 (BE DONE, 2026-08-04) — поля ниже добавлены на backend:**
> `Material.materialKind` (`'raw' | 'part' | 'fastener' | 'purchased' | 'other'`), `Material.assortment` (профиль, ≤256), `Material.standardRef` (ГОСТ/ASTM, ≤256), `Material.materialGrade` (марка, ≤256), `Material.weightKg` (кг, ≥0).
> Поле `materialKind` индексировано (`sparse: true`) и поддерживается фильтром `?materialKind=…` (`MaterialsController.list`).
> Миграция `2026-08-04-TZ-CATALOG-301-material-fields.ts` бэкфилит legacy rows на `kind = 'other'` idempotent.
> **FE типы/форма/фильтр этих полей — TZ-CATALOG-316 DONE** (это же описание страницы).

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `MaterialFormDialogComponent` | create / edit | `null` / `Material` |
| `AlertDialogComponent` | confirm delete | `{ title, description, confirmLabel, variant }` |

В поле «Поставщик» показываются только активные организации с типом `supplier`.
Пустой список не выглядит как обычный пустой dropdown: под селектом отображается
подсказка «Нет поставщиков — создайте организацию с типом Поставщик» со ссылкой
на `/organizations`. Ошибка загрузки показывается под селектом; во время загрузки
селект отключён и выводится короткая подсказка.

Секция «Габариты» занимает полную ширину на мобильном экране и примерно половину
ширины тела диалога на desktop (`lg:w-1/2`, `max-w-xl`). Типы, значения и флаг
«Неизменяемый» остаются в одной читаемой строке.

## Services

| Сервис | Методы |
|--------|--------|
| `MaterialsService` | `list(params)`, `findById(id)`, `create(payload)`, `update(id, payload)`, `remove(id)`, **`duplicate(id)`** (TZ-MATERIALS-310) |
| `OrganizationsService` | `list({ type: 'supplier', limit: 200 })` — lookup организаций-поставщиков |
| `PhotosService` | `list()` — для lookup фото |
| `CategoriesService` | `list('material')` — активные категории и префиксы внутреннего кода |

## Lookup tables

| Lookup | Источник | Ключ |
|--------|----------|------|
| `suppliersLookup` | `orgs.list({ type: 'supplier', limit: 200 })` | `Organization._id` |
| `photosLookup` | `photos.list()` | `Photo._id` |

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `pageSig` | `Signal<number>` | Текущая страница (1-indexed) |
| `search` | `SearchState` | Debounced поиск (300ms) |
| `kindFilterSig` | `Signal<MaterialKind \| null>` | **TZ-CATALOG-316** — фильтр `?materialKind=` (null = «Все типы») |
| `listRes` | `HttpResource<MaterialsListResponse>` | GET /api/materials |

## Computed

| Computed | Трансформация |
|----------|--------------|
| `listParams` | `{ page, limit: 10, search?, materialKind? }` |
| `data` | `listRes.value()?.items ?? []` |
| `total` | `listRes.value()?.total ?? 0` |
| `loading` | `listRes.isLoading()` |
| `error` | `extractErrorMessage(listRes.error())` |
| `debouncedSearch` | публичный (для теста) |
| `kindFilter` | публичный (read-only alias на `kindFilterSig`) |

## Cell templates (pi-table)

| Имя | Колонка | Назначение |
|-----|---------|-----------|
| `photoTpl` | `mainPhotoId` | `<img>` или `<pi-empty-tile>` |
| `supplierTpl` | `supplierId` | Название организации (lookup) |
| `kindTpl` | `materialKind` | **TZ-DICT-320 / CATALOG-316** — подпись из общего `PiDictionaryLabelsService` (`сырьё`, `деталь`…); для legacy без kind — пусто (empty-cell) |
| `dimsTpl` | `dimensions` | `Д. 3000мм × Ш. 2000мм × Т. 2мм` |
| `stockTpl` | `stockQty` (legacy-key) | **TZ-MATERIALS-308** — ссылка «Склад →» на `/storage-items?materialId=<id>` |
| `rowActionsTpl` | (actions) | Copy / Edit / Delete (TZ-MATERIALS-310 добавил copy slot) |

## Идентификация: «Артикул» vs «Внутренний код материала»

- **Артикул** (`article`) — обязательный пользовательский/внешний код (поставщик, каталог клиента), уникальный внутри организации. Пустое значение отклоняется, дубликат даёт HTTP 409 «Артикул уже используется».
- **Внутренний код материала** (`sku`) — необязательный уникальный системный идентификатор для поиска (`$or: [name, article, sku]`) и связей; при отсутствии может быть сгенерирован через CounterService.

Legacy-строки без артикула остаются читаемыми до backfill; новые create/update их не допускают.
  Уникальность гарантируется сервером: Mongo `unique: true, sparse: true` + E11000 → HTTP 409 (не 500).
  Пользователь может ввести его вручную; если поле пустое и выбрана активная категория типа `material` с префиксом,
  сервер создаёт код через атомарный counter в формате `PREFIX-YYYY-NNN`. Локальной генерации на клиенте нет.
  Категория передаётся как `categoryId`, а при редактировании populated-ссылка нормализуется в ID без потери значения.
  Активная категория с другим типом, отключённая категория или категория без префикса отклоняются до создания материала.

## Column definitions (10 колонок)

`mainPhotoId` (96px, center) → `name` (sticky, sortable) → `article` (sortable) → `sku` (sortable) → `unit` (sortable, 60px) → **`materialKind`** (**TZ-CATALOG-316**, 110px, cellTemplate «Тип» — сырьё/деталь/метиз/покупное/другое; legacy без kind — пусто с `empty-cell`) → `supplierId` (cellTemplate) → `dimensions` (cellTemplate) → `pricePerUnit` (sortable, numeric, right) → `stockQty`-key (cellTemplate «Склад», TZ-MATERIALS-308)

> **Остаток (TZ-MATERIALS-304):** числовая колонка `stockQty` убрана из списка материалов — остаток
> управляется только в разделе «Склад» (`StorageItem.quantity`, приходы/расходы). `Material.stockQty`
> остаётся в schema/DTO как legacy (backward compatibility), не отображается и не вводится.
> **TZ-MATERIALS-308:** вместо числовой колонки добавлена read-only ссылка «Склад →», ведущая на
> `/storage-items?materialId=<id>` (остатки этого материала). Ключ колонки — legacy `stockQty`
> (ColumnDef.key требует `keyof Material`; виртуальные ключи типом запрещены).
> Связь материал→склад реализована: `StorageItem.materialId` (XOR с `productId`), приход/расход
> через stock-movements, метрики inventory-dashboard учитывают материал-позиции.

## TZ reference

| TZ | Что сделано |
|----|------------|
| **TZ-CATALOG-373** | **Витрина-паритет products**: view toggle list↔grid + `pi-materials-view-mode` (F5), filters-rail (Тип из того же signal + Сбросить), grid `PiShowcaseCard` с pager; rail sort — known_limitation (backend без sortBy) |
| TZ-104.3 | Миграция на pi-table + lookup tables |
| TZ-104.4.2 | Typed TemplateRef (устранён `any`) |
| TZ-117 | httpResource миграция + unit test precedent |
| TZ-MATERIALS-303 | Понятный код/идентификация (article vs sku) |
| TZ-MATERIALS-307 | Серверная генерация SKU через CounterService |
| TZ-MATERIALS-310 | **Кнопка «Копировать»** (server-side clone, без фото) |
| **TZ-MATERIALS-308** | **Связка материал→склад**: колонка-ссылка «Склад», фильтр `?materialId=` на остатках |
| **TZ-CATALOG-301** | **Backend-only**: `materialKind` + `assortment` + `standardRef` + `materialGrade` + `weightKg` + filter `?materialKind=` + legacy migration к `other` (idempotent). Predecessor для 316. |
| **TZ-CATALOG-316** | **FE Material §301**: расширил `Material` interface + payload + filter; `MaterialFormDialogComponent` — секции «Тип материала / Масса, кг» (left) и «Сортамент / Стандарт / Марка» (right), валидация `weightKg ≥ 0`; 10-я колонка «Тип» на `/materials`; toolbar-фильтр по kind. UX-FORM-CANON, Paper & Ink. |

## Кнопка «Копировать» — TZ-MATERIALS-310

`POST /api/materials/:id/duplicate` создаёт server-side clone с тем же контрактом, что
`DocumentTemplate.duplicate` и `ProductService.clone`:

| Поле | Поведение |
|------|-----------|
| `name` | `${source.name} (копия)`, truncate до 256 символов, если переполнение |
| `sku` | перегенерируется через `CounterService.next('Material', category.skuPrefix)` если у категории есть `skuPrefix`; **не копируется** с исходника (защита от коллизий) |
| `article` | получает суффикс `-COPY` (обрезается до 64 символов), чтобы клон не нарушал уникальность внутри организации |
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
- **Kind labels** — toolbar filter, FullEditor, detail and composition picker use the same cached `PiDictionaryLabelsService`; API failure shows seed fallback and one RU warning
- **Фото:** `mainPhotoOf(row)` — проверяет string | populated object; `mainPhotoUrl(row)` пропускает URL через общий `photoListUrl` и выбирает linked `thumb`, иначе original
- **Габариты:** `dimensionsSummary(row)` — `L 3000мм × W 2000мм × T 2мм`; в форме блок ограничен половиной ширины на desktop.
- **Refresh on dialog close:** 3 стрима: `suppliersLookup.load()` + `photosLookup.load()` + `listRes.reload()`
- **Copy row action** — slot order в `PiRowActionsComponent`: Copy → Document → Edit → Delete
  (TZ-MATERIALS-310 ввёл copy slot как левый-most, потому что это наименее-mutative действие)
- **Unit test exists:** `materials.page.spec.ts` — тестирует httpResource auto-refire

---

_Создано: 2026-07-19. Последнее обновление: 2026-08-15 (TZ-CATALOG-373: view toggle list↔grid + `pi-materials-view-mode`, filters-rail, grid-витрина `PiShowcaseCard`; TZ-MATERIALS-312: supplier empty/error/loading states и desktop half-width «Габариты»; TZ-PHOTO-302: list/grid URL через `photoListUrl`, thumb для каталогов с fallback на original; TZ-CATALOG-316 → FE §301: kind/weightKg/assortment/standardRef/materialGrade, колонка «Тип», toolbar-фильтр)._
