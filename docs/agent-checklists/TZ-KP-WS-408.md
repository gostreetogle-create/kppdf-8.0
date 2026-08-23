# TZ-KP-WS-408 checklist

> Status: **CLAIMED / IN PROGRESS**
> Marker: `tasks/_active/TZ-KP-WS-408.md`

## Claim slot

- agent_id: freebuff-1
- claimed_at: 2026-08-23T17:05:00+0300
- workspace: D:\kppdf-8.0
- team_room_claim: yes

## Preflight

- [x] git rev-parse --show-toplevel → D:\kppdf-8.0
- [x] TZ-406 archived (92c458e7) + pushed; 407.done.md на месте
- [x] `_active/` — нет чужого CLAIM на app.routes / proposal-create
- [x] TZ-408 + канон прочитаны

## Acceptance (из TZ-408)

- [ ] `/proposals/create?id=` работает как до cutover
- [ ] Parity matrix 100% PASS или deferred с TZ refs
- [ ] `pnpm test -- proposal` PASS
- [ ] tsc + lint PASS
- [ ] KP-E2E-SMOKE evidence

## Gates (факт)

- команды + PASS/FAIL

## Executor report

- что сделано / conflict disclosure / known limits

## Closeout

- [ ] archive + remove `_active` + commit+push
