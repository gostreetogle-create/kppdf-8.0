# Checklist: TZ-BACKEND-QA-OUTPUT-VAT-MOCK

**TZ:** `tasks/TZ-BACKEND-QA-OUTPUT-VAT-MOCK.md`
**Status:** DONE

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-03T07:34:30Z
- branch: `main`
- baseline_sha: 014a3b20
- workspace: D:\kppdf-8.0

## Steps

- [x] Fix default dataResolver mock + finalize mock
- [x] Grep other studio specs
- [x] `pnpm test -- studio-output.service.spec --runInBand` PASS (7/7)
- [x] tsc PASS
- [x] Archive + commit

## Acceptance

- [x] Нет TypeError resolveOrganizationVatRate (6 red tests → green)
- [x] `cd backend && pnpm test -- studio-output.service.spec --runInBand` PASS
- [x] `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` PASS

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: other (test-mock-only fix; no prod code, no UX/API)
- [x] FIC §A–E: N/A — тестовый дубль, прод-контракт `StudioDataResolverService` не менялся
- [x] page.md / PAGE-TZ-INDEX: N/A (нет UI route)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (`studio-output.service.spec.ts`)
- [x] Coupling map: N/A (общее поле/статус не тронуты)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Evidence

- `cd backend && pnpm exec jest studio-output.service.spec --runInBand` → PASS (7 tests).
- `cd backend && pnpm test` → **126 suites passed, 1152 tests passed** (baseline gate green; audit ТЗ-1 closed).
- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → PASS.
- Grep `studio-document/*.spec.ts` ad-hoc `dataResolver`: only `studio-quotation-lifecycle.service.spec.ts` also mocks `dataResolver`, but it only exercises `resolveDataSets` (prod lifecycle service never calls the VAT method) — no gap.

## Executor report

- Two test doubles in `studio-output.service.spec.ts` (default mock in `createOutputService` + local mock in `finalize bakes snapshot…`) were missing `resolveOrganizationVatRate`, which `renderStudioDocument` (prod `studio-output.service.ts:135`) calls — fixed with `jest.fn().mockResolvedValue(20)` matching the prod default.
- Prod code untouched (`studio-output.service.ts`, `studio-data-resolver.ts` unchanged). No lint delta on touched file (only adds to mock object literal).
- Full backend suite green again: 126/126 suites, 1152/1152 tests.
