# TZ-NX-SALES-S33-PI-ORDERS-CRUD: create/update/getById заказов

**РОЛЬ:** Executor (frontend-nx data-access)  
**LAYER:** 2 · **PAGES:** orders  
**PAGE_DOCS:** `docs/pages/orders.page.md`  
**ЗАВИСИМОСТИ:** S31 (типы isPaid)  
**CONFLICT KEYS:** `pi-orders.service.ts`; `order.types.ts`

## BUILD INTEGRITY

IMPLICIT CONFLICT: `nx build kppdf-web` последним.

## Domain preflight

**Проверено:** `PiOrdersService.list()` only; `POST /orders`, `PATCH /orders/:id`, `GET /orders/:id` уже есть.  
`quotationId` optional. Цены на заказ не копировать (strip-commerce).

Сбои: N/A (thin HTTP).

## ИСХОДНОЕ

Тип `Order` = `{ _id, number }` — мало для списка/карточки.

## ЧТО ДЕЛАТЬ

1. Расширить `Order`: `status?`, `counterpartyId?`, `quotationId?`, `organizationId?`, `isPaid?`, `paidAt?`, `items?` (минимум `productId`, `productName`, `quantity`).
2. `CreateOrderPayload` / `UpdateOrderPayload` сверка с `CreateOrderDto` / `UpdateOrderDto` (counterpartyId, siteId, items, quotationId?, organizationId?, isPaid?).
3. `getById`, `create` → `silentPost`, `update` → `silentPatch`.
4. Spec как quotations CRUD.

## ИЗМЕНЯТЬ

- `frontend-nx/libs/data-access/src/lib/sales/order.types.ts`
- `frontend-nx/libs/data-access/src/lib/sales/pi-orders.service.ts`
- `pi-orders.service.spec.ts` (создать)

## НЕ ИЗМЕНЯТЬ

- `POST /orders/:id/stub-proposal` — не добавлять метод в сервис

## КРИТЕРИИ ПРИЁМКИ

- [ ] Нет `stub-proposal` в data-access
- [ ] specs PASS; `nx build kppdf-web` последним PASS

## Archive

`tasks/_archive/2026-09/TZ-NX-SALES-S33-PI-ORDERS-CRUD.done.md`
