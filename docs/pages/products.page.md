# Страница: Продукция (ProductsPage)

**Краткое описание:** Список продукции с серверной пагинацией, поиском и сортировкой. CRUD-операции через диалоги.

## TZ-CATALOG-332 — визуальный маркер типа

Имя каждой строки получает тонкую вертикальную полоску `product` из общей палитры `catalogKindOklch`. Это UI-легенда типа изделия, а не `ralCode` и не физический цвет товара. Маркер остаётся сдержанным, чтобы таблица не превратилась в набор разноцветных карточек.

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
| POST | `/api/products/:id/duplicate` | Безопасная копия изделия в scope организации; optional overrides: name/description/unit/sku (TZ-CATALOG-371) |
| GET | `/api/products/:id/composition` | Состав (dual-read: composition, иначе legacy productModuleIds) |
| POST | `/api/products/:id/composition` | Добавить/upsert линию состава (TZ-CATALOG-302/317) |
| PATCH | `/api/products/:id/composition/:lineId` | Обновить линию (quantity и др.) |
| DELETE | `/api/products/:id/composition/:lineId` | Удалить линию состава |
| DELETE | `/api/products/:id` | Удаление (soft delete) |

> **TZ-CATALOG-317:** UI пишет состав только через composition-эндпоинты.
> Legacy `POST/DELETE /api/products/:id/modules` (attach/detach) deprecated →
> `ProductModulesService.attachToProduct/detachFromProduct` бросают ошибку. Список
> и detail читают состав dual-read: непустой `composition` имеет приоритет над
> `productModuleIds`.

Ответ GET: `{ items: Product[], total: number, page: number, limit: number }`

## Идентификация изделия (TZ-CATALOG-338)

`sku` — обязательный артикул изделия, уникальный внутри организации; пустые и пробельные значения отклоняются до сохранения, а конфликт возвращается как HTTP 409 с сообщением «Артикул уже используется». `name` необязательно: список и detail показывают `sku` как fallback, если название пустое. Старые строки без артикула остаются читаемыми и требуют backfill перед редактированием с изменением `sku`.

## Safe product duplicate (TZ-CATALOG-371)

`POST /api/products/:id/duplicate` выполняется внутри scope текущей организации и возвращает новый `Product` с `copiedFromProductId`, новым collision-safe SKU и независимыми embedded composition/EAV values. Фото, category и module refs остаются ссылками на существующие сущности; binary assets не копируются. По умолчанию копия получает имя `<имя> — копия`, `stockQty=0`, `status=draft`, `isActive=true`, `isSystem=false`. Явно занятый SKU даёт HTTP 409; archived/deleted/cross-organization source не раскрывается.

`PATCH /api/products/:id` принимает необязательный `expectedVersion`; при stale `__v` возвращается HTTP 409 без записи. Старые callers без этого поля сохраняют прежний контракт. UI не меняет Product на blur: этот typed client предназначен для явных решений snapshot workflow TZ-SALES-372.

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `QuickCreateDialogComponent` | **create** (TZ-DICT-316) | `{ entity: 'product', size?: 'S'\|'M'\|'L' }` — default M; profile from `/form-profiles` |
| `ProductFormDialogComponent` | **create/edit** (FullEditor «Изделие») | `Product` |
| `AlertDialogComponent` | confirm delete | `{ title, description, confirmLabel, variant }` |

## Services

| Сервис | Методы |
|--------|--------|
| `ProductsService` | `list(params)`, `findById(id)`, `create(payload)`, `update(id, payload)`, `duplicate(id, overrides?)`, `remove(id)` |
| `ProductModulesService` | `getProductComposition(id)`, `addProductCompositionLine(id, dto)`, `updateProductCompositionLine(id, lineId, dto)`, `removeProductCompositionLine(id, lineId)` (composition CRUD) |
| `ProductModulesService` (deprecated) | `attachToProduct` / `detachFromProduct` — бросают ошибку (TZ-CATALOG-317) |

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
| `listParams` | `{ page, limit: 10, search?, sortBy?, sortOrder? }` |
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

