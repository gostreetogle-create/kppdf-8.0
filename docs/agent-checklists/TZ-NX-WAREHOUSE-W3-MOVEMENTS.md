# TZ-NX-WAREHOUSE-W3-MOVEMENTS checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-WAREHOUSE-W3-MOVEMENTS.md` (removed after archive)

## Claim slot

- agent_id: `freebuff`
- claimed_at: `2026-09-05T20:30:12+03:00`
- workspace: `D:\\kppdf-8.0`
- team_room_claim: `unavailable` — `team-room` / `teamroom` CLI not installed

## Preflight Check Output

- **Dependency:** W2 is archived and pushed as `f7b9242a`.
- **Context:** W3 TZ, stock-movements page contract, W1 NX route/page placeholder, legacy movement page/service/form/adjust dialog, live backend movement controller/service/schema/DTO, NX catalog/warehouse/dialog conventions read.
- **Scope:** NX `/stock-movements` list plus in/out creation only; movement API is the atomic quantity write path.
- **Guardrails:** no backend, `/supply`, transfer create, shipping, Gantt, legacy `frontend/`, W2 balances, or W1 routes/nav.
- **Validation:** focused W3 Jest, app typecheck, changed-path lint, architecture check, `git diff --check`, final NX build last.

## Acceptance

- [x] Journal lists date, type, material/product, warehouse, quantity, and document/order reference.
- [x] Type and warehouse filters are reflected in query state and reload the list.
- [x] `+ Приход` and `+ Расход` dialogs support material XOR product, warehouse, positive quantity, optional note/orderId/documentRef, and use `POST /stock-movements`.
- [x] No transfer creation control is present.
- [x] Successful in/out creation reloads the journal; API errors remain visible without closing the dialog.
- [x] Focused tests and final build pass.

## Integrity slot

- [x] Type: page + data-access + dialogs.
- [x] `docs/pages/stock-movements.page.md` updated with NX W3 implementation and API/state notes.
- [x] W2 balances page/client remains untouched.
- [x] No backend, supply, transfer, shipping, or desktop changes.

## Gates

- [x] Focused Jest — 3 suites passed (`stock-movements.page.spec.ts`, `stock-movement-form-dialog.component.spec.ts`, `pi-stock-movements.service.spec.ts`).
- [x] Frontend typecheck — `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` and `-p libs/data-access/tsconfig.lib.json` both PASS.
- [x] Changed-path ESLint — W3 code/spec paths pass with 0 errors/warnings.
- [x] `git diff --check` on W3 tracked paths passed.
- [x] NX architecture check — `pnpm architecture:check` (root, 1448 files) PASS; `pnpm architecture:check:nx` (390 source files, 0 violations) PASS.
- [x] Broad `kppdf-web` test run reviewed as N/A for W3: full `nx test kppdf-web` shows exactly one failing suite, `app-shell.component.spec.ts` (2/15 tests, header quick-nav chip count — layout/nav scope, unrelated to `stock-movements`/warehouse; same failure already recorded N/A during W2 closeout). All W3-owned suites pass.
- [x] Final `cd frontend-nx && pnpm exec nx build kppdf-web` — PASS, exit 0 (last command run); only the same two pre-existing unrelated warnings (Studio NG8102, Gantt style-budget).

## Executor report

- Implementation and first pass of tests/docs were already in the working tree (interrupted prior loop) when this closeout started; reviewed in full against the TZ and the live backend `StockMovement` controller/service/DTO — correct field names, correct atomic `POST /stock-movements` contract, exactly one of `materialId`/`productId`, no transfer-create control.
- Found and fixed one real defect during review: `frontend-nx/libs/data-access/src/lib/warehouse/index.ts` had the `stock-movement.types`/`pi-stock-movements.service` barrel exports duplicated three times over — de-duplicated to one clean set of five export lines (mechanical fix, not a design change).
- Wrote initial focused specs for the page/dialog/service myself; a concurrent iteration of the same task (this workspace/board is shared with another live agent loop) subsequently replaced them with an equivalent, slightly more idiomatic version (using `component.form.patchValue()` + direct `submit()` calls instead of simulating DOM events on the `<app-pi-input>` `ControlValueAccessor` wrapper, and renaming the form's internal `documentRef` control to `note` while still posting `documentRef` to the API) — reviewed that version in full and it is correct and gate-clean, so it was kept rather than re-overwritten.
- Verification: focused Jest PASS; app + data-access typecheck PASS; changed-path ESLint PASS; both architecture checks PASS; `git diff --check` PASS; final `nx build kppdf-web` PASS. Full-suite disclosure: only the pre-existing unrelated `app-shell.component.spec.ts` failure, not touched (no UI refactor performed).

## Closeout

- [x] Archive + DONE lock + remove active marker
- [x] Status = DONE
- closed_at: 2026-09-05T21:05:00+03:00
- commit SHA: see git log
