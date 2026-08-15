# TZ-PRODUCTION-327 — checklist

**Status:** DONE / ARCHIVED
**Agent:** Buffy
**Claimed:** 2026-08-15T23:08:00+03:00
**Dependency:** TZ-PRODUCTION-326 committed and pushed (`23f0740f`)
**Blocked:** none

## Inventory

| Component | Smart/Dumb now | Action |
|-----------|----------------|--------|
| `production-cockpit.page` | Smart shell/orchestrator | Keep data reads, PATCHes, chrome registration, range/filter orchestration here |
| `gantt-bars` | Presentational interaction block; local display/drag state | Keep inputs/outputs; no extraction because cascade template is behavior-sensitive |
| `orders-rail` | Mixed: presentational list plus context-backed filter state | Keep for now; a full input/output split would duplicate the two flyout modes and risk UX |
| `order-inspector helpers` | Dumb pure prompt/confirm helper | Keep; no host remains after TZ-322 |
| `production-read.facade` | Smart read/cache facade | Keep API reads, composition mapping, and bar building here |
| `production-cockpit.context` | Smart local UI state | Keep signals/actions here; no domain fetch or PATCH logic |
| scale flyout controls | Dumb candidate | Extract to `ProductionScaleControlsComponent` with `zoom` input and `zoomChange`/`fit` outputs |

## Acceptance

- [x] 326 archived and pushed
- [x] 1 focused extract (maximum 3): `ProductionScaleControlsComponent`
- [x] Jest production PASS — 6 suites / 70 tests
- [x] Archive + MASTER 327 [x] score≈96
- [x] Executor report

## Integrity

- [x] No UX/API rewrite planned
- [x] Existing 324–326 behavior remains in scope for regression gates
- [x] No ProductionOrder/OrderTask, fact production, deploy, wipe, or data staging
- [x] Conflict keys limited to production frontend + wave/page SoT

## Executor report

Outcome: PASS / READY FOR ARCHIVE

- inventory: page/facade/context remain smart orchestration/state/read boundaries; Gantt and Orders rail remain behavior-sensitive presentational blocks; scale controls extracted as one focused dumb component.
- extract: `ProductionScaleControlsComponent` receives `zoom` and emits `zoomChange`/`fit`; page retains zoom state and fit-range behavior.
- behavior: no route/API/UX contract changes; 324–326 behavior and no-bottom-card cascade preserved.
- gates: frontend tsc PASS; production Jest PASS — 6 suites / 70 tests; lint PASS with 18 pre-existing architecture warnings; targeted Prettier PASS.
- browser smoke: not run — no live browser server available; component and page Jest cover scale actions and existing cockpit flows.
- docs: production page Smart/dumb boundary and Blocks table updated.
- bans: no ProductionOrder/OrderTask, fact production, deploy, wipe, or data staging.
- archive: `tasks/_archive/2026-08/TZ-PRODUCTION-327.done.md`; lock: `.mimocode/locks/TZ-PRODUCTION-327-cockpit-smart-dumb.lock`.
- next: targeted commit + push per Git Policy, then claim TZ-PRODUCTION-328.
