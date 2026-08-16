# TZ-PRODUCTION-351 checklist

> Status: **DONE**
> Spec: `tasks/_archive/2026-08/specs-dup-root/TZ-PRODUCTION-351-gantt-workers-fio-wt-tint.md`
> Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-351.done.md`
> Commit/push: по `docs/GIT-POLICY.md` после DONE
> Deploy: **запрещён**

## Claim slot

- agent_id: composer-executor-351
- claimed_at: 2026-08-16T23:50:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: n/a (root TZ)
- closed_at: 2026-08-17T00:05:00+03:00

## Acceptance

- [x] Worker summary gets dominant WT `accentHue` (max days among work children)
- [x] FIO label wash + chip + timeline `barFill` use WT oklch when hue set; milk fallback otherwise
- [x] Expand worker → module context rows only (not raw WT first); 344 regression kept
- [x] Orders-mode milk ladder (350) unchanged
- [x] Specs + FE tsc + jest gantt-bar.model + gantt-bars PASS
- [x] page.md + PAGE-TZ-INDEX; archive + lock; commit+push; no deploy

## Integrity slot

- [x] Тип: page (production cockpit Gantt)
- [x] page.md / PAGE-TZ-INDEX updated
- [x] SECTION-READINESS N/A
- [x] Чужой WIP не в коммите
- [x] Coupling map N/A

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `cd frontend && pnpm test -- --testPathPattern="gantt-bar.model.spec|gantt-bars.component.spec" --no-coverage` → PASS 98/98

## Executor report

- `dominantWorkTypeAccentHue` + summary `accentHue`; worker label wash/chip/barFill; 344 module-first expand tests reinforced.
- Orders-mode 350 milk ladder untouched.
