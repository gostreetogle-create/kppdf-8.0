# Компонент: Инспектор свойств (BuilderInspectorComponent)

**Краткое описание:** Правая боковая панель (320px) с редактором свойств выбранного блока на холсте. Сигнал-связанные поля (без FormGroup), каждое изменение через `effect()` эмитит `(update)` родителю.

## Route

Нет собственного роута. Всегда рендерится как дочерний компонент `BuilderPage`.

```
BuilderPage (3-pane layout)
├── BuilderToolPaneComponent     (слева, 280px)
├── BuilderCanvasComponent       (центр)
└── BuilderInspectorComponent   ← этот компонент (справа, 320px)
```

## API endpoints

Нет прямых API-вызовов. Все изменения эмитятся родителю (`BuilderPage`), который делает PATCH через `TemplateBlocksService`.

## Inputs

| Input | Тип | Назначение |
|-------|-----|-----------|
| `block` | `TemplateBlock \| null` | Текущий выбранный блок (null = ничего не выбрано) |
| `selectedCount` | `number` | Количество блоков в multi-select режиме |

## Outputs

| Output | Тип данных | Назначение |
|--------|-----------|-----------|
| `update` | `Partial<TemplateBlock> & { _id: string }` | Изменение поля блока (из сигнала) |
| `delete` | `string` | Удалить блок по _id |
| `deleteSelected` | `void` | Удалить все выбранные (multi-select) |
| `editSelected` | `void` | Открыть редактор (текст/таблица) |

## Редактируемые поля (по типу блока)

### Общие (все типы, кроме spacer)

| Поле | Контрол | Сигнал |
|------|---------|--------|
| `title` | `<input type="text">` | `title` |
| `isActive` | `<app-pi-switch>` | `isActive` |
| `showLine` | `<app-pi-switch>` | `showLine` |

### text / header

| Поле | Контрол | Сигнал |
|------|---------|--------|
| `content` | `<textarea rows="6">` | `content` |

### image / signature

| Поле | Контрол | Сигнал |
|------|---------|--------|
| `height` | `<input type="number">` | `height` |

### spacer

| Поле | Контрол | Сигнал |
|------|---------|--------|
| `height` | `<input type="range">` + `<input type="number">` | `height` |

### table

| Поле | Контрол | Сигнал |
|------|---------|--------|
| `settings.tableTemplateId` | readonly badge (неизменяемо) | `settingsTableId` (computed) |

### dataBinding

| Поле | Контрол | Сигнал |
|------|---------|--------|
| `dataBinding.source` | readonly badge | — |
| `dataBinding.field` | readonly badge | — |
| `dataBinding.format` | `<app-pi-select>` (text/date/currency/number) | `onFormatChange` |
| `dataBinding.value` | `<input type="text">` (только для source='static') | `bindingValue` |

## Состояния

| Состояние | Условие | Отображается |
|-----------|---------|-------------|
| **Empty** | `block === null && selectedCount === 0` | «Ничего не выбрано» + hint |
| **Multi-select** | `block === null && selectedCount > 0` | «Выбрано: N» + кнопка «Удалить» |
| **Single select** | `block !== null` | Форма редактирования |

## Особенности

- **Signal-bound, без FormGroup** — каждое поле — отдельный сигнал. `effect()` гидратирует сигналы при смене блока, поля эмитят `(update)` при каждом input
- **Без auto-save** — только эмит событий. Родитель (BuilderPage) сам решает, когда сохранять
- **Multi-select** — при `selectedCount() > 0` показывает количество и кнопку удаления (блок === null)
- **Readonly badges** — `settings.tableTemplateId` и `dataBinding.source/field` отображаются как badge, изменить нельзя (только через удаление/пересоздание блока)
- **Spacer** — уникальный UI: range slider + числовой input для высоты; не показывает title/isActive/showLine
- **Format select** — `DATA_BINDING_FORMATS`: text, date, currency, number

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-86 Phase D.1 | Базовая реализация инспектора (поля, форма, эмит событий) |

---

_Создано: 2026-07-19. Компонент без роута, дочерний BuilderPage._
