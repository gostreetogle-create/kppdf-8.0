# Страница: Текстовые блоки (TextsPage)

**Краткое описание:** Конструктор текстовых блоков для шаблонов документов. Создание/редактирование multi-column текстовых блоков с TipTap editor, размером шрифта, шириной колонок.

## Route

```
/doc-constructor/texts — «KPPDF — Текстовые блоки»
/doc-constructor/texts?editId=<textBlockId> — auto-open редактора (из builder)
```

## Query params

| Параметр | Тип | Назначение |
|----------|-----|-----------|
| `editId` | `string` | ID текстового блока — автоматически открывает редактор при навигации из конструктора документов |

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/text-blocks` | Список текстовых блоков |
| GET | `/api/text-blocks/:id` | Получить блок по ID |
| POST | `/api/text-blocks` | Создать |
| PATCH | `/api/text-blocks/:id` | Обновить |
| DELETE | `/api/text-blocks/:id` | Удалить |

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `AlertDialogComponent` | confirm delete | `{ title, description, confirmLabel, variant }` |

## Services

| Сервис | Методы |
|--------|--------|
| `TextBlocksService` | `list()`, `findById(id)`, `create(payload)`, `update(id, payload)`, `remove(id)` |

## Sub-components

| Компонент | Назначение |
|-----------|-----------|
| `TextBlockEditorComponent` | Редактор текстового блока (TipTap + columns + fontSize + width) |

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `data` | `Signal<TextBlock[]>` | Список блоков (через RxJS Subject+switchMap) |
| `editingId` | `Signal<string\|null>` | ID редактируемого блока |
| `editingBlock` | `Signal<TextBlock\|null>` | Редактируемый блок |
| `creatingNew` | `Signal<boolean>` | Флаг создания нового |
| `editorOpen` | `computed<boolean>` | Редактор открыт (creatingNew \|\| editingBlock !== null) |
| `searchQuery` | `Signal<string>` | Поиск (мгновенный, без debounce) |
| `sortDir` | `Signal<'asc'\|'desc'>` | Сортировка по name locale |
| `visible` | `computed<TextBlock[]>` | Отфильтрованный список |
| `sortedRows` | `computed<TextBlock[]>` | Отсортированный список |

## TextBlockEditorComponent — детали

### Layout
- **Split layout** — редактор (верх) + каталог блоков (низ)
- **Tabs** (#1, #2, #3...) — выбор активной колонки
- **Toolbar** — форматирование (H1-H3, B/I/U, alignment) + размер шрифта + ширина колонки
- **Bottom controls** — ← (влево), × (удалить), → (вправо) на каждой колонке

### Toolbar behavior
- **Клик по карточке** (без фокуса в тексте) → `editorFocused=false` → форматирование ко **всему тексту** колонки (selectAll)
- **Клик в текст** (фокус в editor) → `editorFocused=true` → форматирование **только к выделению**

### Font size
- Селектор: 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32
- Сохраняется в `col.fontSize` (персистится в MongoDB)
- Применяется через `[style.font-size.px]` + `::ng-deep` override на `.ProseMirror`

### Column width
- Range slider (10-80%) + number input (5-90%)
- `col.width` — относительная доля (сумма всех width)
- `gridTemplate` computed — пропорциональные `Xfr Yfr Zfr`
- Сохраняется в `col.width`

### Column management
- Добавление: кнопка "+" в tabs (макс. 8)
- Удаление: крестик × внизу колонки (мин. 1)
- Перемещение: стрелки ‹ › внизу колонки

### Init (effect)
- Используется `effect()` вместо constructor (сигнал-инпуты устанавливаются после конструктора)
- При загрузке существующего блока: name, isActive, columns (id, content, width, fontSize)

### Save payload
- `fontSize` включён в payload (backend schema поддерживает)
- Single-column: `content = columns[0].content`
- Multi-column: `content = ''`

## Особенности

- **Split layout** — редактор (full-width) + каталог блоков снизу
- **RxJS reload pattern** — `Subject<void>` + `switchMap` + `takeUntilDestroyed` (НЕ httpResource)
- **Custom table** — inline `<table>` с sticky header, status dots, row highlight
- **TipTap editor** — через `TextBlockEditorComponent` (Rich Text с B/I/U, H1-H3, alignment)
- **Pluralization** — `pluralRu(n, RU_BLOCKS)`
- **Row click** — открывает блок в редакторе (editingBlock)
- **Status dots** — green (active) / gray (inactive)
- **Auto-open from builder** — query param `editId` автоматически открывает редактор

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-86 | Первая реализация (Phase D) |
| 2026-07-26 | effect init, bottom controls (← × →), font size, column width, toolbar smart formatting, auto-open from builder |

---

_Создано: 2026-07-19. Обновлено: 2026-07-26._
