# TZ-ORDERS-HUB-301: Контракт хаба Заказов (audit + spec)

РОЛЬ АГЕНТА: Docs / Spec Author (Mode A или docs-only executor)

ЗАВИСИМОСТИ: Нет (фундамент волны HUB)

LAYER: 2

PAGES: /orders ; /orders/:id ; /production ; /supply ; /shipping ; /proposals ; /doc-constructor/templates
PAGE_DOCS: orders.page.md ; production-cockpit.page.md

CONFLICT KEYS: docs/audits/2026-08-15-order-lifecycle-hub.md ; tasks/TZ-ORDERS-HUB-301-order-hub-contract.md ; docs/pages/orders.page.md ; docs/pages/PAGE-TZ-INDEX.md ; docs/agent-checklists/TZ-ORDERS-HUB-301.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Проверено: `docs/PO-CANON.md`; `docs/audits/2026-08-08-sales-to-shop-flow-canon.md`;
`docs/audits/2026-08-15-order-lifecycle-hub.md`; `backend/src/modules/order/order.schema.ts`;
`actual-cost.schema.ts` (ProductionOrder); `reservation.schema.ts` + `order.service.ts`
(`orderId: order.number`); `supply-task.controller.ts`; `order-detail.page.ts`
(bug `/commercial/proposals`); `orders.page.ts` (нет expand; есть total);
production cockpit (нет `orderId` query).

1. PO хочет единую таблицу «главного звена» + expand-карточку по доменам (как продукция).
2. Звено = **Order**. Размещение = эволюция `/orders`, не новый `/hub`.
3. Этот TZ **не пишет product-код** — фиксирует контракт для HUB-302…305.

Loose wording «единая сущность / hub page» → код-канон: **sales `Order` + `/orders` expand**.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

### ШАГ 1. Зафиксировать audit

Файл `docs/audits/2026-08-15-order-lifecycle-hub.md` должен существовать и совпадать с § ниже (FK, Variant A, формула, gaps).

### ШАГ 2. Контракт списка (колонки)

Целевые колонки `/orders` (HUB-302 реализует):

`Номер · Дата · Заказчик · Объект · Статус · Приоритет · Позиций · КП · Готовность`

- **Удалить** колонку «Сумма» (`total`) из таблицы и page.md.
- **Готовность** = `X из Y` где `Y = items.length`, `X = count(readyForWork===true)`; Y=0 → «—».
- **КП**: номер связанного quotation / «Прямой» / «Заглушка» / «—».
- **Объект**: имя `siteId` (D20).
- Дата отгрузки — **не** колонка списка v1.

### ШАГ 3. Контракт expand (Variant A)

| Правило | Значение |
|---------|----------|
| Паттерн | `pi-table` `expandedRow` / `expandedId` / UX-319 chrome (как products) |
| Data | **Variant A**: lazy; **без** BE hub-summary в 302–304 |
| Budget | ≤4 HTTP reads / expand (см. таблицу) |
| Write | **запрещён** в панели (только ссылки) |

#### Request budget

| Блок | Reads | Источник |
|------|-------|----------|
| Сделка | 0 | list Order (+ populate) |
| Состав | 0 | `items[]` |
| Готовность | 0 | `items[].readyForWork*` |
| Производство | 0 | deep-link only |
| Отгрузка | 0 | stub copy |
| Документы | 0 | deep-link only |
| Снабжение | 1 | `GET /api/supply-tasks?orderId=<Order._id>` |
| Склад | 1 | `GET /api/reservations?orderId=<Order.number>` |
| optional populate gap | ≤2 | только если list без site/KP labels; total ≤4 |

- Ошибка одного блока ≠ collapse панели; loading/error **внутри** блока.
- Повторный expand: cache или re-fetch; после close/смены `expandedId` игнорировать stale.
- **Не** SoT: `Order.reservationIds[]`. Склад только через reservations endpoint by **number**.

#### Блоки UI

