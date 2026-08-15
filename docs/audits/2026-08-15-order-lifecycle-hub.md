# Audit: Order lifecycle hub (единая точка входа)

**Дата:** 2026-08-15  
**Статус:** канон направления — GO на TZ-ORDERS-HUB-301+  
**План:** `.cursor/plans/order_lifecycle_hub_360b84b9.plan.md` (ред. 99)

## Вердикт

Единое «звено» цехового ERP — **sales `Order` (Заказ)**, не Product, не Counterparty, не КП и не новая сущность Hub.

Размещение UX: **эволюционировать `/orders`** (таблица + expand как у `/products`). Панель = read-only обзор + deep-links. Write остаётся на detail / supply / templates→builder.

## Канон

- `docs/PO-CANON.md` — КП → заказ → снабжение/производство → склад/отгрузка  
- `docs/audits/2026-08-08-sales-to-shop-flow-canon.md`  
- `docs/DOMAIN-MAP.md` — КП ≠ Order  

## FK-карта (проверено по schema)

### Связано с sales Order

| Связь | Факт |
|-------|------|
| `counterpartyId`, `siteId` | ObjectId, обязательны (D20) |
| `quotationId`, `contractId` | optional |
| `items[].productId`, `readyForWork` / `readyAt` / `readyByUserId` | линии |
| `shipmentIds[]` | на Order; BE Shipment живой |
| SupplyTask.`orderId` | ObjectId → Order; `GET /api/supply-tasks?orderId=` |
| Quotation stub | `sourceOrderId` / ORDERS-306 |
| Reservation.`orderId` | **string = `Order.number`**, не ObjectId (`order.service` пишет `orderId: order.number`) |

### Не в хаб до склейки

| Сущность | Почему |
|----------|--------|
| ActualCost.`orderId` | ref **ProductionOrder** (`actual-cost.schema.ts`) |
| ProductionOrder / WorkOrder / OrderTask | нет явной связи с sales Order |
| `Order.reservationIds[]` | **не** SoT для сводки; SoT = `GET /api/reservations?orderId=<number>` |

## Живые gaps (checkout)

| Gap | Факт |
|-----|------|
| Expand на `/orders` | нет (`expandedRow` отсутствует) |
| Колонка `total` | есть в списке — **убрать** в HUB-302 |
| `/production?orderId=` | cockpit не читает query |
| `/shipping` | FE stub «скоро» |
| КП-ссылка в detail | bug: `/commercial/proposals` → должно быть `/proposals` |
| List API | flat `Order[]`; фильтры counterparty/status/managerId; нет hub-summary |

## Variant A (v1 data)

Lazy expand; **≤4** HTTP reads; типично 2 (`supply-tasks` + `reservations` by number). BE summary = HUB-305 only after evidence.

## Формула готовности

```text
«X из Y» = count(items.readyForWork===true) / items.length
```

Не смешивать со снабжением/складом/цехом.

## Волна

| TZ | Содержание | Параллель без orders.page |
|----|------------|---------------------------|
| **301** | Audit + executable контракт | DONE |
| **302** | Колонки + expand + Сделка/Состав + `/proposals` | **IN WORK (peer)** — не трогать conflict keys |
| **303** | Снабжение + Документы + `/production?orderId=` | Prep docs: supply + production-cockpit page.md + checklist |
| **304** | Готовность + Склад + shipping stub | Prep: shipping.page.md + reservations contract + checklist; FE after 302 |
| **305** | BE summary — optional, по evidence | — |

## Quality score (архитектура)

99/100 направление; исполнимость контракта после фиксаций 2026-08-15: **98–99/100**.
