# TZ-NX-ORDER-HUB-FACADE: Extract OrderHubFacade in-place

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS (2/2)
  - typecheck: PASS
  - tests: PASS (kppdf-web orders-pattern run 112/112 suites, 766/773, 7 skipped, 0 failed; order-hub-tray.component.spec.ts re-verified in isolation 30/30)
  - nx build kppdf-web: PASS (last gate, exit 0, bundle unchanged 503.37 kB)
  - checklist: docs/agent-checklists/TZ-NX-ORDER-HUB-FACADE.md
  - commit: 8261af25
  - status synchronization: PASS (tracker + _NOW.md updated)

## Root cause

`order-hub-tray.component.ts` (~599 LOC) owned ~9 injected API services plus
all composition/supply/reservations/shipments domain state directly on the
component — same god-component pattern as A1/A3's Gantt/Cockpit files.

## Fix

Mechanical extract, no behavior change: created `order-hub.facade.ts`
(`@Injectable()`, component-scoped) holding every domain signal and
API-touching method verbatim. Since the component's `order` is an
`input.required<Order>()` (unavailable at facade-construction time), used
the `bind()`-host pattern already established by `GanttBarsFacade` (A1) —
the component's constructor calls `this.facade.bind({ order: this.order })`,
passing the signal reference itself (safe pre-input-resolution since it's
only invoked later, inside `ngOnInit`'s `facade.init()` and the delegate
methods). Template, selector (`app-order-hub-tray`), and the two dialogs
(kept in-place, per the TZ's explicit allowance) are unchanged.

## Files changed

- `frontend-nx/apps/kppdf-web/src/app/pages/orders/order-hub-tray.component.ts` (598 → 404 LOC, thin host)
- `frontend-nx/apps/kppdf-web/src/app/pages/orders/order-hub.facade.ts` (new, 295 LOC)
- `docs/agent-checklists/TZ-NX-ORDER-HUB-FACADE.md` (new)

## Successor

`TZ-NX-ORDER-HUB-UI-FEATURES` (B2, final TZ of the DECOMP-B1 wave).
