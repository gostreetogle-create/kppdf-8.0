# Страница: Конструктор документов (BuilderPage)

**Краткое описание:** 3-панельный редактор шаблонов документов: палитра блоков (слева), canvas (центр), инспектор свойств (справа). Drag-and-drop добавление блоков, auto-save.

## Route

```
/doc-constructor/builder → выбор шаблона (список)
/doc-constructor/builder/:id → редактор конкретного шаблона
```

## Query params

| Параметр | Тип | Назначение |
|----------|-----|-----------|
| `source` | `string` | Источник контекста (order/contract) |
| `sourceId` | `string` | ID источника |

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/document-templates` | Список шаблонов (для выбора) |
| GET | `/api/document-templates/:id` | Детали шаблона (фон, ориентация) |
| POST | `/api/document-templates` | Создать шаблон |
| POST | `/api/document-templates/:id/duplicate` | Дублировать |
| POST | `/api/document-templates/:id/upload-background` | Загрузить фон |
| POST | `/api/document-templates/:id/remove-background` | Удалить фон |
| POST | `/api/document-templates/:id/set-default-background` | Установить фон по умолчанию |
| GET | `/api/template-blocks?templateId=:id` | Список блоков шаблона |
| POST | `/api/template-blocks` | Добавить блок |
| PATCH | `/api/template-blocks/:id` | Обновить блок (auto-save) |
| DELETE | `/api/template-blocks/:id` | Удалить блок |
| POST | `/api/template-blocks/reorder` | Переупорядочить блоки |

## Sub-components

| Компонент | Описание |
|-----------|----------|
| `BuilderToolPaneComponent` | Левая панель: палитра блоков, загрузка фона, настройки |
| `BuilderCanvasComponent` | Центр: холст с CDK drag-drop reorder блоков |
| `BuilderInspectorComponent` | Правая панель: свойства выбранного блока |
| `BlockRendererComponent` | Рендер отдельного блока на холсте |

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `templateId` | `Signal<string\|null>` | ID активного шаблона (из route) |
| `template` | `Signal<DocumentTemplate\|null>` | Текущий шаблон (фон, ориентация) |
| `blocks` | `Signal<TemplateBlock[]>` | Блоки (display order) |
| `selectedId` | `Signal<string\|null>` | ID выбранного блока |
| `selectedIds` | `Signal<Set<string>>` | Multi-select IDs (Ctrl+Click) |
| `saveStatus` | `Signal<'idle'\|'saving'\|'saved'\|'error'>` | Статус auto-save |
| `sourceContext` | `Signal<{source, sourceId}\|null>` | Контекст из query params |

## Особенности

- **3-pane layout** — Tool (280px) + Canvas (flex-1) + Inspector (320px)
- **Auto-save** — `Subject` → `groupBy(_id)` → `debounceTime(1500)` → `switchMap` → PATCH
- **Block types:** header, text, table, image, signature, spacer
- **Drag-from-palette** — CDK `cdkDropListConnectedTo` для перетаскивания блоков на холст
- **Drag-reorder** — intra-canvas reorder через `moveItemInArray`
- **Optimistic updates** — insert/delete/reorder сначала UI, потом API
- **Background images** — upload png/jpeg/webp ≤5MB, opacity slider, orientation toggle
- **Multi-select** — Ctrl+Click для выбора нескольких блоков, bulk delete
- **Monotonic save guard** — `savedTick` предотвращает stale timer revert
- **Phase E.3** — sourceContext для pre-binding (order/contract)

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-86 | Полная реализация (Phase D.1 + D.2 + D.3) |

---

_Создано: 2026-07-19._
