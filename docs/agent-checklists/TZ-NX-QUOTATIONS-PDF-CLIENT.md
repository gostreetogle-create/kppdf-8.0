# TZ-NX-QUOTATIONS-PDF-CLIENT checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-QUOTATIONS-PDF-CLIENT.md` (archived)

## Claim slot
- agent_id: freebuff
- claimed_at: 2026-09-17T06:30:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI)

## Preflight
- [x] Read `_NOW.md` and `tasks/_active/`; no conflicting claim.
- [x] Read TZ, pack, BE controller and studio blob reference.
- [x] Claim slot filled before product code.

## Acceptance
- [x] Service POSTs `/quotations/:id/pdf` with `responseType: 'blob'`.
- [x] Unit spec verifies endpoint, method and blob response.
- [x] Export remains available through existing data-access barrel.

## Integrity slot
- [x] Type = other: data-access API client.
- [x] FIC/page.md/PAGE-TZ-INDEX/DOMAIN-MAP/SECTION-READINESS/Coupling = N/A; no route, module, permission, or shared-field contour changed.
- [x] Foreign WIP excluded from commit.

## Build integrity
- [x] `cd frontend-nx && pnpm exec nx build kppdf-web` — PASS, exit 0.
- [x] Closing build was the last gate.

## Gates
- [x] `pnpm exec jest --config libs/data-access/jest.config.ts --runInBand libs/data-access/src/lib/sales/pi-quotations.service.spec.ts` — PASS, 1 suite / 9 tests.
- [x] `pnpm exec nx build kppdf-web` — PASS, exit 0; existing Angular/bundle budget warnings only.

## Executor report
- Added raw `downloadPdf(id): Observable<Blob>` using the live quotation PDF endpoint and added HTTP/blob regression coverage.
- BE unchanged; archive endpoint remains untouched.
- Foreign dirty/untracked files were not staged.

## Closeout
- [x] Archive + lock + remove active marker.
- closed_at: 2026-09-17T06:35:00+03:00
