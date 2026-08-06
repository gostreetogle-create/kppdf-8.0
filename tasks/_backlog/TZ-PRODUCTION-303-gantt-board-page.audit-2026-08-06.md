# Audit: Production Cockpit Gantt (TZ-PRODUCTION-303)

**Дата аудита:** 2026-08-06  
**Режим:** read-only audit + remediation plan  
**Исходная задача:** [`TZ-PRODUCTION-303-gantt-board-page.md`](./TZ-PRODUCTION-303-gantt-board-page.md)  
**Canonical design:** [`docs/superpowers/specs/2026-08-06-production-cockpit-lego-design.md`](../../docs/superpowers/specs/2026-08-06-production-cockpit-lego-design.md)  
**Umbrella TZ:** [`TZ-PRODUCTION-300-production-cockpit-lego.md`](./TZ-PRODUCTION-300-production-cockpit-lego.md)

## Вердикт

План в целом хороший и соответствует канону Production Cockpit Lego. Направление правильное: `/production`, shell + standalone blocks, коммерческие `Order`, read-only оценка, без подмены `ProductionOrder`/`OrderTask`, без drag-reschedule и без запуска 304–307.

В текущем виде план не следует отдавать в исполнение без нескольких точечных уточнений. Главные обязательные уточнения:

1. не перепутать коммерческий заказ с фактическим производством;
2. не объявить `WorkType.days` единственным источником длительности без объяснения, почему `estimatedHours` не используется;
3. определить read-контракт для обхода `Order → Product → Module → WorkType`;
4. определить quantity/multiplicity и стабильный порядок bars;
5. зафиксировать RBAC/capability policy, особенно для `director`;
6. дополнить integration-файлы и browser smoke.

**Общая оценка:** 8/10 после этих уточнений; до уточнений — 6.5/10 из-за неопределённого data/API и RBAC contract.

---

## 1. Проверенный контекст проекта

На момент аудита:

- `HEAD = cd900c4` — реализация `TZ-CATALOG-311`;
- `origin/main = 6108092`;
- worktree чистый;
- commit `TZD-15 = 594833f` существует, но в текущую ветку не входит;
- активной `TZ-PRODUCTION-303` нет — для аудита это нормально, claim нужен на execute;
- production canonical docs указывают на 303 как первый кодовый TZ;
- `TZ-CATALOG-311` остаётся active по предыдущему Cursor-closeout процессу.

Проверенные источники:

- `tasks/_backlog/TZ-PRODUCTION-303-gantt-board-page.md`;
- `tasks/_backlog/TZ-PRODUCTION-300-production-cockpit-lego.md`;
- `docs/superpowers/specs/2026-08-06-production-cockpit-lego-design.md`;
- `backend/src/modules/order/order.schema.ts`;
- `frontend/src/app/pages/orders/orders.service.ts`;
- `backend/src/modules/catalog-graph/catalog-graph.service.ts`;
- `backend/src/modules/product/product.schema.ts`;
- `backend/src/modules/product-module/product-module.schema.ts`;
- `backend/src/modules/production-order/production-order.schema.ts`;
- `backend/src/modules/order-task/order-task.schema.ts`;
- `frontend/src/app/shared/services/pi-work-types.service.ts`;
- `frontend/src/app/app.routes.ts`;
- `frontend/src/app/layout/app-layout.component.ts`;
- `backend/src/common/seed/permissions.constants.ts`;
- `backend/src/common/seed/admin.seed.ts`;
- `docs/FEATURE-INTEGRATION-CHECKLIST.md`;
- `docs/AUDIT-METHODOLOGY.md`.

---

## 2. Что в плане подтверждено и сделано правильно

### 2.1 Route и Lego architecture — CONFIRMED

- `/production` соответствует design/spec и umbrella TZ.
- Shell + slots + standalone blocks соответствует зафиксированной архитектуре.
- `orders-rail`, `gantt-bars`, context и pure `gantt-bar.model.ts` — правильное разделение ответственности.
- Не делать god-component — соответствует канону.

### 2.2 Коммерческие Order как Phase 1 input — CONFIRMED / intentional

