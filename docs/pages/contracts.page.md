# Страница: Договоры (ContractsPage)

**Краткое описание:** Реестр договоров с клиентской пагинацией, поиском, сортировкой, созданием документов из договора.

## Route

```
/contracts — «KPPDF — Договоры»
```

## Query params

Нет — всё состояние через сигналы.

## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/contracts` | Список (flat array) |
| DELETE | `/api/contracts/:id` | Удаление (soft delete) |

Ответ GET: `Contract[]` (flat array, НЕ пагинированный envelope)

## Dialogs

| Компонент | Режим | Данные |
|-----------|-------|--------|
| `ContractFormDialogComponent` | create / edit | `null` / `Contract` |
| `AlertDialogComponent` | confirm delete | `{ title, description, confirmLabel, variant }` |

## Services

| Сервис | Методы |
|--------|--------|
| `ContractsService` | `list()`, `findById(id)`, `create(payload)`, `update(id, payload)`, `remove(id)` |
| `CounterpartyService` | `list(params)` — для lookup контрагентов |
| `OrganizationsService` | `list(params)` — для lookup организаций |

## Lookup tables

| Lookup | Источник | Ключ |
|--------|----------|------|
| `counterpartiesLookup` | `counterpartyService.list({ limit: 200 })` | `Counterparty._id` |
| `organizationsLookup` | `orgService.list({ limit: 200 })` | `Organization._id` |

## State (signals)

| Сигнал | Тип | Назначение |
|--------|-----|-----------|
| `pageSig` | `Signal<number>` | Текущая страница (1-indexed, client-side) |
| `sortKeySig` | `Signal<SortKey\|null>` | Ключ сортировки |
| `sortDirSig` | `Signal<'asc'\|'desc'\|null>` | Направление сортировки |
| `search` | `SearchState` | Debounced поиск (300ms) |
| `listRes` | `HttpResource<Contract[]>` | GET /api/contracts |

## Computed (chain)

```
listRes → data → filteredRows → sortedRows → paginatedRows
```

| Computed | Трансформация |
|----------|--------------|
| `data` | `listRes.value() ?? []` |
| `filteredRows` | Client-side фильтр по `number`, `title`, названиям контрагента/организации, `packageTag` |
| `sortedRows` | Сортировка по `status` (lifecycle index), `expiresAt` (chrono), `totalAmount` (number), `number` (locale) |
| `paginatedRows` | Page slice: `sortedRows.slice(start, start + PAGE_SIZE)` |
| `total` | `sortedRows().length` |
| `loading` | `listRes.isLoading()` |
| `error` | `extractErrorMessage(listRes.error())` |

## Cell templates (pi-table)

| Имя | Колонка | Назначение |
|-----|---------|-----------|
| `counterpartyTpl` | `customerId` | Название контрагента (lookup) |
| `organizationTpl` | `organizationId` | Название организации (lookup) |
| `rowActionsTpl` | (actions) | Create Document / Edit / Delete |

## Column definitions (8 колонок)

`number` (sticky, sortable) → `title` → `customerId` (cellTemplate) → `organizationId` (cellTemplate) → `status` (sortable) → `expiresAt` (sortable) → `items` (количество позиций) → `totalAmount` (sortable, numeric, right)

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-104.3 | Миграция на pi-table (batch-2-B-flat) |
| TZ-104.4.2 | Typed TemplateRef + lockstep sort signals |

## Особенности

- **Client-side pagination** — backend возвращает flat array (TODO: server-side pagination)
- **Client-side sort** — `localSort=false`, сортировка через `sortedRows` computed
- **Custom sort accessors:** `status` → lifecycle index (draft→cancelled), `expiresAt` → `Date.parse()`, `totalAmount` → numeric
- **Client-side search** — фильтр по 7 полям (number, title, counterparty name/shortName/inn, organization name/shortName)
- **Lockstep sort signals** — seeded to `expiresAt`/`desc` (активные договоры первыми)
- **ID extractors:** `customerIdOf()` / `organizationIdOf()` — handle both string (unpopulated) and object (populated)
- **Document action:** `onCreateDocument()` → `/doc-constructor/builder?source=contract&sourceId=:id`

---

_Создано: 2026-07-19. Последнее обновление: 2026-07-19._
