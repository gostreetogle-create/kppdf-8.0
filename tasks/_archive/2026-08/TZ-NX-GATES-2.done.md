# TZ-NX-GATES-2-nx-scoped

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-29
closed_by: freebuff-nx-gates-2
verification:
  - acceptance criteria: PASS
  - typecheck: N/A — scripts/docs-only
  - tests: N/A — scripts/docs-only
  - lint: N/A — scripts/docs-only
  - checklist: ADDED
  - progress.md: N/A — no product progress log in scope
  - status synchronization: PASS

## Changes

- Added `--roots=` support to `scripts/architecture-check.mjs`.
- Added Nx-only `architecture:check:nx` using no-baseline mode.
- Added Nx-scoped token scan and frozen migration baseline at `scripts/check-ui-tokens.nx-baseline.json`.
- Added `ui:tokens:nx` root script.
- Documented both commands in `frontend-nx/README.md`.

## Gates

- `pnpm run architecture:check:nx`: PASS, 0 Nx violations.
- `pnpm run ui:tokens:nx`: PASS, 53 frozen migration occurrences, no new hits.
- `node scripts/architecture-check.mjs`: legacy default remains FAIL on 3 pre-existing violations; no legacy code was changed.

## Integrity

- Legacy frontend colors and behavior were not modified.
- No commit or push performed.
- Existing unrelated worktree changes preserved.
