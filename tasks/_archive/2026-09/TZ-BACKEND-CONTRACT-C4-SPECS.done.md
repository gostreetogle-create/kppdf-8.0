# TZ-BACKEND-CONTRACT-C4-SPECS

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03
closed_by: Claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (3 suites, 16 tests)
  - lint: PASS
  - checklist: ADDED
  - progress.md: N/A (parallel backend contract wave uses wave/checklist records)
  - status synchronization: PASS (wave advanced to C5)

## Outcome

Extended focused Contract coverage without changing production semantics:

- default `contractStatus=none` on create;
- valid URL-backed `file_attached` and rejection without a reference;
- update/patch to `file_attached` and explicit clear to `none`;
- C3 PUT/DELETE controller and service attachment behavior in the same focused run.

## Gates

- `cd backend && pnpm exec jest --config jest.config.ts modules/contract/dto/create-contract.dto.spec.ts modules/contract/contract.controller.spec.ts modules/contract/contract.service.spec.ts --runInBand` — PASS (3 suites, 16 tests).
- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` — PASS.
- Targeted Contract ESLint — PASS.

## Scope disclosure

Only the Contract service spec and C4 records were owned by this TZ. Foreign dirty work in the shared checkout was not staged.
