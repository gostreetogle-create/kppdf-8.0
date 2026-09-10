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

Ручная CSS-grid таблица (текущая NX-конвенция, как `storage-items.page.ts`, без `<app-pi-table>`): ▸/▾ · позиция · заказ (`routerLink` на `/orders/:id`) · qty · статус · **создано** (`createdAt`) · действие по статусу (draft→Подтвердить, confirmed→Заказано, ordered→Получено).

- Фильтр по статусу (`<select>`), фильтр `?orderId=` (query-param, deep-link) с chip + «Сбросить» (`router.navigate` с `queryParamsHandling: 'merge'`)
- «+ Задача»: explode из состава заказа ИЛИ ручное создание (заказ + название + qty)
- `data-test` атрибуты на всех интерактивных элементах для тестов
- **TZ-NX-UX-06-supply-FIX:** клик по строке — expand-in-row (registry pattern) с полной линией заказа / датой подтверждения / примечанием read-only. `confirmedBy` (raw `ObjectId`, backend не резолвит в имя) **сознательно не показан** — не заводим сырой ObjectId в UI без lookup; `confirmedAt` покрывает практическую часть значения («когда подтверждено»). Filter-chip «Сбросить» переведён на `.pi-outline-btn`.
- **TZ-NX-HUB-03 (2026-09-10):** ▸/▾ chevron + денсер ряды (`py-2`) + expanded-row accent (`bg-paper-2` + `border-l-gold-deep`), как `/orders` (HUB-02). Основная колонка «Позиция» больше не показывает сырой `orderLineId` подписью (перенесено в expand). Row actions — один компактный `.pi-outline-btn` на статус (был широкий `app-pi-button`). Expand обогащён: **Материал**/**Модуль** — честные плейсхолдеры «Материал задан»/«Модуль задан» (BE не отдаёт имя на list/find, поэтому не рисуем название) вместо `—`, если id есть; **Линия заказа** — полный текст только если это НЕ похоже на raw ObjectId (regex `^[a-f0-9]{24}$`), иначе `—` (H5, `orderLineLabel()`); **Обновлено** (`updatedAt`); chip-ссылка на заказ (`.pi-outline-btn`) прямо в expand, в дополнение к текстовой ссылке в строке. `confirmedBy` по-прежнему нигде не отображается.
- **TZ-NX-HUB-06 (2026-09-10):** expand перестроен под gold card-язык `counterparty-hub-tray` — PO FAIL «просто тексты» на скрине. Обёртка `bg-paper-2 border-t hairline` → `grid md:grid-cols-2 gap-4 p-4` → 4 карточки `section.hairline.rounded-sm.bg-paper.p-4` + `h3`: **Позиция** (название/кол-во/статус) · **Связь с заказом** (линия заказа + order chip) · **Состав** (материал/модуль) · **Сроки и заметки** (создано/подтверждено/обновлено + примечание). Данные/логика не менялись, только группировка в карточки вместо плоского `grid-cols-2` списка `pi-label`. Audit: `docs/audits/2026-09-10-nx-hub-expand-cards.md`.

### Known limitation (унаследовано от backend, не изобретено во фронтенде)

`SupplyTaskService.markReceived` **не пишет `StockMovement`** — получение задачи снабжения (`/supply`, `SupplyTask`) не отражается в складском журнале. `SupplyRequestService` больше не в этом списке: `markReceived` заменён на `receive()` (TZ-NX-SUPPLY-S4-RECEIVE-TO-STOCK, §ниже), который создаёт `StockMovement` IN. `SupplyTask` receive остаётся backend-разрывом, задокументирован здесь, а не воспроизведён/замаскирован в NX-фронтенде.

### Tests

- `pi-supply-tasks.service.spec.ts` — 8 tests (все методы, HTTP mock)
- `supply.page.spec.ts` — фильтры, transitions, explode, create, no-mock-UI assertion, router-based filter clear, expand-in-row shows/hides detail, row action click does not toggle expand; **TZ-NX-HUB-03**: chevron toggle, «Создано» column, honest материал/модуль placeholders (no raw ObjectId), `confirmedBy` never rendered, orderLineId ObjectId-mask vs free-text pass-through, expand order chip link

## NX — TZ-NX-SUPPLY-S2-HUB-CONFIRM (order hub «Подтвердить материалы»)

S2 не трогает `/supply` саму по себе — это точка входа СО стороны заказа
(`docs/pages/orders.page.md` § TZ-NX-SUPPLY-S2), которая создаёт
`SupplyRequest` через S0 kit-reserve (`POST
/orders/:id/items/:itemIndex/kit-reserve`), а затем даёт deep-link сюда
(`/supply?orderId=`). `SupplyRequest` остаётся отдельной сущностью от
`SupplyTask` (реестр S1) — см. архитектурное решение в
`tasks/_archive/2026-09/TZ-NX-SUPPLY-S1-PAGE.done.md`. `SupplyRequest` теперь
показывается своим отдельным журналом — см. §S3 ниже (закрывает прежний gap:
NX больше не показывает `SupplyRequest` только через `?orderId=` deep-link).

## NX — TZ-NX-SUPPLY-S3-REQUEST-JOURNAL (журнал заявок, Sheets parity)

**Route:** `/supply-requests` (`data: { pageKey: 'supply-requests', capabilities: ['procurement:read'] }`).
Nav «Снабжение» теперь два пункта: **«Заявки»** (`/supply-requests`, этот журнал)
и **«По заказам»** (`/supply`, `SupplyTask` реестр выше) — раздельные сущности,
общая nav-категория (канон из `docs/audits/2026-09-06-supply-google-sheets-to-nx-audit.md` §3).

Единственный SoT для create/edit `SupplyRequest` в NX. Старая registries generic
запись (`title`+`qty` truncated dialog) **удалена** — второй конкурирующий UI не
плодился (было: `createSupplyRequestsRegistry` в `registries.catalog.ts` +
`SimpleRegistryFormDialogComponent` kind `'supply-request'`).

### UI (`supply-requests.page.ts` + `supply-request-form-dialog.component.ts`)

- Список: наименование/материал (snapshot `title`/`article`), кол-во+ед., поставщик
  (`Organization`, resolved по preloaded списку type=`supplier`), статус, оплата
  (`paid` — независимый флаг), счёт (`invoiceNo`), заказ (`Order.number` или
  свободный `orderLabel`), создал (короткий id — известное ограничение ниже), даты.
- Фильтры: поиск (title/article), статус, «только оплаченные» (`paid`) — все
  client-side (backend `GET /supply-requests` не отдаёт постраничный `paid`
  query, список и так капается на 500 строк).
- Форма (`width="md"` dialog): материал — живой typeahead (debounce 300ms,
  `PiMaterialsService.list({search, limit:10})`, мин. 2 символа) с fallback на
  ручные `title`/`article`, если каталожного совпадения нет; выбор материала
  автозаполняет `title`/`article`/`unit` (можно снять выбор кнопкой «Очистить» —
  возвращает ручной ввод); поставщик и заказ — `<select>` из preloaded списков
  (suppliers ≤100, orders — весь список, как на `/supply`); заказ:
  XOR `orderId`/`orderLabel` — сентинел-опция «Не найден в списке — ввести
  текст» переключает на свободный текст, взаимоисключение как на backend
  (`TZ-SUPPLY-BE-INVOICE-DELIVERY`); `paid` — чекбокс, независим от `status`.
- Диалог сам вызывает `PiSupplyRequestsService.create/update` (как
  `StockMovementFormDialogComponent`) — закрывается с сохранённой сущностью,
  страница просто перезагружает список.
- **TZ-NX-UX-07-supply-requests-FIX:** клик по строке — expand-in-row (registry pattern)
  с приоритетом / датой оплаты (`paidAt`) / фактическим получено (`receivedQty`) /
  доставкой (`deliveryNote`) / примечанием (`notes`) read-only — эти поля не показывались
  нигде, даже в форме редактирования. «Сбросить фильтры» (toolbar + empty-state) и
  диалоговые «Очистить»/«Копировать и изменить» переведены с underline-текста на
  `.pi-outline-btn`.

### Known limitation

Колонка «Создал» показывает укороченный `createdBy` id (`.slice(-6)`), не имя —
на NX ещё нет Users-lookup сервиса (только Person/Worker для производства, не
login-аккаунты). Резолюция в отображаемое имя — отдельная будущая задача.

### Chrome — фильтры / история / связь Order↔Request (TZ-NX-SUPPLY-S6-CHROME)

- Фильтры журнала: поиск (title/article), статус, «только оплаченные», диапазон
  дат «нужно к» (`neededBy` from/to) — все client-side (список уже капается на
  500 строк на бэкенде). «Сбросить фильтры» появляется только когда хоть один
  фильтр активен.
- Колонка «Заказ»: если `orderId` резолвится в локально загруженный `Order` —
  кликабельная ссылка на `/orders/:id` (`routerLink`, как на `/supply`); иначе
  показывается `orderLabel` (свободный текст) или короткий id как fallback.
- Пустое состояние различает «заявок вообще нет» (CTA «+ Заявка») и «ничего не
  найдено по фильтрам» (кнопка «Сбросить фильтры»), без жаргона.

## NX — TZ-NX-SUPPLY-S4-RECEIVE-TO-STOCK («Получено» → confirm + склад IN)

HITL confirm, не silent auto-IN: кнопка «Получено» на `/supply-requests` (не
`/supply` — SoT для `SupplyRequest` это журнал S3) открывает
`supply-request-receive-dialog.component.ts` — склад (`<select>`, prefilled
на `Warehouse.isDefault`, можно сменить) + количество факт (`receivedQty`,
prefilled план `qty`, можно поправить). Кнопка видна только для строк со
статусом `in_progress`/`requested`/`ordered` **и** привязанным `materialId`
(без материала — некуда постить остаток, единый write-path не завести).

**Единственный write-path склада:** `POST /supply-requests/:id/receive` →
`SupplyRequestService.receive()` → `StockMovementService.create({type:'in', …})`
(тот же сервис, что и ручные приходы на `/stock-movements`) → `status='received'`
+ `receivedQty` сохраняются на `SupplyRequest`. Повторный «Получено» на уже
`received` заявке — явный `409 Conflict` (reverse-path не заводился, «без
слова PO»); без `warehouseId` в запросе и без `Warehouse.isDefault` — `400`
(«сначала выберите склад», PO lock §6).

## NX — TZ-NX-SUPPLY-S5-MATERIAL-UPSERT (typeahead → создать / копировать материал)

В форме заявки (`supply-request-form-dialog.component.ts`), рядом с material
typeahead:

- **«+ Новый материал»** — открывает переиспользуемый
  `MaterialFormDialogComponent` (`registries/dialogs/material-form-dialog.component.ts`,
  тот же, что в реестре материалов, с фото-dropzone P1) в `mode: 'create'`,
  `allowKindSelect: true` (типы `part`/`fastener`/`purchased`/`other` — как у
  «детали» в реестре, не сырьё). Результат сразу биндится через `pickMaterial()`.
- **«Копировать и изменить»** на каждой строке результатов поиска — тот же
  диалог в `mode: 'create'` с `material: source` (prefill всех полей из
  источника через существующий `patchMaterial()`/`hydratePhotos()`); диалог
  сохраняет **новый** материал (create, не update — `mode` не даёт
  переключиться на edit), пользователь правит артикул/имя перед сохранением.
  Фото источника тоже prefill'ятся (существующее поведение диалога, не
  специально для copy) — можно убрать перед сохранением, если не нужны на копии.
- Дедуп — HITL: typeahead показывает список похожих, никакого auto-merge;
  выбор — явный клик пользователя (существующее поведение S3, не менялось).
- Второй каталог не заводился — единственный write-path материалов остаётся
  `PiMaterialsService` (`/materials`), тот же, что у реестра.

### TZ reference (NX)

| TZ | Что сделано |
|----|------------|
| TZ-NX-SUPPLY-S0-KIT-RESERVE-BE | Backend kit-availability/kit-reserve API (не в этом файле — см. warehouse/kit docs) |
| **TZ-NX-SUPPLY-S1-PAGE** | `/supply` живой реестр SupplyTask (без mock), `?orderId=`, transitions, explode/create |
| **TZ-SUPPLY-BE-INVOICE-DELIVERY** | `SupplyRequest`: `invoiceNo`/`deliveryNote`/`orderLabel` (XOR `orderId`) + отдельный флаг `paid`/`paidAt` (не связан со `status`) + `createdBy` (сервер проставляет из auth user на create, с клиента не меняется) |
| **TZ-NX-WAREHOUSE-DEFAULT** | `Warehouse.isDefault` — нужен для следующего S4 (receive→stock), не в этом файле — см. `docs/pages/warehouses.page.md` |
| **TZ-NX-SUPPLY-S3-REQUEST-JOURNAL** | `/supply-requests` — полный журнал заявок (Sheets parity), заменил truncated registries dialog |
| **TZ-NX-SUPPLY-S4-RECEIVE-TO-STOCK** | «Получено» на `/supply-requests` → confirm dialog → `StockMovement` IN (единый write-path) + `status='received'`; 409 на повтор |
| **TZ-NX-SUPPLY-S5-MATERIAL-UPSERT** | Material typeahead в форме заявки → «+ Новый материал» / «Копировать и изменить» через переиспользуемый `MaterialFormDialogComponent`; без второго каталога, без silent-merge дублей |
| **TZ-DESKTOP-SUPPLY-EXCEL-A** | Desktop Excel-импорт `supplyRequest`: колонки `invoiceNo`/`deliveryNote`/`paid`/`orderLabel`/`supplierName`/`orderNumber`; match по артикулу/имени/номеру → materialId/supplierId/orderId, miss = invalid-строка (не silent create) — см. `desktop/README.md` §Снабжение |
| **TZ-NX-SUPPLY-S6-CHROME** | `/supply-requests` — фильтры (status/paid/дата), ссылка на Order при совпадении `orderId`, различённые empty-состояния; **WAVE-NX-SUPPLY-OPS DONE (7/7)** |
| **TZ-DESKTOP-SUPPLY-EXCEL-B** | Desktop multi-sheet шаблон (`Заявки`+`Материалы`+`Поставщики`+`Заказы`), нативные Excel dropdown на «Артикул»/«Поставщик»/«№ заказа» → те же match-правила пути A на импорте — см. `desktop/README.md` §Снабжение путь B; **WAVE-NX-SUPPLY-OPS Excel B DONE** |
| **TZ-NX-HUB-03** | `/supply` только (`supply.page.ts`, не `/supply-requests`): ▸/▾ chevron + denser rows + expanded-row accent (parity с `/orders`); one-CTA-per-status compact `.pi-outline-btn` actions; richer expand (honest material/module placeholders, ObjectId-masked line key, updatedAt, order chip link). `WAVE-NX-HUB-TABLE-PARITY` #03 — DONE |
| **TZ-NX-HUB-06** | Expand → 4 категорийные карточки (gold `counterparty-hub-tray` markup), заменили плоский `pi-label` grid. `WAVE-NX-SHELL-HUB-POLISH` #02 — DONE |
