# TZ-PRODUCTION-330 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-PRODUCTION-330.done.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: Buffy
- claimed_at: 2026-08-15T22:12:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (CLI unknown task)

## Preflight

- [x] Workspace `D:\kppdf-8.0`; TZ-329 pushed `ee0b0c78`
- [x] No other CLAIM on conflict keys
- [x] Claim slot filled
- [x] `tasks/_active/TZ-PRODUCTION-330.md` на месте

## Acceptance

- [x] Zoom UX «Неделя» → «Месяц»; type `GanttZoom = 'day' | 'month'`
- [x] Month ticks = RU month names, not `н.32`
- [x] Fit-density for month like former week; Вместить сроки uses month
- [x] Сегодня always recenters today marker; chrome title «Прокрутить к сегодня»
- [x] Jest + tsc + lint PASS
- [x] page.md + SoT + WAVE DONE
- [x] archive + lock + commit/push

## Integrity slot (до READY / archive)

- [x] Тип: page
- [x] FIC §A page.md + PAGE-TZ-INDEX; §B–E N/A
- [x] SECTION-READINESS N/A
- [x] Чужой WIP не в коммите
- [x] docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS
- `cd frontend && pnpm test -- --testPathPattern=pages/production` — PASS 6 suites / 73 tests
- eslint owned files — PASS (1 pre-existing OnInit warning)
- prettier owned TS — PASS
- browser smoke — NOT RUN (no live server)

## Executor report

- Месяц replaces Неделя in scale controls, zoom type, fit-density, and Gantt hint.
- Scale ticks: RU months (`август`…); first partial month still labeled.
- Сегодня always computes centered scrollLeft (not edge-inset no-op); chrome title «Прокрутить к сегодня»; every click bumps scroll nonce.
- WAVE-PRODUCTION-COCKPIT-POLISH DONE.

## Closeout

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-15T22:25:00+03:00
