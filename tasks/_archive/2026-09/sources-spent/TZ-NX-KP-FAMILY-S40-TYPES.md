# TZ-NX-KP-FAMILY-S40-TYPES: типы семьи КП в data-access

**РОЛЬ:** Executor (frontend-nx data-access)  
**LAYER:** 2 · **PAGES:** `/proposals`  
**PAGE_DOCS:** `docs/pages/proposals.page.md`  
**ЗАВИСИМОСТИ:** Sales S39 DONE  
**CONFLICT KEYS:** `quotation.types.ts`

## Domain preflight

**Проверено:** `quotation.schema.ts` `familyRole` solo|master|variant; `masterId`; `familyVersion`; `orgMarkupPercent`.  
Organization = наша фирма на варианте.

## ЧТО ДЕЛАТЬ

1. Расширить `Quotation`: `familyRole?`, `masterId?`, `familyVersion?`, `orgMarkupPercent?`, `organizationId?`.
2. Types: `QuotationFamilyRole`, `QuotationFamilyResponse` (сверка с BE response shape из `getFamily`/`attachOrganizations`).
3. `AttachOrganizationsPayload`: `{ items: { organizationId, orgMarkupPercent? }[] }`.

## НЕ ИЗМЕНЯТЬ

- backend, UI pages

## КРИТЕРИИ ПРИЁМКИ

- [ ] Types экспортируются из sales index
- [ ] `nx build kppdf-web` PASS последним (lib consumers)

## Archive

`tasks/_archive/2026-09/TZ-NX-KP-FAMILY-S40-TYPES.done.md`