1. **Сделка** — клиент, объект, КП, договор; ссылки на `/proposals` (не `/commercial/proposals`)
2. **Состав** — линии (имя/qty), **не** composition-tree; link `/orders/:id`
3. **Готовность** — X/Y + per-line (HUB-304)
4. **Снабжение** — счётчики статусов; link `/supply?orderId=` (HUB-303)
5. **Производство** — «Оценка в цехе»; link `/production?orderId=` (HUB-303 + route contract)
6. **Склад** — counts active/total reservations (HUB-304)
7. **Отгрузка** — честный stub: «Отгрузка пока не ведётся в интерфейсе. Открыть раздел „Отгрузка“.» → `/shipping` (HUB-304)
8. **Документы** — `/doc-constructor/templates?source=order&sourceId=` (HUB-303)

### ШАГ 4. Route contract `/production?orderId=` (для HUB-303)

| Вход | Поведение |
|------|-----------|
| `?orderId=<sales Order._id>` | После загрузки списка — выбрать заказ в cockpit context |
| unknown/deleted id | Не ломать UI; fallback текущий режим + optional RU hint |
| без `orderId` | Поведение как сейчас |
| `q` vs `orderId` | не конфликтуют (id ≠ search) |
| ручной выбор в rail | не обязан синхронизировать URL (вне scope, если не указано) |

### ШАГ 5. Expand behavior AC (для HUB-302+)

- row click (не link/actions) → toggle  
- Номер / routerLink → navigate + `stopPropagation`  
- Enter/Space → toggle  
- single expand  
- page/search/sort/filter → `expandedId=null`  
- a11y: `aria-expanded`, region «Сводка заказа: {number}»  
- mobile: horizontal scroll таблицы  

### ШАГ 6. Обновить page docs

В `docs/pages/orders.page.md` добавить секцию **Order lifecycle hub (HUB-301+)** с колонками, expand, Variant A, ссылкой на audit.  
В `PAGE-TZ-INDEX.md` — строка HUB-301 READY / contract.

### ШАГ 7. Наметить successors (не реализовывать)

Черновики путей (файлы создавать только если PO просит сразу): HUB-302 / 303 / 304 / 305.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:

- `docs/audits/2026-08-15-order-lifecycle-hub.md`
- `tasks/TZ-ORDERS-HUB-301-order-hub-contract.md` (этот файл)
- `docs/pages/orders.page.md`
- `docs/pages/PAGE-TZ-INDEX.md`
- `docs/agent-checklists/TZ-ORDERS-HUB-301.md`

НЕ ИЗМЕНЯТЬ:

- `frontend/**` / `backend/**` product code  
- ActualCost / ProductionOrder glue  
- shipping FE реализация  
- KP Create studio  

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Audit файл существует; ActualCost и Reservation описаны **верно** (ProductionOrder / string number).
2. Этот TZ содержит: колонки, формулу X/Y, Variant A + request budget, матрицу блоков, production route contract, documents path, shipping stub, read-only запреты, expand AC.
3. `orders.page.md` + `PAGE-TZ-INDEX` отражают контракт hub.
4. Явно: HUB-302+ не стартуют без этого контракта; product-код в 301 = FAIL.
5. Quality score self ≥98 (docs contract completeness).
6. Gates: diff docs only; нет FE/BE в commit 301.

known_limitation:

- Реализация UI = 302–304; BE summary = 305 по evidence.  
- Shipment API живой, UI stub — counts не показывать до shipping FE.  
- ProductionOrder ↔ Order glue — вне волны.

═══════════════════════════════════════════════════════════════
ФИНАЛИЗАЦИЯ
═══════════════════════════════════════════════════════════════

Docs-only. CLAIM checklist → после PASS Cursor/PO: archive `tasks/_archive/2026-08/TZ-ORDERS-HUB-301.done.md` + Executor report (auto) с docs commit SHA.

Handoff next:

```text
После archive 301: выдать TZ-ORDERS-HUB-302 → 303 → 304 по очереди (см. tasks/TZ-ORDERS-HUB-302|303|304-*.md).
```
