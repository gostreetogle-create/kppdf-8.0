# TZ-QA-445F checklist

> Status: **DONE**
> Marker: archived → `tasks/_archive/2026-08/TZ-QA-445F.done.md`
> closed_at: 2026-08-27T18:55:00Z

## Claim slot
- agent_id: freebuff-1
- claimed_at: 2026-08-27T18:33:46Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

### Preflight Check Output
- **Context read:** `docs/PO-CANON.md`, `docs/pages/orders.page.md`, `docs/pages/ui-composition-tree.md`, `docs/FEATURE-INTEGRATION-CHECKLIST.md`, `tasks/_backlog/qa-2026-08-27-live-bugs/TZ-QA-445F-desk-order-row-edit-affordance.md`, `frontend/src/app/shared/orders/order-hub-tray.component.ts`, `frontend/src/app/pages/orders/order-detail.page.ts`, `frontend/src/app/shared/ui/composition/composition-tree.component.ts`, `frontend/src/app/shared/orders/open-catalog-composition-edit.ts`
- **Key Constraints:** Executor Claim; CONFLICT KEYS order-detail / desk tray composition; pencil-only edit; desk tray no navigate (PO-CANON); no status-banner / 444A zone
- **Planned Deliverable:** (1) remove row→catalog navigate (2) keep pencil→edit (3) tests (4) page/canon note
- **Validation Path:** FIC §G other/UX affordance; Integrity; focused FE jest+tsc

## Note
- Unblocked: TZ-UX-444A DONE (PiStatusBanner exists)

## Acceptance
- [x] AC: карандаш открывает редактирование; клик по остальной площади строки — не открывает (select/expand only)
- [x] Focused gates; archive + lock

## Integrity slot
- [x] Тип: other (click affordance on existing composition tree hosts)
- [x] FIC §A–E N/A (no new route/permission/module/MCP); §F N/A
- [x] page.md updated: `docs/pages/orders.page.md`, `docs/pages/ui-composition-tree.md`
- [x] SECTION-READINESS N/A
- [x] Conflict keys: order composition hosts only
- [x] COUPLING-MAP N/A

## Gates / Executor report
- tsc app --noEmit PASS
- jest order-detail + order-hub-tray + composition-tree + forest → 50/50 PASS
- Deploy: NO
