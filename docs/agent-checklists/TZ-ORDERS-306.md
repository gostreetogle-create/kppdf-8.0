# TZ-ORDERS-306 checklist

> Status: **DONE** (2026-08-08) · Wave: PARTY-DOCS #4 · Depends: PARTY-301 DONE
> Source: `tasks/_archive/2026-08/TZ-ORDERS-306.done.md`

## Claim slot
- agent_id: agent-3e757640b7 (Cursor executor)
- claimed_at: 2026-08-08
- workspace: D:\kppdf-8.0

## Acceptance
- [x] API stub КП из order; proposalId доступен
  - `POST /orders/:id/stub-proposal` → `{ quotationId, created, quotation }`
  - `OrderService.ensureStubProposal()`: status `draft`, `isStub: true`, `sourceOrderId`
  - двусторонняя связь `Order.quotationId` ↔ `Quotation.sourceOrderId`
  - организация: JWT → `isOurCompany` → единственная (`OrganizationService.findCurrent`)
- [x] Идемпотентность / понятная ошибка при повторе
  - повтор → тот же КП, `created: false`, ни create, ни save
  - dangling `quotationId` (КП удалено) → пересоздание + warn в лог
  - 400 с русским текстом: отменённый заказ / заказ без позиций
  - e2e доказывает: два вызова → один `quotationId`
- [x] FE «Создать черновик КП» на order detail
  - факт «КП» в паспорте заказа: «Нет — прямой заказ» + кнопка / «№QTN-…» + ссылка
  - кнопка блокируется на время запроса; тост различает создано / уже было
- [x] Не трогать supply/line-ready — не тронуто (`setLineReady`, supply без изменений)
- [x] orders.page.md — раздел «КП-заглушка для прямого заказа» + endpoint + TZ-таблица

## Gates
- [x] BE tsc: в зоне order/quotation ошибок нет (репо-дрейф в чужих spec — до этой волны)
- [x] BE unit: order 18/18, суммарно order+quotation+organization+counterparty 71/71 PASS
- [x] BE e2e `orders.e2e-spec.ts`: 7/7 PASS (включая новый stub-proposal кейс)
- [x] FE tsc в зоне orders + Angular development build PASS
- [x] FE tests `pages/orders`: 21/21 PASS
- [x] targeted ESLint (BE order/quotation, FE orders): 0 errors
- [x] `git diff --check`

## Closeout
- [x] Archive: `tasks/_archive/2026-08/TZ-ORDERS-306.done.md`
- [x] Lock: `.mimocode/locks/TZ-ORDERS-306-stub-proposal.lock`
- [x] progress.md + ARCHITECTURE.md
- [x] Commit/push; deploy NO

## Extended CONFLICT KEYS (сверх TZ)
- `backend/src/modules/quotation/quotation.schema.ts` — +2 поля (`isStub`, `sourceOrderId`)
- `backend/src/modules/order/order.module.ts` — Quotation model + OrganizationModule
- `backend/test/e2e/orders.e2e-spec.ts` — новый кейс
- `backend/src/modules/order/order.service.spec.ts` — конструктор + тесты
Параллельных TZ в `_active/` нет, конфликта не было.

## Out of scope (по TZ)
- PDF generator / полный редактор КП — не тронуты
- Привязка КП к builder-документам (`BuildDocumentDto` не имеет `quotationId`) → отдельное TZ
