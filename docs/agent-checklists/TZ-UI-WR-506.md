# TZ-UI-WR-506 checklist

> Status: **CLAIMED / IN PROGRESS**
> Marker: `tasks/_active/TZ-UI-WR-506.md`

## Claim slot

- agent_id: freebuff-wr-b
- claimed_at: 2026-08-23T09:15:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Preflight

- [x] git fetch + merge → up to date
- [x] `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на kit/* keys
- [x] TZ прочитан
- [x] Claim slot заполнен
- [x] `tasks/_active/TZ-UI-WR-506.md` на месте

## Acceptance

- [ ] Lazy `/kit/*` routes + kit-layout в app.routes.ts
- [ ] app.routes.spec: path==='kit' зарегистрирован (не «отсутствует»)
- [ ] Passports на overlays/forms/foundations
- [ ] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` exit 0
- [ ] `cd frontend && pnpm test -- app.routes.spec` PASS
- [ ] Archive `tasks/_archive/2026-08/TZ-UI-WR-506.done.md`