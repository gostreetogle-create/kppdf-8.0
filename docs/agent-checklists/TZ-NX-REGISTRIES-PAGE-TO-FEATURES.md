# TZ-NX-REGISTRIES-PAGE-TO-FEATURES checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-REGISTRIES-PAGE-TO-FEATURES.md` (removed on closeout)

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-15T13:20:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Preflight Check Output

- **Dependency:** TZ-1 `3aef071e` archived and committed.
- **Feature boundary:** `@kppdf/features/registries-platform` already owns registry types/query state; facade moved and exported there without a second alias.
- **Conflict guard:** `_active/` was empty after TZ-1. Excluded counterparties, studio-list, order-hub, registry-forms internals, and wholesale `pages/registries/data/**` movement.
- **Delivered:** facade moved, public export added, page/spec imports updated, page-local provider preserved.
- **Final gate:** `nx build kppdf-web` PASS.

## Acceptance

- [x] `RegistriesPageFacade` is exported from `@kppdf/features/registries-platform`.
- [x] App page imports facade from feature library; routes/page/data remain in app.
- [x] Provider remains local to page; no root provider.
- [x] Registries specs remain green with no behavior change.
- [x] No wholesale registry data move or forbidden paths touched.

## Integrity slot

- [x] Type: feature-library refactor
- [x] FIC: N/A, no route/API/capability change
- [x] page.md: N/A, behavior unchanged
- [x] DOMAIN-MAP: N/A
- [x] SECTION-READINESS: N/A
- [x] No чужой WIP staged; conflict keys respected

## Gates

- [x] `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` — PASS
- [x] `nx build features` — PASS
- [x] focused registries page/routes/a11y tests — PASS (27 passed, 1 skipped)
- [x] `nx lint features` — baseline FAIL from existing intra-library boundary violations and warnings
- [x] final `pnpm exec nx build kppdf-web` — PASS; existing Angular and bundle/style budget warnings only

## Executor report

- Moved `RegistriesPageFacade` and scroll helper into `libs/features/src/lib/registries-platform/`.
- Exported facade/helper through `@kppdf/features/registries-platform`.
- Kept `/registries` page, routes, catalog and all `data/*.registry.ts` files in app.
- Preserved page-local provider and all existing URL/expand/count/scroll behavior.

## Closeout

- [x] archive + remove `_active`
- [x] Status = DONE
- closed_at: 2026-09-15T13:15:00Z

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: freebuff
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: BASELINE FAIL (pre-existing)
  - checklist: ADDED
  - progress.md: N/A (refactor-only)
  - status synchronization: PASS
