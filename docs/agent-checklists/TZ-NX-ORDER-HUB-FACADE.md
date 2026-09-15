# TZ-NX-ORDER-HUB-FACADE checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-ORDER-HUB-FACADE.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-15T03:20:09Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI configured in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто до claim (Stream A archived)
- [x] TZ / канон / deps прочитаны (`TZ-NX-ORDER-HUB-FACADE.md`, depends on A4 archived `01c2b46f`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-ORDER-HUB-FACADE.md` на месте

## What changed

Created `order-hub.facade.ts` (`@Injectable()`, component-scoped via
`providers: [OrderHubFacade]`, not root). Moved from `order-hub-tray.component.ts`
**as-is** every domain signal and API-touching method: composition
(`compositionExpanded/Loading/Roots/SelectedId`, `toggleComposition`,
`onCompositionSelect`, `loadComposition`, `openKitReserveConfirm`), supply
(`supplyLoading/Error/Counters`, `loadSupply`), reservations
(`reservationLoading/Error/Counters`, `loadReservations`), shipments
(`shipmentsLoading/Error`, `shipments`, `loadShipments`, `activeShipment`,
`hasShipment`, `shipmentNumber/DateLabel/HasDocs/Cancellable`,
`cancelActiveShipment`, `canMarkShipped`, `openShipConfirm`).

Since `order` is an `input.required<Order>()` on the component (not
available at facade-construction time — Angular sets inputs after the
constructor completes), used the same `bind()`-host pattern already
established by `GanttBarsFacade` (A1): `OrderHubFacadeHost { order: Signal<Order> }`,
wired via `this.facade.bind({ order: this.order })` in the component
constructor (passing the signal *reference*, not its value — safe before
inputs resolve, since it's only *invoked* later). `ngOnInit()` calls
`this.facade.init()` (same three loads, same lazy-composition-on-toggle
timing as before).

Kept on the component (pure presentation, no injected deps, not
"domain signals" or API calls per the TZ's own scope): `trackItem`,
`lineLabel`, `readinessLabel`. Every template-bound handler stayed as a
same-named one-line delegate to `this.facade.xxx(...)` (matches the A1/A3
convention); every facade-owned signal re-exported via a readonly alias.
Dialogs (`KitReserveConfirmDialogComponent`, `ShipConfirmDialogComponent`)
stayed in place, opened from the facade (TZ explicitly allows "same folder
OK in-place"). Selector `app-order-hub-tray` unchanged (TZ said "or current").
Template and styles byte-for-byte unchanged.

Component: 598 → 404 LOC (includes the unchanged ~275-line template+styles
block). New facade: 295 LOC.

## Note — Claim marker process gap (previous TZ)

Disclosed for the record: on the prior TZ (`TZ-NX-PRODUCTION-TO-FEATURES`) I
filled the Claim slot in that checklist but forgot to also write the
`tasks/_active/<ID>.md` marker file — caught only when clearing it after
that TZ's archive. No conflict occurred (single-agent session); this TZ's
marker was created correctly before any code.

## Acceptance

- [x] Specs: `order-hub-tray.component.spec.ts`, `kit-reserve-confirm-dialog.component.spec.ts`, `ship-confirm-dialog.component.spec.ts`, `order-detail.page.spec.ts`
- [x] nx build last 0

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **other** (internal refactor, no route/permission/behavior change)
- [x] FIC §A–E — N/A (no new page/permission/module/MCP surface, mechanical extract only)
- [x] page.md / PAGE-TZ-INDEX — N/A (no UI/route change, tray markup unchanged)
- [x] DOMAIN-MAP — N/A (no module/route/page contour change)
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (staged only: order-hub-tray.component.ts, order-hub.facade.ts (new) + this checklist/tracker/task marker)
- [x] Coupling map — N/A (no shared status/FK field touched; ship/reserve rules unchanged)
- [x] Канон: docs/DOCS-INTEGRITY.md — reviewed, N/A items justified above

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: build green from A4 closure
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` — verified empty before claim
- [x] Закрытие: `nx build kppdf-web` → exit 0, bundle unchanged (503.37 kB, same pre-existing overage — no barrel/eager-import risk here, facade stays in-app)

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS (0 errors)
- `cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern="orders"` → PASS (112/112 suites, 766/773 passed, 7 skipped, 0 failed)
- `npx jest --config apps/kppdf-web/jest.config.ts order-hub-tray.component.spec.ts` → PASS (isolated re-run: 30/30 tests, confirms the AC-named spec explicitly)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0; bundle unchanged at 503.37 kB)

## Executor report

Что сделано: механически вынес все domain-signals и API-методы
`OrderHubTrayComponent` в новый `OrderHubFacade` (composition/supply/
reservations/shipments state, kit-reserve/ship-confirm/cancel-shipment
flows) — без изменения ship/reserve бизнес-правил, без изменения markup.
Компонент — тонкий host: `input.required<Order>()` + `bind()` в
конструкторе (host-pattern как у `GanttBarsFacade`), `ngOnInit` вызывает
`facade.init()`, все template-bound методы — однострочные делегаты,
все facade-signals — readonly-алиасы.

Conflict disclosure: не относящиеся к этому TZ uncommitted файлы в дереве
(studio/docs/audits/data) не трогал.

Known limits: нет — dialogs остались in-place по прямому разрешению TZ.

## Review handoff

- [x] READY FOR REVIEW — N/A (DoD = gates green, no separate review gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15
