═══════════════════════════════════════════════════════════════
Z-001: Целостность склада — транзакции на inventory write-путях
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Backend Engineer (Domain Transactions) — локальный исполнитель
(Gemini / local). Cursor Mode A: только спека/review; код НЕ пишет.

ЗАВИСИМОСТИ: нет (self-contained). Серия: `tasks/_backlog/z-series/README.md` § Z-001.
BACKLOG SOURCE: `tasks/_backlog/z-series/backend/inventory/Z-001-inventory-write-transactions.md`
(этот файл = ACTIVATED copy для исполнения).

LAYER: 4 (backend) — data integrity / concurrency. Параллельно с frontend DOC-chain OK.
Не параллелить с TZ-MATERIALS-308 (общий `stock-movement.service.ts`).

CONFLICT KEYS:
backend/src/modules/shipment/shipment.service.ts;
backend/src/modules/shipment/shipment.module.ts;
backend/src/modules/purchase-order/purchase-order.service.ts;
backend/src/modules/purchase-order/purchase-order.module.ts;
backend/src/modules/order/order.service.ts;
backend/src/modules/stock-movement/stock-movement.service.ts;
backend/src/modules/reservation/reservation.service.ts;
docs/data-model.md;
ARCHITECTURE.md;
progress.md

═══════════════════════════════════════════════════════════════
АУДИТ КООРДИНАТ (Cursor read-only, 2026-08-02)
═══════════════════════════════════════════════════════════════

| Метод | Спека (старая) | Факт | Drift |
|-------|----------------|------|-------|
| `shipment.dispatch` | `:99` | `:99` | нет |
| `purchase-order.receive` | `:108` `receive(id, items)` | `:108` `receive(id: string)` — items из `doc.items` | сигнатура |
| `order.ship` | `:150` | `:150` | нет |
| `order.reserveStock` (ref) | `:123` + SessionRunner | `:118`–`:147` `sessionRunner.run` | линии чуть сдвинуты |
| `order.cancel` (ref) | `:187` | `:186`– | OK |
| `stock-movement.create` | `:31` withTransaction | `:22`–`:73`, `withTransaction` `:31` | нет |
| `stock-movement.remove` | `:201` | `:201`–`:207` soft-delete only | нет |
| dispatch status | «→ shipped» | `doc.status = 'in_transit'` (`:128`) | семантика статуса |
| nested sessions | предупреждение | **критично:** `create()` всегда `startSession`+own txn; `fulfill()` own txn | см. ШАГ 3 |

Reference pattern (использовать):
- `order.service.ts` `reserveStock` — `this.sessionRunner.run(async (session) => { ... })` + pass `session` в `reservationService.create(dto, session)` + `order.save({ session })`.
- `SessionRunner`: `backend/src/common/db/session-runner.ts` (`startTransaction` / commit / abort).
- `contract.service.ts` `activate` — тот же SessionRunner + `orderService.create(..., session)`.

ShipmentModule / PurchaseOrderModule сейчас **без** `SessionRunner` в providers — добавить (как OrderModule).

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Платформа умеет транзакции, но три write-пути пишут ≥2 коллекции БЕЗ общей сессии.

НАРУШЕНИЕ 1 — `shipment.service.ts:99` `dispatch(id)`:
  цикл `stockMovementService.create` (out) → `reservationService.fulfill` (best-effort try/catch) → `doc.status='in_transit'` + save.
  Падение на шаге k → частичное списание склада / fulfill без смены статуса отгрузки.

НАРУШЕНИЕ 2 — `purchase-order.service.ts:108` `receive(id)`:
  цикл `movementService.create` (in) по `doc.items` → `status='received'` + save.
  Падение → частичная приёмка без статуса received.

НАРУШЕНИЕ 3 — `order.service.ts:150` `ship(...)`:
  `shipmentService.create` затем `order.save` без session.
  Падение на save → orphan shipment; соседние `reserveStock`/`cancel` уже на SessionRunner.

НАРУШЕНИЕ 4 — `stock-movement.service.ts:201` `remove(id)`:
  soft-delete без reverse delta (create применял inventory в txn).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — External session на подчинённых сервисах (обязательно ДО обёрток):
  - `StockMovementService.create(dto, externalSession?: ClientSession)`:
    если session передана — выполнять write-graph на ней БЕЗ вложенного
    `startSession`/`withTransaction`; иначе сохранить текущий own-txn путь.
  - `ReservationService.fulfill(id, externalSession?: ClientSession)` — аналогично
    (сейчас всегда own session `:170+`).
  - Проверить `shipmentService.create` — если вызывается из `order.ship` внутри
    SessionRunner, добавить optional session и `save({ session })` / create with session.

