# Страница: Производство / Cockpit (`ProductionCockpitPage`)

**Статус:** `STUDIO ESTIMATE PASS` — tools in app chrome (TZ-UX-323); fact production out of readiness.

**Краткое описание:** `/production` — студия план-оценки Ганта по `WorkType.days`. Shell: `PiGroupWorkspace` → full-width `production-studio-body` + overlay flyouts; page tools в **app-chrome-rail** (`PiChromeToolsService`). Не факт цеха; без ProductionOrder/OrderTask.

**SoT:** [`production-gantt-studio-spec.md`](../ux/production-gantt-studio-spec.md) · аудит [`2026-08-15-production-studio-plan-review.md`](../audits/2026-08-15-production-studio-plan-review.md) · cascade [`2026-08-15-gantt-cascade-no-bottom-card.md`](../audits/2026-08-15-gantt-cascade-no-bottom-card.md)

### Studio chrome (TZ-UX-323 live)

```text
app-chrome-rail-left:  ← + Заказы · Фильтры · Обновить
main: Gantt full width (no local 48px columns)
app-chrome-rail-right: → + Сегодня · Масштаб
flyouts: overlay; center width unchanged
```

**WAVE-PRODUCTION-GANTT-CASCADE (DONE):** **321** detail под видом работ; **322** meta под summary + kill bottom sheet; **323** один meta + full-width панели.

**CLOSEOUT:** `WAVE-PRODUCTION-COCKPIT-HARDEN` 324–328 DONE; estimate-studio score **98/100**; fact production remains OUT.
Prompt/archive: [`PROMPT-PRODUCTION-COCKPIT-HARDEN.md`](../../tasks/_backlog/PROMPT-PRODUCTION-COCKPIT-HARDEN.md) · `tasks/_archive/2026-08/TZ-PRODUCTION-328.done.md`.

Локальные `production-studio-rail` удалены. Consumer API: TZ-UX-322.

### Route

```
/production — KPPDF — Производство
```

`data.pageKey = production`, `data.capabilities = ['production:read']`

### Query params

| Параметр | Тип | Назначение |
|----------|-----|-----------|
| `orderId` | `string` (sales Order._id) | **HUB-303 / 322:** после загрузки orders → `ctx.selectOrder(id)` + открыть order-meta strip; unknown id — RU hint + fallback «все активные» |
| `q` | `string` | Deep-link из инспектора: открывает `/orders?q=<номер>` (сам `/production` `q` не читает) |

Ручной select в rail URL не обязан обновлять.

