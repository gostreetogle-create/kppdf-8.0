# Страница: Шаблоны таблиц (TablesPage)

**Краткое описание:** Конструктор шаблонов таблиц — задают форму колонок, типы данных и форматирование. Используются в шаблонах документов.

## Route

```
/doc-constructor/tables — «KPPDF — Шаблоны таблиц»
```

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/table-templates` | Список шаблонов |
| POST | `/api/table-templates` | Создать |
| PATCH | `/api/table-templates/:id` | Обновить |
| DELETE | `/api/table-templates/:id` | Удалить |

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `TableTemplateFormDialogComponent` | create / edit (new) | `null` / `TableTemplate` |
| `TableTemplateFormDialogComponent` | create from registry | `{ mode: 'from-registry' }` |
| `AlertDialogComponent` | confirm delete | `{ title, description, confirmLabel, variant }` |

## Services

| Сервис | Методы |
|--------|--------|
| `TableTemplatesService` | `list()`, `findById(id)`, `create(payload)`, `update(id, payload)`, `remove(id)`, `duplicate(id)` |
| `RegistryService` | для режима «из существующих данных» |

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `search` | `Signal<string>` | Поиск (мгновенный) |
| `sort` | `createSortState<'name'\|'category'\|'sortOrder'>` | Сортировка |
| `listRes` | `HttpResource<TableTemplate[]>` | GET /api/table-templates |

## Особенности

- **Custom table** — inline `<table>` с кастомным дизайном (не pi-table)
- **Inline search** — без debounce, мгновенный фильтр
- **Two create modes** — «Новая таблица» + «Из существующих данных» (registry)
- **Copy button** — кнопка дублирования шаблона
- **isActive switch** — `<app-pi-switch>` inline
- **Status dot** — green (active) / gray (inactive)
- **Category labels** — readable Russian (материалы, оборудование...)
- **Promo aside** — нижняя секция с рекламным текстом

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-86 | Первая реализация + registry mode |

---

_Создано: 2026-07-19._
