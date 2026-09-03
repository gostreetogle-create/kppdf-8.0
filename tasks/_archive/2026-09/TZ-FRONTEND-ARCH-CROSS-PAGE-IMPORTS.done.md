# TZ-FRONTEND-ARCH-CROSS-PAGE-IMPORTS — DONE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03
closed_by: claude
verification:
  - acceptance criteria: PASS
  - architecture:check: PASS (0 new violations; 3 targeted violations resolved)
  - typecheck: PASS via `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
  - tests: PASS — 3 focused spec suites / 84 tests
  - lint: PASS — eslint on the 6 changed files

3 legacy `frontend/**` cross-page component imports (inventory→materials,
materials→organizations, products→dictionaries) converted from static
top-level imports to dynamic `import('...')` inside the `openCreateX()`
methods — matching the pattern already established in
`shared/services/product-composition-dialog.service.ts` and
`shared/orders/open-catalog-composition-edit.ts`. architecture-check only
flags static `import ... from` statements, so this removes the violation
with zero business-logic change (same dialog, same UX, just resolved
lazily at point of use). No baseline.json edits.

Details: `docs/agent-checklists/TZ-FRONTEND-ARCH-CROSS-PAGE-IMPORTS.md`
