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
| GET | `/api/modules/:id/composition` | Состав модуля (dual-read: composition, иначе legacy materials[]) |
| POST | `/api/modules/:id/composition` | Добавить линию состава (lineType=material) |
| PATCH | `/api/modules/:id/composition/:lineId` | Обновить линию (quantity/unit/…) |
| DELETE | `/api/modules/:id/composition/:lineId` | Удалить линию состава |
| DELETE | `/api/modules/:id` | **Hard delete** (`deleteOne`) — soft-delete Module = TZ-CATALOG-314 |

> **TZ-CATALOG-317:** материалы модуля читаются dual-read (непустой
> `composition` → material-линии, иначе legacy `materials[]`); редактирование
> «Изменить состав» пишет через composition-эндпоинты. Legacy `PATCH materials[]`
> остаётся best-effort зеркалом до миграции 304.

> **TZ-CATALOG-319:** раньше в docs ошибочно писали «soft delete». Факт кода:
> `ProductModuleService.remove` → `doc.deleteOne()`. Material/Product пишут
> `deletedAt`, но list-фильтр удалённых — тоже зона 314.

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `ModuleFormDialogComponent` | create / edit | `null` / `ProductModule` |
| `AlertDialogComponent` | confirm delete | `{ title, description, confirmLabel, variant }` |

## Services

| Сервис | Методы |
|--------|--------|
| `ProductModulesService` | `list()`, `findById(id)`, `create(payload)`, `update(id, payload)`, `remove(id)` |
| `ProductModulesService` | `getModuleComposition(id)`, `addModuleCompositionLine(id, dto)`, `updateModuleCompositionLine(id, lineId, dto)`, `removeModuleCompositionLine(id, lineId)` (composition CRUD) |

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

## Состав модуля (TZ-CATALOG-320)

Редактор состава допускает `material` и дочерний `module`; текущий модуль исключается из списка. Материал в пикере получает kind-лейбл: сырьё, деталь, метиз, покупное, другое. Каноническая запись идёт через `/modules/:id/composition`; полный lazy CompositionTree остаётся в `TZ-CATALOG-311`.

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
| TZ-CATALOG-319 | Docs: hard-delete Module (не soft) |

---

_Создано: 2026-07-19. Обновлено: 2026-08-06 (TZ-CATALOG-320)._
