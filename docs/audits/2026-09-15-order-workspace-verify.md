# AUDIT 2026-09-15 — VERIFY+FIX: /orders/:id Order Workspace

TZ: `tasks/_archive/2026-09/TZ-VERIFY-FIX-2026-09-15-ORDER-WORKSPACE.done.md`
Scope: `order-workspace/**`, `order-detail/**`, `home/**` CTA, order-hub reuse, `pi-orders.service` wrappers.
Executor: claude (unattended). HEAD at close: `ad9efc5c` + this pass's fix/docs commits.

## Предыстория (что проверяем)

`WAVE-NX-ORDER-WORKSPACE` (7 TZ, FACADE-SHELL → HEADER → COMPOSITION →
EXECUTION → LOGISTICS → DOCS-CHIPS) собрала `/orders/:id` в полноценный
editable workspace. Эта проверка — независимый VERIFY+FIX проход: прогнать
все gate-команды, живой smoke по API, честно закрыть найденные баги в
scope, задокументировать вердикт.

## Итоговая таблица

| # | Область | Команда | Результат | Evidence |
|---|---------|---------|-----------|----------|
| 1 | SHA/archive preflight | ancestry + archive-existence для 7 TZ волны | **PASS** | все 7 commit SHA (`d07a2112`,`11f10ce6`,`1e6524bb`,`1d76170b`,`0af6d942`,`d8fa10d6`,`6f0eeb79`) на branch, архивы `tasks/_archive/2026-09/*.done.md` существуют |
| 2 | data-access tests | `nx run data-access:test` | **PASS** | 25/25 suites, 136/136 tests (было 134 — +2 новых, см. фиксы) |
| 3 | features tests | `nx run features:test` | **PASS** | 52/52 suites, 455/455 tests (включает order-workspace, order-hub-tray) |
| 4 | kppdf-web tests (order-detail/orders-list/home.page — TZ scope) | `nx run kppdf-web:test` | **PASS** (scope) | `order-detail.page.spec.ts`, `orders-list.page.spec.ts`, `home.page.spec.ts` — все PASS индивидуально внутри полного прогона |
| 5 | kppdf-web tests (весь app) | тот же прогон | **FAIL, вне scope** | 79/80 suites, 564/573 tests. Один провал: `app-shell.component.spec.ts` (2 теста, ожидание chip-count 8/7, факт 9/8). См. «Вне scope» ниже — не наш баг, не трогали |
| 6 | `nx build kppdf-web` | `nx build kppdf-web` | **PASS** | зелёная сборка (5/5 задач, включая зависимости data-access/features/util-http) |
| 7 | backend tsc | `tsc -p tsconfig.build.json --noEmit` | **PASS** | 0 ошибок |
| 8 | backend tests ("order") | `jest --testPathPattern=order` | **PASS** | 4/4 suites (`order.service`, `order.controller`, `kit-reserve.service`, `update-order.dto`), 132/132 tests |
| 9 | `pnpm architecture:check` | project-wide import-boundary baseline | **PASS** | 1571 файлов, baseline 17, resolved since baseline: 2 (улучшение, не регрессия) |
| 10 | lint data-access | `nx run data-access:lint` | **PASS** | 0 errors, 1 pre-existing warning в несвязанном файле (`page-acl.ts`) |
| 11 | lint kppdf-web | `nx run kppdf-web:lint` | **FAIL, вне scope** | 83 errors — все от одного `@nx/enforce-module-boundaries` срабатывания на несвязанном файле `pages/registries/dialogs/module-form-dialog.component.spec.ts` (commit `6495bc54`, до этой сессии). См. «Вне scope» |
| 12 | lint backend | `pnpm lint` | **PASS** | 0 errors, 202 pre-existing warnings (`no-explicit-any`, не по scope-файлам) |
| 13 | Live smoke (API-level) | `scripts/tz-verify-order-workspace-smoke.mjs` против `http://127.0.0.1:3000` (Mongo + backend + frontend-nx подняты локально) | **PASS** | 17 PASS · 0 FAIL · 0 WARN (см. лог ниже) |
| 14 | Live smoke (browser/DOM-level) | — | **WARN, среда** | В окружении нет Playwright/браузерной автоматизации, `WebFetch` не резолвит `localhost`. Визуальную/DOM-проверку `/orders/:id` не выполняли — честно помечено WARN, не выдумана как PASS |

## Live smoke — лог (17/17)

```
ORDER-WORKSPACE-SMOKE · stand http://127.0.0.1:3000 · user=admin

PASS  auth: login — access token получен
PASS  fixtures: counterparty есть/создан
PASS  fixtures: site есть/создан
PASS  fixtures: два изделия созданы — status=201/201
PASS  order-detail: заказ создан (draft, 1 позиция) — status=201
PASS  order-detail: GET /orders/:id (facade.load()) — status=200
PASS  composition: addLine PATCH preserves line 0 (name/unit/qty untouched)
PASS  composition: updateQty PATCH — line 1 qty updated, line 0 untouched
PASS  composition: PATCH items/0/ready (setLineReady()) — readyForWork=true
PASS  execution: GET supply-requests?orderId= (loadSupply()) — count=0
PASS  header: PATCH status confirmed (confirmOrder()) — status=confirmed
PASS  logistics: GET reservations?orderId= (loadReservations()) — count=0
PASS  logistics: GET shipments before ship (loadShipments()) — count=0
PASS  logistics: POST /orders/:id/ship (openShipConfirm()) — status=shipped, shipmentId present
PASS  logistics: shipment appears after ship (hasShipment()/shipmentNumber())
PASS  header: second order created for cancel test
PASS  header: POST /orders/:id/cancel (new PiOrdersService.cancel()) — status=cancelled

RESULT: 17 PASS · 0 FAIL · 0 WARN
```

