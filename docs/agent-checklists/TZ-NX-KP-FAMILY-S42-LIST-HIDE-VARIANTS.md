# TZ-NX-KP-FAMILY-S42-LIST-HIDE-VARIANTS checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-KP-FAMILY-S42-LIST-HIDE-VARIANTS.md` (present)
> Commit/push: per `docs/GIT-POLICY.md`

## Claim slot

- agent_id: `claude`
- claimed_at: `2026-09-03T10:00:00+03:00`
- workspace: `D:\kppdf-8.0`
- team_room_claim: `unavailable`

## Preflight

- [x] Get-Location + git rev-parse → `D:\kppdf-8.0`
- [x] Read `_NOW.md` + `tasks/_active/` — no competing claim on `proposals-list.page.ts`
- [x] TZ read; legacy canon `proposals.page.ts` checked (variant filter + «Семья» badge)
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/` marker present

## Acceptance

- [x] Variants не в плоском списке (`(familyRole ?? 'solo') !== 'variant'`)
- [x] Badge «Семья» на master; solo без badge
- [x] Spec: variant не рендерится; master виден
- [x] `nx build kppdf-web` PASS last

## Integrity slot

- [x] Type: page (existing `/proposals`)
- [x] FIC: checked in
- [x] page.md: proposals.page.md NX section updated
- [x] Foreign WIP not committed
- [x] COUPLING-MAP: N/A
- [x] DOCS-INTEGRITY applied

## Gates (факт)

- Red: variant row rendered + no badge. Green: proposals-list spec (5 tests) PASS.
- `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json` → exit 0; scoped eslint → exit 0.
- `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0 (PASS, last)
- Pre-existing: `registries.catalog.spec.ts` failure on main (unrelated).
