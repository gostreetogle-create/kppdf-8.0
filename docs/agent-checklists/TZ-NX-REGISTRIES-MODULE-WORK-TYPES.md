# TZ-NX-REGISTRIES-MODULE-WORK-TYPES checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-REGISTRIES-MODULE-WORK-TYPES.md`
> Commit/push: per `docs/GIT-POLICY.md`

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-05T11:03:28+03:00
- workspace: D:\\kppdf-8.0
- team_room_claim: unavailable (continuous executor tool has no team-room CLI)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → continuous root `D:\\kppdf-8.0`
- [x] Read `_NOW.md` + `tasks/_active/` — only G14 is active; no R3 conflict
- [x] TZ / canons / dependencies read
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-REGISTRIES-MODULE-WORK-TYPES.md` present

## Acceptance

- [x] Module payload types accept `workTypes[]` with `workTypeId`, `estimatedHours`, and `sortOrder`.
- [x] Module dialog lists Work Types, supports add/remove/reorder, and loads populated rows in edit mode.
- [x] Create and edit submit `workTypes` in the same module write payload; empty array is valid.
- [x] Existing material composition remains separate from Work Types planning data.
- [x] Existing Gantt math/skip rules remain unchanged.
- [x] Focused tests pass: direct Jest module dialog suite, 1 suite / 8 tests.
- [x] `nx build kppdf-web` passes (final gate; exit 0).

## Integrity slot

- [x] Type: page / catalog registry UI + data-access contract
- [x] FIC §A–E or N/A reason recorded: existing `/registries` page and capability; no new route/permission/module.
- [x] `docs/pages/modules.page.md` and `docs/pages/registries.page.md` updated
- [x] `SECTION-READINESS` updated or N/A (no access/section change)
- [x] Foreign WIP excluded from commit; conflict keys respected
- [x] `docs/COUPLING-MAP.md` updated or N/A (existing Module.workTypes coupling only)
- [x] `docs/DOCS-INTEGRITY.md` followed

## Build integrity

- [x] Existing R3 baseline context: prior `nx build kppdf-web` passed during R2 closeout
- [x] No other active TZ uses the R3 conflict keys
- [x] Closing `nx build kppdf-web` is the last gate command

## Gates

- `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` — PASS (exit 0).
- `pnpm exec jest --config apps/kppdf-web/jest.config.ts --runInBand apps/kppdf-web/src/app/pages/registries/dialogs/module-form-dialog.component.spec.ts` — PASS (1 suite, 8 tests; exit 0).
- `pnpm exec eslint apps/kppdf-web/src/app/pages/registries/dialogs/module-form-dialog.component.ts apps/kppdf-web/src/app/pages/registries/dialogs/module-form-dialog.component.spec.ts libs/data-access/src/lib/catalog/product-module.types.ts` — PASS, 0 errors (exit 0).
- `git diff --check` on R3 paths — PASS (exit 0).
- `pnpm exec nx build kppdf-web` — PASS (exit 0; known existing Angular/style-budget warnings only).

## Executor report

- Added typed Work Types FormArray to module create/edit without changing composition or Gantt calculations.
- Work Type picker loads active rows through `PiWorkTypesService`; populated IDs are normalized from detail responses.
- Conflict disclosure: workspace contains unrelated dirty changes and active G14 production work; only R3 paths will be staged.

## Review handoff

- [x] READY FOR REVIEW recorded in this checklist; TZ has no separate external verdict dependency.

## Closeout

- [x] archive + lock + progress + remove `_active`
- closed_at: 2026-09-05T11:12:00+03:00
