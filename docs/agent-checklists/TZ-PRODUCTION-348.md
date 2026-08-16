# TZ-PRODUCTION-348 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-PRODUCTION-348.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: composer-executor-348
- claimed_at: 2026-08-16T18:58:34Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (CLI not required for root tasks; Claim slot filled)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-PRODUCTION-348-…` был на месте при работе

## Acceptance

- [x] Нет простыни «План-оценка…» / zoom-hint / expand-hint в шапке
- [x] Группировка слева, масштаб справа наверху; chrome «Масштаб» исчез
- [x] Header «Заказ»/«Рабочий» без боковой рамки-коробки
- [x] Клик по имени рабочего раскрывает модули
- [x] Раскрытый заказ: изделие/модуль/WT визуально лесенка + разный wash
- [x] Gates PASS; archive; push

## Integrity slot (до READY / archive)

- [x] Тип изменения: page
- [x] FIC: page.md + PAGE-TZ-INDEX
- [x] page.md обновлён
- [x] SECTION-READINESS N/A (chrome polish only)
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map N/A
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `pnpm test -- --testPathPattern="gantt-bars.component|production-scale-controls|production-cockpit.page" --no-coverage` → PASS 76/76

## Executor report

- Toolbar in Gantt header; scale flyout/chrome tool removed.
- Label expand for worker/product/module; nest 15px + stronger washes.
- Deploy not run.

## Closeout

- [x] archive + lock + progress + удалить `_active`
- closed_at: 2026-08-16T22:02:53+03:00
