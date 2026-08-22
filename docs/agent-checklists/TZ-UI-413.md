# TZ-UI-413 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-UI-413-material-form-micro-type.md`

## Claim slot

- agent_id: freebuff-1
- claimed_at: 2026-08-22T19:20:17Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room tool exposed)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → `D:\kppdf-8.0`
- [x] Read `_NOW.md` + `tasks/_active/`; no conflicting claim keys
- [x] TZ / template / dependency read
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS
- [x] Active marker present

## Acceptance

- [x] Replace the scoped `text-[10px]` with `text-[11px]`
- [x] Scoped search has zero `text-[9px]` / `text-[10px]`
- [x] FE TypeScript check

## Integrity slot

- [x] Dialog-only utility class change; checkbox/upload behavior unchanged
- [x] Conflict key respected; unrelated WIP excluded

## Gates

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS
- Scoped `text-[10px]` / `text-[9px]` search — PASS, 0 matches
- `git diff --check` — PASS
- Deploy — NOT RUN

## Executor report

- Changed only the material form photo-label utility class and the `/materials` page index note.
- Checkbox/upload behavior, excluded keys, and unrelated dirty WIP were untouched.

## Closeout

- [x] archive + lock created
- [x] progress entry prepared
- [x] active marker removed after staging
- Status = DONE
- closed_at: 2026-08-22T19:25:00Z
- commit SHA: pending functional commit
