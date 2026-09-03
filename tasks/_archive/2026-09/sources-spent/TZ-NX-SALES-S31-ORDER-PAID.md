# TZ-NX-SALES-S31-ORDER-PAID: isPaid / paidAt на Заказе

**РОЛЬ:** Executor (backend)  
**LAYER:** 4 · **PAGES:** orders (consumer later S35)  
**PAGE_DOCS:** `docs/pages/orders.page.md`  
**ЗАВИСИМОСТИ:** S30 optional (можно параллельно по keys; в chain — после S30)  
**CONFLICT KEYS:** `order.schema.ts`; `create-order.dto.ts`; `update-order.dto.ts`; `order.service.ts`

## Domain preflight

**Проверено:** `order.schema.ts` — нет `isPaid`/`paidAt`; `quotationId` уже optional; MASTER-CORE §2.4: оплата на Заказе, не на КП.  
Покупатель = `Counterparty`. Unique = `Order.number`.

Сбои (≥3): (1) КП нет — оплата всё равно на заказе; (2) повторный PATCH isPaid=true не дублирует paidAt если уже стоит; (3) isPaid=false сбрасывает paidAt.

## ИСХОДНОЕ

Прямой заказ без КП негде хранить оплату. Авто-заглушка КП — отдельная S38.

## ЧТО ДЕЛАТЬ

1. Schema: `isPaid: boolean` default false; `paidAt?: Date`.
2. DTO create/update: optional `isPaid`, `paidAt` (ISO). Если `isPaid===true` и `paidAt` пуст — выставить `new Date()`. Если `isPaid===false` — `paidAt = null`.
3. **НЕ** авто-переводить `status` в производство при оплате (PARK: цех/склад).
4. Specs: create unpaid; PATCH paid sets paidAt; PATCH unpaid clears paidAt.
5. Строка в `docs/COUPLING-MAP.md`: `Order.isPaid` = факт оплаты заказа; не поле КП.

## ИЗМЕНЯТЬ

- `backend/src/modules/order/order.schema.ts`
- `backend/src/modules/order/dto/create-order.dto.ts`
- `backend/src/modules/order/order.service.ts` (+ spec)
- `docs/COUPLING-MAP.md` (одна строка)

## НЕ ИЗМЕНЯТЬ

- `ensureStubProposal`, Гант, склад, NX UI (S35)
- Авто-FSM в production при paid

## КРИТЕРИИ ПРИЁМКИ

- [ ] Поля в schema + create без quotationId + isPaid работает
- [ ] `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` PASS
- [ ] `cd backend && pnpm test -- order.service` PASS (или focused file)

## Archive

`tasks/_archive/2026-09/TZ-NX-SALES-S31-ORDER-PAID.done.md`
