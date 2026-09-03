# TZ-NX-SALES-S35-ORDER-DETAIL checklist

> Status: **DONE**
> Marker: archived at `tasks/_archive/2026-09/TZ-NX-SALES-S35-ORDER-DETAIL.done.md`
> Commit/push: S35 handoff pushed from the continuous `main` checkout.

## Claim slot

- agent_id: `claude`
- claimed_at: `2026-09-03T08:05:00+03:00`
- workspace: `D:\kppdf-8.0`
- team_room_claim: `unavailable` (no team-room CLI in executor)

## Preflight

- [x] Get-Location + git rev-parse → `D:\kppdf-8.0`
- [x] Read `_NOW.md` + `tasks/_active/` — no competing `apps/kppdf-web/src/**` claim
- [x] TZ / sales canon / deps (S31, S33, S34) read
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-SALES-S35-ORDER-DETAIL.md` present

### Preflight Check Output

- **Context read:** S35 TZ, `docs/pages/orders.page.md`, `docs/FEATURE-INTEGRATION-CHECKLIST.md`, `app.routes.ts`, `orders-list.page.ts`, `PiOrdersService`/`order.types.ts`, proposals-list studio-link pattern, `PiToastService`, `PiStatusBannerComponent`, `route-paths` collector.
- **Key Constraints:** route `/orders/:id`; read GET /orders/:id; paid toggle PATCH `{ isPaid }`; «Без КП» text without stub CTA; **never** call `/stub-proposal`; «КП в студии» button per proposals pattern (studio query), no stub creation; list gains detail link.
- **Planned Deliverable:** order-detail page/spec, route children, shared status labels, list link, docs sync, gates, archive/push.
- **Validation Path:** focused Jest (detail + list + route-paths), frontend tsc/lint, final `nx build kppdf-web`, FIC §A and Integrity slot.

## Acceptance

- [x] Card reads `GET /orders/:id` (via `PiOrdersService.getById`).
- [x] Route `/orders/:id` renders the detail page; `/orders` list keeps working.
- [x] Shows number, Russian status banner, counterparty/site meta when populated, items (name × qty), quotation chip or «Без КП».
- [x] Paid toggle sends PATCH `{ isPaid }`; failure → toast + control re-asserted, UI does not lie.
- [x] `quotationId` present → «КП в студии» button (studio query per proposals pattern); no stub-proposal call.
- [x] No `stub-proposal` string in the template; no stub CTA when quotation absent (spec asserts both).
- [x] S34 list rows gain a `Карточка` detail link (`/orders/:id`).
- [x] `docs/pages/orders.page.md` synchronized (new «NX order detail (S35)» section).
- [x] Frontend typecheck + scoped lint pass.
- [x] Final `nx build kppdf-web` passes (last gate).

## Integrity slot

- [x] Type: page/route.
- [x] FIC §A: route child added under existing `/orders`; no new PAGE_KEY/permission/seed.
- [x] `docs/pages/orders.page.md` updated.
- [x] PAGE-TZ-INDEX: N/A — the file currently carries foreign WIP hunks (another agent's S34–S36/S37 rows); S35 adds no new page key, so no S35 hunk was added there.
- [x] SECTION-READINESS: N/A — no readiness status change.
- [x] Foreign WIP excluded; conflict keys respected.
- [x] COUPLING-MAP: N/A — `Order.isPaid` coupling row already covers list/card (S31); no write semantics changed.
- [x] `docs/DOCS-INTEGRITY.md` applied.

## Build integrity

- [x] Baseline `nx build kppdf-web` passed before the wave.
- [x] No competing active TZ on `apps/kppdf-web/src/**`.
- [x] Closing `nx build kppdf-web` was the last S35 gate and passed (exit 0; existing Angular budget warning only).

## Gates (fact)

- `pnpm exec jest --config apps/kppdf-web/jest.config.ts apps/kppdf-web/src/app/pages/orders/order-detail.page.spec.ts apps/kppdf-web/src/app/pages/orders/orders-list.page.spec.ts apps/kppdf-web/src/app/layout/route-paths.spec.ts --runInBand` → PASS, 3 suites / 16 tests.
- `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS.
- `pnpm exec eslint <7 S35-owned files>` → PASS, 0 errors.
- `pnpm exec nx build kppdf-web` → PASS, exit 0; existing Angular budget/style warnings only; final gate.

## Executor report

S35 adds the `/orders/:id` card (`order-detail.page.ts`), route children under the existing `/orders`, shared Russian status labels (`order-status.ts`), and a `Карточка` link from the S34 list. The card reads `GET /orders/:id`; the paid toggle PATCHes `{ isPaid }` with an optimistic mirror signal and a hard revert (toast + direct control re-assert, because Angular rewrites the checkbox only when the bound value changes). Orders without `quotationId` show plain «Без КП» — no stub CTA, and the template contains no `stub-proposal` string; orders with a quotation get `КП в студии` → `/studio?quotationId=`. PAGE-TZ-INDEX was left untouched because it already carries foreign WIP hunks. Unrelated dirty worktree files were excluded from the S35 commit.

## Closeout

- [x] Archive + lock + live-state sync + remove active marker.
- [x] Status = DONE.
- closed_at: `2026-09-03T08:15:00+03:00`