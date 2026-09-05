# TZ-NX-WAREHOUSE-W1-SHELL checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-WAREHOUSE-W1-SHELL.md` (removed after archive)

## Claim slot

- agent_id: `freebuff`
- claimed_at: `2026-09-05T18:58:19+03:00`
- workspace: `D:\\kppdf-8.0`
- team_room_claim: `unavailable` — `team-room` / `teamroom` CLI not installed

## Preflight

- [x] `pwd` + `git rev-parse --show-toplevel` → `D:/kppdf-8.0`
- [x] `_NOW.md` + `tasks/_active/` checked; no foreign conflicting claim
- [x] W1 TZ, warehouse audit, wave, slot rules, page docs, FIC read
- [x] Claim slot filled before product code
- [x] Baseline: `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS, exit 0

## Acceptance

- [x] NX nav group «Склад»: Склады · Остатки · Движения; no Dashboard.
- [x] Routes `/warehouses`, `/storage-items`, `/stock-movements` exist.
- [x] Thin warehouse CRUD supports name, active, and optional description.
- [x] Create/update payload fixes `type: 'main'` and `zoneNames: []`; type/zones are not UI controls.
- [x] Search and destructive soft-delete confirmation work.
- [x] Focused regression tests cover navigation, payload, search, and actions.

## Integrity slot

- [x] Type: page + route + data-access
- [x] FIC §A and §D completed: NX route/nav/capability metadata, warehouse SoT, no dashboard/types/zones.
- [x] `docs/pages/warehouses.page.md`, storage/movements notes, `PAGE-TZ-INDEX.md`, and pages README updated.
- [x] `docs/DOMAIN-MAP.md` warehouse NX records were already present in the pre-existing workspace rewrite; that unrelated rewrite is excluded from the W1 commit.
- [x] `SECTION-READINESS` N/A — W1 shell does not claim the full warehouse section READY; W2/W3/W8 remain separate.
- [x] Foreign WIP excluded from commit.
- [x] `docs/COUPLING-MAP.md` N/A — no shared field/status changed.
- [x] `docs/DOCS-INTEGRITY.md` followed.

## Build integrity

- [x] Baseline build before code: PASS
- [x] No other active `kppdf-web` claim
- [x] Closing `nx build kppdf-web` was the last W1 gate

## Gates

- [x] Focused Jest: 3 suites, 5 tests passed
- [x] Frontend typecheck: `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` PASS
- [x] Lint: 0 errors on W1-owned files
- [x] `git diff --check` PASS on W1-owned paths
- [x] Final `cd frontend-nx && pnpm exec nx build kppdf-web` PASS (exit 0)
- [x] Known pre-existing warnings: Studio NG8102 and Gantt style budget

## Executor report

W1 NX warehouse shell is complete. Added named-warehouse CRUD using the existing `/api/warehouses` service, search, Russian UI, destructive confirmation, fixed `type: 'main'` / `zoneNames: []` payload, three routes, and the `Склад` nav group. W2/W3 routes are stable placeholders for sequential replacement. Backend app logic, legacy frontend, Gantt, shipping, and `/supply` were not changed.

## Closeout

- [x] Archive + DONE lock + remove active marker
- [x] Status = DONE
- closed_at: `2026-09-05T19:18:14+03:00`

## Implementation commit

Pending commit SHA.
