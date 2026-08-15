# TZ-ORDERS-HUB-304: Готовность + склад + отгрузка stub

РОЛЬ АГЕНТА: Frontend UI Engineer

ЗАВИСИМОСТИ: TZ-ORDERS-HUB-302 DONE (expand shell). Можно после или параллельно 303, если conflict keys на `orders.page.ts` не пересекаются по времени — **предпочтительно после 303** (тот же Layer-3 файл).

LAYER: 3

PAGES: /orders ; /shipping
PAGE_DOCS: orders.page.md ; shipping.page.md

CONFLICT KEYS: frontend/src/app/pages/orders/orders.page.ts ; frontend/src/app/pages/orders/orders.page.spec.ts ; frontend/src/app/shared/services/pi-reservations.service.ts ; frontend/src/app/shared/services/pi-reservations.service.spec.ts ; docs/pages/orders.page.md ; docs/pages/shipping.page.md ; docs/pages/PAGE-TZ-INDEX.md ; docs/agent-checklists/TZ-ORDERS-HUB-304.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Проверено: HUB-301; `Reservation.orderId` = **string Order.number** (`order.service` пишет `orderId: order.number`);
`GET /api/reservations?orderId=`; FE reservations service **отсутствует**;
`/shipping` — stub page; `Order.reservationIds[]` — **не** SoT.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

### ШАГ 1. Блок «Готовность» (0 HTTP)

В expand: повтор `X из Y` + список линий с флагом ready / не ready.  
Link «Открыть заказ» → `/orders/:id` (смена ready **только** на detail).  
Нет toggle ready в панели.

### ШАГ 2. Thin read-only Reservations service

Создать `pi-reservations.service.ts`: `list(orderId?: string)` → `GET /api/reservations?orderId=`.  
Типы: `_id`, `orderId: string`, `status`, `qty`, … минимум для count.

### ШАГ 3. Блок «Склад» (lazy, 1 read)

При expand: `GET /api/reservations?orderId=<Order.number>` (**номер**, не `_id`).

UI: `active` count (`status==='active'`) / total.  
Empty: «Нет броней». Error: inline.  
**Запрещено** читать/показывать как SoT `Order.reservationIds[]`.

Optional link: `/storage-items` или inventory (read-only navigate).

### ШАГ 4. Блок «Отгрузка» (0 HTTP, stub)

Текст: «Отгрузка пока не ведётся в интерфейсе. Открыть раздел „Отгрузка“.»  
Link → `/shipping`.  
**Не** вызывать `GET /shipments`, не показывать counts.

### ШАГ 5. Budget + read-only

Суммарно с 303: supply(1)+reservations(1) ≤4.  
Нет create/edit/confirm/delete/release reservation из панели.

Gates:

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest --config jest.config.js --runInBand --testPathPattern='orders.page|pi-reservations'
```

НЕ ИЗМЕНЯТЬ: ActualCost; ProductionOrder; shipping FE реализация beyond stub link; BE.

═══════════════════════════════════════════════════════════════
ФИНАЛИЗАЦИЯ
═══════════════════════════════════════════════════════════════

CLAIM → archive `TZ-ORDERS-HUB-304.done.md` + Executor report (auto).
