# TZ-NX-SALES-S37-QUOTATION-CONVERT: принятое КП → заказ

**РОЛЬ:** Executor (frontend-nx)  
**LAYER:** 3 · **PAGES:** `/proposals` ; `/orders`  
**PAGE_DOCS:** `docs/pages/proposals.page.md` ; `docs/pages/orders.page.md`  
**ЗАВИСИМОСТИ:** S33, S34  
**CONFLICT KEYS:** `pi-quotations.service.ts`; `proposals-list.page.ts`

## BUILD INTEGRITY

IMPLICIT CONFLICT: nx build kppdf-web (последний gate).

## Domain preflight

**Проверено:** `POST /quotations/:id/convert-to-order` только при `status === 'accepted'`; создаёт Order с quotationId, без цен.  
1 КП → 1 Заказ.

Сбои: (1) статус не accepted — кнопки нет; (2) 400 convert — тост, остаёмся в списке; (3) уже converted — кнопки нет.

## ИСХОДНОЕ

NX список КП умеет «В студии», не умеет «В заказ».

## ЧТО ДЕЛАТЬ

1. `PiQuotationsService.convertToOrder(id)` → POST, тип ответа `{ orderId: string }`.
2. На строке `accepted`: кнопка «В заказ» `data-test="proposal-convert-order"`.
3. Успех → `router.navigate(['/orders', orderId])`.
4. spec HTTP + кнопка только для accepted.

## ИЗМЕНЯТЬ

- `pi-quotations.service.ts` + spec
- `proposals-list.page.ts` (+ spec если есть)

## НЕ ИЗМЕНЯТЬ

- family API, stub-proposal, convert-to-contract

## КРИТЕРИИ ПРИЁМКИ

- [ ] accepted → заказ и переход на карточку
- [ ] draft/sent без кнопки convert
- [ ] `nx build kppdf-web` PASS последним

## Archive

`tasks/_archive/2026-09/TZ-NX-SALES-S37-QUOTATION-CONVERT.done.md`
