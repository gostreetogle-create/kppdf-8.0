# TZ-UX-340 — READY FOR REVIEW

> Status: **READY FOR REVIEW**
> Spec: `tasks/TZ-UX-340-pi-pagination-canon.md`
> Checklist: `docs/agent-checklists/TZ-UX-340.md`
> Review: required — archive только после Cursor PASS

## Claim slot

- agent_id: cursor-composer (TZ-UX-340 frontend executor)
- claimed_at: 2026-08-16T12:20:30Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (root checklist Claim slot = SoT; kit claim not used for tasks/TZ-*)

## Conflict keys (проверено vs TZ-UX-326 + TZ-CATALOG-374)

TZ-UX-326: `products.page.ts` / `products.page.spec.ts` / `products.page.md` — **no intersect**.  
TZ-CATALOG-374: `modules.page.ts` / `modules.page.spec.ts` / `modules.page.md` — **no intersect**.  
Пересечения нет.

- `frontend/src/app/shared/ui/pi-pagination.component.ts`
- `frontend/src/app/shared/ui/pi-pagination.component.spec.ts`
- `frontend/src/app/shared/ui/pi-table.component.ts`
- `frontend/src/app/shared/ui/pi-table.component.spec.ts`
- `frontend/src/app/shared/ui/pi-pagination.constants.ts`

## Gates

- `tsc -p tsconfig.app.json --noEmit` PASS
- `pnpm test -- --testPathPattern="pi-pagination|pi-table"` PASS (42 tests)

## Note

Не трогать products.page.ts (UX-326), modules.page.ts (CATALOG-374), desktop/**.  
Не стартовать TZ-UX-341 / 342. Deploy/wipe запрещены.  
Archive только после Cursor/PO PASS.