`Order` содержит:

- `items[]`;
- `productId`;
- `quantity`;
- `date`;
- `plannedDate`;
- `status`;
- `contractId`.

Использовать коммерческий `Order` для **визуальной оценки**, а не для фактического production schedule — соответствует design §3.4.

### 2.3 Реальные статусы Order — CONFIRMED

В backend и frontend у `Order` ровно семь статусов:

```text
draft
confirmed
in_production
ready
shipped
delivered
cancelled
```

Исправление, исключающее `planned`, правильное: `planned` относится к `ProductionOrder`, а не к коммерческому `Order`.

### 2.4 ProductionOrder/OrderTask boundary — CONFIRMED and correct

В проекте уже существуют:

- `ProductionOrder`: production status, `plannedStartDate`, `plannedEndDate`, actual dates, work type;
- `OrderTask`: worker, task status, planned/actual dates, dependencies, hours.

План правильно не использует их как SoT в 303. 303 — preview estimate, не operational production board.

Рекомендуемая строгая формулировка:

```text
303 does not read, create, patch, or infer ProductionOrder/OrderTask state.
303 does not display actual/planned production task status.
```

`contractId` может быть будущим bridge, но не должен быть обязательной частью 303.

### 2.5 WorkType.days direction — CONFIRMED with clarification needed

`WorkType.days?: number | null` специально существует для календарной оценки Gantt (TZ-PRODUCTION-302). Использовать его в Phase 1 правильно.

`days = null/undefined` → hollow/striped bar «без срока» — соответствует successor TZ-PRODUCTION-304.

### 2.6 Dense workspace — CONFIRMED

`isDenseWorkspaceUrl()` в `frontend/src/app/layout/app-layout.component.ts` сейчас не содержит `/production`; добавление `/production` соответствует визуальному контракту страницы.

### 2.7 Scope boundaries — NOT A BUG / OUT OF SCOPE

Правильно оставить за пределами 303:

- `ProductionSchedule` SoT;
- drag-reschedule;
- assign writes;
- stuck dialog / 304;
- check-in / 305;
- auto-chain / 306;
- completion / shipping / 307;
- каталог edits;
- desktop/MCP;
- warehouse rewrite.

---

## 3. Аудит A–G

## A — реальные статусы Order

**Вердикт: правильно, CONFIRMED.**

Реальные статусы ровно семь: `draft`, `confirmed`, `in_production`, `ready`, `shipped`, `delivered`, `cancelled`.

`planned` нельзя добавлять к `Order` только ради Gantt: это статус `ProductionOrder`.

### Что добавить в план

Зафиксировать:

```text
ACTIVE_COMMERCIAL_ORDER_STATUSES = draft/confirmed/in_production/ready
```

Это новая policy 303, а не уже существующая константа проекта. Нужно объяснить, почему «активные» означает именно эти четыре статуса.

Добавить tests:

- четыре active статуса показываются;
- `shipped`, `delivered`, `cancelled` скрываются;
- отдельно решить поведение `isActive === false`;
- вручную выбранный завершённый/отменённый заказ не должен исчезать без объяснения.

Рекомендуемый UX: завершённый заказ остаётся видимым в rail, но estimate становится read-only с понятной пометкой.

## B — дата и последовательная раскладка

**Вердикт: обязательное и правильное уточнение, но нужно формализовать.**

В `Order` есть `plannedDate` и `date`. Формула:

```text
visualAnchor = plannedDate ?? date ?? today
```

допустима только как UI preview. Она не записывает дату и не превращает её в production schedule.

Если fallback `today` остаётся, UI должен показать:

```text
Дата начала не задана — показано от сегодня
```

Нужно определить стабильный порядок:

1. Order items — индекс массива;
2. Product composition — `sortOrder`, затем исходный индекс;
3. Module composition — `sortOrder`, затем исходный индекс;
4. Module workTypes — `sortOrder`, затем исходный индекс;
5. одинаковые ключи — стабильный tie-break.

`sequential layout` — только способ разложить estimate bars на canvas. Это не утверждение, что технологические операции в цеху обязаны идти строго последовательно.

