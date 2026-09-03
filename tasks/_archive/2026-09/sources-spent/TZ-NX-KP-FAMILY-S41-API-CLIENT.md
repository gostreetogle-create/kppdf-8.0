# TZ-NX-KP-FAMILY-S41-API-CLIENT: family HTTP в PiQuotationsService

**РОЛЬ:** Executor (frontend-nx data-access)  
**LAYER:** 2 · **PAGES:** `/proposals`  
**PAGE_DOCS:** `docs/pages/proposals.page.md`  
**ЗАВИСИМОСТИ:** S40  
**CONFLICT KEYS:** `pi-quotations.service.ts`; `pi-quotations.service.spec.ts`

## BUILD INTEGRITY

IMPLICIT CONFLICT: nx build kppdf-web последним.

## ЧТО ДЕЛАТЬ

1. `getFamily(id)` → `GET /quotations/:id/family`
2. `attachOrganizations(id, payload)` → `POST …/family/attach-organizations`
3. `syncFromMaster(id)` → `POST …/family/sync-from-master`
4. HttpTestingController specs (3 метода)

## НЕ ИЗМЕНЯТЬ

- convertToOrder, create/update существующие
- backend

## КРИТЕРИИ ПРИЁМКИ

- [ ] 3 метода + specs PASS
- [ ] `nx build kppdf-web` PASS последним

## Archive

`tasks/_archive/2026-09/TZ-NX-KP-FAMILY-S41-API-CLIENT.done.md`
