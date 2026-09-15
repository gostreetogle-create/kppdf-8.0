# TZ-NX-COUNTERPARTY-HUB-FACADE checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-COUNTERPARTY-HUB-FACADE.md` (removed on closeout)

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-15T12:30:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Preflight Check Output

- **Context:** WAVE-MAP and both counterparty TZs read; studio-list verification commits `e736f413`, `204b66c7` confirmed.
- **Conflict guard:** no active counterparties claim existed; `registries/**`, `registry-forms/**`, `pages/studio/**`, and order-hub excluded.
- **Delivered:** tray-scoped Signals facade extracted; tray retains local provider and unchanged template behavior.
- **Domain guard:** `Counterparty` remains the hub input; `Organization` is only represented by the related contract data and is not substituted for the buyer.

## Acceptance

- [x] `CounterpartyHubFacade` extracted with Signals.
- [x] Tray is thin and provides facade locally; no root provider.
- [x] Counterparty specs remain green with no behavior change.
- [x] `Counterparty` remains distinct from `Organization`.
- [x] No forbidden paths touched.

## Integrity slot

- [x] Type: feature/page refactor
- [x] FIC: N/A, no route/API/capability change
- [x] page.md: N/A, behavior unchanged
- [x] DOMAIN-MAP: N/A
- [x] SECTION-READINESS: N/A
- [x] No чужой WIP staged; conflict keys respected

## Gates

- [x] `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` — PASS
- [x] focused counterparty tests — PASS (17/17)
- [x] `pnpm exec nx lint kppdf-web` — baseline FAIL; existing lazy-boundary and accessibility violations, including pre-existing counterparties row click warning
- [x] final `pnpm exec nx build kppdf-web` — PASS; existing Angular and budget warnings only

## Executor report

- Added `counterparty-hub.facade.ts` with tray-local injected services, Signals state, status labels, and four existing read requests.
- Reduced `counterparty-hub-tray.component.ts` to input/template wiring plus local facade provider.
- Preserved the four-block hub, links, loading/error/empty states, and ≤5-request lazy-expand budget.

## Closeout

- [x] archive + remove `_active`
- [x] Status = DONE
- closed_at: 2026-09-15T12:40:00Z

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: freebuff
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: BASELINE FAIL (pre-existing)
  - checklist: ADDED
  - progress.md: N/A (refactor-only)
  - status synchronization: PASS
