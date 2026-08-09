# TZ-SALES-328 checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-SALES-328.md`
> Commit/push: **6143447f** landed on `origin/main`; closeout waits for visual PASS

## Claim slot

- agent_id: `agent-6c3d05b80e`
- claimed_at: `2026-08-09T13:11:11Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable — Team Room registry reports unknown task

## Acceptance

- [x] Responsive two-column md PiShowcaseCard grid with photo/placeholder and equal-height cards.
- [x] Search, category filter, and API-backed page/limit pagination update list params.
- [x] Add emits a draft line and keeps the flyout open.
- [x] Edit reuses ProductFormDialog; Create reuses QuickCreateDialog; successful saves reload the current page.
- [x] Existing 326 outside-dismiss and fixed A4 rails/center geometry remain unchanged.

## Gates (факт)

- [x] `frontend/pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS
- [x] focused rail Jest — **4/4 PASS**
- [x] existing proposal-create Jest — **11/11 PASS**
- [x] `git diff --check` — PASS

## Executor report

- **Status:** READY FOR REVIEW
- **Canonical implementation:** `6143447f`
- **Changed:** product rail now renders `PiShowcaseCard md` with `photoListUrl` media/placeholder, RU loading/empty states, debounced search, product category filter, API-backed 12-item pagination, Add-and-continue, and existing QuickCreate/ProductForm dialogs.
- **Scope guard:** no backend, document-template service, DOC-343 WIP, 325 bind, 322/320, BuilderCanvas, or deploy changes.

## Review handoff

- [x] READY FOR REVIEW after gates
- [ ] Visual PASS required: shop-like md cards, photos/placeholders, equal row heights, filters/pager, Add/Edit/Create, Add keeps flyout open, and no A4 compression.

## Closeout

- [ ] archive + lock + progress + remove `_active`
- [ ] Status = DONE
- closed_at: pending Cursor/PO visual PASS
