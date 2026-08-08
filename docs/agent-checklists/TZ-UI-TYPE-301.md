# TZ-UI-TYPE-301 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-UI-TYPE-301.done.md`
> Commit/push: YES (executor continuous / PO queue)

## Claim slot

- agent_id: agent-3e757640b7 (cursor-composer-type301)
- claimed_at: 2026-08-08T11:06:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task; checklist slot = SoT)
- closed_at: 2026-08-08T11:12:00Z

## Acceptance

- [x] `.eyebrow` and `.pi-tech-label` both 11px
- [x] design-spec reflects Hanken/Inter/JetBrains + 5 roles
- [x] foundations hint fonts fixed
- [x] tsc clean
- [x] «ERP type scale» comment in styles.css

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS (exit 0)

## Closeout

- [x] archive + lock + progress + remove `_active`
- [x] Status = DONE