`name` (sticky, sortable, cellTemplate) → `sku` (sortable) → `kind` → `unit` → `listPrice` (sortable, numeric, right) → `status` (sortable) → `productModuleIds` «Модулей» (numeric, right, TZ-PRODUCTS-304) → `stockQty` (numeric, right)

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-104.3 | Миграция на pi-table + server-side pagination |
| TZ-104.4.2 | Typed TemplateRef (устранён `any`) |
| TZ-PRODUCTS-302 | Rework ProductFormDialog → content-variant 1000px, секции, RAL dropdown из справочника цветов |
| TZ-PRODUCTS-303 | «Модули в составе» в диалоге товара: карточки модулей + мульти-picker + атомарные POST/DELETE |
| TZ-PRODUCTS-304 | Expandable-строки каталога: клик по строке разворачивает карточки модулей, ссылка на `/modules/:id` |
| TZ-UI-TABLE-303 | Shared Expandable contract: active-row predicate, single-expand behavior, keyboard/a11y semantics |
| TZ-PRODUCTS-305 | Карточки-витрины: toggle list ↔ grid (sm showcase-карточки, localStorage persistence) |

## Особенности

- **Server-side pagination** — backend принимает `page/limit` + возвращает `{ items, total, page, limit }`
- **Server-side sort** — `localSort=false`, pi-table не сортирует page slice
- **Lockstep sort signals** — `sortKeySig` + `sortDirSig` синхронизированы с pi-table internal state
- **Сброс page на search** — `pageSig.set(1)` при изменении поиска
- **Сброс page на sort** — `pageSig.set(1)` при изменении сортировки
- **Format functions:** `formatPrice()` для `listPrice`, `PiDictionaryLabelsService` для API-backed подписи вида (fallback seed labels), `STATUS_LABELS` для статусов
- **Refresh on dialog close:** `onDialogCloseOnce` → `listRes.reload()`

## ProductFormDialog — FullEditor «Изделие» (TZ-PRODUCTS-308)

`ProductFormDialogComponent` — единый FullEditor для создания и редактирования
изделия: `variant="content"` + `[maxWidth]="'min(1120px, calc(100vw - 2rem))'"`,
body со скроллом и всегда видимый sticky footer («Сохранить» / «Отмена»).
Пользовательские заголовки, вид `good` и уведомления используют подпись из `PiDictionaryLabelsService`; ключ `Product`, API и `/products` не переименовываются.

На desktop основные блоки стоят в три колонки: «Основные» (name/sku/kind/status/
isActive), «Цена и учёт» (listPrice/category/subcategory), «Габариты и цвет»
(Д/Ш/В, единицы, вес и RAL). На mobile колонки складываются в стек. Поля
габаритов, веса, единиц и цвета ограничены по ширине; описание, заметки и фото
остаются полноширинными ниже. В режиме редактирования ниже паспорта встроен тот
же `ProductBomPanel`, что и на карточке, в bounded scrollable panel; create mode
показывает подсказку «Сначала сохраните изделие — затем откройте редактирование,
чтобы собрать состав.» Паспортный payload и composition write-path разделены. Nested-редактирование изделия из состава загружает `ProductFormDialogComponent` динамически, чтобы не возвращать статический цикл с `ProductBomPanel` (`ɵcmp`).

**RAL contract (TZ-PRODUCTS-301/302):**

- Список активных цветов грузится из `PiColorReferencesService.list({ activeOnly: true })` (кэш активного каталога).
- Значение опции = `ColorReference.slug` (стабильный ключ); системный «Не выбран» (`ne_vybran`) очищает `ralCode` → `null`.
- В dropdown есть поиск по name/slug; пустой справочник показывает hint + ссылку на `/dictionaries/color-references` (только admin/manager).
- Legacy-значение `ralCode` (не в активном списке) рендерится disabled-fallback — селект никогда не пуст молча.

**Регрессия:** legacy create/update payload-логика и data-test атрибуты сохранены;
добавлены `categoryId` и `photoIds`. Загруженные в сессии фото удаляются при
cancel (orphan cleanup в `ngOnDestroy`).

## «Модули в составе» — исторический контракт TZ-PRODUCTS-303

