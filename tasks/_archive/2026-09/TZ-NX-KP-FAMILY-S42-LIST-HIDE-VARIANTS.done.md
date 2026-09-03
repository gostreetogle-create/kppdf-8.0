# TZ-NX-KP-FAMILY-S42-LIST-HIDE-VARIANTS

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03
closed_by: Claude executor
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (tsc -p apps/kppdf-web/tsconfig.app.json)
  - tests: PASS (proposals-list spec: 5 tests incl. 2 new; 57/58 suites — registries.catalog pre-existing failure, unrelated)
  - lint: PASS (scoped eslint on the page + spec)
  - kppdf-web build: PASS (exit 0, last command)
  - checklist: ADDED and completed
  - status synchronization: PASS

## Delivered

- `proposals-list.page.ts` (`frontend-nx` `/proposals`):
  - `filtered` hides `(familyRole ?? 'solo') === 'variant'` rows (legacy canon `proposals.page.ts` 313).
  - Master rows render `app-pi-badge variant="outline"` «Семья» (`proposal-family-badge`); solo — no badge.
- Spec: 2 red-green tests — variant not rendered / master + solo visible; badge only on master.
- Docs: `proposals.page.md` NX S42 bullet; `PAGE-TZ-INDEX.md` `/proposals` row updated.

## Gates

- Red: variant row still rendered (3 rows), no badge. Green: both new tests pass.
- Closing `cd frontend-nx && pnpm exec nx build kppdf-web` exit 0 (last command).
- Pre-existing failure boundary: `registries.catalog.spec.ts` fails on `main` too (unrelated; documented in earlier waves).

## Integrity

FIC checked: existing `/proposals` route page, no permission change. Foreign WIP not in commit.
