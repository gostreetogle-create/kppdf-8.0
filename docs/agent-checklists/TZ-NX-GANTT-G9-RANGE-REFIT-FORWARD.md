# TZ-NX-GANTT-G9-RANGE-REFIT-FORWARD checklist

> Status: **DONE**
> Marker: `tasks/_archive/2026-09/TZ-NX-GANTT-G9-RANGE-REFIT-FORWARD.done.md`
> Commit/push: по `docs/GIT-POLICY.md` (executor Freebuff/Buffy)

## Claim slot

- agent_id: freebuff (Buffy)
- claimed_at: 2026-09-05T09:00:00+03:00
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable (no team-room CLI in environment)
- conflict keys: `frontend-nx/apps/kppdf-web/src/app/pages/production/production-cockpit.page.ts` (`refitRangeAfterShift`); `frontend-nx/apps/kppdf-web/src/app/pages/production/blocks/gantt-bars.component.ts` (test-only)
- concurrent active task: Claude `TZ-BACKEND-ORDER-ORG-SCOPE-TX`, backend-only, no overlap

## Preflight

- [x] Read `GEMINI.md`, `.agents/skills/kppdf-executor-loop/SKILL.md`, `.agents/skills/kppdf-context-preflight/SKILL.md`, `docs/PROJECT-MEMORY.md`, `docs/PO-CANON.md`, `docs/CONTEXT.md`, `docs/DOCS-INTEGRITY.md`, `docs/GIT-POLICY.md`.
- [x] Read WAVE SoT and P3 TZ; inspected `tasks/_active/` for conflicting claims.
- [x] Claim slot recorded before product changes; active P3 task copied from ready.
- [x] Backend and parked legacy/security work left untouched.

## Acceptance

- [x] `refitRangeAfterShift` widens `rangeEnd` when the moved order's latest bar plus one-day padding exceeds the visible range.
- [x] Existing backward widening remains intact; both edges use the same one-day padding convention.
- [x] Forward rendering regression covers a bar beyond the previous `rangeEnd`.
- [x] Positive planned-date drag regression proves `rangeEnd` grows and the moved bar scroll target remains addressable.
- [x] Worker-summary rows are asserted read-only through component `canResizeBar` / `canMoveBar` guards.

## Integrity slot

- [x] Type: page behavior / regression tests.
- [x] FIC §A–E: N/A — existing `/production` route, no new page, permission, API, or capability.
- [x] `docs/pages/production-cockpit.page.md` updated with the forward-refit contract.
- [x] `PAGE-TZ-INDEX`: N/A — existing route, no route/nav change.
- [x] `SECTION-READINESS`: N/A — existing production section.
- [x] Coupling map: N/A — no shared field/status/filter change.
- [x] Foreign dirty WIP not staged; backend Order org-scope files excluded.
- [x] Canonical docs checked: `docs/DOCS-INTEGRITY.md`, `docs/PO-CANON.md`.

## Build integrity

- [x] Baseline build had passed before P3 code changes.
- [x] No conflicting active frontend-nx production task was present.
- [x] Final `nx build kppdf-web` is the last P3 gate and passed.

## Gates

- [x] `cd frontend-nx && pnpm exec jest apps/kppdf-web/src/app/pages/production --runInBand` → PASS, 7 suites, 81 tests.
- [x] `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS.
- [x] Targeted ESLint on changed production page/spec files → PASS, 0 errors (existing warnings only).
- [x] `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (last P3 gate).

## Executor report

- Added symmetric forward `rangeEnd` refit with one-day padding and preserved the existing backward refit/re-anchor behavior.
- Added G9 regressions for forward rendering, positive planned-date movement, and worker-mode move/resize denial.
- Updated the production page contract and wave bookkeeping; no backend or L1+ feature changes.

## Closeout

- [x] Archive marker created.
- [x] P3 marked `[x]` in WAVE.
- [x] Active/ready P3 task removed.
- [x] Commit + push completed; SHA recorded in archive after closeout.
- closed_at: 2026-09-05
