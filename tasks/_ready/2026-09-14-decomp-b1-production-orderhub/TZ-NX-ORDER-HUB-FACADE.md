═══════════════════════════════════════════════════════════════
TZ-NX-ORDER-HUB-FACADE: Extract OrderHubFacade in-place
═══════════════════════════════════════════════════════════════

РОЛЬ: Frontend Architect
ЗАВИСИМОСТИ: TZ-NX-PRODUCTION-TO-FEATURES archived
**SIZE:** L · **PACK:** DECOMP-B1 · LAYER: 3
PAGES: /orders (detail tray)
PAGE_DOCS: (orders page doc if any)

CONFLICT KEYS: frontend-nx/apps/kppdf-web/src/app/pages/orders/order-hub-tray.component.ts ; frontend-nx/apps/kppdf-web/src/app/pages/orders/order-hub.facade.ts

IMPLICIT CONFLICT: nx build kppdf-web

## ИСХОДНОЕ
`order-hub-tray.component.ts` ~599 LOC · ~9 inject: composition + supply + reservations + shipments + order APIs + template.

## ЧТО ДЕЛАТЬ
1. CREATE `order-hub.facade.ts` — all domain signals + load/ship/reserve/cancel/composition methods as-is.
2. Tray: `providers: [OrderHubFacade]`, thin template, stable selector `pi-order-hub-tray` (or current), signal re-exports for specs.
3. Dialogs kit-reserve / ship-confirm: stay opened from tray or facade (same folder OK in-place).

## НЕ
Change ship/reserve business rules; order-detail page beyond import; production pack.

## AC
- Specs: `order-hub-tray.component.spec.ts`, `kit-reserve-confirm-dialog.component.spec.ts`, `ship-confirm-dialog.component.spec.ts`, `order-detail.page.spec.ts`
- nx build last 0

Successor: `TZ-NX-ORDER-HUB-UI-FEATURES`