Нужно добавить timezone/date-only test, чтобы дата не уезжала на соседний день.

## C — ACTIVE_ORDER_STATUSES

**Вердикт: полезно, но это новая policy.**

Рекомендованное имя:

```ts
const ACTIVE_COMMERCIAL_ORDER_STATUSES: readonly OrderStatus[] = [
  'draft',
  'confirmed',
  'in_production',
  'ready',
];
```

Не называть их production statuses: это статусы коммерческого заказа.

Константа должна быть одна, а labels всех семи статусов — единая map.

## D — только days, estimatedHours не использовать

**Вердикт: решение приемлемое, но rationale обязательно.**

В проекте есть два разных поля:

```text
WorkType.days                     календарная оценка типа работ
ProductModule.workTypes[].estimatedHours  локальная трудоёмкость в модуле
```

Нельзя молча игнорировать `estimatedHours`: это создаст ощущение потери бизнес-логики.

Правильная формулировка:

```text
Bar duration = WorkType.days only.
Module.workTypes[].estimatedHours is intentionally not converted or used,
because no canonical hours→calendar-days policy exists.
WorkType.days is the only calendar-duration source for Phase 1.
```

Не следует самостоятельно принимать `8 hours = 1 day`: в проекте нет канонического рабочего календаря, смены или коэффициента загрузки.

Обработка:

- `days === null || days === undefined` → no-term bar;
- legacy `days === 0` → no-term bar;
- invalid/negative legacy value → no-term/error, не отрицательная ширина;
- несколько одинаковых work types в разных модулях → отдельные bars, без глобального dedupe по `workTypeId`.

## E — production-orders/tasks не читать как факт

**Вердикт: правильно, CONFIRMED.**

Добавить прямой запрет:

```text
303 does not read, create, patch, or infer ProductionOrder/OrderTask state.
```

Текущий 303 не должен показывать реальные task statuses, workers, actual dates или dependencies. Worker column в Phase 1 = `—`; будущая связь — отдельная TZ.

## F — dense workspace

**Вердикт: правильно.**

Добавить `/production` в `isDenseWorkspaceUrl()`.

Для самой страницы дополнительно нужны:

- `min-h-0`;
- `overflow-hidden` у shell;
- отдельный внутренний scroll rail/canvas;
- sticky left label column внутри Gantt, а не всего app shell;
- отсутствие двойного vertical scroll.

## G — integration docs

**Вердикт: правильно, но список неполный.**

Кроме перечисленного в плане, проверить и при необходимости обновить:

- `docs/pages/PAGE-TZ-INDEX.md`;
- `docs/pages/README.md`;
- `docs/pages/production-cockpit.page.md`;
- `docs/SECTION-READINESS.md`;
- `docs/agent-checklists/TZ-PRODUCTION-303.md`;
- `tasks/_active/TZ-PRODUCTION-303.md`;
- `progress.md`;
- `backend/src/common/seed/admin.seed.ts`;
- `frontend/src/app/core/capabilities/capabilities.metadata.ts` — только если меняется permission catalog;
- `frontend/src/app/pages/admin/permission-labels.ru.ts` — только если добавляется новый permission key.

---

## 4. P1 — главный пропуск: read/API contract

### Факт

`OrdersService.list()` возвращает flat `Order[]`, где order item содержит `productId`, но не modules/workTypes.

Чтобы построить Gantt, нужно пройти:

```text
Order
 → Order.items[].productId
 → Product.composition[]
 → direct module lines
 → ProductModule.workTypes[]
 → WorkType.days
```

`CatalogGraphService.getTree()` возвращает catalog tree, но не `workTypes`, поэтому он не является готовым Gantt read-model.

### Риск

Фраза плана «items → product → прямые module-линии → workTypes → days» пока описывает бизнес-идею, но не технический контракт. Без отдельного решения реализация начнёт придумывать API на ходу.

### Рекомендация для Phase 1

Предпочтительный вариант — thin frontend read facade, без нового backend SoT:

