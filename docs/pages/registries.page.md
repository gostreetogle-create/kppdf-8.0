# Страница: Реестры (`RegistriesPage` + `RegistryDetailPanelComponent`)

**Краткое описание:** `frontend-nx`-only «платформа реестров» — **master table**
на `/registries` (одна строка на реестр: название/описание, источник
API/демо, количество записей, expand-контрол). Клик по строке раскрывает
**inline panel прямо под этой строкой** с полноценным движком реестра
(toolbar/filters/table/pagination/sort/expand/row-actions), без перехода на
отдельную страницу. Раскрыт **только один** реестр одновременно —
`/registries/:registryKey` определяет, какая строка раскрыта, переживает
refresh/back/forward. `units` — **реальный backend API** (`GET /units`,
`PATCH /units/:key`); `modules`, `supply-requests`, `product-passports`, `text-blocks` и `table-templates` используют клиентскую пагинацию, когда API возвращает полный список; все источники явно подписаны на master-строке бейджем «API»/«Демо».

> До TZ-NX-REGISTRIES-MASTER-TABLE-UX `/registries` был card grid со
> ссылками на отдельную routed detail-страницу
> (`RegistriesListPage`/`RegistryDetailPage`, TZ-NX-REGISTRIES-PLATFORM).
> Оба файла удалены и заменены на `registries-page.ts` +
> `registry-detail-panel.component.ts` — см. «История» внизу.

## Route

```
/registries              — master table (RegistriesPage, ничего не раскрыто)
/registries/:registryKey — тот же RegistriesPage, строка `registryKey` раскрыта
```

Только `frontend-nx` (`apps/kppdf-web/src/app/pages/registries/**`). Оба пути
резолвятся в **один и тот же**
`loadComponent: () => import('./registries-page').then(m => m.RegistriesPage)`
— `:registryKey` не отдельная страница, а параметр, решающий, какая
master-строка раскрыта. Вложен в `AppShellComponent`
(`canMatch: [authGuard]`), **без** `capabilityRouteGuard` — ни у `units`, ни
у `departments`, ни у самого `'registries'` нет backend-seeded permission
key, задача явно запрещает его придумывать.

**`REGISTRIES_ROUTES` — один `UrlMatcher`-route, не два `path`-route
(TZ-NX-REGISTRIES-EXPAND-SCROLL-STABLE):** до этой TZ здесь были ДВА разных
объекта `Route` (`path: ''` и `path: ':registryKey'`), оба резолвящих в тот же
компонент. Angular's default `RouteReuseStrategy` сравнивает
`future.routeConfig === curr.routeConfig` — у двух разных объектов это всегда
`false`, поэтому КАЖДЫЙ клик master-строки (навигация между этими путями)
уничтожал и пересоздавал весь `RegistriesPage` целиком, вместе с DOM
master-таблиц под `.shell-main`. Это была настоящая причина «прыжка» скролла,
а не просто отсутствие restore. Теперь `registries.routes.ts` экспортирует
ОДИН route с `matcher` (0 сегментов → `/registries`, 1 сегмент → `registryKey`
как posParam) — один и тот же объект `Route`, поэтому Angular переиспользует
инстанс компонента между навигациями; меняется только
`ActivatedRoute.paramMap`.

## Master table (`registries-page.ts`)

- `@kppdf/ui/table` (`app-pi-table`) — тот же примитив, что и внутренний
  detail-engine. Первая колонка (`title`) несёт заголовок + описание
  (cellTemplate); вторая (`source`) — `app-pi-badge` («API» / «Демо»);
  третья (`recordCount`) — RU-плюрализация или «Неизвестно».
- Expand — **встроенный** механизм `pi-table`: `[expandedRow]` (TemplateRef
  → монтирует `<pi-registry-detail-panel [definition]="…">`),
  `[expandedRowWhen]` (единый предикат `row.key === registryKey()` —
  поэтому «раскрыт только один» гарантировано архитектурой, а не отдельным
  флагом), `(rowClick)` → `router.navigate(['/registries', row.key])` либо,
  если строка уже раскрыта, `router.navigate(['/registries'])` (collapse).
  Встроенная кнопка-шеврон в первой колонке и клик по всей строке ведут в
  один и тот же обработчик (кнопка вызывает `stopPropagation()` после).
