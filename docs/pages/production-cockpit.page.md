# Страница: Производство / Cockpit (`ProductionCockpitPage`)

**Краткое описание:** Lego shell `/production` — слева заказы (rail), справа план-оценка Ганта по `WorkType.days`. Не факт цеха; без ProductionOrder/OrderTask.

### Route

```
/production — KPPDF — Производство
```

`data.pageKey = production`, `data.capabilities = ['production:read']`

### Query params

| Параметр | Тип | Назначение |
|----------|-----|-----------|
| `q` | `string` | Deep-link из инспектора: открывает `/orders?q=<номер>` и применяет номер к поиску списка заказов |

`q` относится к переходу из inspector в `/orders`; сам `/production` его не читает.

### API endpoints (read-only facade)

| Метод | Endpoint | Назначение |
|-------|----------|-----------|
| GET | `/api/orders` | Список коммерческих заказов |
| GET | `/api/products/:id` | Изделие + composition (dual-read) |
| GET | `/api/modules/:id` | Модуль + workTypes |
| GET | `/api/work-types` | Справочник дней (`days`) |

### Blocks

| Block | Файл | Роль |
|-------|------|------|
| orders-rail | `blocks/orders-rail.component.ts` | Список / поиск / приоритет / даты / «Все активные» |
| gantt-bars | `blocks/gantt-bars.component.ts` | Timeline-оценка, zoom day/week (day ≈36px) |
| order-inspector | `blocks/order-inspector.component.ts` | Панель заказа: мета + дерево товар→модуль→вид работ |

### Inspector UX (follow-up 2026-08-06 evening)

- Приоритет = важность в списке/фильтре (**не** длина полосок); подсказка в UI.
- Виды работ: wash/цвет как на Ганте; опц. `WorkType.accentHue` в форме вида работ.
- Раскрытие дерева: крупные «+ / −», клик по всей строке; «→» в карточку `/products/:id` / `/modules/:id`.
- Фото изделия/модуля в дереве и иконки в свёрнутом rail (если есть `storageUrl`).
- Клик по области Ганта закрывает правую панель; rail сворачивается («« список» / «☰ заказы»).
- Шире календарь: rail `w-56` / collapsed `w-14`, header компактнее.
- Правка заказа: роли **admin|manager**. Дни вида работ: confirm «для всех заказов» + rollback; UX-gate `production:write` или admin|manager.
- Ссылка «Открыть заказ» в inspector ведёт в `/orders?q=<номер>`; OrdersPage применяет `q` через тот же search state, что и поле поиска.

### Audit hotfix (2026-08-06 late) — см. `docs/audits/2026-08-06-production-gantt-verdict-response.md`

- Единый `filterOrdersForRail` для rail и multi-order bars; поиск пересчитывает Гант.
- На полосах: номер заказа, изделие, status pip, легенда WorkType, 7 hue buckets.
- Toolbar: Обновить / Сброс фильтров / Сегодня / Весь горизонт.
- Даты = **календарная** оценка (выходные не исключаются) — не факт цеха.

### Services / context

| Сервис | Методы |
|--------|--------|
| `ProductionCockpitContext` | selectedOrderId, search, activeOnly, zoom, priorityFilter, dateFrom/To, resetFilters |
| `ProductionReadFacade` | loadOrders, loadBarsForOrders, buildOrderEstimatePublic, getWorkerLabelsMap |
| `OrdersService` | list() / update() |

### State (signals)

| Сигнал | Назначение |
|--------|-----------|
| `ctx.selectedOrderId` | null = все активные |
| `ctx.activeOnly` | фильтр ACTIVE_COMMERCIAL_ORDER_STATUSES |
| `facade.state` | orders / bars / warnings / loading / error |

### Business locks (A–J)

- Duration = `WorkType.days` only; quantity → `×N` display (не умножает дни).
- `visualAnchor = plannedDate ?? date ?? today`.
- No `planned` Order status; no ProductionOrder/OrderTask.

### TZ reference

| TZ | Что сделано |
|----|------------|
| TZ-PRODUCTION-303 | Shell + rail + gantt + PAGE_KEYS + director read Roles |
| TZ-PRODUCTION-303.1 | Closeout: inspector `/orders?q=` deep-link + Gantt hotfix documentation |
| TZ-PRODUCTION-302 | WorkType.days |
| TZ-PRODUCTION-308…310 | backlog polish / safe edit / a11y (см. audit response) |
| TZ-PRODUCTION-304+ | stuck / check-in / auto-chain (plug-ins) |

### Known limitations

- Полная keyboard-семантика grid и BE-контракт `production:write` на WorkTypes — в 308–309.
- Нет drag-reschedule / assign writes / ProductionSchedule SoT.
- Browser smoke зависит от живого API/Mongo.

### Zoom

| Режим | Поведение |
|-------|-----------|
| День | ~36px/день, подписи дат на шкале |
| Неделя | ~12px/день, подписи недель — плотнее весь горизонт |

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
