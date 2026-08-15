# TZ-PRODUCTION-328.done — production cockpit docs closeout

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-15
closed_by: Buffy
TZ: TZ-PRODUCTION-328
WAVE: WAVE-PRODUCTION-COCKPIT-HARDEN
DEP: TZ-PRODUCTION-327 (`038b18da`)

## Outcome

- `docs/pages/production-cockpit.page.md` is the complete `/production` page SoT: app chrome, flyouts, filters, counterparty mode, cascade levels, write-path roles, zoom/fit/today, smart/dumb boundary, estimate-only boundary, and Russian UI contract.
- `docs/ux/production-gantt-studio-spec.md` is synchronized with the landed implementation: no bottom `Карточка`, summary meta + inline work-detail cascade, Заказы/Заказчики filters, Week fit-density, **Вместить сроки**, and **Сегодня** marker scroll.
- `PAGE-TZ-INDEX`, harden audit scoreboard, WAVE backlog, MASTER, `_NOW`, `progress.md`, and `STATUS.md` are synchronized.
- Final estimate-studio score: **STUDIO ESTIMATE PASS 98/100**. This is not shop-floor/fact-production readiness.

## Verification

- docs review: PASS — page/spec cross-read against current frontend behavior and TZ-324…327 archives.
- `git diff --check` for owned staged changes: PASS; unrelated pre-existing WIP remains unstaged.
- markdown Prettier: root tool unavailable; frontend toolchain check was attempted and reports existing formatting drift across the docs set. No broad `--write` was run; owned `git diff --check` is PASS. Frontend code formatting was already PASS in TZ-327 and no product code changed in this TZ.
- prior frontend gates carried forward: tsc PASS; production Jest 6 suites / 70 tests PASS; lint PASS with 18 existing architecture warnings; targeted Prettier PASS.
- browser smoke: NOT RUN — no live browser/API server available.
- bans: PASS — no fact production, ProductionOrder/OrderTask, deploy, wipe, or data staging.

## Files

- `docs/pages/production-cockpit.page.md`
- `docs/ux/production-gantt-studio-spec.md`
- `docs/audits/2026-08-15-production-cockpit-harden-audit.md`
- `docs/pages/PAGE-TZ-INDEX.md`
- `docs/agent-checklists/TZ-PRODUCTION-328.md`
- `docs/agent-checklists/WAVE-PRODUCTION-COCKPIT-HARDEN.md`
- `docs/agent-checklists/_NOW.md`
- `tasks/_backlog/WAVE-PRODUCTION-COCKPIT-HARDEN.md`
- `progress.md`
- `STATUS.md`

## Final PO note

Queue empty. Ready to propose deployment on explicit PO command; do not deploy automatically.

## Lock

`.mimocode/locks/TZ-PRODUCTION-328-cockpit-docs-closeout.lock`
