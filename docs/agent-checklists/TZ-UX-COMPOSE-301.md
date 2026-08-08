# TZ-UX-COMPOSE-301 checklist

> Status: **DONE** · Wave: CATALOG-UX-C #1  
> Source: `tasks/TZ-UX-COMPOSE-301-module-composition-discoverability.md`  
> Archive: `tasks/_archive/2026-08/TZ-UX-COMPOSE-301.done.md`

## Claim slot
- agent_id: buffy (freebuff)
- claimed_at: 2026-08-08
- workspace: freebuff claim worktree → push to origin/main

## Acceptance
- [x] ModuleForm `composition-hint` (модули + материалы → карточка / QC L)
- [x] Picker `restrictToModule` defaults to **material** tab; module tab remains
- [x] Root-add reachable when a material line is selected
- [x] Inclusion matrix documented on module-detail + product-detail page docs
- [x] No ModuleMaterials resurrection

## Gates
- [x] `pnpm exec tsc -p tsconfig.app.json --noEmit` (frontend) — PASS
- [x] `pnpm test -- product-composition-picker|product-bom-panel|module-form-dialog` — 20/20 PASS
- [x] Full suite: 129 suites / 1212 tests PASS (incl. quick-create SELECT-301 override fix)

## Closeout
- [x] Archive + lock + progress
- [x] Commit/push own files; deploy NO
