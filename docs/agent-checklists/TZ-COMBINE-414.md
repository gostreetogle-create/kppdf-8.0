# TZ-COMBINE-414 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-COMBINE-414.done.md`
> Commit/push: по `docs/GIT-POLICY.md` (conflict keys + closeout only)

## Claim slot

- agent_id: composer-executor-414
- claimed_at: 2026-08-16T20:07:43+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] `_NOW.md` + `_active/` — no foreign CLAIM on conflict keys
- [x] TZ / deps прочитаны (412 fuse keep; 413 DnD not touch)
- [x] Claim slot заполнен
- [x] `tasks/_active/TZ-COMBINE-414.md` (removed at archive)

## Acceptance

- [x] Name click → toggleExpand (not editProduct); aria-expanded / aria-controls
- [x] Product pencil → editProduct only
- [x] Qty / indicators → toggleExpand
- [x] Specs: name→expand; pencil→edit; fuse 412 intact
- [x] page + method docs updated
- [x] FE tsc + jest dashboard.page 26/26 PASS; archive; commit+push conflict keys only

## Integrity slot

- [x] Тип: page
- [x] FIC A–E: N/A (click wiring only)
- [x] page.md + PAGE-TZ-INDEX updated
- [x] SECTION-READINESS N/A
- [x] Чужой WIP не в commit; conflict keys соблюдены
- [x] Coupling map N/A
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `cd frontend && pnpm exec jest src/app/pages/dashboard/dashboard.page.spec.ts --no-coverage` → PASS 26/26

## Executor report

- PO rollback: name/qty/indicators expand; pencil-only product edit. Fuse 412 kept. DnD 413 untouched.
- known_limitation: DnD jump → 413.

## Closeout

- [x] archive + lock + progress + remove `_active` / root TZ
- closed_at: 2026-08-16T23:15:00+03:00
