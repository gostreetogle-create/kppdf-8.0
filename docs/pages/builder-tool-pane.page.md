# Компонент: Панель инструментов (BuilderToolPaneComponent)

**Краткое описание:** Левая боковая панель (280px) с палитрой блоков для конструктора документов. Пять collapsible секций: тексты, таблицы, отступы, data-binding, декорации (фон). Drag-and-drop элементов на холст.

## Route

Нет собственного роута. Всегда рендерится как дочерний компонент `BuilderPage`.

```
BuilderPage (3-pane layout)
├── BuilderToolPaneComponent   ← этот компонент (слева, 280px)
├── BuilderCanvasComponent     (центр)
└── BuilderInspectorComponent  (справа, 320px)
```

## API endpoints

Компонент использует `httpResource` напрямую (не через сервисы):

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/text-blocks?isActive=true` | Список текстовых блоков для drag-добавления |
| GET | `/api/table-templates?isActive=true` | Список шаблонов таблиц для drag-добавления |
| GET | `/api/registry/data-sources` | Источники данных (organization, counterparty, product, material, work-type) |

Сами операции добавления блоков делегируются в `BuilderPage` через выходной сигнал `addBlock`.

## Inputs

| Input | Тип | Назначение |
|-------|-----|-----------|
| `backgroundImages` | `string[]` | URL загруженных фоновых изображений |
| `defaultBackgroundIndex` | `number` | Индекс фона по умолчанию (-1 = нет) |
| `backgroundOpacity` | `number` | Прозрачность фона (0..1, default 0.3) |
| `orientation` | `'portrait' \| 'landscape'` | Ориентация шаблона |

## Outputs

| Output | Тип данных | Назначение |
|--------|-----------|-----------|
| `addBlock` | `AddBlockPayload` | Добавить блок на холст (discriminated union из 4 source-ов) |
| `uploadBackground` | `File` | Загрузить файл фонового изображения (≤5 MB, png/jpeg/webp) |
| `removeBackground` | `number` | Удалить фон по индексу |
| `setDefaultBackground` | `number` | Установить/убрать дефолтный фон (-1 = убрать) |
| `setOpacity` | `number` | Изменить прозрачность фона |
| `setOrientation` | `'portrait' \| 'landscape'` | Сменить ориентацию |

## AddBlockPayload (discriminated union)

```ts
type AddBlockPayload =
  | { source: 'block-type'; type: BlockType }             // Пустой блок по типу
  | { source: 'text-block'; textBlock: TextBlock }        // Из сохранённого текста
  | { source: 'table-template'; tableTemplate: TableTemplate } // Из шаблона таблицы
  | { source: 'data-binding'; dataSource: string; field: { key, label, type } }; // Привязка к данным
```

## Секции (collapsible accordion)

| Секция | Контент | Источник данных |
|--------|---------|----------------|
| **Тексты** | Список TextBlock элементов с drag-and-drop + кнопка «+» | `httpResource → /api/text-blocks` |
| **Таблицы** | Список TableTemplate элементов с drag-and-drop + кнопка «+» | `httpResource → /api/table-templates` |
| **Данные** | DataSource группы из реестра с полями для data-binding | `httpResource → /api/registry/data-sources` |
| **Отступ** | Одна кнопка «+» для добавления spacer-блока | Статическая (нет API) |
| **Декорации** | Загрузка фона, список загруженных, слайдер opacity, переключатель orientation | File input (родитель) |

## State (component-local signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `open` | `Record<string, boolean>` | Какая секция развёрнута |
| `textsRes` | `httpResource` | Результат GET /api/text-blocks |
| `tablesRes` | `httpResource` | Результат GET /api/table-templates |
| `registryRes` | `httpResource` | Результат GET /api/registry/data-sources |
| `canvasDroplistId` | `string[]` | ID холста для CDK drag-drop connected |

## Особенности

- **CDK drag-from-palette** — каждый элемент обёрнут в `cdkDrag` с `cdkDragData = AddBlockPayload`. Холст (BuilderCanvas) имеет `cdkDropList` с id `canvas-droplist`. Связь через `cdkDropListConnectedTo`
- **Inline buttons** — НЕ использует Paper & Ink `<pi-button>`, а inline `<button>` элементы для кастомного вида
- **httpResource** — 3 независимых httpResource для текстов, таблиц и реестра данных
- **Collapsible** — каждая секция открывается/закрывается по клику на заголовке
- **Background management** — загрузка, список, дефолтный, opacity, orientation
- **OnPush** — ChangeDetectionStrategy.OnPush, сигналы, computed

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-86 Phase D.1 | Базовая палитра блоков (text/header/table/image/signature) |
| TZ-86 Phase D.2 | Drag-from-palette + декорции (фон) |
| TZ-86 Phase D.2.2 | CDK drag-drop палитры на холст |

---

_Создано: 2026-07-19. Компонент без роута, дочерний BuilderPage._
