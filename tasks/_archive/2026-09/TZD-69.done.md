# TZD-69: Desktop IMPORT_TARGETS align с NX + target worker

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: claude

## Verification

- acceptance criteria: PASS — worker target validates and writes via `/api/workers`; email/name dedupe; workTypeNames resolves by exact name or invalid; Units untouched.
- desktop typecheck: PASS — `npx tsc --noEmit`.
- desktop svelte-check: PASS (0 errors/warnings).
- desktop tests: PASS — `npx tsx --test src/core/*.test.ts src/importers/*.test.ts` (95 tests, 4 suites, 0 fail).

## Delivered

- `worker` ImportTargetKey + Form Studio template (category `references`, label «Люди»).
- `workerDedupeKeyOf` + `validateWorkerRows` (email or ФИО casefold dedupe; workTypeNames name-resolution validation).
- `createEntities` worker branch (POST `/api/workers`, workTypeNames → workTypeIds).
- `workType` columns aligned with NX schema: added `department` + `accentHue`.

## Scope disclosure

- Material columns were deliberately NOT extended — its write path (`mapRowToMaterial` in the mutation-journal proposal flow) only forwards a narrow field set; adding Excel columns without rewiring that mapper would silently drop data. Left for a dedicated successor if PO wants it.
- `frontend-nx/**` and backend schema/DTO were not touched (read-only for field-name alignment).
- Units target was not added (explicit OUT per audit/prompt); `warehouse.type` untouched.

## Commit

- see git log
