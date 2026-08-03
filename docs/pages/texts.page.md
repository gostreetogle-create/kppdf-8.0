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
| GET | `/api/text-blocks` | Список текстовых блоков (TZ-DOC-315: + `categoryId` FK, фильтр `categoryId`/`activeOnly`) |
| GET | `/api/text-blocks/:id` | Получить блок по ID |
| POST | `/api/text-blocks` | Создать (без `categoryId` → сервер подставит default категорию) |
| PATCH | `/api/text-blocks/:id` | Обновить |
| DELETE | `/api/text-blocks/:id` | Удалить |
| GET | `/api/text-block-categories` | Категории текстов (TZ-DOC-315 backend; используется для колонки/фильтра) |

Справочник категорий (CRUD): [`/dictionaries/text-block-categories`](../..) — меню «Справочники → Категории текстов» (TZ-DOC-334).

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `AlertDialogComponent` | confirm delete | `{ title, description, confirmLabel, variant }` |

## Services

| Сервис | Методы |
|--------|--------|
| `TextBlocksService` | `list()`, `findById(id)`, `create(payload)`, `update(id, payload)`, `remove(id)` |
| `TextBlockCategoriesService` | `list({ activeOnly })` — активный каталог категорий для колонки «Категория» и dropdown-фильтра (TZ-DOC-316) |

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
| `categories` | `Signal<TextBlockCategory[]>` | Активные категории (lookup для бейджа + опции фильтра) |
| `categoryFilter` | `Signal<string>` | Выбранный `categoryId` в фильтре (`''` = все) |

## Категории текстов (TZ-DOC-316)

- **Колонка «Категория»** — после «Название», перед «Конфигурация»: бейдж с `name` категории через populated lookup (`categoryName(id)`), прочерк если `categoryId` нет или категория недоступна.
- **Фильтр «Категория»** — dropdown в шапке каталога (активные категории из `TextBlockCategoriesService.list({ activeOnly: true })`); локальный фильтр по `categoryId`; «Все» сбрасывает. Комбинируется с поиском (AND).
- **Редактор блока** — select «Категория» в meta-панели: загрузка активных категорий, для нового блока auto-select активной default (как серверный resolveDefault), «Не выбрана» → `null` → `categoryId` НЕ отправляется (сервер сам подставит default).

## TextBlockEditorComponent — детали

### Layout
- **Split layout** — редактор (верх) + каталог блоков (низ)
- **Tabs** (#1, #2, #3...) — выбор активной колонки
- **Toolbar** — B/I/U, alignment + размер шрифта (px) + ширина колонки. **H1–H3 нет** (размер только через «Шрифт»).
- **Bottom controls** — ← (влево), × (удалить), → (вправо) на каждой колонке
- **Пустой холст** — клик в любом месте колонки фокусирует редактор; placeholder виден до ввода
- **Название** — required: красная рамка без прыгающей подписи ([`UX-FORM-CANON.md`](../UX-FORM-CANON.md))
- **Вставка поля** — диалог источник→поле; клик вставляет `{{source.key}}` + toast

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

- **Pi page chrome (TZ-DOC-336)** — `PiPageHeader` + `PiToolbar` + `PiSection` + `PiEmptyState` + `PiRowActions`
- **Editor zone** — full-page `TextBlockEditorComponent` над каталогом (не modal; known_limitation → successor)
- **RxJS reload pattern** — `Subject<void>` + `switchMap` + `takeUntilDestroyed` (НЕ httpResource)
- **Catalog table** — Paper & Ink `pi-cell` / `pi-table-row`; status dots; row click → editor
- **TipTap editor** — B/I/U, H1-H3, Lucide AlignLeft/Center/Right + aria-label; «Активен» = `app-pi-switch`
- **Pluralization** — `pluralRu(n, RU_BLOCKS)`
- **Auto-open from builder** — query param `editId` автоматически открывает редактор

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-86 | Первая реализация (Phase D) |
| 2026-07-26 | effect init, bottom controls (← × →), font size, column width, toolbar smart formatting, auto-open from builder |
| TZ-DOC-316 | Колонка «Категория» + dropdown-фильтр в каталоге; select категории в редакторе блока (`categoryId` в payload только при явном выборе) |
| TZ-DOC-336 | Page shell → Pi chrome; editor «Активен» → pi-switch; align icons Lucide + aria-label |

---

_Создано: 2026-07-19. Обновлено: 2026-08-02 (DOC-336)._
