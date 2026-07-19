# Страница: Справочники (DictionariesPage)

**Краткое описание:** Каталог единиц измерения (Units) с inline-формой добавления, isActive toggle, клиентской сортировкой. Архитектура готова к расширению на другие справочники.

## Route

```
/dictionaries — «KPPDF — Справочники»
```

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/units` | Список (page/limit) |
| POST | `/api/units` | Создать единицу |
| PATCH | `/api/units/:key` | Обновить (isActive toggle) |
| DELETE | `/api/units/:key` | Удалить (кроме isSystem) |

Ответ GET: `{ items: Unit[], total: number, page: number, limit: number }`

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `AlertDialogComponent` | confirm delete | `{ title, description, confirmLabel, variant }` |

## Services

| Сервис | Методы |
|--------|--------|
| `UnitsService` | `list(params)`, `create(payload)`, `update(key, payload)`, `remove(key)` |

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `listRes` | `HttpResource<UnitsListResponse>` | GET /api/units |
| `adding` | `Signal<boolean>` | Состояние отправки формы |
| `form` | `FormGroup` | Reactive form (key, label, symbol, category) |
| `sortedUnits` | `computed<Unit[]>` | Client-side sort by sortOrder → key |

## Особенности

- **pi-table** — с isActive switch через cellTemplate
- **Inline form** — форма добавления прямо на странице (не диалог)
- **sortOrder sort** — по sortOrder ascending, затем по key locale
- **isSystem защита** — системные юниты нельзя удалить (deleteDisabled)
- **isActive switch** — `<app-pi-switch>` в колонке `isActive`
- **Key-based PK** — `UnitsService` использует `key` (string), не `_id`

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-117 | httpResource миграция |

---

_Создано: 2026-07-19._
