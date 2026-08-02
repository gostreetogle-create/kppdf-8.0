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

`ProductFormDialogComponent` (TZ-PRODUCTS-302) — большой content-диалог
(`variant="content"` + `maxWidth 1000px`, sticky footer через PiDialog
contract). Поля сгруппированы по eyebrow-секциям: «Основные данные»
(name/sku/kind/unit/subcategory/status), «Категория и цены» (categoryId
из `CategoriesService.list('product')` + listPrice + isActive), «Габариты»
(L/W/H+unit), «Дополнительно» (weightKg + Цвет/RAL), «Изображения»
(photo upload по паттерну TZ-MATERIALS-306; `photoIds`), «Описание и
заметки».

## RAL / ColorReference integration (TZ-PRODUCTS-302)

- Цвет продукта выбирается **только** из справочника цветов
  (`ColorReferencesService.list({ activeOnly: true })`, endpoint
  `/api/color-references` из TZ-PRODUCTS-301). Свободный ввод не допускается.
- Значение опции — `slug` цвета; payload сохраняет backend-контракт строки
  `ralCode` (поля `colorId` в backend Product **нет** — это SUCCESSOR для
  TZ-PRODUCTS-303).
- Дефолтный выбор: системный цвет «Не выбран» (`SYSTEM_DEFAULT_COLOR_SLUG`
  = `ne-vybran`, seed TZ-PRODUCTS-301) авто-выбирается после успешной
  загрузки, если цвет не задан. Submit без цвета → `ralCode` падает на
  `SYSTEM_DEFAULT_COLOR_SLUG`.
- Рядом с селектом — swatch-превью выбранного hex (`selectedColorHex()`).
- Loading / error / empty состояния; при пустом справочнике — подсказка
  и кнопка «Открыть справочник цветов» (`/color-references`).
- Legacy `ralCode` (например «RAL 9003»), отсутствующий в справочнике,
  рендерится как disabled fallback-опция (паттерн unitFallback из
  TZ-MATERIALS-302) — edit не обнуляет значение молча.

## Services

| Сервис | Методы |
|--------|--------|
| `ProductsService` | `list(params)`, `findById(id)`, `create(payload)`, `update(id, payload)`, `remove(id)` |
| `ColorReferencesService` | `list({activeOnly})`, `findById(id)`, `create`, `update`, `remove` |
| `CategoriesService` | `list(type)` — type `'product'` для categoryId |
| `PhotosService` | `upload(file)`, `list()`, `remove(id)` — фото продукта |

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
| TZ-PRODUCTS-302 | Content-диалог 1000px, секции, categoryId select, RAL dropdown, фото |
| TZ-PRODUCTS-303 | Секция «Модули в составе»: карточки привязанных модулей + атомарная синхронизация |

## Редактор модулей в диалоге товара (TZ-PRODUCTS-303)

Секция «Модули в составе» в `product-form-dialog.component.ts` реализует M:N
привязку модулей к товару карточками (паттерн TZ-MODULES-301):

- **Карточка модуля** — имя, артикул, количество материалов в составе, кнопка
  удаления (×). Пустое состояние: «Нет модулей в составе».
- **Кнопка «+ Добавить модуль»** — открывает существующий
  `ProductModulePickerDialogComponent` с `excludeIds` = текущий выбор
  (уже привязанные недоступны — дубликат невозможен).
- **Каталог** загружается один раз через `ProductModulesService.list()`;
  карточки рендерятся из `selectedModuleIds` + каталога (`attachedModules` computed).
- **Сохранение — атомарные endpoints** (не bulk PATCH):
  `POST /products/:id/modules {moduleId}` и `DELETE /products/:id/modules/:moduleId`
  (`ProductModulesService.attachToProduct` / `detachFromProduct`).
  Причина: `UpdateProductDto` (whitelist) не содержит `productModuleIds` —
  bulk PATCH вернул бы 400. Синхронизация на submit — diff снапшота при
  открытии vs финальный выбор: attach добавленных + detach удалённых.
- **Ошибки синхронизации** не блокируют закрытие диалога (товар уже сохранён),
  но показываются toast-ом.

Контракт: `ProductModule` (pi-product-modules.service.ts) — `_id, name, article?,
workTypes[], materials[]`. Backend M:N через `Product.productModuleIds[]`
(populate в findById, reverse-lookup `GET /modules?productId=X`).

## Особенности

- **Server-side pagination** — backend принимает `page/limit` + возвращает `{ items, total, page, limit }`
- **Server-side sort** — `localSort=false`, pi-table не сортирует page slice
- **Lockstep sort signals** — `sortKeySig` + `sortDirSig` синхронизированы с pi-table internal state
- **Сброс page на search** — `pageSig.set(1)` при изменении поиска
- **Сброс page на sort** — `pageSig.set(1)` при изменении сортировки
- **Format functions:** `formatPrice()` для `listPrice`, `KIND_LABELS`/`STATUS_LABELS` для enum-полей
- **Refresh on dialog close:** `onDialogCloseOnce` → `listRes.reload()`

---

_Создано: 2026-07-19. Последнее обновление: 2026-08-02 (TZ-PRODUCTS-302)._
