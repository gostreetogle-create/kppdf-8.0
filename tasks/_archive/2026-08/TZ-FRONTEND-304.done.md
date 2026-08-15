# TZ-FRONTEND-304.done — composition container boundary

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T01:28:00+03:00
closed_by: Buffy
TZ: TZ-FRONTEND-304
SCORE: 100/100 scoped acceptance; parent P1 remains PARTIAL where API ownership is intentionally a successor

## Outcome

- Added `frontend/src/app/shared/services/product-composition-dialog.service.ts` as the single coordinator for existing Product/Module/Material page-dialog loading, opening and close refresh.
- Removed `pages/**` dynamic imports from `shared/ui/composition/**`; composition panel and picker retain existing UI, catalog write paths, payloads and UX.
- Product/module/material dialog data and existing close-refresh behavior are preserved.
- Residual ownership is explicit: `ProductBomPanelComponent` still owns tree state, cost reads and composition add/change/remove API calls; a full API lift is a separate successor and was not hidden in this safe child.
- No new backend endpoint, permission, dependency, route, schema or deploy operation.

## Verification

- Baseline: composition panel + picker + QuickCreate — 3 suites / 38 tests PASS.
- Change gate: composition panel + picker + QuickCreate — 3 suites / 38 tests PASS.
- Affected page regression: module detail + product form + QuickCreate — 3 suites / 45 tests PASS.
- Combined evidence: 5 suites / 69 tests PASS.
- Frontend `tsc -p tsconfig.app.json --noEmit`: PASS.
- Changed-file ESLint: PASS.
- Changed-file Prettier: PASS.
- `git diff --check`: PASS; only checkout LF/CRLF normalization warnings.
- `pnpm architecture:check`: BLOCKED by pre-existing unrelated dashboard cross-page imports at `frontend/src/app/pages/dashboard/dashboard.page.ts:19,26`; no new violation points to TZ-304.
- Browser smoke: NOT RUN; no authenticated live app requested or started.
- Bans: PASS — no deploy, wipe, data staging, fact-production model or new endpoint.

## Integrity / separation

- `docs/pages/*` and `PAGE-TZ-INDEX` are N/A: no route or user-visible contract changed.
- Untouched: `docs/PO-DIARY.md`, `data/*`, dashboard/audit WIP and unrelated backlog/park files.
- Canonical audit amendment: `docs/audits/2026-08-15-angular-component-integrity.md` records page-dialog boundary fixed and residual API ownership as successor.

## Files

- `frontend/src/app/shared/services/product-composition-dialog.service.ts`
- `frontend/src/app/shared/ui/composition/product-bom-panel.component.ts`
- `frontend/src/app/shared/ui/composition/product-composition-picker-dialog.component.ts`
- `frontend/src/app/shared/ui/composition/product-composition-picker-dialog.component.spec.ts`
- `docs/agent-checklists/TZ-FRONTEND-304.md`
- `docs/agent-checklists/_NOW.md`
- `docs/audits/2026-08-15-angular-component-integrity.md`
- `tasks/_archive/2026-08/TZ-FRONTEND-304.done.md`
- `.mimocode/locks/TZ-FRONTEND-304-composition-dialog-boundary.lock`

## Lock

`.mimocode/locks/TZ-FRONTEND-304-composition-dialog-boundary.lock`

## Next

TZ-FRONTEND-304 is closed. Next diploma priority remains AUTH-307/cutover, but deploy + browser smoke require the explicit PO command «деплой». Do not deploy automatically.
