# Страница: Конструктор документов (BuilderPage)

> **Назначение:** Полная документация страницы конструктора документов — 3-панельный редактор шаблонов документов: тулбар (сверху), canvas (центр), инспектор свойств (справа).
>
> При редактировании этой страницы — читай этот файл ПЕРЕД внесением изменений.

---

## Route

```
/doc-constructor/builder       → выбор шаблона (список)
/doc-constructor/builder/:id   → редактор конкретного шаблона
```

## Query params

| Параметр | Тип | Назначение |
|----------|-----|-----------|
| `source` | `string` | Источник контекста (order/contract) |
| `sourceId` | `string` | ID источника |

## Layout

```
┌──────────────────────────────────────────────────────────────┐
│  Builder Toolbar (тулбар с выпадающими списками)             │
├──────────────────────────────────────┬───────────────────────┤
│                                      │                       │
│  Canvas (pi-canvas-page)             │  Inspector (320px)    │
│  ┌─────────────────────────────┐    │  ┌─────────────────┐  │
│  │ .pi-canvas-page-paper      │    │  │ Section 01:      │  │
│  │  ┌───────────────────────┐ │    │  │  Блок / Шаблон   │  │
│  │  │ .canvas-dropzone      │ │    │  ├─────────────────┤  │
│  │  │  [flow blocks]        │ │    │  │ Section 02:      │  │
│  │  │  app-block-renderer   │ │    │  │  Позициониро-    │  │
│  │  │  (cdkDrag, text/img)  │ │    │  │  вание (snap,    │  │
│  │  └───────────────────────┘ │    │  │  padding)        │  │
│  │  ┌───────────────────────┐ │    │  ├─────────────────┤  │
│  │  │ .canvas-overlay-layer │ │    │  │ Section 03:      │  │
│  │  │  [overlay blocks]     │ │    │  │  Размеры блока   │  │
│  │  │  app-block-renderer   │ │    │  │  (width, margin) │  │
│  │  │  (absolute position)  │ │    │  ├─────────────────┤  │
│  │  └───────────────────────┘ │    │  │ Section 04:      │  │
│  └─────────────────────────────┘    │  │  Свойства фото   │  │
│                                      │  │  (overlay, resize│  │
│                                      │  │  X/Y position)   │  │
│                                      │  ├─────────────────┤  │
│                                      │  │ Section 05:      │  │
│                                      │  │  Привязка данных │  │
│                                      │  ├─────────────────┤  │
│                                      │  │ Section 06:      │  │
│                                      │  │  Фоны шаблона    │  │
│                                      │  └─────────────────┘  │
└──────────────────────────────────────┴───────────────────────┘
```

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
| POST | `/api/document-templates/:id/upload-background` | Загрузить фон |
| POST | `/api/document-templates/:id/remove-background` | Удалить фон |
| POST | `/api/document-templates/:id/set-default-background` | Установить фон по умолчанию |

### Block управления

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
| `builder-canvas.component.ts` | `BuilderCanvasComponent` | Холст: flow/legacy overlay/positioned слои, CDK drag-drop |
| `builder-inspector.component.ts` | `BuilderInspectorComponent` | Правая панель: 3 режима |
| `block-renderer.component.ts` | `BlockRendererComponent` | Рендер одного блока (flow, legacy overlay или positioned) |
| `builder.types.ts` | `AddBlockPayload` | Типы для добавления блоков |
| `template-setup-dialog.component.ts` | `TemplateSetupDialogComponent` | Диалог создания/дублирования шаблона |

### `BuilderPage` — оркестратор

Файл: `frontend/src/app/pages/doc-constructor/builder/builder.page.ts`

**Выбранный шаблон (экран 1):**
- `templateListRes` — `httpResource<DocumentTemplate[]>` на `/api/document-templates`
- Кнопка «Новый шаблон» → `onCreateTemplate()` → `TemplateSetupDialogComponent` → `doCreateTemplate()`
- Открытие/дублирование/удаление шаблона

**Редактор (экран 2):**
- Загружает блоки через `loadBlocks(id)` при смене `templateId`
- Управляет состоянием: `blocks`, `selectedId`, `selectedIds`, `template`, `saveStatus`
- Прокидывает inputs/outputs между Canvas и Inspector

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
| `headerText` / `footerText` | `string` | Шапка/подвал |
| `pageNumbering` | `boolean` | Нумерация |
| `pageSize` | `string` | A3 / A4 / A5 / Letter |
| `snapEnabled` | `boolean` | Snap-to-grid для legacy image overlay |
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
| `positionedGeometryChange` | `{ block, geometry: { x, y, width, height } }` |
| `canvasClick` | `void` |
| `deleteRequest` | `string` |

**Разделение блоков (computed):**
```typescript
isOverlayBlock(block): boolean {
  return block.type === 'image' && block.settings?.['overlay'] === true;
}
isPositionedBlock(block): boolean {
  return (block.type === 'text' || block.type === 'header')
    && readPositionedGeometry(block.settings) !== null;
}
positionedBlocks = computed(() => blocks.filter(isPositionedBlock));
overlayBlocks = computed(() => blocks.filter(b => isOverlayBlock(b) && !isPositionedBlock(b)));
flowBlocks = computed(() => blocks.filter(b => !isOverlayBlock(b) && !isPositionedBlock(b)));
```

