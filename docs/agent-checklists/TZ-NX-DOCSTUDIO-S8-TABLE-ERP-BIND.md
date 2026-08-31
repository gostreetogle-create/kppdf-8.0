# TZ-NX-DOCSTUDIO-S8-TABLE-ERP-BIND checklist

> Status: **CLAIMED / IN PROGRESS**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-S8-TABLE-ERP-BIND.md`

## Claim slot
- agent_id: claude
- claimed_at: 2026-09-01T00:00:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (CLI unavailable)

## Preflight
- [x] `git status`, branch `main`, active task marker created.
- [x] Read `GEMINI.md`, executor loop, TZ, `_NOW`, PROJECT-MEMORY, PO-CANON, CONTEXT, page/domain docs.
- [x] No conflicting task in `tasks/_active/`.
- [x] Existing backend `putDataSet` API confirmed; frontend wiring absent.
- [x] Baseline `nx build kppdf-web` passed before this TZ.

## Acceptance
- [ ] Data-access exposes `putDataSet(documentId, key, payload)`.
- [ ] Table properties expose `Вручную | Из КП | Из заказа`.
- [ ] ERP selection writes the correct source and refreshes active preview.
- [ ] Empty context shows the data-panel hint.
- [ ] Unit test covers source switching.

## Plan
1. Extend data-access types/service.
2. Wire table properties inputs/outputs and editor persistence.
3. Add regression coverage.
4. Run scoped tests and final build.

## Integrity slot
- [x] Type: page/UI + data-access.
- [x] FIC/page docs reviewed; updated `docs/pages/document-studio.page.md` §2.3.
- [x] SECTION-READINESS: N/A.
- [x] Coupling map: N/A; existing quotation/order context fields only.
- [x] No foreign WIP staged.

## Build integrity
- [x] Baseline build passed.
- [x] No conflicting active kppdf-web task.
- [x] Closing build is last gate.

## Gates
- `cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=studio-table` — PASS (54 suites, 294 passed, 7 skipped; exit 0).
- `cd frontend-nx && pnpm exec nx build kppdf-web` — PASS (exit 0; last gate; existing Angular budget warnings only).

## Executor report
- Added typed `putDataSet` data-access call using the existing silent HTTP wrapper.
- Added table source selector and context hints; editor persists `table-<blockId>` dataset with optimistic revision and refreshes local preview state.
- Known limitation: source rows are resolved by backend preview; the current canvas remains local/manual until preview rendering is requested.

## Closeout
- ready to archive after review of this diff; live-state and archive pending.
