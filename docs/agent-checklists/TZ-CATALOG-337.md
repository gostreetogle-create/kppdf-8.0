# TZ-CATALOG-337 checklist

> Status: **DONE** · depends: FACT-304 DONE
> Source: `tasks/TZ-CATALOG-337-material-detail-a-plus.md`
> Conflict keys: `frontend/src/app/pages/materials/material-detail.page.ts`, `frontend/src/app/pages/materials/material-detail.page.spec.ts`, `docs/pages/material-detail.page.md`, `docs/pages/PAGE-TZ-INDEX.md`, this checklist, progress/archive/lock markers

## Claim slot
- agent_id: agent-119d7cbf7
- claimed_at: 2026-08-08T14:56:53Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Team Room reports task not synced in CLI)

## Preflight
- [x] FACT-304 archive exists and its active marker was removed before this claim.
- [x] Read CATALOG-337 source, CATALOG-336 A+ reference, page docs, and active-map/active markers.
- [x] No conflicting active CATALOG-337/material-detail task found in this worktree.
- [x] Scope excludes `ProductBomPanel`, composition-tree, backend/API, desktop, orders, supply, and products.page.

## Acceptance
- [x] `PiPageChrome` crumbs `Каталог / Материалы / <имя>`.
- [x] A+ split: sticky left hero/passport/Photo+Price accordion and right where-used/stock workspace.
- [x] No ProductBomPanel or composition-tree on material detail.
- [x] FACT-304 FactStack and price caption remain intact; no `dl` regression.
- [x] `docs/pages/material-detail.page.md` matches shipped A+.
- [x] PAGE-TZ-INDEX updated with FACT-304/CATALOG-337 DONE markers.

## Gates
- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS (exit 0).
- [x] `cd frontend && pnpm test -- material-detail --runInBand --no-coverage` — PASS (6/6, exit 0).
- [x] `cd frontend && pnpm exec ng build --configuration=development` — PASS (exit 0).
- [x] Targeted ESLint — PASS (exit 0).
- [x] Targeted Prettier — PASS for material-detail page/spec.
- [x] `git diff --check` — PASS.

## Review handoff
- [x] Diff review completed; only material detail, its spec, page docs/index, checklist, progress/archive/lock markers changed.
- [x] Negative review: no `ProductBomPanel`, `app-composition-tree`, backend/API, desktop, orders, supply, or products.page changes.

## Closeout
- [x] Archive `tasks/_archive/2026-08/TZ-CATALOG-337.done.md` with `ARCHIVE_MARKER`.
- [x] Remove `tasks/_active/TZ-CATALOG-337.md` and source task `tasks/TZ-CATALOG-337-material-detail-a-plus.md`.
- [x] Create `.mimocode/locks/TZ-CATALOG-337-material-detail-a-plus.lock`.
- [x] Commit and push own files only — CATALOG-337 closeout commit.
- [x] Deploy: NO.
