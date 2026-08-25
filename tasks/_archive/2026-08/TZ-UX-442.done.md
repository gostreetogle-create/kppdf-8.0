# TZ-UX-442: dictionaries — RU placeholders для slug

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-25T22:05:00+03:00
closed_by: freebuff-executor

## Outcome

All 4 dictionary form dialogs now show no EN/translit placeholder in the slug
field; the RU hints already present («Строчные латинские…», «Необязательно —
сервер сгенерирует…») are the only guidance. Long fake values like
`category-slug`, `commercial-proposals`, `rekvizity-kontragenta`,
`ral-9003-signalny-belyy` are gone.

## Changed surface

- `frontend/src/app/pages/dictionaries/category-form-dialog.component.ts`
- `frontend/src/app/pages/dictionaries/text-block-category-form-dialog.component.ts`
- `frontend/src/app/pages/dictionaries/document-template-category-form-dialog.component.ts`
- `frontend/src/app/pages/dictionaries/color-reference-form-dialog.component.ts`
- `docs/pages/categories.page.md` (TZ row)
- `docs/pages/PAGE-TZ-INDEX.md` (READY → DONE)
- closeout: `_NOW.md`, checklist, `progress.md`

## Verification

- acceptance criteria: PASS (grep AC — 0 matches)
- typecheck: PASS (`cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`)
- tests: PASS (category-form-dialog 23/23; color-reference-form-dialog 3/3)
- lint: PASS (0 errors; 17 pre-existing warnings in untouched files)
- architecture: known external FAIL — `material-form-dialog.ts:56` /
  `product-form-dialog.ts:56` cross-page imports (committed pre-existing, not
  UX-442); UX-442 files introduce 0 violations
- FIC: N/A — placeholder copy fix, no new route/permission/module
- Integrity: categories.page.md + PAGE-TZ-INDEX updated

## Known limits

- Live browser smoke not run (dev stack down) — covered by specs + grep AC.
- `app-pi-form-field` reserved error slot is UX-441 (parallel, not touched).
- CATALOG-377 paths/seed untouched.