ШАГ 2 — Обернуть три write-пути в `sessionRunner.run` (образец reserveStock):
  - `shipment.dispatch`: весь цикл movements + fulfill + status save в одной session;
    убрать silent best-effort catch на fulfill **внутри** txn (fail → abort), либо
    явно задокументировать best-effort вне AC rollback (предпочтение: fail-fast).
  - `purchase-order.receive`: цикл create + status save.
  - `order.ship`: shipment create + order.save в одной session.
  Modules: зарегистрировать SessionRunner в ShipmentModule и PurchaseOrderModule.

ШАГ 3 — Политика `stock-movement.remove` — **PO FIXED: вариант (a)**:
  удаление проведённого движения = компенсационный reverse-movement (противоположный
  delta) + soft-delete origin в одной транзакции; опц. `originId` только если
  уже есть поле / минимальный schema touch. Зафиксировать в ARCHITECTURE.md
  (секция inventory transaction contract) и кратко в `docs/data-model.md`
  (Concurrency & Transactions).

ШАГ 4 — Tests (backend Jest):
  - dispatch: mock throw на 2-м fulfill/create → 0 movements persisted, shipment
    status unchanged, storage qty unchanged.
  - receive: throw на 2-м item → 0 movements, status ≠ received.
  - ship: throw на order.save → shipment не сохранён.
  - remove (a): после remove reverse delta; суммарный складской эффект = 0.
  - Регресс happy-path существующих suite order/shipment/purchase-order/stock-movement.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- backend/src/modules/stock-movement/stock-movement.service.ts (+ optional session; remove policy a)
- backend/src/modules/reservation/reservation.service.ts (fulfill external session)
- backend/src/modules/shipment/shipment.service.ts + shipment.module.ts
- backend/src/modules/purchase-order/purchase-order.service.ts + purchase-order.module.ts
- backend/src/modules/order/order.service.ts (ship wrap; create session if needed)
- соответствующие `*.spec.ts` (новые rollback-тесты)
- docs/data-model.md (Concurrency & Transactions)
- ARCHITECTURE.md (короткая секция transaction-контракта)
- progress.md (запись Z-001 DONE при закрытии)

НЕ ИЗМЕНЯТЬ:
- frontend/**, desktop/**, mobile/**
- TZ-DOC-*, TZ-PRODUCTS-*, TZ-MATERIALS-*, TZ-WORKERS-*, TZ-WORKTYPES-*
- auth/guards, Z-002..Z-007 audit-only
- не push

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Три write-пути не оставляют грязных данных при throw mid-graph — rollback-тесты PASS.
2. Nested txn отсутствуют: при переданном externalSession подчинённые НЕ открывают own withTransaction.
3. `stock-movement.remove` реализует вариант (a) + тест reverse delta.
4. `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → exit 0.
5. `cd backend && pnpm test -- shipment purchase-order order stock-movement` → PASS; полный backend jest без регрессии.
6. `git diff --check` clean на своих файлах.
7. Archive: `tasks/_archive/2026-08/Z-001-inventory-write-transactions.done.md` + ARCHIVE_MARKER;
   lock `.mimocode/locks/Z-001-inventory-write-transactions.lock`; progress.md; STATUS sync.
8. Pre-existing frontend/ng blockers коллег — disclose в known_limitations, НЕ fix-force.

ОГРАНИЧЕНИЯ: не новые npm deps; Replica Set обязателен (уже есть); e2e опциональны.

═══════════════════════════════════════════════════════════════
ПРОМПТ ДЛЯ ЛОКАЛЬНОГО АГЕНТА (копировать)
═══════════════════════════════════════════════════════════════

Прочитай `docs/AI-AGENT-GUIDE.md`, `GEMINI.md`, `OrchestratorKit/AGENTS.md` и
`tasks/Z-001-inventory-write-transactions.md`. Выполни Z-001 (backend only).
Frontend не трогать. Push не делать. Checklist: `docs/agent-checklists/Z-001.md`.

SUCCESSOR после DONE: Z-002 defineEntity revival (backlog) — не в этом TZ.
