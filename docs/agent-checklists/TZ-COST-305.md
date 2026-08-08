# TZ-COST-305 checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-08/TZ-COST-305.done.md`
> Commit/push: YES (executor-loop after gates PASS)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: continuous-executor-composer
- claimed_at: 2026-08-08T06:15:17Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task: TZ-COST-305; sync tasks first)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_active-map.md` + `tasks/_active/` — TZD-21 keys ≠ COST-305
- [x] TZ / канон PO §1–§4 / audit D1–D5 / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-COST-305.md` на месте (removed at archive)

## Acceptance

- [x] Parent с product-line+override → CostCalculation.totalCost включает override×qty
- [x] Без override → child.costPrice×qty; оба пусты → 0 + infos
- [x] overhead% не умножается на product-line bucket
- [x] Picker: «Цена в составе, ₽» + prefill costPrice→listPrice; jest picker spec зелёный
- [x] BE unit tests на 3 сценария + regression module/material
- [x] `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit`
- [x] `cd backend && pnpm test -- cost-calculation`
- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
- [x] product-detail.page.md обновлён; нет silent 0 без info
- [x] Archive + lock; не трогать чужой `_active` TZD-21

## Gates (факт)

| Gate | Result |
|------|--------|
| backend tsc | PASS |
| jest cost-calculation | PASS 10/10 |
| frontend tsc | PASS |
| jest product-composition-picker-dialog + product-bom-panel | PASS 12/12 |

## Executor report

- BE schema/service: productLines bucket; D1=b; overhead materials-only.
- FE picker D3/D4; BOM inspector product-line hint.
- Conflict disclosure: peer TZD-21 in `_active` (auth/desktop) — no overlap.
- known_limitation: no live child BOM recursion; breakdown dialog FE types optional.

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-08T06:30:00Z
