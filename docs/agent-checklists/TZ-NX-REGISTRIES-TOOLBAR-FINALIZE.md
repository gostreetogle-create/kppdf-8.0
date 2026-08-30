# TZ-NX-REGISTRIES-TOOLBAR-FINALIZE checklist

> Status: **DONE**

## Claim slot

- agent_id: cursor
- claimed_at: 2026-08-29T22:48:00+03:00
- closed_at: 2026-08-29T22:52:00+03:00

## Acceptance

- [x] Pagination always visible in toolbar right when total > 0 (including single page)
- [x] Filters left only when API supports; modules — no invented filters, neutral left placeholder
- [x] Create button stays in trailing area; layout intact
- [x] server/client/fixture pagination modes unchanged
- [x] URL query state + page reset on filter unchanged
- [x] No table footer pagination
- [x] Tests: total <= pageSize, modules no filter params, toolbar areas, create layout, a11y
- [x] Gates PASS
- [x] Archive to `tasks/_archive/2026-08/TZ-NX-REGISTRIES-TOOLBAR-FINALIZE.done.md`

## Integrity slot

- [x] `docs/pages/registries.page.md` updated
- [x] No backend/libs/ui/shell changes

## Executor report

Toolbar finalize: pagination visible for single-page sets; `registry-toolbar-filters-empty` for filter-less registries (modules). All 6 registries verified via definition + integration tests. Archive: `tasks/_archive/2026-08/TZ-NX-REGISTRIES-TOOLBAR-FINALIZE.done.md`.
