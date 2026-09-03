# TZ-NX-KP-FAMILY-S41-API-CLIENT

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03
closed_by: Claude executor
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (ts-jest compile + nx build)
  - tests: PASS (13 suites / 64 tests, data-access)
  - lint: N/A (no lint script change; nx build compiled consumers)
  - kppdf-web build: PASS (exit 0, last command)
  - checklist: ADDED and completed
  - status synchronization: PASS

## Delivered

- `PiQuotationsService` +3 methods (S41):
  - `getFamily(id)` → `GET /quotations/:id/family` → `SilentResult<QuotationFamilyResponse>`
  - `attachOrganizations(id, payload)` → `POST /quotations/:id/family/attach-organizations` with `AttachOrganizationsPayload` body
  - `syncFromMaster(id)` → `POST /quotations/:id/family/sync-from-master`
- `pi-quotations.service.spec.ts`: red-green HttpTestingController specs for the 3 methods (describe 'KP family (TZ-NX-KP-FAMILY-S41-API-CLIENT)').
- convertToOrder / create / update untouched; backend untouched.

## Gates

- Red: spec compile fails TS2339 (methods absent). Green: 13 suites / 64 tests PASS.
- Closing `cd frontend-nx && pnpm exec nx build kppdf-web` exit 0 (last command).

## Integrity

FIC N/A (client addition, no route/page/permission change). No foreign WIP in commit.
