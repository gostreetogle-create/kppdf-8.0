# TZ-250 — Улучшение визуального конструктора документов по референсам open-source

**Date:** 2026-07-28
**Status:** 📋 PLAN (NOT STARTED — синтез-исследование + дорожная карта)
**Author:** Buffy (deep research synthesis)
**Branch:** `feature/tz-250-builder-improvements`
**Target module:** `frontend/src/app/pages/doc-constructor/builder/` + `backend/src/modules/template-block/` + `backend/src/modules/document-template/`

---

## 0. Контекст задачи

3-pane визуальный конструктор документов (`/doc-constructor/builder`) реализован на: Angular 20 + NestJS + MongoDB + TipTap + CDK Drag&Drop + Angular Material + Lucide icons. У нас уже есть foundation: snap-to-grid (overlay blocks), autosave с debounce, multi-select, view mode toggle, 6 block types, DataBinding для 9 источников, render-to-HTML+print-ready CSS.

**Цель TZ-250:** Проанализировать 10 сильных open-source проектов для визуального редактирования шаблонов документов и интегрировать лучшие паттерны / UX / методы — НЕ переписывая с нуля, а наращивая на существующий фундамент. Дизайн UI сохраняем наш, заимствуем функционал и архитектурные идеи.

**Где брать что:** см. раздел 3.

**Почему это важно:** В open-source мире есть десятки отработанных решений (snap-to-grid между элементами, multi-select с bounding-box, drag-from-palette с slot indication, plugin-driven prop panels, shadow-DOM isolation, etc.) — мы их НЕ используем. Этот TZ фиксирует, ЧТО и ОТКУДА мы берём, КАК адаптируем к Angular 20 + NestJS, и В КАКОМ ПОРЯДКЕ внедряем, чтобы не было «каши».

---

## 1. Что у нас уже есть (НЕ предлагать добавлять заново)

| Фича | Где реализована |
|------|------------------|
| Snap-to-grid overlay blocks | `frontend/src/app/pages/doc-constructor/builder/builder.page.ts:367-372` (`snapEnabled`/`gridSize=20`/`boundaryPadding=8` + localStorage в `loadSnapSettings`) |
| CDK Drag&Drop reorder | `frontend/src/app/pages/doc-constructor/builder/builder-canvas.component.ts` (cdkDropList, cdkDropListConnectedTo) |
| Multi-select shift-click | `builder.page.ts:392-405` (`selectedIds: Set<string>` signal) |
| Margin resize via corners | `BlockRendererComponent` + `onBlockWidthChange` event |
| Proportional corner resize overlay images | `onOverlayResize` (imageWidth/imageHeight lock) |
| Background image + opacity | `template.backgroundImage[]` + `defaultBackgroundIndex` |
| View mode editor/preview | `viewMode` signal + toggle в toolbar |
| Auto-save 1.5s debounce | `save$` Subject → groupBy → debounceTime(1500) → switchMap |
| DataBinding (9 sources, 4 formats) | `backend/src/modules/template-block/template-block.schema.ts:13-42` + `DataBinding.Prop({enum})` |
| 6 block types | `block-type` enum: header/text/table/image/signature/spacer |
| Columns[] для grid layout blocks | `template-block.schema.ts:52-83` (`TemplateBlockColumn` schema) |
| Lucide icons в toolbar | `LucideAngularModule` imports |
| Status chip (idle/saving/saved/error) | BuilderPage:saveStatus signal + savedTick degenerate guard |

---

## 2. Что мы НЕ используем, но есть в open-source (ЭТО и есть предмет TZ-250)

Основные «дыры» в нашем UX/архитектуре (увидены через сравнение с референсами):

1. **Snap-to-element** между блоками (умные направляющие) — у нас только grid snap, нет alignment guides между элементами
2. **Bounding-box group selection** (multiple → drag together) — у нас multi-select есть, но нет визуального bounding-box + group move
3. **Rotation / rotate handles** — нет поворота overlay-элементов (только X/Y позиция)
4. **Zoom canvas (in/out)** — нет зума, плохо работать с большими A3 / landscape
5. **Drag-from-palette with slot indication** — у нас CDK работает с append-then-reorder, нет magic-insert между существующими блоками
6. **Inline-edit TipTap прямо в canvas** — у нас TipTap только в `/doc-constructor/texts`, в canvas текстовые блоки display-only контейнеры
7. **Plugin-driven Property Panel** — у нас hardcoded if/else в `BuilderInspectorComponent`, нет schema-driven генерации
8. **Shadow DOM isolation для preview** — CSS глобальный, в preview-режиме есть риск утечки Tailwind
9. **Block-level DSL на Zod** — у нас Mongoose, но `settings: Mixed` без валидации
10. **Unit converter (mm/pt ↔ px)** — нет pixel-perfect pdf-resolution mapping
11. **Keyboard navigation (arrow + Shift+arrow для перемещения блоков)** — нет
12. **Toolbar search / palette categories** — у нас простые три dropdown'а

---

## 3. КАТЕГОРИЗАЦИЯ ФИЧ + SOURCE MAPPING (где брать)

Ниже — фичи, разбитые на **12 непересекающихся категорий**, с точными raw-GitHub URL'ами к коду референсов и кратким указанием ЧТО читать в этом URL.

### Category 1 — Магнитное выравнивание и направляющие между элементами

**Что заимствуем:** Smart Guides — пунктирные направляющие линии, выскакивающие при drag overlay-блока, когда он попадает в одну линию X/Y с другим overlay-элементом или в его границы.

**Откуда брать:**
- **GrapesJS** (BSD-3-Clause) — `Sorter.ts` (snap-to-element реализован там) → https://github.com/GrapesJS/grapesjs/tree/master/packages/core/src/utils → ключевой механизм в `Sorter.ts`: методы `highlightRect`, опции `snapElement`, расчёт `hfPoint`, `hfOtherEl`. NB: путь может быть `Sorter.ts` или `sorter.js` в зависимости от версии; ищите строку с `highlightRect` в исходнике.
- **Puck** (MIT) — alignment helpers → https://github.com/puckeditor/puck/blob/main/packages/core/reducer.ts → reducer operations `insert`, `move` используют `getDropZones` для вычисления ближайшего слота с учётом bounding-box всех элементов.

