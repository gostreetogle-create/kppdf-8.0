# TZ-BACKEND-QA-OUTPUT-VAT-MOCK

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03
closed_by: freebuff
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (126 suites, 1152 tests — full backend suite green; targeted spec 7/7)
  - lint: N/A (test-mock-only; no new lint surface)
  - checklist: ADDED
  - progress.md: N/A (redirect journal; wave tracked in WAVE-QA-GATES-2026-09.md)
  - status synchronization: PASS (wave Q1 row → DONE)

## Outcome

Fixed the broken `dataResolver` test double in `studio-output.service.spec.ts`
(audit `docs/audits/2026-09-03-qa-deep-test-audit.md` ТЗ-1): both the default mock
in `createOutputService` and the local mock in `finalize bakes snapshot…` were
missing `resolveOrganizationVatRate` (called by prod `renderStudioDocument` at
`studio-output.service.ts:135`). Added `resolveOrganizationVatRate: jest.fn().mockResolvedValue(20)`
to both, matching the prod default (20 when org lookup misses). This was the only
suite failing `cd backend && pnpm test` on main.

Grep of `studio-document/*.spec.ts`: `studio-quotation-lifecycle.service.spec.ts`
also defines an ad-hoc `dataResolver`, but its prod counterpart only calls
`resolveDataSets` — no VAT gap there.

## Gates

- `cd backend && pnpm exec jest studio-output.service.spec --runInBand` — PASS (7 tests).
- `cd backend && pnpm test` — PASS: **126 suites passed, 126 total; 1152 tests passed**.
- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` — PASS.

## Scope disclosure

Only `backend/src/modules/studio-document/studio-output.service.spec.ts` + wave/checklist
records were owned by this TZ. Prod `studio-output.service.ts` / `studio-data-resolver.ts`
untouched. Foreign dirty WIP in the shared checkout was not staged.
