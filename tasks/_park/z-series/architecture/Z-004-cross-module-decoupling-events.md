═══════════════════════════════════════════════════════════════
Z-004: Декаплинг модулей — domain events для order/inventory
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Backend Engineer (Architecture / Decoupling)

ЗАВИСИМОСТИ: Z-001 (транзакции) — желательно сначала, но не строго.
Серия: `tasks/_backlog/z-series/README.md` § Z-004.

LAYER: backend (architecture / cross-module)

CONFLICT KEYS:
backend/src/modules/production-order/production-order.service.ts;backend/src/modules/shipment/shipment.service.ts;backend/src/modules/order/order.service.ts;backend/src/modules/reservation/reservation.service.ts;backend/src/modules/stock-movement/stock-movement.service.ts;backend/src/common/contracts/*

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ (верифицировано по коду 2026-08-02)
═══════════════════════════════════════════════════════════════

1. Прямой import-цикл складывается в inventory/order-семействе.
   Fan-out по инжекциям:
   - `production-order.service.ts:25-38` инжектит 5 чужих моделей
     (ProductionOrder + Product + TechProcess + Bom + OrderTask) + Counter.
     Один create-вызolve лезет в 4 чужих aggregate на чтение/запись.
   - `shipment.service.ts:14-20` инжектит Counter + StockMovement + Reservation.
   - `order.service.ts:16-23` инжектит Counter + Reservation + Shipment + SessionRunner.

2. Намечается кольцо: order → shipment → reservation + stockMovement,
   и order → reservation напрямую. Сегодня это «работает», потому что
   все сервисы в одном процессе и нет асинхронной семантики. Но:
   - любое изменение schema Bom/TechProcess/OrderTask ломает production-order;
   - добавить нового «подписчика» на событие «order shipped» (например,
     financial-report, notification, audit-detail) можно только впихнув
     новую инжекцию в order.service → растущая «god-service».

3. Нет event-bus. NestJS имеет `@nestjs/event-emitter` (легковесный,
   in-process) — он НЕ подключён. Audit-записи делаются синхронно через
   AuditInterceptor (нормально), но бизнес-связи (reservation.fulfill после
   shipment.dispatch) зашиты в код напрямую.

═══════════════════════════════════════════════════════════════
ПОЧЕМУ ЭТО ВАЖНО ДЛЯ ПЛАТФОРМЫ
═══════════════════════════════════════════════════════════════

ERP растёт. На горизонте — новые подписчики на «заказ отгружен»,
«склад списан», «резерв исполнен»: финансовые проводки, уведомления,
аналитика,新一轮 features. Если каждая новая фича будет добавлять
инжекцию в order/shipment/stock-movement, ядро превратится в
spaghetti с ~10 зависимостями у каждого сервиса. Domain events —
стандартный паттерн для разрыва таких связей; он же открывает дорогу
к outbox-pattern, если позже появится need в reliable cross-service
sync (без rewrite).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Решение о паттерне (PO/architect). Рекомендация:
   `@nestjs/event-emitter` (in-process, синхронный по умолчанию, можно
   async). НЕ Kafka/RabbitMQ (преждевременно, операционный overhead).
   Зафиксировать в ARCHITECTURE.md § events.

ШАГ 2 — Ввести contract событий в `common/contracts/events/`:
   - `OrderShippedEvent { orderId; shipmentId; items; timestamp }`
   - `StockMovementCreatedEvent { movementId; itemId; delta; reason }`
   - `ReservationFulfilledEvent { reservationId; orderId }`
   - `ProductionOrderCreatedEvent { productionOrderId; productId; bomId }`
   Каждое событие — typed interface + версию поля. Имена в kebab-case
   строки: `order.shipped`, `stock.movement.created`.

ШАГ 3 — Эмиттеры (source-modules публикуют вместо прямого вызова):
   - order.service.ship → emit `order.shipped` (после save в транзакции —
     см. Z-001; emit должен быть AFTER commit).
   - stock-movement.service.create → emit `stock.movement.created`.
   Эмиттер НЕ знает, кто слушает. Убирается fan-out в source.

ШАГ 4 — Слушатели (sink-modules подписываются):
   - shipment/reservation перестают вызываться напрямую из order.ship
     (если функционально допустимо). Подписываются на `order.shipped`.
   - ВАЖНО: emit AFTER commit (см. Z-001). Иначе слушатель обработает
     событие для незакоммиченной транзакции.

ШАГ 5 — ВАЖНО: НЕ ломать текущую синхронную семантику. Если сегодня
   order.ship ВЕРНУЩ shipment в response — перейти на события можно
   только если frontend готов к eventual-consistency (или emit делать
   синхронно, await). Решение PO: «sync emit (текущее поведение)» vs
   «async emit (response раньше, чем side-effects)». Рекомендация:
   начать с sync emit — это даёт декаплинг без изменения UX.

ШАГ 6 — Outbox (опционально, НА будущее — не в этом TZ): таблица
   outbox_events для reliable delivery. НЕ реализовывать сейчас, но
   оставить hook в архитектуре (emit goes through repository).

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. order.service не инжектит больше shipment/reservation напрямую для
   ПОБОЧНЫХ эффектов (только core orchestration остаётся).
2. Хотя бы одна cross-module связь переведена на event (order.shipped →
   shipment/reservation subscription ИЛИ stock.movement.created →
   audit/inventory recalculation).
3. Event contract документирован в ARCHITECTURE.md.
4. Backend typecheck + Jest PASS. Добавлен spec: emit + listener
   round-trip для одного события.
5. Поведение пользователя не изменилось (zero UX diff) — sync emit.
6. Fan-out production-order снижен (хотя бы один зависимый model
   переведён на событийное чтение, если допустимо).

ОГРАНИЧЕНИЯ: НЕ вводить Kafka/RabbitMQ/Redis Streams (REJECTED — преждевременно).
НЕ ломать transactional-boundary — emit всегда AFTER commit. НЕ делать
big-bang: одна-две связи на event как proof, остальные — отдельными TZ.
Сложные orchestration (production-order.create с проверкой Bom/TechProcess)
оставить synchronous — там нужна immediate-validation, не event.
