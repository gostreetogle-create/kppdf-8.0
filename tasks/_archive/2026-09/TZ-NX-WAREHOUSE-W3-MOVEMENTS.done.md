# TZ-NX-WAREHOUSE-W3-MOVEMENTS

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: freebuff

## Verification

- acceptance criteria: PASS — journal (date/type/material-product/warehouse/qty/document-order); type + warehouse filters reflected in query state; `+ Приход`/`+ Расход` dialogs (material XOR product, warehouse, positive qty, optional note→documentRef/orderId) posting the existing atomic `POST /stock-movements`; no transfer-create control; successful create reloads the journal, API errors stay visible without closing the dialog.
- focused tests: PASS — `stock-movements.page.spec.ts`, `stock-movement-form-dialog.component.spec.ts`, `pi-stock-movements.service.spec.ts`.
- typecheck: PASS — `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` and `-p libs/data-access/tsconfig.lib.json`.
- lint: PASS on W3-owned changed paths (0 errors/warnings).
- architecture: PASS — `pnpm architecture:check` (root) and `pnpm architecture:check:nx` (0 violations).
- final build: PASS — `cd frontend-nx && pnpm exec nx build kppdf-web`; only the pre-existing unrelated Studio NG8102 / Gantt style-budget warnings.
- broad-suite disclosure: full `nx test kppdf-web` shows exactly one unrelated failing suite, `app-shell.component.spec.ts` (header quick-nav chip count, layout/nav scope — same pre-existing failure already recorded N/A during W2 closeout). Recorded as N/A for W3, not fixed — out of scope, no UI refactor performed.

## Delivered

- `stock-movements.page.ts` — movement journal replacing the W1 placeholder, with type (in/out/adjust/transfer-readonly) and warehouse filters reflected in the route query.
- `stock-movement-form-dialog.component.ts` — focused in/out creation dialog (material XOR product, warehouse, positive qty, optional zone/note/orderId) against the existing atomic `POST /stock-movements`.
- `pi-stock-movements.service.ts` + `stock-movement.types.ts` (`frontend-nx/libs/data-access/src/lib/warehouse/`) — typed HTTP client for the existing StockMovement API surface.
- `docs/pages/stock-movements.page.md` updated with the NX W3 implementation, API, and verification notes.
- Fixed a real defect found during review: `frontend-nx/libs/data-access/src/lib/warehouse/index.ts` had its stock-movement barrel exports duplicated three times over; de-duplicated to one clean set.

## Scope disclosure

- Backend app logic, `/supply`, transfer-create UI, shipping, Gantt, legacy `frontend/`, and W2 balances were not touched.
- No supply-receive auto-wiring, reservation write, or new ledger implementation — reuses the existing atomic `POST /stock-movements` (Z-001) exactly as-is.
- Part of the implementation/tests in this TZ came from a concurrent iteration of the same task sharing this workspace; reviewed in full against the live backend contract before closeout and found correct.

## Commit

- see git log
