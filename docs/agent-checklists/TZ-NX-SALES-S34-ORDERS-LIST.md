# TZ-NX-SALES-S34-ORDERS-LIST checklist

> Status: **DONE**
> Marker: archived at `tasks/_archive/2026-09/TZ-NX-SALES-S34-ORDERS-LIST.done.md`
> Commit/push: S34 handoff pushed from the continuous `main` checkout.

## Claim slot

- agent_id: `claude`
- claimed_at: `2026-09-03T07:40:00+03:00`
- workspace: `D:\kppdf-8.0`
- team_room_claim: `unavailable` (no team-room CLI in executor)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → `D:\kppdf-8.0`
- [x] Read `_NOW.md` + `tasks/_active/` — no competing `apps/kppdf-web/src/**` claim
- [x] TZ / sales canon / dependencies read
- [x] Claim slot filled before code
- [x] Active task marker present before code

### Preflight Check Output

- **Context read:** S34 TZ, `docs/pages/orders.page.md`, `docs/FEATURE-INTEGRATION-CHECKLIST.md`, app routes/nav, proposals page pattern, PiOrdersService/order types.
- **Key Constraints:** standalone OnPush page; existing data-access service; explicit loading/error/empty states; no legacy edits or HUB/write behavior.
- **Planned Deliverable:** orders route/page/spec, docs/index sync, frontend gates, archive/push.
- **Validation Path:** focused Jest, frontend tsc/lint, final `nx build kppdf-web`, FIC §A and Integrity slot.

## Acceptance

- [x] NX `/orders` route renders the list.
- [x] Existing nav item `Заказы` becomes a live route; no new PAGE_KEY invented.
- [x] `data-test="orders-list"` exists.
- [x] Rows show number, Russian status, payment fact, and `Без КП` when quotation is absent.
- [x] Loading, retryable API error, and empty states are tested.
- [x] Legacy orders page and HUB expand/write behavior remain untouched.
- [x] `docs/pages/orders.page.md` and the S34 hunk in `docs/pages/PAGE-TZ-INDEX.md` are synchronized.
- [x] Frontend app typecheck passes.
- [x] Scoped S34 lint passes; full app lint retains unrelated pre-existing errors outside S34.
- [x] Final `nx build kppdf-web` passes.

## Integrity slot

- [x] Type: page/route.
- [x] FIC §A: route added; nav already present; `PAGE_KEYS.orders` already present; no new permission/seed key.
- [x] `docs/pages/orders.page.md` updated.
- [x] `docs/pages/PAGE-TZ-INDEX.md` updated for the NX route; pre-existing unrelated orders/proposals hunk excluded from the S34 commit.
- [x] SECTION-READINESS: N/A — no readiness status change.
- [x] Foreign WIP excluded; conflict keys respected.
- [x] `docs/COUPLING-MAP.md`: N/A — no shared field/write semantics changed.
- [x] `docs/DOCS-INTEGRITY.md` applied.

## Build integrity

- [x] Baseline `nx build kppdf-web` passed before claim.
- [x] No competing active TZ on `apps/kppdf-web/src/**`.
- [x] Closing `nx build kppdf-web` was the last S34 gate and passed.

## Gates (fact)

- `pnpm exec jest --config apps/kppdf-web/jest.config.ts apps/kppdf-web/src/app/pages/orders/orders-list.page.spec.ts apps/kppdf-web/src/app/layout/app-shell.component.spec.ts apps/kppdf-web/src/app/layout/route-paths.spec.ts --runInBand` → PASS, 3 suites / 22 tests.
- `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS.
- `pnpm exec eslint apps/kppdf-web/src/app/app.routes.ts apps/kppdf-web/src/app/pages/orders/orders-list.page.ts apps/kppdf-web/src/app/pages/orders/orders-list.page.spec.ts apps/kppdf-web/src/app/layout/app-shell.component.spec.ts apps/kppdf-web/src/app/layout/route-paths.spec.ts` → PASS, 0 errors; existing non-null assertion warnings only.
- `pnpm exec nx build kppdf-web` → PASS, exit 0; existing Angular budget/style warnings only; final gate.
- Full `nx test kppdf-web` / `nx lint kppdf-web` baseline checks expose unrelated pre-existing registry/studio failures and lint errors; no S34-owned failure.

## Executor report

S34 adds the authenticated NX `/orders` list route and a read-only OnPush page backed by `PiOrdersService.list()`. It renders explicit loading, retryable error, empty, Russian status, payment, and direct-order states. No detail link, order write, legacy page, HUB behavior, or new permission was added. Unrelated dirty worktree files and unrelated pre-existing page-index hunks were excluded from the S34 commit.

## Closeout

- [x] Archive + lock + live-state sync + remove active marker.
- [x] Status = DONE.
- closed_at: `2026-09-03T07:55:00+03:00`
