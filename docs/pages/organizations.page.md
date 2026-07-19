# Страница: Организации (OrganizationsPage)

**Краткое описание:** Справочник организаций (юр. лица и ИП) с серверной пагинацией, поиском, клиентской сортировкой. Inline `<table>` (НЕ pi-table).

## Route

```
/organizations — «KPPDF — Организации»
```

## Query params

Нет — всё через сигналы.

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/organizations` | Список (page/limit/search) |
| DELETE | `/api/organizations/:id` | Удаление (soft delete) |

Ответ GET: `{ items: Organization[], total: number, page: number, limit: number }`

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `OrganizationFormDialogComponent` | create / edit | `null` / `Organization` |
| `AlertDialogComponent` | confirm delete | `{ title, description, confirmLabel, variant }` |

## Services

| Сервис | Методы |
|--------|--------|
| `OrganizationsService` | `list(params)`, `findById(id)`, `create(payload)`, `update(id, payload)`, `remove(id)` |

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `search` | `SearchState` | Debounced поиск (300ms) |
| `sort` | `SortState<SortKey>` | Клиентская сортировка (name/inn/shortName) |
| `listRes` | `HttpResource<OrganizationsListResponse>` | GET /api/organizations |

## Особенности

- **Server-side pagination** — backend возвращает `{ items, total, page, limit }`
- **Inline `<table>`** — НЕ использует `<app-pi-table>` (оставшаяся legacy-страница)
- **Client-side sort** — через `createSortState<SortKey>('name')`
- **Sort icons** — ручные ↑↓ индикаторы в заголовках колонок
- **Row actions** — `<app-pi-row-actions>` внутри custom `<table>`
- **Типы организаций** — отображаются как badge-массив (`row.type`)

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-83 | Первая реализация |
| TZ-117 | httpResource миграция |

---

_Создано: 2026-07-19._
