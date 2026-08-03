# Компонент: Инспектор свойств (BuilderInspectorComponent)

**Краткое описание:** Правая панель «Свойства» конструктора. Visual canon Paper & Ink.
Signal-bound поля; родитель (`BuilderPage`) делает PATCH.

## Route

Нет собственного роута. Дочерний `BuilderPage`.

```
BuilderPage
├── BuilderToolPaneComponent     (слева, rail + flyout)
├── BuilderCanvasComponent       (центр)
└── BuilderInspectorComponent   ← этот компонент (справа, 320px)
```

## API endpoints

Прямых вызовов нет, кроме upload изображения блока через `TemplateBlocksService.uploadImage` (DOC-333). Остальные изменения — outputs родителю.

## Inputs (основные)

| Input | Тип | Назначение |
|-------|-----|-----------|
| `block` | `TemplateBlock \| null` | Single-select блок |
| `selectedCount` / `selectedBlocks` | multi | Multi-select |
| `templateSelected` / `template` | template mode | Свойства шаблона |
| `allBlocks` | `TemplateBlock[]` | Сводка + layer order |
| `snapEnabled` / `gridSize` / `boundaryPadding` | snap | Привязка к сетке |
| `grouped` | `boolean` | Badge / ungroup |

## Outputs (основные)

`update`, `delete`, `deleteSelected`, `editSelected`, `templateUpdate`, `uploadBackground`, `removeBackground`, `setDefaultBackground`, `snapSettingsChange`, `closePanel`, `layoutOrderChange`, `groupSelected`, `ungroupSelected`, `multiMarginUpdate`, `marginReset`.

## Режимы IA (DOC-332)

Один chrome: `.insp-section` + `data-test="insp-section-header"`.

| Mode | Условие | Секции сверху вниз |
|------|---------|-------------------|
| **A Document** | нет блока, count=0, не template | Контекст («Документ» + сводка) → Привязка к сетке |
| **B Template** | `templateSelected` | Контекст («Шаблон») → Стиль страницы → Фон |
| **C Multi** | count>0, нет single block | Контекст → Геометрия (+lock) → Группа → Слой → Опасная зона |
| **D Single** | `block` set | Контекст → **Геометрия (+lock)** → Содержимое → Стиль → Слой → Опасная зона |

### Geometry lock (2026-08-03)

- Toggle «Заблокировать / Разблокировать» в «Геометрия» → PATCH `{ locked }`.
- При `selectionLocked()`: geometry inputs, margins, layer buttons, delete, image overlay — disabled.
- Смысл: поставить блок → закрепить → не сдвинуть мышкой случайно (не путать с preview).

Правила:

- Empty: нет hero «Ничего не выбрано»; hint допустим под сводкой.
- Single: Edit (outline) в «Содержимое»; Delete только в «Опасная зона».
- Snap + pageNumbering → `app-pi-switch` (не native checkbox).
- Image overlay XY не дублирует layout XY (layout побеждает).

## Состояния

| Состояние | UI |
|-----------|-----|
| Empty / document | Mode A |
| Template selected | Mode B + close в header |
| Multi-select | Mode C |
| Single select | Mode D |

## Особенности

- Signal-bound, без FormGroup; `effect()` гидратирует поля при смене блока.
- Layer: компактный icon-toolbar (front/raise/lower/back).
- Upload/reset: ink outline + sunrise-soft hover (как tool-pane).
- Readonly badges: `tableTemplateId`, dataBinding source/field; optional «В группе» при `groupId`.

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-86 Phase D.1 | Базовый инспектор |
| TZ-DOC-311 | Cleanup TOC/header/footer; pageNumbering остаётся |
| TZ-DOC-333 | Upload-first photo persist |
| **TZ-DOC-332** | IA modes A–D + visual canon parity with tool-pane |

---

_Обновлено: 2026-08-02 (DOC-332)._
