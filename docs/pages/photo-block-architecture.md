# Фото-блок: Overlay-архитектура

> **Назначение:** Документация реализации overlay-фотографий в конструкторе документов — как работает загрузка, позиционирование, resize, snap-to-grid, boundary clamp и сохранение.

## Architecture overview

Фото-блок имеет **два режима** отображения, переключаемых через `block.settings.overlay`:

### Режим 1: В потоке (flow) — overlay = false
- Рендерится внутри `cdkDropList` как обычный блок
- Участвует в reorder (drag-and-drop вверх/вниз)
- Ширина управляется через `settings.width` (проценты)
- Изображение отображается с `max-width: 100%`, высота auto

### Режим 2: Поверх (overlay) — overlay = true
- Рендерится **вне** `cdkDropList`, в отдельном `.canvas-overlay-layer` (слой поверх потока)
- `position: absolute` внутри холста (`.pi-canvas-page-paper`)
- Координаты X/Y: `block.settings.overlayLeft`, `block.settings.overlayTop`
- Размер: `block.settings.imageWidth`, `block.settings.imageHeight` (px)
- Drag-and-drop: изменяет X/Y, не reorder
- Snap-to-grid + boundary clamp + притяжение к блокам

## Компоненты

### `BlockRendererComponent`
Файл: `frontend/src/app/pages/doc-constructor/builder/block-renderer.component.ts`

**Inputs:**
| Input | Тип | Назначение |
|-------|-----|-----------|
| `block` | `TemplateBlock` | Блок для рендера |
| `selected` | `boolean` | Выбран ли блок |
| `snapEnabled` | `boolean` | Snap-to-grid (default: true) |
| `gridSize` | `number` | Шаг сетки в px (default: 20) |
| `boundaryPadding` | `number` | Отступ от краёв в px (default: 0) |

**Outputs:**
| Output | Тип | Назначение |
|--------|-----|-----------|
| `overlayMove` | `{ block, overlayLeft, overlayTop }` | Сохранить новую позицию (drag) |
| `overlayResize` | `{ block, imageWidth, imageHeight }` | Сохранить новый размер (corner resize) |

**Computed from settings:**
| Signal | Тип | Источник |
|--------|-----|----------|
| `isOverlay` | `boolean` | `settings.overlay` |
| `overlayLeft` | `number` | `settings.overlayLeft ?? 0` |
| `overlayTop` | `number` | `settings.overlayTop ?? 0` |
| `imageWidth` | `number \| null` | `settings.imageWidth` |
| `imageHeight` | `number \| null` | `settings.imageHeight` |
| `imageUrl` | `string \| null` | `settings.imageUrl` |

### `BuilderCanvasComponent`
Файл: `frontend/src/app/pages/doc-constructor/builder/builder-canvas.component.ts`

Разделяет блоки на два массива через `computed`:
- `flowBlocks` — блоки с `isOverlayBlock() === false` → идут в `cdkDropList`
- `overlayBlocks` — блоки с `isOverlayBlock() === true` → рендерятся в `.canvas-overlay-layer`

### `BuilderPage`
Файл: `frontend/src/app/pages/doc-constructor/builder/builder.page.ts`

Оркестратор:
- `onOverlayMove()` — обновляет `settings.overlayLeft/overlayTop` через `patchBlockSettings()`
- `onOverlayResize()` — обновляет `settings.imageWidth/imageHeight` через `patchBlockSettings()`
- `onSnapSettingsChange()` — обновляет `snapEnabled`, `gridSize`, `boundaryPadding` из инспектора
- `onPhotoFileSelected()` — загружает файл, создаёт блок с `settings: { overlay: true, imageUrl }`
- Хранит сигналы `snapEnabled`, `gridSize`, `boundaryPadding` с персистентностью в localStorage (`pi-builder-snap-settings`)

## Drag overlay (позиционирование)

### `onOverlayDragStart(event: MouseEvent)`

Вход: mousedown на overlay-блоке (не на delete/corner-resize хэндлах).

**При старте (один раз):**
- Кеширует `hostEl` (через `closest('.block-renderer--overlay')`)
- Кеширует `paper` (через `document.querySelector('.pi-canvas-page-paper')`)
- Кеширует размеры блока `cachedBlockW`, `cachedBlockH`

**На каждый mousemove:**
1. Вычисляет `deltaX/deltaY` от стартовой позиции мыши
2. Вычисляет `newLeft = startLeft + deltaX`, `newTop = startTop + deltaY`
3. **Boundary clamp:** ограничивает X в `[pad, paper.clientWidth - cachedBlockW - pad]`, Y в `[pad, paper.scrollHeight - cachedBlockH - pad]`
4. **Snap-to-grid:** округляет до ближайшей точки сетки (шаг `gridSize`, порог 8px)
5. **Block edge snap:** притягивает к краям других блоков (flow + overlay) на холсте
6. Устанавливает `hostEl.style.left/top` для визуального фидбека
7. Визуальный индикатор: класс `.is-snapping` + голубое свечение

**На mouseup:**
- Эмитит `overlayMove` с финальными X/Y
- Parent обновляет settings через debounced (1500ms) API-запрос

### Boundary clamp

```
newLeft ∈ [pad,  paper.clientWidth  - cachedBlockW - pad]
newTop  ∈ [pad,  paper.scrollHeight - cachedBlockH - pad]
```

