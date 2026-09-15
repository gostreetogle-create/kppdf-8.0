# TZ-NX-REGISTRIES-PAGE-FACADE checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-REGISTRIES-PAGE-FACADE.md` (removed on closeout)

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-15T13:05:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Preflight Check Output

- **Context:** B9 WAVE-MAP and both registries page TZs read; types already live in `@kppdf/features/registries-platform`; registry detail panel already moved in `d83d0cd2`.
- **Conflict guard:** `_active/` was empty before claim. Excluded `counterparties/**`, `studio-list`, `order-hub`, registry-forms internals, and wholesale `pages/registries/data/**` moves.
- **Delivered:** Signals facade owns registry key, unknown state, master rows/grouping, count loading, navigation, and scroll restoration; page retains templates and local providers.
- **Final gate:** `nx build kppdf-web` PASS.

## Acceptance

- [x] `RegistriesPageFacade` extracted with Signals.
- [x] Page is thin and provides facade locally, not root.
- [x] Existing registries specs remain green; `restoreRegistryScrollPosition` contract preserved.
- [x] No wholesale registry data move or forbidden paths touched.

## Integrity slot

- [x] Type: page refactor
- [x] FIC: N/A, no route/API/capability change
- [x] page.md: N/A, behavior unchanged
- [x] DOMAIN-MAP: N/A
- [x] SECTION-READINESS: N/A
- [x] No чужой WIP staged; conflict keys respected

## Gates

- [x] `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` — PASS
- [x] focused registries page/routes/a11y tests — PASS (27 passed, 1 skipped)
- [x] `pnpm exec nx lint kppdf-web` — baseline FAIL; existing lazy-boundary/accessibility violations
- [x] final `pnpm exec nx build kppdf-web` — PASS; existing Angular and budget warnings only

## Executor report

- Added page-scoped `RegistriesPageFacade` with Signals and preserved scroll helper export.
- Kept `REGISTRIES_CATALOG` and all `data/*.registry.ts` in app; no wholesale data move.
- Kept `RegistryDetailPanelComponent` in `@kppdf/features/registry-forms` and did not alter its internals.
- Updated page specs/providers to explicitly preserve the page-local facade under component provider overrides.

## Closeout

- [x] archive + remove `_active`
- [x] Status = DONE
- closed_at: 2026-09-15T13:10:00Z

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