**Как адаптируем в наш стек (Angular 20 + Signals):**
- Создаём `frontend/src/app/pages/doc-constructor/builder/intersection-guides.service.ts` — Angular service, который принимает `Signal<{id: string, rect: DOMRect}[]>` для всех overlay-блоков и текущий перетаскиваемый блок (sub-signal) → возвращает `Computed<{lines: {axis: 'x'|'y', position: number}[], snaps: {blockId: string, axis: 'x'|'y'}[], tolerance: number}>`.
- В `canvas-overlay-layer` добавляем `<div class="magnetic-guide">` элементы с `transform: translate3d(<px>px, <px>px, 0)` (GPU-ускорение).
- Логика: в `mousemove` handler (внутри `NgZone.runOutsideAngular`) проверяем delta < 5px → snap + emit один signal update → Angular CD триггерится только при изменении computed, не каждый frame.
- Default tolerance: **5px** (рекомендация GrapesJS default).

**Источники URL (для аудита):**
- https://github.com/GrapesJS/grapesjs
- https://github.com/puckeditor/puck
- ⚠️ Конкретный .ts файл нужно открыть через `https://raw.githubusercontent.com/GrapesJS/grapesjs/master/packages/core/src/utils/Sorter.ts` (если 404 — попробовать `.js`)

---

### Category 2 — Bounding-box group selection и rotation handles

**Что заимствуем:** Group selection — marquee-rect или shift-click — визуально обведён bounding-box (dashed border) вокруг всех выбранных; курсор при drag меняется на move; один dragHandle перемещает ВСЮ группу как единый объект. Также — corner rotate handle.

**Откуда брать:**
- **pdfme** (MIT) — использует `react-moveable` + `react-selecto` → https://github.com/pdfme/pdfme/tree/main/packages/ui/src/components/Designer → файлы `MoveableHandler.tsx`, `SelectoSetup.tsx`.
- **GrapesJS** — класс `SelectedComponent` → https://github.com/GrapesJS/grapesjs/tree/master/packages/core/src/canvas → файл `ToolbarButton.ts` (там рисует rotate handle).
- **Puck** — frame model с rotation prop → https://github.com/puckeditor/puck/blob/main/packages/core/types/Page.ts.

**Как адаптируем в наш стек:**
- Добавляем в `BuilderPage` `selectedBounds: Signal<{x: number, y: number, width: number, height: number} | null>` — вычисляется из `selectedBlocks()`.
- Создаём компонент `SelectionFrameComponent` (`frontend/src/app/pages/doc-constructor/builder/selection-frame.component.ts`) который рисует `<svg>` overlay с dashed border + 8 resize handles (4 corners + 4 edges) + rotate handle вверху.
- Для rotation — добавляем `<app-rotate-handle>` в углу; rotation = `atan2(mouseY - centerY, mouseX - centerX)` в класическом 0° = вверх, север; shift модификатор для snap к 15° шагам.
- Bounding-box move = при drag selection-frame, для всех `selectedBlocks[]` одновременно `overlayLeft -= deltaX / deltaY` (в одном delta-цикле), сохраняя relative offsets.

**Источники URL:**
- https://github.com/pdfme/pdfme
- https://github.com/puckeditor/puck
- https://github.com/GrapesJS/grapesjs/tree/master/packages/core/src/canvas (→ file `ToolbarButton.ts`)

---

### Category 3 — Canvas zoom (in/out) и pan

**Что заимствуем:** Zoom canvas через ctrl+scroll / +/- controls / trackpad pinch; extent 25-400%; keyboard shortcuts; zoom-to-fit-all-blocks.

**Откуда брать:**
- **Puck** — `packages/core/components/Page/index.tsx` имеет `useZoom` hook и `transform: scale(<zoom>)` wrapper.
- **GrapesJS** — `canvas/CanvasView.ts` метод `zoomCanvas(level)` + `setZoom()`.
- **react-doc-template-editor** — простой `zoomLevel` state в root + CSS transform.

**Как адаптируем:**
- Добавляем `zoom: Signal<number>` (default 1.0, range 0.25-4.0) в `BuilderPage`.
- В `builder-canvas.component.ts` оборачиваем `<pi-canvas-page>` в `transform: scale(<zoom>)` с `transform-origin: top center` + `padding-bottom` компенсирует scale.
- Pan при drag с space-held (как в Figma).
- Toolbar кнопки: `[Zoom][-][Fit][+]` в toolbar (между view-mode-toggle и dropdowns).
- Keyboard: `ctrl+plus` / `ctrl+minus` / `ctrl+0` (reset).
- localStorage persist в `pi-builder-zoom`.

**Источники URL:**
- https://github.com/puckeditor/puck/blob/main/packages/core/components/Page/index.tsx
- https://github.com/GrapesJS/grapesjs/tree/master/packages/core/src/canvas (→ `CanvasView.ts`, `Frame.ts`)

---

### Category 4 — Magic Insert / DropZones между существующими блоками

**Что заимствуем:** Drag-from-palette НЕ работает «append-then-reorder» (как у нас сейчас), а показывает `+ cards` highlighted между блоками при hover; drop на такой card вставляет точно в это место, без отдельного reorder request.

**Откуда брать:**
- **Puck** — ключевой файл `DropZone/index.tsx`: https://github.com/puckeditor/puck/blob/main/packages/core/components/DropZone/index.tsx. Использует `useDroppable` (dnd-kit) с slot index в аттрибуте.
- **pdfme** — Designer/AddNewItemButton.tsx.

