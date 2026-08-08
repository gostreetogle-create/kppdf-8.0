# TZ-SALES-302 checklist

> Status: **DONE** · Wave: SHOP-NORTH-B
> Source: `tasks/_backlog/shop-north-b/TZ-SALES-302-kp-send-versions.md`
> Conflict keys: `backend/src/modules/quotation/**`, `frontend/src/app/pages/commercial/**`

## Claim slot
- agent_id: Buffy (openai/gpt-5.6-luna)
- claimed_at: 2026-08-08T14:10:00Z
- workspace: D:\\kppdf-8.0 main
- team_room_claim: unavailable (CLI did not have synced task)

## Preflight
- [x] Main checkout and worktree scope verified.
- [x] Active map and active markers reviewed; unrelated WIP retained untouched.
- [x] TZ and quotation implementation/tests reviewed.

## Acceptance
- [x] Freeze creates the next immutable embedded snapshot with lines, totals, metadata, and actor.
- [x] Editing the current quotation after freeze does not mutate the old snapshot.
- [x] Version list and individual snapshot read endpoints are available and validated.
- [x] Proposals UI exposes freeze and visible version history.
- [x] Existing delete and conversion flows remain unchanged.

## Gates (fact)
- [x] `pnpm --dir backend exec tsc -p tsconfig.build.json --noEmit` — PASS
- [x] `pnpm --dir backend exec jest src/modules/quotation/quotation.service.spec.ts --runInBand --no-coverage` — PASS (24 tests)
- [x] `pnpm --dir backend exec eslint src/modules/quotation/quotation.schema.ts src/modules/quotation/quotation.service.ts src/modules/quotation/quotation.controller.ts src/modules/quotation/quotation.service.spec.ts` — PASS
- [x] `pnpm --dir frontend exec tsc -p tsconfig.app.json --noEmit` — PASS
- [x] `pnpm --dir frontend exec jest src/app/pages/commercial/proposals/proposals.page.spec.ts --runInBand --no-coverage` — PASS (16 tests)
- [x] `pnpm --dir frontend exec prettier --check src/app/pages/commercial/proposals/proposals.page.ts src/app/pages/commercial/proposals/proposals.page.spec.ts src/app/shared/services/pi-proposals.service.ts` — PASS
- [x] `pnpm --dir frontend exec eslint src/app/pages/commercial/proposals/proposals.page.ts src/app/pages/commercial/proposals/proposals.page.spec.ts src/app/shared/services/pi-proposals.service.ts` — PASS
- [x] `git diff --check` on touched SALES-302 paths — PASS

## Executor report
- Added atomic conditional version append (`updateOne` with version guard and retry) to prevent concurrent freeze loss.
- Snapshot includes quotation metadata, template/design snapshots, line snapshots, totals, `frozenAt`, and authenticated `frozenBy`.
- Scope audit: unrelated products/UI WIP and `desktop/mcp-runtime/` are not part of SALES-302.

## Review handoff
- [x] READY FOR REVIEW in wave inbox.
- [x] Review verdict: PASS after atomicity, metadata, frontend wiring and test fixes.

## Closeout
- [x] Archive task and checklist
- [x] Create DONE lock and update progress/checkpoint
- [ ] Commit and push main
