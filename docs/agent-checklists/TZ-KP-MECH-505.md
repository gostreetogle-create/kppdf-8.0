# TZ-KP-MECH-505 checklist

> Status: **DONE**
> Marker: `tasks/_archive/2026-08/TZ-KP-MECH-505-duplicate-kp-change-org.done.md`

## Claim slot

- agent_id: cursor-executor
- claimed_at: 2026-08-23T18:00:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (root TZ)

## Acceptance

- [x] Ribbon «Ещё» + params «Дублировать КП» (`kp-ws-duplicate`)
- [x] duplicate → service + navigate workspace + toast
- [x] Read-only / no draftId disabled
- [x] Org change template hint toast (+ optional org templates suggest)
- [x] Unit tests duplicate + org toast
- [x] Gates + archive + commit

## Gates

- FE tsc: PASS
- jest proposal-workspace*: 80/80
- eslint: PASS

## Closeout

- closed_at: 2026-08-23T18:10:00+03:00
