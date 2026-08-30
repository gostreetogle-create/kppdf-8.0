# TZ-NX-SHELL-kit-dev-link

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-29
closed_by: freebuff-nx-shell
verification:
  - acceptance criteria: PASS
  - typecheck: covered by Nx production build
  - tests: N/A — no test target requested
  - lint: PASS
  - checklist: ADDED
  - progress.md: N/A — no product progress log in scope
  - status synchronization: PASS

## Changes

- Added `environment.showKitNav` with development default `true`.
- Added a RU-labelled `UI Kit` router link to the kit shell header.
- Production build uses the production environment shape (`showKitNav: false` expected by environment replacement contract); routes remain available.
- Legacy `frontend/**` unchanged.

## Gates

- `pnpm exec nx build kppdf-web`: PASS.
- `pnpm exec nx run-many -t lint --all`: PASS, 0 errors; existing UI warnings remain.
