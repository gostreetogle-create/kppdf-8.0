# TZ-NX-HOTFIX-SHELL-WAREHOUSE-POPULATE — DONE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-06
closed_by: freebuff
agent_id: freebuff
workspace: `D:\\kppdf-8.0`
implementation_sha: pending; recorded in the closeout metadata commit

## Outcome

- Removed `pi-edge-bleed` from the NX operational and UI-kit root headers so the KPPDF/Paper & Ink brands are not shifted outside the viewport.
- Added the soft-delete populate escape hatch to StockMovement list refs (`productId`, `materialId`, `warehouseId`, `toWarehouseId`) and StorageItem list/detail refs (`productId`, `materialId`, `warehouseId`). Archived catalog/warehouse records remain visible in historical journal and balance labels; hard-deleted refs remain unresolved by design.
- Updated the three affected page contracts with the shell/populate behavior notes.
- Kit footer copy now names Hanken Grotesk, Inter, and JetBrains Mono.

## Verification

- acceptance criteria: PASS
- backend typecheck: PASS — `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit`
- focused backend test: PASS — `cd backend && pnpm test -- --runInBand src/modules/storage-item/storage-item.controller.spec.ts` (4 tests)
- focused NX shell test: PASS — `cd frontend-nx && pnpm exec jest --config apps/kppdf-web/jest.config.ts apps/kppdf-web/src/app/layout/app-shell.component.spec.ts --runInBand` (18 tests)
- changed-file backend/frontend ESLint: PASS
- `git diff --check`: PASS
- final `nx build kppdf-web`: PASS — exit 0; known pre-existing Studio NG8102 and Gantt style-budget warnings
- known build warnings: pre-existing Studio NG8102 and Gantt style-budget warning

## Scope integrity

- Only the four hotfix conflict-key implementations, three related page docs, checklist/archive/lock were owned for this TZ.
- No legacy `frontend/`, Doc Studio layout, `soft-delete.plugin.ts`, database cleanup, seed, production, or unrelated dirty WIP was changed.

## Executor report (auto)

Hotfix A completed from the pre-existing WIP after verifying the acceptance contract. B (local demo orphan cleanup) is a separate follow-on TZ and is not included in this archive.
