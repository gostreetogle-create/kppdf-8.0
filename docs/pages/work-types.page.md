# Страница: Виды работ (WorkTypesPage)

**Краткое описание:** Справочник видов работ (сварка, покраска, сборка...) с нормативами часов, ставкой и привязкой к рабочему центру.

## Route

```
/work-types — «KPPDF — Виды работ»
```

## Query params

Нет — всё через сигналы.

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/work-types` | Список (flat array) |
| PATCH | `/api/work-types/:id` | Обновление (isActive toggle) |
| DELETE | `/api/work-types/:id` | Удаление (soft delete) |

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `WorkTypeFormDialogComponent` | create / edit | `null` / `WorkType` |
| `AlertDialogComponent` | confirm delete | `{ title, description, confirmLabel, variant }` |

## Services

| Сервис | Методы |
|--------|--------|
| `WorkTypesService` | `list()`, `findById(id)`, `create(payload)`, `update(id, payload)`, `remove(id)` |

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `sort` | `SortState<'name'\|'section'\|'department'\|'hourlyRate'>` | Клиентская сортировка |
| `searchQuery` | `Signal<string>` | Поиск (без debounce, через `createClientSearchState`) |
| `listRes` | `HttpResource<WorkType[]>` | GET /api/work-types |

## Особенности

- **Inline `<table>`** — НЕ использует `<app-pi-table>`
- **Client-side search** — `createClientSearchState` фильтрует по `name`, `section`, `department`
- **Client-side sort** — `createSortState` с 4 ключами
- **isActive switch** — `<app-pi-switch>` inline toggle, вызывает `PATCH /api/work-types/:id`
- **Деактивированные строки** — `opacity-50` CSS-класс
- **Row actions** — `<app-pi-row-actions>` внутри custom `<table>`
- **Flat array** — backend возвращает `WorkType[]`, не `{ items, total, page, limit }`

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-83 | Первая реализация |

---

_Создано: 2026-07-19._
