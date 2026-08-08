# TZD-21 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZD-21.done.md`

## Claim slot

- agent_id: continuous-executor-composer
- claimed_at: 2026-08-08T06:15:07.785Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Acceptance

- [x] Packet not from session JWT
- [x] TTL presets + never; default 30d
- [x] Multi-key; new does not revoke old
- [x] Revoke one → only that 401
- [x] List without plaintext
- [x] FE dialog issue + list + revoke
- [x] PAIRING.md / MCP.md
- [x] BE+FE tsc + tests PASS

## Gates

- backend tsc PASS; jest desktop-pairing 6/6
- frontend tsc PASS; jest pairing 4/4
- desktop tsc PASS

## Closeout

- closed_at: 2026-08-08T06:30:00Z
