# TZ-SALES-328: Create КП — shop-витрина изделий

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md
Аудит: `docs/audits/2026-08-09-kp-create-product-vitrine.md`
LAYER: 3

CONFLICT KEYS: frontend/src/app/pages/commercial/proposals/proposal-product-rail.component.ts; frontend/src/app/pages/commercial/proposals/proposal-product-rail.component.spec.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts; docs/pages/proposals-create.page.md

STATUS: READY FOR REVIEW

Claim slot:
- agent_id: agent-6c3d05b80e
- claimed_at: 2026-08-09T13:11:11Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable — Team Room registry reports unknown task

Implementation:
- canonical commit: `6143447f`
- `PiShowcaseCard md` grid uses `photoListUrl` thumbnails or the shared empty placeholder
- search is debounced; category uses `CategoriesService.list('product')`; pagination sends `page` + `limit: 12`
- Add emits the existing in-memory `ProposalDraftLine` and does not close the flyout
- Edit/Create reuse `ProductFormDialogComponent` / `QuickCreateDialogComponent`; successful close reloads the current page

Gates:
- frontend tsc PASS
- focused rail Jest 4/4 PASS
- proposal-create Jest 11/11 PASS
- diff-check PASS

Scope guard:
- no backend or document-template files
- foreign DOC-343 dirty orientation WIP preserved and excluded
- 325 bind, 322, 320, BuilderCanvas, and deploy untouched

NEXT: Cursor/PO visual PASS, then archive/lock/remove `_active` and closeout commit.
