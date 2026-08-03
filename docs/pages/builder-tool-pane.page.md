# Компонент: Палитра блоков (BuilderToolPaneComponent)

**Краткое описание:** Левый **icon rail** (48px) + overlay-flyout для конструктора.
Секции: Группы / Тексты / Таблицы / Фото. Drag-and-drop на холст. Flyout обычно
схлопывается после добавления блока. Это **не** верхняя горизонтальная полоса.

## Route

Нет собственного роута. Дочерний `BuilderPage`.

```
BuilderPage
├── toolbar (title / Editor|Preview)
└── builder-shell
    ├── BuilderToolPaneComponent   ← left rail + flyout
    ├── BuilderCanvasComponent
    └── BuilderInspectorComponent
```

## API endpoints

Компонент использует `httpResource` / сервисы категорий текстов:

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/text-blocks?…` | Каталог текстов |
| GET | `/api/table-templates?…` | Каталог таблиц |
| GET | text-block-categories | Фильтр категорий (DOC-317/334) |

Добавление блоков → output `addBlock` / `photoSelected` → `BuilderPage`.

## Поведение (2026-08-03)

- Иконки с `title` / `aria-label` (Группы, Тексты, Таблицы, Фото).
- В **preview** родителю нельзя добавлять блоки (page guards); palette UI может оставаться видимой.
- Empty canvas hint указывает на **палитру слева**.

## См. также

- [`builder.page.md`](./builder.page.md) — layout + lock + denseMain
- [`../PO-DIARY.md`](../PO-DIARY.md) — планка показа
