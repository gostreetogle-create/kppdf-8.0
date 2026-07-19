# Страница: Текстовые блоки (TextsPage)

**Краткое описание:** Конструктор текстовых блоков для шаблонов документов. Создание/редактирование multi-column текстовых блоков с TipTap editor.

## Route

```
/doc-constructor/texts — «KPPDF — Текстовые блоки»
```

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/text-blocks` | Список текстовых блоков |
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
| `TextBlockEditorComponent` | Редактор текстового блока (TipTap + columns) |

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `data` | `Signal<TextBlock[]>` | Список блоков (через RxJS Subject+switchMap) |
| `editingId` | `Signal<string\|null>` | ID редактируемого блока |
| `editingBlock` | `Signal<TextBlock\|null>` | Редактируемый блок |
| `creatingNew` | `Signal<boolean>` | Флаг создания нового |
| `searchQuery` | `Signal<string>` | Поиск (мгновенный, без debounce) |
| `sortDir` | `Signal<'asc'\|'desc'>` | Сортировка по name locale |

## Особенности

- **Split layout** — редактор (full-width) + каталог блоков снизу
- **RxJS reload pattern** — `Subject<void>` + `switchMap` + `takeUntilDestroyed` (НЕ httpResource)
- **Custom table** — inline `<table>` с sticky header, status dots, row highlight
- **TipTap editor** — через `TextBlockEditorComponent` (Rich Text с B/I/U, H1-H3, alignment)
- **Pluralization** — `pluralRu(n, RU_BLOCKS)`
- **Row click** — открывает блок в редакторе (editingBlock)
- **Status dots** — green (active) / gray (inactive)

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-86 | Первая реализация (Phase D) |

---

_Создано: 2026-07-19._
