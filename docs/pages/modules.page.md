# Страница: Модули (ModulesPage)

**Краткое описание:** Справочник модулей продукции — составные части, переиспользуемые между товарами. Клиентская пагинация, поиск, сортировка. Row-click → детальная страница.

## Route

```
/modules — «KPPDF — Модули»
```

## Query params

Нет — всё через сигналы.

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/modules` | Список (flat array) |
| DELETE | `/api/modules/:id` | Удаление (soft delete) |

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `ModuleFormDialogComponent` | create / edit | `null` / `ProductModule` |
| `AlertDialogComponent` | confirm delete | `{ title, description, confirmLabel, variant }` |

## Services

| Сервис | Методы |
|--------|--------|
| `ProductModulesService` | `list()`, `findById(id)`, `create(payload)`, `update(id, payload)`, `remove(id)` |

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `pageSig` | `Signal<number>` | Текущая страница (1-indexed) |
| `sortKeySig` | `Signal<'name'\|'article'\|null>` | Ключ сортировки |
| `sortDirSig` | `Signal<'asc'\|'desc'\|null>` | Направление сортировки |
| `search` | `SearchState` | Debounced поиск (300ms) |
| `listRes` | `HttpResource<ProductModule[]>` | GET /api/modules |

## Computed chain

```
listRes → data → filteredRows → sortedRows → paginatedRows
```

## Column definitions (5 колонок)

`name` (sticky, sortable) → `article` (sortable) → `dimensions` (formatted: W×H×D) → `materials` (count) → `workTypes` (count)

## Особенности

- **Client-side pagination** — flat array от backend
- **Client-side sort** — только `name` + `article` (sortable), остальное display-only
- **Row-click** → `/modules/:id` через `(rowClick)` pi-table event
- **Dimensions formatter** — `moduleDimensions()`: `W 300 × H 200 × D 50 мм`
- **Sort only by name/article** — materials/workTypes count typesystem-forbidden (key must be `keyof ProductModule`)
- **Lockstep sort signals** — seeded to `name`/`asc`

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-104.3 | Миграция на pi-table (batch-2-B-flat) |
| TZ-104.4.2 | Typed TemplateRef + lockstep sort |

---

_Создано: 2026-07-19._