- `row.key` — идентификатор строки (не `row.id`/`_id` реестра — у
  `RegistryDefinition` его никогда не было); `RegistryMasterRow.id` дублирует
  `key` только чтобы удовлетворить внутреннюю конвенцию `pi-table` по
  identity (`_id`/`id`).
- Неизвестный `registryKey` — master table остаётся видимой (ни одна строка
  не раскрыта), сверху баннер `data-test="registry-unknown"` с текстом ключа
  и ссылкой `← К реестрам` (`routerLink="/registries"`).
- Пустой каталог — `data-test="registries-empty"` (как раньше у card grid).

## Detail engine (`registry-detail-panel.component.ts`)

Извлечён **дословно** из бывшего `RegistryDetailPage` (TZ-NX-REGISTRIES-PLATFORM)
— единственное место, где живёт логика filters/page/sort ↔ URL,
loading/error/retry, expandable child rows, row actions. Отличие от
routed-версии: `definition` теперь `input.required<RegistryDefinition<RegistryRow>>()`
(родитель решает, какой реестр показать, сам definition больше не резолвит
catalog по route param). `ActivatedRoute`/`Router` внутри panel — **тот же**,
что у `RegistriesPage`: panel монтируется как обычный дочерний компонент
(через `*ngTemplateOutlet` внутри `pi-table`), не через отдельный
router-outlet, поэтому DI отдаёт тот же matched route — `queryParamMap`
чтение и `router.navigate([], {relativeTo: route, queryParams})` работают
корректно без какой-либо доп. синхронизации.

Побочный эффект переноса: раньше при переключении между двумя реестрами
Angular Router переиспользовал ОДИН И ТОТ ЖЕ инстанс `RegistryDetailPage`
(тот же route config, другой `:registryKey`) — отсюда был известный баг
«стрелка сортировки может не обновиться визуально» (`ngOnInit`-seed не
перезапускается). Теперь panel — дочерний компонент под `@if` в `pi-table`,
поэтому переключение реестра **уничтожает и создаёт заново** инстанс
`RegistryDetailPanelComponent` → `ngOnInit` каждый раз честно засеивает
сортировку заново. **Этот известный баг устранён как побочный эффект
рефакторинга**, не отдельной правкой.

## Typed contract

`model/registry.types.ts` — без изменений в основе (`RegistryDefinition`,
`RegistryColumn`, `RegistryFilter`, `RegistryRowAction`, `RegistryQueryState`,
`RegistryPageState`, `RegistryDataSource`, `defineRegistry()`), плюс TZ-NX-REGISTRIES-MASTER-TABLE-UX:

- `RegistrySource = 'api' | 'demo'` — новое **обязательное** поле
  `RegistryDefinition.source`. Обязательное намеренно: узкий, точечно
  обоснованный platform-contract change (задача явно это допускает), чтобы
  master table никогда не гадала/не парсила `description` для бейджа
  API/Демо.
- `RegistryMasterRow` заменил `RegistryCardSummary` (использовался только
  удалённым card-grid компонентом) — `{ id, key, title, description?, source,
  recordCount }`.

## URL / query state

Без изменений от TZ-NX-REGISTRIES-PLATFORM: `model/registry-query-state.ts` —
`parseRegistryQueryState`/`toRegistryQueryParams`, per-filter key + `page` +
`pageSize` + `sort`/`dir`, через `Router.navigate([], { relativeTo, queryParams })`.
Что действительно новое — сам путь (`/registries/:registryKey`) теперь ещё и
несёт «какая master-строка раскрыта», не только «какой реестр detail
показывает».

## Registries (`data/*.registry.ts`)

