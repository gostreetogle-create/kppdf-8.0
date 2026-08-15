# TZ-PRODUCTION-324 — checklist

**Status:** DONE / ARCHIVED  
**Workspace:** `D:\kppdf-8.0`  
**Conflict keys:** `gantt-bars.component.ts`, `gantt-bars.component.spec.ts`, `production-cockpit.page.ts`, `production-cockpit.page.spec.ts`, `production-cockpit.context.ts`, `production-cockpit.page.md`, this checklist, harden MASTER, harden wave, `progress.md`

## Claim slot

- agent_id: Buffy
- claimed_at: 2026-08-15T21:15:00+03:00
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable
- conflicting active TZ: none

## Acceptance checklist

- [x] Read TZ + MASTER harden checklist, audit, wave, `_active/`, page SoT
- [x] CLAIM `_active/TZ-PRODUCTION-324.md`
- [x] Fit-width week from measured timeline viewport (ResizeObserver)
- [x] Rename → Вместить сроки + real fit behavior
- [x] Сегодня scrolls to marker
- [x] RU hint explains День / Неделя / Вместить сроки
- [x] Jest + tsc — frontend tsc PASS; targeted Jest 43/43 PASS
- [x] Integrity slot completed
- [x] Archive + lock + MASTER 324 [x] score≈82
- [x] Executor report

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (frontend UX)
- [x] FIC §A–E: N/A — existing `/production` route and permissions unchanged
- [x] page.md / PAGE-TZ-INDEX: updated with fit density, range, and scroll behavior
- [x] SECTION-READINESS: N/A — readiness status unchanged; estimate studio remains the same readiness contour
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: `docs/DOCS-INTEGRITY.md`

## Executor report

- outcome: PASS / READY FOR ARCHIVE
- implementation: week fit-width uses ResizeObserver-measured timeline width; «Вместить сроки» fits padded bar range and switches to Неделя; «Сегодня» scrolls marker to a 16px viewport inset.
- gates: frontend tsc PASS; targeted Jest `gantt-bars.component.spec.ts` + `production-cockpit.page.spec.ts` = 43/43 PASS; frontend lint PASS with 18 pre-existing architecture warnings; targeted Prettier PASS.
- browser smoke: not run — no live browser server available in this executor step; DOM behavior covered by Angular Jest and scroll command is wired through the child component.
- docs: `production-cockpit.page.md`, PAGE-TZ-INDEX, `progress.md`, STATUS, MASTER, and `_NOW` updated.
- bans: no BE/API, fact production, ProductionOrder/OrderTask, deploy, wipe, or data staging.
- archive: `tasks/_archive/2026-08/TZ-PRODUCTION-324.done.md`; lock: `.mimocode/locks/TZ-PRODUCTION-324-gantt-zoom-fit.lock`.
- next: targeted commit + push per Git Policy, then claim TZ-PRODUCTION-325.
