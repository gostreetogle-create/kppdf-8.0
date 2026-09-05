# Страница: Снабжение / Закупки (SupplyPage)

**Краткое описание:** Два режима на одном URL: **«Быстрый заказ»** (mock-блокнот снабженца, default) и **«Реестр»** (live SupplyTask 301/302). Row A — logistics chips (Закупки/Отгрузка); Row B — view chips + toolbar.

## Routes

```
/supply — «KPPDF — Снабжение / Закупки» → Быстрый заказ (default)
/supply?view=quick — явный быстрый заказ
/supply?view=registry — реестр SupplyTask (таблица)
/supply?view=quick&orderId= — быстрый заказ с контекстом заказа (из стола)
```

## Query params

| Параметр | Тип | Назначение |
|----------|-----|-----------|
| `view` | `quick` \| `registry` | Режим страницы; **отсутствие = quick** |
| `orderId` | `string` (Order._id) | Quick: prefill при «+ Создать»; Registry: **HUB-303** фильтр `GET /api/supply-tasks?orderId=` + chip сброса |

Query `orderId` **сохраняется** при переключении Быстрый заказ ↔ Реестр.

## API endpoints (только «Реестр»)

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/supply-tasks?orderId=&status=` | Список (≤500, новые сверху) |
| POST | `/api/supply-tasks` | Создать (draft); нужен title или materialId/moduleId |
| PATCH | `/api/supply-tasks/:id` | qty / notes / title |
| POST | `/api/supply-tasks/:id/confirm` | D18: status→confirmed + confirmedBy/At из JWT |
| POST | `/api/supply-tasks/:id/ordered` | confirmed → ordered |
| POST | `/api/supply-tasks/:id/received` | ordered → received |
| DELETE | `/api/supply-tasks/:id` | soft delete |

**Быстрый заказ (304):** без API — in-memory mock, F5 сбрасывает.

## UI

### Быстрый заказ (`view=quick` или default)

- **431:** design sign-off `docs/audits/2026-08-24-supply-431-design-signoff.md`; expanded — 3-col grid, PiSelectAddRow org menu, org promote, summary 36px.

- Expand-in-row плитки (▸/▾), одна развёрнутая
- Toolbar: поиск, фильтр статус/приоритет, «N заявок», «+ Создать»
- 4 блока полей + collapsible «Ещё»; inline «+ Новый» поставщик / «+ Новая» категория
- Фото — stub placeholder
- Seed: 5 строк из design canon §11

### Реестр (`view=registry`)

- Таблица: позиция, заказ (ссылка на `/orders/:id`), qty, статус, дата confirm, действия
- «+ Задача» — inline form (заказ + название + qty) + explode из состава
- Chip при `?orderId=`: «Фильтр: заказ {номер|id}» + «Сбросить»
- Empty: «Нет задач снабжения. Создайте первую — «+ Задача».»

### Входы

| Откуда | Куда |
|--------|------|
| Desk chip «Снабжение» | `/supply?view=quick` (без expand); с expand — `/supply?view=quick&orderId=&from=desk` (**426**, фильтр + «На стол») |
| Desk tray «Открыть снабжение» | flyout `panel=supply` на столе (425), без смены path |
| Chip «Реестр» на странице | `/supply?view=registry` |

## TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-SUPPLY-301 | Live registry + confirm/ordered/received |
| TZ-SUPPLY-302 | BOM explode → draft tasks |
| **TZ-ORDERS-HUB-303** | Query `orderId` filter + deep-link from orders expand |
| **TZ-UX-342** | Removed dead `[total]` on pi-table (no fake pager without slice) |
| **TZ-SUPPLY-304** | Быстрый заказ mock UI + view chips + desk navigate |
| **TZ-SUPPLY-443** | Org "+" btn = canon pi-select-add-btn (SoT: styles.css); pi-focus-ring |

## Канон

- D9: отдельный пункт меню Снабжение
- D18: confirm audit fields
- Design canon: `docs/audits/2026-08-19-supply-quick-order-design-canon.md`

## Known limits

- **Быстрый заказ:** mock in-memory; нет sync с SupplyTask; справочники hardcoded до SUPPLY-305
- **Быстрый заказ:** F5 теряет правки; фото upload — stub
- Автосоздание из состава заказа — только в реестре (SUPPLY-302)
- Data bind API → `TZ-SUPPLY-305`

## NX (`frontend-nx`) — TZ-NX-SUPPLY-S1-PAGE

**Route:** `/supply` (`app.routes.ts`, `canMatch: [capabilityRouteGuard]`, `data: { pageKey: 'supply', capabilities: ['procurement:read'] }`). Nav item «Закупки» под категорией «Снабжение» (`nav-categories.ts`), same capability.

Единственный режим — **живой реестр SupplyTask**, без mock. Легаси «Быстрый заказ» (in-memory, F5 сбрасывает) **сознательно не портирован** в NX — реестр остаётся единственным продуктовым путём `/supply`.

### Data access

`@kppdf/data-access` → `PiSupplyTasksService` (`libs/data-access/src/lib/supply/pi-supply-tasks.service.ts`), 1:1 зеркало легаси `SupplyTaskService`, на `SilentResult<T>`:

| Метод | Endpoint |
|-------|----------|
| `list({orderId?, status?})` | `GET /supply-tasks` |
| `create(payload)` | `POST /supply-tasks` |
| `explode({orderId, moduleId?})` | `POST /supply-tasks/explode` |
| `update(id, payload)` | `PATCH /supply-tasks/:id` |
| `confirm(id)` | `POST /supply-tasks/:id/confirm` |
| `markOrdered(id)` | `POST /supply-tasks/:id/ordered` |
| `markReceived(id)` | `POST /supply-tasks/:id/received` |
| `remove(id)` | `DELETE /supply-tasks/:id` |

`SupplyRequest` (отдельная сущность, ad-hoc quick-order из S0 kit-reserve shortfall) в S1 **не используется** — это предмет S2 (hub confirm).

### UI (`supply.page.ts`)

Ручная CSS-grid таблица (текущая NX-конвенция, как `storage-items.page.ts`, без `<app-pi-table>`): позиция/линия, заказ (`routerLink` на `/orders/:id`), qty, статус, действие по статусу (draft→Подтвердить, confirmed→Заказано, ordered→Получено).

- Фильтр по статусу (`<select>`), фильтр `?orderId=` (query-param, deep-link) с chip + «Сбросить» (`router.navigate` с `queryParamsHandling: 'merge'`)
- «+ Задача»: explode из состава заказа ИЛИ ручное создание (заказ + название + qty)
- `data-test` атрибуты на всех интерактивных элементах для тестов

### Known limitation (унаследовано от backend, не изобретено во фронтенде)

`SupplyTaskService.markReceived` (и `SupplyRequestService.markReceived`) **не пишут `StockMovement`** — получение задачи снабжения не отражается в складском журнале. Это существующий backend-разрыв, задокументирован здесь, а не воспроизведён/замаскирован в NX-фронтенде.

### Tests

- `pi-supply-tasks.service.spec.ts` — 8 tests (все методы, HTTP mock)
- `supply.page.spec.ts` — 9 tests (фильтры, transitions, explode, create, no-mock-UI assertion, router-based filter clear)

## NX — TZ-NX-SUPPLY-S2-HUB-CONFIRM (order hub «Подтвердить материалы»)

S2 не трогает `/supply` саму по себе — это точка входа СО стороны заказа
(`docs/pages/orders.page.md` § TZ-NX-SUPPLY-S2), которая создаёт
`SupplyRequest` через S0 kit-reserve (`POST
/orders/:id/items/:itemIndex/kit-reserve`), а затем даёт deep-link сюда
(`/supply?orderId=`). `SupplyRequest` остаётся отдельной сущностью от
`SupplyTask` (реестр S1) — см. архитектурное решение в
`tasks/_archive/2026-09/TZ-NX-SUPPLY-S1-PAGE.done.md`. NX пока не показывает
`SupplyRequest` списком на `/supply` — это остаётся gap на будущее (легаси
«Быстрый заказ» их тоже не показывает как реестр).

### TZ reference (NX)

| TZ | Что сделано |
|----|------------|
| TZ-NX-SUPPLY-S0-KIT-RESERVE-BE | Backend kit-availability/kit-reserve API (не в этом файле — см. warehouse/kit docs) |
| **TZ-NX-SUPPLY-S1-PAGE** | `/supply` живой реестр SupplyTask (без mock), `?orderId=`, transitions, explode/create |
