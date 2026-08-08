# TZ-UX-FACT-304 checklist

> Status: **DONE** · Wave: SHOP-NORTH-B #6
> Source: `tasks/_backlog/shop-north-b/TZ-UX-FACT-304-material-detail-facts.md`
> Audit: `docs/audits/2026-08-09-fact-card-adoption.md`
> Conflict keys: `frontend/src/app/pages/materials/**`, `frontend/src/app/shared/ui/fact-card/**`, this checklist, audit, progress, active/archive/lock markers

## Claim slot
- agent_id: agent-119d7cbf7
- claimed_at: 2026-08-08T14:55:04Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Team Room reports task not synced in CLI)

## Preflight
- [x] Read `GEMINI.md`, `OrchestratorKit/AGENTS.md`, task source, active map, and all active markers.
- [x] No conflicting active material/fact-card task found in this worktree.
- [x] `tasks/_active/TZ-UX-FACT-304.md` was created before product-code changes.
- [x] Existing dimensions, stock, and where-used behavior reviewed and preserved.

## Acceptance
- [x] Material detail passport uses shared `PiFactStack`/`PiFactCard` for name, article/SKU, unit, category, kind, profile, standard, grade, weight, and dimensions.
- [x] Price is a FactCard with the short caption `Закупочная / учётная цена материала`.
- [x] Existing dimensions table, stock link, and where-used API section remain live.
- [x] Adoption audit marks `material-detail` as **ADOPTED** and records FACT-304.
- [x] No dimensions-normalize utility existed in the materials zone; nothing was bundled or blocked on it.

## Gates
- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS (exit 0).
- [x] `cd frontend && pnpm test -- material-detail --runInBand --no-coverage` — PASS (6/6, exit 0).
- [x] Targeted ESLint — PASS (exit 0).
- [x] `git diff --check` — PASS after removing audit trailing whitespace.
- [ ] Targeted Prettier check — repository files use CRLF while `frontend/.prettierrc` requires LF; command reports the existing line-ending-only mismatch, with no code-style diagnostics from ESLint.

## Review handoff
- [x] Diff review: changes are limited to material detail, adoption audit, checklist, progress/archive/lock markers.
- [x] Scope review: no `desktop/**`, orders, supply, products.page, composition-tree, or `ProductBomPanel` changes.

## Closeout
- [x] Archive `tasks/_archive/2026-08/TZ-UX-FACT-304.done.md` with `ARCHIVE_MARKER`.
- [x] Remove `tasks/_active/TZ-UX-FACT-304.md`.
- [x] Create `.mimocode/locks/TZ-UX-FACT-304-material-detail-factstack.lock`.
- [x] Commit and push own files only — FACT-304 closeout commit.
- [x] Deploy: NO.
