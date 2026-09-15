# TZ-VERIFY-FIX-2026-09-15-ORDER-WORKSPACE — DONE

- **Status:** DONE
- **Agent:** claude
- **Closed:** 2026-09-15
- **Verdict:** VERIFY PASS

## Delivered

- Full gate re-run for the `WAVE-NX-ORDER-WORKSPACE` deliverable: frontend
  (data-access, features, kppdf-web scoped specs), `nx build kppdf-web`,
  backend (tsc + `order`-pattern tests), `pnpm architecture:check`, lint —
  all PASS in scope.
- Live API-level smoke test against a locally-started stand (Mongo +
  backend + frontend-nx): new `scripts/tz-verify-order-workspace-smoke.mjs`
  (modeled on `scripts/smoke/supply-smoke.mjs`), covering the whole
  order-workspace write-path (composition add/qty/ready, confirm, supply
  read, reservations read, ship, cancel). **17 PASS · 0 FAIL · 0 WARN.**
- Real bug fixed: `PiOrdersService.ship()` return type didn't match the
  backend's actual `{ order, shipmentId }` response — added `ShipResult`
  to `order.types.ts`, corrected `pi-orders.service.ts`, updated the one
  affected spec mock.
- Coverage gap fixed: added HTTP-level tests for `cancel()`/
  `setLineReady()` in `pi-orders.service.spec.ts` (25→25 suites,
  134→136 tests).
- Honest environment limit: no Playwright/browser automation available —
  DOM/visual verification of `/orders/:id` was NOT performed and is
  disclosed as WARN, not fabricated as PASS. Local stand left running for
  PO's own visual pass.
- Full evidence + PASS/FAIL/WARN table: `docs/audits/2026-09-15-order-workspace-verify.md`.

## Found but explicitly out of scope (not touched)

- `app-shell.component.spec.ts` — 2 failing tests (chip-count off-by-one),
  caused by concurrent `WAVE-NX-HOME` commit `33e06c08` adding a `home`
  nav category without updating this spec's hardcoded counts. Not an
  order-workspace regression; belongs to `WAVE-NX-HOME`.
- `kppdf-web:lint` — 83 pre-existing errors, all one
  `@nx/enforce-module-boundaries` trigger from a registries-area file
  (commit `6495bc54`), unrelated to order-workspace file contents.

## Gates

- data-access tests: 25/25 suites, 136/136 PASS
- features tests: 52/52 suites, 455/455 PASS
- kppdf-web tests (order-detail/orders-list/home.page scope): PASS
- `nx build kppdf-web`: PASS (ran last)
- backend tsc: PASS, 0 errors
- backend tests (`order` pattern): 4/4 suites, 132/132 PASS
- `pnpm architecture:check`: PASS
- lint data-access / backend: PASS (0 errors; pre-existing unrelated warnings only)
- lint kppdf-web: pre-existing baseline FAIL, zero new issues from this pass
- Live smoke: 17/17 PASS (API-level); DOM/browser level WARN (no tool in env)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: BASELINE FAIL (pre-existing, unrelated, zero new issues)
  - checklist: FILLED
  - progress.md: N/A (verify+fix pass, no new feature)
  - status synchronization: PASS
