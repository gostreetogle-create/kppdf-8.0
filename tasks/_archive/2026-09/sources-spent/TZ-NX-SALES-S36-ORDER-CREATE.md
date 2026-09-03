# TZ-NX-SALES-S36-ORDER-CREATE: прямой заказ без КП

**РОЛЬ:** Executor (frontend-nx)  
**LAYER:** 3 · **PAGES:** `/orders`  
**PAGE_DOCS:** `docs/pages/orders.page.md`  
**ЗАВИСИМОСТИ:** S32, S33, S34  
**CONFLICT KEYS:** `frontend-nx/apps/kppdf-web/src/app/pages/orders/`; `studio-editor.page.ts` (не трогать)

## BUILD INTEGRITY

IMPLICIT CONFLICT: nx build kppdf-web (последний gate).

## Domain preflight

Заказ может существовать без `Quotation`. `siteId` обязателен → `PiSitesService.ensureDefault`.  
Позиции: productId + quantity; **не** копировать unitPrice (strip-commerce).  
Organization = наша фирма (optional `organizationId`).

Сбои: (1) нет клиента — не POST; (2) пустые позиции — не POST; (3) ensure-default упал — banner, заказ не создан.

## ИСХОДНОЕ

CreateOrderDto требует counterpartyId, siteId, items[]. Stub KP не нужна.

## ЧТО ДЕЛАТЬ

1. CTA «Создать заказ» на списке → страница или существующий Pi dialog (reuse kit, не новый визуальный язык).
2. Поля: заказчик (`PiCounterpartiesService.list`), изделия (`PiProductsService.list` + qty), опционально наша фирма (`PiOrganizationsService`), чекбокс «Оплачен».
3. Перед POST: `ensureDefault(counterpartyId)` → `siteId`.
4. `create({ counterpartyId, siteId, items, organizationId?, isPaid?, status: 'draft' })` **без** quotationId.
5. Success → `/orders/:id`. Никогда `stub-proposal`.
6. spec на happy path (mock HTTP).

## ИЗМЕНЯТЬ

- `pages/orders/*`
- docs NX-секция в `orders.page.md` (одна строка CTA)

## НЕ ИЗМЕНЯТЬ

- `ensureStubProposal` backend
- `/proposals` (S37)
- каталог write-path

## КРИТЕРИИ ПРИЁМКИ

- [ ] Заказ без КП создаётся
- [ ] site берётся из ensure-default
- [ ] `nx build kppdf-web` PASS последним

## Archive

`tasks/_archive/2026-09/TZ-NX-SALES-S36-ORDER-CREATE.done.md`