Этот старый вариант секции оставлен как историческая справка. Он заменён общим
`ProductBomPanel` и composition API: актуальный вход из FullEditor описан выше,
а текущий UI и write-path совпадают с карточкой изделия.

Исторически секция встраивалась в диалог товара между «Цвет (RAL)» и
«Описание» по паттерну TZ-MODULES-301 (карточки-строки, как material-cards в
module-detail).

- **Карточка модуля:** нейтральная миниатюра (у `GET /modules` нет фото — это
  отдельная сущность `ProductModulePhoto`), имя, артикул, «N материалов»,
  кнопка «×» (удалить из черновика).
- **«+ Добавить модуль»** открывает `ProductModulePickerDialogComponent` в
  мульти-режиме (`data.multi=true`, variant="content", 1000px) — чекбокс-список
  доступных модулей (уже привязанные исключены через `excludeIds`), возвращает
  `string[]`. Обратно совместим: без `multi` остаётся классический
  single-select для `product-detail.page.ts`.
- **Состояния:** loading / error / empty по образцу RAL dropdown
  (TZ-PRODUCTS-302) — каталог грузится в `loadModules()` на mount.
- **Dirty tracking:** добавление/удаление карточки помечает форму `dirty` →
  «Сохранить» активна.
- **Submit-контракт (зафиксирован по коду):** bulk PATCH с `productModuleIds[]`
  НЕ поддерживается (`CreateProductDto` не содержит поля — whitelist выбросит).
  Используются атомарные endpoints (race-safe, `$addToSet`/`$pull`):
  - `POST /products/:id/modules` body `{ moduleId }` — attach
    (`backend/src/modules/product/product.controller.ts:128-132`)
  - `DELETE /products/:id/modules/:moduleId` — detach
    (`product.controller.ts:147-151`)
  После успешного create/update `syncModules()` считает diff исходных привязок
  против черновика: удалённые → DELETE, добавленные → POST; все через
  `PiProductModulesService.attachToProduct/detachFromProduct`.
- **Legacy:** старые товары с `productModuleIds[]` (populated в list/findById)
  открываются и редактируются без потери привязок.

## Expandable-строки (TZ-PRODUCTS-304)

Клик по строке товара в каталоге РАЗВОРАЧИВАЕТ/СВОРАЧИВАЕТ список
привязанных модулей (shared `app-pi-table` Expandable contract: `expandedRow`
+ `expandedRowWhen` predicate + `expandedId` signal + conditional template).

- **Состояние:** `expandedId: signal<string | null>` — `_id` развёрнутого
  товара; повторный клик по той же строке сворачивает (null).
- **Подключение:** `(rowClick)="onRowClick($event)"` (pi-table эмитит строку)
  + `[expandedRow]="expandedTpl"` + `[expandedRowWhen]="isExpandedRow"` —
  kit создаёт ровно одну detail-row для активного товара, без пустых строк.
- **A11y:** expandable rows expose `tabindex="0"`, `aria-expanded`, Enter/Space
  activation; detail region is named «Состав товара: {name}».
- **Развёрнутый контент** (`#expandedTpl`): tray `var(--color-gold-soft)` +
  левый gold border; сетка `1 / 2 / 3` колонки; карточка — badge «мод»
  (`catalogKindOklch`), имя/артикул `line-clamp-2`, «N материалов»;
  клик → `routerLink` `/modules/:id`. Nested hierarchy (module→children) —
  **TZ-PRODUCTS-307**.
- **Expanded chrome (TZ-UX-319):** kit `app-pi-table` ставит `pi-table-row--open`
  на data-row; ink-рамка (~1.5px `var(--color-ink)`) оборачивает пару
  data-row + `expanded-row` как один кадр; соседние data-rows приглушены
  (`opacity ~0.5`) пока одна раскрыта. Expand API / `expandedId` не менялись.
- **Empty state:** «Нет модулей в составе.»
- **Колонка «Модулей»:** count из `productModuleIds.length` (numeric, right).
- **Row-actions НЕ раскрывают строку:** pi-table сам делает
  `stopPropagation` на actions `<td>`; ссылка-название товара тоже
  `stopPropagation` (навигация на `/products/:id` сохранена — отдельный
  аффорданс, не конфликтует с toggle).
