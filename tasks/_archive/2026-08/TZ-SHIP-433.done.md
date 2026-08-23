# TZ-SHIP-433 — реестр отгрузок + отмена ошибочной отгрузки

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-23
closed_by: freebuff-executor

## DoD

| Критерий | Статус |
|----------|--------|
| AC 1: Desk «Отгружено» → `/shipping` показывает запись | PASS (реестр живой, tray блок 430) |
| AC 2: «Отменить отгрузку» на scheduled → order снова `ready`, tray не «Отгружен» | PASS |
| AC 3: после dispatch → cancel disabled + 400 RU | PASS |
| AC 4: BE+FE tests; tsc; lint | PASS |
| Proof of adoption | ✅ consumer `/shipping` + tray `/desk`; тесты BE +5 / FE +6; docs COUPLING-MAP + shipping.page.md |

## Что сделано

### BE — `POST /shipments/:id/cancel-shipment`

- `ShipmentService.cancelShipment(id, org)` в одной транзакции (SessionRunner):
  - guards: статус `draft`/`scheduled`, нет `dispatchedAt`; `in_transit`/`delivered`/после
    dispatch → 400 RU «Отгрузка уже отправлена со склада — отмена через склад/админа» (phase 2);
  - `shipment.status = cancelled` (не hard delete; `order.shipmentIds` сохраняется как история);
  - если заказ был `shipped` и это **единственная активная** отгрузка → откат whole-order ship:
    `order.status → ready`, линии `boardLane → to_ship`, `item.status → ready` (COUPLING-MAP §2b);
  - partial/другие активные отгрузки → заказ не трогаем.
- `Order` модель зарегистрирована в `ShipmentModule` (без цикла модулей).
- Controller: `@Post(':id/cancel-shipment')`, роли `admin`/`manager`, `AuditAction`.

### FE — `/shipping`

- Кнопка **«Отменить отгрузку»** в строке реестра (`draft`/`scheduled`),
  `data-test="shipping-cancel-{id}"`, `PiDialogService` confirm («Заказ вернётся в „Готов“»),
  после успеха reload + toast + рефреш списка заказов.

### FE — tray `/desk`

- Блок «Отгружен» показывает только **активную** (не `cancelled`) отгрузку;
  кнопка **«Отменить отгрузку»** при `draft`/`scheduled` без `dispatchedAt`
  (`data-test="desk-cancel-shipment-button"`), output → manager-desk → тот же API,
  остаёмся на `/desk` (reload tray + список заказов).

### FE — сервис

- `ShipmentsService.cancelShipment(id)` → `POST /shipments/:id/cancel-shipment`.

### Docs

- `docs/COUPLING-MAP.md`: undo-принцип в §2, контракт cancel-shipment, строка `Shipment.status` в §3,
  desk-строка §4.
- `docs/pages/shipping.page.md`: переписан — **реестр**, не stub.
- `docs/PO-CANON.md`: строка undo уже была (проверено, не дублировал).

## Proof of adoption

- **Consumer (production):** `/shipping` (реестр, кнопка отмены) + `/desk` tray
  (блок «Отгружен», кнопка отмены, активная отгрузка).
- **Тесты:** BE `shipment.service.spec` +5 (rollback whole-order, др. активная → без rollback,
  partial → без rollback, dispatched → 400, cancelled → 400); FE `shipping.page.spec` +2,
  `order-hub-tray.component.spec` +4, `manager-desk.page.spec` +1.
- **Docs:** COUPLING-MAP + shipping.page.md обновлены.
- **Migration note:** вручную нельзя переводить `Order.status` из `shipped` обратно — только
  `POST /shipments/:id/cancel-shipment` (иначе рассинхрон с линиями boardLane и реестром).
- **Legacy leftover:** откат после dispatch (stock movement reversal) — phase 2, отдельный TZ;
  отмена supply-задач/резервов — out of scope (таблица undo в TZ).

## Gates

```text
backend  tsc --noEmit: 0
backend  jest shipment: 8/8 PASS
backend  eslint (мои файлы): 0
frontend tsc --noEmit: 0
frontend jest shipping|tray|desk: 55/55 PASS
frontend eslint: 0 errors (18 pre-existing warnings)
git diff --check: PASS
pre-push hook: PASS
```

Замечание: полный прогон FE (1919/1920) и BE (966/968) имеет 1+2 падения в чужих модулях
(materials-373 WR-507, catalog-314, users-admin) — pre-existing WIP параллельных агентов,
не связаны с этой TZ (мои спек-файлы не трогают эти модули).

## SHA

- Код: `a1dae406` (коммит TZ-SHIP-433, запушен в origin/main)
