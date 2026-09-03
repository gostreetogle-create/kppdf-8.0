# TZ-NX-SALES-S32-SITES-ENSURE: PiSitesService для прямого заказа

**РОЛЬ:** Executor (frontend-nx data-access)  
**LAYER:** 2 · **PAGES:** orders (consumer S36)  
**PAGE_DOCS:** `docs/pages/orders.page.md`  
**ЗАВИСИМОСТИ:** —  
**CONFLICT KEYS:** `frontend-nx/libs/data-access/src/lib/sales/` (new site files + index)

## BUILD INTEGRITY

IMPLICIT CONFLICT: frontend-nx libs (nx test data-access). Полный `nx build kppdf-web` последним, если затронут public API lib.

## Domain preflight

**Проверено:** `POST /sites/ensure-default` (`site.controller.ts:29-34`); `GET /sites?counterpartyId=`; `Order.siteId` required.  
Site = объект заказчика, не Organization.

Сбои: N/A (thin HTTP).

## ИСХОДНОЕ

NX нет `PiSitesService`. Create order в S36 без площадки упадёт на validation.

## ЧТО ДЕЛАТЬ

1. Types: `Site { _id, counterpartyId, name, address }`.
2. `PiSitesService.list(counterpartyId)` → `GET /sites?counterpartyId=`.
3. `ensureDefault(counterpartyId)` → `POST /sites/ensure-default` body `{ counterpartyId }`.
4. Export from sales index.
5. HttpTestingController spec по образцу `pi-quotations.service.spec.ts`.

## ИЗМЕНЯТЬ

- `frontend-nx/libs/data-access/src/lib/sales/` (новые файлы + `index.ts`)

## НЕ ИЗМЕНЯТЬ

- backend site API, UI страниц

## КРИТЕРИИ ПРИЁМКИ

- [ ] spec list + ensureDefault PASS
- [ ] `cd frontend-nx && pnpm exec nx test data-access --skip-nx-cache` PASS (или project name as in repo)
- [ ] `cd frontend-nx && pnpm exec nx build kppdf-web` PASS последним

## Archive

`tasks/_archive/2026-09/TZ-NX-SALES-S32-SITES-ENSURE.done.md`
