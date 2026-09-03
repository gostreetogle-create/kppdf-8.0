# TZ-NX-SALES-S36-ORDER-CREATE checklist

> Status: **DONE**
> Marker: archived at `tasks/_archive/2026-09/TZ-NX-SALES-S36-ORDER-CREATE.done.md`
> Commit/push: S36 handoff pushed from the continuous `main` checkout.

## Claim slot

- agent_id: `claude`
- claimed_at: `2026-09-03T08:20:00+03:00`
- workspace: `D:\kppdf-8.0`
- team_room_claim: `unavailable` (no team-room CLI in executor)

## Preflight

- [x] Get-Location + git rev-parse → `D:\kppdf-8.0`
- [x] Read `_NOW.md` + `tasks/_active/` — no competing `apps/kppdf-web/src/**` claim
- [x] TZ / sales canon / deps (S32 sites, S33 orders CRUD, S34 list) read
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-SALES-S36-ORDER-CREATE.md` present

### Preflight Check Output

- **Context read:** S36 TZ, `docs/pages/orders.page.md`, `PiCounterpartiesService`, `PiProductsService`, `PiOrganizationsService`, `PiSitesService` (S32), `PiOrdersService`/`CreateOrderPayload` (S33), kit select/input usage patterns, `app.routes.ts`.
- **Key Constraints:** direct order without quotation; `siteId` via `ensureDefault`; items = productId + quantity (no unitPrice); optional organization; `status: 'draft'`; success → `/orders/:id`; never `stub-proposal`; failures (no customer / empty items / ensure-default) must not POST.
- **Planned Deliverable:** `order-create.page.ts` + spec, `/orders/create` route (before `:id`), list CTA, docs sync, gates, archive/push.
- **Validation Path:** focused Jest (create + list), frontend tsc/lint, final `nx build kppdf-web`, FIC §A and Integrity slot.

## Acceptance

- [x] CTA «Создать заказ» on the list opens the create page (`/orders/create`).
- [x] Fields: counterparty (required), products with qty (≥1 line), optional our firm, «Оплачен» checkbox.
- [x] No customer → no POST; empty items → no POST (guard in `canSubmit()`/`save()`).
- [x] `ensureDefault(counterpartyId)` → `siteId`; ensure-default failure → banner, order not created.
- [x] `create({ counterpartyId, siteId, items, organizationId?, isPaid?, status: 'draft' })` without `quotationId` (spec asserts exact payload).
- [x] Success → navigate `/orders/:id`.
- [x] Template has no `stub-proposal` (spec asserts HTML and text).
- [x] `docs/pages/orders.page.md` NX section updated («NX order create (S36)»).
- [x] Frontend typecheck + scoped lint pass.
- [x] Final `nx build kppdf-web` passes (last gate, exit 0).

## Integrity slot

- [x] Type: page/route.
- [x] FIC §A: route child under existing `/orders`; no new PAGE_KEY/permission/seed.
- [x] `docs/pages/orders.page.md` updated.
- [x] PAGE-TZ-INDEX: N/A — file carries foreign WIP hunks; no new page key.
- [x] SECTION-READINESS: N/A.
- [x] Foreign WIP excluded; conflict keys respected (`studio-editor.page.ts` untouched).
- [x] COUPLING-MAP: N/A — no shared-field write semantics changed.
- [x] `docs/DOCS-INTEGRITY.md` applied.

## Build integrity

- [x] Baseline `nx build kppdf-web` passed before the wave.
- [x] No competing active TZ on `apps/kppdf-web/src/**`.
- [x] Closing `nx build kppdf-web` was the last S36 gate and passed (exit 0).

## Gates (fact)

- `pnpm exec jest --config apps/kppdf-web/jest.config.ts <create + list + route-paths specs> --runInBand` → PASS, 3 suites / 16 tests.
- `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS.
- `pnpm exec eslint <5 S36-owned files>` → PASS, 0 errors.
- `pnpm exec nx build kppdf-web` → PASS, exit 0; final gate.

## Executor report

S36 adds `/orders/create` (`order-create.page.ts`) with a `Создать заказ` CTA on the S34 list. The form loads counterparties/products/organizations, requires a customer and ≥1 product line, resolves the site via `PiSitesService.ensureDefault` before POST (failure → banner, no order), and creates the direct order with `status: 'draft'` and no `quotationId`, navigating to the card on success. Form submit uses the native `(submit)` event (ngSubmit requires FormsModule). `studio-editor.page.ts` and PAGE-TZ-INDEX (foreign WIP) untouched; unrelated dirty files excluded from the commit.

## Closeout

- [x] Archive + lock + live-state sync + remove active marker.
- [x] Status = DONE.
- closed_at: `2026-09-03T08:35:00+03:00`