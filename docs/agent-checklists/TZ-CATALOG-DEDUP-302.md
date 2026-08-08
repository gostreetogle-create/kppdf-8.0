# TZ-CATALOG-DEDUP-302 — retire ModuleMaterials dialog

**Status:** DONE
**Source:** `tasks/_backlog/TZ-CATALOG-DEDUP-302-retire-module-materials-dialog.md`

## Claim slot

- agent_id: `agent-acfffc1331`
- claimed_at: `2026-08-08T09:50:00Z`
- workspace: `D:\kppdf-8.0\.freebuff\worktrees\27b6af5d-6e1c-4846-ad15-e1bb83be400c`
- team_room_claim: unavailable — registry reports unknown task; checklist is source of truth

## Conflict keys

- `frontend/src/app/pages/modules/module-detail.page.ts`
- `frontend/src/app/pages/modules/module-materials-form-dialog.component.ts`
- `frontend/src/app/pages/modules/module-materials-form-dialog.component.spec.ts`
- `docs/audits/2026-08-08-data-entry-dedupe-audit.md`
- `docs/agent-checklists/TZ-CATALOG-DEDUP-302.md`

## Plan

- Remove the ModuleMaterials opener/import and its close callback from module detail.
- Delete the now-orphaned ModuleMaterials component and spec.
- Update the dedupe audit to mark the module path as BomPanel-only.
- Run scoped typecheck, module detail/BOM tests, lint and diff checks before closeout.

## Verification

- tsc: PASS — `pnpm exec tsc -p tsconfig.app.json --noEmit`
- Jest: PASS — module-detail + product-bom-panel, 2 suites / 8 tests
- lint: PASS — scoped ESLint on `module-detail.page.ts`
- diff-check: PASS
- review: PASS — no critical issues
- archive/lock/progress/map: DONE
