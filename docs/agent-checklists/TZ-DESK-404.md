# TZ-DESK-404 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-DESK-404.md`

## Claim slot

- agent_id: buffy
- claimed_at: 2026-08-18T23:10:00+0300
- workspace: D:\kppdf-8.0
- team_room_claim: best-effort

## Preflight

- [x] 407 archive
- [x] не параллель с 401
- [x] `_active/TZ-DESK-404.md`

## Acceptance

- [x] На Ганте / В комбайне с orderId
- [x] с production from=desk есть «На стол»
- [x] нет встроенного Ганта
- [x] focused tsc + spec PASS

## Executor report (auto)

- Desk: rail tools «На Ганте»/«В комбайне» теперь deep-link (`studioTool` → `openStudio`) в реальные студии `/production` и `/design/combine` с `orderId&from=desk` (вместо in-page stub-switch 407). `?view=`-stub и crumbs остаются для workflow chips. `openView`/`navigateView` удалены (dead).
- Production: при `from=desk` + `orderId` — видимая RU-кнопка **«На стол»** (`data-test="desk-return"`) → `/desk?orderId=`; обычный кокпит не тронут (bar рендерится только при `from=desk`).
- Combine = общий `DashboardPage` (lazy same component) — возврат там недёшево → known_limitation: назад браузера (зафиксировано честно).
- Spec: manager-desk 404 deep-link тест (gantt+combine navigate), production-cockpit 2 теста (bar есть при from=desk / нет без from). Gates PASS.