- **Flow блоки** — рендерятся внутри `cdkDropList` (reorder, drag-and-drop)
- **Legacy image overlay** — рендерится в `.canvas-overlay-layer` (absolute positioning)
- **Positioned text/header** — рендерится в `.canvas-overlay-layer` по document-space geometry
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
| `positionedGeometryChange` | `{ block, geometry: { x, y, width, height } }` |
| `deleteRequest` | `string` |

**Три режима рендера:**

1. **Flow (по умолчанию):** внутри `cdkDrag`, участвует в reorder
   - text/header: контент + column grid
   - table: `<table>` с колонками и строками
   - image: `<img>` с `max-width: 100%`
   - signature: центрированный, с линией
   - spacer: пустой div с высотой
   - selection: gold border + shadow
   - resize хэндлы: левый (marginLeft) + правый (width) — боковые полосы

2. **Legacy image overlay (absolute):** вне CDK, `position: absolute` в `.canvas-overlay-layer`
   - Только для `type === 'image'` с `settings.overlay === true`
   - Сохраняет legacy-поля `overlayLeft`, `overlayTop`, `imageWidth`, `imageHeight`

3. **Positioned (document-space absolute):** вне CDK, только для `text`/`header` с явным `settings.layoutMode === 'positioned'`
   - `settings.geometry = { x, y, width, height }` в канонических CSS px от верхнего левого угла страницы
   - `x/y/width/height` округляются до целых и ограничиваются page bounds + minimum size
   - drag и resize работают через rendered-canvas scale; viewport/scroll не сохраняются в geometry
   - переключение выполняется только через инспектор «Свободное позиционирование»
   - таблицы и многостраничный flow остаются flow-блоками

   - `[style.left.px]`, `[style.top.px]` — позиция X/Y
   - `[style.width.px]`, `[style.height.px]` — размер через сигналы
   - Resize handle в правом нижнем углу для изменения width/height
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

#### Режим 3: Свойства шаблона (templateSelected === true)

- **Ориентация:** книжная / альбомная (BookOpen/Columns icons)
- **Формат страницы:** A3 / A4 / A5 / Letter
- **Прозрачность фона:** ползунок
- **Шапка / Подвал:** текстовые поля
- **Нумерация страниц:** toggle
- **Фоны:** превью загруженных, установка по умолчанию, удаление

## Geometry contract (TZ-259)

`settings.layoutMode` является явным режимом блока: `flow` или `positioned`. Для positioned text/header-блоков persisted geometry хранится в document-space и не зависит от ширины viewport:

```ts
settings: {
  layoutMode: 'positioned',
  geometry: { x: number, y: number, width: number, height: number }
}
```

Канонические размеры страницы при 96 dpi: A3 `1123×1587`, A4 `794×1123`, A5 `559×794`, Letter `816×1056` CSS px; landscape меняет местами width/height. UI scale применяется только к presentation layer. Legacy blocks без `geometry` не мигрируются и продолжают работать в прежнем flow/overlay режиме.

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
| `onPositionedGeometryChange` | `settings.layoutMode = 'positioned'`, `settings.geometry` |
| `onMarginReset` | `settings.width = 100`, `settings.marginLeft = 0` |
| `onMultiMarginUpdate` | Массовое обновление margin для нескольких блоков |
| `onTemplateUpdate` | Patch шаблона (orientation, pageSize, headerText, footerText, etc.) |

## Тулбар (Builder Toolbar)

Горизонтальная панель с выпадающими списками:

| Кнопка | Действие |
|--------|----------|
| «Тексты» | Dropdown со списком текстовых блоков (`/api/text-blocks`) |
| «Таблицы» | Dropdown со списком шаблонов таблиц (`/api/table-templates`) |
| «Фото» | File input → `onPhotoFileSelected()` → создаёт image-блок с `overlay: true` |
| «— Отступ» | Добавляет spacer-блок |
| Editor/Preview | Переключение режима просмотра |

Dropdown закрывается при клике вне `.builder-dropdown` (через `@HostListener('document:click')`)

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
| 2026-07-31 | **TZ-259 geometry contract:** explicit positioned text/header mode, document-space geometry, scale-aware drag/resize, Letter page dimensions, backward-compatible persistence |
| 2026-07-25 | **Overlay bugfixes:** кеширование hostEl при drag, сигналы resizeActive/resizeWidth/resizeHeight вместо direct DOM, scrollHeight для нижней границы, кешированный paper ref в snapToBlockEdges, сигналы dragActive/dragLeft/dragTop для drag-позиции, авто-очистка override при обновлении settings |

## Известные ограничения

1. **Positioned PDF layout** — текущая TZ-259 сохраняет и восстанавливает geometry в builder; server-side generated HTML/PDF absolute layout требует отдельного render-contract task и не выполняется массово для legacy flow blocks.
2. **Индикатор snap** — только смена цвета outline, без визуальных линий-направляющих.
3. **Нет snap по центру блоков** — только по краям.
4. **Дебаунс 1500ms** — фото визуально остаётся в новом размере, но на сервере изменения применяются через 1.5с + сеть.
5. **Fallback imageWidth** — `overlayDefaultWidth: 300` в шаблоне, но `imageWidth() ?? 200` в `onCornerResizeStart` (несоответствие).
6. **Без ImageHeight по умолчанию** — высота `overlayDefaultHeight = 200` может не соответствовать реальному соотношению сторон фото.

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

_Создано: 2026-07-19. Последнее обновление: 2026-07-31. Охватывает: TZ-86, TZ-87, TZ-104, TZ-170, TZ-211, overlay bugfixes и TZ-259._
