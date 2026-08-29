# Страница: Конструктор документов (BuilderPage)

> **Назначение:** 3-панельный редактор шаблона: **левая палитра** (icon rail + flyout),
> canvas (центр), инспектор (справа). Тулбар сверху — назад / title / категория /
> Редактор·Превью / статус сохранения. Не путать с устаревшей «верхней горизонтальной палитрой».
>
> При правках — читай этот файл первым. Вкус PO: [`../PO-DIARY.md`](../PO-DIARY.md).

---

## Route

```
/doc-constructor/builder                     → редирект на /doc-constructor/templates (TZ-DOC-324)
                                              (без :id не показывается — реестр единый)
/doc-constructor/builder/:id                 → редактор конкретного шаблона
```

App layout: **denseMain** — без `pt-page-y` и без site footer (flush под header).

## Query params

| Параметр | Тип | Назначение |
|----------|-----|-----------|
| `source` | `string` | Источник контекста (order/quotation/contract/invoice) |
| `sourceId` | `string` | ID источника |
| `category` | `string` (ObjectId) | Фильтр «Текстов» по `TextBlockCategory._id` в tool-pane picker и в inline toolbar dropdown (TZ-DOC-317). `null`/отсутствие = «Все». Двусторонняя синхронизация с `BuilderTextFilterService.categoryId` через `effect()` + `Router.navigate({ queryParamsHandling: 'merge', replaceUrl: true })` — refresh страницы сохраняет выбор. При смене `:id` шаблона фильтр сбрасывается на «Все». |
| `returnUrl` | `string` (same-origin path) | Куда «←» возвращает из конструктора (TZ-UX-316). Из Create КП приходит `/proposals/create[?id=…]`. Валидируется: только absolute same-origin path (без `//host` и схем). Без него — smart-back через `CatalogReturnStore` с fallback на `/doc-constructor/templates`. |

## Layout contract (canvas-layout-layer)

> TZ-DOC-STUDIO-101 · ADR [`../architecture/document-studio.md`](../architecture/document-studio.md)

Builder canvas uses **normalized `layout`** (`x/y/width/height` as page fractions) as the canonical geometry contract — not legacy overlay-only positioning. Positioned blocks render in the **canvas-layout-layer**; legacy `settings.overlay` is migrated to `layout` via `legacyOverlayToLayout`.

| Layer | Role |
|-------|------|
| `canvas-layout-layer` | Positioned blocks (drag/resize/z-index) |
| Preview iframe | Server `build()` HTML — separate from edit geometry |

**FE/BE parity:** `shared/template-block/template-block-layout.ts` mirrors `backend/.../template-block-layout.ts`. Page field exists for multipage (Wave 9+); both sides clamp to page `1` until page containers ship. Merge to shared package — Wave 2a/3 controlled extract, not Wave 1.

---

## Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Toolbar: ← Шаблоны | title | category | [Редактор|Превью] | save chip   │
├────┬─────────────────────────────────────────────────┬───────────────────┤
│ 48 │  Canvas (pi-canvas-page)                         │ Inspector 320px   │
│rail│  ├─ canvas-dropzone      (flow / legacy)        │ Геометрия + lock  │
│+fly│  ├─ canvas-layout-layer  (BlockLayout absolute) │                   │
│    │  └─ canvas-overlay-layer (legacy image overlay) │                   │
└────┴─────────────────────────────────────────────────┴───────────────────┘
```

### Canvas layers (TZ-259 / DOC-STUDIO-101)

Canonical positioning uses **`TemplateBlock.layout`** (`BlockLayout`: normalized x/y/width/height on page 1). The builder renders three stacked layers inside `pi-canvas-page`:

| Layer | DOM class | Blocks | Positioning |
|-------|-----------|--------|-------------|
| Flow (legacy) | `.canvas-dropzone` | Blocks **without** `layout` and not overlay images | CDK reorder, margin/width % |
| **Layout (primary)** | `.canvas-layout-layer` | Blocks **with** `layout` | Absolute % geometry; drag/resize; snap-engine |
| Overlay (legacy) | `.canvas-overlay-layer` | `type=image` + `settings.overlay=true` without migrating to `layout` | px overlayLeft/Top, imageWidth/Height |

Server HTML render (`DocumentRenderService`) and builder preview both consume the same normalized `layout` contract via `normalizeBlockLayout` (page clamped to **1** until multipage containers ship). Legacy overlay settings remain supported via `legacyOverlayToLayout` but new geometry should use `layout`.

Shared layout math: `frontend/src/app/shared/template-block/template-block-layout.ts` ↔ `backend/src/modules/template-block/template-block-layout.ts` (parity tests in BE spec; no shared package in Wave 1).

### Geometry lock (2026-08-03)

- `locked?: boolean` на блоке (FE types + BE schema/DTO/service).
- Canvas: `frozen = preview || locked` (нет drag/resize/delete; badge замка).
- Inspector «Геометрия»: lock toggle; inputs / layer / delete / overlay disabled when locked.
- Деплоить FE+BE вместе (`forbidNonWhitelisted` → 400 на `locked`, если BE старый).

### Session (смежно)

- Refresh ~30d; токены не сбрасываются на network/5xx; «Выйти» виден при наличии токенов.

## API endpoints

### Template управления

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/document-templates` | Список шаблонов |
| GET | `/api/document-templates/:id` | Детали шаблона |
| PATCH | `/api/document-templates/:id` | Обновить свойства шаблона |
| POST | `/api/document-templates` | Создать шаблон |
| DELETE | `/api/document-templates/:id` | Удалить шаблон |
| POST | `/api/document-templates/:id/duplicate` | Дублировать |
| POST | `/api/document-templates/:id/upload-background` | Фон: только png\|jpeg\|webp ≤5MB, max 5; без поля `file` → **400** (не 500) |
| POST | `/api/document-templates/:id/remove-background` | Удалить фон |
| POST | `/api/document-templates/:id/set-default-background` | Установить фон по умолчанию |

### Печатные поля (TZ-ORG-ASSETS-302)

В registry picker доступны поля организации, которые можно использовать в существующих
field/data bindings: реквизиты (`inn`, `kpp`, `ogrn`, `ogrnip`, `legalAddress`, банк,
подписант) и typed-vault aliases `logoUrl`, `sealUrl`, `signatureUrl`. Для image-блока
используйте соответствующее поле организации; для signature-блока — `signatureUrl`.

Build/generate payload принимает `quotationId`, `contractId`, `invoiceId` или `orderId`.
При `orderId` pipeline каскадно подхватывает связанную stub-КП и сторону-клиента, а
organization-issuer берётся из самого шаблона. Отсутствующий vault slot даёт пустой
image-блок или placeholder подписи, но не останавливает генерацию.

