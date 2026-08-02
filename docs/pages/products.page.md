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

`name` (sticky, sortable, cellTemplate) → `sku` (sortable) → `kind` → `unit` → `listPrice` (sortable, numeric, right) → `status` (sortable) → `productModuleIds` «Модулей» (numeric, right, TZ-PRODUCTS-304) → `stockQty` (numeric, right)

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-104.3 | Миграция на pi-table + server-side pagination |
| TZ-104.4.2 | Typed TemplateRef (устранён `any`) |
| TZ-PRODUCTS-302 | Rework ProductFormDialog → content-variant 1000px, секции, RAL dropdown из справочника цветов |
| TZ-PRODUCTS-303 | «Модули в составе» в диалоге товара: карточки модулей + мульти-picker + атомарные POST/DELETE |
| TZ-PRODUCTS-304 | Expandable-строки каталога: клик по строке разворачивает карточки модулей, ссылка на `/modules/:id` |

## Особенности

- **Server-side pagination** — backend принимает `page/limit` + возвращает `{ items, total, page, limit }`
- **Server-side sort** — `localSort=false`, pi-table не сортирует page slice
- **Lockstep sort signals** — `sortKeySig` + `sortDirSig` синхронизированы с pi-table internal state
- **Сброс page на search** — `pageSig.set(1)` при изменении поиска
- **Сброс page на sort** — `pageSig.set(1)` при изменении сортировки
- **Format functions:** `formatPrice()` для `listPrice`, `KIND_LABELS`/`STATUS_LABELS` для enum-полей
- **Refresh on dialog close:** `onDialogCloseOnce` → `listRes.reload()`

## ProductFormDialog (TZ-PRODUCTS-302)

`ProductFormDialogComponent` переработан из компактного form-variant в широкий
content-DSL (паттерн TZ-MATERIALS-301): `variant="content"` +
`[maxWidth]="'1000px'"`, body со скроллом и ВСЕГДА видимый sticky footer
(«Сохранить» / «Отмена»).

**Секции формы (по порядку):** Основные данные (name/sku/kind/unit/status) →
Категория (dropdown из `CategoriesService.list('product')`) → Цены (listPrice/
isActive) → Габариты (L/W/H + единица) → **Цвет (RAL)** → **Модули в составе** →
Вес → Описание и заметки → Изображения (фото-upload, паттерн TZ-MATERIALS-306).

**RAL contract (TZ-PRODUCTS-301/302):**

- Список активных цветов грузится из `PiColorReferencesService.list({ activeOnly: true })` (кэш активного каталога).
- Значение опции = `ColorReference.slug` (стабильный ключ); системный «Не выбран» (`ne_vybran`) очищает `ralCode` → `null`.
- В dropdown есть поиск по name/slug; пустой справочник показывает hint + ссылку на `/dictionaries/color-references` (только admin/manager).
- Legacy-значение `ralCode` (не в активном списке) рендерится disabled-fallback — селект никогда не пуст молча.

**Регрессия:** legacy create/update payload-логика и data-test атрибуты сохранены;
добавлены `categoryId` и `photoIds`. Загруженные в сессии фото удаляются при
cancel (orphan cleanup в `ngOnDestroy`).

## «Модули в составе» (TZ-PRODUCTS-303)

Секция встроена в диалог товара (между «Цвет (RAL)» и «Описание»), паттерн
TZ-MODULES-301 (карточки-строки, как material-cards в module-detail).

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
привязанных модулей (паттерн TZ-MODULES-302: pi-table `expandedRow` +
сигнал `expandedId` + conditional template на странице).

- **Состояние:** `expandedId: signal<string | null>` — `_id` развёрнутого
  товара; повторный клик по той же строке сворачивает (null).
- **Подключение:** `(rowClick)="onRowClick($event)"` (pi-table эмитит строку)
  + `[expandedRow]="expandedId() ? expandedTpl : null"` — свёрнутые строки
  БЕЗ пустых `<tr>` (template передаётся только при развёрнутой строке).
- **Развёрнутый контент** (`#expandedTpl`): карточки модулей — инициалы-аватар
  (у `GET /modules` нет фото — отдельная сущность `ProductModulePhoto`), имя,
  артикул, «N материалов»; клик по карточке → `routerLink` `/modules/:id`
  (route существует, app.routes.ts).
- **Empty state:** «Нет модулей в составе. Откройте товар, чтобы привязать
  модули.»
- **Колонка «Модулей»:** count из `productModuleIds.length` (numeric, right).
- **Row-actions НЕ раскрывают строку:** pi-table сам делает
  `stopPropagation` на actions `<td>`; ссылка-название товара тоже
  `stopPropagation` (навигация на `/products/:id` сохранена — отдельный
  аффорданс, не конфликтует с toggle).
- **Backend НЕ менялся:** `list()` уже populate `productModuleIds`
  (product.service.ts:72).

---

_Создано: 2026-07-19. Последнее обновление: 2026-08-02._
