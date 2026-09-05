# TZ-NX-SUPPLY-S2-HUB-CONFIRM checklist — order hub «Подтвердить материалы»

> Status: **DONE**
> Archive: `tasks/_archive/2026-09/TZ-NX-SUPPLY-S2-HUB-CONFIRM.done.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-05T22:41:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI configured in this session)

## Preflight

- [x] `git status`/`tasks/_active/` empty before claim (S1 DONE + archived + pushed)
- [x] TZ read (`tasks/_ready/nx-supply/TZ-NX-SUPPLY-S2-HUB-CONFIRM.md`)
- [x] S0 backend re-read: `backend/src/modules/order/kit-reserve.service.ts` + `order.controller.ts` (`GET/POST /orders/:id/items/:itemIndex/kit-availability|kit-reserve`) for exact request/response shapes
- [x] `frontend-nx/apps/kppdf-web/src/app/pages/orders/order-hub-tray.component.ts` (+ spec) read in full — existing «Снабжение» block, dialog-open convention (`PiDialogService` + `onDialogCloseOnce`) matched from `storage-items.page.ts`

### Preflight Check Output
- **Context read:** S0 archive + `kit-reserve.service.ts`/`order.controller.ts` (exact `KitAvailability`/`KitReserveResult` shapes), `order-hub-tray.component.ts` + spec, `pi-orders.service.ts` + spec (existing sub-resource method convention: `patchEstimateDays` etc.), `pi-dialog.service.ts`/`dialog.types.ts` (DialogConfig/DialogRef), `stock-movement-form-dialog.component.ts` + `storage-items.page.ts`/`storage-dialogs.spec.ts` (dialog-content component + test-mock convention).
- **Key Constraints:** hub-only (no desk-write controls per D2 lock); soft shortage copy (never "блокирует цех"); no OUT stock movement promised; conflict keys `order-hub-tray.component.ts` + new dialog file + `pi-orders.service.ts` (S0 endpoint client) + `docs/pages/orders.page.md`.
- **Planned Deliverable:** `KitReserveConfirmDialogComponent` (new, `pages/orders/`) wired from a new «Подтвердить материалы» button in the tray's «Снабжение» block; `PiOrdersService.getKitAvailability`/`confirmKitReserve` (new methods, since these are `/orders/:id/items/:itemIndex/...` sub-resource routes — same home as `patchEstimateDays`, not a separate "supply" client); on confirm with a result, reload the tray's supply/reservation counters; deep-link "Открыть снабжение" → `/supply?orderId=`.
- **Validation Path:** focused Jest (data-access + dialog + tray) + app typecheck/lint + architecture check + final `nx build kppdf-web`.

**Проверено:** `PiOrdersService` already hosts other `/orders/:id/...` sub-resource methods (`patchEstimateDays`, `patchEstimateStart`, `patchEstimateWorker`) — `getKitAvailability`/`confirmKitReserve` follow the same pattern since the S0 endpoints live on `OrderController`, not a supply controller. The order can have multiple items; the dialog defaults to item 0 and shows a `<select>` line-picker only when `items.length > 1`, reloading availability on change.

---

## Acceptance (из TZ)

- [x] Dialog показывает short vs ok до confirm (per-material need/available/status lines + summary banner).
- [x] После confirm: reserve/supply отражены в ответе API и UI (reserved count, supplyRequestIds count, warnings list, deep-link to `/supply?orderId=` when a SupplyRequest was created).
- [x] `nx build` + tray/dialog tests PASS.

## Integrity slot

- [x] Type: page (tray) + new dialog component + data-access
- [x] No desk dual-write / warehouse movement create / Gantt auto-call touched
- [x] `docs/pages/orders.page.md` — hub tray section updated with the new confirm-materials entry point
- [x] `docs/pages/supply.page.md` — cross-reference note (S2 is the confirm entry point that feeds SupplyRequest, S1 registry stays SupplyTask)
- [x] `docs/agent-checklists/WAVE-NX-SUPPLY.md` / `_NOW.md` — S2 status updated

## Gates (факт)

- [x] Focused Jest — `pi-orders.service.spec.ts` (+2 new: `getKitAvailability`/`confirmKitReserve`, 9/9 total PASS), `kit-reserve-confirm-dialog.component.spec.ts` (7/7 new PASS), `order-hub-tray.component.spec.ts` (+3 new: open dialog / reload on confirm / disabled with no items, 13/13 total PASS)
- [x] `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` — clean
- [x] `cd frontend-nx && pnpm exec tsc -p libs/data-access/tsconfig.lib.json --noEmit` — clean
- [x] Changed-path ESLint — clean (0 errors) on all new/edited S2 files
- [x] `pnpm architecture:check` (1452 files; baseline 17, 2 resolved) + `pnpm architecture:check:nx` (394 files, 0 violations) — both PASS
- [x] Full `nx test data-access` — 21/21 suites, 105/105 tests PASS
- [x] Full `nx test kppdf-web` — only pre-existing known `app-shell.component.spec.ts` failures remain (N/A, unrelated to S2)
- [x] Final `cd frontend-nx && pnpm exec nx build kppdf-web` — PASS (only pre-existing known warnings: Studio NG8102, Gantt CSS budget)

## Executor report

- `PiOrdersService` gained `getKitAvailability(orderId, orderItemIndex)` (`GET /orders/:id/items/:itemIndex/kit-availability`) and `confirmKitReserve(orderId, orderItemIndex)` (`POST /orders/:id/items/:itemIndex/kit-reserve`), typed via new `KitAvailability`/`KitAvailabilityLine`/`KitReserveResult` in `order.types.ts` — mirrors the exact backend `KitReserveService` response shapes.
- New `KitReserveConfirmDialogComponent` (`pages/orders/kit-reserve-confirm-dialog.component.ts` + spec): loads availability for item 0 on open (line-picker `<select>` shown only for multi-item orders, reloads on change), shows per-material need/available/status, a summary line (all-ok vs soft-shortage copy), a Confirm action, and a result view (success `app-pi-status-banner` + `PiToastService.success` toast, reserved count, created-SupplyRequest id list, warnings, "Открыть снабжение" deep-link to `/supply?orderId=` — shown only when a SupplyRequest was actually created).
- `order-hub-tray.component.ts` — added a «Подтвердить материалы» button in the existing «Снабжение» block (disabled when the order has no items), opening the dialog via `PiDialogService` (same convention as `storage-items.page.ts`); on close with a truthy result, reloads the tray's supply + reservation counters so the hub reflects the new reserve/SupplyRequest immediately.
- Copy is soft-shortage throughout ("не блокируется", "будет создана заявка снабжения") — no hard-stop language, per TZ's explicit RU-copy requirement. No OUT stock movement is promised or implemented (successor TZ, matches S0's own scope note).
- Desk dual-write, warehouse movement create, and Gantt start auto-call were not touched.
- Gates all green (see above); no other agents'/TZs' files touched.

## Closeout

- [x] Archive + remove active marker
- [x] Status = DONE
- closed_at: pending (filled at commit)
- commit SHA: pending (filled after commit)
