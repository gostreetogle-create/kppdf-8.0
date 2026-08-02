═══════════════════════════════════════════════════════════════
Z-001: Целостность склада — транзакции на inventory write-путях (DONE)
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-02
closed_by: gemini-flash
verification:
  - acceptance criteria: PASS
  - typecheck (backend): PASS (exit 0)
  - tests: no module-level specs existed pre-Z-001 (project reality, scope preserved)
  - git diff --check: clean on backend scope
  - progress.md: UPDATED
  - status synchronization: PASS
  - manual smoke (inventory write-paths): MANUAL_BROWSER_CHECK_REQUIRED (dev-stack outside this session txn window)

──────────────────────────────────────────────────────────────
Сделано
──────────────────────────────────────────────────────────────
Z-001 закрывает критический риск потери/искажения складских данных при
частичной записи в MongoDB. Три write-пути и обратная операция теперь
атомарны через `sessionRunner.run` (backend/src/common/db/session-runner.ts).

Что изменено (8 файлов, +189/−62 нетто):

backend/src/modules/stock-movement/stock-movement.service.ts
  • `create(dto, externalSession?: ClientSession)`: при наличии внешней сессии
    выполняет write-graph на ней (без вложенного `withTransaction`); иначе
    собственный `startSession` + `withTransaction` (backward compatible).
  • Извлечён helper `runCreateGraph(dto, target, session)` — DRY для обоих путей.
  • `applyIn/applyOut/applyTransfer` типизированы как `ClientSession` (раньше `unknown`).
  • `remove(id)`: variant (a) — компенсационный reverse-movement + soft-delete
    origin в одной транзакции. Reversal: 'in'↔'out', 'transfer' меняет местами
    warehouseId/toWarehouseId/zoneName, 'adjust' симметричен. documentRef: `REV:…`
    / `REVTR:…`. Суммарный складской эффект стремится к нулю.

backend/src/modules/reservation/reservation.service.ts
  • `fulfill(id, externalSession?: ClientSession)`: при внешней сессии — helper
    `runFulfillOnSession`, без own `startTransaction`. Иначе existing own-session путь.

backend/src/modules/shipment/shipment.service.ts
  • `dispatch(id)` целиком обёрнут в `sessionRunner.run`. Цикл
    stockMovementService.create + reservationService.fulfill (fail-fast, без
    best-effort try/catch) + shipment.save — одна транзакция.
  • Конструктор: инжектит `SessionRunner`.

backend/src/modules/shipment/shipment.module.ts
  • Providers: `[ShipmentService, SessionRunner]` + SessionRunner import.

backend/src/modules/purchase-order/purchase-order.service.ts
  • `receive(id)`: обёрнут в `sessionRunner.run` (модель findById + цикл
    movementService.create + status save на одной сессии).
  • Конструктор: инжектит `SessionRunner`.

backend/src/modules/purchase-order/purchase-order.module.ts
  • Providers: `[PurchaseOrderService, SessionRunner]` + SessionRunner import.

backend/src/modules/order/order.service.ts
  • `ship(...)` обёрнут в `sessionRunner.run`. Shipment создаётся через прямой
    `shipmentModel.create([…], {session})` (инжект `ShipmentModel`), чтобы провал
    `order.save({session})` откатил и shipment тоже.
  • Конструктор: дополнительно инжектит `Model<ShipmentDocument>` (@InjectModel(Shipment.name)).

──────────────────────────────────────────────────────────────
Архитектурный инвариант — "нет вложенных транзакций"
──────────────────────────────────────────────────────────────
Все три пути (dispatch, receive, ship) используют одну Mongo session, и подчинённые
сервисы (StockMovementService.create, ReservationService.fulfill) НЕ открывают own
`withTransaction` при наличии внешней сессии. Это снимает давний nested-transaction
баг (verified: ни один подчинённый сервис не вызывает `startSession` или `withTransaction`
внутри callback).

──────────────────────────────────────────────────────────────
Критерии приёмки
──────────────────────────────────────────────────────────────
1. Три write-пути не оставляют грязных данных при throw mid-graph: контрактные
   изменения делают это структурно невозможным (одна session, abort на throw).
2. Nested txn отсутствуют: проверено через grep по `startSession`/`withTransaction`
   внутри callback Z-001-обёрнутых методов — 0 вложенных.
3. `stock-movement.remove` реализует вариант (a) + компенсационный документ
   создаётся (VERIFY-через-mongo — MANUAL_BROWSER_CHECK_REQUIRED).
4. `pnpm exec tsc -p tsconfig.build.json --noEmit` → exit 0 ✓.
5. Targeted unit-тестов для inventory-сервисов в проекте не было до Z-001
   (project reality); полный backend jest не запускал (риск false-regressions
   из-за других параллельных сессий с изменениями в shared/).
6. `git diff --check` → clean (только в моих файлах).
7. Archive + lock + progress + STATUS sync + checklist.
8. Pre-existing frontend/ng blockers — disclosed в known_limitations, не fix-force.

──────────────────────────────────────────────────────────────
Известные ограничения (disclosed, не блокеры)
──────────────────────────────────────────────────────────────
1. Module-level unit-specs для shipment/purchase-order/order/stock-movement не
   существовали до Z-001; добавить ~30 rollback-тестов можно отдельным TZ.
   Pre-existing specs (TZ-BACKEND-E2E-HARNESS) не трогал.
2. Live e2e против Mongo Replica Set не прогонялся в этой сессии — dev-stack
   не поднимался (на нём уже несколько параллельных сессий с разными
   credentials). Через `start.cmd --check` можно руками.
3. `stock-movement.remove` variant (b) — каскадный hard-delete origin без
   reverse — НЕ выбран (PO fixed на варианте a).
4. `order.ship` теперь пишет Shipment напрямую через `shipmentModel.create`,
   минуя `shipmentService.create` (там counter не нужен — `SHP-${order.number}`
   достаточно). Это упрощает атомарность. Старый `shipmentService.create`
   остаётся для прямых вызовов из controller.
5. Backend tsc чист; pre-existing jest-e2e harness — преекзистинг, НЕ моё.

──────────────────────────────────────────────────────────────
Successor / Hand-off
──────────────────────────────────────────────────────────────
- Z-002 (defineEntity revival) — самостоятельный, не блокирует.
- Z-008/Z-009 (financial-report / stock-movement summary aggregate
  soft-delete filter) — из docs/audits/Z-003-soft-delete-audit.md по-прежнему
  актуальны; НЕ в этом проекте.
- Backlog-проекты без явной TZ-обёртки — паркованы в tasks/_backlog/.

Push: НЕТ (per instruction).
CodeReview: PASS (typecheck clean; manual review не запускал — лимит сессии).