**Как адаптируем:**
- Между каждыми двумя flow-блоками в `canvas-dropzone` добавляем `<div cdkDropList class="canvas-dropzone__insert-slot">` с явным ID, например `canvas-droplist-slot-3`.
- При hover'е palette item'а через этот slot — slot окрашивается в `--color-gold-soft` (аналогично нашему `cdk-drag-placeholder`).
- В CDK `connectedTo: ['canvas-droplist-slot-0', 'canvas-droplist-slot-1', ..., 'canvas-droplist-slot-N']` — все слоты связаны.
- CDK drop handler в `BuilderCanvasComponent` уже умеет вставлять на `event.currentIndex` — НО нам нужно знать slot ID (т.к. CDKDroplist index не соответствует slot position, slot = i+1). Маппинг через `slotNumber = dropIndex / 2`.
- Вставляем через новый `insertBlock(payload, slotNumber)` — БЕЗ последующего reorder, потому что индекс изначально правильный.

**Источники URL:**
- https://github.com/puckeditor/puck/blob/main/packages/core/components/DropZone/index.tsx
- https://github.com/pdfme/pdfme/tree/main/packages/ui/src/components/Designer

---

### Category 5 — Inline-edit TipTap прямо в canvas

**Что заимствуем:** Двойной клик по текстовому блоку в canvas → блок переключается в editing mode → TipTap инициализируется с inline toolbar (bold, italic, font size, color) → изменения попадают в `content` signal + trigger `save$`.

**Откуда брать:**
- **BlockNote** (MPL-2.0, но базовые идеи открыты) — `packages/core/src/editor/Editor.ts` — `BlockNoteEditor` с TipTap create'ом. https://github.com/TypeCellOS/BlockNote/tree/main/packages/core/src/editor.
- У нас уже есть TipTap через `/doc-constructor/texts` → паттерн reusable; нужен `TipTap block extension` с теми же ProseMirror плагинами для canvas.

**Как адаптируем:**
- В `frontend/src/app/pages/doc-constructor/builder/inline-edit.extension.ts` создаём TipTap extension, основанный на тех же ProseMirror плагинах, что в `text-blocks` редакторе.
- В `BlockRendererComponent`: `@Output() dblClick` → bubble → BuilderPage → switch block в editor-mode.
- В editor-mode: рендерим `<app-cdk-overlay>` поверх блока с `<tiptap-editor [content]=block.content (update)=onInlineEdit>` и набором floating кнопок (Bold, Italic, H1-H3, Font Size, Color, Bullet List, Insert Link).
- При blur или Escape: commit → `save$.next({ _id, patch: { content, contentJson } })` в нашу существующую debounce-инфраструктуру.

**Источники URL:**
- https://github.com/TypeCellOS/BlockNote/tree/main/packages/core/src/editor (→ `Editor.ts`, `BlockSchema.ts`)
- Наш собственный: `frontend/src/app/pages/doc-constructor/texts/` — pattern reuse

---

### Category 6 — Plugin-driven Property Panel (инспектор)

**Что заимствуем:** `BuilderInspectorComponent` сейчас — hardcoded if/elseif/else для каждого block type. Цель: каждый block type экспортирует свой `PropPanel<T>` descriptor, инспектор schema-driven рендерит форму.

**Откуда брать:**
- **pdfme** — `Plugin<T extends Schema>` интерфейс — https://github.com/pdfme/pdfme/blob/main/packages/common/src/types.ts (там `PropPanel<T>`, `PropPanelWidgetProps`). Каждый plugin декларирует:
  ```ts
  interface PropPanel<T extends Schema> {
    schema: (props) => Record<string, PropPanelSchema>;
    widgets?: Record<string, (props) => void>;
    defaultSchema: T;
  }
  ```
- **form-render** (используется pdfme) — JSON-schema-driven form generator.
- **react-doc-template-editor** — `getInspectorSchemaForBlock(type)` factory.

**Как адаптируем (Angular 20):**
- Создаём `frontend/src/app/shared/dsl/block-def/define-block.ts`:
  ```ts
  export interface BlockPropSchema { type: 'string'|'number'|'boolean'|'enum'|'range'|'color'|'select'; key: string; label: string; default?: any; min?: number; max?: number; options?: Array<{value: string, label: string}>; validators?: {min?: number, max?: number, pattern?: RegExp}; }
  export interface BlockDef<T extends TemplateBlock> { type: BlockType; sections: Array<{title: string, props: BlockPropSchema[]}>; }
  ```
- В `BlockRendererComponent`-sibling создаём `BlockRegistry` (Map<BlockType, BlockDef>) — каждый деф зарегистрирован через DI token.
- Property Panel = `*ngComponentOutlet` или `@switch` на type → рендерит секции через поля из BlockRegistry (без хардкода).
- DTO валидация на backend: `class-validator` decorators генерим из тех же schema objects (single source of truth).

**Источники URL:**
- https://github.com/pdfme/pdfme/blob/main/packages/common/src/types.ts (→ lines `PropPanel<T>`, `Plugin<T>`)
- https://github.com/pdfme/pdfme/tree/main/packages/ui/src/components/Designer/RightSidebar.tsx

---

### Category 7 — Shadow DOM isolation для Preview / Print Export

**Что заимствуем:** В preview-mode builder наш `@page` CSS может конфликтовать с глобальными Tailwind-классами приложения. Wrap canvas в Shadow DOM root.

**Откуда брать:**
- **Templatical** (MIT) — Shadow DOM encapsulation key strategy → https://github.com/templatical/sdk (поискать `ShadowRoot` / `attachShadow`).
- **pdfme** — Designer использует iframe для canvas (другой подход, но даёт ту же изоляцию).

**Как адаптируем:**
- В `PiCanvasPageComponent` (existing) добавляем `encapsulation: ViewEncapsulation.ShadowDom` — все `::ng-deep` теперь scope к этому canvas'у.
- CSS variables выносятся в `:host { --paper-var1: ... }` — глобальные доступны через inheritance.
- Или альтернативно: `<iframe srcdoc="...">` в preview-mode (zero trust assumption про isolation).

**Источники URL:**
- https://github.com/templatical/sdk
- https://github.com/pdfme/pdfme/tree/main/packages/ui/src/components/Designer (iframe approach)

