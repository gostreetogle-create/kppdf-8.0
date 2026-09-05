# TZ-NX-GANTT-G15-LEGEND-FOOTER checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-GANTT-G15-LEGEND-FOOTER.md`
> Commit/push: per `docs/GIT-POLICY.md`

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-05T11:14:57+03:00
- workspace: D:\\kppdf-8.0
- team_room_claim: unavailable (continuous executor tool has no team-room CLI)

## Preflight

- [x] Continuous root and branch verified: `D:\\kppdf-8.0`, `main`
- [x] `_NOW.md` and `tasks/_active/` checked; G14 backend-only keys do not overlap the G15 footer key
- [x] G15 TZ, Gantt page contract, and current Gantt component/spec read
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS
- [x] Active task marker present

## Acceptance

- [x] Remove obsolete lower `data-test="gantt-legend"` footer.
- [x] Preserve upper `data-test="gantt-worktype-legend"` color legend.
- [x] Keep Gantt calculations and assignment behavior unchanged; only the footer template and regression spec changed.
- [x] Focused Gantt tests pass: 1 suite / 9 tests.
- [x] `nx build kppdf-web` passes (final gate; exit 0).

## Integrity slot

- [x] Type: page/UI polish
- [x] FIC §A–E or N/A reason recorded: existing `/production` UI cleanup; no route, permission, or new capability.
- [x] `docs/pages/production-cockpit.page.md` N/A: no lower footer contract was documented; no page change needed.
- [x] SECTION-READINESS N/A (no access/section change).
- [x] Foreign WIP excluded from commit; conflict keys respected.
- [x] `docs/COUPLING-MAP.md` N/A (no shared field change).
- [x] `docs/DOCS-INTEGRITY.md` followed.

## Build integrity

- [x] Existing NX build passed immediately before this task during R3 closeout
- [x] No other active TZ claims the G15 footer key
- [x] Closing `nx build kppdf-web` is the last gate command.

## Gates

- `pnpm exec jest --config apps/kppdf-web/jest.config.ts --runInBand apps/kppdf-web/src/app/pages/production/blocks/gantt-bars.component.spec.ts` — PASS (1 suite, 9 tests; exit 0).
- `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` — PASS (exit 0).
- `pnpm exec eslint apps/kppdf-web/src/app/pages/production/blocks/gantt-bars.component.ts apps/kppdf-web/src/app/pages/production/blocks/gantt-bars.component.spec.ts` — PASS, 0 errors; 17 existing warnings (exit 0).
- `git diff --check` on G15 paths — PASS (exit 0).
- `pnpm exec nx build kppdf-web` — PASS (exit 0; known existing Angular/style-budget warnings only).

## Executor report

- Removed only the obsolete lower explanatory Gantt footer; upper Work Type legend remains.
- Conflict disclosure: G14 backend-only work remains active; unrelated workspace changes will not be staged.

## Review handoff

- [x] READY FOR REVIEW recorded; this S-sized cleanup has no separate external verdict dependency.

## Closeout

- [x] archive + lock + progress + remove `_active`
- closed_at: 2026-09-05T11:18:30+03:00