| key | title | source | Демонстрирует |
|-----|-------|--------|----------------|
| `units` | Единицы измерения | `api` (`GET /units`, `PATCH /units/:key`) | реальный backend, server-side search/filter/pagination, `sortable: false` (backend не поддерживает sort), toggle-active row actions, без delete (TZ-NX-REGISTRY-UNITS-READ-SLICE) |
| `materials` | Материалы | `api` (`GET/POST/PATCH/DELETE /materials`, duplicate) | сырьё (`materialKind=raw`); toolbar «Создать материал»; row actions: Редактировать, Копировать, Архивировать, Открыть в Конструкторе |
| `details` | Детали | `api` (тот же `/materials`, один `materialKind` за запрос) | Material с kind part/fastener/purchased/other; **по умолчанию** список только `part` (не «все non-raw»); фильтр «Вид» честно подписан; toolbar «Создать деталь»; тот же dialog/actions, kind выбирается в форме |
| `modules` | Модули | `api` (`GET/POST/PATCH/DELETE /modules`, composition) | toolbar create; row: Редактировать, Открыть состав (dialog), Архивировать; module dialog also edits separate `workTypes[]` planning links |
| `products` | Изделия | `api` (`GET/POST/PATCH/DELETE /products`, duplicate, composition) | toolbar create; row: edit/copy/archive, Открыть состав (dialog), Открыть в Конструкторе; badge «Комплекс» только при `isComplex` |
| `supply-requests` | Заявки снабжения | `api` (`GET /supply-requests`) | read-only; filters status/priority/search/orderId; **client** pagination (API cap 500) |
| `organizations` | Организации | `api` (`GET /organizations`) | read-only; supplier = `type` filter; server pagination |
| `product-passports` | Паспорта изделий | `api` (`GET /passports`) | read-only collection registry; product form dialog has **no** embedded passport preview (removed, `TZ-NX-REGISTRY-PRODUCT-FORM-UX`) — open passports only from this registry; **client** pagination |
| `text-blocks` | Тексты | `api` (`GET/POST/PATCH/DELETE /text-blocks`) | client pagination; search client-side, categoryId/isActive API filters; create/edit/archive dialogs |
| `table-templates` | Виды таблиц | `api` (`GET/POST/PATCH/DELETE /table-templates`) | client pagination; search/category client-side; column editor and data-source picker |
| `work-types` | Виды работ | `api` (`GET/POST/PATCH/DELETE /work-types`) | client pagination; search по названию/секции/отделу/описанию; create/edit/soft archive; поля days, hourlyRate, accentHue и isActive |
| `workers` | Люди | `api` (`GET/POST/PATCH/DELETE /workers`) | server pagination; search/status filters; create/edit/soft archive; workTypeIds skills used by Gantt labels |

Каталог — `createRegistriesCatalog()` / `provideRegistriesCatalog()` на `RegistriesPage`
(`REGISTRIES_CATALOG`, `data/registries.catalog.ts`). Dialog hosts получают **page-scoped**
`DestroyRef` — при уходе со страницы реестров открытые dialog закрываются автоматически.

### Toolbar + pagination (TZ-NX-REGISTRIES-FILTERS-PAGINATION-CONSISTENCY, TZ-NX-REGISTRIES-TOOLBAR-FINALIZE)

Единая строка `[data-test="registry-toolbar"]` в `RegistryDetailPanelComponent`:

- **Слева** (`registry-toolbar-filters`): подписанные text/select-фильтры из `RegistryDefinition.filters`; если фильтров нет (например `modules`) — компактный нейтральный placeholder `registry-toolbar-filters-empty` («Без фильтров»), чтобы toolbar не выглядел пустым/сломанным.
- **Справа** (`registry-toolbar-trailing`): `registry-create` (если есть) + `pi-registry-toolbar-pagination` (`registry-toolbar-pagination`).
- Пагинация в toolbar **всегда видима** при `total > 0`, в том числе когда вся выборка умещается на одной странице (`total <= pageSize`); при `total = 0` pager скрыт.
- Пагинация в footer таблицы **отключена** (`total=0` на `pi-table`) — один pager в toolbar.
- `page` / `pageSize` / фильтры — в URL (`registry-query-state.ts`); смена фильтра сбрасывает `page` на 1.

