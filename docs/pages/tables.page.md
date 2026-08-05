# Страница: Шаблоны таблиц (TablesPage)

**Краткое описание:** Конструктор шаблонов таблиц — задают форму колонок, типы данных и форматирование. Используются в шаблонах документов.

## Route

```
/doc-constructor/tables — «KPPDF — Шаблоны таблиц»
/doc-constructor/tables?editId=<tableTemplateId> — auto-open диалога (из builder, TZ-DOC-335)
```

## Query params

| Параметр | Тип | Назначение |
|----------|-----|-----------|
| `editId` | `string` | ID шаблона таблицы — открывает форму редактирования при навигации из конструктора |

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

- **Pi page chrome (TZ-DOC-336)** — `PiPageHeader` + `PiToolbar` + `PiSection` + `PiEmptyState` + `PiRowActions`
- **`app-pi-table`** — shared Flat kit with typed columns, active-state cell template, row actions and kit-consistent loading/empty behavior
- **Inline search** — без debounce, мгновенный фильтр
- **Two create modes** — «Новая таблица» + «Из существующих данных» (registry)
- **Copy** — `PiRowActions` `(copy)` / `copyLabel` (не hand-rolled icon)
- **isActive switch** — `<app-pi-switch>` inline
- **Category labels** — readable Russian
- **editId deep-link (TZ-DOC-335)** — `?editId=` auto-opens edit dialog, then clears query
- **Dialog FormField canon (TZ-DOC-336)** — name/description/sortOrder/source via FormField+Input; isActive via pi-switch; без promo aside

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-86 | Первая реализация + registry mode |
| TZ-DOC-335 | `editId` queryParam auto-open from builder |
| TZ-DOC-336 | Pi shell; remove promo; copy slot; dialog FormField/Switch |

---

_Создано: 2026-07-19. Обновлено: 2026-08-02 (DOC-336)._