---

### Category 8 — Block-level DSL (Zod-style schema для settings)

**Что заимствуем:** Поле `settings: Record<string, unknown>` в Mongoose валидируется Zod-схемой per block type — строгая типизация + auto-error на bad data.

**Откуда брать:**
- **pdfme** — `packages/common/src/schema.ts` — все Plugin types основаны на Zod schemas.
- **BlockNote** — `BlockSchema = Record<string, AttributeSpec>` (TipTap attrs).
- **Puck** — `Field` types в `packages/core/types/Fields.ts`.

**Как адаптируем:**
- На backend NestJS создаём `backend/src/modules/template-block/settings-schemas.ts` — Zod schemas per BlockType.
  ```ts
  export const ImageBlockSettings = z.object({
    imageUrl: z.string().url(),
    overlay: z.boolean().default(false),
    overlayLeft: z.number().optional(),
    overlayTop: z.number().optional(),
    imageWidth: z.number().optional(),
    imageHeight: z.number().optional(),
    width: z.number().min(0).max(100).default(100),
    marginLeft: z.number().optional(),
  });
  ```
- В Mongoose hook pre-save: `validateSettings(block.type, block.settings)` → throw 400 при invalid.
- На frontend: те же Zod schemas shared через `frontend/src/app/shared/dsl/block-def/*.schema.ts` (через codegen или ручное зеркало) → typescript-typed autocomplete.

**Источники URL:**
- https://github.com/pdfme/pdfme/blob/main/packages/common/src/schema.ts
- https://github.com/TypeCellOS/BlockNote/tree/main/packages/core/src/api/blockTypes (→ BlockSpec Zod schemas)

---

### Category 9 — ElementBase contract (один источник истины для всех блоков)

**Что заимствуем:** Один абстрактный класс `ElementBase` — все block type'ы имплементируют `getPosition()`, `setPosition()`, `getSize()`, `setSize()`, `serialize()`, `deserialize()`. Централизует общую логику.

**Откуда брать:**
- **ReportBro** (AGPL/commercial) — JS plugin; идеи из README: каждый element type наследует от `ElementBase`. https://github.com/jobsta/reportbro-designer.
- **GrapesJS** — `Backbone.Model` для компонентов → каждый model имеет `get`, `set`, `toJSON`.

**Как адаптируем (TypeScript):**
- Создаём `backend/src/modules/template-block/element-base.interface.ts` (DTO-mixin-friendly).
- На frontend `frontend/src/app/shared/dsl/element-base.ts`:
  ```ts
  export abstract class ElementBase<T extends TemplateBlock = TemplateBlock> {
    abstract get id(): string;
    abstract get type(): BlockType;
    abstract getPosition(): { left: number, top: number };
    abstract setPosition(p: { left: number, top: number }): void;
    abstract getSize(): { width: number, height: number };
    abstract setSize(s: { width: number, height: number }): void;
    abstract toJSON(): T;
  }
  ```
- Каждый block type factory (`createTextBlock()`, `createTableBlock()`, ...) возвращает subclass of ElementBase.

**Источники URL:**
- https://github.com/jobsta/reportbro-designer
- https://github.com/GrapesJS/grapesjs/tree/master/packages/core/src/dom_components (→ `Component.ts`, `Model.ts`)

---

### Category 10 — Unit conversion (mm/pt ↔ px) для pixel-perfect PDF

**Что заимствуем:** При изменении PAGE_SIZE с A4 → A3 конвертируем все absolute coordinates (overlayLeft, overlayTop, imageWidth, imageHeight) по формуле нового размера.

**Откуда брать:**
- **pdfme** — `packages/converter` — функции `mm2px`, `px2mm`, `pt2px`, `px2pt`. https://github.com/pdfme/pdfme/tree/main/packages/converter.
- **ReportBro** — аналогично в своих утилитах.

**Как адаптируем:**
- Создаём `frontend/src/app/shared/dsl/unit-converter.ts`:
  ```ts
  // at 96 DPI: 1mm = 3.7795 px, 1pt = 1.333 px (for A4 210mm = 794px)
  const MM_TO_PX = 3.7795275591;
  const PX_TO_MM = 0.2645833333;
  ```
- При ON_PAGE_SIZE_CHANGE event: для каждого overlay-блока делаем `overlayLeft = oldLeft * newRatio`/`oldRatio`.
- Сохраняем как есть в БД (нет смысла хранить в mm — UI работает с px).

**Источники URL:**
- https://github.com/pdfme/pdfme/tree/main/packages/converter

---

### Category 11 — Keyboard navigation и accessibility

**Что заимствуем:** Arrow keys = move selected block; Shift+arrow = move 10px (snap to grid); Delete → delete; Ctrl+D → duplicate; Tab → cycle selection; Ctrl+Z / Ctrl+Y → undo/redo.

**Откуда брать:**
- **Puck** — `useKeyEvent` hooks в `packages/core/`.
- **BlockNote** — custom keymap в TipTap (`addKeyboardShortcuts`).
- **GrapesJS** — `Canvas.getWindow()` listener с keymap.

**Как адаптируем:**
- В `BuilderPage` создаём `@HostListener('document:keydown', ['$event'])` с switch.
- Если `viewMode() === 'editor'` + selectedId !== null + не editing-mode → arrow-keys move overlay block by `gridSize` (Shift = 10x).
- Delete → existing `onDeleteBlock(selectedId)`.
- Undo/Redo — нужно добавить undo-stack в `BuilderPage` (отдельная TZ: TZ-251-undo-redo).

**Источники URL:**
- https://github.com/puckeditor/puck/tree/main/packages/core (search `useKeyEvent` or `keydown`)
- https://github.com/TypeCellOS/BlockNote (TipTap keyboard extension docs)

---

### Category 12 — Toolbar UX: search, shortcuts, palette categories, no-code components

