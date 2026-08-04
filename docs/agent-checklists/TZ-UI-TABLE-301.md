# TZ-UI-TABLE-301 checklist

> Status: **DONE**  
> Marker: archived — `tasks/_archive/2026-08/TZ-UI-TABLE-301.done.md`  
> Commit/push: **NO** unless PO says so  
> Scope: **docs only** — zero `frontend/src` edits

## Claim slot (ОБЯЗАТЕЛЬНО до правок)

- agent_id: Cursor Architect (closeout; Buffy deliverable missing in main — SoT authored in D:\kppdf-8.0)
- claimed_at: 2026-08-04T21:00:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Preflight

- [x] Get-Location + git rev-parse → `D:\kppdf-8.0`
- [x] `_active` — DICT-308 DONE; docs keys only
- [x] Claim slot заполнен
- [x] READ ONLY audit: `pi-table.component.ts` + page consumers

## Acceptance

- [x] SoT `docs/superpowers/specs/2026-08-04-table-kit-design.md`
- [x] Variants Flat / Expandable / Tree (+ Selectable/dense backlog)
- [x] as-is → to-be inventory
- [x] PO-DIARY §5 one-liner
- [x] Нет правок `frontend/src/**`
- [x] Cursor docs PASS

## Gates / Executor report

- docs-only: tsc/jest N/A
- Audit: 16 page-level `app-pi-table` + entity-list; 7 raw registry tables; categories = CDK custom → Tree; `selectionMode` consumers = 0
- Child map: 302 Tree, 303 Expandable polish, 304 Selectable/dense, 305 raw→Flat
- Verdict: **PASS** (authored + reviewed in main)

## Closeout

- [x] archive + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-04T21:05:00Z
