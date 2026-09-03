# TZ-NX-SALES-S38-STUB-KP-HIDE: убрать UX заглушки КП

**РОЛЬ:** Executor (frontend legacy + backend docs)  
**LAYER:** 3 · **PAGES:** `/orders/:id` (legacy)  
**PAGE_DOCS:** `docs/pages/orders.page.md`  
**ЗАВИСИМОСТИ:** S35 (NX уже без stub)  
**CONFLICT KEYS:** `frontend/src/app/pages/orders/order-detail.page.ts`; `order.controller.ts`

## Domain preflight

MASTER-CORE: заглушка КП не создаётся. Endpoint `POST /orders/:id/stub-proposal` остаётся (не ломать старых клиентов), но UI не предлагает.

Сбои: заказ без КП → честный текст, не тихий POST.

## ИСХОДНОЕ

`order-detail.page.ts` кнопка `data-test="order-create-stub-proposal"` + `createStubProposal()`.

## ЧТО ДЕЛАТЬ

1. Убрать кнопку и метод вызова из legacy карточки. Если нет quotationId — copy: «КП не обязателен. Нужен бланк — создайте КП в студии документов.»
2. Spec: кнопки нет; сервис `createStubProposal` не вызывается.
3. Swagger/описание `createStubProposal`: deprecated, «не вызывать из UI; канон MASTER-CORE».
4. NX grep: в `frontend-nx/**` нет `stub-proposal`.

## ИЗМЕНЯТЬ

- `frontend/src/app/pages/orders/order-detail.page.ts` + spec
- `backend/src/modules/order/order.controller.ts` (только description/deprecated)
- `docs/pages/orders.page.md` (запрет заглушки)

## НЕ ИЗМЕНЯТЬ

- Удаление метода `ensureStubProposal` (known_limitation: endpoint жив)
- NX orders (уже без stub)

## КРИТЕРИИ ПРИЁМКИ

- [ ] Нет `order-create-stub-proposal` в шаблоне
- [ ] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- [ ] focused order-detail spec PASS
- [ ] Если трогал NX — `nx build kppdf-web` PASS последним; иначе N/A одной строкой в checklist

## Archive

`tasks/_archive/2026-09/TZ-NX-SALES-S38-STUB-KP-HIDE.done.md`
