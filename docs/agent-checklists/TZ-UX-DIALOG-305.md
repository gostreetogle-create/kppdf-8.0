# TZ-UX-DIALOG-305 checklist

> Status: **DONE** · Wave: CATALOG-UX-C #2 · depends COMPOSE-301  
> Source: `tasks/TZ-UX-DIALOG-305-catalog-kind-c-width-parity.md`  
> Archive: `tasks/_archive/2026-08/TZ-UX-DIALOG-305.done.md`

## Claim slot
- agent_id: buffy (freebuff)
- claimed_at: 2026-08-08
- workspace: freebuff claim worktree → push to origin/main

## Acceptance
- [x] ModuleForm = kind C `min(1120px, calc(100vw - 2rem))`
- [x] Composition picker same max width as material FullEditor
- [x] Audit `2026-08-09-catalog-dialog-width-parity.md` + cookbook note
- [x] Tiny inventory dialogs NOT widened

## Gates
- [x] Frontend tsc — PASS
- [x] `pnpm test -- module-form-dialog|product-composition-picker` — 15/15 PASS
- [x] Full suite: 129 suites / 1214 tests PASS

## Closeout
- [x] Archive + commit/push; deploy NO