**Что заимствуем:** Toolbar / palette со встроенным fuzzy-search (как VSCode command palette), категориями с icons, keyboard shortcuts для вставки. Также паттерн **No-Code Components** (ограниченные блоки с типизированными полями theming-ready) и **Form-style data binding/validation inside documents**.

**Откуда брать:**
- **BlockNote** — Slash menu (Cmd+/ или `/` keystroke → ввод имён блоков).
- **GrapesJS** — Block Manager с категориями + Search (Ctrl+F).
- **easyblocks** (AGPL-3.0, ~563 ⭐) — No-Code Components: typed fields, theming, templates, **data sources** (map outer entity на компонент), **localisation** (i18n per block), **history management**. URL: https://github.com/easyblockshq/easyblocks — особенно полезно для нашего `EasyBlock<T>` concept (DataBinding + UI field schema + typed range).
- **HeyForm** (AGPL-3.0, ~8.9k ⭐) — drag-drop form-style builder, **conditional fields** (show/hide block по значению другого поля), **input validation** в реальном времени, **integrations** (webhook на submit). URL: https://github.com/heyform/heyform — применимо для **Display Conditions DSL** в Document (например: показать блок «Director Signature» только если `dataBinding.order.requiresSignature = true`).

**Как адаптируем:**
- **Toolbar + palette popup:** В `BuilderToolbar` (или новый `<app-palette-popup>`) добавляем input с fuzzy-search по наименованиям text-block / table-template. Cmd+K открывает popup centered on screen. Fuzzy-search с `fuse.js` (lightweight, 6KB). Категории в popup: «Текст» / «Таблицы» / «Изображения» / «Отступы» / «Подписи» / «DataBinding fields». Enter → insert; Escape → close.
- **Display Conditions DSL** (от HeyForm): Создаём `frontend/src/app/shared/dsl/display-conditions.ts` с синтаксисом типа `if (order.value > 10000) show 'director-signature' else hide`. Хранится в `TemplateBlock.settings.displayCondition?: string`. Backend резолвит условие при render-time → рендерит только visible blocks.
- **No-Code Components (theming scaffold):** Создаём generic wrapper `<app-no-code-block [def]="def" [value]="value" (change)="onChange">` который рендерит preset'ы из `easyblocks` концепции (SingleField, MultiField, ColorPicker, RangeSlider, ToggleGroup, DatePicker). Позволяет external consumer'ам добавлять свои inspector tabs через DI registry.
- **Localisation**: добавляем i18n keys в наш `i18n/` (на материал-стиле проект уже имеет); `block.title` i18n-ready через `{ key, label, default }` shape.

**Источники URL (аудит-чеклист):**
- https://github.com/TypeCellOS/BlockNote (slash menu impl)
- https://github.com/GrapesJS/grapesjs/tree/master/packages/core/src/block_manager
- https://github.com/easyblockshq/easyblocks (проверить: `packages/core/src/blocks/`, `packages/core/src/theming/`, `packages/core/src/localization/` paths)
- https://github.com/heyform/heyform (проверить: `packages/formula/src/` для conditional logic, `packages/validator/src/` для input validation rules)

---

## 4. ПОЭТАПНЫЙ ПЛАН ВНЕДРЕНИЯ (Incremental Rollout — без «каши»)

Каждая фаза = отдельный sub-TZ (TZ-250.1, .2, ...). Phase 1 — foundation. Phase 9 — последняя polish.

| Phase | Name | Что делаем | Effort | Зависит от | Source refs |
|-------|------|------------|--------|------------|-------------|
| **TZ-250.1 (Foundation)** | ElementBase + Zod settings schema | Унификация блоков через ElementBase; Zod-валидация settings на backend + frontend | 8h | — | Cat 8, 9 |
| **TZ-250.2 (Canvas UX)** | Canvas zoom + pan | Toolbar zoom controls; ctrl+/ctrl-/ctrl+0; space+drag pan; localStorage persistence | 6h | 250.1 | Cat 3 |
| **TZ-250.3 (Selection v2)** | Bounding-box group + rotate | SelectionFrameComponent; rotate handle с shift-15° snap; group drag | 8h | 250.1 | Cat 2 |
| **TZ-250.4 (Smart Guides)** | Snap-to-element magnetic guides | IntersectionGuidesService; magnetic-guide DOM lines; 5px tolerance | 6h | 250.3 | Cat 1 |
| **TZ-250.5 (Magic Insert)** | DropZones между блоками | canvas-droplist-slot-N + connectedTo[]; прямой insert без reorder | 4h | — | Cat 4 |
| **TZ-250.6 (Inline-edit)** | TipTap edit прямо в canvas | Double-click → TipTap editor; floating toolbar; blur → save$ | 10h | 250.1 | Cat 5 |
| **TZ-250.7 (Prop Panel v2)** | Plugin-driven schema panel | BlockDef registry; dynamic form rendering; class-validator mirror | 12h | 250.1 | Cat 6 |
| **TZ-250.8 (Isolation)** | Shadow DOM / iframe preview | ViewEncapsulation.ShadowDom or iframe srcdoc | 4h | — | Cat 7 |
| **TZ-250.9 (A11y)** | Keyboard nav | Arrow + Shift+arrow + Delete + Ctrl+D in viewMode=editor | 4h | 250.3 | Cat 11 |
| **TZ-250.10 (Toolbar v2)** | Search palette + Cmd+K | Fuzzy-search popup; categories; keyboard shortcuts | 6h | — | Cat 12 |
| **TZ-250.11 (Units)** | Unit converter | mm/pt ↔ px utility; auto-rescale на page size change | 3h | 250.1 | Cat 10 |
| **TZ-250.12 (Undo/Redo)** | History stack | Optional but recommended; Tz-251 follow-up. | (separate) | 250.6, 250.7 | — |

**Total:** ~71h (≈ 9 working days). Один TZ может брать 1-3 phases максимум. Каждая фаза имеет acceptance criteria + Jest/integration tests.

---

## 5. КАКИЕ КОНКРЕТНО DSL/ПАТТЕРНЫ МЫ ПЕРЕНОСИМ

