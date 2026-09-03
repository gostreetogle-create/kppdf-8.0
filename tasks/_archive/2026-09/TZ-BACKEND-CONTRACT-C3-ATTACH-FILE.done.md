# TZ-BACKEND-CONTRACT-C3-ATTACH-FILE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03
closed_by: Claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (2 suites, 8 tests)
  - lint: PASS
  - checklist: ADDED
  - progress.md: N/A (parallel backend contract wave uses wave/checklist records)
  - status synchronization: PASS (wave advanced to C4)

## Outcome

Implemented the backend Contract attachment write-path without touching the lifecycle `Contract.status` FSM:

- `PUT /contracts/:id/attachment` accepts multipart field `file`, stores bytes under the configured uploads root, registers a `Photo`, and persists `contractStatus=file_attached`, `attachmentFileId`, and `attachmentUrl`.
- `DELETE /contracts/:id/attachment` clears attachment fields, sets `contractStatus=none`, and removes the previous Photo best-effort.
- Missing, soft-deleted, or empty-file cases are rejected; both routes are admin/manager-only and audited.
- Focused controller/service regressions cover upload, replacement, cleanup, empty file, missing contract, soft delete lookup, and lifecycle preservation.

## Gates

- `cd backend && pnpm exec jest --config jest.config.ts modules/contract/contract.controller.spec.ts modules/contract/contract.service.spec.ts --runInBand` — PASS.
- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` — PASS.
- Targeted Contract ESLint — PASS.

## Scope disclosure

Only Contract module code and C3 records are owned by this TZ. The shared checkout contains unrelated dirty documentation and KP-family work; those paths were not staged.
