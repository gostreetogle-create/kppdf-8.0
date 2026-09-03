# TZ-NX-SALES-S32-SITES-ENSURE checklist

> Status: **DONE**  
> Marker: archived at `tasks/_archive/2026-09/TZ-NX-SALES-S32-SITES-ENSURE.done.md`  
> Commit/push: S32 handoff pushed from the continuous `main` checkout.

## Claim slot

- agent_id: `claude`
- claimed_at: `2026-09-03T07:16:30+03:00`
- workspace: `D:\kppdf-8.0`
- team_room_claim: `unavailable` (no team-room CLI in executor)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → `D:\kppdf-8.0`
- [x] Read `_NOW.md` + `tasks/_active/` — no competing claim on `frontend-nx/libs/data-access/src/lib/sales/`
- [x] TZ / sales canon / dependencies read
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS before code
- [x] `tasks/_active/TZ-NX-SALES-S32-SITES-ENSURE.md` present before code

### Preflight Check Output

- **Context read:** `tasks/TZ-NX-SALES-S32-SITES-ENSURE.md`, `docs/pages/orders.page.md`, `backend/src/modules/site/site.controller.ts`, `backend/src/modules/site/site.service.ts`, `frontend-nx/libs/data-access/src/lib/sales/pi-quotations.service.ts`, `frontend-nx/libs/data-access/src/lib/sales/pi-quotations.service.spec.ts`.
- **Key Constraints:** typed thin HTTP client; existing `silentGet`/`silentPost`; no backend or UI changes; selective staging.
- **Planned Deliverable:** `Site`/service; sales barrel exports; HTTP testing regression; data-access and app gates; archive/push.
- **Validation Path:** focused Jest, data-access test/lint/typecheck, final `nx build kppdf-web`, Integrity slot.

## Acceptance

- [x] `Site` includes `_id`, `counterpartyId`, `name`, `address`.
- [x] `list(counterpartyId)` GETs `/api/sites?counterpartyId=...`.
- [x] `ensureDefault(counterpartyId)` POSTs `/api/sites/ensure-default` with `{ counterpartyId }`.
- [x] Service/types exported from the sales index.
- [x] Focused HTTPTestingController spec passes.
- [x] `cd frontend-nx && pnpm exec nx test data-access --skip-nx-cache` passes: 12 suites / 56 tests.
- [x] `cd frontend-nx && pnpm exec nx lint data-access --skip-nx-cache` passes: exit 0; one pre-existing warning in `libs/data-access/src/lib/page-acl.ts`.
- [x] `cd frontend-nx && pnpm exec tsc -p libs/data-access/tsconfig.lib.json --noEmit` passes.
- [x] `cd frontend-nx && pnpm exec nx build kppdf-web` passes last: exit 0; existing Angular warnings only.

## Integrity slot

- [x] Type: other (frontend data-access API client).
- [x] FIC §A–E: N/A — no route, permission, backend module, catalog/storage entity, or MCP tool.
- [x] page.md / PAGE-TZ-INDEX: N/A — no UI route or page behavior changed.
- [x] SECTION-READINESS: N/A.
- [x] Foreign WIP excluded; only the S32 conflict key was staged.
- [x] `docs/COUPLING-MAP.md`: N/A — no shared field/status semantics changed.
- [x] Canon: `docs/DOCS-INTEGRITY.md` applied.

## Build integrity

- [x] Baseline `cd frontend-nx && pnpm exec nx build kppdf-web` passed before claim.
- [x] No competing active TZ on `apps/kppdf-web/src/**`.
- [x] Closing `nx build kppdf-web` was the last S32 gate and passed.

## Gates (fact)

- `pnpm exec nx test data-access --testPathPattern=pi-sites.service.spec.ts --runInBand --skip-nx-cache` → PASS.
- `pnpm exec nx test data-access --skip-nx-cache` → PASS, 12 suites / 56 tests.
- `pnpm exec nx lint data-access --skip-nx-cache` → PASS, exit 0; existing warning only.
- `pnpm exec tsc -p libs/data-access/tsconfig.lib.json --noEmit` → PASS.
- `pnpm exec nx build kppdf-web` → PASS, exit 0; final gate.

## Executor report

S32 adds the typed `PiSitesService` list and ensure-default calls, `Site` contract, sales barrel exports, and HTTPTestingController coverage. Existing backend site endpoints are reused unchanged. Unrelated dirty worktree files were not staged.

## Closeout

- [x] Archive + lock + progress/live-state sync + remove active marker.
- [x] Status = DONE.
- closed_at: `2026-09-03T07:20:00+03:00`
