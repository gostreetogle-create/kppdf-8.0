# TZ-UX-331 — READY FOR REVIEW

> Status: **READY FOR REVIEW**
> Spec: `tasks/TZ-UX-331-brand-home-combine-affordance.md`
> Checklist: `docs/agent-checklists/TZ-UX-331.md`
> Review: required — archive только после Cursor PASS

## Claim slot

- agent_id: cursor-composer (TZ-UX-331 frontend executor)
- claimed_at: 2026-08-16T12:25:59+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (root checklist Claim slot = SoT; kit claim not used for tasks/TZ-*)

## Conflict keys (проверено vs TZ-CATALOG-374 + TZ-UX-340)

TZ-CATALOG-374: `modules.page.ts` / `modules.page.spec.ts` / `modules.page.md` — **no intersect**.  
TZ-UX-340: `pi-pagination*` / `pi-table*` — **no intersect**.  
Пересечения нет.

- `frontend/src/app/layout/app-layout.component.ts`
- `frontend/src/app/layout/app-layout.component.spec.ts`
- `docs/pages/dashboard.page.md`
- `docs/pages/page-chrome.md`
- `docs/pages/PAGE-TZ-INDEX.md`
- `docs/agent-checklists/TZ-UX-331.md`

## Gates

- `tsc -p tsconfig.app.json --noEmit` PASS
- `pnpm test -- app-layout.component.spec` PASS (8 tests)

## Note

Не трогать products/modules/materials pages, pi-pagination, desktop.  
Deploy/wipe запрещены.  
Archive только после Cursor/PO PASS.