## Block управления

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/template-blocks?templateId=:id` | Список блоков |
| POST | `/api/template-blocks` | Добавить блок |
| PATCH | `/api/template-blocks/:id` | Обновить блок (auto-save) |
| DELETE | `/api/template-blocks/:id` | Удалить блок |
| POST | `/api/template-blocks/reorder` | Переупорядочить блоки |

## Компоненты

| Файл | Компонент | Описание |
|------|-----------|----------|
| `builder.page.ts` | `BuilderPage` | Оркестратор: состояние, auto-save, хендлеры |
| `builder-canvas.component.ts` | `BuilderCanvasComponent` | Холст: flow/overlay слои, CDK drag-drop |
| `builder-inspector.component.ts` | `BuilderInspectorComponent` | Правая панель: 3 режима |
| `block-renderer.component.ts` | `BlockRendererComponent` | Рендер одного блока (flow или overlay) |
| `builder.types.ts` | `AddBlockPayload` | Типы для добавления блоков |
| `template-setup-dialog.component.ts` | `TemplateSetupDialogComponent` | Диалог создания/дублирования шаблона |

### `BuilderPage` — оркестратор

Файл: `frontend/src/app/pages/doc-constructor/builder/builder.page.ts`

**Редактор (только `/builder/:id`, TZ-DOC-324 + Stabilization Wave):**
- Create / duplicate / delete шаблона — **не здесь**. CRUD = `/doc-constructor/templates` → `TemplateSetupDialogComponent` → navigate на `/builder/:id`.
- Загружает блоки через `loadBlocks(id)` при смене `templateId`
- Управляет состоянием: `blocks`, `selectedId`, `selectedIds`, `template`, `saveStatus`
- Прокидывает inputs/outputs между Canvas и Inspector
- `TemplateSetupDialogComponent` живёт рядом в папке builder, но открывается со страницы templates

### `BuilderCanvasComponent` — холст

Файл: `frontend/src/app/pages/doc-constructor/builder/builder-canvas.component.ts`

**Inputs:**
| Input | Тип | Назначение |
|-------|-----|-----------|
| `blocks` | `TemplateBlock[]` | Все блоки |
| `selectedId` | `string \| null` | Выбранный блок |
| `selectedIds` | `Set<string>` | Multi-select |
| `backgroundImages` | `string[]` | Фоны |
| `orientation` | `portrait \| landscape` | Ориентация |
| `backgroundOpacity` | `number` | Прозрачность фона |
| `pageNumbering` | `boolean` | Нумерация страниц (TZ-DOC-311: единственное сохраняемое свойство из legacy-набора) |

> TZ-DOC-311: `headerText` / `footerText` удалены из инпутов холста — шапка/подвал создаются текстовыми блоками конструктора.
| `pageSize` | `string` | A4 / A5 / Letter |
| `snapEnabled` | `boolean` | Snap-to-grid для overlay |
| `gridSize` | `number` | Шаг сетки |
| `boundaryPadding` | `number` | Отступ от краёв |

**Outputs:**
| Output | Тип |
|--------|-----|
| `select`, `multiSelect` | `TemplateBlock` |
| `reorder` | `TemplateBlock[]` |
| `dropAdd` | `{ payload, insertIndex }` |
| `blockWidthChange` | `{ block, width, marginLeft, ... }` |
| `overlayMove` | `{ block, overlayLeft, overlayTop }` |
| `overlayResize` | `{ block, imageWidth, imageHeight }` |
| `canvasClick` | `void` |
| `deleteRequest` | `string` |

**Разделение блоков (computed):**
```typescript
isOverlayBlock(block): boolean {
  if (block.type !== 'image') return false;
  return block.settings?.['overlay'] ?? false;
}
overlayBlocks = computed(() => blocks.filter(isOverlayBlock))
flowBlocks    = computed(() => blocks.filter(b => !isOverlayBlock(b)))
```

- **Flow блоки** — рендерятся внутри `cdkDropList` (reorder, drag-and-drop)
- **Overlay блоки** — рендерятся в `.canvas-overlay-layer` (absolute positioning)
- **Dropzone** — `cdkDropList` с `connectedTo: canvas-droplist` для drag-from-palette

### `BlockRendererComponent` — рендер блока

Файл: `frontend/src/app/pages/doc-constructor/builder/block-renderer.component.ts`

См. также `docs/pages/photo-block-architecture.md`

**Inputs:**
| Input | Тип | Назначение |
|-------|-----|-----------|
| `block` | `TemplateBlock` | Блок |
| `selected` | `boolean` | Выбран |
| `multiSelected` | `boolean` | Multi-select |
| `snapEnabled` | `boolean` | Snap-to-grid |
| `gridSize` | `number` | Шаг сетки |
| `boundaryPadding` | `number` | Отступ |

**Outputs:**
| Output | Тип |
|--------|-----|
| `select` | `TemplateBlock` |
| `multiSelect` | `TemplateBlock` |
| `widthChange` | `{ width, marginLeft }` |
| `overlayMove` | `{ block, overlayLeft, overlayTop }` |
| `overlayResize` | `{ block, imageWidth, imageHeight }` |
| `deleteRequest` | `string` |

**Два режима рендера:**

1. **Flow (по умолчанию):** внутри `cdkDrag`, участвует в reorder
   - text/header: контент + column grid
   - table: `<table>` с колонками и строками
   - image: `<img>` с `max-width: 100%`
   - signature: центрированный, с линией
   - spacer: пустой div с высотой
   - selection: gold border + shadow
   - resize хэндлы: левый (marginLeft) + правый (width) — боковые полосы

2. **Overlay (absolute):** вне CDK, `position: absolute` в `.canvas-overlay-layer`
   - Только для `type === 'image'` с `settings.overlay === true`
   - `[style.left.px]`, `[style.top.px]` — позиция X/Y
   - `[style.width.px]`, `[style.height.px]` — размер через сигналы
   - Corner resize handle (пропорциональный, по диагонали)
   - Snap-to-grid + block edge snap + boundary clamp
   - **Сигналы для плавности:** `dragActive/dragLeft/dragTop`, `resizeActive/resizeWidth/resizeHeight`

### `BuilderInspectorComponent` — инспектор

Файл: `frontend/src/app/pages/doc-constructor/builder/builder-inspector.component.ts`

**Inputs:**
| Input | Тип |
|-------|-----|
| `block` | `TemplateBlock \| null` |
| `selectedCount` | `number` |
| `selectedBlocks` | `TemplateBlock[]` |
| `paperWidth` | `number` |
| `templateSelected` | `boolean` |
| `template` | `DocumentTemplate \| null` |
| `allBlocks` | `TemplateBlock[]` |
| `snapEnabled` | `boolean` |
| `gridSize` | `number` |
| `boundaryPadding` | `number` |

**Outputs:**
| Output | Тип |
|--------|-----|
| `snapSettingsChange` | `{ snapEnabled, gridSize, boundaryPadding? }` |
| `update` | `Partial<TemplateBlock>` |
| `delete` | `string` |
| `deleteSelected` | `void` |
| `editSelected` | `void` |
| `marginReset` | `string` |
| `multiMarginUpdate` | `Array<{ _id, settings }>` |
| `templateUpdate` | `Partial<DocumentTemplate>` |
| `uploadBackground` | `File` |
| `removeBackground` | `number` |
| `setDefaultBackground` | `number` |
| `closePanel` | `void` |

**3 режима:**

#### Режим 1: Свойства блока (selectedId !== null)

| Секция | Элементы |
|--------|----------|
| **00: Заголовок блока** | Иконка типа, название, active toggle, showLine |
| **01: Содержимое** | text/header → content preview; image/signature → height; table → readonly badge |
| **02: Позиционирование** (overlay photo) | Чекбокс «Привязка к сетке», ползунок «Шаг сетки» (5–50), ползунок «Отступ от краёв» |
| **03: Размеры блока** | Ширина (пиксели/progress), Отступ слева (marginLeft), кнопка сброса |
| **04: Свойства фото** (image type) | Overlay toggle (Поверх других блоков), размер (W×H px), позиция X/Y |
| **05: Привязка данных** | Data-binding badges (readonly) |
| **06: Удаление** | Кнопка «Удалить блок» |

#### Режим 2: Мульти-выделение (selectedIds.size > 0)

- Количество выбранных блоков
- Размеры: общие значения (если одинаковые) или прочерк
- Кнопка «Сбросить отступы»
- Кнопка «Удалить выбранные» (внизу)

#### Режим 3: Свойства шаблона (templateSelected === true) — create-parity (TZ-DOC-343)

Секции:
- **Основные** (`insp-section-basics`): Название (blur/Enter → PATCH); Категория (scoped active catalog: system + current organization) через `app-pi-select-add-row`; `+` открывает `DocumentTemplateCategoryFormDialogComponent` inline и сразу выбирает созданную категорию
- **Страница** (`insp-section-page`): Формат A3|A4|A5; Ориентация Книжная|Альбомная; Нумерация
- **Фон** (`insp-section-background`): opacity + upload/grid/default/remove.
  На холсте всегда **один** слой — `defaultBackgroundIndex` (невалидный/`-1` → 0).
  Первый upload выставляет звезду на индекс 0; активная звезда — gold fill (TZ-DOC-344).

Для категории используется `DocumentTemplateCategoriesService.list({ activeOnly: true })` без клиентского system-only фильтра: API возвращает системные и текущие organization-scoped категории. Кнопка `+` открывает вложенную форму без перехода на `/doc-template-categories`; после успешного закрытия новая категория добавляется в локальный список и отправляется через `templateUpdate({ categoryId })`. При пустом каталоге ряд остаётся видимым, select disabled, а `+` доступен.

### Couplings

`DocumentTemplate.categoryId` совпадает с полем реестра шаблонов и create setup. Inspector пишет только выбранный id; duplicate mode сохраняет категорию исходного шаблона.

BE: `DocumentTemplateService.update` пишет и `orientation` (не только отдельный PATCH).
Org / docType в этой TZ не меняются.

## Состояние (сигналы BuilderPage)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `templateId` | `Signal<string \| null>` | ID активного шаблона (из route param) |
| `template` | `Signal<DocumentTemplate \| null>` | Текущий шаблон (фон, ориентация) |
| `blocks` | `Signal<TemplateBlock[]>` | Блоки в display order |
| `selectedId` | `Signal<string \| null>` | ID выбранного блока |
| `selectedIds` | `Signal<Set<string>>` | Multi-select IDs (Ctrl+Click) |
| `templateSelected` | `Signal<boolean>` | Режим «свойства шаблона» |
| `saveStatus` | `Signal<'idle' \| 'saving' \| 'saved' \| 'error'>` | Статус auto-save |
| `viewMode` | `Signal<'editor' \| 'preview'>` | Режим просмотра |
| `isLoading` | `Signal<boolean>` | Загрузка блоков |
| `isCreating` | `Signal<boolean>` | Создание шаблона |
| `openDropdown` | `Signal<string \| null>` | Открытый dropdown в тулбаре |
| `sourceContext` | `Signal<{ source, sourceId } \| null>` | Контекст из query params |
| `snapEnabled` | `Signal<boolean>` | Snap-to-grid (localStorage) |
| `gridSize` | `Signal<number>` | Шаг сетки (localStorage) |
| `boundaryPadding` | `Signal<number>` | Отступ от краёв (localStorage) |

**Computed:**
| Computed | Тип | Назначение |
|----------|-----|-----------|
| `selectedBlock` | `TemplateBlock \| null` | Выбранный блок (из selectedId или единственный из selectedIds) |
| `selectedBlocks` | `TemplateBlock[]` | Все выбранные блоки (для multi-select) |
| `headerSubtitle` | `string` | Подзаголовок: «Шаблон XXXX · N блоков» |
| `backgroundImages` | `string[]` | Фоны с учётом defaultBackgroundIndex |
| `orientation` | `'portrait' \| 'landscape'` | Ориентация шаблона |
| `templateListErrorMessage` | `string` | Ошибка загрузки списка шаблонов |
| `selectionIsPersistedGroup` | `boolean` | Selection = одна flat-группа (`groupId`) |
| `paletteGroups` | `{ groupId, label, count }[]` | Список групп для левой палитры |

### Persistent groups (TZ-DOC-331)

- Membership: `TemplateBlock.groupId` (UUID shared by members; `null` = alone).
- Select / mousedown-drag on a member expands selection to **all** same-`groupId` blocks.
- Positioned drag peers are resolved by `resolvePositionedDragPeers()` from the
  **full** canvas list (`allBlocks`), not from ephemeral selection — so the first
  drag after canvas-click still moves the whole group.
- Canvas click clears selection only; never clears `groupId`.
- Ungroup only via inspector / palette buttons.

## Auto-save architecture

```
patchBlockSettings(blockId, { settings })
  → save$.next({ _id: blockId, patch: { settings } })
    → groupBy(_id)           # группировка по ID блока
      → debounceTime(1500)   # 1.5s дебаунс
        → switchMap          # отменяет предыдущий запрос
          → blocksSvc.update(_id, patch)
            → handleSaveResult(res)
