# TZ-UX-441: form-field reserved error slot

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-25T21:47:00+03:00
closed_by: freebuff

## Outcome

`app-pi-form-field` now always renders a one-line reserved footer with `min-h-4 leading-4 text-xs`. Error remains higher priority than hint and keeps `role="alert"` with `text-destructive`; the public component inputs are unchanged. The regression spec verifies the same footer DOM node and reserved classes across error set, clear, and set transitions.

## Changed surface

- `frontend/src/app/shared/ui/form-field/form-field.component.ts`
- `frontend/src/app/shared/ui/form-field/form-field.component.spec.ts`
- `docs/UX-FORM-CANON.md`
- `docs/agent-checklists/TZ-UX-441.md`
- `progress.md`

## Verification

- acceptance criteria: PASS
- typecheck: PASS (`cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`)
- tests: PASS (`cd frontend && pnpm test -- form-field.component.spec --runInBand`, 7/7)
- lint: PASS (`cd frontend && pnpm lint`, 0 errors; 17 pre-existing warnings)
- architecture: known external FAIL in materials/products page-cross-component imports; no TZ-UX-441 file involved
- diff-check: PASS on owned product/docs files
- integrity: shared primitive, no route/page docs or API changes

## Known limits

Full-dialog visual smoke was not run. Unrelated dirty desktop/docs/data WIP was not staged. Dictionaries and UX-442 were not touched.
