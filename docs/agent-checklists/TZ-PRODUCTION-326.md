# TZ-PRODUCTION-326 — checklist

**Status:** DONE / ARCHIVED
**Workspace:** `D:\kppdf-8.0`
**Conflict keys:** cockpit page/spec, Gantt component/spec, OrdersService, production SoT, harden MASTER/wave, `progress.md`

## Claim slot

- agent_id: Buffy
- claimed_at: 2026-08-15T22:25:00+03:00
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable
- conflicting active TZ: none
- dependency: TZ-PRODUCTION-325 archive + push PASS (`fe6cd206`)

## Write-path matrix

| Path | Role gate | UI updates bars? | Status |
|------|-----------|------------------|--------|
| Meta priority+plannedDate Save | `canEditOrder` (admin\|manager) | reload orders → rebuild bars | PASS |
| Summary body-drag plannedDate | `canEditOrder` (admin\|manager) | reload orders → rebuild bars | PASS |
| Child resize estimate-days | `production:write` | reload orders → rebuild bars | PASS |
| Child drag estimate-start | `production:write` | reload orders → rebuild bars | PASS |
| Catalog WorkType.days | `production:write` | clear cache + reload bars | PASS |

## Acceptance checklist

- [x] 325 archived
- [x] Roles aligned: summary plannedDate uses `canEditOrder`; child writes remain `production:write`
- [x] Reload after plannedDate (meta and drag paths use `reloadOrdersKeepingSelection`)
- [x] BE plannedDate ISO verify — `UpdateOrderDto` inherits `@IsDateString()` and `OrderService.update` persists `new Date(dto.plannedDate)`; existing `PATCH /orders/:id`, no new endpoint
- [x] Jest + tsc — frontend tsc PASS; targeted Jest 46/46 PASS
- [x] Archive + MASTER 326 [x] score≈93
- [x] Executor report

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (frontend UX)
- [x] FIC §A–E: N/A — existing route/API/permissions unchanged
- [x] page.md / PAGE-TZ-INDEX: write-path matrix and Save→reload hint documented
- [x] SECTION-READINESS: N/A — estimate studio readiness contour unchanged
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: `docs/DOCS-INTEGRITY.md`

## Executor report

- outcome: PASS / READY FOR ARCHIVE
- matrix: meta Save + summary plannedDate drag use `canEditOrder` (admin|manager); child estimate-days resize, start-offset drag, and catalog WorkType.days remain `production:write`.
- sync: successful meta/drag update calls `reloadOrdersKeepingSelection()`; facade rebuilds bars and summary from the returned plannedDate. UI says «После сохранения Гант обновится».
- BE verify: existing `PATCH /orders/:id` is `@Roles('admin','manager')`; `UpdateOrderDto` inherits `CreateOrderDto.plannedDate @IsDateString()`; service persists `new Date(dto.plannedDate)`. No endpoint added.
- gates: frontend tsc PASS; targeted Jest Gantt + cockpit = 46/46 PASS; frontend lint PASS with 18 pre-existing architecture warnings; targeted Prettier PASS.
- browser smoke: not run — no live browser server available; role gate, drag eligibility, PATCH payload, and reload path are covered by Angular Jest.
- docs: page write-path matrix and checklist matrix updated; master/_NOW/progress/status synchronized; archive closeout complete.
- bans: no fact production, wipe, deploy, or data staging.
- archive: `tasks/_archive/2026-08/TZ-PRODUCTION-326.done.md`; lock: `.mimocode/locks/TZ-PRODUCTION-326-gantt-write-sync.lock`.
- next: targeted commit + push per Git Policy, then claim TZ-PRODUCTION-327.
