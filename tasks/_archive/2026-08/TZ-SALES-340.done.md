# TZ-SALES-340: Create КП — панель «Состав КП»

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md
CONFLICT KEYS: proposal-create page/spec, composition component, product rail, proposals-create page doc

## Outcome

- Added a mutually exclusive right-rail «Состав КП» overlay without changing the frozen rails|center A4 shell.
- Added Russian composition cards with photo/name/article/base price, quantity stepper, editable unit price and unit, line total, duplicate/delete and reorder actions.
- Reused the existing `draftLines` → `build()` → autosave path. Quantity and price updates rebuild the A4 preview and autosave the existing quotation payload.
- Repeated Add of the same product increments the existing line quantity. F5 hydration continues to restore the saved item array and order.
- Updated `proposals-create.page.md` and added focused composition behavior coverage.

## Verification

- [x] Frontend app tsc: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`)
- [x] Focused Jest: PASS (`proposal-create`, 25/25)
- [x] Backend build tsc: PASS (`pnpm exec tsc -p tsconfig.build.json --noEmit`)
- [x] ESLint: PASS on changed frontend files
- [x] Prettier: PASS on changed frontend files
- [x] `git diff --check`: PASS
- [x] Browser-equivalent DOM self-check: PASS in focused Angular test (composition empty state, add-increment, edit, duplicate, reorder, delete, rendered line)
- [x] Frozen shell 317 and completed 319/321/323–339 behavior preserved by existing suite.

## Known limitations

- Full authenticated live browser smoke was unavailable because the local backend/auth data stack was not running; focused Angular DOM coverage and development bundle compile passed.
- PDF/print, commercial fields, recipient, terms, custom lines, multipage, versions and vitrine remain in the strict next queue.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-10
closed_by: Buffy / agent-d2515d7a53
protected_files:
  - frontend/src/app/pages/commercial/proposals/proposal-create.page.ts
  - frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts
  - frontend/src/app/pages/commercial/proposals/proposal-create-composition.component.ts
  - docs/pages/proposals-create.page.md
verification:
  - acceptance criteria: PASS
  - frontend typecheck: PASS
  - proposal-create Jest: PASS (25/25)
  - backend typecheck: PASS
  - lint: PASS
  - prettier: PASS
  - diff-check: PASS
  - checklist: UPDATED
  - progress.md/status/map: UPDATED
notes: No TableTemplate, catalog price, auth, deploy, ZIP publish, or foreign WIP changes.
