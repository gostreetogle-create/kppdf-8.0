# TZ-NX-SHIPPING-PAGE-FACADE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS (shipping specs green, tsc, build)
  - typecheck: PASS (kppdf-web app tsconfig, clean on first run)
  - tests: PASS (shipping 4/4 suites 19/19; full kppdf-web 92/92 suites, 623/630 passed, 7 skipped, 0 failed)
  - architecture check: PASS (1537 files; baseline 17; 2 resolved since baseline)
  - nx build kppdf-web: PASS (last gate, exit 0, bundle unchanged 503.38 kB)
  - checklist: docs/agent-checklists/TZ-NX-SHIPPING-PAGE-FACADE.md
  - commit: b0ea0aaa
  - status synchronization: PASS (tracker updated)

## Root cause

The TZ asked to extract `shipping.page.ts`'s (453 LOC) domain state into
a `ShippingFacade` in-place. Its original spec text was lost from disk
before being read (environment issue during session resume — see the
checklist's "Source-of-truth disclosure" section); proceeded from
`WAVE-MAP.md`'s goal line, already captured earlier in-session.

## Fix

`ShippingPage` has no `@ViewChild`/`@Input()` — a plain route page
(order filter comes from `route.queryParamMap`) — so `ShippingFacade`'s
constructor safely subscribes to the query params and bootstraps lookups
directly, matching `WarehousesFacade`/`StockMovementsFacade`. Moved every
signal/computed/method as-is; page stays a thin host aliasing every
member under its original name.

## Files changed

- `shipping.page.ts` (453 → 285 LOC)
- New: `shipping.facade.ts` (245 LOC)
- `docs/agent-checklists/TZ-NX-SHIPPING-PAGE-FACADE.md` (new)

## Successor

`TZ-NX-SHIPPING-TO-FEATURES` (S2) — move `ShippingFacade` (+ dialogs if
clean) into `@kppdf/features/shipping`.
