═══════════════════════════════════════════════════════════════
TZ-NX-PROPOSALS-LIST-FACADE: /proposals list → ProposalsListFacade
═══════════════════════════════════════════════════════════════

РОЛЬ: Frontend Architect
ЗАВИСИМОСТИ: DECOMP-B2 archived (или явный старт PO)
**SIZE:** L · **PACK:** DECOMP-B3 · LAYER: 3
PAGES: /proposals
PAGE_DOCS: proposals.page.md (если есть)

CONFLICT KEYS: frontend-nx/apps/kppdf-web/src/app/pages/proposals/proposals-list.page.ts ; frontend-nx/apps/kppdf-web/src/app/pages/proposals/proposals-list.facade.ts

IMPLICIT CONFLICT: nx build kppdf-web

## ИСХОДНОЕ
List + family expand/cache + attach orgs + studio create/open + convert-to-order; dialog `proposal-attach-orgs.dialog.ts` уже отдельно.

## ЧТО ДЕЛАТЬ
1. CREATE `proposals-list.facade.ts` — all list/domain signals + methods as-is; `providers` on page.
2. Page thin; keep attach dialog openers (page or facade).
3. Optional dumb `proposal-row` extract only if zero behavior change.

## НЕ
Legacy workspace port; change convert/studio bridge semantics; touch Studio editor WAVE files.

## AC
- Specs: `proposals-list.page.spec.ts`, `proposal-attach-orgs.dialog.spec.ts`
- nx build last 0

Successor: TZ-NX-PROPOSALS-TO-FEATURES
