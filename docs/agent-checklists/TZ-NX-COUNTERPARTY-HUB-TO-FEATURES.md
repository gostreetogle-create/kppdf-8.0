# TZ-NX-COUNTERPARTY-HUB-TO-FEATURES checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-COUNTERPARTY-HUB-TO-FEATURES.md` (removed on closeout)

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-15T12:45:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Preflight Check Output

- **Dependency:** TZ-1 `4bd786b4` archived and committed.
- **Context:** WAVE-MAP and feature boundary inspected; page and route remain in app.
- **Conflict guard:** no active counterparties overlap; `registries/**`, `registry-forms/**`, `pages/studio/**`, and order-hub excluded.
- **Delivered:** facade moved to `@kppdf/features/counterparties`, public export and alias added, tray import updated, local provider preserved.
- **Domain guard:** `Counterparty` remains buyer; `Organization` is not introduced as a replacement.

## Acceptance

- [x] Facade is exported from `@kppdf/features/counterparties`.
- [x] App tray imports the facade from feature library; page/routes remain in app.
- [x] Providers remain local to tray/page; no root provider.
- [x] Counterparty specs remain green with no behavior change.
- [x] No forbidden paths touched.

## Integrity slot

- [x] Type: feature-library refactor
- [x] FIC: N/A, no route/API/capability change
- [x] page.md: N/A, behavior unchanged
- [x] DOMAIN-MAP: N/A
- [x] SECTION-READINESS: N/A
- [x] No чужой WIP staged; conflict keys respected

## Gates

- [x] `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` — PASS
- [x] `nx build features` — PASS
- [x] focused counterparty tests — PASS (17/17)
- [x] `nx lint features` — baseline FAIL from existing intra-library boundary violations and warnings
- [x] final `nx build kppdf-web` — PASS; existing Angular and budget warnings only

## Executor report

- Moved `CounterpartyHubFacade` to `libs/features/src/lib/counterparties/`.
- Added `@kppdf/features/counterparties` path alias and feature exports.
- Kept `CounterpartyHubTrayComponent` and `/counterparties` page/routes in the app with tray-local facade provider.
- Kept labels and read orchestration behavior unchanged while removing app-relative imports from the feature facade.

## Closeout

- [x] archive + remove `_active`
- [x] Status = DONE
- closed_at: 2026-09-15T12:50:00Z

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
