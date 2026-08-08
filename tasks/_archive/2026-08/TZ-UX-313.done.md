# TZ-UX-313 — Catalog detail smart back

**Outcome:** DONE  
**Date:** 2026-08-08  
**Cursor Verdict:** PASS (PO CLAIM + executor)  
**Source:** `tasks/TZ-UX-313-catalog-smart-back.md`

## Delivered

- `CatalogReturnStore` + pure helpers in `frontend/src/app/shared/navigation/catalog-return.util.ts`
  - `previousUrl` via NavigationEnd pair + seed from `lastSuccessfulNavigation.previousNavigation`
  - `navigateBackOr(fallback)` → `Location.back()` or `Router.navigateByUrl`
- Wired `onBack` + dynamic label on product / module / material detail (+ error-state buttons)
- Unit tests: catalog-return.util.spec; module-detail onBack smoke
- Docs: `page-chrome.md` § Возврат; PAGE-TZ-INDEX materials/products/modules

## НЕ

- supply/**, desktop/**, products expand hierarchy (PRODUCTS-307)
- app-layout global ←→, crumb = history
- deploy

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T11:05:00Z
closed_by: agent-3e757640b7
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (frontend tsconfig.app --noEmit)
  - tests: PASS (catalog-return + module-detail + material-detail; 19/19)
  - checklist: UPDATED
  - progress.md: UPDATED
cursor_verdict: PASS
agent_id: agent-3e757640b7
known_limitation: no global shell ←→; deep link → list fallback; no full trail crumbs
