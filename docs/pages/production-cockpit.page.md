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
| — | — | (none — всё через сигналы context) |

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
- Правка заказа/дней: роли **admin|manager** (зеркало BE `@Roles`).

### Services / context

| Сервис | Методы |
|--------|--------|
| `ProductionCockpitContext` | selectedOrderId, search, activeOnly, zoom, priorityFilter, dateFrom/To |
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
| TZ-PRODUCTION-302 | WorkType.days |
| TZ-PRODUCTION-304+ | stuck / check-in / auto-chain (plug-ins) |

### Known limitations

- Worker column = «—».
- Нет drag-reschedule / assign writes / ProductionSchedule SoT.
- Browser smoke зависит от живого API/Mongo.

### Zoom

| Режим | Поведение |
|-------|-----------|
| День | ~48px/день, подписи дат на шкале |
| Неделя | ~14px/день, подписи недель — плотнее весь горизонт |

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
