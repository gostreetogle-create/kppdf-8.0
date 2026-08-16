# TZ-COMBINE-411 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-COMBINE-411.done.md`
> Commit/push: executor after gates

## Claim slot

- agent_id: composer-executor-combine-411
- claimed_at: 2026-08-16T22:54:55+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task; sync tasks first)
- closed_at: 2026-08-16T22:58:00+03:00

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Нет чужого CLAIM на те же keys
- [x] Claim slot заполнен
- [x] `tasks/_active/TZ-COMBINE-411.md` был на месте

## Acceptance

- [x] Нет UI `combine-order-group` / «Заказ №…» между рядами
- [x] Номер заказа один раз на ряду; клик → openOrder
- [x] Компакт gap-1 внутри заказа; mt-4 при смене orderId
- [x] Нет color coding / boardLane изменений
- [x] FE tsc + jest dashboard.page PASS (25/25)
- [x] design-combine.page.md обновлён
- [x] Archive + push; deploy нет

## Integrity slot

- [x] Тип: page
- [x] page.md: design-combine.page.md
- [x] SECTION-READINESS: N/A (UI polish only)
- [x] Чужой WIP не в коммите (restored HEAD + 411-only delta)
- [x] Coupling map: N/A
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `pnpm exec jest src/app/pages/dashboard/dashboard.page.spec.ts` → PASS 25/25

## Executor report

Removed duplicate order group headers; compact same-order rows; larger top margin on order boundary. Peer uncommitted polish on dashboard.page.ts was excluded from commit.

## Closeout

- [x] archive + lock + progress + удалить `_active` + root TZ
- [x] Status = DONE
