# Страница: Договоры (ContractsPage)

**Краткое описание:** Реестр договоров с клиентской пагинацией, поиском, сортировкой, созданием документов из договора.

## Route

```
/contracts — «KPPDF — Договоры»
```

## Query params

Нет — всё состояние через сигналы.

## Workspace chrome

`PiGroupWorkspaceComponent` показывает общий тёмный TOC **КП | Договоры | Заказы** с активным **Договоры**. Жёлтый ряд пуст: договоры не рекламируют CTA создания КП.


## API endpoints

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/contracts` | Список (flat array) |
| PUT | `/api/contracts/:id/attachment` | Прикрепить один файл договора (multipart `file`) |
| DELETE | `/api/contracts/:id/attachment` | Снять файл договора и очистить attachment state |
| DELETE | `/api/contracts/:id` | Удаление договора (soft delete) |

Ответ GET: `Contract[]` (flat array, НЕ пагинированный envelope)

### Contract attachment state

`Contract.status` — lifecycle договора (`draft` → `signed` → `active` и т.д.). Не путать его с отдельным `contractStatus`, который описывает наличие юридического файла:

| `contractStatus` | Смысл | Файловая ссылка |
|------------------|-------|-----------------|
| `none` | Файл не прикреплён | `attachmentFileId` / `attachmentUrl` отсутствуют |
| `file_attached` | Прикреплён оператором | `attachmentFileId` указывает на `Photo`, `attachmentUrl` — `/uploads/contracts/...` |
| `generated` | Зарезервировано для будущей генерации из шаблона | Может быть без файла; генерация из КП пока не реализуется |

`PUT /api/contracts/:id/attachment` принимает multipart-поле `file` (admin/manager), сохраняет файл через `Photo`-метаданные и переводит только `contractStatus` в `file_attached`; lifecycle `status` не меняется. Пустой файл даёт `400`, отсутствующий или soft-deleted договор — `404`. Повторная загрузка заменяет прежнюю ссылку.

`DELETE /api/contracts/:id/attachment` (admin/manager) очищает `attachmentFileId` и `attachmentUrl`, переводит `contractStatus` в `none` и best-effort удаляет прежний `Photo`. Это не удаляет и не меняет сам Contract lifecycle.

## NX thin CRUD (D4, `frontend-nx`, read-only)

`contracts-list.page.ts` + `contract-detail.page.ts` (TZ-NX-DEALS-D4) — тонкий **read-only** список+карточка, не полный legacy реестр выше. `PiContractsService.list()`/`getById()` — только эти два метода; create/update/attach-file/sign/activate **не портированы**: `CreateContractDto` требует `organizationId`+`customerId`+`items[]` заранее (не tHin-form fit), а sign/attach — отдельный юридический workflow вне scope волны.

- Список: Номер · Заказчик (populate `customerId.name`, либо raw id как есть, если сервер вернул строку) · Статус (RU lifecycle) · Сумма · «Карточка» → `/contracts/:id`.
- Карточка: номер, статус (banner), Заказчик, КП (`proposalId.number` если populate, иначе «Без КП»), позиции (имя×кол-во·сумма), общая сумма. Без кнопок sign/attach/activate/edit — chrome без CTA.
- Chrome: тот же `PiGroupWorkspaceComponent`/`DEALS_TOC_CHIPS` (D1) — чип «Договоры» больше не `disabled` (был зарезервирован в D1, флаг снят в D4).
- **known_limitation:** создание/редактирование/подпись/прикрепление файла договора остаются backend-only (нет UI) — оператор пока заводит договоры вне NX (legacy реестр выше или Swagger/API напрямую), пока не появится отдельная TZ на юр.workflow.

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
