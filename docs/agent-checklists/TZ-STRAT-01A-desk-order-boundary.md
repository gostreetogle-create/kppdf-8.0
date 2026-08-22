# TZ-STRAT-01A checklist

> Status: **DONE**
> Marker: было `tasks/_active/TZ-STRAT-01A-desk-order-boundary.md` (удалён после archive)
> Commit/push: локальный commit; push по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: Buffy
- claimed_at: 2026-08-21T00:27:12+03:00
- claim_transfer: taken over from stopped Gemini-CLI after model usage limit; no product code had been changed before transfer
- workspace: D:\kppdf-8.0
- team_room_claim: no (no CLI room active)
- CONFLICT KEYS: desk/orders page boundary and new shared order layer only

## Preflight

- [x] Repository root and workspace verified
- [x] `_NOW.md`, `tasks/_active/`, TZ, project canon and dependencies read
- [x] No remaining Gemini session/claim after PO confirmation
- [x] Claim transferred to Buffy before product edits

## Acceptance

- [x] Desk no longer imports `OrderFormPanelComponent` or `OrderHubTrayComponent` from `pages/orders`.
- [x] Only the two known commercial/proposals violations remain in the architecture baseline.
- [x] No new architecture violations.
- [x] Canonical `OrdersService` lives in `frontend/src/app/shared/services/orders.service.ts`.
- [x] `pages/orders/orders.service.ts` is compatibility-only and contains no second write-path.
- [x] `OrderFormPanelComponent`, `OrderHubTrayComponent`, BOM helpers and their focused specs use the shared order layer.
- [x] Existing selectors, inputs/outputs, API calls and business behavior are preserved.
- [x] `Users` entity dependency is no longer imported from a page by shared order code.
- [x] No backend, Desktop, production, supply, legacy, migration or deploy changes.

## Integrity slot

- [x] Type: page boundary + shared order feature layer; no route/API contract change.
- [x] FIC A–E: N/A — no route, permission, backend module, entity or MCP tool added.
- [x] FIC §F / Coupling map: N/A — no shared business status or FK semantics changed.
- [x] Page docs / PAGE-TZ-INDEX: N/A — route and user-facing contract unchanged.
- [x] SECTION-READINESS: N/A — readiness unchanged.
- [x] `docs/DOCS-INTEGRITY.md` reviewed.
- [x] Unrelated `docs/IDEAS-FOR-IMPLEMENTATION.md` remains untouched.

## Gates

- `pnpm architecture:check` → PASS (978 files; baseline 6 known commercial line keys).
- `pnpm --dir frontend exec tsc -p tsconfig.app.json --noEmit` → PASS.
- Focused Jest → PASS: 6 suites, 66/66 tests.
- `pnpm --dir frontend build:dev` → PASS.
- `pnpm --dir frontend lint` → PASS: 0 errors, 18 existing warnings.
- `git diff --check` → PASS.

## Executor report (auto)

- status: READY FOR REVIEW
- commit: локальный commit разрешён PO; push не выполняется
- files: shared order components/helpers/service; page import bridges; architecture baseline; task checklist
- conflict disclosure: Gemini claim was stopped and transferred before code work; no remaining parallel session
- browser smoke: not run because backend/Mongo servers were unavailable; Angular build and focused tests passed
- known limitation: two commercial cross-page violations remain intentionally outside this TZ

## Review handoff

- [x] READY FOR REVIEW
- [x] Do not archive until orchestrator/PO review

## Re-gate before closeout (2026-08-22)

- `pnpm --dir frontend exec tsc -p tsconfig.app.json --noEmit` → PASS (0 errors)
- Focused Jest (order-form-panel, order-hub-tray, orders.service, orders.page, manager-desk, order-composition-forest) → PASS, 66/66 (6 suites) — unchanged from original run
- Gates did not drift; safe to close

## Closeout

- [x] Cursor/PO review PASS (PO verdict relayed by user)
- [x] archive + lock + progress + remove `_active`
- [x] Status = DONE
- closed_at: 2026-08-22T11:05:00+03:00