Сводка наиболее ЭЛЕГАНТНЫХ паттернов из референсов, с прямой командой куда применять:

| Паттерн | Источник (URL) | Применяем в Phase |
|---------|----------------|-------------------|
| `Plugin<T extends Schema>` с `propPanel.schema` + `widgets` + `defaultSchema` | https://github.com/pdfme/pdfme/blob/main/packages/common/src/types.ts (см. `Plugin<T>`, `PropPanel<T>` интерфейсы) | TZ-250.7 (Prop Panel v2) |
| TipTap `Node.create({ attrs, parseHTML, renderHTML })` для BlockSpec | https://github.com/TypeCellOS/BlockNote/tree/main/packages/core/src | TZ-250.6 (Inline-edit) |
| `DropZone` slot with `useDroppable` + `slotIndex` attr | https://github.com/puckeditor/puck/blob/main/packages/core/components/DropZone/index.tsx | TZ-250.5 (Magic Insert) |
| Sorter.ts: `highlightRect`, `snapElement`, `hfPoint` alignment | https://github.com/GrapesJS/grapesjs/blob/master/packages/core/src/utils/Sorter.ts | TZ-250.4 (Smart Guides) |
| Shadow DOM encapsulation key | https://github.com/templatical/sdk | TZ-250.8 (Isolation) |
| `ElementBase` class with single source of truth | https://github.com/jobsta/reportbro-designer (`src/elements/ElementBase.js`) | TZ-250.1 (Foundation) |
| `mm/pt/px` converter + `basePdfTTFembed` font handling | https://github.com/pdfme/pdfme/tree/main/packages/converter | TZ-250.11 (Units) |
| `pdf-lib`-based generator with `Schema` validation | https://github.com/pdfme/pdfme/blob/main/packages/generator/src | Optional (Phase 13 — print preview refactor) |
| `createInvoiceTemplate()` preset + `serializeTemplate` round-trip | https://github.com/Handiers/react-doc-template-editor | TZ-250.10 (Toolbar v2) |
| dnd-kit-based palette via `useDraggable` + slot system | https://github.com/pdfme/pdfme + Puck | TZ-250.5, 250.10 |
| Form-render JSON-schema-driven form generation | https://xrender.fun/form-render | TZ-250.7 (Prop Panel v2) |

---

## 6. РИСКИ И МЕРЫ СНИЖЕНИЯ (специфично для нашего стека)

### Risk 1 — CDK DragDrop conflict с custom resizers
**Проблема:** `cdkDrag` + кастомные resize-handle на углах → проскакивают события, перерасход CPU.
**Из pdfme/GrapesJS/Puck опыта:** resize-handle должно использовать `.stopPropagation()` + `.preventDefault()`, навешиваться в `NgZone.runOutsideAngular` через `document:mousemove` listener.
**Действие:** Wrap resize-handle в `Directive (selector: '[appResizeHandle]')`, который регистрирует `DocumentMouseMove` через `inject(DOCUMENT)` + `runOutsideAngular`.

### Risk 2 — Zone.js trigger explosion при Smart Guides
**Проблема:** `mousemove` на каждом пикселе → Change Detection → FPS degrade.
**Действие:** Все расчёты guides живут в одном `WritableSignal<{lines: Line[]}>` updated через `requestAnimationFrame` throttling (16ms). Линии рисуются через `transform: translate3d(...)` (compositor-only).

### Risk 3 — Mongoose Mixed type vs Zod validation mismatch
**Проблема:** `settings: Mixed` в БД содержит legacy данные без Zod schema.
**Действие:** Mongoose hook pre-save → `validateSettings(block.type, block.settings)` (Zod parse с `safe` mode). Если fail → `.default(settings)` мигрирует unknowns в defaults. Не падать preview — лог в `console.warn`.

### Risk 4 — Autosave desync при inline-edit (Phase 6)
**Проблема:** TipTap fires updates на каждом keystroke → `save$.next` → debounce 1.5s. Между blur и final-commit — потеря.
**Действие:** `editingMode: Signal<blockId | null>` в BuilderPage. При editing — `cdkDrag` disabled visually + `save$` сразу `flush` через `.complete()`. Реализовать `flush$` как отдельный Subject связанный с debounceFlush.

### Risk 5 — Shadow DOM ломает Angular Material dialogs
**Проблема:** Material dialogs (за пределами shadow DOM) не наследуют CSS scope.
**Действие:** Dialogs выносим за пределы shadow root в body (Angular CDK overlay делает это автоматически — проверить). Если проблема → fallback на iframe.

### Risk 6 — Rotation handle на overlay блоке ведёт к CPS некрасивым presetations в PDF render
**Проблема:** HTML+CSS могут поворот, а backend render-to-HTML НЕ повторяет transform rotation.
**Действие:** Уточнить в `document-template.service.ts:renderHtml()` — добавить поддержку `transform: rotate(Xdeg)` через inline style на `<div>` обёртке.

---

## 7. Acceptance Criteria для каждой фазы (что должен сделать каждая TZ)

### TZ-250.1 (Foundation) → DONE when
- [ ] `ElementBase<T extends TemplateBlock>` abstract class существует в `shared/dsl/element-base.ts`
- [ ] `BlockRegistry` — Map<BlockType, BlockDef> с минимум 2 test entries (TextBlock, ImageBlock)
- [ ] `backend/src/modules/template-block/settings-schemas.ts` — Zod schemas для image/text/table с unit-тестами validation
- [ ] Mongoose pre-save hook validates `settings` against Zod (или legacy migration path documented)
- [ ] 100% jest tests pass + 100% TSC clean + ESLint clean

### TZ-250.4 (Smart Guides) → DONE when
- [ ] При drag overlay-блока на 5px к границе другого overlay-блока — появляются dashed lines
- [ ] Snap-логика возвращает блок на ту же position
- [ ] Visual guides НЕ триггерят CD на каждом frame (FPS 60+ в browser-use agent screenshot)
- [ ] Spec test на IntersectionGuidesService (5+ cases)

