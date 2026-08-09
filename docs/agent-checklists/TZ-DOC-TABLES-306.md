# TZ-DOC-TABLES-306 checklist

> Status: **DONE**
> Marker: `tasks/_archive/2026-08/TZ-DOC-TABLES-306.done.md`
> Closeout: path/queryParams route fix published with archive and lock

## Claim slot

- agent_id: `agent-6c3d05b80e`
- claimed_at: `2026-08-09T14:31:48Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable — Team Room registry reports unknown task

## Preflight

- [x] Get-Location + git rev-parse → `D:\kppdf-8.0`; canonical `main` at `3c1ce597`.
- [x] `TZ-DOC-TABLES-305` archived DONE; shared `tables.page.md` key released.
- [x] `_active-map` and `tasks/_active/` scanned; no overlapping foreign keys.
- [x] TZ, KP-table canon, wave prompt, agent guide, and integrity requirements read.
- [x] Claim slot filled and `_active` marker created before code.
- [x] Team Room claim attempted; registry reports unknown task.

## Acceptance

- [x] Chips use path + queryParams; no `?` inside routerLink route strings.
- [x] «Из данных» generates `/doc-constructor/tables?view=from-data` and preserves the from-registry page flow.
- [x] «Все таблицы» generates `/doc-constructor/tables?view=all`.
- [x] Generated links do not fall through to `/materials`.
- [x] Focused workspace/tables specs and frontend tsc PASS.
- [x] Manual route contract checked through the real RouterLink href in the focused workspace test.

## Integrity slot

- [x] Тип изменения: page/module route behavior.
- [x] FIC §A–E: N/A except route/page documentation; no permission or data-contract change.
- [x] `docs/pages/tables.page.md` documents path + queryParams separation.
- [x] PAGE-TZ-INDEX/SECTION-READINESS checked; no additional update required by this TZ.
- [x] Foreign DOC-343 WIP excluded; conflict keys respected.
- [x] Canon: `docs/DOCS-INTEGRITY.md`.

## Gates (факт)

- Frontend tsc: PASS — `pnpm exec tsc -p tsconfig.app.json --noEmit`.
- Focused Jest: PASS — workspace + tables **2 suites / 14 tests**.
- Prettier: PASS on all changed frontend files.
- `git diff --check`: PASS.
- Route contract: PASS — href contains `/doc-constructor/tables?view=from-data` and not `/materials`.

## Executor report (auto)

- `GroupChip` now supports optional query parameters separately from its route path.
- `PiGroupWorkspace` binds `[routerLink]` to the path and `[queryParams]` to the query object for TOC and section chips.
- `TABLES_SECTION_CHIPS` now uses `/doc-constructor/tables` plus `{ view: 'all' | 'from-data' }`.
- Added focused coverage for generated query links and updated the tables-page chip contract.
- Updated `tables.page.md` with the path/queryParams rule.
- Scope guard: table dialog/preset 307, Catalog routes, KP Create, DOC-343 WIP, and deploy untouched.

## Review handoff

- [x] Gates complete; no visual review requirement in TZ-DOC-TABLES-306.
- [x] Route acceptance verified: `Из данных` remains in Documents → Tables and does not resolve to `/materials`.

## Closeout

- [x] archive + lock + DONE
- closed_at: `2026-08-09T14:33:25Z`