```text
OrdersService.list()
ProductsService.findById(productId)
ProductModulesService.list(productId) / findById(moduleId)
WorkTypesService.list({ activeOnly: false })
```

Facade строит `OrderEstimateInput` и делает:

- dedupe product/module/workType IDs;
- cache/read sharing;
- composition[] first;
- legacy `productModuleIds[]` / `materials[]` только как dual-read fallback;
- partial data warnings;
- missing product/module/workType handling;
- archived/deleted handling, насколько API позволяет.

Для «Все активные» нельзя делать N+1 на каждый bar без dedupe/cache.

Альтернативный вариант — backend endpoint вроде `GET /orders/:id/gantt-estimate`, но это уже отдельный API contract с DTO, org scope, permissions, tests и module wiring. Не добавлять его молча в frontend TZ.

**Рекомендация:** для 303 выбрать frontend facade, если объём демонстрационных данных небольшой; aggregator вынести в отдельную child-TZ при реальном performance/volume evidence.

---

## 5. P1 — quantity и multiplicity не определены

План пока не отвечает:

- умножается ли длительность на `OrderItem.quantity`;
- один bar показывается как `× N`;
- или одинаковые изделия раскладываются N последовательными bars;
- одинаковый module/workType в нескольких order items — один bar или несколько;
- что означает quantity для календарной оценки.

Это бизнес-логика, её нельзя придумывать при кодировании.

Для Phase 1 рекомендовано:

```text
Один bar = одна occurrence в Order item → product composition → module → workType.
OrderItem.quantity отображается как multiplier «× N».
Duration не умножается на quantity в 303, потому что WorkType.days уже является
календарной оценкой операции, а правило capacity/parallelism отсутствует.
```

Если PO хочет последовательное изготовление каждой единицы, это отдельное explicit решение и может потребовать successor schedule logic.

Bar identity должна учитывать occurrence:

```text
orderId + orderItemIndex + productId + moduleId + workTypeId + occurrence
```

Не dedupe только по `workTypeId`.

---

## 6. P1 — RBAC/capability mismatch

В проекте page ACL и capabilities — разные слои:

- `PAGE_KEYS` — visibility/navigation;
- `PERMISSIONS` — API capability;
- frontend route должен иметь `data.pageKey` и `data.capabilities`;
- `admin.seed.ts` содержит default role pages;
- `app-layout` filters nav by `user.pages` and capabilities.

`production:read` уже существует в permission catalog, поэтому новый permission key не нужен.

Нужно добавить в план exact matrix:

```text
PAGE_KEYS: production
Capability: production:read
Mutation capabilities: none in 303
```

И решить audience. Рекомендуемый вариант:

```text
admin/director/manager: page + read estimate
user/worker: no page in Phase 1
```

### Важное замечание про Director

Текущий `RolesGuard` проверяет literal roles. Многие production-relevant endpoints разрешают `admin, manager`, но не `director`:

- `GET /modules` — admin/manager;
- `GET /work-types` — admin/manager;
- module tree — admin/manager;
- product tree — admin/manager/user.

При этом `director` присутствует в default page ACL и имеет operational pages. Поэтому возможен плохой сценарий: Director видит `/production`, но получает 403 на data reads.

До execute нужно выбрать одно:

1. привести read endpoints к intended Director policy;
2. ограничить Cockpit только admin/manager;
3. сделать documented partial degradation.

Рекомендуется вариант 1 для read-only endpoints, если Director действительно должен видеть производство. Это отдельное backend/RBAC scope, а не то, что следует молча исправлять внутри UI.

Также проверить `@Permissions` contract: `production:read` существует, но текущие legacy controllers местами используют только `@Roles`. Новая production page не должна создавать иллюзию, что `data.capabilities` защищает backend endpoints.

---

## 7. Что не нужно менять в 303

Оставить out of scope:

- `ProductionSchedule` SoT;
- drag-reschedule;
- order/task writes;
- worker assignment writes;
- stuck/check-in/auto-chain/completion;
- catalog edit flows;
- desktop/MCP;
- warehouse rewrite;
- самостоятельное исправление 311/TZD-15 land process.

---

