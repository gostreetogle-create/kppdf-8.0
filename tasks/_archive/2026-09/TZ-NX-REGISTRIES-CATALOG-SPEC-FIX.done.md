# TZ-NX-REGISTRIES-CATALOG-SPEC-FIX

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: Freebuff (Buffy)
verification:
  - acceptance criteria: PASS (catalog spec 2/2)
  - typecheck: PASS (frontend-nx kppdf-web app)
  - tests: PASS (focused 1/1 suite; full kppdf-web 69/69 suites, 437 passed, 7 skipped)
  - lint: PASS (targeted file, 0 errors; workspace baseline has unrelated errors)
  - kppdf-web build: PASS
  - checklist: ADDED and completed
  - docs integrity: PASS (test-only; page/FIC/SECTION/COUPLING N/A)
  - status synchronization: P1 marked [x] in WAVE

## Delivered

- Updated `frontend-nx/apps/kppdf-web/src/app/pages/registries/data/registries.catalog.spec.ts` expected order to include `vat-rate` and `formulas` after `organizations`.
- Relaxed the constructor-action assertion to `toBeFalsy()` because registries without `rowActions` return `undefined`, while an actual `open-constructor` action still fails the assertion.
- Preserved `vat-rate` and `formulas` in `registries.catalog.ts`; no registry UX or product code changed.

## Known baseline

- Full workspace `nx lint kppdf-web` remains red on pre-existing Gantt/Studio accessibility rules (32 errors); targeted P1 lint is clean apart from four existing unused-import warnings in the spec.
