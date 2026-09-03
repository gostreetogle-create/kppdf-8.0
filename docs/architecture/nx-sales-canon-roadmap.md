# NX Sales canon — дорожная карта (после Doc Studio)

> **SoT:** этот файл + `docs/architecture/MASTER-CORE.md` §2.4 / §3 / §5
> **Очередь:** `docs/agent-checklists/WAVE-NX-SALES-CANON.md`
> **Предыдущая волна:** Doc Studio S15–S26 **DONE**

## Север

Менеджер в NX: собрал КП в студии **или** завёл заказ напрямую.
Заглушка-КП запрещена каноном. Валюта — только RUB. Оплата живёт на **Заказе**.

## Уже есть (не повторять)

| Факт | Где |
|------|-----|
| `POST /quotations`, `PATCH`, convert-to-order | `quotation.controller.ts` |
| `PiQuotationsService` create/update + `/proposals` «В студии» | S20 / S20-PRE |
| `POST /orders` без обязательного `quotationId` | `CreateOrderDto` |
| `ensureStubProposal` + UI «создать заглушку» | **анти-канон** — убрать из UX в этой волне |
| `Order.isPaid` / `paidAt` | **нет в schema** |
| NX `/orders` | **нет маршрута** (nav скрыт `filterNavCategories`) |
| `PiOrdersService` | только `list()` |

## Волна S30–S39 — **DONE**

Все 10 TZ заархивированы и запушены (`docs/agent-checklists/WAVE-NX-SALES-CANON.md`, SHAs в chain). Итог: NX журнал `/orders` (list/create/detail), оплата на заказе, прямой заказ без КП, convert accepted КП → заказ, заглушка-КП убрана из UX. PARK (не этой волны): семья КП, авто-резерв склада, `statusOverride`, договор-файл, Excel-формулы.

## Термины

| Говорят | Код |
|---------|-----|
| Клиент | `Counterparty` |
| Наша фирма | `Organization` |
| КП | `Quotation` |
| Заказ | `Order` |
