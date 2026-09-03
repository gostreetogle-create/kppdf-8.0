# TZ-BACKEND-QA-STUDIO-QUOTATION-ORG-GUARD

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03
closed_by: freebuff
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (126 suites, 1157 tests; focused lifecycle spec 7/7)
  - lint: PASS (targeted eslint on lifecycle service + spec)
  - checklist: ADDED
  - progress.md: N/A (redirect journal; wave tracked in WAVE-QA-GATES-2026-09.md)
  - status synchronization: PASS (wave Q2 row → DONE)

## Outcome

Closed the multi-org invariant gap from audit `docs/audits/2026-09-03-qa-deep-test-audit.md` ТЗ-2:
`StudioQuotationLifecycleService` accepted `organizationId` but never verified that an existing
`linkedQuotationId` points to a quotation of the same organization.

- Private `assertQuotationOrg(quotation, organizationId)` → `NotFoundException('Quotation not found')`
  on mismatch («не палим чужой ресурс», same pattern as `OrgScopeGuardInterceptor`).
- Wired into `ensureLinkedQuotation` (linked branch) and `syncQuotationItems` (before `update`),
  which also turns the previously-unused `organizationId` param into a real boundary (ESLint
  unused-var gone). Create path untouched — org is already in the create payload.
- Ref-id helper unwraps populated Organization docs because prod `QuotationService.findById`
  populates `organizationId` (a naive `String()` compare would false-positive on the happy path).

## Gates

- `cd backend && pnpm exec jest studio-quotation-lifecycle.service.spec --runInBand` — PASS (7 tests).
- `cd backend && pnpm test` — PASS: **126 suites passed, 1157 tests passed**.
- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` — PASS.
- `cd backend && pnpm exec eslint src/modules/studio-document/studio-quotation-lifecycle.service.ts src/modules/studio-document/studio-quotation-lifecycle.service.spec.ts` — PASS.

## Scope disclosure

Only `studio-quotation-lifecycle.service.ts` + its spec + wave/checklist records were owned by
this TZ. `OrgScopeGuardInterceptor`, quotation schema, and the HTTP controller were not changed.
Foreign dirty WIP in the shared checkout was not staged.
