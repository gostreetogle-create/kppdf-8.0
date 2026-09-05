# TZ-NX-REGISTRIES-MODULE-WORK-TYPES

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: freebuff

## Outcome

The NX module create/edit dialog now has a separate «Виды работ» planning section. It loads active Work Types through `PiWorkTypesService`, hydrates populated `Module.workTypes` rows, supports add/remove/reorder, and submits normalized `workTypes[]` in the same module create/update payload. Material composition remains in `pi-composition-panel`; Gantt math and skip rules were not changed.

## Acceptance

- AC1: edit hydration and save payload for populated Work Type row — PASS (focused spec).
- AC2: module API contract preserves `Module.workTypes` for Gantt refresh; no Gantt code/math changed — PASS by typed contract and unchanged production implementation.
- AC3: create module with one Work Type in one submit — PASS (focused spec).
- AC4: `nx build kppdf-web` — PASS (exit 0).

## Verification

- acceptance criteria: PASS
- typecheck: PASS (`pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit`, exit 0)
- tests: PASS (direct Jest, 1 suite / 8 tests, exit 0)
- lint: PASS on changed TS files, 0 errors
- diff check: PASS
- build: PASS (`pnpm exec nx build kppdf-web`, exit 0; existing Angular/style-budget warnings only)
- checklist: ADDED and completed
- progress/live status: UPDATED (`docs/agent-checklists/_NOW.md`)
- status synchronization: PASS (wave R3 DONE)
- integrity: PASS; existing page/capability, no new route or permission; foreign WIP excluded

## Changed scope

- `frontend-nx/libs/data-access/src/lib/catalog/product-module.types.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/module-form-dialog.component.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/module-form-dialog.component.spec.ts`
- `docs/pages/modules.page.md`
- `docs/pages/registries.page.md`
- `docs/pages/production-cockpit.page.md`
- `docs/agent-checklists/TZ-NX-REGISTRIES-MODULE-WORK-TYPES.md`
- `docs/agent-checklists/WAVE-NX-GANTT-REGISTRIES.md`
- `docs/agent-checklists/_NOW.md`

## Known limits

- Browser smoke was not run; focused DOM-backed Angular tests and the production build passed.
- Backend already accepted and persisted `workTypes[]`; no backend changes were required.
- Existing unrelated workspace changes and active G14 task remain outside this archive/commit.

## Commit

32ef746b
