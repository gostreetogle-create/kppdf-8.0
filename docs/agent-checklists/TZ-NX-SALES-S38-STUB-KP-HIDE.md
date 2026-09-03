# TZ-NX-SALES-S38-STUB-KP-HIDE checklist

> Status: **DONE**
> Marker: archived at `tasks/_archive/2026-09/TZ-NX-SALES-S38-STUB-KP-HIDE.done.md`
> Commit/push: S38 handoff pushed from the continuous `main` checkout.

## Claim slot

- agent_id: `claude`
- claimed_at: `2026-09-03T08:55:00+03:00`
- workspace: `D:\kppdf-8.0`
- team_room_claim: `unavailable` (no team-room CLI in executor)

## Preflight

- [x] Get-Location + git rev-parse → `D:\kppdf-8.0`
- [x] Read `_NOW.md` + `tasks/_active/` — no competing claim on legacy order-detail / order.controller
- [x] TZ / sales canon / deps (S35) read
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-SALES-S38-STUB-KP-HIDE.md` present

### Preflight Check Output

- **Context read:** S38 TZ, `docs/pages/orders.page.md`, legacy `order-detail.page.ts` + spec, `backend/src/modules/order/order.controller.ts`.
- **Key Constraints:** remove the stub CTA and method from the legacy card; honest copy instead; endpoint stays but deprecated in Swagger; NX already stub-free (S35/S36).
- **Planned Deliverable:** legacy template/method removal + spec rewrite, controller @ApiOperation deprecation, orders.page.md sync, gates, archive/push.
- **Validation Path:** legacy tsc + focused order-detail spec, backend tsc/lint, NX grep, `nx build kppdf-web` N/A.

## Acceptance

- [x] No `order-create-stub-proposal` in the legacy template; replaced by `order-no-stub-proposal` copy «КП не обязателен…».
- [x] `createStubProposal()` method removed from the page; spec asserts the service method is never called.
- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` PASS.
- [x] Focused order-detail spec PASS (14/14).
- [x] Backend controller `@ApiOperation` marked DEPRECATED («не вызывать из UI; канон MASTER-CORE»); backend tsc + eslint PASS.
- [x] NX grep: `stub-proposal` in `frontend-nx/**` only in doc comments («never calls») and negative spec assertions — no endpoint call.
- [x] `docs/pages/orders.page.md` synchronized (S38: no stub CTA, endpoint deprecated).
- [x] `nx build kppdf-web`: N/A — no NX product code touched (docs-only for NX).

## Integrity slot

- [x] Type: legacy UI action removal + backend docs deprecation.
- [x] FIC: no new route/PAGE_KEY/permission; no shared-field change (§F N/A).
- [x] `docs/pages/orders.page.md` updated.
- [x] PAGE-TZ-INDEX: N/A — foreign WIP hunks; no new page key.
- [x] SECTION-READINESS: N/A.
- [x] Foreign WIP excluded; conflict keys respected.
- [x] COUPLING-MAP: N/A — endpoint behaviour unchanged (still idempotent, just deprecated).
- [x] `docs/DOCS-INTEGRITY.md` applied.

## Build integrity

- [x] Baseline: legacy frontend tsc green at wave start (backend unchanged until now).
- [x] No competing active TZ on the touched files.
- [x] Closing gates: legacy tsc + focused spec + backend tsc/lint PASS; `nx build kppdf-web` N/A (no NX product code change).

## Gates (fact)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS.
- `cd frontend && pnpm exec jest --testPathPattern="order-detail" --runInBand` → PASS, 1 suite / 14 tests.
- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → PASS.
- `cd backend && pnpm exec eslint src/modules/order/order.controller.ts` → PASS.
- NX grep for `stub-proposal` → only doc comments + negative spec assertions.

## Executor report

S38 removes the stub-КП UX from the legacy order card: the «Создать черновик КП» button and `createStubProposal()` method are gone, replaced by honest copy («КП не обязателен. Нужен бланк — создайте КП в студии документов.»). The spec's stub block now asserts the button is absent and the service method is never called. The backend endpoint stays for old clients but its Swagger operation is marked DEPRECATED with the MASTER-CORE rationale. NX is already stub-free (S35/S36). Unrelated dirty files excluded from the commit.

## Closeout

- [x] Archive + lock + live-state sync + remove active marker.
- [x] Status = DONE.
- closed_at: `2026-09-03T09:05:00+03:00`