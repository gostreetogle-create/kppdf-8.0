# TZ-NX-KP-FAMILY-S43-EXPAND checklist

> Status: **DONE**
> Marker: archived (removed from `tasks/_active/`)
> Commit/push: per `docs/GIT-POLICY.md`

## Claim slot

- agent_id: `claude`
- claimed_at: `2026-09-03T10:20:00+03:00`
- workspace: `D:\kppdf-8.0`
- team_room_claim: `unavailable`

## Preflight

- [x] Get-Location + git rev-parse → `D:\kppdf-8.0`
- [x] Read `_NOW.md` + `tasks/_active/` — no competing claim
- [x] TZ read; legacy expand pattern verified
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/` marker present during work

## Acceptance

- [x] Expand («Семья») on solo/master rows → `getFamily(id)` (data-test `proposal-family-expand`)
- [x] Variants: org name/id, markup %, status, number
- [x] Loading/error states; stale ignore when expand closed during fetch
- [x] Spec PASS (10 tests in proposals-list suite); `nx build kppdf-web` PASS last

## Integrity slot

- [x] Type: page (existing `/proposals`)
- [x] FIC: checked
- [x] page.md: NX S43 bullet
- [x] Foreign WIP not committed
- [x] DOCS-INTEGRITY applied

## Gates (факт)

- Green: `pnpm exec nx test kppdf-web --testPathPattern=proposals-list` PASS (proposals suite 10/10; suite total 324 passed; registries.catalog pre-existing failure unrelated).
- `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json` → exit 0; scoped eslint → exit 0 (0 warnings).
- `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0 (PASS, last).

## Executor report

Expand «Семья» mirroring legacy 313 UX on the NX list with loading/error/caching and a stale-guard so a result arriving after the panel closed is dropped. Org names loaded lazily once per component (limit 100) and cached.

## Closeout

- [x] archive + lock + live-state sync + remove `_active` marker
- [x] Status = DONE
- closed_at: `2026-09-03`
