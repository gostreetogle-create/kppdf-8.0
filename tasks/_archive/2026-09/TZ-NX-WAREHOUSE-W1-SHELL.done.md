# TZ-NX-WAREHOUSE-W1-SHELL — DONE

- Status: **DONE**
- agent_id: `freebuff`
- claimed_at: `2026-09-05T18:58:19+03:00`
- closed_at: `2026-09-05T19:18:14+03:00`
- workspace: `D:\\kppdf-8.0`

## Delivered

- Added NX `/warehouses`, `/storage-items`, and `/stock-movements` route leaves.
- Added `Склад` nav group with exactly `Склады`, `Остатки`, `Движения`; no Dashboard, shipping, warehouse types, or zones.
- Added thin `/warehouses` list/search/create/edit/delete UI with Russian copy and Paper & Ink destructive confirmation.
- Added `PiWarehousesService` for the existing warehouse API; create/update payload uses `type: 'main'` and `zoneNames: []`.
- Added stable W2/W3 placeholder page files for sequential replacement.
- Updated warehouse page contracts, page index, pages README, and NX domain inventory.

## Verification

- Baseline `cd frontend-nx && pnpm exec nx build kppdf-web`: PASS, exit 0.
- Focused Jest: 3 suites / 5 tests passed.
- Frontend app typecheck: PASS.
- W1-owned ESLint: PASS, 0 errors.
- W1-owned `git diff --check`: PASS.
- Final `cd frontend-nx && pnpm exec nx build kppdf-web`: PASS, exit 0.
- Known pre-existing build warnings: Studio NG8102 and Gantt component style budget.

## Integrity

- FIC route/nav/capability/page documentation records updated.
- Warehouse quantity SoT remains `StorageItem` / stock movements; no backend app logic changed.
- `/supply`, legacy `frontend/`, shipping, Gantt, and unrelated dirty work were not changed or committed.
- W2/W3 route placeholders are intentionally replaced by their next sequential TZs.

## Proof of adoption

1. Routed production consumer: `/warehouses` in the authenticated NX app shell.
2. Test: warehouse nav, page search/actions, and dialog payload regressions.
3. Markdown: `docs/pages/warehouses.page.md` and route/page indexes updated.
4. Migration note: new warehouse UI must not expose type/zones; API payload keeps `main` and empty zones.
5. Legacy leftover: legacy `/warehouses` remains the cutover reference; `/storage-items` and `/stock-movements` remain legacy until W2/W3.

Implementation commit: pending closeout commit.
