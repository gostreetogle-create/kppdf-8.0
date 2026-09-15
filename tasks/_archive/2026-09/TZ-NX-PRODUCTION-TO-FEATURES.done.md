# TZ-NX-PRODUCTION-TO-FEATURES: Move production facades/UI/util → features

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS (3/3)
  - typecheck: PASS (kppdf-web + features)
  - architecture check: PASS (1499 files; baseline 17; 2 resolved since baseline)
  - tests: PASS (features 19/19 suites 226/226; kppdf-web 112/112 suites 766/773, 7 skipped, 0 failed — 2 consecutive clean runs after one transient flake with no FAIL line)
  - nx build kppdf-web: PASS (last gate, exit 0; initial bundle 503.37 kB — same budget overage as before this TZ)
  - checklist: docs/agent-checklists/TZ-NX-PRODUCTION-TO-FEATURES.md
  - commit: 01c2b46f
  - status synchronization: PASS (tracker + _NOW.md updated)

## Root cause

B1 Stream A's decomposition (A1-A3) landed inside `apps/kppdf-web`; the wave's
target layout puts the Gantt/Cockpit facades, pure util and dumb UI under
`libs/features/src/lib/production/`, matching the DocStudio Editor Decomp
precedent, so the page stops owning framework-agnostic/reusable code.

## Fix

`git mv` every listed file (plus `production-cockpit.context.ts`, not named
in the TZ text but a hard dependency of `orders-rail.component.ts` once that
moved — same "unlisted but load-bearing" situation as A1's
`gantt-bars.constants.ts`) into `libs/features/src/lib/production/`
(`util/`, `ui/`, root-level facades), added three barrel `index.ts` files
and the `@kppdf/features/production` tsconfig path.
`production-cockpit.page.ts` stays in the app, importing everything through
the new barrel.

Found and fixed a real bundle-size regression mid-TZ: `app.routes.ts`'s
route-level `providers: [ProductionReadFacade]` (required — page specs
override it from the TestBed module, which a component-level provider would
shadow) needs an eager import, and importing through the full feature
barrel dragged the whole lazy Gantt UI into the initial chunk (+147 kB,
verified via the built `main-*.js`'s static import graph). Fixed with a
narrow `@kppdf/features/production/production-read.facade` subpath (same
multi-subpath-per-file pattern already used by `@kppdf/data-access`).
Bundle back to the pre-existing 503.37 kB baseline after the fix.

## Files changed

- 14 files moved into `libs/features/src/lib/production/` (util/ui/root facades + specs)
- 3 new barrels: `production/index.ts`, `production/util/index.ts`, `production/ui/index.ts`
- `frontend-nx/tsconfig.base.json` (2 new paths: barrel + narrow read-facade subpath)
- `apps/kppdf-web/src/app/app.routes.ts` (import path)
- `apps/kppdf-web/src/app/pages/production/production-cockpit.page.ts` + 2 specs (import paths)
- `docs/agent-checklists/TZ-NX-PRODUCTION-TO-FEATURES.md` (new)

## Stream A — DONE (A1-A4)

Gantt+Cockpit decomposition into Facade + dumb UI, relocated to
`@kppdf/features/production`. `ProductionReadFacade` untouched as the
separate read model throughout.

## Successor

Stream B `TZ-NX-ORDER-HUB-FACADE` (B1 of the pack, 5/6 of the wave).
