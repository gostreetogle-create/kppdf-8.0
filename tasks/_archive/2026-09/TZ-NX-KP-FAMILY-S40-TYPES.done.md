# TZ-NX-KP-FAMILY-S40-TYPES

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03
closed_by: Claude executor
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (nx build kppdf-web compiles lib consumers)
  - tests: N/A (types-only)
  - lint: N/A (types-only)
  - kppdf-web build: PASS (exit 0, last command)
  - checklist: ADDED and completed
  - status synchronization: PASS

## Delivered

- `frontend-nx/libs/data-access/src/lib/sales/quotation.types.ts`:
  - `Quotation` extended: `organizationId?`, `familyRole?`, `masterId?`, `familyVersion?`, `orgMarkupPercent?` (mirrors `quotation.schema.ts`).
  - New: `QuotationFamilyRole` ('solo'|'master'|'variant'), `QuotationFamilyMemberSummary`, `QuotationFamilyResponse` (master/variants/familyVersion — exact shape of `QuotationFamilyResponse` in backend `quotation.service.ts`), `AttachOrganizationItemPayload` + `AttachOrganizationsPayload` (`{ items: [...] }`).
- Exported automatically via `export * from './quotation.types'` in `libs/data-access/src/lib/sales/index.ts`.
- `_NOW.md` live state updated (S40 ACTIVE → archived next step).

## Gates

- Baseline `nx build kppdf-web` exit 0; closing `nx build kppdf-web` exit 0 (last command).

## Integrity

FIC N/A (no route/page/permission change). Backend untouched. No foreign WIP in commit.