```

- **1500ms debounce** — группирует множественные изменения в один PATCH-запрос
- **switchMap** — отменяет in-flight запрос, если пришло новое изменение
- **groupBy(_id)** — каждый блок сохраняется независимо (не ждёт другие блоки)
- **saveStatus** — проход: `'saving' → 'saved' (2s) → 'idle'`
- **Monotonic counter** (`savedTick`) — защита от stale timer, который мог бы сбросить `'saved' → 'idle'` раньше времени
- **Optimistic update** — блоки обновляются локально ДО отправки на сервер
- **409 Conflict** — тост «Конфликт: шаблон изменён другим пользователем»

### Каналы auto-save

| Хендлер | Что сохраняет |
|---------|---------------|
| `onInspectorUpdate` | Patch блока (title, content, isActive, showLine, height, etc.) |
| `onBlockWidthChange` | `settings.width`, `settings.marginLeft`, `settings.imageWidth`, `settings.imageHeight` |
| `onOverlayMove` | `settings.overlayLeft`, `settings.overlayTop` |
| `onOverlayResize` | `settings.imageWidth`, `settings.imageHeight` |
| `onMarginReset` | `settings.width = 100`, `settings.marginLeft = 0` |
| `onMultiMarginUpdate` | Массовое обновление margin для нескольких блоков |
| `onTemplateUpdate` | Patch шаблона (pageNumbering, backgroundOpacity и др. DTO-поля; headerText/footerText/tableOfContents НЕ отправляются после TZ-DOC-311) |

## Тулбар (Builder Toolbar)

Горизонтальная панель с выпадающими списками:

| Кнопка | Действие |
|--------|----------|
| «← …» (в тулбаре) | TZ-UX-316: label «← К созданию КП» при валидном `?returnUrl` (переход туда), иначе «← Шаблоны» (`CatalogReturnStore.navigateBackOr('/doc-constructor/templates')`) |
| «Тексты» | Dropdown со списком текстовых блоков (`/api/text-blocks`) |
| «Таблицы» | Dropdown со списком шаблонов таблиц (`/api/table-templates`) |
| «Фото» | File input → `onPhotoFileSelected()` → создаёт image-блок с `overlay: true` |
| «— Отступ» | Добавляет spacer-блок |
| Editor/Preview | Переключение режима просмотра |

### Тексты: фильтр по категории (TZ-DOC-317)

И в тулбаре (inline dropdown), и в левой палитре `BuilderToolPaneComponent` секция «Тексты» теперь содержит dropdown «Категория» над списком блоков:

- Опции — активные категории из `TextBlockCategoriesService.list({ activeOnly: true })` (TZ-DOC-309-кэш активного каталога, повторных GET при переоткрытии builder нет).
- «Все» (default) → запрос `/api/text-blocks?isActive=true` без `categoryId`.
- Конкретная категория → `/api/text-blocks?isActive=true&categoryId=<id>` — серверный Mongo-фильтр (backend TZ-DOC-315), без fallback на полный список после фильтрации.
- Состояние фильтра живёт в `BuilderTextFilterService` (shared signal `categoryId`), чтобы tool-pane и inline dropdown были синхронизированы (один источник правды, без event-plumbing).
- Пустой результат в выбранной категории → empty state «Нет блоков в этой категории».
- Ошибка `/text-block-categories` (4xx/5xx) не ломает picker: dropdown показывает «Все».

### Filter URL-sync + breadcrumb badge (TZ-DOC-318)

Поверх TZ-DOC-317 добавлены три UX-закрытия:

- **URL persistence** — выбранная категория зеркалится в URL как `?categoryId=<id>` (`router.navigate` с `replaceUrl: true` + `queryParamsHandling: 'merge'`). Read-side: `route.queryParamMap` subscribe пишет в `BuilderTextFilterService.categoryId` → F5-refresh и shareable-ссылка `/doc-constructor/builder?categoryId=<id>` открывают builder с уже активным фильтром. `categoryId: null` убирает параметр (merge-removal). Loop-guard через `route.snapshot.queryParamMap` скипает избыточный navigate при первом прогоне эффекта.
- **Breadcrumb badge** — в верхней панели builder (рядом с `headerSubtitle`, только когда `templateId()` есть) чип `builder-category-chip`: `«Категория: <name>»` (или «Все», если фильтр не задан). Лейбл — lookup по `categories()` по `selectedCategoryId()`. Клик по чипу → `onCategoryChipReset()` → `categoryId = null` → URL без параметра, все блоки снова видны.
- **Sync** — единый источник правды `BuilderTextFilterService` (root-provided signal `categoryId`): tool-pane и inline dropdown читают ИЗ него (у tool-pane нет локального signal), два picker-call-site не расходятся.

## Фото-блок: два режима

Детальная документация: `docs/pages/photo-block-architecture.md`

### Режим «В потоке» (overlay = false)
- Рендерится внутри `cdkDropList`, участвует в reorder
- Ширина: `settings.width` (проценты)
- Изображение: `max-width: 100%`, height auto

### Режим «Поверх» (overlay = true)
- Рендерится в `.canvas-overlay-layer` с `position: absolute`
- Позиция X/Y: `settings.overlayLeft`, `settings.overlayTop`
- Размер: `settings.imageWidth`, `settings.imageHeight` (px)
- Snap-to-grid (шаг `gridSize`), block edge snap (8px threshold)
- Boundary clamp: `[padding, paperWidth - blockW - padding]` × `[padding, paperHeight - blockH - padding]`
- **Сигналы для плавности:** `dragActive/dragLeft/dragTop` — предотвращают Angular CD от перезаписи `[style.left.px]` во время drag
- **Сигналы для resize:** `resizeActive/resizeWidth/resizeHeight` — предотвращают Angular CD от перезаписи `[style.width.px]` во время corner resize
- **Auto-clear эффекты:** когда `imageWidth()` (из settings) догоняет `resizeWidth()` (локальный), эффект очищает override — без визуального flash
- **Быстрый re-drag:** `startLeft = dragActive() ? dragLeft() : overlayLeft()` — использует последнюю визуальную позицию, не устаревшую из settings

### Настройки позиционирования

| Поле | Тип | Default | localStorage key |
|------|-----|---------|-----------------|
| `snapEnabled` | `boolean` | `true` | `pi-builder-snap-settings` |
| `gridSize` | `number` | `20` (5–50) | `pi-builder-snap-settings` |
| `boundaryPadding` | `number` | `8` (≥ 0) | `pi-builder-snap-settings` |

Читаются через `loadSnapSettings()` (try/catch, валидация), сохраняются через `saveSnapSettings()`.

## Добавление блока

### `onAddBlock(payload: AddBlockPayload)`

Payload варианты (см. `builder.types.ts`):
- `{ source: 'block-type', type: 'header' | 'text' | 'image' | 'signature' | 'spacer' }`
- `{ source: 'text-block', textBlock: TextBlock }`
- `{ source: 'table-template', tableTemplate: TableTemplate }`
- `{ source: 'data-binding', dataSource, field }`

Процесс:
1. `buildBlockFromPayload()` — создаёт `TemplateBlock` с `tempId: crypto.randomUUID()`
2. Оптимистичная вставка в `blocks` (`splice` на insertIndex)
3. `blocksSvc.add()` → POST на сервер
4. При успехе: swap `tempId` на серверный `_id`
5. При ошибке: удаление из массива + тост
6. Если вставка в середину списка → `blocksSvc.reorder()` для фиксации позиции

### `insertNewBlock(newBlock: TemplateBlock)`

Используется для фото-блоков (с предзаполненным `settings`).

## Удаление блока

- `onDeleteBlock(id)` → `AlertDialogComponent` с подтверждением → `blocksSvc.remove()`
- `onDeleteSelected()` → массовое удаление через `forkJoin` + `reorder` после

## Resize хэндлы (flow-блоки)

- **Левый хендл** — изменяет `marginLeft`, ширина подстраивается
- **Правый хендл** — изменяет `width` (в процентах от `containerWidth`)
- `opacity: 0.25` (всегда видимы), `0.6` при hover, `1` при захвате (gold цвет)
- Значения хранятся в `block.settings.width` и `block.settings.marginLeft`

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-86 | Phase D.1 + D.2 + D.3: полная реализация 3-pane редактора |
| TZ-87 | Создание шаблона (org + docType) |
| TZ-104.6+ | Multi-column блоки |
| TZ-104.7 | Column grid, preamble |
| TZ-170 | UX-полировка, закрытие dropdown |
| TZ-211 | View mode toggle, блокировка полосы прокрутки, фото-блок |
| TZ-211 (overlay) | Overlay-режим фото: drag, resize, snap-to-grid, boundary clamp, corner handle |
| 2026-07-24 | Template properties panel, block resize, margins, print styles |
| 2026-07-25 | **Overlay bugfixes:** кеширование hostEl при drag, сигналы resizeActive/resizeWidth/resizeHeight вместо direct DOM, scrollHeight для нижней границы, кешированный paper ref в snapToBlockEdges, сигналы dragActive/dragLeft/dragTop для drag-позиции, авто-очистка override при обновлении settings |
| TZ-DOC-443 | Inspector category picker parity: scoped active categories, inline `+` create, immediate selection and `templateUpdate({ categoryId })` |

## Magnetic Grid + Alignment Guides (TZ-237.MAGNETIC-GRID-r0)

Shipped on branch `feat/builder-magnetic-grid` (4 atomic commits:
`d15b5f7` magnetic-grid implementation, `f10a0e2` DOM-contract spec,
`f1109e6` collapse-per-axis guides, `38e0af7` Nit 3 + 4 polish).
Branch URL:
`https://github.com/gostreetogle-create/kppdf-8.0/tree/feat/builder-magnetic-grid`.

