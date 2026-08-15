# TZ-UX-323 checklist

> Status: **DONE**
> Spec: `tasks/TZ-UX-323-gantt-tools-into-chrome-rail.md`
> Archive: `tasks/_archive/2026-08/TZ-UX-323.done.md`
> Lock: `.mimocode/locks/TZ-UX-323-gantt-tools-chrome-rail.lock`
> Wave: `WAVE-UX-CHROME-GANTT-TOOLS`
> Deploy: НЕ

## Claim slot

- agent_id: Buffy continuous executor
- claimed_at: 2026-08-15T14:25:00Z
- ready_at: 2026-08-15T14:26:00Z
- closed_at: 2026-08-15T14:35:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: n/a

## Acceptance

- [x] Tools registered into app-chrome-rail (Заказы/Фильтры/Обновить | Карточка/Сегодня/Масштаб)
- [x] No `production-studio-rail` nav columns in template
- [x] studio-body single column; flyouts overlay left:0/right:0
- [x] Behavior 1:1; clear on destroy
- [x] SoT production-gantt-studio-spec updated
- [x] tsc + Jest production + app-layout PASS

## Gates

| Gate | Result |
|------|--------|
| tsc | PASS |
| Jest production + app-layout + chrome | PASS 14/14 |
| git diff --check | PASS |

## Executor report (auto)

- outcome: DONE
- quality_score: 98
- commit: (pending this closeout)
- deploy: NOT EXECUTED
- known_limitation: chrome tools ≥1680 only (same as ←→); no local 48px fallback
