# TZ-VERIFY-FIX-2026-09-15-ORDER-WORKSPACE checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-09/TZ-VERIFY-FIX-2026-09-15-ORDER-WORKSPACE.done.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-15T16:48:17Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI in this environment)

## Preflight

- [x] `_active/` пуст перед claim
- [x] SHA ancestry verified (7/7 OK)
- [x] Archive `.done.md` files verified (7/7 present)
- [x] Baseline `nx build kppdf-web` — see Gates

## AC checklist

- [x] All gates in п.3 PASS: kppdf-web tests (order-detail/orders-list/home), features tests (order-workspace/order-hub-tray), data-access tests (pi-orders), nx build kppdf-web, backend tsc+tests (order), architecture:check
- [x] `nx build kppdf-web` PASS last
- [x] Live smoke attempted; PASS (API-level, 17/17) + honest WARN (DOM/browser level — no Playwright in env)
- [x] Audit `docs/audits/2026-09-15-order-workspace-verify.md` with verdict
- [x] `_active` empty after archive
- [x] PO report: one-line verdict + what to eyeball on `/orders/:id`

## Gates (факт)

- data-access tests: 25/25 suites, 136/136 tests PASS (+2 new: `cancel()`, `setLineReady()`)
- features tests: 52/52 suites, 455/455 tests PASS
- kppdf-web tests (scope: order-detail/orders-list/home.page): all PASS individually within full run
- kppdf-web tests (whole app, informational): 79/80 suites, 564/573 tests — 1 suite fails (`app-shell.component.spec.ts`, out-of-scope regression from concurrent `WAVE-NX-HOME` commit `33e06c08`, not touched — see audit)
- `nx build kppdf-web`: PASS (ran LAST)
- backend tsc (`tsconfig.build.json --noEmit`): PASS, 0 errors
- backend tests (`--testPathPattern=order`): 4/4 suites, 132/132 tests PASS
- `pnpm architecture:check`: PASS (1571 files, baseline 17, resolved since baseline: 2)
- lint data-access: 0 errors (1 pre-existing unrelated warning)
- lint kppdf-web: 83 pre-existing errors, all from one unrelated `@nx/enforce-module-boundaries` trigger (commit `6495bc54`, registries area) — out of scope, not touched
- lint backend: 0 errors, 202 pre-existing warnings
- Live smoke `scripts/tz-verify-order-workspace-smoke.mjs` vs local stand: **17 PASS · 0 FAIL · 0 WARN**

Full detail + evidence: `docs/audits/2026-09-15-order-workspace-verify.md`.

## Executor report

Bugs found + fixed (in scope):
1. `PiOrdersService.ship()` return type lied (`Order` vs actual backend
   `{order, shipmentId}`) — fixed `order.types.ts` (new `ShipResult`),
   `pi-orders.service.ts`, and the one affected spec mock
   (`order-detail.page.spec.ts`). Verified no active runtime bug (all 3
   callers only check `.ok`), so this was a latent type-safety fix.
2. Missing HTTP-level test coverage for `cancel()`/`setLineReady()` in
   `pi-orders.service.spec.ts` — added 2 tests.
3. Smoke script bugs (not product bugs): wrong `ship()` response assertion,
   and a disposable-counterparty-with-fixed-INN fixture strategy that hit
   soft-delete-doesn't-clear-unique-index — rewrote to reuse-first pattern
   matching `scripts/smoke/supply-smoke.mjs`.

Found but explicitly NOT fixed (out of scope, documented in audit):
`app-shell.component.spec.ts` chip-count regression from concurrent
`WAVE-NX-HOME` work; `kppdf-web:lint` 83 errors from a pre-existing
registries-area lazy-load lint trigger. Neither touches order-workspace
conflict keys; fixing either risks stepping on another wave's scope.

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15T17:15:00Z
