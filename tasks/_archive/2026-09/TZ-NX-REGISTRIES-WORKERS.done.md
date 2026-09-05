# TZ-NX-REGISTRIES-WORKERS

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: freebuff (Buffy)

## Verification

- acceptance criteria: PASS — `/registries/workers` is API-backed with create/edit/soft archive; `workTypeIds[]` is loaded from active Work Types and persisted; active worker skills continue to feed the existing Gantt labels after refresh; the Gantt unassigned-worker banner now links to `/registries/workers` instead of the missing `/people` route.
- focused app tests: PASS — direct Jest run for `workers-registries.spec.ts` and `worker-form-dialog.component.spec.ts`; 2 suites / 5 tests.
- data-access tests: PASS — `cd frontend-nx && pnpm exec nx test data-access --runInBand --testPathPattern='pi-people\\.service\\.spec\\.ts'`; 17 suites / 85 tests, including the Worker service CRUD spec.
- typecheck: PASS — `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit`.
- lint: PASS on changed R2 files — 0 errors; 15 existing non-null warnings in the touched Gantt component only. Full `nx lint kppdf-web` remains baseline-red outside R2.
- final kppdf-web build: PASS — `cd frontend-nx && pnpm exec nx build kppdf-web`; known Angular nullish-coalescing and Gantt style-budget warnings only.
- whitespace: PASS — `git diff --check` on the R2 scope.
- broader selector disclosure: the Nx test regex selector ran unrelated app-shell tests that fail on concurrent quick-nav count expectations (expected 5/4, received 6/5); all R2-specific suites pass.

## Delivered

- Extended `PiPeopleService` and person types with typed Worker CRUD and soft-archive methods.
- Added the API-backed `workers` registry with server pagination, search/status filters, CRUD actions, and skill-count column.
- Added `WorkerFormDialogComponent` with required identity fields, contact fields, active state, and active Work Type skill checkboxes.
- Corrected the Gantt unassigned-worker link to `/registries/workers` and preserved the existing `ProductionReadFacade` worker-label path.
- Added focused service, registry/data-source, and dialog specs plus updated People/Registries page contracts.

## Scope disclosure

- No separate `/people` route, backend changes, assignment overrides, or unrelated workspace files were staged.

## Commit

- commit: c3f0a8fb