| key | filters (query params) | paginationMode | API notes |
|-----|------------------------|----------------|----------|
| `units` | `search`, `status` → `isActive` | `server` | `GET /units` page/limit/search |
| `materials` | `search`, `categoryId` | `server` | всегда `materialKind=raw` в data source (не фиктивный UI-filter) |
| `details` | `search`, `categoryId`, `materialKind` | `server` | один `materialKind` за запрос; пустой select = `part` |
| `modules` | — | `client` | `GET /modules` list-all; **без** page/limit в API |
| `products` | `search`, `status` | `server` | `GET /products` page/limit/search/status |
| `supply-requests` | `search`, `status`, `priority`, `orderId` | `client` | `GET /supply-requests` list-all (max 500); UI slices pages |
| `organizations` | `search`, `type` | `server` | `GET /organizations` page/limit/search/type |
| `product-passports` | `search` (client), `productId` (API) | `client` | `GET /passports` list-all; optional `productId` query |
| `departments` | `search`, `status` | `fixture` | in-memory demo adapter |
| `text-blocks` | `search` (client), `categoryId`, `isActive` | `client` | GET /text-blocks returns full list; no server pagination |
| `table-templates` | `search`, `category` (client) | `client` | GET /table-templates returns full list; no server pagination |
| `work-types` | `search` (client) | `client` | GET /work-types returns full list; no server pagination |
| `workers` | `search`, `status` | `server` | GET /workers page/limit/search/isActive; max limit 100 |

### Icon row actions (TZ-NX-REGISTRIES-FULL-CLOSEOUT)

Row actions и toolbar create — **icon-only** Lucide через app-layer компоненты
`registry-row-action-button` / `registry-create-button` (не libs/ui):

- Semantic tokens: `.pi-icon-btn-edit` (pencil), `.pi-icon-btn-copy`, `.pi-icon-btn-danger` (archive),
  `.pi-icon-btn-doc` (layers / constructor / composition), `.registry-icon-btn-success` (activate),
  `.registry-icon-btn-accent` (create Plus).
- Каждая кнопка: RU `aria-label`, `title`, `data-test="registry-row-action-{id}"`, keyboard focus
  (`.pi-focus-ring`), disabled + tooltip при `isDisabled`.
- Destructive actions — confirm dialog до API; success toast только после `ok` response.

| Registry | Icons |
|----------|-------|
| units | copy-key, check (activate), power (deactivate); **без delete** до backend FE remediation |
| materials/details | pencil, copy, archive, layers (constructor) |
| modules | pencil, layers (composition), archive |
| products | pencil, layers, copy, archive, layers (constructor) |
| departments | copy, archive (demo fixture) |

### Composition parity (TZ-NX-REGISTRIES-COMPOSITION-PARITY-WAVE-1)

- **Add target:** новая строка состава добавляется в **выбранный** nested module/product parent;
  если выбран material leaf или ничего — в root entity; nested parent → свой composition endpoint
  (`POST /modules/:id/composition` / `POST /products/:id/composition`), не в root.
- **`focusComposition`:** row action «Открыть состав» прокручивает composition block в видимую область
  (`scrollIntoView` + focus), без изменения layout shell.
- **Master expand scroll (TZ-NX-REGISTRIES-EXPAND-SCROLL-STABLE):** the real fix is the single-`matcher` route in `registries.routes.ts` (see «Route» above) — Angular reuses the SAME `RegistriesPage` instance across expand/collapse instead of destroying/recreating it, so `.shell-main`'s scrollTop is never disturbed by navigation in the first place. The pre-existing two-frame scrollTop capture/restore in `onMasterRowClick` stays as defense-in-depth but is no longer load-bearing. The URL-driven single-expand model is unchanged; no `scrollIntoView` is used for master expansion.
- **Trailing white space under the last master table (TZ-NX-REGISTRIES-EXPAND-SCROLL-STABLE):** `app-pi-table`'s own `.pi-table-footer` bar (hairline + `py-3` padding) renders unconditionally, even with no pager/caption/footer content — which the registries master tables never provide. `registries-page.ts` hides it via a scoped `::ng-deep app-pi-table .pi-table-footer { display: none; }` (component-local, does not touch the shared `pi-table.component.ts`).
- **Edit loading:** перед открытием edit dialog для module/product/material вызывается `getById`;
  при ошибке — toast, dialog не открывается (list row может быть неполным).
- **Details filter:** пустое значение фильтра «Вид» = только `part` (дефолтный запрос), не «все виды»;
  другие kind — явный выбор в фильтре. Backend без новых query params.

### Composition dialogs (TZ-NX-REGISTRIES-COMPOSITION-DIALOG)