- **Backend НЕ менялся:** `list()` уже populate `productModuleIds`
  (product.service.ts:72).

## Карточки-витрины / toggle list ↔ grid (TZ-PRODUCTS-305, SALES-327)

`PiShowcaseCard` — единый card-system для каталога и будущей витрины Create КП:
`sm` для компактных строк, `md` для shop-grid/Create КП, `lg` для detail. Размер `md`
является stretchable flex-column плиткой: title и description зажаты до двух строк,
media фиксирован в пропорции 16:9 с `object-fit: cover`, а actions прижаты к низу.
Пустой `mediaUrl` сохраняет ту же геометрию нейтральным placeholder; URL фото берётся
через общий `photoListUrl` (thumb/list pipeline), второй photo pipeline не создаётся.

Каталог товаров получил переключение вида: **list** (pi-table, дефолт) ↔
**grid** (md showcase-карточки с `mediaUrl` из populate `photoIds`).
Переиспользуемый `PiShowcaseCardComponent`.
(три размерных варианта sm/md/lg, `shared/ui/card/pi-showcase-card.component.ts`,
перенесён идентичным контентом из part-1 `e00be99`) — общий UI Kit для
карточек-витрин товара/модуля/материала.

- **Toggle в тулбаре:** кнопки `ListIcon` / `GridIcon` (lucide), `data-test`
  `view-list-button` / `view-grid-button`, `aria-pressed` для a11y.
- **Состояние:** `viewMode: signal<'list' | 'grid'>`, выбор персистится в
  localStorage (`pi-products-view-mode`) — паттерн `snapSettings` из builder
  (load/save в try/catch, дефолт `list`).
- **Grid-вид:** сетка `grid-cols-1 md:2 xl:3 gap-4`; каждая ячейка —
  `<a [routerLink]="['/products', id]">` с `app-pi-showcase-card size="md"`:
  - `mediaUrl` — URL первого populate-фото через общий `photoListUrl`: linked `thumb`, если он есть, иначе original;
  - `eyebrow` — вид; `title` — название; `description` — подкатегория · N мод.;
  - `sc-actions-md` — цена + ед.; pager под сеткой при `total > pageSize`;
  - loading / empty (`grid-loading` / `grid-empty`).
- **Таблица (2026-08-07):** Фото · Название · Ед. · Цена · Модулей
  (без SKU / Вид / Статус / Остаток).
- **Фильтры:** select статус/активность/категория в tools + левая полоска
  `filters-rail` (`w-12` → панель с теми же фильтрами + сортировка).
- **Оверлей фильтров (канон, не ломать):**
  1. Затемнение (`filters-backdrop`) только на **колонке контента**, не на рейле/панели.
  2. Панель `z-40` + непрозрачный `bg-paper` — **не** под `bg-ink/…` (иначе селекты «тусклые» и клик закрывает оверлей).
  3. Закрытие: клик по backdrop / «Закрыть»; клик и `change` внутри панели **не** закрывают.
  4. Панель достаточно высокая (`min-h` + scroll), чтобы 4 селекта не жались.
- **Template-refs** на корне — `@ViewChild({ static: true })` независимо от viewMode.
- **API list:** `status`, `isActive`, `categoryId` + search/sort/page.

---

_Создано: 2026-07-19. Последнее обновление: 2026-08-07 (filters overlay z-index / panel above dim)._

## Состав изделия (TZ-CATALOG-320)

Изделие может содержать `module`, `material` только с `materialKind != raw`, и `product` (комплекс). Детали, метизы и покупные позиции — это `Material` с kind `part`, `fastener`, `purchased` или `other`, отдельной сущности Part нет. Пикер исключает текущее изделие и сырьё; для product-линии доступен неотрицательный `unitPriceOverride`. Полное lazy-дерево и редактор состава доступны на страницах изделия и модуля.

## Related

- Detail route: [`product-detail.page.md`](./product-detail.page.md)
- Composition FE cutover: **TZ-CATALOG-317** (после 302; GATE до 304)
- Soft-delete list filter: **TZ-CATALOG-314**
