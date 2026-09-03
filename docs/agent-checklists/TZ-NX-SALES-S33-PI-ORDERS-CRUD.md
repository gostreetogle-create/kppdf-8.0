# TZ-NX-SALES-S33-PI-ORDERS-CRUD checklist

> Status: **DONE**
> Marker: archived at `tasks/_archive/2026-09/TZ-NX-SALES-S33-PI-ORDERS-CRUD.done.md`
> Commit/push: S33 handoff pushed from the continuous `main` checkout.

## Claim slot

- agent_id: `claude`
- claimed_at: `2026-09-03T07:23:00+03:00`
- workspace: `D:\kppdf-8.0`
- team_room_claim: `unavailable` (no team-room CLI in executor)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → `D:\kppdf-8.0`
- [x] Read `_NOW.md` + `tasks/_active/` — no competing sales claim
- [x] TZ / sales canon / dependencies read
- [x] Claim slot filled before code
- [x] Active task marker present before code

### Preflight Check Output

- **Context read:** S33 TZ, `docs/pages/orders.page.md`, existing sales data-access services/specs, backend order DTOs/schema.
- **Key Constraints:** typed thin HTTP client; shared silent helpers; no stub-proposal method; selective staging.
- **Planned Deliverable:** expanded order contract, CRUD methods, HTTP spec, data-access/app gates, archive/push.
- **Validation Path:** focused/full data-access tests, typecheck, lint, final `nx build kppdf-web`, Integrity slot.

## Acceptance

- [x] `Order` exposes status, references, payment fields, and item fields (`productId`, `productName`, `quantity`).
- [x] Create/update payloads match the existing DTO shape and include `siteId`, optional quotation/organization/payment fields.
- [x] `list`, `getById`, `create`, and `update` use the correct HTTP methods/URLs.
- [x] No `stub-proposal` method is added.
- [x] Focused CRUD spec passes.
- [x] Full `nx test data-access --skip-nx-cache` passes: 13 suites / 60 tests.
- [x] Data-access typecheck passes.
- [x] Data-access lint passes: exit 0; existing warning only in `libs/data-access/src/lib/page-acl.ts`.
- [x] Final `nx build kppdf-web` passes: exit 0; existing Angular warnings only.

## Integrity slot

- [x] Type: other (frontend data-access API client).
- [x] FIC §A–E: N/A — no route, permission, backend module, catalog/storage entity, or MCP tool.
- [x] page.md / PAGE-TZ-INDEX: N/A — no route or UI behavior changed.
- [x] SECTION-READINESS: N/A.
- [x] Foreign WIP excluded; only S33-owned paths staged.
- [x] `docs/COUPLING-MAP.md`: N/A — no shared field/status behavior changed.
- [x] `docs/DOCS-INTEGRITY.md` applied.

## Build integrity

- [x] Baseline `nx build kppdf-web` passed before claim.
- [x] No competing active TZ on `apps/kppdf-web/src/**`.
- [x] Closing `nx build kppdf-web` was the last S33 gate and passed.

## Gates (fact)

- `pnpm exec nx test data-access --testPathPattern=pi-orders.service.spec.ts --runInBand --skip-nx-cache` → PASS.
- `pnpm exec nx test data-access --skip-nx-cache` → PASS, 13 suites / 60 tests.
- `pnpm exec tsc -p libs/data-access/tsconfig.lib.json --noEmit` → PASS.
- `pnpm exec nx lint data-access --skip-nx-cache` → PASS, exit 0; pre-existing warning only.
- `pnpm exec nx build kppdf-web` → PASS, exit 0; final gate.

## Executor report

S33 expands the order contract with item/reference/status/payment fields and adds typed `getById`, `create`, and `update` operations using the existing silent HTTP helpers. The stub-proposal endpoint remains intentionally absent. Unrelated dirty worktree files were not staged.

## Closeout

- [x] Archive + lock + live-state sync + remove active marker.
- [x] Status = DONE.
- closed_at: `2026-09-03T07:32:00+03:00`
