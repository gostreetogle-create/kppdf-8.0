# TZ-KP-MECH-504 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-KP-MECH-504-inherit-terms-from-party-org.md`

## Claim slot

- agent_id: cursor-executor
- claimed_at: 2026-08-23T17:58:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (root TZ)

## Acceptance

- [x] Org change → vatPercent inherit if !vatTouchedByUser
- [x] Counterparty change → vatRate inherit if !vatTouchedByUser
- [x] Discount default none/0, no schema changes
- [x] Unit tests inherit + dirty guard
- [x] Gates + archive + commit

## Gates

- FE tsc: PASS
- jest proposal-workspace-draft.service.spec: 26/26
- eslint: PASS

## Closeout

- closed_at: 2026-08-23T18:05:00Z
