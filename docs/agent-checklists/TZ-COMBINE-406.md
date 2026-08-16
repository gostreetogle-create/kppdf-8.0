# TZ-COMBINE-406 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-COMBINE-406.md` (удалён)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: freebuff (deepseek-v4-pro)
- claimed_at: 2026-08-16T17:20:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room runner in this chat)

## Preflight

- [x] git rev-parse --show-toplevel → D:\kppdf-8.0
- [x] `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на `backend/src/modules/order/**`
- [x] Прочитал PO-CANON, GIT-POLICY, COUPLING-MAP §2/§2b, design-combine.page.md, WAVE-FREEBUFF-COMBINE-MODULES.md
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-COMBINE-406.md` на месте

## Acceptance

- [x] Schema `Order.moduleLanes: [{ lineId, moduleId, lane }]` sparse
- [x] PATCH `/orders/:id/lines/:lineId/modules/:moduleId/lane`
- [x] Полоса линии = min по moduleLanes (если есть), иначе boardLane
- [x] Last module leave → parent следует (min)
- [x] lane=shipped через PATCH → 400 RU
- [x] BE tsc PASS + order.service/controller jest PASS

## Integrity slot

- [x] Тип: module (backend order API)
- [x] page.md / PAGE-TZ-INDEX — N/A (backend-only; UI в 407)
- [x] COUPLING-MAP §2b обновлён (moduleLanes + min-полоса)
- [x] Чужой WIP не в коммите; conflict keys соблюдены (order/**, dto, specs, docs)
- [x] Deploy/wipe/seed — запрещены, не выполнялись

## Gates (факт)

- `npx tsc --noEmit` (backend) — PASS
- `npx jest src/modules/order --silent` — PASS (3 suites / 75 tests)

## Executor report

- Schema: `ModuleLane` embedded + `Order.moduleLanes` (sparse, default []).
- Service: `patchModuleLane(id, lineId, moduleId, lane)` (reject shipped 400 RU, hard-frozen 400, unknown lineId 404, invalid moduleId 400; upsert по ключу (lineId, moduleId)); `effectiveLineLane` (min по LANE_ORDER); `rollupOrderStatus` считает по эффективной полосе.
- Controller: `PATCH /orders/:id/lines/:lineId/modules/:moduleId/lane` (+ @AuditAction module_board_lane).
- DTO: `patch-module-lane.dto.ts`.
- Known limits: `item.status` остаётся дериватом line-level `boardLane`; moduleLanes не populate (407).

## Closeout

- [x] archive + lock + progress + `_NOW` + удалён `_active`
- [x] Status = DONE
- closed_at: 2026-08-16T17:25:00+03:00