## 8. Рекомендуемый execution order

```text
0. Land dependencies:
   verify 311 and TZD-15 are actually on origin/main;
   do not trust local commit existence.

1. Un-park and claim TZ-PRODUCTION-303:
   active task, checklist, active-map, conflict keys.

2. Freeze read/business contract:
   status policy, active filter, date anchor, timezone, ordering,
   sequential visual semantics, quantity/multiplicity,
   composition traversal, WorkType.days-only rationale,
   ProductionOrder/OrderTask prohibition.

3. Build pure model first:
   gantt-bar.model.ts + fixtures + tests.

4. Build read facade/context:
   orders, product/module/work type reads, dedupe/cache,
   loading/error/partial state.

5. Build shell + route + nav + RBAC:
   pageKey/capability, role seed, dense route, nav.

6. Build orders rail:
   seven statuses, active filter, selected order, accessible selection.

7. Build Gantt bars:
   day/week zoom, date anchor, sticky label, today marker,
   status pip, no-days state, legend.

8. Docs + integration checklist + page docs.

9. Gates:
   FE tsc, focused Jest, lint, browser/DOM smoke, diff scope review.

10. READY → Cursor PASS → archive only after project protocol.
```

---

## 9. Missing acceptance criteria to add

Перед execute добавить AC:

1. `/production` opens for the intended role audience.
2. Orders rail shows all seven real status labels correctly.
3. «Все активные» includes exactly the explicitly chosen commercial statuses.
4. Manual selection of a completed/cancelled order has defined read-only UX.
5. `plannedDate ?? date ?? today` is visual-only and timezone-safe.
6. No order/catalog/production records are written by 303.
7. Product composition and module composition use canonical-first dual-read rules.
8. `OrderItem.quantity` presentation/multiplicity is explicit and tested.
9. Duplicate work types in different modules remain separate occurrences.
10. `days` drives duration; `estimatedHours` is not converted; null/invalid days render no-term state.
11. No reads/writes/inference from `ProductionOrder` or `OrderTask`.
12. Missing references produce partial warning, not a blank/broken board.
13. Empty, loading, error and no-days states are understandable in Russian.
14. Keyboard focus, dark/light contrast and 375px layout pass smoke.
15. `production` page key, capability and role defaults are synchronized.
16. Focused model/rail/Gantt tests pass.

---

## 10. Gate and browser verification

Minimum gates:

```bash
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- --testPathPattern="production|gantt|cockpit"
cd frontend && pnpm exec eslint <scoped-files>
cd frontend && pnpm exec prettier --check <scoped-files>
```

For UI add browser/DOM smoke:

- open `/production` as intended role;
- orders rail loads;
- select one order;
- Gantt changes;
- «Все активные» works;
- empty state works;
- no-days bar is visible;
- keyboard selection/focus works;
- 375px layout does not break shell;
- browser console has no errors.

If runtime/Mongo is unavailable, report that as limitation; do not call it PASS.

---

## 11. Final assessment

| Area | Assessment |
|---|---|
| Product direction | 9/10 |
| Lego design alignment | 9/10 |
| Real Order statuses | 10/10 |
| Date policy | 8/10; add visual-anchor/timezone semantics |
| Active status policy | 8/10; document as new policy |
| `days` policy | 7/10; correct direction, rationale required |
| Production boundary | 10/10 |
| Dense workspace | 9/10 |
| Integration docs | 7/10; add index, seed, capability contract |
| Data/API completeness | 5/10 until facade/aggregator is explicit |
| Quantity/multiplicity | undefined; P1 |
| RBAC Director/Manager | undefined; P1 |

### Final verdict

**План можно запускать после небольшого патча, но не в текущем виде.**

Обязательные правки перед execute:

1. зафиксировать read contract `Order → Product → Module → WorkType`;
2. выбрать frontend facade или backend aggregator;
3. описать `days`-only rationale и `estimatedHours` policy;
4. определить quantity/multiplicity;
5. определить role/capability matrix, особенно Director;
6. дополнить integration files и browser smoke.

Это аудит и план remediation, не команда начинать реализацию.
