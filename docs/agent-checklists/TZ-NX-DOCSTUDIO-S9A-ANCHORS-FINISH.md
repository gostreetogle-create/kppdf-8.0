# TZ-NX-DOCSTUDIO-S9A-ANCHORS-FINISH checklist

Status: READY FOR REVIEW
Marker: `tasks/_active/TZ-NX-DOCSTUDIO-S9A-ANCHORS-FINISH.md`

## Claim slot
- agent_id: claude
- claimed_at: 2026-09-01T21:50:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI)

## Preflight
- [x] Startup context, TZ, page/domain docs read
- [x] git sync: origin/main current
- [x] tasks/_active empty before claim
- [x] baseline `cd frontend-nx && pnpm exec nx build kppdf-web`: PASS
- [x] Preflight Check Output recorded in session: context paths included TZ, page, architecture, source/service files

## Acceptance
- [x] Anchor bag accepts `anchors` and exposes `anchor.client.*` while retaining legacy counterparty bag
- [x] Client selection dual-writes legacy `counterpartyId` and `anchors.client`
- [x] Selected anchor chips use Russian roles
- [x] Picker supports anchor role labels/tokens for payer and supplier
- [x] Backend focused tests: 44 passed
- [x] Frontend studio tests: 54 suites, 294 passed, 7 skipped
- [x] `nx build kppdf-web` last gate: PASS

## Integrity slot
- [x] Type: module + page/domain behavior
- [x] FIC §C/§D completed; no new route or permission
- [x] `docs/pages/document-studio.page.md` updated
- [x] `docs/SECTION-READINESS.md`: N/A, existing section only
- [x] Foreign WIP not staged; conflict keys limited to claimed S9A files
- [x] `docs/COUPLING-MAP.md`: N/A, no order status/freeze/FK semantics changed
- [x] `docs/DOCS-INTEGRITY.md` followed

## Gates
- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit`: PASS
- `cd backend && pnpm test -- studio-output studio-document`: PASS (3 suites, 44 tests)
- `cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=studio`: PASS (54 suites, 294 passed)
- `cd frontend-nx && pnpm exec nx build kppdf-web`: PASS (exit 0, last)

## Executor report
S9A anchor contract, dual-read/write client context, selected-role UI, and anchor token picker labels implemented. Existing build warnings remain non-blocking.

## Closeout
- [ ] archive + lock + progress + remove active marker
- closed_at: pending commit
