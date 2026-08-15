═══════════════════════════════════════════════════════════════
TZ-SWEEP-401: Канбан — write-path заказа и хвосты
═══════════════════════════════════════════════════════════════

> Перед работой: `docs/TZ-AUTHORING.md` (покупатель = Counterparty ≠ Organization;
> unique на `Order.number`). Аудит: `docs/audits/2026-08-16-kanban-order-logic-sweep.md`.
> Канон страницы: `docs/pages/dashboard.page.md`.

РОЛЬ АГЕНТА: Full-stack (Nest order FSM + Angular Канбан/навигация)

ЗАВИСИМОСТИ: TZ-DASHBOARD-400 (доска уже в дереве). Не ждать PHOTO-343 / MODULES-341.

LAYER: 3  ← dashboard.page.ts + order.service.ts + order-form + app-layout; строго 1 агент

PAGES: /dashboard ; / ; /orders
PAGE_DOCS: dashboard.page.md ; orders.page.md

CONFLICT KEYS: backend/src/modules/order/order.service.ts; backend/src/modules/order/order.service.spec.ts; backend/src/modules/order/order.controller.ts; frontend/src/app/pages/dashboard/dashboard.page.ts; frontend/src/app/pages/dashboard/dashboard.page.spec.ts; frontend/src/app/pages/orders/orders.service.ts; frontend/src/app/pages/orders/orders.service.spec.ts; frontend/src/app/pages/orders/order-form-dialog.component.ts; frontend/src/app/pages/commercial/deals-group-chips.ts; frontend/src/app/layout/app-layout.component.ts; frontend/src/app/pages/login/login.page.ts; docs/pages/dashboard.page.md; docs/pages/PAGE-TZ-INDEX.md

Проверено: order.schema.ts (Order.status + OrderItem.status + readyForWork);
order.service.ts L243–283 setLineReady/setItemStatus, L393–441 update+freeze,
L459–567 reserveStock/ship/cancel; dashboard.page.ts L184–250 drop + L301–310
readinessLabel; orders.service.ts L120–176 silentPatch, нет ship/cancel;
app.routes.ts L90–97 `/` → dashboard; app-layout L330 логотип `/`, NAV без Комбайна,
L180 складской «Дашборд»; deals-group-chips.ts КП/Договоры/Заказы;
silent-http.ts — Observable никогда не error; HUB-аудит формула readyForWork.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. Канбан `dropOrder` шлёт `OrdersService.update({status})` = `PATCH /orders/:id`.
   `POST /ship` создаёт `Shipment` и пишет `shipmentIds`; PATCH это обходит.
   `POST /cancel` снимает резервы; PATCH это обходит.
   Freeze (`PLAN_EDITABLE_FROZEN` = in_production/ready, `PLAN_UPDATE_KEYS` без
   `status`) даёт 400 на дроп в «Готовы»/«Отгружены» с формулировкой про состав.

2. `readyForWork` (ORDERS-304, гейт «можно начинать») и `OrderItem.status`
   (ход изделия) — разные поля. Канбан OR-ит их в «X из Y». `setItemStatus`
   без ограничений; `ship()` не трогает item.status. Старые линии без поля
   не падают (FE `|| 'pending'`), mongoose default на чтение не подставляет.

3. `/` уже Комбайн. Пункта в меню нет. Склад занял слово «Дашборд».
   Комментарий login.page.ts всё ещё пишет `/materials`.

4. `silentPatch` → `next` всегда, `error` в drop мёртв. Карточка возвращается
   только через `listRes.reload()`, без тоста. Эталон: TZ-PRODUCTION-333.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Бэкенд — один write-path статуса

  1.1 В `update()`: если `dto.status` задан — `assertOrderStatusTransition(from, to)`
      **до** freeze. Запрет (400, RU):
      - `to ∈ {shipped, delivered, cancelled}` →
        «Отгрузка — через действие «Отгрузить»; отмена — «Отменить заказ».»
      - `from ∈ HARD_FROZEN` (кроме no-op того же статуса).
      Разрешённый граф PATCH: draft ↔ confirmed ↔ in_production ↔ ready
      (шаг назад на одну ступень ок; прыжок draft→ready ок; draft→in_production ок).
      Не включать delivered в Канбан-граф.

  1.2 Freeze состава **не** блокирует payload, где единственное изменяемое
      поле — `status` (после прохождения 1.1). Состав/notes по-прежнему
      режутся в in_production/ready.

  1.3 `ship()`: после успеха все `items[].status = 'shipped'`.
      `setItemStatus('shipped')` — 400, пока `order.status` не shipped/delivered.
      Отсутствующий item.status читать как `'pending'`. Не писать `readyForWork`.
      Не авто-менять `Order.status` из статусов изделий.

  1.4 Тесты в `order.service.spec.ts`: PATCH draft→shipped 400; PATCH
      in_production→ready 200; PATCH ready + notes 400; ship() проставляет
      item.status; setItemStatus shipped на draft 400; setItemStatus ready
      на линии без поля — пишет 'ready', не бросает.

