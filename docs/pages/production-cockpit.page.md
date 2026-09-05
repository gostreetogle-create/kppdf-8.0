# Страница: Производство / Cockpit (`ProductionCockpitPage`)

**Статус:** `NX PORT DONE` + **P2 polish DONE** (TZ-NX-GANTT G0–G7, P2, 2026-09-05) — см. [NX-порт](#nx-порт-tz-nx-gantt-g0g7) ниже. Legacy: `STUDIO ESTIMATE PASS`; fact production out of readiness (L1–L6).

**Краткое описание:** `/production` — студия план-оценки Ганта по `WorkType.days`. **Актуальный код (NX):** `frontend-nx/apps/kppdf-web/src/app/pages/production/**`; tools в **shell rails** (`ShellToolRailService`). Секции ниже с путями `frontend/` — исторический legacy-эталон порта (не удалять до отдельного решения PO о delete legacy). Не факт цеха; без ProductionOrder/OrderTask.

**SoT:** [`production-gantt-studio-spec.md`](../ux/production-gantt-studio-spec.md) · аудит [`2026-08-15-production-studio-plan-review.md`](../audits/2026-08-15-production-studio-plan-review.md) · cascade [`2026-08-15-gantt-cascade-no-bottom-card.md`](../audits/2026-08-15-gantt-cascade-no-bottom-card.md)

### Studio chrome (TZ-UX-323 live)

```text
app-chrome-rail-left:  ← + Заказы · Фильтры · Обновить
main: Gantt full width (no local 48px columns)
app-chrome-rail-right: → + Сегодня
flyouts: overlay; center width unchanged
gantt-toolbar: TOC-chips По заказам|По рабочим · День|Месяц|Вместить сроки (в шапке Ганта, не chrome)
```

**WAVE-PRODUCTION-GANTT-CASCADE (DONE):** **321** detail под видом работ; **322** meta под summary + kill bottom sheet; **323** один meta + full-width панели.

**CLOSEOUT:** `WAVE-PRODUCTION-COCKPIT-HARDEN` 324–328 DONE; estimate-studio score **98/100**; fact production remains OUT.
Prompt/archive: [`PROMPT-PRODUCTION-COCKPIT-HARDEN.md`](../../tasks/_backlog/PROMPT-PRODUCTION-COCKPIT-HARDEN.md) · `tasks/_archive/2026-08/TZ-PRODUCTION-328.done.md`.

Локальные `production-studio-rail` удалены. Consumer API: TZ-UX-322.

### Route

```
/production — KPPDF — Производство
```

Legacy: `data.pageKey = production`, `data.capabilities = ['production:read']`.
NX: `frontend-nx/apps/kppdf-web/src/app/app.routes.ts` — route `production` → `ProductionCockpitPage` (lazy), `data.pageKey = production`, capability `production:read`; `ProductionReadFacade` предоставлен на route-уровне (не в component `providers` — иначе DI затеняет override'ы). Чип «Производство/Цех» в шапке включён через `collectPageRoutePaths` (G1).

### Query params

| Параметр | Тип | Назначение |
|----------|-----|-----------|
| `orderId` | `string` (sales Order._id) | **HUB-303 / 322:** после загрузки orders → `ctx.selectOrder(id)` + открыть order-meta strip; unknown id — RU hint + fallback «все активные» |
| `from` | `string` (`desk`) | **DESK-404 / DESK-416:** при `from=desk` + валидном `orderId` — видимая RU-кнопка **«На стол»** (`data-test="desk-return"`) → `/desk?orderId=`. Источники `from=desk`: rail tools (404) и tray «Открыть производство» на `/desk` (416). Hub `/orders` не шлёт `from`. |
| `q` | `string` | Deep-link из инспектора: открывает `/orders?q=<номер>` (сам `/production` `q` не читает) |

Ручной select в rail URL не обязан обновлять.

### Couplings

Канон: [`docs/COUPLING-MAP.md`](../COUPLING-MAP.md). Audit: [`2026-08-16-order-status-coupling.md`](../audits/2026-08-16-order-status-coupling.md).

| Поле | Этот экран | Другие экраны | Смысл |
|------|------------|---------------|-------|
| `Order.status` | «Все активные» = `confirmed` / `in_production` / `ready` | Комбайн колонки (`draft` = Черновики); `/orders`; форма freeze | **Канон + код (TZ-PRODUCTION-337):** `draft` ≠ цех. См. [`COUPLING-MAP.md`](../COUPLING-MAP.md) §2. |

### Read path / existing API contracts

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/orders` | Список коммерческих заказов |
| GET | `/api/products/:id` | Изделие + composition (dual-read) |
| GET | `/api/modules/:id` | Модуль + workTypes |
| GET | `/api/work-types` | Справочник дней (`days`) |
| GET | `/api/workers?limit=100&isActive=true` | Лейблы людей по workType (TZ-334; BE `@Max(100)`, не 200) |

### Blocks

Пути ниже — legacy (`frontend/src/app/pages/production/`); NX-эквиваленты — в [NX-порт](#nx-порт-tz-nx-gantt-g0g7).

| Block | Файл | Роль |
|-------|------|------|
| orders-rail | `blocks/orders-rail.component.ts` | Список / поиск по номеру; Фильтры: Заказчик (Counterparty select), приоритет, даты, «Все активные», Сброс |
| gantt-bars | `blocks/gantt-bars.component.ts` | Timeline-оценка, zoom day/month (day ≈36px); order-meta + work-detail cascade; `groupByWorkers` input → worker-grouped read-only tree |
| order-inspector helpers | `blocks/order-inspector.component.ts` | Shared `promptCatalogDaysChange` (sheet host removed in 322) |
| scale controls | `blocks/production-scale-controls.component.ts` | Horizontal toolbar in Gantt header; emits `zoomChange` / `fit` / `groupByChange` |

### NX-порт (TZ-NX-GANTT G0–G7)

**Актуальный SoT-код:** `frontend-nx/apps/kppdf-web/src/app/pages/production/`. Волна: `WAVE-NX-PRODUCTION-GANTT` (checklist + archive `tasks/_archive/2026-09/TZ-NX-GANTT-G*.done.md`); аудит порта `docs/audits/2026-09-04-gantt-nx-port-audit.md`; live smoke `docs/audits/2026-09-05-gantt-nx-smoke.md`.

| NX файл | Роль | G |
|---------|------|---|
| `pages/production/production-cockpit.page.ts` | Smart shell: bootstrap, chrome tools (`ShellToolRailService`), фильтры, PATCH-оркестрация, range/fit/today + refit после сдвигов | G1→G5 |
| `pages/production/production-read.facade.ts` | Чтение через `@kppdf/data-access`: orders + products/modules **bulk** + work-types + workers; retry 429/503; warnings | G2 |
| `pages/production/gantt-bar.model.ts` | Pure-модель 1:1 (статусы A/C, sequential pack, estimate math, worker-группировка) | G2 |
| `pages/production/production-cockpit.context.ts` | Локальные UI-сигналы (1:1) | G2 |
| `pages/production/blocks/gantt-bars.component.ts` | Timeline 1:1: дерево, каскад, drag/resize, zoom; viewport re-anchor после сдвигов (G4); calendar pane cool `bg-paper-2` wash (P2) | G3–G6 + P2 |
| `pages/production/blocks/orders-rail.component.ts` | Rail + фильтры (1:1; `o.status` optional-safe) | G3 |
| `pages/production/blocks/production-scale-controls.component.ts` | Toolbar группировка/масштаб как TOC-chips (`aria-pressed`) | G3 + P2 |
| `pages/production/blocks/order-inspector.component.ts` | `promptCatalogDaysChange` helper | G3/G5 |
| `libs/data-access`: `sales/order.types.ts` + `pi-orders.service.ts` | `estimateDays/estimateStartOffsets/estimateDayOverrides` + `patchEstimateDays/patchEstimateStart` | G2 |
| `libs/data-access`: `catalog/work-type.types.ts`, `pi-work-types.service.ts` | WorkTypes read + `update` (catalog days, G5) | G2/G5 |
| `libs/data-access`: `people/person.types.ts`, `pi-people.service.ts` | Workers (`/workers?limit=100&isActive=true`) | G2 |

Спецификации NX: model/facade/page/bars/rail/workers + write-path (`*.spec.ts` рядом). G3 выравнял `anyComponentStyle` budget NX до legacy 8/16kB (Гант style-heavy by design). Данные: bulk hydrate `POST /products/bulk` + `POST /modules/batch` (aliases `GET /api/products/bulk?ids=`, `/api/modules/bulk?ids=`), как в legacy TZ-PRODUCTION-338/341.

### Smart / dumb boundary (TZ-PRODUCTION-327)

`ProductionCockpitPage` remains the smart shell: it owns reads, PATCH orchestration, chrome registration, filters, and range fitting. `ProductionReadFacade` owns read/cache/composition mapping; `ProductionCockpitContext` owns local UI signals. Gantt embeds `ProductionScaleControlsComponent` as a dense header toolbar (group left, zoom right); chrome «Масштаб» flyout removed (TZ-PRODUCTION-348). No UX/API rewrite or fact-production model is introduced.

### Inspector UX (follow-up 2026-08-06 evening)

- Приоритет = важность в списке/фильтре (**не** длина полосок); подсказка в UI.
- Виды работ: wash/цвет как на Ганте; опц. `WorkType.accentHue` в форме вида работ.
- Раскрытие дерева: крупные «+ / −», клик по всей строке; «→» в карточку `/products/:id` / `/modules/:id`.
- Фото изделия/модуля в дереве и иконки в свёрнутом rail (если есть `storageUrl`).
- Клик по области Ганта закрывает правую панель; rail сворачивается («« список» / «☰ заказы»).
- **TZ-UX-323 live:** tools in app-chrome-rail; no local 48px columns; flyouts overlay `left:0`/`right:0`.
- **No bottom card:** the old `Карточка` bottom sheet and chrome action were removed in TZ-322; order meta lives only as one cascade strip under the summary row. The cascade is the canonical interaction surface for status/priority/plannedDate and work-detail; do not restore a bottom overlay.
- Правка заказа: роли **admin|manager**. Дни вида работ: confirm «для всех заказов» + rollback; UX-gate `production:write` или admin|manager.
- **TZ-PRODUCTION-326 / 335 write-path:** meta `Важность` + `Начало плана` auto-save on change (`canEditOrder` admin|manager); optimistic local bars + silent PATCH like 333 (no success toast, no full reload; fail → revert + error). Summary drag `plannedDate`, child resize and start-offset same silent path. WorkType.days catalog still reloads. No «Сохранить заказ» button.
- **TZ-PRODUCTION-331:** план-поля (`plannedDate`, `priority`) редактируются до статуса **Готов** / **В производстве**; состав/заметки/контрагент на этих статусах заморожены. `shipped`/`delivered`/`cancelled` — hard read-only. Legacy-заказ без `siteId` перед save лечится первой площадкой контрагента (иначе RU 400).
- Ссылка «Открыть в списке заказов» в order-meta ведёт в `/orders?q=<номер>`; OrdersPage применяет `q` через тот же search state, что и поле поиска.
- **TZ-PRODUCTION-335 sort:** вертикальный порядок Ганта (и rail) = summary `startDate` по возрастанию (раньше выше), tie-break `orderNumber`. **Не** сортировать по важности/`priority`. После optimistic drag plannedDate строки переставляются без reload.

### Audit hotfix (2026-08-06 late) — см. `docs/audits/2026-08-06-production-gantt-verdict-response.md`

- Единый `filterOrdersForRail` для rail и multi-order bars; поиск пересчитывает Гант.
- На полосах: номер заказа, изделие, status pip, легенда WorkType, 7 hue buckets.
- Chrome tools: Обновить / Сегодня. В шапке Ганта: **Группировка** (По заказам | По рабочим), День / Месяц / **Вместить сроки**.
- **TZ-GANTT-401:** «По рабочим» — read-only вид Ганта: строки группируются по `workerLabel` (People×WorkType уже на барах), без назначения → группа «Не назначен»; **TZ-PRODUCTION-344:** Worker ▸ (default collapsed) → модули с контекстом `заказ · изделие · модуль` → WT после ▸ модуля; нет resize-handle и body-drag (нельзя PATCH). ACTIVE filter и `buildGanttBars`/facade не изменены. Default = «По заказам» (прежний tree по заказу).
- Месяц вычисляет `px/day = max(12, floor(ширина timeline / число дней))`; тики = RU месяцы (`август`, не `н.32`). День: 36px/day, тик = `DD.MM` + RU weekday (ПН…ВС, UTC); шапка шкалы и колонка «Заказ» — `h-10`.
- **Вместить сроки** берёт padded min…max текущих полос, включает Месяц и прокручивает к началу диапазона.
- **Сегодня** добавляет today в диапазон при необходимости, **всегда** центрирует маркер и кратко подсвечивает красную линию (chrome title «Прокрутить к сегодня»; не silent no-op даже когда scroll уже у края / диапазон короткий).
- Flyout **Заказы** = только список заказов (уже с учётом фильтров) + поиск по номеру; вкладок «Заказы | Заказчики» нет (TZ-329).
- Flyout **Фильтры**: активность, приоритет, даты, `<select>` **Заказчик** (все / каждый Counterparty из заказов / «Без заказчика»). Выбор сразу режет rail и Гант. **Сброс фильтров** горит `pi-btn-ink`, когда dirty (counterparty / priority / dates / activeOnly≠true; default activeOnly=true). Chrome «Фильтры» active, пока dirty.
- Покупатель = сущность **Counterparty**, не Organization. Фильтры дат режут rail и тот же набор баров Ганта.
- Даты = **календарная** оценка (выходные не исключаются) — не факт цеха.

### Services / context

| Сервис | Методы / boundary |
|--------|-------------------|
| `ProductionCockpitContext` | selectedOrderId, search, activeOnly, zoom, priorityFilter, dateFrom/To, counterpartyFilter, filtersDirty, resetFilters; local UI state |
| `ProductionReadFacade` | loadOrders, loadBarsForOrders, buildOrderEstimatePublic, getWorkerLabelsMap; read/cache/composition mapping, no fact-production SoT |
| `ProductionCockpitPage` | `onRefresh`, `onToday`, `onFitHorizon`, order-meta/estimate commits; smart shell: chrome, filters, PATCH orchestration, range + reload |
| `ProductionScaleControlsComponent` | `zoom` + `groupBy` inputs; `zoomChange` / `fit` / `groupByChange` outputs; dumb RU controls only |
| `OrdersService` | list() / update() / **patchEstimateDays()** (309/311) / **patchEstimateStart()** (316); existing API paths |

### Write-path matrix (TZ-PRODUCTION-326 / 333 / 335)

| Действие | FE gate | API path | После успеха |
|----------|---------|----------|-------------|
| Meta: Важность + Начало плана (auto-save) | `canEditOrder` (admin\|manager) | `PATCH /orders/:id` | optimistic local bars; no full reload |
| Summary body-drag plannedDate | `canEditOrder` (admin\|manager) | `PATCH /orders/:id` | optimistic local bars; no full reload |
| Child resize estimate days | `production:write` | `PATCH /orders/:id/estimate-days` | optimistic local bars; no full reload |
| Child drag start offset | `production:write` | `PATCH /orders/:id/estimate-start` | optimistic local bars; no full reload |
| Catalog WorkType.days | `production:write` | existing WorkTypes update | clear cache + reload |

BE verify: existing `OrdersService.update` accepts ISO `plannedDate`; no new endpoint in this TZ.

### State (signals)

| Сигнал | Назначение |
|--------|-----------|
| `ctx.selectedOrderId` | null = все активные |
| `ctx.activeOnly` | фильтр `confirmed`/`in_production`/`ready`; default true; **код = канон** (TZ-PRODUCTION-337, без `draft`) |
| `ctx.counterpartyFilter` | id Counterparty или `__none__`; фильтрует rail + Гант |
| `ctx.filtersDirty` | true если counterparty / priority / dates / activeOnly отличаются от default |
| `facade.state` | orders / bars / warnings / loading / error |

### Business locks (A–J)

- Duration = `WorkType.days` only; quantity → `×N` display (не умножает дни).
- Order-level override: `Order.estimateDayOverrides` via `PATCH /orders/:id/estimate-days` (`production:write`); inspector default writes override; catalog «для всех» remains explicit confirm.
- **TZ-PRODUCTION-311:** правый край полосы состава (не noTerm / не readOnly) → snap к календарным дням → PATCH override → optimistic local bars (333). Левый край — OUT.
- **TZ-PRODUCTION-312 / 314:** тело **сводной** полосы → `PATCH plannedDate` (optimistic, 333).
- **TZ-PRODUCTION-316:** тело **состава** → `PATCH …/estimate-start` (offset от visualAnchor; overlap OK); summary span обновляется локально.
- **TZ-PRODUCTION-314:** default = одна сводная полоса на заказ; ▸ expand → **изделия** (не сразу WT); `ctx.expandedOrderIds`.
- **TZ-PRODUCTION-342:** дерево **Заказ → Изделие → Модуль → Вид работ**; expand keys `expandedProductIds` / `expandedModuleIds` (`product:{orderId}:{item}` / `module:{orderId}:{item}:{moduleId}`); WT + cascade/drag только после ▸ модуля; product/module summary = derived span (не resize).
- **TZ-PRODUCTION-344:** «По рабочим» — Worker → Module(+контекст) → WT; `expandedWorkerIds` / `expandedWorkerModuleIds`; default collapsed; read-only.
- **TZ-PRODUCTION-351:** «По рабочим» — ФИО + сводная полоса tinted **dominant WT** (`accentHue`, max days); label wash + chip; milk fallback без hue. ▸ worker → module context rows; WT после ▸ модуля.
- **TZ-PRODUCTION-352:** dominant WT tint для **назначенных** worker summary — `resolveWorkTypeHue` (catalog `accentHue` или hash/snap как у leaf WT); «Не назначен» без hue до 353.
- **TZ-PRODUCTION-353:** banner «Без исполнителя» + link `/people`; «Не назначен» row amber wash/chip; bars остаются на Ганте.
- **TZ-PRODUCTION-317:** select/deep-link/reload **не** фильтруют Gantt до одного заказа; `applyFilteredActive()` без auto-expand; остальные сводки остаются.
- **TZ-PRODUCTION-336:** на Гант кладутся только заказы с ≥1 work-bar (прямой модуль + вид работ). Заказы без модулей остаются в rail с маркером «нет плана»; жёлтая шапка «нет прямых модулей» не показывается. При выборе / `?orderId=` такого заказа — RU toast (и hint для deep-link); диаграмма не заполняется пустыми полосками. Deep product→product BOM — known_limitation.
- **TZ-PRODUCTION-347:** модули/виды работ с именами «сборк*/упаков*» (напр. «Финишная сборка», «Упаковка») скрыты из `buildGanttBars` до складской волны; каталог не удаляется.
- **TZ-PRODUCTION-318→320:** the historical full-width Карточка sheet contract is superseded; ▸/▾ is only Gantt composition expand/collapse and the order label only toggles the summary meta strip. Child labels open inline work-detail; no bottom card or chrome `Карточка` action exists.

- **TZ-PRODUCTION-321:** клик вида работ (лейбл или ▸) → inline detail **под строкой**: люди, дни (PATCH estimate-days), override-hint, «Изменить в справочнике» при `production:write`. Один detail; Esc/dismiss закрывает.
- **TZ-PRODUCTION-322:** номер заказа → order-meta strip под summary (статус заказа, важность, начало плана, ссылка `/orders`); chrome «Карточка» и bottom sheet **удалены**. `gantt-order-active` = открытый meta.
- **TZ-PRODUCTION-323:** order-meta **только** под summary (`row.isSummary`); при раскрытом составе не дублируется на child. Meta и work-detail — **одна широкая** полоса (`gantt-cascade-panel`) через колонку «Заказ» + календарь (full-bleed из sticky label, spacer на timeline). Поля плотно в один ряд.
- **Work-detail highlight:** открытый detail → `gantt-work-detail-open` (отличим от `gantt-order-expanded` / `gantt-order-active`).
- **Meta open highlight:** открытый order-meta → `gantt-order-active` (светлее + inset рамка).
- **Tree expand highlight:** ▸ раскрытый заказ → `gantt-order-expanded` + рамка блока (`gantt-order-group-start` / mid / `-end`, ≥2px); chevron ▸/▾ ≥14–16px, колонка ≥36px (TZ-PRODUCTION-339). Шапка summary (`group-start`) чуть темнее/желтее children (TZ-PRODUCTION-340). **TZ-PRODUCTION-343:** вложенные рамки изделия/модуля (`gantt-product-group-*` / `gantt-module-group-*`) читаемы внутри order frame; aria/title: изделие = «модули изделия», модуль = «виды работ». **TZ-PRODUCTION-348:** шапка колонки одно слово `Заказ` / `Рабочий` (без `·` и без border-l рамки); клик по лейблу worker/product/module = expand.
- **Nest indent + level washes (TZ-PRODUCTION-346/349/350):** колонка лейблов — `padding-left` ~15/30/45px по глубине (order|worker=0, product=1, module=2, work=3); полосы календаря без горизонтального сдвига. **TZ-PRODUCTION-350:** одна тёплая paper hue-семья (~82–90), лестница только L/C (order→product→module→work светлее вниз); сводные `barFill` плотнее row wash той же семьи; `gantt-order-expanded` — только рамка; WT bars = accentHue.
- **Dismiss:** клик по пустой сетке / Esc — свернуть work-detail + meta + деревья.
- `visualAnchor = plannedDate ?? date ?? today`.
- No `planned` Order status; no ProductionOrder/OrderTask.

### TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-PRODUCTION-303 | Shell + rail + gantt + PAGE_KEYS + director read Roles |
| TZ-PRODUCTION-303.1 | Closeout: inspector `/orders?q=` deep-link + Gantt hotfix documentation |
| **TZ-ORDERS-HUB-303** | Deep-link `/production?orderId=` → selectOrder; unknown id safe + RU hint |
| TZ-PRODUCTION-302 | WorkType.days |
| **TZ-PRODUCTION-309** | DONE: order estimate days + WorkType mutate `production:write` |
| **TZ-PRODUCTION-311** | DONE: Gantt right-edge resize → order override only (cascade within order) |
| **TZ-PRODUCTION-312** | DONE: summary/body plannedDate move |
| **TZ-PRODUCTION-313** | DONE: card flyout compact (dock superseded by 315) |
| **TZ-PRODUCTION-314** | DONE: order summary row + expand composition |
| **TZ-PRODUCTION-315** | DONE historically: Карточка bottom sheet; superseded and removed by TZ-322 |
| **TZ-PRODUCTION-316** | DONE: per-bar start offsets (parallel) |
| **TZ-PRODUCTION-317** | DONE: select keeps multi-order bars; expand in-place |
| **TZ-PRODUCTION-318** | DONE: sheet full-width + viewport; composition expands up |
| **TZ-PRODUCTION-319** | DONE historically: card interaction; superseded by the meta strip in TZ-322 |
| **TZ-PRODUCTION-320** | DONE historically: ▸ = tree only; order label interaction superseded by the meta strip in TZ-322 |
| **TZ-PRODUCTION-321** | DONE: work-type click → inline detail (люди / дни / catalog) |
| **TZ-PRODUCTION-322** | DONE: order-meta under summary; kill sheet + chrome «Карточка» |
| **TZ-PRODUCTION-323** | DONE: one meta under summary; full-width cascade panels |
| **TZ-PRODUCTION-324** | DONE: week fit-width historically; «Вместить сроки»; «Сегодня» marker scroll |
| **TZ-PRODUCTION-325** | DONE: Orders rail без status-pips; Заказчики → filter rail + Gantt; date filters verified |
| **TZ-PRODUCTION-326** | DONE: plannedDate meta/summary writes use `canEditOrder`; successful writes reload orders/bars |
| **TZ-PRODUCTION-327** | DONE: smart/dumb inventory; one dumb scale-controls extract; no UX/API rewrite |
| **TZ-PRODUCTION-328** | docs closeout: this page and the frozen Gantt spec are the SoT |
| **TZ-PRODUCTION-329** | DONE: Filters Counterparty select; tabs Заказы\|Заказчики removed; dirty Reset; Gantt follows select |
| **TZ-PRODUCTION-330** | DONE: zoom «Месяц» replaces «Неделя»; RU month ticks; Сегодня always recenters |
| **TZ-PRODUCTION-331** | DONE: plan fields (`plannedDate`/`priority`) editable through ready; composition frozen; missing `siteId` healed from Counterparty sites |
| **TZ-PRODUCTION-332** | DONE: Day zoom ticks = `DD.MM` + RU weekday (ПН…ВС); scale + «Заказ» headers `h-10`; Month ticks unchanged |
| **TZ-PRODUCTION-333** | DONE: Gantt drag/resize commit = optimistic local bars + silent PATCH; revert + error toast on fail; no success toast / full reload |
| **TZ-PRODUCTION-334** | DONE: workers list for Gantt labels uses `limit: 100` (BE `@Max(100)`); no `limit=200` 400 |
| **TZ-PRODUCTION-335** | DONE: Gantt/rail sort by summary startDate (tie orderNumber); meta labels Статус заказа / Важность / Начало плана; auto-save silent optimistic; no obsolete sync hint |
| **TZ-PRODUCTION-336** | DONE: skip orders without direct modules/work types on Gantt; rail marker «нет плана»; toast only on select / `?orderId=` |
| **TZ-PRODUCTION-338** | DONE: Gantt hydrate = parallel product/module prefetch + non-blocking rail thumbs (bars first); estimate math unchanged |
| **TZ-PRODUCTION-341** | DONE: hydrate `PREFETCH_CONCURRENCY` 8→3 + 429/503 retry (backoff 300/800/1500); no 404 retry; BE throttle untouched |
| **TZ-PRODUCTION-342** | DONE: Gantt tree Order→Product→Module→WT; expand product/module keys; WT leaf + cascade/drag after module ▸; worker IA = 344 |
| **TZ-PRODUCTION-343** | DONE: RU expand aria/title (изделие/модуль); nested product/module frames; header `Заказ · изделие`; «По заказам» unchanged |
| **TZ-PRODUCTION-344** | DONE: Worker → Module(order·product·module) → WT; ▸ on worker; default collapsed; RO |
| **TZ-PRODUCTION-345** | DONE: whole-product pseudo-module «… · целиком»; empty modules stay ineligible |
| **TZ-PRODUCTION-346** | DONE: label nest indent ~10/20/30px + quiet level washes; timeline bars unshifted; frames/meta intact |
| **TZ-PRODUCTION-347** | DONE: hide module/WT names matching сборк/упаков from `buildGanttBars`; catalog untouched |
| **TZ-PRODUCTION-348** | DONE: Gantt toolbar group/zoom; header Заказ/Рабочий; label click expand; nest 15px |
| **TZ-PRODUCTION-349** | DONE: 4-level milk palette CSS vars; distinct summary barFill; order-expanded no beige flatten |
| **TZ-PRODUCTION-350** | DONE: mono milk ladder (hue ~82–90 L/C only); no rainbow jumps; WT accents kept |
| **TZ-PRODUCTION-351** | DONE: worker FIO + summary bar tint dominant WT; ▸→modules; orders-mode milk ladder unchanged |
| **TZ-PRODUCTION-352** | DONE: `resolveWorkTypeHue` hash fallback for assigned worker summary; unassigned hue null until 353 |
| **TZ-PRODUCTION-353** | DONE: unassigned banner + `/people` CTA; amber «Не назначен» row; bars stay visible |

| **TZ-PRODUCTION-STUDIO-A** | DONE: frozen studio chrome contract (docs-only) |
| **TZ-PRODUCTION-STUDIO-B** | DONE: PiGroupWorkspace wrap + local shell state |
| **TZ-PRODUCTION-STUDIO-C** | DONE: visual rails/flyouts + hard Orders/Filters split |
| **TZ-PRODUCTION-STUDIO-D** | DONE: geometry/a11y/theme smoke; estimate-only readiness |
| **TZ-UX-322** | DONE: `PiChromeToolsService` + app-layout render |
| **TZ-UX-323** | DONE: Gantt tools → chrome rails; local 48px rails removed |
| TZ-PRODUCTION-308…310 | **BLOCKED BY WAVE-PRODUCTION-STUDIO-CHROME**; не запускать поверх docked layout |
| TZ-PRODUCTION-304+ | stuck / check-in / auto-chain (plug-ins) |

### Studio wave readiness

- Статус: **STUDIO ESTIMATE PASS**; harden 324–328 + polish 329–330 landed.
- B/C/D DONE + UX-323: section chrome, full-width Gantt, tools in app chrome, hard filter split.
- `/work-types` reads as Цех via `Гант` / `Виды работ` chips; CRUD не переписывался.
- Estimate writes (plannedDate, estimate-day/start, WorkType.days) are explicit existing paths; **fact production, shop-floor status, assignment, ProductionSchedule, ProductionOrder and OrderTask remain OUT**.

### Known limitations

**L1–L6 (вне волны NX-порта, как и legacy):** факт цеха (check-in, статусы работ), табель %/часов, авто-назначение исполнителей, уведомления, ProductionSchedule/ProductionOrder/OrderTask — планирование остаётся оценкой по `WorkType.days`.

- Полная keyboard-семантика grid — 310+.
- Drag-resize UI — TZ-PRODUCTION-311 (после 309 SoT).
- Нет assign writes / ProductionSchedule SoT.
- Browser smoke зависит от живого API/Mongo.
- Existing manager roles in DB may need `production:write` re-seed / manual grant if created before 309.
- Изделия только с вложенными изделиями (без прямых module lines) по-прежнему «не для Ганта» — отдельная TZ на deep BOM, если PO попросит.
- Zoom Месяц: нет полосы дней недели под именем месяца — successor только по запросу PO.
- **TZ-PRODUCTION-333/335:** catalog WorkType.days по-прежнему toast + full reload; второй write того же заказа, пока PATCH в полёте, игнорируется.
- Plan-vs-fact: после «выполнено» предлагать обновить норматив `WorkType.days` — **parked** (fact production OUT). См. `tasks/_backlog/PARK-plan-vs-fact-days.md`.
- **TZ-PRODUCTION-337 known_limitation:** deep-link `?orderId=` на draft-заказ по-прежнему показывает его через selected bypass (`filterOrdersForRail`), хотя из «Все активные» draft исключён. Не чинить без отдельного TZ.
- **TZ-PRODUCTION-338 known_limitation:** `destroy` → `clearCaches()` — повторный вход на `/production` снова платит cold hydrate; session cache / BE batch — successor.
- **TZ-PRODUCTION-341 known_limitation:** полный batch products/modules API — later; BE short throttle 10/s не меняли (successor только по PO); `DISABLE_THROTTLE=1` — только local/dev.
- **TZ-PRODUCTION-345:** изделие без модулей остаётся ineligible (336), если нет WT; pseudo-module `moduleId=productId` → одна строка модуля «Изделие · целиком» под изделием (order/worker trees 342–344).
- **TZ-PRODUCTION-343:** RU labels/frames for product/module DONE («По заказам» ok).
- **TZ-PRODUCTION-344:** worker lens Module+context DONE (default collapsed).
- **NX known gaps vs legacy (порт G0–G7):** photo-URL resolution из legacy facade не портирован (в NX-шелле нет photo-клиента; thumb'ы rail работают без него); live smoke выполнялся на admin (директор/менеджер-роли с `production` page — как в legacy). Pre-existing (не из волны): 2 failing tests в `registries.catalog.spec.ts` (`59bcf499`, другой агент; вне conflict keys).

### Final interaction contract (TZ-PRODUCTION-328)

| Действие | Результат |
|----------|-----------|
| **Заказы** | Поиск по номеру; выбор/мета заказа; `Все активные` сохраняет многозаказные полосы Ганта |
| **Фильтры** | Заказчик (Counterparty select), активность, приоритет, плановая дата `С`/`По`; Сброс accent если dirty; chrome «Фильтры» active пока dirty |
| **Сегодня** | Центрирует красный маркер + pulse-ack (chrome «Прокрутить к сегодня»); расширяет range если today вне |
| **Масштаб → День** | Фиксированная читаемая плотность `36px/день`; тик = `DD.MM` + ПН…ВС; шапка шкалы и «Заказ» `h-10` |
| **Масштаб → Месяц** | Fit-плотность `max(12, floor(width timeline / число дней))`; тики RU месяцев |
| **Вместить сроки** | Берёт min/max текущих полос с запасом в день, включает Месяц и скроллит к началу; это не no-op |
| **Подпись заказа** | Переключает одну meta-полосу summary: Статус заказа, Важность, Начало плана (auto-save), `/orders?q=<номер>` |
| **Тело summary-полосы** | Сдвиг plannedDate; `canEditOrder` (admin/manager); silent PATCH, полоса остаётся на месте; ошибка → revert + toast |
| **Подпись / ▸ вида работ** | Inline work-detail (люди/дни/override/catalog); нижней Карточки нет |
| **Resize / тело вида работ** | estimate-days / estimate-start под `production:write`; optimistic local bars; silent PATCH |

All dates are calendar estimate dates; weekends are not removed. All UI copy remains Russian: `Цех`, `Гант`, `Заказы`, `Фильтры`, `Заказчик`, `Сброс фильтров`, `Обновить`, `Сегодня`, `По заказам`, `По рабочим`, `Не назначен`, `День`, `Месяц`, `Вместить сроки`.

### Zoom

| Режим | Поведение |
|-------|-----------|
| День | 36px/день, подписи `DD.MM` + ПН…ВС (UTC) на шкале; шапка `h-10` вместе с «Заказ» |
| Месяц | fit-width: `max(12, floor(width/dayCount))`, подписи RU месяцев |
| Вместить сроки | padded min…max полос + fit Месяц + scroll к началу |
| Сегодня | today в range + recenter красного маркера + pulse |

### Smoke для PO (после land)

1. Войти как admin (или director/manager с `production` page + `production:read`).
2. Открыть `/production` — **сразу** видна шкала календаря (сегодня красной линией) и список активных заказов слева; пустой белый экран с «Выберите заказ…» — регрессия.
3. При наличии заказов с изделием→модули→`WorkType.days` — цветные полосы оценки.
4. Zoom День/Месяц меняет плотность шкалы без перезагрузки.

### Локальные демо-данные (Mongo, не FE-hardcode)

| Как | Что |
|-----|-----|
| `node scripts/seed-local-demo.mjs` | Идемпотентно пишет DEMO-LOCAL заказы/каталог через API в локальную Mongo |
| `LocalDemoSeed` (backend boot, non-prod) | То же на старте BE; отключить: `LOCAL_DEMO_SEED=0` |

Маркер: `DEMO-LOCAL-*`. Production guard: `NODE_ENV=production` → seed не бежит.
2. Nav «Производство» → `/production`.
3. Слева список активных заказов; поиск; галка «Все активные».
4. Клик по заказу с изделием (модули + workTypes с `days`) → справа полоски «План-оценка».
5. Заказ без days → штриховка «без срока»; quantity >1 → `×N` без умножения дней.
6. Dense layout: без двойного скролла страницы.
7. **День / Месяц** — меняется подпись «масштаб» и плотность шкалы (горизонтальный скролл в режиме День длиннее).
8. **Вместить сроки** — range сжимается к текущим барам, Месяц заполняет timeline по ширине, начало диапазона видно сразу.
9. **Сегодня** — красный маркер центрируется в видимой зоне и кратко пульсирует; если today вне range, диапазон расширяется с запасом. Повторный клик снова скроллит/пульсирует (не no-op).
10. **Geometry smoke после B/C:** 1920px light/dark; `getBoundingClientRect()` для rails/center/flyout; center width unchanged; нет docked `w-56/20rem`, двойного scroll и клиппинга.
