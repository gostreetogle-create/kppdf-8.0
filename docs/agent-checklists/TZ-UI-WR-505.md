# TZ-UI-WR-505 checklist

> Status: **CLAIMED / IN PROGRESS**
> Marker: `tasks/_active/TZ-UI-WR-505.md`

## Claim slot

- agent_id: freebuff-wr-b
- claimed_at: 2026-08-23T09:00:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (standalone executor)

## Preflight

- [x] git fetch + merge → up to date (518806ed)
- [x] `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на `error-banner/*`
- [x] TZ прочитан, deps: none
- [x] Claim slot заполнен
- [x] `tasks/_active/TZ-UI-WR-505.md` на месте

## Acceptance

- [ ] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` exit 0
- [ ] `cd frontend && pnpm test -- error-banner` — все PASS
- [ ] `cd frontend && pnpm lint` — 0 errors
- [ ] Existing callers with object-input not broken
- [ ] Archive `tasks/_archive/2026-08/TZ-UI-WR-505.done.md`

## Gates (факт)

- ...

## Executor report

- ...