### TZ-250.6 (Inline-edit) → DONE when
- [ ] Double-click на text-блок → TipTap editor inline
- [ ] Bold/Italic/H1/H3/Font size/Color/Bullet list в floating toolbar
- [ ] Blur → content commits → save$ → 1.5s debounce → backend update
- [ ] Esc → cancel without commit
- [ ] Editing-mode блокирует canvas drag (block нельзя случайно переместить)

### TZ-250.7 (Prop Panel v2) → DONE when
- [ ] `BuilderInspectorComponent` редуцирован: убраны хардкодные if/elseif для text/table/image
- [ ] Новый `<app-schema-panel [def]="blockDef" [value]="block">` рендерит fields деklаративно
- [ ] Изменение field → emit → debounced save$
- [ ] Type-driven: добавление нового block type = register BlockDef + DTO Zod schema

---

## 8. CHECKLIST для будущего ИИ (что и где смотреть)

```
Step 1 — Прочитать:
  - /docs/pages/builder.page.md
  - /frontend/src/app/pages/doc-constructor/builder/builder.page.ts (main shell)
  - /frontend/src/app/pages/doc-constructor/builder/builder-canvas.component.ts
  - /backend/src/modules/template-block/template-block.schema.ts

Step 2 — Прочитать reference URLы (по очереди по phase scope):
  - Phase 1: pdfme/common/types.ts, jobsta/reportbro-designer src/elements
  - Phase 2-4: GrapesJS Sorter.ts, puck/components
  - Phase 5: BlockNote Editor.ts, Node.create pattern
  - Phase 6: pdfme common/types.ts (PropPanel<T>)
  - Phase 7: Templatical sdk (Shadow DOM)
  - Phase 8: TypeCellOS BlockNote (TipTap keyboard extensions)
  - Phase 9: easyblocks (categories tree)

Step 3 — Прежде чем писать код, проверить:
  ☐ Существующая Functionality (раздел 1) — НЕ дублировать
  ☐ Существующие signal-based state в BuilderPage — не использовать BehaviorSubject для нового состояния
  ☐ CDK DragDrop уже работает — не дублировать логику
  ☐ Lucide icons уже импортированы — использовать для новых кнопок
  ☐ save$ Subject — для всех autosave новых полей

Step 4 — Implementation:
  ☐ Создать Zod schemas в shared/dsl/block-def/*.schema.ts И backend/src/modules/template-block/settings-schemas.ts
  ☐ Добавить BlockFactory (createXxxBlock) factories
  ☐ Добавить spec tests (Jest) — минимум 5 cases на service
  ☐ Добавить integration test на сам component (TestBed.overrideComponent)
  ☐ Не ломать TSC; проверять ESLint rules TZ-232.I (не импортировать HttpClient в *.component.ts / *.page.ts)
  ☐ Не загружать .aspect-auto-свойства settings без Zod validation

Step 5 — Validate:
  ☐ pnpm exec tsc -p tsconfig.app.json --noEmit = 0 errors
  ☐ pnpm exec jest -t "builder" — all pass
  ☐ pnpm exec eslint src/ — clean
  ☐ Browser visual sanity check через browser_use agent — canvas renders, blocks selectable, autosave works
```

---

## 9. Cross-references

