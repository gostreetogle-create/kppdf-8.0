# TZ-PRODUCTION-320 checklist

> Status: **DONE**
> Marker: archived → `tasks/_archive/2026-08/TZ-PRODUCTION-320.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: executor-composer
- claimed_at: 2026-08-15T16:57:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (CLI not required for root TZ)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны
- [x] Claim slot заполнен
- [x] Active marker cleared on archive

## Acceptance

- [x] ▸ = tree only; order name = card only
- [x] No cross-coupling expand↔card
- [x] Visual split + jest + archive

## Integrity slot

- [x] Тип изменения: page
- [x] FIC: page.md + PAGE-TZ-INDEX + WAVE updated
- [x] SECTION-READINESS: N/A (estimate studio page only)
- [x] Чужой WIP не в коммите; conflict keys соблюдены

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `cd frontend && pnpm exec jest --testPathPattern="production-cockpit.page.spec|gantt-bars.component.spec"` → **32 PASS**

## Executor report

- Decoupled expand↔card; visual expand column; docs/wave closed 314–320.
- Conflict disclosure: left `orders-rail` / `production-cockpit.context` dirty WIP unstaged.
