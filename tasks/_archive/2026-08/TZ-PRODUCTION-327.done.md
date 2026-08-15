# TZ-PRODUCTION-327.done — cockpit smart/dumb light refactor

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-15
closed_by: Buffy
TZ: TZ-PRODUCTION-327
WAVE: WAVE-PRODUCTION-COCKPIT-HARDEN
DEP: TZ-PRODUCTION-326 (`23f0740f`)

## Outcome

- Completed the smart/dumb inventory for the production cockpit.
- Kept `ProductionCockpitPage` smart for reads, PATCH orchestration, chrome registration, filters, and range fitting.
- Kept `ProductionReadFacade` as the read/cache/composition boundary and `ProductionCockpitContext` as local UI state.
- Kept Gantt and Orders rail behavior-sensitive presentational blocks intact; no risky template rewrite.
- Extracted one focused dumb block: `ProductionScaleControlsComponent` with `zoom` input and `zoomChange` / `fit` outputs.
- Preserved the existing Russian UI, API/routes, estimate-only semantics, no-bottom-card cascade, and TZ-324–326 behavior.

## Verification

- frontend typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`)
- production tests: PASS (`pnpm exec jest src/app/pages/production --runInBand`, 6 suites / 70 tests)
- frontend lint: PASS with 18 pre-existing architecture warnings (`pnpm lint`)
- targeted formatting: PASS (`pnpm exec prettier --check` on changed production TS files)
- browser smoke: NOT RUN — no live browser server available; focused Angular tests cover the extracted controls and cockpit behavior.
- docs/checklist: PASS — production page Smart/dumb boundary and Blocks inventory updated.
- bans: PASS — no fact production, ProductionOrder/OrderTask, deploy, wipe, or staged data.

## Files

- `frontend/src/app/pages/production/blocks/production-scale-controls.component.ts`
- `frontend/src/app/pages/production/blocks/production-scale-controls.component.spec.ts`
- `frontend/src/app/pages/production/production-cockpit.page.ts`
- `frontend/src/app/pages/production/production-cockpit.page.spec.ts`
- `docs/pages/production-cockpit.page.md`
- `docs/agent-checklists/TZ-PRODUCTION-327.md`
- `docs/agent-checklists/WAVE-PRODUCTION-COCKPIT-HARDEN.md`
- `docs/agent-checklists/_NOW.md`

## Lock

`.mimocode/locks/TZ-PRODUCTION-327-cockpit-smart-dumb.lock`