ШАГ 2: FE сервис + Канбан drop

  2.1 `OrdersService.ship(id, body?)` → `POST /orders/:id/ship`.
      `OrdersService.cancel(id)` → `POST /orders/:id/cancel`.
      Оба через silentPost. Поправить комментарий «business actions NOT exposed».

  2.2 Канбан — колонки `draft|confirmed|in_production|ready`:
      optimistic snapshot списка (копия `data()` / статусов до дропа);
      `update({status})`; если `!res.ok` — вернуть snapshot + toast
      `extractErrorMessage` (PiToastService). Успех: не обязательно полный
      reload, но список должен совпасть с ответом PATCH (подставить data
      или reload). `subscribe({error})` не использовать — silent не error-ит.
      Эталон отката: production-cockpit TZ-PRODUCTION-333.

  2.3 Колонка `shipped`: **не** PATCH. `cdkDropListEnterPredicate` можно
      оставить, но в drop: confirm RU «Создать отгрузку по заказу №{number}?
      Появится документ отгрузки.» OK → `ship(id)` (тело `{}` допустимо);
      Cancel / `!res.ok` → snapshot + toast. Не открывать складской пикер
      (warehouseId optional на бэке).

  2.4 `changeItemStatus`: смотреть `res.ok`; ошибка → reload + toast;
      селект не оставлять в лживом значении.

  2.5 `readinessLabel`: считать `status ∈ {ready, shipped}`; нет `status` →
      `'pending'` (не OR с readyForWork). `/orders` HUB-304 не трогать.

ШАГ 3: Форма заказа — не второй ship

  В `order-form-dialog` редактируемый enum статуса =
  `draft | confirmed | in_production | ready`. shipped/delivered/cancelled
  только показать disabled/текстом, если уже такие. Save не шлёт запретный
  status.

ШАГ 4: Навигация и копия

  4.1 `DEALS_TOC_CHIPS`: первым chip `{ id: 'dashboard', label: 'Комбайн',
      route: '/dashboard', pageKey: 'orders' }`. Не «Дашборд».
  4.2 `app-layout` deals `activeAliases`: добавить `/dashboard`.
      `isDenseWorkspaceUrl`: добавить `/dashboard`.
  4.3 Крошки Комбайна: `Сделки → /orders` + «Комбайн» (не «Главная / Дашборд»).
  4.4 `login.page.ts`: комментарий `/` → `/dashboard`, не `/materials`.

ШАГ 5: Тесты и docs

  - Новый `dashboard.page.spec.ts`: drop в ready → PATCH `{status:'ready'}`;
    drop в shipped → POST `/orders/:id/ship`, не PATCH; `ok:false` на PATCH
    → карточка в исходной колонке (через публичный/тестовый API компонента
    или DOM после flush).
  - `orders.service.spec.ts`: ship/cancel URL.
  - deals-chips spec, если уже есть; иначе проверка массива в dashboard/layout spec.
  - `docs/pages/dashboard.page.md` + строка PAGE-TZ-INDEX — уже заготовлены
    архитектором; поправь, если API/лейблы разъехались.
  - Одна фраза в `orders.page.md`: «X из Y» списка = readyForWork; Комбайн =
    item.status. Поля не сливать.

═══════════════════════════════════════════════════════════════
ИЗМЕНЯТЬ / НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ: файлы из CONFLICT KEYS + необходимые spec рядом
(order-form-dialog.component.spec.ts, deals-group-chips если spec есть,
app-layout.component.spec.ts только если падает alias).

НЕ ИЗМЕНЯТЬ:
- Gantt / production-cockpit write-path
- `/shipping` stub, reservation UX, warehouse picker
- `setLineReady` / колонку readyForWork на `/orders` (кроме docs-фразы)
- слияние `readyForWork` ↔ `item.status`; авто-промоушен Order.status из линий
- скрипт wipe/миграции Mongo (fallback в коде достаточен)
- чужой WIP (modules photo, paspots dumps)
- `_templates/*`, OrchestratorKit

known_limitation:
- `POST /reserve-stock` по-прежнему требует warehouseId — на Канбан не вешать.
- Частичная отгрузка линий не в этом TZ.
- Native `<select>` изделия на карточке → overflow-select successor, не здесь.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] PATCH `{status:'shipped'|'cancelled'|'delivered'}` → 400 RU; заказ и
      shipmentIds/reservationIds не меняются.
- [ ] PATCH `{status:'ready'}` из `in_production` → 200; состав не требуется.
- [ ] `POST /orders/:id/ship` создаёт Shipment, `order.status=shipped`,
      все items.status=shipped.
- [ ] Канбан: дроп Черновик→В производстве → PATCH; дроп в Отгружены →
      confirm + POST ship; отказ/ошибка → карточка на месте + toast RU.
- [ ] Старый заказ без `items[].status`: доска не падает; селект «Ожидает»;
      смена статуса пишет поле.
- [ ] «X из Y» на карточке не плюсует readyForWork.
- [ ] Сделки TOC: chip «Комбайн» → `/dashboard`. Складской «Дашборд» без изменений.
- [ ] Форма заказа не даёт выбрать Отгружен/Отменён как Save-status.
- [ ] Verification:

```
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
cd backend && pnpm test -- order.service.spec
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest --testPathPattern "dashboard.page|orders.service.spec|order-form-dialog" --no-coverage
```

Финализация: root `GEMINI.md` — checklist → gates → `tasks/_archive/2026-08/TZ-SWEEP-401.done.md`
+ lock + Executor report (auto). Archive только после Cursor/PO PASS.
Review: да (write-path склада/отгрузки).
