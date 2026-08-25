# TZ-UX-443: Content inset from frame (group-workspace)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-26T00:32:00+03:00
closed_by: freebuff-executor

## Outcome

`.group-body` in `pi-group-workspace` now has `padding-inline: var(--panel-content-inset)` (16px)
when `flushBody=false`, so text/controls/boards don't start flush against the left edge of the
white column. `flushBody=true` (KP studio) keeps full-bleed. Docs updated with content column
inset rule.

## Changed surface

- `frontend/src/app/shared/page/pi-group-workspace.component.ts` (padding-inline)
- `frontend/src/app/shared/page/pi-group-workspace.component.spec.ts` (2 regression tests)
- `docs/pages/page-chrome.md` (content column inset rule)
- `docs/ui-density-canon.md` (shell inset paragraph)

## Verification

- typecheck: PASS (`cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`)
- tests: PASS (pi-group-workspace 10/10)
- lint: PASS (0 errors; 17 pre-existing warnings in untouched files)
- architecture: known external FAIL — materials/products cross-page imports (pre-existing, not UX-443)
- FIC: N/A — layout shell fix, no new route/permission/module

## Known limits

- Live browser smoke not run — covered by spec + class-based assertions.
- `/categories` table regression not triggered (same padding rule applies via parent).
