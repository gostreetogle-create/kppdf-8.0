# TZ-NX-WAREHOUSE-W2-BALANCES checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-WAREHOUSE-W2-BALANCES.md` (removed after archive)

## Claim slot

- agent_id: `freebuff`
- claimed_at: `2026-09-05T19:44:56+03:00`
- workspace: `D:\\kppdf-8.0`
- team_room_claim: `unavailable` — `team-room` / `teamroom` CLI not installed

## Preflight

- [x] `pwd` + `git rev-parse --show-toplevel` → `D:/kppdf-8.0`
- [x] `_NOW.md` + `tasks/_active/` checked; W1 archived and no foreign conflicting claim
- [x] W2 TZ, warehouse audit, W1 implementation, legacy storage page/service/dialogs read
- [x] Claim slot filled before product code
- [x] Baseline: `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS, exit 0

### Preflight Check Output

- **Context read:** `GEMINI.md`, `docs/how-to-connect-ai.md`, `docs/PROJECT-MEMORY.md`, `docs/PO-CANON.md`, `docs/CONTEXT.md`, `docs/agent-checklists/_NOW.md`, W2 TZ/checklist, warehouse audit/wave/slots, `docs/pages/storage-items.page.md`, W1 NX warehouse page/client/tests, legacy StorageItem page/client/dialogs/tests, live backend StorageItem controller/service/schema/DTOs, NX `SilentResult`/catalog/dialog conventions.
- **Key Constraints:** Executor claim is retained; W2 owns balances only; `StorageItem` remains quantity SoT; use existing `POST /materials/:materialId/storage-items` and `POST /storage-items/:id/adjust`; no backend, `/supply`, legacy `frontend/`, desktop, reservation, transfer, W1 route/nav, or W3 movement UI changes.
- **Planned Deliverable:** finish the handed-off balances page/client; add explicit balance columns and filters; finish material put-on-stock and signed adjustment dialogs; add focused API/page/dialog regression coverage; update page contract and run gates.
- **Validation Path:** FIC §D and existing W1 route integrity; focused Jest; NX app typecheck/lint; NX architecture check; `git diff --check`; final `cd frontend-nx && pnpm exec nx build kppdf-web` last.

## Acceptance

- [x] StorageItem list shows material/product, warehouse, quantity, reserved, minimum, and zone.
- [x] Warehouse filter and low-stock filter work. Low-stock is inclusive (`quantity <= minQuantity`) in the page, matching the W2 requirement even though the current backend query expression is strict `<`.
- [x] `?materialId=` query prefilter is applied and the material label is resolved through the catalog API.
- [x] Put-on-stock and adjust actions use existing API shapes; the unfiltered put action includes a material selector and the deep-linked material is preselected.
- [x] Negative adjustment reduces displayed quantity in focused coverage; the returned StorageItem is merged immediately into the current list.
- [x] Focused tests pass; final build remains the closing gate.

## Integrity slot

- [x] Type: page + data-access.
- [x] FIC §D completed: quantity SoT remains `StorageItem` / stock movements; no `Material.stockQty` write or duplicate ledger path was introduced.
- [x] `docs/pages/storage-items.page.md` updated with NX W2 implementation, API, state, and verification notes.
- [x] `SECTION-READINESS` N/A — W2 is a partial warehouse wave and makes no new full-section readiness claim.
- [x] W1 route/nav remains stable; W3 movement create remains untouched.
- [x] Foreign WIP excluded from the W2 commit; only W2 paths will be staged by name.
- [x] `docs/COUPLING-MAP.md` N/A — no shared field/status meaning changed.
- [x] `DOMAIN-MAP` / route inventory N/A for W2 — the route and navigation contour were introduced and documented by W1; W2 replaces the existing route leaf in place.

## Build integrity

- [x] Baseline build before code: PASS.
- [x] No other active `kppdf-web` claim at W2 start.
- [x] Closing `nx build kppdf-web` is the last W2 gate — PASS, exit 0; known pre-existing Studio NG8102 and Gantt style-budget warnings only.

## Gates

- [x] Focused Jest — 3 suites / 11 tests passed (`storage-items.page.spec.ts`, `storage-dialogs.spec.ts`, `pi-storage-items.service.spec.ts`).
- [x] Frontend typecheck — `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` passed.
- [x] W2-owned ESLint — `cd frontend-nx && pnpm exec eslint` on all W2 code/spec paths passed with 0 errors/warnings after cleanup.
- [x] `git diff --check` on W2 paths passed.
- [x] NX architecture check — `pnpm architecture:check:nx` PASS (387 source files, 0 violations); root `pnpm architecture:check` also re-verified PASS (1445 files; baseline 17, 2 resolved) at closeout.
- [x] Broad `kppdf-web` test/lint results reviewed as N/A for W2: `app-shell.component.spec.ts` fails 2/15 tests on an unrelated header quick-nav chip count (6→7, layout/nav scope, not `storage-items`/warehouse); re-confirmed at closeout, still the only failing suite (`nx test kppdf-web` full run: 1 failed / 84 passed suites, 2 failed / 539 passed / 7 skipped tests). W2's own three suites (`storage-items.page.spec.ts`, `storage-dialogs.spec.ts`, `pi-storage-items.service.spec.ts`) all pass. Evidence, not fixed — out of W2 scope, no UI refactor performed.
- [x] Final `cd frontend-nx && pnpm exec nx build kppdf-web` — PASS, exit 0 (last command run); `storage-items-page` chunk built; only the same two pre-existing unrelated warnings (Studio NG8102 nullish-coalescing, Gantt style-budget).

## Executor report (auto)

- W2 implementation completed from the handed-off uncommitted WIP without rebuilding W1.
- Added the live balances table, warehouse/material/low-stock filters, material deep-link label, put-on-stock selector/form, signed adjustment form, and immediate returned-row merge.
- Added focused HTTP/page/dialog regression coverage for API shapes, `materialId`, inclusive low stock, visible balance columns, put-on-stock, and negative adjustment.
- Verification so far: focused Jest PASS (3 suites / 11 tests); app typecheck PASS; W2-owned ESLint PASS; W2 diff check PASS; NX architecture check PASS.
- Broad app test/lint failures are recorded as N/A for W2 because they are unrelated production/studio and stale app-shell baseline files; W2-owned checks remain green.
- Final W2 gate: `cd frontend-nx && pnpm exec nx build kppdf-web` PASS, exit 0. Known warnings are pre-existing Studio NG8102 and Gantt component style budget.
- Pending closeout: precise W2-only commit/push, archive, and DONE lock.

## Closeout

- [x] Archive + DONE lock + remove active marker
- [x] Status = DONE
- closed_at: 2026-09-05T20:30:00+03:00
- commit SHA: see git log (this checklist + W2 code + archive + lock land in the same commit)
