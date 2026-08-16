# TZ-UX-342 — READY FOR REVIEW

> Status: **READY FOR REVIEW**
> Spec: `tasks/TZ-UX-342-pager-dead-totals-and-rail.md`
> Checklist: `docs/agent-checklists/TZ-UX-342.md`
> Review: required — archive только после Cursor PASS

## Claim slot

- agent_id: cursor-composer (TZ-UX-342 frontend executor)
- claimed_at: 2026-08-16T09:25:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (root checklist Claim slot = SoT; kit claim not used for tasks/TZ-*)

## Conflict keys (проверено vs TZ-UX-331 + TZ-UX-341)

TZ-UX-331: `app-layout*` — **no intersect**.  
TZ-UX-341: products/modules/materials — **no intersect** (explicitly not touched).  
Пересечения нет.

- `frontend/src/app/pages/commercial/proposals/proposal-product-rail.component.ts`
- `frontend/src/app/pages/commercial/proposals/proposal-product-rail.component.spec.ts`
- `frontend/src/app/pages/inventory/**` (dead total pages)
- `frontend/src/app/pages/supply/supply.page.ts`
- `frontend/src/app/pages/dictionaries/document-template-categories.page.ts`
- `frontend/src/app/pages/dictionaries/text-block-categories.page.ts`
- `frontend/src/app/pages/doc-constructor/texts/texts.page.ts`
- `frontend/src/app/pages/doc-constructor/tables/tables.page.ts`
- related docs/specs (documents/templates dead helpers; forms PAGE_SIZE)

## Gates

- `tsc -p tsconfig.app.json --noEmit` PASS
- focused Jest PASS — 14 suites, 109 tests

## Note

Не трогать products.page / modules.page / materials.page (TZ-UX-341), app-layout (331), desktop.  
Deploy/wipe запрещены. Archive только после Cursor/PO PASS.
