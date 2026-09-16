═══════════════════════════════════════════════════════════════
TZ-NX-SUPPLY-PAGE-FACADE: /supply page → SupplyFacade
═══════════════════════════════════════════════════════════════

РОЛЬ: Frontend Architect
ЗАВИСИМОСТИ: DECOMP-B1 archived (или PO явно стартовал B2 при пустом _active)
**SIZE:** L · **PACK:** DECOMP-B2 · LAYER: 3
PAGES: /supply
PAGE_DOCS: (supply page if exists)

CONFLICT KEYS: frontend-nx/apps/kppdf-web/src/app/pages/supply/supply.page.ts ; frontend-nx/apps/kppdf-web/src/app/pages/supply/supply.facade.ts

IMPLICIT CONFLICT: nx build kppdf-web

## ИСХОДНОЕ
`supply.page.ts` ~627 LOC: list/filter, inline create, explode-from-order, status transitions, ~8 inject.

## ЧТО ДЕЛАТЬ
1. CREATE `supply.facade.ts` — signals + API methods as-is (`providers` on page).
2. Page thin template; extract inline create block to dumb component **in same folder** (optional in this TZ) OR leave template on page until S3 — prefer extract create form to `supply-create-form.component.ts` dumb Input/Output in this TZ if it shrinks page cleanly.
3. No status label/transition rule changes.

## AC
- Spec: `supply.page.spec.ts` green
- nx build last 0

Successor: TZ-NX-SUPPLY-REQUESTS-FACADE
