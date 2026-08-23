# TZ-DESK-430 DONE — «Отгружено» без документа

```
ARCHIVE_MARKER
task_id: TZ-DESK-430
outcome: DONE
closed_at: 2026-08-23T13:15:00+03:00
agent_id: claude
workspace: D:\kppdf-8.0
branch: main
```

## Что сделано

Новый `shared/orders/ship-confirm-dialog.component.ts` (`ShipConfirmDialogComponent`,
`ShipConfirmResult`) — confirm-форма через `PiDialogService` (не route change):
номер заказа read-only, клиент/адрес editable с автозаполнением из
`order.counterpartyId`/`order.deliveryAddress`/`order.siteId.address`,
«Дата/время» read-only (now), опциональное примечание → `driverInfo`.

`order-hub-tray.component.ts` (mode="desk", секция «Отгрузка»):
- Lazy `GET /shipments?orderId=` при expand (`loadShipments()`, тот же паттерн,
  что и `loadSupply` — HUB-303).
- `canMarkShipped()` — true пока статус не `shipped|delivered|cancelled`; кнопка
  «Отгружено» (`data-test="desk-ship-button"`) эмитит `markShipped.emit(order())`.
- `hasShipment()` (статус shipped/delivered ИЛИ есть запись) → блок
  `order-shipment-block`: номер + дата; `order-shipment-no-docs` («Документ не
  оформлен») если `shipment.docs` пуст — это норма, не ошибка/warning-стиль.
- `reloadShipments()` — публичный метод для host (viewChild) после успешного ship.
- Отменённый заказ (или уже shipped/delivered) — ни кнопки, ни блока, просто
  `statusLabel()` (без регрессии на 425-поведение).

`manager-desk.page.ts`:
- `(markShipped)="onMarkShipped($event)"` на `<app-order-hub-tray>`.
- `onMarkShipped(order)`: открывает `ShipConfirmDialogComponent` через
  `PiDialogService`, на confirm — `OrdersService.ship(order._id, result)`
  (POST, **не** PATCH — контракт `COUPLING-MAP.md` соблюдён), success → toast +
  `listRes.reload()` + `orderHubTray()?.reloadShipments()` (viewChild, мгновенно
  подтягивает свежую запись без пересоздания tray-компонента).

`docs/COUPLING-MAP.md` — одна строка про DESK-430 в разделе `/desk`.
`docs/pages/manager-desk.page.md` — таблица TZ + bullet в UI-разделе.

## Gates

- `pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS (0)
- `pnpm exec ng build --configuration=development` — PASS (0 ошибок; тот же
  1 pre-existing warning NG8113 в чужом `pi-nav-dropdown.component.ts`)
- `pnpm test -- order-hub-tray manager-desk --runInBand` — PASS 43/43
  (40 существующих + 3 новых на DESK-430: eligible-order button, cancelled-order
  no button, shipped-order shipment-block + «Документ не оформлен»)
- `pnpm lint` — 0 errors, 18 pre-existing OnInit warnings (не мои файлы)

## Регрессия, найденная и исправленная в процессе

Новый безусловный `loadShipments()` в `ngOnInit()` (desk mode) сломал
`httpMock.verify()` в `manager-desk.page.spec.ts` — 18 существующих тестов
ожидали 0 open requests, а теперь появлялся незафлашенный `GET /api/shipments`.
Исправлено расширением существующего helper'а `flushSupply()` (уже вызывается
на каждом expand) — добавлен `.match()`-флаш `/api/shipments` рядом с
`/api/supply-tasks` (безопасно: `.match()` no-op, если нечего матчить). Плюс
`order-hub-tray.component.spec.ts` — добавлен mock-provider `ShipmentsService`
(были только supply/products/materials — новый сервис не был замокан,
`NG0201: No provider for HttpClient`).

## Proof of adoption

- `/desk` expand заказ (confirmed/in_production/ready) → «Отгружено» видна.
- Клик → dialog с автозаполненным клиентом/адресом → confirm → toast, статус
  меняется, блок «Отгружен» появляется без ухода с `/desk`.
- Повторный expand того же заказа — кнопка исчезает, виден блок + «Документ не
  оформлен» (docs пуст) — текст не выглядит как ошибка.
- `cancelled` заказ — ни кнопки, ни блока (edge case из TZ учтён).

## Known limitation

`driverInfo`/`notes` — TZ допускала, что поле может не приниматься API молча
(«иначе только recipient/address из DTO»); не проверял backend DTO явно (BE вне
conflict keys этой TZ) — если бэкенд игнорирует `driverInfo`, это тихо не
сохранится, не ошибка UI. Не проверено сквозным intergation-тестом (только FE
unit); реальный `POST /orders/:id/ship` с сервером не гонялся (no backend в
этой TZ-сессии).