- Master page: компактный `PiPageChrome` (только crumbs «Реестры»), без дублирующего H1/описания платформы; контент в `px-panel-inset`.
- `ModuleFormDialogComponent` / `ProductFormDialogComponent` — `PiDialogComponent` `variant="content"`, max-width 1120px, sticky footer, паспорт + `pi-composition-panel` в edit mode.
- Composition: `GET .../tree`, CRUD `.../composition`, picker через `PiOverflowSelect`, inspector qty/unit, add-and-continue, remove с confirm, error/retry.
- Domain: Module → Module+Material; Product → Module+non-raw Material+Product; Material — leaf.
- `/constructor` capability снят из registry actions; `/studio` остаётся отдельной страницей.

### Materials / Details row dialogs (TZ-NX-REGISTRIES-ROW-DIALOGS-MATERIALS)

- `RegistryDefinition.createAction` — optional toolbar hook; panel рендерит `[data-test="registry-create"]`.
- Единый `MaterialFormDialogComponent` (`PiDialogComponent`, `variant="content"`, max-width до 1120px): поля из backend `CreateMaterialDto` (name, article, unit, sku, materialKind, categoryId, price, weight, assortment/standard/grade, colors, description, notes, dimensions). Без composition, photos, suppliers.
- Materials: `materialKind` зафиксирован `raw` (поле disabled, не перезаписывается patch из list row);
  icon-only «удалить размер» — `aria-label`.
- Copy — `POST /materials/:id/duplicate`; Archive — `DELETE /materials/:id` с confirm; success → toast + `ctx.reload()`, error → toast / inline error в dialog.
- `/constructor` и row action «Открыть в Конструкторе» сохранены.

### Complex (domain canon)

**Комплекс** — производное **Product**, у которого в `composition[]` есть
строка с `lineType = product`. Отдельной коллекции Complex, реестра
«Комплексы» и query-параметра `isComplex` нет. `GET /products` (list) не
отдаёт надёжный `isComplex` — реестр «Изделия» один; badge «Комплекс»
появляется только если поле реально присутствует в ответе строки (сегодня —
только на `GET /products/:id` detail).

### Modules list-all

`GET /modules` возвращает полный активный набор без `page`/`limit`/`search`.
Адаптер реестра не шлёт фальшивую server-side пагинацию; UI нарезает страницы
на клиенте (`modules-http-data-source.ts`).

## UI

- `PiPageChromeComponent` — единственная крошка «Реестры» (не «Реестры →
  <реестр>» — реестр уже назван в своей master-строке и в заголовке panel).
- Master table и detail-панель используют один и тот же `@kppdf/ui/table`;
  никаких новых UI-примитивов не добавлено, `libs/ui` не тронут.
- Источник (API/Демо) — `app-pi-badge` (`variant="secondary"` / `"outline"`,
  токен-based цвета, никаких raw colors/box-shadow).
