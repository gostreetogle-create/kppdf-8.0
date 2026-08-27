# TZ-QA-445B checklist

> Status: **DONE**
> Marker: archived → `tasks/_archive/2026-08/TZ-QA-445B.done.md`
> closed_at: 2026-08-27T18:45:00Z

## Claim slot
- agent_id: freebuff-1
- claimed_at: 2026-08-27T18:28:41Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

### Preflight Check Output
- **Context read:** `docs/PO-CANON.md`, `docs/pages/stock-movements.page.md`, `docs/DIALOG-COOKBOOK.md`, `docs/FEATURE-INTEGRATION-CHECKLIST.md` (§G), `frontend/src/app/pages/inventory/stock-movement-form-dialog.component.ts`, `frontend/src/app/shared/ui/select-add-row/pi-select-add-row.component.ts`, `frontend/src/app/pages/materials/material-form-dialog.component.ts`
- **Key Constraints:** Executor Claim + CONFLICT KEYS `pages/inventory/*` (+ shared MaterialFormDialog open only); reuse `pi-select-add-row`; Dialog cookbook nested open with `parentDestroyRef`; no doc-constructor / proposal / product-detail / gantt / work-types
- **Planned Deliverable:** (1) + на «Материал» via PiSelectAddRow (2) open MaterialFormDialog (3) autofill materialId + unit in qty label (4) focused Jest + page.md note
- **Validation Path:** FIC §G focused FE tests; Integrity other/dialog UX; page.md update

## Acceptance
- [x] AC: из модалки прихода можно создать материал (+ → MaterialFormDialog) без ухода; materialId подставляется; unit в лейбле количества
- [x] Focused gates; archive + lock

## Integrity slot
- [x] Тип: other (dialog UX on existing inventory page)
- [x] FIC §A–E N/A (no new route/permission/module/MCP); §F N/A (no shared status/field rename)
- [x] page.md updated: `docs/pages/stock-movements.page.md`
- [x] SECTION-READINESS N/A
- [x] Conflict keys: inventory dialog only; MaterialFormDialog reused (shared pattern)
- [x] COUPLING-MAP N/A

## Gates / Executor report
- tsc app --noEmit PASS
- jest stock-movement-form-dialog 3/3 PASS; inventory suite 28/28 PASS
- Deploy: NO