Покрывает весь write-path order-workspace: composition (addLine с сохранением
полей соседних строк, updateQty, setLineReady через выделенный endpoint),
header (confirm PATCH, cancel POST), execution (supply-requests read),
logistics (reservations read, shipments read до/после, ship POST).
Cleanup: 2 продукта вернули `409` при удалении (заблокированы FK-ссылкой
soft-deleted заказа на их `productId`) — ожидаемо, не орфан-риск (SKU
уникальны на каждый прогон), не требует фикса.

## Найденные и исправленные баги (в scope)

1. **`PiOrdersService.ship()` — неверный тип ответа.** Задекларирован как
   `Observable<SilentResult<Order>>`, реально backend возвращает
   `{ order, shipmentId }` (см. `OrderService.ship()` в backend). Проверено
   `grep`: все 3 текущих вызывающих (`order-hub.facade.ts`,
   `order-workspace.facade.ts`, `shipment-create-dialog.component.ts`)
   читают только `.ok`/`.error`, `.data` как `Order` нигде не используется —
   активного runtime-бага не было, но это была ловушка для будущего вызова.
   **Fix:** добавлен тип `ShipResult` в `order.types.ts`, поправлена
   сигнатура `ship()` в `pi-orders.service.ts`, обновлён mock в
   `order-detail.page.spec.ts` на реальную форму ответа.
2. **Отсутствовало HTTP-покрытие `cancel()`/`setLineReady()`** в
   `pi-orders.service.spec.ts` (оба метода добавлены в этой волне, тестов не
   было). **Fix:** добавлены 2 теста по существующему паттерну файла.
3. (Smoke-скрипт, не продукт) Первая версия smoke неверно проверяла
   `ship()`-ответ (`status` вместо `order.status`) и пыталась
   создавать/софт-удалять одноразового контрагента с фиксированным ИНН —
   упиралась в то, что soft-delete не освобождает unique index на `inn`.
   **Fix:** скрипт переписан на reuse-first паттерн (GET → POST только если
   пусто), как уже сделано в `scripts/smoke/supply-smoke.mjs`; исправлена
   плюрализация маршрута очистки (`counterparty` → `/api/counterparties`,
   не `/api/counterpartys`).

## Вне scope (найдено, НЕ трогали)

Оба ниже — предсуществующие проблемы, не вызванные кодом этой волны или
этого прохода, и не входят в conflict-keys TZ (`order-workspace/**`,
`order-detail/**`, `home/**` CTA, order-hub reuse, `pi-orders.service`).
Правка требовала бы менять файлы другой волны/области — сознательно не
делаем, чтобы не плодить scope creep и не конфликтовать с параллельным
агентом.

- **`app-shell.component.spec.ts`** (2 упавших теста, hardcoded chip-count
  8/7 против факта 9/8). Причина — commit `33e06c08`
  (`feat(nx-home): add authenticated home route shell`, отдельная волна
  `WAVE-NX-HOME`, её checklist `docs/agent-checklists/WAVE-NX-HOME.md` пока
  untracked/в процессе) добавил новую nav-категорию `home` в
  `nav-categories.ts`, не обновив ожидаемые счётчики в
  `app-shell.component.spec.ts`. Это регрессия волны `WAVE-NX-HOME`, не
  order-workspace — оставляем на её агента/трекер.
- **`kppdf-web:lint` — 83 errors.** Все — одно и то же срабатывание
  `@nx/enforce-module-boundaries` («Static imports of lazy-loaded
  libraries are forbidden»), triggered тем, что
  `pages/registries/dialogs/module-form-dialog.component.spec.ts`
  (commit `6495bc54`, задолго до этой сессии, registries-область)
  лениво грузит `features`, из-за чего правило помечает ЛЮБОЙ статический
  импорт `features` по всему app как ошибку — включая
  `order-detail.page.ts`/`orders-list.page.ts`, хотя их импорты не менялись
  ни в этой волне, ни в этом проходе. Предсуществующий project-wide lint
  баг, требует правки в registries-области — не наш scope.

## Вердикт

**VERIFY PASS** (с двумя честными WARN/вне-scope пометками, не блокирующими
order-workspace: см. таблицу пп.5/11/14). Весь functional write-path
`/orders/:id` подтверждён дважды — unit/integration-тестами (гейты 2–3,
6–9) и живым API-smoke против реального backend+MongoDB (п.13, 17/17).
Единственный непроверенный слой — визуальный/DOM (браузер), честно
помечен WARN (среда без Playwright), не выдан за PASS.

**Можно смотреть глазами `/orders/:id` — да.** На что смотреть: секции
(шапка/состав/производство/логистика/документы), чипы workflow-статуса,
кнопки add-line/qty/ready (обычный PATCH vs выделенный ready-endpoint не
должны путаться визуально), диалог kit-reserve (резерв/дефицит), честность
кнопки «Отгрузить» (недоступна вне подтверждённого статуса), список
резервов/отгрузок.

Локальный стенд (Mongo + backend + frontend-nx через `node start.mjs --nx
--no-browser`) оставлен поднятым для этой визуальной проверки — не
останавливал. **Deploy не выполнялся** (вне scope этой TZ).
