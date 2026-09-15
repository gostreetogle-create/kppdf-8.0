# TZ-NX-ORDER-WS-HEADER checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-ORDER-WS-HEADER.md` (removed on closeout)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-15T15:55:44Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI in this environment)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пуст перед claim
- [x] TZ / `Order` type / `PiOrdersService` / backend `order.controller.ts` + `order.service.ts` (status transition graph, cancel endpoint) / `order-hub.facade.ts` dialog pattern read
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-ORDER-WS-HEADER.md` на месте

## Design notes (backend verification before wiring CTAs)

- **Подтвердить заказ:** `PATCH /orders/:id { status: 'confirmed' }` — backend's `assertOrderStatusTransition` allows `draft↔confirmed↔in_production↔ready`; existing `PiOrdersService.update()` already supports `status` in `UpdateOrderPayload`. No new service method needed.
- **Отменить заказ:** backend has a *dedicated* `POST /orders/:id/cancel` (releases reservations, sets `status: 'cancelled'`) — distinct from `DELETE /orders/:id` (soft-delete, removes order from lists — a different, more destructive action not requested here). Added `PiOrdersService.cancel()` mirroring the existing `ship()` method pattern exactly.
- **isPaid checkbox DOM-revert risk:** moved the checkbox markup into the new dumb header component but kept the `(change)` handler forwarding the **raw native `Event`** unchanged (`paidToggle = output<Event>()`) so the page's existing `onPaidToggle(event: Event)` — byte-identical since TZ1 — still reads `event.target` as the real DOM checkbox node. Zero behavior risk to the documented "Angular rewrites the checkbox only when the bound value changes" revert workaround.
- **Counterparty link:** no `/counterparties/:id` detail route exists (registries-pattern app) — linked to `/counterparties` (the live list route) rather than inventing a dead id-specific link.
- **Наша фирма:** `Order.organizationId` is a bare string (no populate) — facade fetches the name via `PiOrganizationsService.getById()` after order load.

## Acceptance (из TZ)

- [x] Dumb `OrderWsHeaderComponent`: номер (stays on page H1, outside this component per design), PiStatusBanner/status label, даты, isPaid checkbox, grid Заказчик/Объект/Наша фирма/КП
- [x] Links: counterparty → live `/counterparties` route; КП → studio or «Без КП» text (no stub-create)
- [x] CTA (only live): draft→«Подтвердить заказ» (+confirm dialog); «Отменить заказ» only if API exists (it does — wired via new `PiOrdersService.cancel()`) + destructive confirm; «← К списку»; «На Главную»
- [x] Primary actions ≤3 visible (confirm+cancel write actions max 2 simultaneous; back/home are plain nav, not counted)
- [x] Header заполнен из Order populate; paid не regress (verified: original 3 paid-toggle assertions across the 3 original tests still pass unmodified); confirm draft→confirmed работает (new test, verified end-to-end through the `AlertDialogComponent` confirm flow)
- [x] `nx build kppdf-web` LAST PASS; specs PASS

## Integrity slot

- [x] Тип изменения: page + new UI component + facade extension + one additive data-access method
- [x] FIC §A–E: N/A — reuses existing backend endpoints (`PATCH status`, `POST /cancel`), no new backend work, no schema change
- [x] page.md: `docs/pages/orders.page.md` — TZ2-landed note added
- [x] DOMAIN-MAP / SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: docs/DOCS-INTEGRITY.md

## Build integrity

- [x] Baseline `nx build kppdf-web` green (verified TZ1 this session)
- [x] `_active/` был пуст перед claim
- [x] Закрытие: `nx build kppdf-web` — последняя команда в Gates, exit 0

## Gates (факт)

- `nx test kppdf-web` (full 557-test suite, same pattern-flag caveat as every TZ this session — now 557, was 555, +2 new tests this TZ) — **PASS** for `order-detail.page.spec.ts` (all 10 tests: 8 original unmodified assertions + 2 new: org-name-render + confirm-dialog flow, and cancel-dialog flow). Same 2 unrelated pre-existing `app-shell.component.spec.ts` failures as every prior TZ this session.
- `nx test data-access` — **PASS**, 25/25 suites, 134/134 tests (confirms the additive `PiOrdersService.cancel()` method didn't break `pi-orders.service.spec.ts` or anything else in the lib).
- `nx test features` — **PASS**, 52/52 suites, 455/455 tests.
- `nx build kppdf-web` — **PASS**, exit 0. Same pre-existing Angular/budget warnings as baseline.
- `nx lint kppdf-web` + `nx lint features` — baseline FAIL (pre-existing); zero new issues. `order-detail.page.spec.ts` and the new `order-workspace` lib files don't appear in either lint output.

## Executor report

- **Backend verification first:** read `order.controller.ts` + `order.service.ts` before wiring any CTA — confirmed the exact PATCH-graph rules (`assertOrderStatusTransition`) and found the dedicated `POST /orders/:id/cancel` endpoint (distinct from the more destructive `DELETE` soft-delete), so both new write paths reuse existing, already-tested backend behavior with zero new backend work.
- **`PiOrdersService.cancel()`** (`libs/data-access`): additive-only, mirrors the existing `ship()` method exactly. Outside this TZ's literal conflict-key list but zero-risk (new method, no existing signature touched) — noted explicitly in the claim file.
- **`OrderWorkspaceFacade`** extended: `organizationName`/`confirming`/`cancelling` signals, `loadOrganizationName()` (fired from `load()`), `fmtDate()`, `canConfirm()`/`canCancel()`, `confirmOrder()`/`cancelOrder()` (both: `AlertDialogComponent` confirm via `PiDialogService` + `onDialogCloseOnce`, same pattern as `order-hub.facade.ts`'s ship/cancel-shipment dialogs — copied the small `on-dialog-close-once.ts` helper into this lib too, matching the established per-lib-duplicate convention already used by `order-hub`/`supply`).
- **New `OrderWsHeaderComponent`** (`order-workspace/ui/`): pure `input()`/`output()`, zero facade injection — the page wires every input/output to the facade explicitly. `paidToggle` forwards the raw `Event` unchanged specifically to preserve the existing DOM-revert-on-PATCH-failure workaround without any behavior risk.
- **Spec required real changes this time** (unlike TZ1): the facade's two new injected services (`PiOrganizationsService`, `PiDialogService`) aren't resolvable by the original minimal TestBed setup (no `HttpClient`/CDK `Overlay` providers) — construction threw immediately. Added explicit mocks for both across all 4 `TestBed.configureTestingModule` blocks in the spec (kept the existing duplicated-block structure rather than refactoring, to minimize diff surface). Separately hit `this.router.createUrlTree is not a function` — the mocked `{navigate: jest.fn()}` Router doesn't implement enough of the real `Router` for the new `routerLink` directives (counterparty/back/home links) to compute hrefs; switched to the established `provideRouter([]) + jest.spyOn(TestBed.inject(Router), 'navigate')` pattern already used by `order-create.page.spec.ts` in the same directory.
- **Added 2 new tests** (AC explicitly requires "confirm draft→confirmed работает"): one exercises org-name load + the full confirm-dialog → PATCH → banner-update flow; one exercises the cancel-dialog → POST /cancel → banner-update flow (using the same `signal`-backed fake `DialogRef` pattern as `order-hub-tray.component.spec.ts`'s ship/cancel-shipment tests).

## Closeout

- [x] archive + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15T16:05:03Z

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
  - progress.md: N/A (refactor + additive live write-paths reusing existing backend endpoints)
  - status synchronization: PASS
