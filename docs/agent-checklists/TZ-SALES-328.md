# TZ-SALES-328 checklist

> Status: **DONE**
> Marker: `tasks/_archive/2026-08/TZ-SALES-328.done.md`
> Closeout: `6143447f` + `1e40e518` + `3b11f89c`

## Claim slot

- agent_id: `agent-6c3d05b80e`
- claimed_at: `2026-08-09T13:11:11Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable — Team Room registry reports unknown task

## Preflight

- [x] Canonical main was synced at claim; TZ-SALES-325 is archived DONE with Cursor/PO visual PASS.
- [x] 326/327 acceptance and PiShowcaseCard md contract read.
- [x] TZ-SALES-328, product-vitrine audit, Spec §0, GEMINI, AI-Agent Guide, and PO-DIARY §1–§4 read.
- [x] Active-map and active markers scanned; DOC-TABLES-305 has no overlapping keys.
- [x] Claim marker exists before code; foreign DOC-343 backend/docs WIP is excluded.

## Acceptance

- [x] Responsive md PiShowcaseCard grid with photo/placeholder and equal-height cards.
- [x] Search, category filter, and API-backed page/limit pagination update list params.
- [x] Add emits a draft line and keeps the flyout open.
- [x] Edit reuses ProductFormDialog; Create reuses QuickCreateDialog; successful saves reload the current page.
- [x] Existing 326 outside-dismiss and fixed A4 rails/center geometry remain unchanged.
- [x] Final visual: md cards in exactly three columns in the 58rem products flyout; narrower fallbacks preserve layout.

## Gates (факт)

- [x] `frontend/pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS
- [x] `frontend/pnpm exec jest --config jest.config.js --runInBand src/app/pages/commercial/proposals/proposal-product-rail.component.spec.ts` — **4/4 PASS**
- [x] Existing `proposal-create.page.spec.ts` — **11/11 PASS**
- [x] `git diff --check` — PASS

## Executor report

- **Status:** DONE
- **Implementation commits:** `6143447f` (feat) + `1e40e518` (sm trial) + `3b11f89c` (md × 3 + 58rem final visual)
- **Visual:** Cursor/PO PASS — final md cards, exactly three columns, 58rem products flyout, photos/placeholders, equal heights, filters/pager, Add/Edit/Create, and unchanged A4 geometry.
- **Changed:** Create КП product rail uses the existing `PiShowcaseCard md` contract with scoped compactness, photo/placeholder media, search/category filters, API-backed 12-item pagination, Add-and-continue, and existing QuickCreate/ProductForm dialogs.
- **Tests:** focused rail 4/4; proposal-create 11/11; frontend tsc PASS; diff-check PASS.
- **Scope guard:** no backend, no document-template service, no DOC-343/OPS WIP, no 325 bind, no 322/320, no deploy.

## Review handoff

- [x] READY FOR REVIEW after gates
- [x] Cursor/PO visual PASS received for final md + 3-column + 58rem variant

## Closeout

- [x] archive + lock + progress + remove `_active`
- [x] Status = DONE
- closed_at: `2026-08-09T13:51:37Z`
