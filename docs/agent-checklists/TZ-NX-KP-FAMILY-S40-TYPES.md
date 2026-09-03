# TZ-NX-KP-FAMILY-S40-TYPES checklist

> Status: **DONE**
> Marker: archived (removed from `tasks/_active/`)
> Commit/push: per `docs/GIT-POLICY.md`

## Claim slot

- agent_id: `claude`
- claimed_at: `2026-09-03T09:30:00+03:00`
- workspace: `D:\kppdf-8.0`
- team_room_claim: `unavailable`

## Preflight

- [x] Get-Location + git rev-parse → `D:\kppdf-8.0`
- [x] Read `_NOW.md` + `tasks/_active/` — no competing claim
- [x] TZ / wave / roadmap read; backend family shape verified
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/` marker present during work

## Acceptance

- [x] `Quotation` extended: `familyRole?`, `masterId?`, `familyVersion?`, `orgMarkupPercent?`, `organizationId?`
- [x] Types added: `QuotationFamilyRole`, `QuotationFamilyMemberSummary`, `QuotationFamilyResponse`, `AttachOrganizationsPayload`
- [x] Types exported from sales index
- [x] `cd frontend-nx && pnpm exec nx build kppdf-web` PASS last

## Integrity slot

- [x] Type: other (data-access types)
- [x] FIC: N/A — no route/page/permission change
- [x] page.md: N/A (no UI route)
- [x] SECTION-READINESS: N/A
- [x] Foreign WIP not committed
- [x] COUPLING-MAP: N/A
- [x] DOCS-INTEGRITY applied

## Build integrity

- [x] Baseline: `nx build kppdf-web` exit 0
- [x] No other `tasks/_active/*` on `apps/kppdf-web/src/**`
- [x] Closing: `nx build kppdf-web` — last command in Gates, exit 0

## Gates (факт)

- `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0 (PASS)

## Executor report

Types-only slice; backend family response shape verified directly from `quotation.service.ts` (`QuotationFamilyMemberSummary`/`QuotationFamilyResponse`/`AttachOrganizationsDto`) before typing. No UI or backend edits.

## Closeout

- [x] archive + lock + live-state sync + remove `_active` marker
- [x] Status = DONE
- closed_at: `2026-09-03`