- `clientWidth`: полная ширина бумаги (фиксированная, A4)
- `scrollHeight`: **scrollHeight** для высоты (не clientHeight), т.к. бумага может быть выше viewport
- `pad`: `boundaryPadding` (настраиваемый отступ от краёв, default 8px)

### Snap-to-grid

```typescript
snapValueToGrid(value, gridSize):
  nearest = round(value / gridSize) * gridSize
  if |value - nearest| <= SNAP_THRESHOLD (8px) → snapped
```

### Block edge snap

Сравнивает края (left/right/top/bottom) перетаскиваемого блока с краями всех других блоков на холсте. Порог: 8px. Притяжение по X (left/right edge) и Y (top/bottom edge) независимо.

## Corner resize (масштабирование)

### Проблема: Angular CD vs DOM

**Было:** Прямая установка `imgEl.style.width = ...` конфликтовала с Angular-байндингом `[style.width.px]="imageWidth()"` — CD перезаписывал inline-стиль на каждом кадре, вызывая дёрганье.

**Решение:** Локальные сигналы `resizeActive`, `resizeWidth`, `resizeHeight`.

### `onCornerResizeStart(event: MouseEvent)`

**При старте:**
- Вычисляет aspect ratio из `naturalWidth/naturalHeight` изображения
- Устанавливает `resizeActive = true`, `resizeWidth = startWidth`, `resizeHeight = startHeight`

**На каждый mousemove:**
- Вычисляет прирост как `sqrt(deltaX² + deltaY²)` (диагональное расстояние) для плавности
- Обновляет `resizeWidth/resizeHeight` — Angular CD подхватывает изменения через шаблон:
  ```html
  [style.width.px]="resizeActive() ? resizeWidth() : (imageWidth() ?? overlayDefaultWidth)"
  [style.height.px]="resizeHeight() ..."
  ```
- **Нет прямых DOM-манипуляций** — CD сам применяет размер через style binding

**На mouseup:**
- Читает финальные значения из `resizeWidth()/resizeHeight()` (сигналы — источник правды)
- Эмитит `overlayResize` с финальными размерами
- **НЕ очищает сигналы** — локальный override остаётся активным, чтобы предотвратить визуальный отскок к старому размеру (пока debounced API не обновит `imageWidth`/`imageHeight`)

**Auto-clear:** Эффект в конструкторе:
```typescript
effect(() => {
  const w = this.imageWidth();   // из settings (после API)
  const d = this.resizeWidth();   // локальный override
  if (d > 0 && w === d) {
    this.resizeActive.set(false);
    this.resizeWidth.set(0);
    this.resizeHeight.set(0);
    // → template падает на imageWidth() — то же значение, нет flash
  }
});
```

## Сохранение (auto-save)

### Pipeline

```
overlayMove/overlayResize emit
  → BuilderPage.onOverlayMove() / onOverlayResize()
    → patchBlockSettings(blockId, { settings })
      → patch$.next({ _id, patch })
        → groupBy(_id) → debounceTime(1500ms) → switchMap → API PATCH /api/template-blocks/:id
```

- **1500ms debounce** — группирует множественные изменения в один запрос
- **switchMap** — отменяет предыдущий запрос, если новый пришёл до ответа
- Все `block.settings.*` поля (overlayLeft, overlayTop, imageWidth, imageHeight) проходят через этот pipeline

## localStorage

Настройки позиционирования (`snapEnabled`, `gridSize`, `boundaryPadding`) сохраняются в `localStorage` под ключом `pi-builder-snap-settings`:

```typescript
interface SnapSettings {
  snapEnabled: boolean;     // default: true
  gridSize: number;         // default: 20, range: 5–50
  boundaryPadding: number;  // default: 8, range: ≥ 0
}
```

- `loadSnapSettings()` — читает с try/catch, валидация полей, fallback на дефолты
- `saveSnapSettings()` — записывает с try/catch (защита от Private Browsing / quota exceeded)

## Визуал

| Элемент | Стиль |
|---------|-------|
| Overlay-блок | `position: absolute`, `z-index: 10`, без рамки/фона |
| Selection ring | 2px gold outline с `outline-offset: 2px` |
| Corner resize handle | Иконка с золотым цветом, `nwse-resize` курсор, видна при selected/hover |
| Snap indicator | Голубое свечение (`#4fc3f7`), `drop-shadow` |
| Delete button | Круглая кнопка с иконкой корзины, видна при hover/selected |

## Flow-блок (не overlay)

Для полноты — flow-блоки работают через `cdkDrag`/`cdkDropList`:
- Ресайз через боковые хэндлы (левый = marginLeft, правый = width)
- Ширина в процентах от контейнера
- Drag-and-drop: reorder в списке (перемещение вверх/вниз)
- Selection: gold border + shadow

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-211 | Базовая реализация overlay-фото (загрузка, resize, drag, overlay toggle) |
| (snap) | Snap-to-grid + блокировка по краям + отступ от краёв |
| (bugfix) | Кеширование DOM при drag, сигналы вместо direct DOM при resize, scrollHeight |

## Известные ограничения

1. **Индикатор притяжения к блоку** — только смена цвета outline, без визуальных линий-направляющих
2. **Нет snap по центру** — только по краям блоков
3. **Сохранение через debounce** — фото визуально остаётся в новом размере, но на сервере изменения применяются через 1.5с + сеть
4. **Первое фото без явного imageWidth** — отображается с `overlayDefaultWidth: 300`, resize начинает с `imageWidth() ?? 200` (несоответствие fallback)

---

_Создано: 2026-07-25. Актуально для overlay-архитектуры фото-блока._
