# TZ-PRODUCTION-328 — checklist

**Status:** DONE / ARCHIVED
**Agent:** Buffy
**Claimed:** 2026-08-15T23:40:00+03:00
**Dependency:** TZ-PRODUCTION-327 archived and pushed (`038b18da`)
**Blocked:** none

## Acceptance

- [x] 327 archived
- [x] `production-cockpit.page.md` is a complete page SoT
- [x] `production-gantt-studio-spec.md` is synchronized; no bottom card contract
- [x] PAGE-TZ-INDEX + WAVE DONE + _NOW updated
- [x] MASTER all [x], score_now=98, next_action=STOP
- [x] Archive + lock + root/active cleanup
- [x] Executor report: «очередь пуста, готово предложить деплой» (не деплоить)

## Integrity

- [x] Docs-only scope; no product code/API/data changes planned
- [x] Fact production, ProductionOrder, OrderTask, deploy, and wipe remain explicitly OUT
- [x] Existing 321–323 no-bottom-card cascade behavior is preserved in SoT
- [x] Unrelated WIP remains unstaged; only closeout conflict-key docs are staged

## Integrity slot

- [x] Тип изменения: docs-only
- [x] FIC §A–E: N/A — no route/permission/module/MCP change
- [x] page.md / PAGE-TZ-INDEX updated; SECTION-READINESS: N/A — estimate-only readiness contour unchanged
- [x] Unrelated WIP remains unstaged; audit/page/spec changes are within TZ-328 closeout conflict keys
- [x] Canon: `docs/DOCS-INTEGRITY.md`

## Executor report

- outcome: PASS / READY FOR ARCHIVE
- docs: `production-cockpit.page.md` is the page SoT for chrome, filters, cascade levels, write-path matrix, zoom/fit/today, roles, and fact-production OUT boundary.
- spec: `production-gantt-studio-spec.md` now removes the bottom-card contract and records current 324–328 behavior, including the no-bottom-card cascade.
- scoreboard: audit final `STUDIO ESTIMATE PASS 98/100`; PAGE-TZ-INDEX, WAVE, `_NOW`, progress, and STATUS synchronized.
- gates: docs review + owned `git diff --check` PASS; markdown Prettier was attempted through the frontend toolchain but the existing docs set reports formatting drift (not auto-written to avoid broad unrelated churn); previous frontend gates carried forward: tsc PASS, production Jest 6 suites/70 tests PASS, lint PASS with 18 existing warnings, targeted code Prettier PASS.
- browser smoke: not run — no live browser/API server available; no product code changed in this docs-only TZ.
- bans: no fact production, ProductionOrder/OrderTask, deploy, wipe, or data staging.
- archive: `tasks/_archive/2026-08/TZ-PRODUCTION-328.done.md`; lock: `.mimocode/locks/TZ-PRODUCTION-328-cockpit-docs-closeout.lock`.
- next: queue empty; ready to propose deploy on explicit PO command; do not deploy automatically.
