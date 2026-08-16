# TZ-COMBINE-402 checklist

> Status: **DONE**
> Marker: archived → `tasks/_archive/2026-08/TZ-COMBINE-402.done.md`
> Spec: `tasks/TZ-COMBINE-402-order-item-lineid-boardlane.md`
> Commit/push: executor after gates (GIT-POLICY)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: cursor-composer-executor
- claimed_at: 2026-08-16T14:44:29+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task; claim slot filled)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на order.schema
- [x] TZ / COUPLING-MAP §2b / deps прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-COMBINE-402.md` на месте (removed on archive)

## Acceptance

- [x] lineId + boardLane schema + backfill on create/find
- [x] BE tsc + order.service jest (48/48)
- [x] Archive DONE

## Integrity slot (до READY / archive)

- [x] Тип: module (order schema/service)
- [x] FIC: N/A product UI; common field already in COUPLING-MAP §2b/§3 (401)
- [x] page.md / PAGE-TZ-INDEX: N/A (no UI)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys: order.schema + minimal service
- [x] Coupling map: already documents lineId/boardLane (401) — no rewrite
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → PASS
- `cd backend && pnpm exec jest --testPathPattern=order.service --coverage=false` → **1 suite / 48 tests PASS**

## Executor report

- Schema: `OrderItem.lineId`, `boardLane` enum default prep; jsdoc status←boardLane in 403
- Create/mapItems: randomUUID lineId, boardLane prep, status pending (preserve on update)
- Backfill on findAll/findById: stable `legacy-{i}-{orderId}` + status→lane map; persist if dirty
- ship/setItemStatus keep boardLane aligned; no PATCH lane; no FE; deploy НЕ

## Closeout

- [x] archive + lock + progress + удалить `_active`
- closed_at: 2026-08-16T14:46:25+03:00
