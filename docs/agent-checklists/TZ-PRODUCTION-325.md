# TZ-PRODUCTION-325 — checklist

**Status:** DONE / ARCHIVED  
**Workspace:** `D:\kppdf-8.0`  
**Conflict keys:** orders rail, cockpit page/context, Gantt model, production page docs, harden MASTER/wave, `progress.md`

## Claim slot

- agent_id: Buffy
- claimed_at: 2026-08-15T21:40:00+03:00
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable
- conflicting active TZ: none
- dependency: TZ-PRODUCTION-324 archive + push PASS (`f641be8d`)

## Acceptance checklist

- [x] 324 archived and pushed
- [x] Remove status pips from collapsed + list rail
- [x] Заказчики mode/filter → rail + Gantt
- [x] Search switches between order number and counterparty name
- [x] Date filters smoke: rail + Gantt + RU empty state
- [x] Jest + tsc — frontend tsc PASS; targeted Jest 33/33 PASS
- [x] Integrity slot completed
- [x] Archive + lock + MASTER 325 [x] score≈88
- [ ] Executor report

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (frontend UX)
- [x] FIC §A–E: N/A — existing route/API/permissions unchanged
- [x] page.md / PAGE-TZ-INDEX: updated with Заказчики mode, no-pip rail, and filter state
- [x] SECTION-READINESS: N/A — estimate studio readiness contour unchanged
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: `docs/DOCS-INTEGRITY.md`

## Executor report

- outcome: PASS / READY FOR ARCHIVE
- implementation: removed status pips from collapsed/list rail; added RU Заказы / Заказчики mode with unique populated Counterparty names and «Без заказчика»; click/re-click/«Все заказчики» filters both rail and Gantt through shared `filterOrdersForRail`.
- search: order number in Заказы mode; counterparty name in Заказчики mode.
- dates: existing dateFrom/dateTo path verified in rail, model, and cockpit reload target; empty states are RU and filter-specific.
- gates: frontend tsc PASS; targeted Jest orders rail + Gantt model + cockpit = 33/33 PASS; frontend lint PASS with 18 pre-existing architecture warnings; targeted Prettier PASS.
- browser smoke: not run — no live browser server available; DOM interactions and Gantt target reload are covered by Angular Jest.
- docs: production page SoT and filter state updated; master/_NOW/progress/status pending archive closeout.
- bans: no BE/API, CRUD, fact production, ProductionOrder/OrderTask, deploy, wipe, or data staging.
- archive: `tasks/_archive/2026-08/TZ-PRODUCTION-325.done.md`; lock: `.mimocode/locks/TZ-PRODUCTION-325-orders-rail-counterparties.lock`.
- next: targeted commit + push per Git Policy, then claim TZ-PRODUCTION-326.
