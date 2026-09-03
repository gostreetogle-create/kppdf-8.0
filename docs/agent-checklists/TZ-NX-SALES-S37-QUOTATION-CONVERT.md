# TZ-NX-SALES-S37-QUOTATION-CONVERT checklist

> Status: **DONE**
> Marker: archived at `tasks/_archive/2026-09/TZ-NX-SALES-S37-QUOTATION-CONVERT.done.md`
> Commit/push: S37 handoff pushed from the continuous `main` checkout.

## Claim slot

- agent_id: `claude`
- claimed_at: `2026-09-03T08:40:00+03:00`
- workspace: `D:\kppdf-8.0`
- team_room_claim: `unavailable` (no team-room CLI in executor)

## Preflight

- [x] Get-Location + git rev-parse → `D:\kppdf-8.0`
- [x] Read `_NOW.md` + `tasks/_active/` — no competing claim on `pi-quotations.service.ts` / `proposals-list.page.ts`
- [x] TZ / sales canon / deps (S33, S34) read
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-SALES-S37-QUOTATION-CONVERT.md` present

### Preflight Check Output

- **Context read:** S37 TZ, `docs/pages/proposals.page.md`, `docs/pages/orders.page.md`, `PiQuotationsService` + spec, `proposals-list.page.ts` (studio-link pattern), `PiToastService`.
- **Key Constraints:** convert button ONLY for `accepted`; response `{ orderId }`; success → `/orders/:id`; 400 convert → toast, stay; no family API / stub-proposal / convert-to-contract changes.
- **Planned Deliverable:** `convertToOrder` service method + HTTP spec; proposals page button + new page spec; docs sync; gates; archive/push.
- **Validation Path:** focused Jest (service + page), frontend tsc/lint, final `nx build kppdf-web`, FIC §A and Integrity slot.

## Acceptance

- [x] `PiQuotationsService.convertToOrder(id)` POSTs `/quotations/:id/convert-to-order`, typed `{ orderId }`.
- [x] «В заказ» button (`data-test="proposal-convert-order"`) only on `accepted` rows.
- [x] Success → navigate `/orders/:orderId`.
- [x] Failure → toast, stay on the list.
- [x] draft/sent rows have no convert button (spec asserts exactly 1 button across 3 rows).
- [x] `docs/pages/proposals.page.md` synchronized (S37 bullet).
- [x] Frontend typecheck + scoped lint pass (app + data-access).
- [x] Final `nx build kppdf-web` passes (last gate, exit 0).

## Integrity slot

- [x] Type: page action + data-access method.
- [x] FIC: no new route/PAGE_KEY/permission; action on existing page (§A N/A, no new page).
- [x] `docs/pages/proposals.page.md` updated.
- [x] PAGE-TZ-INDEX: N/A — foreign WIP hunks; no new page key.
- [x] SECTION-READINESS: N/A.
- [x] Foreign WIP excluded; conflict keys respected (family API / stub-proposal untouched).
- [x] COUPLING-MAP: N/A — no shared-field write semantics changed.
- [x] `docs/DOCS-INTEGRITY.md` applied.

## Build integrity

- [x] Baseline `nx build kppdf-web` passed before the wave.
- [x] No competing active TZ on `apps/kppdf-web/src/**`.
- [x] Closing `nx build kppdf-web` was the last S37 gate and passed (exit 0).

## Gates (fact)

- `pnpm exec jest --config apps/kppdf-web/jest.config.ts apps/kppdf-web/src/app/pages/proposals/proposals-list.page.spec.ts --runInBand` → PASS, 1 suite / 3 tests.
- `pnpm exec jest --config libs/data-access/jest.config.ts src/lib/sales/pi-quotations.service.spec.ts --runInBand` → PASS, 1 suite / 3 tests.
- `pnpm exec tsc -p libs/data-access/tsconfig.lib.json --noEmit` + `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS.
- Scoped ESLint (service + page + specs) → PASS, 0 errors.
- `pnpm exec nx build kppdf-web` → PASS, exit 0; final gate.

## Executor report

S37 adds `PiQuotationsService.convertToOrder(id)` (`POST /quotations/:id/convert-to-order`, response `{ orderId }`) with an HTTP contract test, and a `В заказ` button on accepted rows of the proposals list. Success navigates to `/orders/:orderId`; failure shows a toast and stays on the list; draft/sent rows render no convert button; a per-row `convertingId` guards double clicks. Family API, stub-proposal, and convert-to-contract untouched; unrelated dirty files excluded from the commit.

## Closeout

- [x] Archive + lock + live-state sync + remove active marker.
- [x] Status = DONE.
- closed_at: `2026-09-03T08:50:00+03:00`