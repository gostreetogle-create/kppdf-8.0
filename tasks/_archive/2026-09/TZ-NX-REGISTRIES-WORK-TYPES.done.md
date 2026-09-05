# TZ-NX-REGISTRIES-WORK-TYPES

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: freebuff (Buffy)

## Verification

- acceptance criteria: PASS — `/registries/work-types` is API-backed; create/edit/archive actions use the registry dialog; typed `name`, `days`, `hourlyRate`, `accentHue`, and `isActive` fields persist; the existing Gantt `{ days }` PATCH remains compatible.
- focused tests: PASS — `cd frontend-nx && pnpm exec nx test kppdf-web --runInBand --testPathPattern='(pi-work-types\\.service|work-types-registries|work-type-form-dialog)\\.spec\\.ts'`; the Nx/Jest target ran 72 suites with 452 passed and 7 skipped, including the R1 specs.
- typecheck: PASS — `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit`.
- lint: BASELINE FAIL — `cd frontend-nx && pnpm exec nx lint kppdf-web` reports 33 existing errors and 197 warnings across unrelated production, registries, and studio files; the R1-owned checkbox label error was corrected.
- final kppdf-web build: PASS — `cd frontend-nx && pnpm exec nx build kppdf-web`; known Angular/style-budget warnings only.
- docs: PASS — `docs/pages/work-types.page.md` and `docs/pages/registries.page.md` updated.

## Delivered

- Added typed `WorkType` contracts and `PiWorkTypesService` CRUD adapter, preserving the narrow Gantt `update(id, { days })` call.
- Added API data source with client-side search, sort, and pagination for the flat work-types response.
- Added `/registries/work-types` definition, create/edit/archive actions, page-scoped dialog host, and validated form.
- Added focused service, data-source/registry, and dialog specs.

## Scope disclosure

- No backend, route, permission, or legacy frontend changes.
- Unrelated dirty workspace files were not staged.

## Commit

- commit: 65faedc9