The Конструктор now decorates the canvas with two purely-visual layers
that interact with the existing snap math in `BlockRendererStateService`
(`applySnapToGrid`, `snapToBlockEdges`) WITHOUT changing the position
math itself.

### Visible behaviour

* **Grid layer** (`.canvas-builder__grid-layer`). A radial-gradient dot
  pattern painted across the paper area; `background-size` follows the
  existing `gridSize` signal so changing the grid size in the inspector
  updates the dot pitch live. Rendered only when `snapEnabled === true`.
  `pointer-events: none`; `aria-hidden="true"`;
  `display: none !important` under `@media print`; respects
  `@media (prefers-reduced-motion: reduce)`.
* **Alignment guides** (`.canvas-builder__guides-layer`). Vertical and
  horizontal guide lines drawn while ONE overlay image block is being
  dragged. Up to 4 guides per drag (one edge + one center per X axis,
  same for Y). Lines snap to the closest neighbouring overlay rect's
  edges (left/right/top/bottom) AND centres (cx/cy). When multiple
  neighbours fall within `SNAP_THRESHOLD_PX` of the dragged rect on
  the SAME edge, the visual layer collapses to the single closest one
  — no "fan of lines". Each guide `div` carries:
  - `.canvas-builder__guide--x` / `--y` axis modifier class;
  - `.canvas-builder__guide--center` for `cx`/`cy` guides;
  - `data-edge="left|right|cx|top|bottom|cy"` identifying the kind;
  - `data-target="<blockKey()>"` identifying the neighbour;
  - `style.left.px` for X-axis guides, `style.top.px` for Y-axis guides
    (the opposite axis is left empty).