### Read path / existing API contracts

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/orders` | Список коммерческих заказов |
| GET | `/api/products/:id` | Изделие + composition (dual-read) |
| GET | `/api/modules/:id` | Модуль + workTypes |
| GET | `/api/work-types` | Справочник дней (`days`) |

### Blocks

| Block | Файл | Роль |
|-------|------|------|
| orders-rail | `blocks/orders-rail.component.ts` | Список / поиск по номеру; Фильтры: Заказчик (Counterparty select), приоритет, даты, «Все активные», Сброс |
| gantt-bars | `blocks/gantt-bars.component.ts` | Timeline-оценка, zoom day/week (day ≈36px); order-meta + work-detail cascade |
| order-inspector helpers | `blocks/order-inspector.component.ts` | Shared `promptCatalogDaysChange` (sheet host removed in 322) |
| scale controls | `blocks/production-scale-controls.component.ts` | Dumb RU zoom/fit controls; emits `zoomChange` + `fit` |

### Smart / dumb boundary (TZ-PRODUCTION-327)

`ProductionCockpitPage` remains the smart shell: it owns reads, PATCH orchestration, chrome registration, filters, and range fitting. `ProductionReadFacade` owns read/cache/composition mapping; `ProductionCockpitContext` owns local UI signals. Gantt and Orders rail remain behavior-sensitive presentational blocks, while the scale flyout buttons are isolated as `ProductionScaleControlsComponent` with input/output-only state and events. No UX/API rewrite or fact-production model is introduced.

### Inspector UX (follow-up 2026-08-06 evening)

- Приоритет = важность в списке/фильтре (**не** длина полосок); подсказка в UI.
- Виды работ: wash/цвет как на Ганте; опц. `WorkType.accentHue` в форме вида работ.
- Раскрытие дерева: крупные «+ / −», клик по всей строке; «→» в карточку `/products/:id` / `/modules/:id`.
- Фото изделия/модуля в дереве и иконки в свёрнутом rail (если есть `storageUrl`).
- Клик по области Ганта закрывает правую панель; rail сворачивается («« список» / «☰ заказы»).
- **TZ-UX-323 live:** tools in app-chrome-rail; no local 48px columns; flyouts overlay `left:0`/`right:0`.
- **No bottom card:** the old `Карточка` bottom sheet and chrome action were removed in TZ-322; order meta lives only as one cascade strip under the summary row. The cascade is the canonical interaction surface for status/priority/plannedDate and work-detail; do not restore a bottom overlay.
- Правка заказа: роли **admin|manager**. Дни вида работ: confirm «для всех заказов» + rollback; UX-gate `production:write` или admin|manager.
- **TZ-PRODUCTION-326 write-path:** meta Save и summary drag `plannedDate` используют `canEditOrder` (admin|manager) и после успешного PATCH перезагружают orders/bars; child resize и start-offset, а также WorkType.days используют `production:write`. «Сохранить заказ» — обязательный commit; после него Гант обновляется.
- Ссылка «Открыть в списке заказов» в order-meta ведёт в `/orders?q=<номер>`; OrdersPage применяет `q` через тот же search state, что и поле поиска.

### Audit hotfix (2026-08-06 late) — см. `docs/audits/2026-08-06-production-gantt-verdict-response.md`

- Единый `filterOrdersForRail` для rail и multi-order bars; поиск пересчитывает Гант.
- На полосах: номер заказа, изделие, status pip, легенда WorkType, 7 hue buckets.
- Chrome tools: Обновить / Сегодня / Масштаб; внутри «Масштаб»: День / Неделя / **Вместить сроки**.
- Неделя вычисляет `px/day = max(12, floor(ширина timeline / число дней))`; День сохраняет читаемые 36px/day.
- **Вместить сроки** берёт padded min…max текущих полос, включает Неделю и прокручивает к началу диапазона.
- **Сегодня** добавляет today в диапазон при необходимости и прокручивает маркер в видимую область.
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
| `ProductionScaleControlsComponent` | `zoom` input; `zoomChange` / `fit` outputs; dumb RU controls only |
| `OrdersService` | list() / update() / **patchEstimateDays()** (309/311) / **patchEstimateStart()** (316); existing API paths |

### Write-path matrix (TZ-PRODUCTION-326)

| Действие | FE gate | API path | После успеха |
|----------|---------|----------|-------------|
| Meta: priority + plannedDate → «Сохранить заказ» | `canEditOrder` (admin\|manager) | `PATCH /orders/:id` | `reloadOrdersKeepingSelection()` → bars rebuild |
| Summary body-drag plannedDate | `canEditOrder` (admin\|manager) | `PATCH /orders/:id` | `reloadOrdersKeepingSelection()` → summary moves |
| Child resize estimate days | `production:write` | `PATCH /orders/:id/estimate-days` | reload + rebuild |
| Child drag start offset | `production:write` | `PATCH /orders/:id/estimate-start` | reload + rebuild |
| Catalog WorkType.days | `production:write` | existing WorkTypes update | clear cache + reload |

BE verify: existing `OrdersService.update` accepts ISO `plannedDate`; no new endpoint in this TZ.

### State (signals)

| Сигнал | Назначение |
|--------|-----------|
| `ctx.selectedOrderId` | null = все активные |
| `ctx.activeOnly` | фильтр ACTIVE_COMMERCIAL_ORDER_STATUSES; default true |
| `ctx.counterpartyFilter` | id Counterparty или `__none__`; фильтрует rail + Гант |
| `ctx.filtersDirty` | true если counterparty / priority / dates / activeOnly отличаются от default |
| `facade.state` | orders / bars / warnings / loading / error |

### Business locks (A–J)

- Duration = `WorkType.days` only; quantity → `×N` display (не умножает дни).
- Order-level override: `Order.estimateDayOverrides` via `PATCH /orders/:id/estimate-days` (`production:write`); inspector default writes override; catalog «для всех» remains explicit confirm.
- **TZ-PRODUCTION-311:** правый край полосы состава (не noTerm / не readOnly) → snap к календарным дням → PATCH override → rebuild. Левый край — OUT.
- **TZ-PRODUCTION-312 / 314:** тело **сводной** полосы → `PATCH plannedDate`.
- **TZ-PRODUCTION-316:** тело **состава** → `PATCH …/estimate-start` (offset от visualAnchor; overlap OK); summary span обновляется.
- **TZ-PRODUCTION-314:** default = одна сводная полоса на заказ; ▸ expand → виды работ; `ctx.expandedOrderIds`.
- **TZ-PRODUCTION-317:** select/deep-link/reload **не** фильтруют Gantt до одного заказа; `applyFilteredActive()` без auto-expand; остальные сводки остаются.
- **TZ-PRODUCTION-318→320:** the historical full-width Карточка sheet contract is superseded; ▸/▾ is only Gantt composition expand/collapse and the order label only toggles the summary meta strip. Child labels open inline work-detail; no bottom card or chrome `Карточка` action exists.

- **TZ-PRODUCTION-321:** клик вида работ (лейбл или ▸) → inline detail **под строкой**: люди, дни (PATCH estimate-days), override-hint, «Изменить в справочнике» при `production:write`. Один detail; Esc/dismiss закрывает.
- **TZ-PRODUCTION-322:** номер заказа → order-meta strip под summary (статус, приоритет, план. дата, Сохранить, ссылка `/orders`); chrome «Карточка» и bottom sheet **удалены**. `gantt-order-active` = открытый meta.
- **TZ-PRODUCTION-323:** order-meta **только** под summary (`row.isSummary`); при раскрытом составе не дублируется на child. Meta и work-detail — **одна широкая** полоса (`gantt-cascade-panel`) через колонку «Заказ» + календарь (full-bleed из sticky label, spacer на timeline). Поля плотно в один ряд.
- **Work-detail highlight:** открытый detail → `gantt-work-detail-open` (отличим от `gantt-order-expanded` / `gantt-order-active`).
- **Meta open highlight:** открытый order-meta → `gantt-order-active` (светлее + inset рамка).
- **Tree expand highlight:** ▸ раскрытый заказ → `gantt-order-expanded` (wash + left accent); при открытом meta active имеет приоритет.
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
| **TZ-PRODUCTION-324** | DONE: week fit-width; «Вместить сроки» range fit; «Сегодня» marker scroll |
| **TZ-PRODUCTION-325** | DONE: Orders rail без status-pips; Заказчики → filter rail + Gantt; date filters verified |
| **TZ-PRODUCTION-326** | DONE: plannedDate meta/summary writes use `canEditOrder`; successful writes reload orders/bars |
| **TZ-PRODUCTION-327** | DONE: smart/dumb inventory; one dumb scale-controls extract; no UX/API rewrite |
| **TZ-PRODUCTION-328** | docs closeout: this page and the frozen Gantt spec are the SoT |
| **TZ-PRODUCTION-329** | DONE: Filters Counterparty select; tabs Заказы\|Заказчики removed; dirty Reset; Gantt follows select |

| **TZ-PRODUCTION-STUDIO-A** | DONE: frozen studio chrome contract (docs-only) |
| **TZ-PRODUCTION-STUDIO-B** | DONE: PiGroupWorkspace wrap + local shell state |
| **TZ-PRODUCTION-STUDIO-C** | DONE: visual rails/flyouts + hard Orders/Filters split |
| **TZ-PRODUCTION-STUDIO-D** | DONE: geometry/a11y/theme smoke; estimate-only readiness |
| **TZ-UX-322** | DONE: `PiChromeToolsService` + app-layout render |
| **TZ-UX-323** | DONE: Gantt tools → chrome rails; local 48px rails removed |
| TZ-PRODUCTION-308…310 | **BLOCKED BY WAVE-PRODUCTION-STUDIO-CHROME**; не запускать поверх docked layout |
| TZ-PRODUCTION-304+ | stuck / check-in / auto-chain (plug-ins) |

### Studio wave readiness

- Статус: **STUDIO ESTIMATE PASS**; harden 324–327 landed; docs closeout 328.
- B/C/D DONE + UX-323: section chrome, full-width Gantt, tools in app chrome, hard filter split.
- `/work-types` reads as Цех via `Гант` / `Виды работ` chips; CRUD не переписывался.
- Estimate writes (plannedDate, estimate-day/start, WorkType.days) are explicit existing paths; **fact production, shop-floor status, assignment, ProductionSchedule, ProductionOrder and OrderTask remain OUT**.

### Known limitations

- Полная keyboard-семантика grid — 310+.
- Drag-resize UI — TZ-PRODUCTION-311 (после 309 SoT).
- Нет assign writes / ProductionSchedule SoT.
- Browser smoke зависит от живого API/Mongo.
- Existing manager roles in DB may need `production:write` re-seed / manual grant if created before 309.
- Product/module deep-links из старого inspector — backlog; sheet не восстанавливать.

### Final interaction contract (TZ-PRODUCTION-328)

| Действие | Результат |
|----------|-----------|
| **Заказы** | Поиск по номеру; выбор/мета заказа; `Все активные` сохраняет многозаказные полосы Ганта |
| **Фильтры** | Заказчик (Counterparty select), активность, приоритет, плановая дата `С`/`По`; Сброс accent если dirty; chrome «Фильтры» active пока dirty |
| **Сегодня** | Включает today в диапазон и прокручивает timeline к красному маркеру Сегодня |
| **Масштаб → День** | Фиксированная читаемая плотность `36px/день` |
| **Масштаб → Неделя** | Fit-плотность `max(12, floor(width timeline / число дней))` |
| **Вместить сроки** | Берёт min/max текущих полос с запасом в день, включает Неделю и скроллит к началу; это не no-op |
| **Подпись заказа** | Переключает одну meta-полосу summary: статус, приоритет, plannedDate, Save, `/orders?q=<номер>` |
| **Тело summary-полосы** | Сдвиг plannedDate; `canEditOrder` (admin/manager); успешный PATCH перезагружает orders/bars |
| **Подпись / ▸ вида работ** | Inline work-detail (люди/дни/override/catalog); нижней Карточки нет |
| **Resize / тело вида работ** | Existing estimate-days / estimate-start под `production:write`; только estimate |

All dates are calendar estimate dates; weekends are not removed. All UI copy remains Russian: `Цех`, `Гант`, `Заказы`, `Фильтры`, `Заказчик`, `Сброс фильтров`, `Обновить`, `Сегодня`, `Масштаб`, `День`, `Неделя`, `Вместить сроки`.

### Zoom

| Режим | Поведение |
|-------|-----------|
| День | 36px/день, подписи дат на шкале |
| Неделя | fit-width: `max(12, floor(width/dayCount))`, подписи недель |
| Вместить сроки | padded min…max полос + fit Неделя + scroll к началу |
| Сегодня | today в range + scroll к красному маркеру |

### Smoke для PO (после land)

1. Войти как admin (или director/manager с `production` page + `production:read`).
2. Открыть `/production` — **сразу** видна шкала календаря (сегодня красной линией) и список активных заказов слева; пустой белый экран с «Выберите заказ…» — регрессия.
3. При наличии заказов с изделием→модули→`WorkType.days` — цветные полосы оценки.
4. Zoom День/Неделя меняет плотность шкалы без перезагрузки.

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
7. **День / Неделя** — меняется подпись «масштаб» и плотность шкалы (горизонтальный скролл в режиме День длиннее).
8. **Вместить сроки** — range сжимается к текущим барам, Неделя заполняет timeline по ширине, начало диапазона видно сразу.
9. **Сегодня** — красный маркер оказывается в видимой зоне; если today вне range, диапазон расширяется с запасом.
10. **Geometry smoke после B/C:** 1920px light/dark; `getBoundingClientRect()` для rails/center/flyout; center width unchanged; нет docked `w-56/20rem`, двойного scroll и клиппинга.
