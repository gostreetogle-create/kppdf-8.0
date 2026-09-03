# TZ-NX-KP-FAMILY-S41-API-CLIENT checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-KP-FAMILY-S41-API-CLIENT.md` (present)
> Commit/push: per `docs/GIT-POLICY.md`

## Claim slot

- agent_id: `claude`
- claimed_at: `2026-09-03T09:45:00+03:00`
- workspace: `D:\kppdf-8.0`
- team_room_claim: `unavailable`

## Preflight

- [x] Get-Location + git rev-parse → `D:\kppdf-8.0`
- [x] Read `_NOW.md` + `tasks/_active/` — no competing claim on `pi-quotations.service.ts`
- [x] TZ read; S40 types + backend family endpoints verified
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/` marker present

## Acceptance

- [x] `getFamily(id)` → GET /quotations/:id/family
- [x] `attachOrganizations(id, payload)` → POST …/family/attach-organizations
- [x] `syncFromMaster(id)` → POST …/family/sync-from-master
- [x] HttpTestingController specs for the 3 methods PASS
- [x] `nx build kppdf-web` PASS last

## Integrity slot

- [x] Type: other (data-access client)
- [x] FIC: N/A
- [x] page.md: N/A
- [x] Foreign WIP not committed
- [x] COUPLING-MAP: N/A
- [x] DOCS-INTEGRITY applied

## Gates (факт)

- Red: TS2339 compile errors (methods absent). Green: 13 suites / 64 tests PASS.
- `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0 (PASS, last)
