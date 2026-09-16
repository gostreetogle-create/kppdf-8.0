═══════════════════════════════════════════════════════════════
TZ-NX-ORDER-HUB-UI-FEATURES: Order hub UI + facade → features
═══════════════════════════════════════════════════════════════

РОЛЬ: Frontend Architect
ЗАВИСИМОСТИ: TZ-NX-ORDER-HUB-FACADE archived
**SIZE:** S · **PACK:** DECOMP-B1 · LAYER: 3
PAGES: /orders

CONFLICT KEYS: frontend-nx/libs/features/src/lib/order-hub/** ; frontend-nx/tsconfig.base.json ; frontend-nx/apps/kppdf-web/src/app/pages/orders/order-hub-tray.component.ts ; frontend-nx/apps/kppdf-web/src/app/pages/orders/order-hub.facade.ts ; frontend-nx/apps/kppdf-web/src/app/pages/orders/order-detail.page.ts

IMPLICIT CONFLICT: nx build kppdf-web

## ЧТО ДЕЛАТЬ
1. `@kppdf/features/order-hub` — move facade + tray UI + tray-local dialogs + specs.
2. App may keep thin re-export component file **or** detail page imports from features directly (prefer features import; delete empty app tray file).
3. No apps/ imports from features.

## AC
- Order hub specs + order-detail green
- nx build last 0
- B1 WAVE Status all DONE

Successor: Block 2 pack (supply-warehouse)
