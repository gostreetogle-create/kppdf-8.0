# TZ-UI-412 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-UI-412-catalog-remaining-micro-type.md`

## Claim slot

- agent_id: freebuff-1
- claimed_at: 2026-08-22T19:15:54Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room tool exposed)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → `D:\kppdf-8.0`
- [x] Read `_NOW.md` + `tasks/_active/`; no conflicting claim keys
- [x] TZ / template read
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS
- [x] Active marker present

## Acceptance

- [x] Replace `text-[10px]` and `text-[9px]` with `text-[11px]` in products/modules/materials pages
- [x] Scoped search has zero `text-[10px]` / `text-[9px]`
- [x] Update PAGE-TZ-INDEX entries
- [x] FE TypeScript check

## Integrity slot

- [x] Page change only; no logic/API changes
- [x] PAGE-TZ-INDEX updated
- [x] Conflict keys respected; unrelated WIP excluded

## Gates

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS
- Scoped `text-[10px]` / `text-[9px]` search — PASS, 0 matches in all three conflict keys
- `git diff --check` on scoped files — PASS
- Deploy — NOT RUN

## Executor report

- Changed only the remaining catalog micro-type utility classes and the three PAGE-TZ-INDEX route notes.
- Unrelated dirty WIP, excluded agent keys, and `material-form-dialog.component.ts` were not included.

## Closeout

- [x] archive + lock created
- [x] progress entry prepared
- [x] active marker removed after staging
- Status = DONE
- closed_at: 2026-08-22T19:20:00Z
- commit SHA: pending functional commit
