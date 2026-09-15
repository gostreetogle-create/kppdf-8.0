# TZ-NX-ORDER-WS-EXECUTION checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-ORDER-WS-EXECUTION.md` (removed on closeout)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-15T16:19:36Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI in this environment)

## Preflight

- [x] `_active/` пуст перед claim
- [x] `order-hub.facade.ts` supply-counters/kit-reserve-dialog pattern + `PiSupplyRequestsService`/`SupplyRequest` type read

## Design notes

See `tasks/_active/TZ-NX-ORDER-WS-EXECUTION.md` — supply counters mirror `order-hub`'s exact counting shape; kit-reserve dialog reused via a **relative** import (`../order-hub/ui/kit-reserve-confirm-dialog.component`, same intra-project boundary rule as TZ3's composition-tree import); deficit derived from already-loaded supply data (no extra HTTP); production readiness uses `items[].readyForWork`, never `OrderItem.status`; both deep-links use the real `Order._id`.

## Acceptance (из TZ)

- [x] Секция Исполнение 2 col (xl) / 1 col mobile: Снабжение (counters, honest empty/error, «Подтвердить материалы» reuse KitReserveConfirmDialog, `/supply?orderId=`) + Дефицит (short-list only if real pending requests) + Производство (plannedDate, готовность X/Y, `/production?orderId=`)
- [x] Facade loads supply on page init (part of `load()`, alongside org name + products)
- [x] Specs: counters + kit button opens dialog path (4 new tests: counters+deficit, empty state, dialog-opens+reloads, readiness+deep-links)
- [x] `nx build kppdf-web` LAST PASS

## Gates (факт)

- `nx test kppdf-web` (567 total, was 563, +4 new tests) — **PASS**, `order-detail.page.spec.ts` all 20 tests. One test needed a fix mid-implementation: pre-configuring `supplyApi.list.mockReturnValue(...)` *before* calling the shared `setup()` helper doesn't work — `setup()` itself reassigns `supplyApi` to a fresh default mock — fixed by reconfiguring the mock *after* `setup()`+`settle()` and calling the real `facade.loadSupply()` again (exercises the actual reload path, not a shortcut). Same 2 unrelated pre-existing `app-shell.component.spec.ts` failures as every TZ this session.
- `nx test data-access` — PASS. `nx test features` — PASS.
- `nx lint kppdf-web` + `nx lint features` — baseline FAIL (pre-existing); zero new issues (proactively used a relative import for the reused `KitReserveConfirmDialogComponent`, avoiding the intra-project-boundary lint error TZ3 had to fix reactively).
- `nx build kppdf-web` — **PASS**, exit 0 on first attempt.

## Executor report

- Reused `order-hub.facade.ts`'s exact `loadSupply()` counting logic (`ordered`/`received`/`total` by `.status`) against `PiSupplyRequestsService.list({orderId})` — same service, same shape, zero new backend surface.
- «Подтвердить материалы» reuses `KitReserveConfirmDialogComponent` verbatim (`data: { order }`), reloading supply counters via the now-public `loadSupply()` on a truthy dialog result — identical pattern to `order-hub`'s `openKitReserveConfirm()`.
- Дефицит short-list is a pure derivation of the supply-requests response already fetched for the counters (`status` in `{requested, in_progress}`) — zero additional HTTP calls, so no per-line `getKitAvailability` fan-out and no invented "всё ОК"/fake shortage.
- Производство: `readyLineCount()`/`totalLineCount()` on the facade compute `items[].readyForWork===true` — matches the documented "Готовность X/Y" formula used elsewhere in this app (`orders.page.md`'s Couplings table), explicitly not `OrderItem.status`.
- Verified `/supply` and `/production` both already read `orderId` from `ActivatedRoute` query params and compare/use it as the Order's `_id` (`supply.facade.ts` line 69-70, `production-cockpit.facade.ts` line 180) — confirms the deep-links are correct before wiring them, per AC's explicit "`_id` orderId" requirement.
- Learned the `setup()`-resets-shared-mocks gotcha the hard way (see Gates) — will pre-empt this in the next TZs by configuring mocks after `setup()` whenever a test needs non-default service behavior.

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15T16:25:44Z

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (via nx build)
  - tests: PASS
  - lint: BASELINE FAIL (pre-existing, zero new issues)
  - checklist: ADDED
  - progress.md: N/A (feature build, reuses existing backend endpoints)
  - status synchronization: PASS