- Заголовок реестра внутри раскрытой панели — лёгкий `<h2>` + `<p>`
  (`font-display`/`text-muted-foreground`, те же классы, что у
  `PiPageChromeComponent`, но без полного `<header>`-chrome — panel уже
  визуально обособлена ink-рамкой `pi-table`'а).
- Destructive-подтверждение, error+retry, expandable child rows, row
  actions — без изменений (тот же `PiDialogService`/`AlertDialogComponent`/
  `PiStatusBannerComponent`).

## Supply / passport mapping (TZ-NX-REGISTRY-READINESS-MARATHON)

Verified matrix: `tasks/_archive/2026-08/TZ-NX-REGISTRIES-SUPPLY-PASSPORT-MATRIX.done.md`
(derived from `TZ-NX-SUPPLY-PASSPORT-AUDIT.done.md`, no XLSX re-read).

| Domain area | Registry status | Notes |
|-------------|-----------------|-------|
| Catalog (units/materials/details/modules/products) | **PRESENT** on `/registries` | This page documents them |
| Complex (derived Product) | **PARTIAL** | Badge in products column only; no separate registry; no `isComplex` list filter |
| SupplyRequest | **PRESENT** | Backend `GET /supply-requests` exists; read-only registry on `/registries/supply-requests`; import still blocked |
| Organizations / suppliers | **PRESENT** | Read-only `/registries/organizations`; supplier via `type=supplier` filter |
| StorageItem / stock | **MISSING** | Backend `GET /storage-items`; no NX registry |
| ProductPassport | **PRESENT (read-only registry)** | `/registries/product-passports` + preview in product dialog; import blocked on `productId` matching |
| Departments | **PRESENT (demo)** | Fixture only, not supply/passport data |

Spreadsheet import is **out of scope** for registries platform — see audit blockers (status mapping,
supplier dedup, passport↔Product matching, invoice field).

### Doc Studio dialogs

«Тексты» используют `TextBlockFormDialogComponent`: name, slug, tags, categoryId, sortOrder и rich-text content. Поле legacy `category` намеренно не формируется и не отправляется. «Виды таблиц» используют `TableTemplateFormDialogComponent`: category с RU-метками, dataSource и редактор колонок с добавлением/удалением строк. Для обоих реестров диалоги получают page-scoped DestroyRef.

## Browser verification (TZ-NX-REGISTRY-READINESS-MARATHON)

Real browser smoke via `node start.mjs --nx --no-browser` + headless Chrome
(`docs/agent-checklists/evidence/TZ-NX-REGISTRY-READINESS-MARATHON/smoke.mjs`):

- `/registries` master table — all 6 rows
- `/registries/{units,materials,details,modules,products,departments}` — toolbar, filters/pagination,
  icon-only row actions, zero console/API errors
- Materials create/edit/archive-confirm dialogs opened
- Module + Product composition dialogs opened
- Evidence: `docs/agent-checklists/evidence/TZ-NX-REGISTRY-READINESS-MARATHON/` (13 screenshots +
  `smoke-report.json`)

## Known limitations

- **Supply / passport / org / stock registries** — not implemented; do not mark ready (see matrix above).
- **Products «Комплекс» badge** — list API may omit `isComplex`; badge only when field present in row.
- **Modules** — client-side pagination only (`GET /modules` list-all); no search filter until backend adds query params.
- `registries.routes.spec.ts`: paging back/forward по-прежнему проверяется
  через `harness.navigateByUrl(...)` вместо `Location.back()/forward()` —
  тот же, ранее задокументированный, версийный нюанс
  `RouterTestingHarness`+`provideLocationMocks()` (Angular 20.3.30), не баг
  страницы.

## История

- TZ-NX-REGISTRIES-PLATFORM (2026-08-29) — исходная card-grid + routed
  detail платформа, фикстура-only.
- TZ-NX-REGISTRIES-NAV-AND-DEMO-REVIEW (2026-08-29) — header nav, счётчик
  записей на карточках.
- TZ-NX-REGISTRY-UNITS-READ-SLICE (2026-08-29) — `units` подключён к
  реальному `GET /units`/`PATCH /units/:key` (первый non-fixture
  `RegistryDataSource`).
- TZ-NX-REGISTRY-UNITS-DELETE-FIX (2026-08-29) — backend-фикс (вне
  frontend-nx): реальный hard-delete для `DELETE /units/:key`.
- **TZ-NX-REGISTRIES-MASTER-TABLE-UX (2026-08-29)** — card grid → master
  table, routed detail page → inline panel (этот документ).
- **TZ-NX-REGISTRIES-MODULES-PRODUCTS-READ (2026-08-29)** — read-only
  `modules` + `products` registry rows; `PiModulesService`; Complex canon.
- **TZ-NX-REGISTRIES-ROW-DIALOGS-MATERIALS (2026-08-29)** — toolbar create +
  row edit/copy/archive для `materials`/`details`; `MaterialFormDialogComponent`;
  `PiMaterialsService` write methods в data-access.
- **TZ-NX-REGISTRIES-FILTERS-PAGINATION-CONSISTENCY (2026-08-29)** — unified toolbar: filters left, pagination + create right; `paginationMode` on definitions.
- **TZ-NX-REGISTRIES-WORK-TYPES (2026-09-05)** — API-backed «Виды работ» registry with typed CRUD and client-side list controls.
- **TZ-NX-REGISTRIES-WORKERS (2026-09-05)** — API-backed «Люди» registry with typed CRUD, `workTypeIds[]` skill selection, and a Gantt link to `/registries/workers`.
- **TZ-NX-REGISTRIES-MODULE-WORK-TYPES (2026-09-05)** — module create/edit dialog loads active Work Types and persists `workTypes[]` planning links independently from material composition.

---

_Обновлено: 2026-09-05 (TZ-NX-REGISTRIES-EXPAND-SCROLL-STABLE)._