### Architecture

The slice is intentionally additive: the existing drag math is **never
modified**. New code lives in three new files plus a handful of additive
changes to three existing files.

| Concern | File |
| --- | --- |
| Pure typed geometry engine (no DI, no DOM) | `frontend/src/app/pages/doc-constructor/builder/snap-engine.ts` |
| Engine unit tests (34 / 34 pass) | `frontend/src/app/pages/doc-constructor/builder/snap-engine.spec.ts` |
| DOM-contract test for the canvas layers (7 / 7 pass) | `frontend/src/app/pages/doc-constructor/builder/builder-canvas.component.spec.ts` |
| New `dragRect = computed<Rect \| null>(...)` reading `blockKey(block)` + reusing existing `imageWidth()` / `imageHeight()` | `block-renderer-state.service.ts` |
| New `@Output() dragRectChange = output<Rect \| null>()` mirrored via `effect(() => emit(state.dragRect()))` | `block-renderer.component.ts` |
| `currentDragRect = signal`, `currentGuides = computed`, `onChildDragRect` (+ null→null short-circuit), `computeGuidesForCurrentDrag` (caller-side policy: `collapseAlignmentGuides(computeAlignmentGuides(...))`); `@if (snapEnabled())` grid layer; `@if (currentGuides().length > 0)` guides layer; CSS for both with print-hide + reduced-motion | `builder-canvas.component.ts` |

