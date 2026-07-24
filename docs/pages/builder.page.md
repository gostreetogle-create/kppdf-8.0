# Страница: Конструктор документов (BuilderPage)

**Краткое описание:** 3-панельный редактор шаблонов документов: палитра блоков (слева), canvas (центр), инспектор свойств (справа). Drag-and-drop добавление блоков, auto-save, контекстные свойства шаблона.

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
| PATCH | `/api/document-templates/:id` | Обновить свойства шаблона |
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
| `BuilderToolPaneComponent` | Левая панель: палитра блоков, тексты, таблицы, отступы, декорации |
| `BuilderCanvasComponent` | Центр: холст с CDK drag-drop reorder блоков |
| `BuilderInspectorComponent` | Правая панель: свойства блока / шаблона / мульти-выделения |
| `BlockRendererComponent` | Рендер отдельного блока на холсте |

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `templateId` | `Signal<string\|null>` | ID активного шаблона (из route) |
| `template` | `Signal<DocumentTemplate\|null>` | Текущий шаблон (фон, ориентация) |
| `blocks` | `Signal<TemplateBlock[]>` | Блоки (display order) |
| `selectedId` | `Signal<string\|null>` | ID выбранного блока |
| `selectedIds` | `Signal<Set<string>>` | Multi-select IDs (Ctrl+Click) |
| `templateSelected` | `Signal<boolean>` | Режим "свойства шаблона" (клик на пустой canvas) |
| `saveStatus` | `Signal<'idle'\|'saving'\|'saved'\|'error'>` | Статус auto-save |
| `sourceContext` | `Signal<{source, sourceId}\|null>` | Контекст из query params |

## Инспектор — 3 режима

### 1. Свойства блока (selectedId !== null)
- Заголовок, активность, линия снизу
- Содержимое (text/header), высота (image/signature/spacer)
- Шаблон таблицы (readonly badge)
- Привязка к данным (readonly badges)
- **Отступы**: ширина + marginLeft в пикселях, слайдер, кнопка сброса

### 2. Мульти-выделение (selectedIds.size > 0)
- Количество выбранных
- **Отступы**: общие значения (если одинаковые) или прочерк
- Кнопка "Сбросить отступы"
- Кнопка "Удалить" (внизу, отделена разделителем)

### 3. Свойства шаблона (templateSelected === true)
- **Ориентация**: книжная / альбомная (иконки BookOpen/Columns)
- **Формат страницы**: A4 / A5 / Letter
- **Нумерация страниц**: toggle
- **Оглавление**: toggle
- **Шапка документа**: текстовое поле
- **Подвал документа**: текстовое поле
- **Фоны**: превью загруженных фонов

## Resize хэндлы (BlockRenderer)

- **Боковые**: левый (marginLeft) + правый (width)
- Всегда видимы (opacity 0.25), усиливаются при наведении (0.6)
- При захвате: sunrise-warm цвет, opacity 1
- **@media print**: хэндлы, рамки, чекбоксы скрыты
- **Ширина/отступ**: хранятся в `block.settings.width` и `block.settings.marginLeft`

## Кнопка "Новый шаблон"

- В секции "Выберите шаблон" (слева от заголовка через `slot="actions"`)
- Работает когда есть список шаблонов + в пустом состоянии
- Создаёт шаблон с датой, навигирует в редактор

## Block renderer — визуал

- **Таблицы**: чистый `<table>` без заголовка "ТАБЛИЦА · Название"
- **Спейсеры**: пустой div с высотой (без текста "Отступ · Npx" и линий)
- **Полная ширина A4**: padding paper = 0, блоки от края до края

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-86 | Полная реализация (Phase D.1 + D.2 + D.3) |
| 2026-07-24 | Template properties panel, block resize, margins, print styles |

---

_Создано: 2026-07-19. Обновлено: 2026-07-24._
