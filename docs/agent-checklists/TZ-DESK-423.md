# TZ-DESK-423 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-DESK-423.md`

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-08-22T20:01:02Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room tool exposed)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel -> `D:\kppdf-8.0`
- [x] Read `_NOW.md`, `_active-map.md`, and `tasks/_active/`; no conflicting DESK-423 keys
- [x] Read TZ/design dependencies
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS
- [x] Active marker present

## Acceptance

- [x] Shared tray uses `Добавить изделие` button and no permanent empty/hint copy
- [x] Confirm is click-gated and desk-only PATCHes draft to confirmed
- [x] Right execution groups use disclosure and compact buttons
- [x] Desk opens `panel=bom` with `OrderFormPanel variant=items`
- [x] Form `items` variant hides basics/quick-party/notes and uses composition submit
- [x] Focused tray/desk/form specs pass
- [x] FE tsc and lint pass
- [x] Docs and coupling map updated

## Integrity slot

- [x] Only TZ conflict keys and explicitly listed docs changed
- [x] `composition-tree`, backend schemas, desktop, Gantt, PO docs untouched
- [x] Foreign WIP excluded from commit

## Gates

- FE tsc — PASS
- focused Jest — PASS, 41/41
- FE lint — PASS, 0 errors, 18 pre-existing warnings
- diff-check — PASS
- deploy — NOT RUN

## Executor report

- Shared tray, desk host, form panel, and their focused specs changed within conflict keys.
- Docs changed only in the TZ-listed manager desk/index surfaces; foreign WIP and PO docs were excluded.

## Closeout

- [x] archive + lock created
- [x] progress entry prepared
- [x] active marker removed after staging
- Status = DONE
- closed_at: 2026-08-22T20:20:00Z
- functional commit SHA: pending
