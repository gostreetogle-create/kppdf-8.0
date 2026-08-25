# TZ-DICT-441: Классификация — оба chip всегда видны

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-25T20:40:00+03:00
closed_by: freebuff-executor

## Outcome

`/dictionaries/kind-labels` now uses shared `CLASSIFICATION_CHIPS` (Категории + Виды изделий и материалов), matching `/categories`. The single-chip local literal that hid «Категории» is removed. Spec regression asserts both chip ids and labels.

## Changed surface

- `frontend/src/app/pages/dictionaries/kind-labels.page.ts`
- `frontend/src/app/pages/dictionaries/kind-labels.page.spec.ts`
- `docs/pages/dictionaries.page.md`
- `docs/pages/PAGE-TZ-INDEX.md`
- `docs/agent-checklists/TZ-DICT-441.md`
- closeout: `_NOW.md`, `QUEUE-LIVE.md`, `progress.md`

## Verification

- acceptance criteria: PASS
- typecheck: PASS (`cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`)
- tests: PASS (`kind-labels.page.spec.ts`, 5/5 incl. DICT-441 chips)
- focused ESLint: PASS
- architecture: known external FAIL in materials/supply cross-page imports; no DICT-441 file involved
- FIC §A group chips: reuse existing; N/A new route
- Integrity: page.md + PAGE-TZ-INDEX updated

## Known limits

Live browser smoke not run. Measurements / form-profiles single-chip groups out of scope. CATALOG-377 files not touched.
