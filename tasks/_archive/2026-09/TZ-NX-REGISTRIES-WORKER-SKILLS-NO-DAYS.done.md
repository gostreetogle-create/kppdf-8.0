# TZ-NX-REGISTRIES-WORKER-SKILLS-NO-DAYS

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: claude

## Verification

- acceptance criteria: PASS — worker skills checkboxes in `worker-form-dialog.component.ts` show only the work-type name, no `Nд` badge; caption already spoke of Gantt labels, not days; create/update payload unchanged (`workTypeIds` only).
- tests: PASS — `cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=worker-form-dialog --skip-nx-cache` (added a spec assertion that the work-type label has no `Nд` suffix).
- build: PASS — `cd frontend-nx && pnpm exec nx build kppdf-web`; only pre-existing unrelated warnings (studio nullish-coalescing, gantt-bars style budget).

## Delivered

- Removed `@if (workType.days != null) { {{ workType.days }}д }` from the worker skills checkbox list.
- Added a spec assertion guarding against the days suffix regressing.

## Scope disclosure

- Backend Person/Worker schema, `WorkType.days` catalog, Module form, Gantt, and `workTypeIds` selection logic were not touched.
- Orders hub tray / order-hub-tray files were not touched.

## Commit

- see git log (chore: this TZ + L TZ committed together per continuous executor prompt)