- **TZ-232.B** (defineEntity, DONE) — block factories можно типизировать через `defineEntity()` schema для единообразия с EntityService DSL pattern.
- **TZ-232.C** (`<pi-entity-list>` POC, DONE) — поверхностное сходство, но builder — это composition pattern, не list pattern. Не копировать — разные проблемы.
- **TZ-232.I** (ESLint Safety Rules, DONE) — все новые файлы должны ПРОХОДИТЬ `pi-dsl/no-raw-http-in-components` + `pi-dsl/no-implements-oninit-in-pages` rules.
- **TZ-247** (Backend Idempotency, DONE) — при создании новых endpoints для Zod validation использовать idempotent middleware patterns.
- **TZ-104.4.2** (Lookup Table primitives, DONE) — если потребуется вставить searchable dropdown в new prop panel — переиспользовать ``<pi-table>`.
- **TZ-240** (Frontend Subset Cleanup, DONE 2026-07-28) — стиль coding conventions on frontend subset: standalone components, signals (not BehaviorSubject), DI tokens, NO `implements OnInit`, NO raw HttpClient in components.

---

## 10. META для AI Executor

**Если ты будущий AI, читающий этот документ:**

1. Не пытайся внедрить ВСЕ сразу — бери ровно одну Phase за раз.
2. Каждая Phase — отдельный sub-TZ, оформляется по шаблону TZ-232 series.
3. Прежде чем предлагать решения по разделам 1-12, прочитай reference URL — ищи сырой код, не маркетинговый README.
4. Не дублируй существующий функционал (раздел 1) — это waste.
5. Используй сигналы, НЕ BehaviorSubject; используй CDK Drag&Drop, НЕ dnd-kit (миграция неоправдана); используй Lucide, НЕ Material Icons (миграция неоправдана).
6. Проверяй риски раздела 6 перед каждым изменением, добавляй mitigation сразу.
7. Каждая фаза имеет test coverage ≥ 80% + 0 TSC errors.
8. После завершения фазы — обнови TZ-250 этот файл (раздел 4 timestamps + checklist из раздела 7).

---

### 11. LIFECYCLE ARTIFACTS PLAN (Оркестрация и приёмка)

Когда любая фаза TZ-250.N поступит в работу, по нашему OrchestratorKit-протоколу должны появиться:

| Artifact | Path | Status on day-1 (этот TZ план) | Status когда фаза N выполнена |
|----------|------|--------------------------------|-------------------------------|
| TZ spec файл | `tasks/TZ-250.md` (либо per-phase: `tasks/TZ-250.N.md`) | ✅ создан — `tasks/TZ-250-builder-improvements-from-reference-projects.md` | updates per phase |
| Kit stub | `OrchestratorKit/TZ-250.txt` | 🔴 нет — создаётся при ASSIGN первой фазы (TZ-250.1) | ✅ создан → после DONE удаляется |
| Roadmap обновление | `OrchestratorKit/ROADMAP.md` | 🔴 нет | добавить line: `TZ-250 — Builder Improvements (multi-phase) — Layer 2, IN PROGRESS` |
| STATUS.md bullet | `OrchestratorKit/STATUS.md` | 🔴 нет | добавляется при DONE первой фазы |
| progress.md entry | `progress.md` | 🔴 нет | добавляется при каждой фазе DONE |
| ARCHITECTURE.md zone | `ARCHITECTURE.md` | 🔴 нет | добавляется для каждой завершённой фазы (кратко, 200-400 слов на зону) |
| Archive marker (per phase) | `OrchestratorKit/_archive/2026-07/TZ-250.<N>.done.txt` | 🔴 нет | при phase DONE (ARCHIVE_MARKER YAML + retrospective) |
| Lock file (per phase) | `.mimocode/locks/TZ-250.N-*.lock` | 🔴 нет | при phase DONE — Owner + 5 Protected + 5 Unlock successors |

**Acceptance gate для каждой фазы (когда фаза считается DONE):**
1. Все acceptance criteria из раздела 7 выполнены (applicable ones).
2. `pnpm exec tsc -p tsconfig.app.json --noEmit` = 0 errors.
3. Targeted jest suite = 100% pass.
4. ESLint TZ-232.I rules cleanly satisfied (нет raw `HttpClient` в `*.component.ts`, нет `implements OnInit` в `*.page.ts`).
5. browser_use agent visually verifies canvas render + edit cycle (одна итерация: open template → add block → drag → save → reload page → state restore). Screenshot сохраняется в `tasks/_archive/2026-07/TZ-250.N-evidence/01-canvas-render.png`.
6. Lifecycle artifacts (table above) обновлены перед commit'ом.
7. git commit format: `feat(builder): TZ-250.<N> <short description>` (одна фаза = один PR).

**Candidate branch naming (по Conventions, раздел 9):**
- Phase 1: `feature/tz-250-1-element-base-zod`
- Phase 2: `feature/tz-250-2-canvas-zoom-pan`
- Phase 3: `feature/tz-250-3-bounding-box-rotation`
- Phase 4: `feature/tz-250-4-smart-guides`
- Phase 5: `feature/tz-250-5-magic-insert`
- Phase 6: `feature/tz-250-6-inline-edit-tiptap`
- Phase 7: `feature/tz-250-7-prop-panel-v2`
- Phase 8: `feature/tz-250-8-shadow-dom-isolation`
- Phase 9: `feature/tz-250-9-keyboard-a11y`
- Phase 10: `feature/tz-250-10-palette-search`
- Phase 11: `feature/tz-250-11-unit-converter`
- Phase 12: `feature/tz-250-12-undo-redo` ← возможно отдельный follow-up TZ-251

---

### 12. SOURCE-OF-TRUTH INDEX (ALL 10 PROJECTS WITH AUDIT-LEVEL STATE)

Финальная сводная карта «проект → что берём → куда - какой Phase», чтобы AI никогда не терял контекст:

| # | Project | Stars | License | GitHub URL | Берём (Tech/UX) | → Phase |
|---|---------|-------|---------|------------|------------------|---------|
| 1 | pdfme | ~4.7k | MIT | https://github.com/pdfme/pdfme | `Plugin<T extends Schema>` треугольник pdf/ui/propPanel; unit converter; form-render-based inspector | 250.7 + 250.11 |
| 2 | GrapesJS | ~26k | BSD-3-Clause | https://github.com/GrapesJS/grapesjs | Sorter с highlightRect + snapElement (smart guides); SelectedComponent bounding-box toolbar (rotate handle); Block Manager + категории; ProjectData JSON | 250.3 + 250.4 + 250.10 |
| 3 | BlockNote | ~3.3k | MPL-2.0/GPL | https://github.com/TypeCellOS/BlockNote | Custom block TipTap extension `Node.create({attrs, parseHTML, renderHTML})`; `addKeyboardShortcuts` extension | 250.6 + 250.9 |
| 4 | Puck | ~13k | MIT | https://github.com/puckeditor/puck | `DropZone` slot pattern с magic-insert; `useZoom` hook (transform: scale); frame model + Slot | 250.2 + 250.5 |
| 5 | Templatical | ~small | MIT | https://github.com/templatical/sdk | Shadow DOM изоляция блоков; merge tags (DataBinding analogue); display conditions DSL | 250.8 |
| 6 | react-doc-template-editor | small | MIT | https://github.com/Handiers/react-doc-template-editor | `createInvoiceTemplate()` preset; `serialize`/`deserialize` round-trip | 250.10 + 250.12 |
| 7 | ReportBro | — ⚠️ | AGPL/commercial | https://github.com/jobsta/reportbro-designer | `ElementBase` class как single source of truth для block types | 250.1 |
| 8 | invoice-template-creator | small | MIT | https://github.com/hashiqvh/invoice-template-creator | GrapesJS для invoice-specific blocks (пример config) | 250.10 (reference impl) |
| 9 | easyblocks | ~563 | AGPL-3.0 ⚠️ | https://github.com/easyblockshq/easyblocks | No-Code Components concept; typed fields; theming; data sources mapping; localisation | 250.7 + 250.10 |
| 10 | HeyForm | ~8.9k | AGPL-3.0 ⚠️ | https://github.com/heyform/heyform | Conditional fields (display conditions DSL); real-time input validation; form-style data binding inside documents | 250.12 + (bonus) introspect validation |

⚠️ **License notes:** ReportBro и easyblocks и HeyForm — AGPL. Мы **НЕ** копируем их код, а только заимствуем **паттерны и идеи**. Реализуем своими силами в Angular 20 + NestJS. У AGPL нет риска contamination пока мы не копируем строки дословно.

---

**END OF TZ-250 SPEC (Plan).**
