═══════════════════════════════════════════════════════════════
TZ-NX-SUPPLY-REQUESTS-FACADE: /supply-requests → SupplyRequestsFacade
═══════════════════════════════════════════════════════════════

РОЛЬ: Frontend Architect
ЗАВИСИМОСТИ: TZ-NX-SUPPLY-PAGE-FACADE archived
**SIZE:** L · **PACK:** DECOMP-B2 · LAYER: 3
PAGES: /supply-requests

CONFLICT KEYS: frontend-nx/apps/kppdf-web/src/app/pages/supply-requests/supply-requests.page.ts ; frontend-nx/apps/kppdf-web/src/app/pages/supply-requests/supply-requests.facade.ts

IMPLICIT CONFLICT: nx build kppdf-web

## ИСХОДНОЕ
`supply-requests.page.ts` ~475 LOC · lookups + filters + dialog wiring (form + receive already separate).

## ЧТО ДЕЛАТЬ
1. CREATE `supply-requests.facade.ts` — lookups, filtered list, CRUD/receive/delete orchestration as-is.
2. Page thin; dialogs stay (open from page or facade in-place).
3. No receive/stock side-effect rule changes.

## AC
- Specs: `supply-requests.page.spec.ts`, `supply-request-form-dialog.component.spec.ts`, `supply-request-receive-dialog.component.spec.ts`
- nx build last 0

Successor: TZ-NX-SUPPLY-TO-FEATURES