### Out of scope (intentional deferrals)

* **Flow blocks** do not have absolute coordinates; guides against them
  require bounding-rect measurement that this slice does not attempt.
  Flow vs overlay split is preserved.
* **Multi-select drag.** `currentDragRect` is single-rect. A JSDoc TODO
  marker on the field explicitly notes that when multi-select drag
  ships the signal becomes `Map<blockId, Rect>`.
* **Resize-time guides** are out of scope. `BlockRendererStateService.dragRect`
  returns `null` while `resizeActive()` is true so guides do not flicker
  during a corner or side resize.

## Известные ограничения

1. **Индикатор snap** — только смена цвета outline, без визуальных линий-направляющих
2. **Нет snap по центру блоков** — только по краям
3. **Дебаунс 1500ms** — фото визуально остаётся в новом размере, но на сервере изменения применяются через 1.5с + сеть
4. **Fallback imageWidth** — `overlayDefaultWidth: 300` в шаблоне, но `imageWidth() ?? 200` в `onCornerResizeStart` (несоответствие)
5. **Без ImageHeight по умолчанию** — высота overlayDefaultHeight = 200, может не соответствовать реальному соотношению сторон фото

## Файлы

| Файл | Размер | Назначение |
|------|--------|-----------|
| `builder.page.ts` | ~1300 строк | Оркестратор, хендлеры, auto-save, localStorage |
| `builder-canvas.component.ts` | ~400 строк | Холст, разделение flow/overlay, inputs/outputs |
| `builder-inspector.component.ts` | ~600 строк | 3 режима инспектора |
| `block-renderer.component.ts` | ~800 строк | Рендер блока, drag, resize, snap, сигналы |
| `builder.types.ts` | ~30 строк | Типы AddBlockPayload |
| `template-setup-dialog.component.ts` | ~80 строк | Диалог создания/дублирования |

---

_Создано: 2026-07-19. Последнее обновление: 2026-08-29. Охватывает: TZ-86, TZ-87, TZ-104, TZ-170, TZ-211, overlay bugfixes, TZ-DOC-STUDIO-101 (canvas-layout-layer SoT)._
